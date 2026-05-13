<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotify } from "@/composables/useNotify.js";
import { useSupabase } from "@/composables/useSupabase.js";
import { useAuthStore } from "@/stores/auth.js";
import { useAuthGuard } from "@/composables/useAuthGuard.js";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { supabase } from "@/config/supabaseConfig.js";

const props = defineProps({
  title: { type: String, default: "Appointments" },
  subtitle: { type: String, default: "Manage appointments" },
  mode: {
    type: String,
    default: "patient",
    validator: (value) => ["patient", "nurse", "admin"].includes(value),
  },
});

const { showSuccess, showError } = useNotify();
const { appointments: appointmentOps, patients: patientOps, clinicSettings: clinicSettingsOps } = useSupabase();
const authStore = useAuthStore();

// ─── Clinic Settings (fetched on mount) ──────────────────────────────────────
const clinicMaxPerDay      = ref(50);  // default until settings load
const clinicUnavailableDates = ref([]); // array of "YYYY-MM-DD" strings

const loading = ref(false);
const search = ref("");
const showBookModal = ref(false);
const showViewModal = ref(false);
const showRescheduleModal = ref(false);
const showCancelModal = ref(false);
const showSettingsModal = ref(false);
const selectedAppointment = ref(null);
const filterStatus = ref("all");
const error = ref(null);

// View mode: 'list' | 'calendar'
const viewMode = ref("list");

// Calendar sub-view: 'week' | 'month'
const calendarView = ref("month");

// Calendar navigation anchor
const currentDate = ref(new Date());

const appointmentsList = ref([]);
const allCalendarAppointments = ref([]);
const patientsList = ref([]);
const currentPatientRecord = ref(null);

let appointmentSubscription = null;

const appointmentForm = ref({
  patientId: "",
  patientName: "",
  dateTime: "",
  reason: "",
  notes: "",
});

// ─── Constants ────────────────────────────────────────────────────────────────

// Every appointment occupies exactly one 30-minute block.
const SLOT_DURATION_MIN = 30;

// Clinic operating hours (inclusive start, exclusive end)
const CLINIC_START_HOUR = 7;   // 7:00 AM
const CLINIC_END_HOUR   = 18;  // 6:00 PM  (last bookable slot: 17:30–18:00)

// Maximum concurrent appointments per 30-min slot (kept for calendar heat-map colouring)
const MAX_SLOT_CAPACITY = 3;

// ─── Role helpers ─────────────────────────────────────────────────────────────

const isPatient = computed(() => props.mode === "patient");
const isStaff   = computed(() => props.mode === "nurse" || props.mode === "admin");

// ─── List view filters ────────────────────────────────────────────────────────

const filteredAppointments = computed(() =>
  appointmentsList.value.filter((a) => {
    const q = search.value.toLowerCase();
    const matchSearch =
      a.patientName?.toLowerCase().includes(q) ||
      (a.Reason || a.reason || "").toLowerCase().includes(q) ||
      (a.Type || a.type || "").toLowerCase().includes(q);
    const status = (a.Status || a.status || "").toLowerCase();
    const matchStatus = filterStatus.value === "all" || status === filterStatus.value;
    return matchSearch && matchStatus;
  }),
);

const upcomingAppointments = computed(() => {
  const now = new Date();
  return appointmentsList.value.filter((a) => {
    const dt = a.DateTime || a.dateTime;
    return new Date(dt) > now && (a.Status || a.status) !== "Cancelled";
  });
});

const pendingAppointments   = computed(() => appointmentsList.value.filter((a) => (a.Status || a.status || "").toLowerCase() === "pending"));
const completedAppointments = computed(() => appointmentsList.value.filter((a) => (a.Status || a.status || "").toLowerCase() === "completed"));
const todayAppointments     = computed(() => {
  const today = new Date().toDateString();
  return appointmentsList.value.filter((a) => new Date(a.DateTime || a.dateTime).toDateString() === today);
});

const stats = computed(() => {
  if (isPatient.value) {
    return [
      { icon: "bi-calendar",       color: "primary", value: appointmentsList.value.length,    label: "Total Appointments" },
      { icon: "bi-calendar-event", color: "warning", value: upcomingAppointments.value.length, label: "Upcoming" },
      { icon: "bi-check-circle",   color: "success", value: completedAppointments.value.length,label: "Completed" },
      { icon: "bi-clock",          color: "info",    value: pendingAppointments.value.length,  label: "Pending" },
    ];
  }
  return [
    { icon: "bi-calendar",       color: "primary", value: appointmentsList.value.length,    label: "Total Appointments" },
    { icon: "bi-clock",          color: "warning", value: pendingAppointments.value.length,  label: "Pending Approval" },
    { icon: "bi-check-circle",   color: "success", value: todayAppointments.value.length,    label: "Today's Appointments" },
    { icon: "bi-calendar-week",  color: "info",    value: upcomingAppointments.value.length, label: "Upcoming" },
  ];
});

// ─── 30-min slot helpers ──────────────────────────────────────────────────────

// Snap a Date to the nearest earlier 30-min boundary
const snapTo30 = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0);
  return d;
};

// Given a DateTime string, compute EndDateTime = start + 30 min
const endDateTime = (dtStr) => {
  if (!dtStr) return null;
  const d = new Date(dtStr);
  d.setMinutes(d.getMinutes() + SLOT_DURATION_MIN);
  return d;
};

// ─── Timezone-safe helpers ────────────────────────────────────────────────────
// DB stores DateTime as TIMESTAMPTZ (e.g. "2026-05-15T09:00:00+08:00").
// We strip to a plain "YYYY-MM-DDTHH:MM" string for comparisons so the result
// is always based on the stored wall-clock time, not the browser's local offset.
const p2 = (n) => String(n).padStart(2, "0");

// Extract "YYYY-MM-DDTHH:MM" from any ISO string or Date, in LOCAL wall-clock time.
const toLocalPrefix = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

// Snap a datetime string/Date to the nearest earlier 30-min boundary, return prefix.
const toSlotPrefix = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

// Slot key used for occupancy map: "YYYY-MM-DD HH:MM" (space-separated, local time)
const slotKey = (dt) => toSlotPrefix(dt).replace("T", " ");

// Build a map: slotKey → count of active appointments
const slotOccupancy = computed(() => {
  const map = {};
  allCalendarAppointments.value.forEach((apt) => {
    const key = slotKey(apt.DateTime || apt.dateTime);
    if (key) map[key] = (map[key] || 0) + 1;
  });
  return map;
});

// Count for a specific slot given a "YYYY-MM-DDTHH:MM" prefix string
const occupancyForPrefix = (prefix) => slotOccupancy.value[prefix.replace("T", " ")] || 0;

// Count for a slot given a Date object (already on boundary)
const occupancyForSlot = (date) => occupancyForPrefix(toLocalPrefix(date));

// Is the slot full?
const isSlotFull = (date) => occupancyForSlot(date) >= MAX_SLOT_CAPACITY;

// Slot status for coloring week cells
const slotStatus = (date) => {
  if (isDayUnavailable(date)) return "unavailable";
  const occ = occupancyForSlot(date);
  if (occ === 0) return "empty";
  if (occ >= MAX_SLOT_CAPACITY) return "full";
  if (occ / MAX_SLOT_CAPACITY > 0.6) return "filling";
  return "available";
};

const slotStatusClass = (status) => {
  if (status === "full")        return "slot-full";
  if (status === "filling")     return "slot-filling";
  if (status === "available")   return "slot-available";
  if (status === "unavailable") return "slot-unavailable";
  return "slot-empty";
};

// Total clinic slots in a day = (CLINIC_END_HOUR - CLINIC_START_HOUR) * 2
const TOTAL_SLOTS_PER_DAY = (CLINIC_END_HOUR - CLINIC_START_HOUR) * 2;

// Number of DISTINCT 30-min slots that have at least one booking on a given day.
// "Available" = total slots minus those with ≥1 booking.
const bookedSlotsOnDay = (date) => {
  const d = new Date(date);
  const prefix = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} `;
  let count = 0;
  for (const key of Object.keys(slotOccupancy.value)) {
    if (key.startsWith(prefix)) count++;
  }
  return count;
};

const availableSlotsOnDay = (date) => Math.max(0, TOTAL_SLOTS_PER_DAY - bookedSlotsOnDay(date));

// ─── Day-level capacity & unavailability helpers ───────────────────────────

// Canonical "YYYY-MM-DD" key for any Date or ISO string
const toDateKey = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};

// Is this date blocked in the admin's unavailable list?
const isDayUnavailable = (date) => {
  if (!date) return false;
  return clinicUnavailableDates.value.includes(toDateKey(date));
};

// Is this date in the past? (relative to today, wall-clock time)
const isDayInPast = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

// Count ALL non-cancelled bookings on a given calendar day
const dailyBookingsOnDay = (date) => {
  if (!date) return 0;
  const key = toDateKey(date);
  return allCalendarAppointments.value.filter(
    (a) => toDateKey(a.DateTime || a.dateTime) === key
  ).length;
};

// Is the day at or over its max-patients capacity?
const isDayAtCapacity = (date) => {
  if (!date) return false;
  return dailyBookingsOnDay(date) >= clinicMaxPerDay.value;
};

// Combined: is this day selectable for new appointments?
// Combined: is this day selectable for new appointments?
const isDayBlocked = (date) => isDayUnavailable(date) || isDayAtCapacity(date) || isDayInPast(date);

// Computed for the currently chosen date in the booking form
const selectedDayKey = computed(() => toDateKey(appointmentForm.value.dateTime));
const isSelectedDayUnavailable = computed(() => isDayUnavailable(appointmentForm.value.dateTime));
const isSelectedDayAtCapacity  = computed(() => isDayAtCapacity(appointmentForm.value.dateTime));
const isSelectedDayBlocked     = computed(() => isSelectedDayUnavailable.value || isSelectedDayAtCapacity.value);

const selectedDayBookingCount  = computed(() => dailyBookingsOnDay(appointmentForm.value.dateTime));
const selectedDayRemainingSlots = computed(() =>
  Math.max(0, clinicMaxPerDay.value - selectedDayBookingCount.value)
);

// For reschedule modal
const isRescheduleDayUnavailable = computed(() => isDayUnavailable(appointmentForm.value.dateTime));
const isRescheduleDayAtCapacity  = computed(() => {
  if (!appointmentForm.value.dateTime || !selectedAppointment.value) return false;
  const targetKey = toDateKey(appointmentForm.value.dateTime);
  let count = 0;
  allCalendarAppointments.value.forEach((a) => {
    if ((a.AppointmentID || a.id) === selectedAppointment.value.id) return;
    if (toDateKey(a.DateTime || a.dateTime) === targetKey) count++;
  });
  return count >= clinicMaxPerDay.value;
});
const isRescheduleDayBlocked = computed(() => isRescheduleDayUnavailable.value || isRescheduleDayAtCapacity.value);

// Worst slot status for a day chip (based on whether any slot is full)
const daySlotStatus = (date) => {
  if (isDayUnavailable(date) || isDayInPast(date)) return "unavailable";
  if (isDayAtCapacity(date)) return "full";

  const d = new Date(date);
  const prefix = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} `;
  let hasAny = false;
  let hasFull = false;
  let hasFilling = false;
  for (const [key, count] of Object.entries(slotOccupancy.value)) {
    if (!key.startsWith(prefix)) continue;
    hasAny = true;
    if (count >= MAX_SLOT_CAPACITY) hasFull = true;
    else if (count / MAX_SLOT_CAPACITY > 0.6) hasFilling = true;
  }
  if (!hasAny) return "empty";
  if (availableSlotsOnDay(date) === 0) return "full";
  if (hasFull || hasFilling) return "filling";
  return "available";
};

// All 30-min slot boundaries within clinic hours
const clinicSlots = computed(() => {
  const slots = [];
  for (let h = CLINIC_START_HOUR; h < CLINIC_END_HOUR; h++) {
    slots.push({ hour: h, minute: 0 });
    slots.push({ hour: h, minute: 30 });
  }
  return slots;
});

// Appointments that overlap a given slot for RENDERING in the week view.
// Uses toLocalPrefix() for timezone-safe comparison against the stored wall-clock time.
// Staff get full data from appointmentsList; patients see own + anonymous placeholders.
const aptsForSlot = (date, hour, minute) => {
  const prefix = `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}T${p2(hour)}:${p2(minute)}`;

  const matchesPrefix = (dt) => toLocalPrefix(dt) === prefix;

  if (!isPatient.value) {
    // Staff: full data with patient names and reasons
    return appointmentsList.value.filter((apt) => matchesPrefix(apt.dateTime || apt.DateTime));
  }

  // Patient: own appointments for this slot
  const own = appointmentsList.value.filter((apt) => matchesPrefix(apt.dateTime || apt.DateTime));

  // Anonymous occupancy: other bookings in this slot from allCalendarAppointments
  const ownIds = new Set(own.map((a) => a.AppointmentID || a.id));
  const otherCount = allCalendarAppointments.value.filter((apt) => {
    if (ownIds.has(apt.AppointmentID || apt.id)) return false;
    return matchesPrefix(apt.DateTime || apt.dateTime);
  }).length;

  const placeholders = Array.from({ length: otherCount }, (_, i) => ({
    AppointmentID: `anon-${prefix}-${i}`,
    DateTime: `${prefix}:00`,
    EndDateTime: null,
    Status: "Confirmed",
    Reason: null,
    _anonymous: true,
  }));

  return [...own, ...placeholders];
};

// ─── Calendar layout helpers ──────────────────────────────────────────────────

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const shortMonthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear  = computed(() => currentDate.value.getFullYear());
const currentMonthName = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`);

// ── Week helpers ──────────────────────────────────────────────────────────────

const weekStart = computed(() => {
  const d = new Date(currentDate.value);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // Monday
  d.setHours(0, 0, 0, 0);
  return d;
});

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value);
    d.setDate(d.getDate() + i);
    return d;
  }),
);

const weekRangeLabel = computed(() => {
  const s = weekDays.value[0];
  const e = weekDays.value[6];
  if (s.getMonth() === e.getMonth())
    return `${shortMonthNames[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  return `${shortMonthNames[s.getMonth()]} ${s.getDate()} – ${shortMonthNames[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
});

const formatSlotTime = ({ hour, minute }) => {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:${String(minute).padStart(2, "0")} ${period}`;
};

// ── Month helpers ─────────────────────────────────────────────────────────────

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const days = [];
  let week = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    week.push({ date: new Date(year, month, -firstDay.getDay() + i + 1), isCurrentMonth: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    week.push({ date, isCurrentMonth: true, isToday: date.toDateString() === new Date().toDateString() });
    if (week.length === 7) { days.push(week); week = []; }
  }
  if (week.length > 0) {
    for (let i = 1; i <= 7 - week.length; i++)
      week.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    days.push(week);
  }
  return days;
});

// ─── Navigation ───────────────────────────────────────────────────────────────

const navigatePrev = () => {
  const d = new Date(currentDate.value);
  calendarView.value === "week" ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
  currentDate.value = d;
};
const navigateNext = () => {
  const d = new Date(currentDate.value);
  calendarView.value === "week" ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
  currentDate.value = d;
};
const goToToday = () => { currentDate.value = new Date(); };

// ─── Data fetching ────────────────────────────────────────────────────────────

const { waitForAuthenticated } = useAuthGuard();

/** Fetch clinic-wide settings (capacity + unavailable dates) */
const fetchClinicSettings = async () => {
  try {
    const data = await clinicSettingsOps.getSettings();
    if (data) {
      clinicMaxPerDay.value        = data.max_patients_per_day ?? 50;
      clinicUnavailableDates.value = data.unavailable_dates    ?? [];
    }
  } catch {
    // Non-fatal: fall back to defaults silently
  }
};

const fetchAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { success, error: authErr } = await waitForAuthenticated();
    if (!success) throw new Error(authErr || "Please log in to view appointments");

    let data;
    if (isPatient.value) {
      data = await appointmentOps.getMyAppointments();
      const patientData = await patientOps.getMyPatients();
      if (patientData?.length > 0) currentPatientRecord.value = patientData[0];
    } else {
      data = await appointmentOps.getAllAppointments();
      const patientsData = await patientOps.getAllPatients();
      patientsList.value = patientsData || [];
    }

    appointmentsList.value = (data || []).map(normalizeAppointment);

    try {
      const calData = await appointmentOps.getAppointmentsForCalendar();
      allCalendarAppointments.value = calData || [];
    } catch {
      allCalendarAppointments.value = appointmentsList.value;
    }
  } catch (err) {
    error.value = err.message || "Failed to fetch appointments";
    showError(error.value);
    console.error("Error fetching appointments:", err);
  } finally {
    loading.value = false;
  }
};

const normalizeAppointment = (apt) => {
  let patientName = "";
  if (apt.Patients) patientName = `${apt.Patients.FirstName || ""} ${apt.Patients.Surname || ""}`.trim();
  else if (apt.patientName) patientName = apt.patientName;

  const dt = apt.DateTime || apt.dateTime;
  const endDt = apt.EndDateTime || apt.endDateTime || (dt ? endDateTime(dt)?.toISOString() : null);

  return {
    id: apt.AppointmentID || apt.id,
    AppointmentID: apt.AppointmentID || apt.id,
    patientId: apt.PatientID || apt.patientId,
    patientName,
    patientContact: apt.Patients?.ContactNumber || apt.patientContact || "",
    dateTime: dt, DateTime: dt,
    endDateTime: endDt, EndDateTime: endDt,
    type: apt.Type || apt.type || "Consultation",
    Type: apt.Type || apt.type || "Consultation",
    status: apt.Status || apt.status || "Pending",
    Status: apt.Status || apt.status || "Pending",
    reason: apt.Reason || apt.reason || "",
    Reason: apt.Reason || apt.reason || "",
    notes: apt.Notes || apt.notes || "",
    Notes: apt.Notes || apt.notes || "",
    symptoms: apt.Symptoms || apt.symptoms || "",
    priority: apt.Priority || apt.priority || "Normal",
  };
};

const setupRealtimeSubscription = () => {
  appointmentSubscription = supabase
    .channel("appointments-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "Appointment" }, () => fetchAppointments())
    .subscribe();
};

// ─── Modal helpers ────────────────────────────────────────────────────────────

const resetForm = () => {
  appointmentForm.value = { patientId: "", patientName: "", dateTime: "", reason: "", notes: "" };
};

const pad = (n) => String(n).padStart(2, "0");

const formatDateTimeLocal = (date) => {
  const d = snapTo30(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const openBookModal = (prefillDate = null) => {
  resetForm();
  selectedAppointment.value = null;
  if (isPatient.value && currentPatientRecord.value) {
    appointmentForm.value.patientId = currentPatientRecord.value.PatientID;
    appointmentForm.value.patientName = `${currentPatientRecord.value.FirstName} ${currentPatientRecord.value.Surname}`;
  }
  if (prefillDate) appointmentForm.value.dateTime = formatDateTimeLocal(prefillDate);
  showBookModal.value = true;
};

const openViewModal = (appointment) => {
  selectedAppointment.value = appointment;
  showViewModal.value = true;
};

const openRescheduleModal = (appointment) => {
  selectedAppointment.value = appointment;
  appointmentForm.value = {
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    dateTime: appointment.dateTime || appointment.DateTime,
    reason: appointment.reason || appointment.Reason,
    notes: appointment.notes || appointment.Notes,
  };
  showRescheduleModal.value = true;
};

const openCancelModal = (appointment) => {
  selectedAppointment.value = appointment;
  showCancelModal.value = true;
};

const closeModals = () => {
  showBookModal.value = false;
  showViewModal.value = false;
  showRescheduleModal.value = false;
  showCancelModal.value = false;
  showSettingsModal.value = false;
  selectedAppointment.value = null;
  resetForm();
};

// ─── Settings Modal (Admin/Nurse) ───────────────────────────────────────────

const settingsMaxPatients = ref(50);
const settingsUnavailableDates = ref([]);
const settingsNewDate = ref("");
const settingsDateInputError = ref("");
const settingsSaving = ref(false);

const sortedSettingsUnavailableDates = computed(() =>
  [...settingsUnavailableDates.value].sort()
);

const formatDisplayDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const date = new Date(+y, +m - 1, +d);
  return date.toLocaleDateString("en-PH", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
};

const openSettingsModal = () => {
  settingsMaxPatients.value = clinicMaxPerDay.value;
  settingsUnavailableDates.value = [...clinicUnavailableDates.value];
  settingsNewDate.value = "";
  settingsDateInputError.value = "";
  showSettingsModal.value = true;
};

const addUnavailableDate = () => {
  settingsDateInputError.value = "";
  if (!settingsNewDate.value) { settingsDateInputError.value = "Please select a date."; return; }
  
  // Format the VueDatePicker value (Date object) to YYYY-MM-DD
  const d = new Date(settingsNewDate.value);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (settingsUnavailableDates.value.includes(iso)) {
    settingsDateInputError.value = "This date is already marked as unavailable.";
    return;
  }
  settingsUnavailableDates.value.push(iso);
  settingsNewDate.value = null;
};

const removeUnavailableDate = (iso) => {
  settingsUnavailableDates.value = settingsUnavailableDates.value.filter((d) => d !== iso);
};

const saveSettings = async () => {
  if (settingsMaxPatients.value < 1 || settingsMaxPatients.value > 500) {
    showError("Max patients per day must be between 1 and 500.");
    return;
  }
  settingsSaving.value = true;
  error.value = null;
  try {
    const result = await clinicSettingsOps.updateSettings({
      max_patients_per_day: Number(settingsMaxPatients.value),
      unavailable_dates: settingsUnavailableDates.value,
    });
    if (result === null) {
      showError("Failed to save settings. Please check your permissions and try again.");
      return;
    }
    clinicMaxPerDay.value = Number(settingsMaxPatients.value);
    clinicUnavailableDates.value = [...settingsUnavailableDates.value];
    showSuccess("Clinic settings saved successfully!");
    closeModals();
  } catch (err) {
    error.value = err.message || "Failed to save settings.";
    showError(error.value);
  } finally {
    settingsSaving.value = false;
  }
};

// ─── Slot conflict check ──────────────────────────────────────────────────────

const isSelectedSlotFull = computed(() => {
  if (!appointmentForm.value.dateTime) return false;
  return isSlotFull(new Date(appointmentForm.value.dateTime));
});

const isRescheduleSlotFull = computed(() => {
  if (!appointmentForm.value.dateTime || !selectedAppointment.value) return false;
  const targetPrefix = toSlotPrefix(new Date(appointmentForm.value.dateTime));
  let count = 0;
  allCalendarAppointments.value.forEach((a) => {
    if ((a.AppointmentID || a.id) === selectedAppointment.value.id) return;
    if (toSlotPrefix(a.DateTime || a.dateTime) === targetPrefix) count++;
  });
  return count >= MAX_SLOT_CAPACITY;
});

const selectedSlotOccupancy = computed(() => {
  if (!appointmentForm.value.dateTime) return 0;
  return occupancyForSlot(new Date(appointmentForm.value.dateTime));
});

// ─── CRUD operations ──────────────────────────────────────────────────────────

const bookAppointment = async () => {
  loading.value = true;
  error.value = null;
  try {
    let patientId = appointmentForm.value.patientId;
    if (patientId) {
      if (!currentPatientRecord.value) throw new Error("Patient record not found. Please contact support.");
      patientId = currentPatientRecord.value.PatientID;
    }
    if (!patientId) throw new Error("Please select a patient");
    if (isDayInPast(appointmentForm.value.dateTime)) throw new Error("Appointment date cannot be in the past.");
    if (isSelectedDayUnavailable.value) throw new Error("This date is marked as unavailable. Please choose a different day.");
    if (isSelectedDayAtCapacity.value)  throw new Error(`This day has reached its maximum capacity of ${clinicMaxPerDay.value} patients. Please choose a different day.`);
    if (isSelectedSlotFull.value) throw new Error("This 30-minute slot is fully booked. Please choose another time.");

    const startDt  = appointmentForm.value.dateTime;
    const endDt    = endDateTime(startDt);
    const pad2     = (n) => String(n).padStart(2, "0");
    const endDtStr = `${endDt.getFullYear()}-${pad2(endDt.getMonth() + 1)}-${pad2(endDt.getDate())}T${pad2(endDt.getHours())}:${pad2(endDt.getMinutes())}`;

    await appointmentOps.createAppointment({
      PatientID:   patientId,
      DateTime:    startDt,
      EndDateTime: endDtStr,
      Reason:      appointmentForm.value.reason,
      Notes:       appointmentForm.value.notes,
      Status:      isPatient.value ? "Pending" : "Confirmed",
    });
    await fetchAppointments();
    closeModals();
    showSuccess(isPatient.value ? "Appointment request submitted successfully!" : "Appointment scheduled successfully!");
  } catch (err) {
    error.value = err.message || "Failed to book appointment";
    showError(error.value);
    console.error("Error booking appointment:", err);
  } finally {
    loading.value = false;
  }
};

const rescheduleAppointment = async () => {
  if (!selectedAppointment.value) { showError("No appointment selected"); return; }
  loading.value = true;
  error.value = null;
  try {
    if (isDayInPast(appointmentForm.value.dateTime)) throw new Error("Appointment date cannot be in the past.");
    if (isRescheduleDayUnavailable.value) throw new Error("This date is marked as unavailable. Please choose a different day.");
    if (isRescheduleDayAtCapacity.value)  throw new Error(`This day has reached its maximum capacity of ${clinicMaxPerDay.value} patients. Please choose a different day.`);
    if (isRescheduleSlotFull.value) throw new Error("This 30-minute slot is fully booked. Please choose another time.");

    const startDt  = appointmentForm.value.dateTime;
    const endDt    = endDateTime(startDt);
    const pad2     = (n) => String(n).padStart(2, "0");
    const endDtStr = `${endDt.getFullYear()}-${pad2(endDt.getMonth() + 1)}-${pad2(endDt.getDate())}T${pad2(endDt.getHours())}:${pad2(endDt.getMinutes())}`;

    await appointmentOps.updateAppointment(selectedAppointment.value.id, {
      DateTime:    startDt,
      EndDateTime: endDtStr,
      Reason:      appointmentForm.value.reason,
      Notes:       appointmentForm.value.notes,
      Status:      "Pending",
    });
    await fetchAppointments();
    closeModals();
    showSuccess("Appointment rescheduled successfully!");
  } catch (err) {
    error.value = err.message || "Failed to reschedule appointment";
    showError(error.value);
    console.error("Error rescheduling appointment:", err);
  } finally {
    loading.value = false;
  }
};

const cancelAppointment = async () => {
  if (!selectedAppointment.value) { showError("No appointment selected"); return; }
  loading.value = true;
  error.value = null;
  try {
    await appointmentOps.updateAppointment(selectedAppointment.value.id, { Status: "Cancelled" });
    await fetchAppointments();
    closeModals();
    showSuccess("Appointment cancelled successfully!");
  } catch (err) {
    error.value = err.message || "Failed to cancel appointment";
    showError(error.value);
  } finally {
    loading.value = false;
  }
};

const approveAppointment = async (apt) => {
  loading.value = true;
  try {
    await appointmentOps.updateAppointment(apt.id, { Status: "Confirmed" });
    await fetchAppointments();
    showSuccess("Appointment approved!");
  } catch { showError("Failed to approve appointment"); }
  finally { loading.value = false; }
};

const denyAppointment = async (apt) => {
  loading.value = true;
  try {
    await appointmentOps.updateAppointment(apt.id, { Status: "Denied" });
    await fetchAppointments();
    showSuccess("Appointment denied!");
  } catch { showError("Failed to deny appointment"); }
  finally { loading.value = false; }
};

const completeAppointment = async (apt) => {
  loading.value = true;
  try {
    await appointmentOps.updateAppointment(apt.id, { Status: "Completed" });
    await fetchAppointments();
    showSuccess("Appointment marked as completed!");
  } catch { showError("Failed to complete appointment"); }
  finally { loading.value = false; }
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

const getStatusBadgeVariant = (status) => {
  const map = {
    Pending: "warning", pending: "warning",
    Confirmed: "success", confirmed: "success",
    Approved: "success", approved: "success",
    Cancelled: "danger", cancelled: "danger",
    Denied: "danger", denied: "danger",
    Completed: "info", completed: "info",
  };
  return map[status] || "secondary";
};

const getStatusBlockClass = (status) => {
  const map = {
    Pending: "apt-pending", pending: "apt-pending",
    Confirmed: "apt-confirmed", confirmed: "apt-confirmed",
    Approved: "apt-confirmed", approved: "apt-confirmed",
    Completed: "apt-completed", completed: "apt-completed",
    Cancelled: "apt-cancelled", cancelled: "apt-cancelled",
    Denied: "apt-cancelled", denied: "apt-cancelled",
  };
  return map[status] || "apt-secondary";
};

const formatDateTime   = (dt) => dt ? new Date(dt).toLocaleString() : "N/A";
const formatTimeOnly   = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const isToday          = (dt) => dt ? new Date(dt).toDateString() === new Date().toDateString() : false;
const isUpcoming       = (dt) => dt ? new Date(dt) > new Date() : false;
const isPast           = (a) => {
  const dt = a.dateTime || a.DateTime;
  return dt ? new Date(dt) < new Date() : false;
};
// Actions are blocked once the appointment time has passed (regardless of status)
const canModify  = (a) => !isPast(a) && ["confirmed", "pending"].includes((a.status || a.Status || "").toLowerCase());
const canCancel  = (a) => !isPast(a) && !["completed", "cancelled", "denied"].includes((a.status || a.Status || "").toLowerCase());
const canApprove = (a) => !isPast(a) && (a.status || a.Status || "").toLowerCase() === "pending" && isStaff.value;

const handleCalendarAptClick = (apt) => {
  const own = appointmentsList.value.find((a) => (a.AppointmentID || a.id) === (apt.AppointmentID || apt.id));
  if (own) openViewModal(own);
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchAppointments(), fetchClinicSettings()]);
  setupRealtimeSubscription();
});
onUnmounted(() => {
  if (appointmentSubscription) supabase.removeChannel(appointmentSubscription);
});
</script>

<template>
  <div class="appointments-view">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">{{ title }}</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">{{ subtitle }}</p>
      </div>
      <div class="animate-fade-in-right d-flex gap-2">
        <button v-if="isStaff" class="btn btn-outline-secondary" @click="openSettingsModal" :disabled="loading">
          <i class="bi bi-gear-fill me-2"></i> Settings
        </button>
        <button class="btn btn-primary" @click="openBookModal()" :disabled="loading">
          <i class="bi bi-calendar-plus me-2"></i>
          {{ isPatient ? "Book Appointment" : "Schedule Appointment" }}
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mb-4">
      <div v-for="(stat, i) in stats" :key="i" class="col-md-3">
        <div class="card stats-card animate-fade-in-up" :class="`animation-delay-${i * 100}`">
          <div class="card-body text-center">
            <div class="stats-icon mb-2"><i :class="`bi ${stat.icon} text-${stat.color} fs-2`"></i></div>
            <h4 class="mb-1">{{ stat.value }}</h4>
            <small class="text-muted">{{ stat.label }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- View toggle + search/filter bar -->
    <div class="card mb-4 animate-fade-in-up animation-delay-200">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div v-if="viewMode === 'list'" class="col-md-4">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input v-model="search" type="text" class="form-control"
                :placeholder="isPatient ? 'Search by reason...' : 'Search by patient, reason...'" />
            </div>
          </div>
          <div v-if="viewMode === 'list'" class="col-md-4">
            <select v-model="filterStatus" class="form-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option v-if="isStaff" value="denied">Denied</option>
            </select>
          </div>
          <div :class="viewMode === 'list' ? 'col-md-4' : 'col-12'">
            <div class="btn-group w-100" role="group">
              <button type="button" class="btn"
                :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                @click="viewMode = 'list'">
                <i class="bi bi-list-ul me-1"></i>List
              </button>
              <button type="button" class="btn"
                :class="viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'"
                @click="viewMode = 'calendar'">
                <i class="bi bi-calendar3 me-1"></i>Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !error" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading appointments...</p>
    </div>

    <!-- ══════════════════════════════════
         LIST VIEW
         ══════════════════════════════════ -->
    <div v-else-if="viewMode === 'list'" class="card animate-fade-in-up animation-delay-300">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-calendar-event me-2"></i>
          {{ isPatient ? "My Appointments" : "Appointment Requests" }}
          ({{ filteredAppointments.length }})
        </h5>
        <button class="btn btn-sm btn-outline-primary" @click="fetchAppointments" :disabled="loading">
          <i class="bi bi-arrow-clockwise me-1" :class="{ 'animate-spin': loading }"></i>Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>No.</th>
                <th v-if="isStaff">Patient</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Reason</th>
                <th class="text-center">{{ mode === 'nurse' ? 'Confirmation/Action' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(appointment, index) in filteredAppointments"
                :key="appointment.id"
                class="animate-fade-in-up"
                :class="{ 'row-past': isPast(appointment) }"
              >
                <td>{{ index + 1 }}</td>
                <td v-if="isStaff">
                  <div class="d-flex align-items-center">
                    <div class="patient-avatar me-2">
                      <i class="bi bi-person-circle fs-4 text-muted"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ appointment.patientName || "Unknown Patient" }}</div>
                      <small v-if="appointment.patientContact" class="text-muted">{{ appointment.patientContact }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{{ formatDateTime(appointment.dateTime) }}</div>
                  <small v-if="isToday(appointment.dateTime)" class="badge bg-primary">Today</small>
                  <small v-else-if="isUpcoming(appointment.dateTime)" class="badge bg-info">Upcoming</small>
                  <small v-else class="badge bg-secondary">Past</small>
                </td>
                <td>
                  <small class="text-muted">
                    {{ formatTimeOnly(appointment.dateTime) }} – {{ formatTimeOnly(appointment.endDateTime) }}
                  </small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-1 flex-wrap">
                    <span class="badge" :class="`bg-${getStatusBadgeVariant(appointment.status)}`">
                      {{ appointment.status }}
                    </span>
                    <!-- Warn when a pending/confirmed appointment has already lapsed -->
                    <span
                      v-if="isPast(appointment) && !['completed','cancelled','denied'].includes((appointment.status || '').toLowerCase())"
                      class="badge bg-dark"
                      title="This appointment time has already passed"
                    >
                      <i class="bi bi-clock-history me-1"></i>Lapsed
                    </span>
                  </div>
                </td>
                <td>
                  <div>{{ appointment.reason }}</div>
                  <small v-if="appointment.symptoms" class="text-muted">{{ appointment.symptoms }}</small>
                </td>
                <td class="text-center">
                  <div v-if="isPast(appointment)" class="past-actions-note">
                    <button class="btn btn-sm btn-outline-info" @click="openViewModal(appointment)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <span class="text-muted ms-1" style="font-size:0.72rem;">
                      <i class="bi bi-lock-fill me-1"></i>Locked
                    </span>
                  </div>
                  <div v-else class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-info" @click="openViewModal(appointment)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <template v-if="canApprove(appointment)">
                      <button class="btn btn-sm btn-success" @click="approveAppointment(appointment)" title="Approve" :disabled="loading">
                        <i class="bi bi-check"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="denyAppointment(appointment)" title="Deny" :disabled="loading">
                        <i class="bi bi-x-circle"></i>
                      </button>
                    </template>
                    <button
                      v-if="isStaff && appointment.status?.toLowerCase() === 'confirmed'"
                      class="btn btn-sm btn-outline-success"
                      @click="completeAppointment(appointment)"
                      title="Mark Complete" :disabled="loading">
                      <i class="bi bi-check-circle"></i>
                    </button>
                    <button v-if="canModify(appointment)" class="btn btn-sm btn-outline-primary" @click="openRescheduleModal(appointment)" title="Reschedule">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button v-if="canCancel(appointment)" class="btn btn-sm btn-outline-danger" @click="openCancelModal(appointment)" title="Cancel">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredAppointments.length === 0" class="text-center py-5">
          <i class="bi bi-calendar-x text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No appointments found</h5>
          <p class="text-muted mb-3">
            {{ search ? "Try adjusting your search criteria." : isPatient ? "You haven't booked any appointments yet." : "No appointment requests yet." }}
          </p>
          <button v-if="!search" class="btn btn-primary" @click="openBookModal()">
            <i class="bi bi-calendar-plus me-2"></i>
            {{ isPatient ? "Book Your First Appointment" : "Schedule First Appointment" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         CALENDAR VIEW
         ══════════════════════════════════ -->
    <div v-else-if="viewMode === 'calendar'" class="animate-fade-in-up animation-delay-300">

      <!-- Toolbar -->
      <div class="card cal-toolbar mb-3">
        <div class="card-body py-2 px-3">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <!-- Nav -->
            <div class="d-flex align-items-center gap-2">
              <h5 class="mb-0 fw-bold">
                {{ calendarView === 'week' ? weekRangeLabel : currentMonthName }}
              </h5>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-secondary cal-nav-btn" @click="navigatePrev">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary cal-nav-btn" @click="goToToday">Today</button>
                <button class="btn btn-sm btn-outline-secondary cal-nav-btn" @click="navigateNext">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>

            <!-- Legend + week/month toggle -->
            <div class="d-flex flex-wrap align-items-center gap-3">
              <div class="d-none d-sm-flex align-items-center gap-3 cal-legend">
                <div class="d-flex align-items-center gap-1">
                  <span class="legend-dot legend-empty"></span><small class="text-muted">Open</small>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="legend-dot legend-available"></span><small class="text-muted">Available</small>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="legend-dot legend-filling"></span><small class="text-muted">Filling</small>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="legend-dot legend-full"></span><small class="text-muted">Full</small>
                </div>
              </div>
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm"
                  :class="calendarView === 'week' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="calendarView = 'week'">
                  <i class="bi bi-calendar-week me-1"></i>Week
                </button>
                <button type="button" class="btn btn-sm"
                  :class="calendarView === 'month' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="calendarView = 'month'">
                  <i class="bi bi-calendar-month me-1"></i>Month
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── WEEK VIEW ──────────────────────────────────────────────────── -->
      <div v-if="calendarView === 'week'" class="card cal-card">

        <!-- Day header row -->
        <div class="week-header">
          <div class="time-col"></div>
          <div
            v-for="day in weekDays" :key="day.toISOString()"
            class="week-day-col"
            :class="{ 'today-col-header': day.toDateString() === new Date().toDateString() }"
          >
            <div class="wdc-name">{{ dayNames[day.getDay()] }}</div>
            <div class="wdc-num" :class="{ 'today-num': day.toDateString() === new Date().toDateString() }">
              {{ day.getDate() }}
            </div>
          </div>
        </div>

        <!-- Scrollable time grid -->
        <div class="week-body">
          <div
            v-for="slot in clinicSlots" :key="`${slot.hour}:${slot.minute}`"
            class="week-slot-row"
            :class="{ 'half-hour-top': slot.minute === 0 }"
          >
            <!-- Time label (show only on :00) -->
            <div class="time-col">
              <span v-if="slot.minute === 0" class="time-label">
                {{ formatSlotTime(slot) }}
              </span>
            </div>

            <!-- Day cells -->
            <div
              v-for="day in weekDays" :key="day.toISOString() + slot.hour + slot.minute"
              class="week-slot-cell"
              :class="[
                { 'today-col-bg': day.toDateString() === new Date().toDateString() },
                slotStatusClass(slotStatus(new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot.hour, slot.minute))),
              ]"
              @click="openBookModal(new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot.hour, slot.minute))"
            >
              <!-- Appointment blocks — positioned absolute to fill the full slot height -->
              <template v-for="(apt, aptIdx) in aptsForSlot(day, slot.hour, slot.minute)" :key="apt.AppointmentID || apt.id">
                <!-- Anonymous block: patient sees other people's slots without PII -->
                <div
                  v-if="apt._anonymous"
                  class="apt-block apt-anonymous"
                  :style="{ left: `${aptIdx * 4}px`, zIndex: aptIdx + 1 }"
                  title="This slot is already booked"
                >
                  <span class="apt-block-label">Booked</span>
                  <span class="apt-block-meta">
                    <i class="bi bi-clock"></i>
                    {{ formatSlotTime(slot) }}
                  </span>
                </div>
                <!-- Own / staff appointment block -->
                <div
                  v-else
                  class="apt-block"
                  :class="getStatusBlockClass(apt.Status)"
                  :style="{ left: `${aptIdx * 4}px`, zIndex: aptIdx + 1 }"
                  @click.stop="handleCalendarAptClick(apt)"
                  :title="`${apt.Reason || apt.reason || 'Appointment'} · ${formatTimeOnly(apt.DateTime || apt.dateTime)}–${formatTimeOnly(apt.EndDateTime || apt.endDateTime)}`"
                >
                  <span class="apt-block-label">{{ apt.Reason || apt.reason || (isStaff ? apt.patientName : 'My appointment') }}</span>
                  <span class="apt-block-meta">
                    <i class="bi bi-clock"></i>
                    {{ formatTimeOnly(apt.DateTime || apt.dateTime) }}–{{ formatTimeOnly(apt.EndDateTime || apt.endDateTime) }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── MONTH VIEW ─────────────────────────────────────────────────── -->
      <div v-else class="card cal-card">
        <!-- Day-of-week header -->
        <div class="month-header">
          <div v-for="d in dayNames" :key="d" class="month-dh">{{ d }}</div>
        </div>

        <!-- Calendar grid -->
        <div v-for="(week, wi) in calendarDays" :key="wi" class="month-week-row">
          <div
            v-for="cell in week" :key="cell.date.toISOString()"
            class="month-cell"
            :class="{
              'other-month': !cell.isCurrentMonth,
              'today-cell': cell.isToday,
              'unavailable-cell': isDayUnavailable(cell.date),
              'past-cell': isDayInPast(cell.date) && !cell.isToday,
            }"
            @click="cell.isCurrentMonth && !isDayBlocked(cell.date) && openBookModal(cell.date)"
          >
            <!-- Date number -->
            <div class="mc-date">
              <span :class="{ 'today-badge': cell.isToday }">{{ cell.date.getDate() }}</span>
            </div>

            <template v-if="cell.isCurrentMonth">
              <!-- Slot availability chip -->
              <div class="mc-chip" :class="slotStatusClass(daySlotStatus(cell.date))">
                <template v-if="daySlotStatus(cell.date) === 'unavailable'">
                  <i class="bi bi-calendar-x-fill text-danger"></i> Closed
                </template>
                <template v-else-if="daySlotStatus(cell.date) === 'full'">
                  <i class="bi bi-x-circle-fill"></i> Full
                </template>
                <template v-else-if="daySlotStatus(cell.date) === 'empty'">
                  <i class="bi bi-calendar-plus"></i> Open
                </template>
                <template v-else>
                  <i class="bi bi-calendar-check"></i>
                  {{ availableSlotsOnDay(cell.date) }} slot{{ availableSlotsOnDay(cell.date) !== 1 ? 's' : '' }} left
                </template>
              </div>

              <!-- Patient: own appointment dots -->
              <div v-if="isPatient" class="mc-dots">
                <span
                  v-for="apt in appointmentsList.filter(a => new Date(a.dateTime || a.DateTime).toDateString() === cell.date.toDateString())"
                  :key="apt.id"
                  class="apt-dot"
                  :class="`dot-${getStatusBadgeVariant(apt.status)}`"
                  @click.stop="openViewModal(apt)"
                  :title="`${apt.reason || 'Appointment'} – ${apt.status}`"
                ></span>
              </div>

              <!-- Staff: mini appointment list -->
              <div v-if="isStaff" class="mc-apt-list">
                <div
                  v-for="apt in appointmentsList
                    .filter(a => new Date(a.dateTime || a.DateTime).toDateString() === cell.date.toDateString())
                    .slice(0, 2)"
                  :key="apt.id"
                  class="mc-apt-item"
                  :class="`status-${(apt.status || 'pending').toLowerCase()}`"
                  @click.stop="openViewModal(apt)"
                >
                  <span class="mc-apt-time">{{ formatTimeOnly(apt.dateTime) }}</span>
                  <span class="mc-apt-name">{{ apt.patientName || apt.reason || 'Apt.' }}</span>
                </div>
                <div
                  v-if="appointmentsList.filter(a => new Date(a.dateTime || a.DateTime).toDateString() === cell.date.toDateString()).length > 2"
                  class="mc-more"
                >
                  +{{ appointmentsList.filter(a => new Date(a.dateTime || a.DateTime).toDateString() === cell.date.toDateString()).length - 2 }} more
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

    </div><!-- end calendar view -->

    <!-- ══════════════════════════════════
         MODALS
         ══════════════════════════════════ -->

    <!-- Book Modal -->
    <div class="modal fade" :class="{ show: showBookModal }" :style="{ display: showBookModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-plus me-2"></i>
              {{ isPatient ? "Book New Appointment" : "Schedule New Appointment" }}
            </h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <form @submit.prevent="bookAppointment">
            <div class="modal-body">
              <div class="row g-3">
                <div v-if="isStaff" class="col-12">
                  <label class="form-label">Patient *</label>
                  <select v-model="appointmentForm.patientId" class="form-select" required>
                    <option value="">Select Patient</option>
                    <option v-for="p in patientsList" :key="p.PatientID" :value="p.PatientID">
                      {{ p.FirstName }} {{ p.Surname }}
                    </option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">
                    Preferred Date & Time *
                    <small class="text-muted ms-1">(30-minute slots)</small>
                  </label>
                  <input
                    v-model="appointmentForm.dateTime"
                    type="datetime-local"
                    class="form-control"
                    required
                    @change="appointmentForm.dateTime = formatDateTimeLocal(new Date(appointmentForm.dateTime))"
                  />
                  <!-- End time display -->
                  <div v-if="appointmentForm.dateTime" class="mt-1 text-muted small">
                    <i class="bi bi-clock me-1"></i>
                    Slot: {{ formatTimeOnly(appointmentForm.dateTime) }} –
                    {{ formatTimeOnly(endDateTime(appointmentForm.dateTime)?.toISOString()) }}
                  </div>
                  <!-- Slot warning -->
                  <div
                    v-if="appointmentForm.dateTime && isDayInPast(appointmentForm.dateTime)"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-calendar-x"></i>
                    <span>Appointment date <strong>cannot be in the past</strong>.</span>
                  </div>
                  <div
                    v-else-if="appointmentForm.dateTime && isSelectedDayUnavailable"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-calendar-x-fill"></i>
                    <span>This date is marked as <strong>unavailable</strong>. Please choose a different day.</span>
                  </div>
                  <div
                    v-else-if="appointmentForm.dateTime && isSelectedDayAtCapacity"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-people-fill"></i>
                    <span>This day has reached its maximum capacity of <strong>{{ clinicMaxPerDay }}</strong> patients.</span>
                  </div>
                  <div
                    v-else-if="appointmentForm.dateTime && selectedSlotOccupancy > 0"
                    class="mt-2 slot-warning"
                    :class="isSelectedSlotFull ? 'slot-warning-full' : 'slot-warning-partial'"
                  >
                    <i class="bi" :class="isSelectedSlotFull ? 'bi-x-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                    <span v-if="isSelectedSlotFull">
                      This slot is <strong>fully booked</strong> ({{ MAX_SLOT_CAPACITY }}/{{ MAX_SLOT_CAPACITY }}). Please choose a different time.
                    </span>
                    <span v-else>
                      <strong>{{ MAX_SLOT_CAPACITY - selectedSlotOccupancy }}</strong> of {{ MAX_SLOT_CAPACITY }} places remaining in this slot.
                    </span>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Reason for Visit *</label>
                  <input v-model="appointmentForm.reason" type="text" class="form-control" required placeholder="Brief description of your concern" />
                </div>

                <div class="col-12">
                  <label class="form-label">Additional Notes</label>
                  <textarea v-model="appointmentForm.notes" class="form-control" rows="2" placeholder="Any additional information"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModals">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading || isSelectedSlotFull || isSelectedDayBlocked">
                <i class="bi bi-calendar-plus me-2" :class="{ 'animate-spin': loading }"></i>
                {{ loading ? "Submitting..." : isPatient ? "Book Appointment" : "Schedule" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Details Modal -->
    <div class="modal fade" :class="{ show: showViewModal }" :style="{ display: showViewModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Appointment Details</h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body" v-if="selectedAppointment">
            <div class="mb-3" v-if="isStaff">
              <strong>Patient:</strong>
              <p class="mb-0">{{ selectedAppointment.patientName }}</p>
            </div>
            <div class="mb-3">
              <strong>Date & Time:</strong>
              <p class="mb-0">{{ formatDateTime(selectedAppointment.dateTime) }}</p>
            </div>
            <div class="mb-3">
              <strong>Duration:</strong>
              <p class="mb-0">
                {{ formatTimeOnly(selectedAppointment.dateTime) }} –
                {{ formatTimeOnly(selectedAppointment.endDateTime) }}
                <span class="badge bg-secondary ms-1">30 min</span>
              </p>
            </div>
            <div class="mb-3">
              <strong>Status:</strong>
              <span class="badge ms-2" :class="`bg-${getStatusBadgeVariant(selectedAppointment.status)}`">
                {{ selectedAppointment.status }}
              </span>
            </div>
            <div class="mb-3">
              <strong>Reason:</strong>
              <p class="mb-0">{{ selectedAppointment.reason || "N/A" }}</p>
            </div>
            <div class="mb-3" v-if="selectedAppointment.symptoms">
              <strong>Symptoms:</strong>
              <p class="mb-0">{{ selectedAppointment.symptoms }}</p>
            </div>
            <div class="mb-0" v-if="selectedAppointment.notes">
              <strong>Notes:</strong>
              <p class="mb-0">{{ selectedAppointment.notes }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div class="modal fade" :class="{ show: showRescheduleModal }" :style="{ display: showRescheduleModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil me-2"></i>Reschedule Appointment</h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <form @submit.prevent="rescheduleAppointment">
            <div class="modal-body">
              <div v-if="selectedAppointment" class="p-3 bg-light rounded mb-4">
                <h6 class="mb-1">Current Appointment</h6>
                <span v-if="isStaff" class="fw-medium">{{ selectedAppointment.patientName }} · </span>
                {{ formatDateTime(selectedAppointment.dateTime) }}
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">New Date & Time * <small class="text-muted">(30 min)</small></label>
                  <input v-model="appointmentForm.dateTime" type="datetime-local" class="form-control" required @change="appointmentForm.dateTime = formatDateTimeLocal(new Date(appointmentForm.dateTime))" />
                  <div v-if="appointmentForm.dateTime" class="mt-1 text-muted small">
                    <i class="bi bi-clock me-1"></i>
                    {{ formatTimeOnly(appointmentForm.dateTime) }} –
                    {{ formatTimeOnly(endDateTime(appointmentForm.dateTime)?.toISOString()) }}
                  </div>
                  <div
                    v-if="appointmentForm.dateTime && isDayInPast(appointmentForm.dateTime)"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-calendar-x"></i>
                    Date <strong>cannot be in the past</strong>.
                  </div>
                  <div
                    v-else-if="appointmentForm.dateTime && isRescheduleDayUnavailable"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-calendar-x-fill"></i>
                    This date is <strong>unavailable</strong>. Please choose a different day.
                  </div>
                  <div
                    v-else-if="appointmentForm.dateTime && isRescheduleDayAtCapacity"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-people-fill"></i>
                    This day has reached its capacity of <strong>{{ clinicMaxPerDay }}</strong>.
                  </div>
                  <div
                    v-else-if="appointmentForm.dateTime && isRescheduleSlotFull"
                    class="mt-2 slot-warning slot-warning-full"
                  >
                    <i class="bi bi-x-circle-fill"></i>
                    This slot is <strong>fully booked</strong>. Please choose a different time.
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Reason for Rescheduling</label>
                  <textarea v-model="appointmentForm.notes" class="form-control" rows="2" placeholder="Reason for rescheduling"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModals">Cancel</button>
              <button type="submit" class="btn btn-warning" :disabled="loading || isRescheduleSlotFull || isRescheduleDayBlocked">
                <i class="bi bi-arrow-repeat me-2" :class="{ 'animate-spin': loading }"></i>
                {{ loading ? "Rescheduling..." : "Reschedule Appointment" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div class="modal fade" :class="{ show: showCancelModal }" :style="{ display: showCancelModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>Cancel Appointment
            </h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to cancel this appointment?</p>
            <div v-if="selectedAppointment" class="alert alert-warning">
              <strong v-if="isStaff">{{ selectedAppointment.patientName }}</strong>
              <br v-if="isStaff" />
              <strong>{{ selectedAppointment.type }}</strong><br />
              <small>{{ formatDateTime(selectedAppointment.dateTime) }}</small><br />
              <small>{{ selectedAppointment.reason }}</small>
            </div>
            <p class="text-muted mb-0">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">Keep Appointment</button>
            <button type="button" class="btn btn-danger" @click="cancelAppointment" :disabled="loading">
              <i class="bi bi-x-circle me-2" :class="{ 'animate-spin': loading }"></i>
              {{ loading ? "Cancelling..." : "Cancel Appointment" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Clinic Settings Modal -->
    <div v-if="isStaff" class="modal fade" :class="{ show: showSettingsModal }" :style="{ display: showSettingsModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              <i class="bi bi-gear-fill me-2 text-primary"></i>Clinic Booking Settings
            </h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Capacity Settings -->
            <div class="mb-4">
              <h6 class="fw-bold mb-3"><i class="bi bi-people-fill me-2 text-primary"></i>Daily Capacity</h6>
              <div class="bg-light p-3 rounded border">
                <label class="form-label fw-semibold">Maximum Patients Per Day</label>
                <div class="input-group capacity-input-group" style="max-width: 250px;">
                  <span class="input-group-text"><i class="bi bi-person-check"></i></span>
                  <input
                    v-model.number="settingsMaxPatients"
                    type="number"
                    min="1"
                    max="500"
                    class="form-control"
                    placeholder="e.g. 50"
                  />
                </div>
                <div class="form-text mt-2">
                  When this limit is reached for a given day, no new appointments can be booked.
                </div>
              </div>
            </div>

            <!-- Unavailable Dates -->
            <div>
              <h6 class="fw-bold mb-3"><i class="bi bi-calendar-x-fill me-2 text-danger"></i>Unavailable Dates</h6>
              <div class="bg-light p-3 rounded border">
                <label class="form-label fw-semibold">Add Date (Closed / No Bookings)</label>
                <div class="d-flex gap-2 mb-2" style="max-width: 350px;">
                  <div style="flex-grow: 1;">
                    <VueDatePicker
                      v-model="settingsNewDate"
                      :enable-time-picker="false"
                      format="MM/dd/yyyy"
                      placeholder="MM/DD/YYYY"
                    ></VueDatePicker>
                  </div>
                  <button class="btn btn-danger px-3" @click="addUnavailableDate">
                    <i class="bi bi-plus-lg me-1"></i>Add
                  </button>
                </div>
                <div v-if="settingsDateInputError" class="text-danger small mb-3">
                  <i class="bi bi-exclamation-circle me-1"></i>{{ settingsDateInputError }}
                </div>

                <div class="unavail-list mt-3">
                  <div v-if="sortedSettingsUnavailableDates.length === 0" class="text-center p-3 text-muted bg-white border rounded">
                    No unavailable dates set. All future dates are open.
                  </div>
                  <div v-else class="unavail-scroll d-flex flex-column gap-2" style="max-height: 200px; overflow-y: auto;">
                    <div
                      v-for="iso in sortedSettingsUnavailableDates"
                      :key="iso"
                      class="d-flex align-items-center justify-content-between bg-white border border-danger-subtle rounded px-3 py-2"
                    >
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-calendar-x text-danger"></i>
                        <span class="fw-medium">{{ formatDisplayDate(iso) }}</span>
                        <small class="text-muted ms-2">({{ iso }})</small>
                      </div>
                      <button class="btn btn-sm btn-outline-danger border-0" @click="removeUnavailableDate(iso)" title="Remove">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" @click="closeModals">Cancel</button>
            <button type="button" class="btn btn-primary px-4" @click="saveSettings" :disabled="settingsSaving">
              <i class="bi bi-floppy me-2" :class="{ 'animate-spin': settingsSaving }"></i>
              {{ settingsSaving ? "Saving..." : "Save Settings" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showBookModal || showViewModal || showRescheduleModal || showCancelModal || showSettingsModal"
      class="modal-backdrop fade show"
      @click="closeModals"
    ></div>

  </div>
</template>

<style scoped>
.appointments-view { padding: 1rem; }

/* ── Stats ── */
.stats-card { transition: transform 0.2s, box-shadow 0.2s; }
.stats-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.1); }

/* ── Search ── */
.search-box { position: relative; }
.search-box .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6c757d; }
.search-box input { padding-left: 36px; }

/* ── Patient avatar ── */
.patient-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }

/* ── Past appointment row ── */
.row-past { opacity: 0.6; background-color: #f8f9fa !important; }
.row-past td { color: #6c757d; }
.past-actions-note { display: flex; align-items: center; justify-content: center; gap: 4px; }

/* ── Calendar shared ── */
.cal-toolbar .card-body { padding: 0.75rem 1rem; }
.cal-card { border-radius: 0.5rem; overflow: hidden; border: 1px solid #dee2e6; }
.cal-nav-btn { padding: 3px 8px; }

/* ── Legend ── */
.cal-legend { gap: 1rem !important; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.legend-empty     { background-color: #e8f5e9; border: 1px solid #a5d6a7; }
.legend-available { background-color: #198754; }
.legend-filling   { background-color: #fd7e14; }
.legend-full      { background-color: #adb5bd; }

/* ── Slot status palette ── */
.slot-empty     { background-color: #f8fffe !important; }
.slot-available { background-color: #f0faf4 !important; }
.slot-filling   { background-color: #fff8f0 !important; }
.slot-full      { background-color: #f5f5f5 !important; cursor: not-allowed !important; }
.slot-unavailable { background-color: #fff0f0 !important; border: 1px solid #f8d7da !important; color: #dc3545 !important; }
.past-cell { cursor: not-allowed !important; opacity: 0.7; }
.month-cell.past-cell .mc-date { color: #adb5bd; }

/* ── Slot warning ── */
.slot-warning {
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  font-size: 0.83rem;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}
.slot-warning i { margin-top: 2px; flex-shrink: 0; }
.slot-warning-full    { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
.slot-warning-partial { background: #fff3cd; color: #664d03; border: 1px solid #ffecb5; }

/* ═══════════════════════════════════════════
   WEEK VIEW
   ═══════════════════════════════════════════ */
.week-header {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 5;
}

.week-day-col {
  padding: 8px 4px;
  text-align: center;
  border-left: 1px solid #dee2e6;
}
.today-col-header { background-color: #e7f1ff; }
.wdc-name { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #6c757d; letter-spacing: .05em; }
.wdc-num  { font-size: 1rem; font-weight: 700; color: #212529; }
.wdc-num.today-num {
  background: #0d6efd; color: #fff;
  width: 28px; height: 28px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.85rem;
}

.week-body { overflow-y: auto; max-height: 560px; }

/* One row = one 30-min slot. Fixed height so blocks can fill it absolutely. */
.week-slot-row {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  height: 64px;         /* fixed — blocks use position:absolute to fill this */
  border-bottom: 1px solid #f0f0f0;
}
.week-slot-row.half-hour-top { border-top: 1px solid #dee2e6; }

.time-col {
  border-right: 1px solid #dee2e6;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px 6px 0 0;
}
.time-label { font-size: 0.65rem; font-weight: 600; color: #6c757d; white-space: nowrap; }

/* Each cell is a positioned container so apt-blocks can fill it absolutely */
.week-slot-cell {
  border-left: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  height: 64px;         /* match .week-slot-row height */
  overflow: hidden;
  transition: background-color 0.12s;
}
.week-slot-cell:hover { filter: brightness(0.97); }
.today-col-bg { background-color: #fafcff; }
.slot-full > .week-slot-cell { cursor: not-allowed; }

/* ── Appointment blocks ──────────────────────────────────────────────────
   Positioned absolute so they stretch to fill the full 64px row height.
   Multiple concurrent blocks (rare, MAX_SLOT_CAPACITY > 1) are stacked
   with a small left offset so each is still visible.
   ─────────────────────────────────────────────────────────────────────── */
.apt-block {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  right: 3px;
  border-radius: 6px;
  border-left: 4px solid transparent;
  padding: 5px 7px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: box-shadow 0.15s, opacity 0.15s;
}
.apt-block:hover {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  opacity: 0.93;
}

/* Title line — bold, truncated */
.apt-block-label {
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.25;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Time line — small, with clock icon */
.apt-block-meta {
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

/* Status colours */
.apt-pending   { background: #fff8e1; color: #7b5e00; border-left-color: #f59e0b; }
.apt-confirmed { background: #ecfdf5; color: #065f46; border-left-color: #10b981; }
.apt-completed { background: #e0f2fe; color: #075985; border-left-color: #0ea5e9; }
.apt-cancelled { background: #fff1f2; color: #881337; border-left-color: #f43f5e; }
.apt-secondary { background: #f3f4f6; color: #374151; border-left-color: #9ca3af; }
/* Anonymous — patients see other people's booked slots without PII */
.apt-anonymous {
  background: #f1f5f9;
  color: #64748b;
  border-left-color: #cbd5e1;
  cursor: default;
  font-style: italic;
}


/* ═══════════════════════════════════════════
   MONTH VIEW
   ═══════════════════════════════════════════ */
.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}
.month-dh {
  padding: 6px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  letter-spacing: .05em;
}

.month-week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e9ecef;
}

.month-cell {
  min-height: 100px;
  padding: 6px;
  border-right: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.12s;
  overflow: hidden;
}
.month-cell:last-child { border-right: none; }
.month-cell:hover { background-color: #f8f9fa; }
.month-cell.other-month { background: #fafafa; cursor: default; opacity: 0.5; }
.month-cell.today-cell  { background: #e7f1ff; }

.mc-date { font-size: 0.82rem; font-weight: 600; color: #495057; margin-bottom: 4px; }
.month-cell.other-month .mc-date { color: #adb5bd; }
.today-badge {
  background: #0d6efd; color: #fff;
  border-radius: 50%; width: 22px; height: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.78rem;
}

.mc-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid transparent;
  margin-bottom: 4px;
  white-space: nowrap;
}
.mc-chip.slot-empty     { background: #e8f5e9; color: #1b5e20; border-color: #c8e6c9; }
.mc-chip.slot-available { background: #d1e7dd; color: #0f5132; border-color: #badbcc; }
.mc-chip.slot-filling   { background: #ffe5d0; color: #7d3c00; border-color: #ffcba4; }
.mc-chip.slot-full      { background: #e2e3e5; color: #41464b; border-color: #d3d6d8; }

/* Patient appointment dots */
.mc-dots { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 3px; }
.apt-dot { width: 8px; height: 8px; border-radius: 50%; cursor: pointer; transition: transform 0.12s; }
.apt-dot:hover { transform: scale(1.4); }
.dot-warning   { background: #ffc107; }
.dot-success   { background: #198754; }
.dot-info      { background: #0dcaf0; }
.dot-danger    { background: #dc3545; }
.dot-secondary { background: #6c757d; }

/* Staff appointment mini-list */
.mc-apt-list { margin-top: 3px; display: flex; flex-direction: column; gap: 2px; }
.mc-apt-item {
  font-size: 0.62rem;
  padding: 1px 5px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  gap: 4px;
  overflow: hidden;
}
.mc-apt-time { font-weight: 700; flex-shrink: 0; }
.mc-apt-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-apt-item.status-pending   { background: #fff3cd; color: #856404; }
.mc-apt-item.status-confirmed { background: #d1e7dd; color: #0f5132; }
.mc-apt-item.status-completed { background: #cff4fc; color: #055160; }
.mc-apt-item.status-cancelled,
.mc-apt-item.status-denied    { background: #f8d7da; color: #58151c; }
.mc-more {
  font-size: 0.58rem; color: #6c757d;
  background: #e9ecef; border-radius: 3px;
  padding: 1px 4px; text-align: center;
}

/* ── Animations ── */
.animate-fade-in-left  { animation: fadeInLeft  0.5s ease-out; }
.animate-fade-in-right { animation: fadeInRight 0.5s ease-out; }
.animate-fade-in-up    { animation: fadeInUp    0.5s ease-out; }
.animation-delay-100   { animation-delay: 0.1s; }
.animation-delay-200   { animation-delay: 0.2s; }
.animation-delay-300   { animation-delay: 0.3s; }

@keyframes fadeInLeft  { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
@keyframes fadeInRight { from { opacity:0; transform:translateX(20px);  } to { opacity:1; transform:translateX(0); } }
@keyframes fadeInUp    { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }

.animate-spin  { animation: spin  1s linear   infinite; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes spin  { from { transform:rotate(0deg);  } to { transform:rotate(360deg); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

/* ── Responsive ── */
@media (max-width: 768px) {
  .week-body { max-height: 420px; }
  .week-header, .week-slot-row { grid-template-columns: 40px repeat(7, 1fr); }
  .time-col { width: 40px; }
  .apt-block { min-height: 34px; }
  .month-cell { min-height: 72px; padding: 4px; }
  .mc-chip { font-size: 0.58rem; padding: 1px 4px; }
  .cal-legend { display: none !important; }
}

@media (max-width: 576px) {
  .week-slot-row { min-height: 40px; }
  .week-slot-cell { min-height: 40px; }
  .month-cell { min-height: 58px; padding: 3px; }
  .mc-chip { display: none; }
  .wdc-num { font-size: 0.85rem; }
}
/* ── Month view cells ── */
.month-cell.unavailable-cell {
  background-color: #fff5f5;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(220, 53, 69, 0.03) 10px,
    rgba(220, 53, 69, 0.03) 20px
  );
  cursor: not-allowed !important;
}
.month-cell.unavailable-cell:hover {
  background-color: #fff0f0;
}
.month-cell.unavailable-cell .mc-date {
  color: #dc3545;
  opacity: 0.6;
}
</style>
