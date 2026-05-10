# Appointment Scheduling

## Overview

Every appointment occupies a fixed **30-minute time slot**. The system enforces a maximum number of concurrent bookings per slot and surfaces real-time availability on the calendar so patients can see open vs. full slots before booking.

---

## Slot Model

| Constant            | Value                       | Location               |
| ------------------- | --------------------------- | ---------------------- |
| `SLOT_DURATION_MIN` | `30` minutes                | `AppointmentsView.vue` |
| `MAX_SLOT_CAPACITY` | `3` concurrent appointments | `AppointmentsView.vue` |
| `CLINIC_START_HOUR` | `7` (7:00 AM)               | `AppointmentsView.vue` |
| `CLINIC_END_HOUR`   | `18` (6:00 PM)              | `AppointmentsView.vue` |

The last bookable slot is **17:30 – 18:00**. Slots are keyed as `YYYY-MM-DD HH:MM` (always on a 30-minute boundary) so concurrent bookings within the same window are grouped and counted together.

`TOTAL_SLOTS_PER_DAY = (CLINIC_END_HOUR - CLINIC_START_HOUR) × 2 = 22`

### Changing the defaults

All four constants are defined at the top of the `<script setup>` block in [AppointmentsView.vue](../src/views/shared/AppointmentsView.vue). Edit them there — no other files need updating.

---

## Database Fields

The `Appointment` table stores both endpoints of every slot:

| Column        | Type          | Description                                  |
| ------------- | ------------- | -------------------------------------------- |
| `DateTime`    | `TIMESTAMPTZ` | Slot start time (PHT, +08:00)                |
| `EndDateTime` | `TIMESTAMPTZ` | Slot end time = start + 30 min (PHT, +08:00) |

`EndDateTime` is calculated automatically on the frontend (`endDateTime()` helper) and written alongside `DateTime` on every create or reschedule.

### PHT Timezone Handling

`createAppointment()` and `updateAppointment()` in `useSupabase.js` use an `addPHT()` helper that appends `:00+08:00` to **both** `DateTime` and `EndDateTime` when no timezone suffix is already present:

```js
const addPHT = (val) =>
  val && !String(val).match(/[Zz]$|[+-]\d{2}:\d{2}$/)
    ? String(val) + ":00+08:00"
    : val;
```

> **Note on the old regex bug:** The original regex `/[Zz+\-]\d/` incorrectly matched date hyphens (e.g. `"2026-05-15"` contains `-0`), so `+08:00` was never appended and times were stored as UTC. This caused appointments to appear 8 hours late in the week view and produced wrong `EndDateTime` values (e.g. `07:00 AM – 03:30 PM` instead of `07:00 – 07:30`). The regex is now `/[Zz]$|[+-]\d{2}:\d{2}$/` which only matches a real timezone suffix at the end of the string.

---

## Conflict Detection

Conflict checks are purely client-side, using the `slotOccupancy` computed map built from `allCalendarAppointments` (fetched via `getAppointmentsForCalendar()`):

```
slotOccupancy = { "2026-05-15 09:00": 2, "2026-05-15 09:30": 3, ... }
```

A slot is **full** when its count reaches `MAX_SLOT_CAPACITY`.

### On booking

`isSelectedSlotFull` blocks the submit button and shows a red warning banner if the chosen slot is at capacity.

### On reschedule

`isRescheduleSlotFull` excludes the appointment being moved from the count (so moving to the same slot is always valid).

### Slot count displayed on month chips

The month view chip shows **available slots for the day**, not a per-slot count:

```
availableSlotsOnDay(date) = TOTAL_SLOTS_PER_DAY − bookedSlotsOnDay(date)
```

`bookedSlotsOnDay` counts how many distinct 30-min slot keys have ≥ 1 booking on that day (regardless of how many bookings are in each slot). So 1 appointment on a day → 21 slots left (not `MAX_SLOT_CAPACITY − 1 = 2`).

---

## Calendar Views

### Week view

- Rows are 30-minute slots from `CLINIC_START_HOUR` to `CLINIC_END_HOUR`.
- Each slot row has a fixed height (`64px`). Appointment blocks use `position: absolute` to fill the full row height, giving a proper calendar-event appearance.
- Each cell is color-coded by slot occupancy:
  - **White** — no bookings yet (open)
  - **Light green** — 1 or more bookings, below 60% capacity
  - **Light orange** — above 60% capacity (filling fast)
  - **Light grey** — at `MAX_SLOT_CAPACITY` (fully booked)
- Appointment blocks show the reason/title in bold at the top and `HH:MM – HH:MM` with a clock icon at the bottom.
- **Staff** blocks are clickable and open the details modal.
- **Patient** blocks: own appointments are clickable; other people's slots render as anonymous grey **"Booked"** blocks (no PII shown).
- Clicking an empty cell pre-fills the booking modal with that date and time.

### Month view

- Each day shows a chip: **"X slots left"** (`availableSlotsOnDay`), **"Full"**, or **"Open"**.
- Chip colour reflects the worst-case slot status across all slots that day.
- Patients see coloured dots for their own appointments (colour = status).
- Staff see a mini list of up to 2 appointments per day (time + patient name) with a "+N more" label.
- Clicking any current-month cell opens the booking modal with that date pre-filled (time defaults to `CLINIC_START_HOUR:00`).

---

## List View

- Appointments are sorted **newest first** (descending `DateTime`).
- Past appointments (where `DateTime < now`) are visually dimmed and show a **"Lapsed"** badge if still in a non-terminal status (Pending or Confirmed).
- All action buttons (Approve, Deny, Reschedule, Cancel) are **locked** for past appointments — only the View button remains. This prevents accidental changes to records after the appointment time has passed.

---

## Booking Flow (Patient)

1. Patient navigates to **My Appointments → Calendar**.
2. Month view shows chips per day — green (open), orange (filling), grey (full).
3. Patient clicks a day or switches to Week view and clicks a specific 30-min slot.
4. Booking modal opens with date/time pre-filled and snapped to the nearest 30-min boundary.
5. The modal shows **"Slot: HH:MM – HH:MM"** so the patient sees the exact window.
6. If the slot has existing bookings a yellow partial-fill warning appears; if full the submit button is disabled and a red warning is shown.
7. On submit, `DateTime` and `EndDateTime` (both with `+08:00`) are written to the database; status is set to `Pending`.

## Booking Flow (Staff / Nurse / Admin)

Same as above except:

- Staff can also select the patient from a dropdown.
- New appointments are set to `Confirmed` instead of `Pending`.
- Staff can **Approve**, **Deny**, **Complete**, or **Reschedule** any future appointment from the list view.
- Actions on past appointments are locked for staff as well.

---

## Data Access (RLS Notes)

`getAppointmentsForCalendar()` in `useSupabase.js` fetches `AppointmentID`, `DateTime`, `EndDateTime`, and `Status` for all non-cancelled/denied appointments.

- **Staff** (nurse/admin): full read access via the `"Staff can read all appointments"` policy — all slots are visible.
- **Patients**: calls `supabase.rpc("get_calendar_slots")`, a `SECURITY DEFINER` function that returns only `(AppointmentID, DateTime, EndDateTime, Status)` — no patient names or reasons — for all active appointments, bypassing the row-level policy in a controlled, read-only way. In the week view, slots that don't belong to the current patient are rendered as anonymous grey **"Booked"** blocks.

### Required migration

Run [`add-calendar-read-for-patients.sql`](../src/supabase/migrations/add-calendar-read-for-patients.sql) in the Supabase SQL editor **once** to create the `get_calendar_slots()` function and grant execute permission to authenticated users. Without this, patients fall back to seeing only their own slots in the calendar.
