<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import {
  formatDate,
  parseDate,
  standardizePatientDates,
} from "../utils/dateUtils";
import { addPatientNotification } from "../utils/notificationUtils";

const store = useStore();
const router = useRouter();
const route = useRoute();

// Determine if we're editing or adding a new patient
const isEditing = computed(() => route.params.id !== undefined);
const patientId = computed(() =>
  isEditing.value ? parseInt(route.params.id) : null
);

// Form data
const patientForm = ref({
  firstName: "",
  lastName: "",
  suffix: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  medicalConditions: [],
  allergies: [],
  bloodType: "N/A",
  height: "",
  weight: "",
});

// For medical conditions input
const newCondition = ref("");
const newAllergy = ref("");

// Form state
const isLoading = ref(true);
const isSaving = ref(false);
const formErrors = ref({});
const saveSuccess = ref(false);

onMounted(() => {
  if (isEditing.value) {
    // Get patient data if editing
    const patient = store.state.patients.find((p) => p.id === patientId.value);

    if (patient) {
      // Clone the patient data (to avoid direct state mutation)
      patientForm.value = {
        ...patient,
        // Default values for fields that might not exist in the store
        allergies: patient.allergies || [],
        bloodType: patient.bloodType || "",
        height: patient.height || "",
        weight: patient.weight || "",
      };

      // For HTML date input, we need to ensure ISO format YYYY-MM-DD
      if (patient.dobIso) {
        patientForm.value.dob = patient.dobIso;
      } else if (patient.dob && patient.dob.includes("-")) {
        patientForm.value.dob = parseDate(patient.dob);
      }
    } else {
      router.push("/patients");
    }
  }

  isLoading.value = false;
});

const addCondition = () => {
  if (newCondition.value.trim() !== "") {
    patientForm.value.medicalConditions.push(newCondition.value.trim());
    newCondition.value = "";
  }
};

const removeCondition = (index) => {
  patientForm.value.medicalConditions.splice(index, 1);
};

const addAllergy = () => {
  if (newAllergy.value.trim() !== "") {
    patientForm.value.allergies.push(newAllergy.value.trim());
    newAllergy.value = "";
  }
};

const removeAllergy = (index) => {
  patientForm.value.allergies.splice(index, 1);
};

const validateForm = () => {
  const errors = {};

  if (!patientForm.value.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!patientForm.value.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!patientForm.value.dob) {
    errors.dob = "Date of birth is required";
  } else if (
    !/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/.test(
      patientForm.value.dob
    )
  ) {
    errors.dob = "Date must be in MM-DD-YYYY format";
  }

  if (!patientForm.value.gender) {
    errors.gender = "Gender is required";
  }

  if (!patientForm.value.phone.trim()) {
    errors.phone = "Phone number is required";
  }

  if (
    patientForm.value.email.trim() &&
    !/\S+@\S+\.\S+/.test(patientForm.value.email)
  ) {
    errors.email = "Email address is invalid";
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const savePatient = () => {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;

  // Simulate API delay
  setTimeout(() => {
    // Get a copy of patient data with ISO date for the form
    const patientData = {
      ...patientForm.value,
      // Store the ISO format for future edits
      dobIso: patientForm.value.dob,
    };

    // Use the standardizePatientDates utility to ensure consistent date formatting
    const formattedPatient = standardizePatientDates(patientData);

    if (isEditing.value) {
      // Update existing patient
      store.commit("updatePatient", {
        ...formattedPatient,
        id: patientId.value,
      });

      // Add notification for updating patient
      addPatientNotification(store, formattedPatient, "updated");
    } else {
      // Add new patient with a generated ID
      const newId = Math.max(0, ...store.state.patients.map((p) => p.id)) + 1;
      const today = new Date();
      const newPatient = {
        ...formattedPatient,
        id: newId,
        lastVisit: formatDate(today),
      };

      store.commit("addPatient", newPatient);

      // Add notification for new patient
      addPatientNotification(store, newPatient, "added");
    }

    saveSuccess.value = true;
    isSaving.value = false;

    // Navigate back to patient list after a short delay
    setTimeout(() => {
      router.push("/patients");
    }, 1500);
  }, 800);
};

const cancel = () => {
  router.back();
};
</script>

<template>
  <v-container class="patient-form compact-form">
    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="primary"
      class="d-flex mx-auto my-3"
    ></v-progress-circular>
    <div v-else>
      <v-row align="center" justify="space-between" class="mb-2">
        <v-col cols="auto">
          <h4>{{ isEditing ? "Edit Patient" : "Add New Patient" }}</h4>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="cancel" size="small" variant="outlined">
            <v-icon left>mdi-close-circle</v-icon> Cancel
          </v-btn>
        </v-col>
      </v-row>

      <v-alert v-if="saveSuccess" type="success" dismissible class="mb-4">
        Patient record {{ isEditing ? "updated" : "created" }} successfully!
      </v-alert>

      <v-form @submit.prevent="savePatient">
        <v-card>
          <v-card-title class="py-2">
            <h5 class="mb-0">Patient Information</h5>
          </v-card-title>

          <v-card-text class="pa-3">
            <v-row dense>
              <!-- Row 1: Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="patientForm.firstName"
                  label="First Name *"
                  density="compact"
                  :error-messages="formErrors.firstName"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="patientForm.lastName"
                  label="Last Name *"
                  density="compact"
                  :error-messages="formErrors.lastName"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="2">
                <v-text-field
                  v-model="patientForm.suffix"
                  label="Suffix"
                  density="compact"
                  placeholder="Jr., Sr."
                ></v-text-field>
              </v-col>

              <!-- Row 2: DOB, Gender, Blood Type -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="patientForm.dob"
                  label="Date of Birth *"
                  density="compact"
                  :error-messages="formErrors.dob"
                  placeholder="MM-DD-YYYY"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="patientForm.gender"
                  :items="['Male', 'Female', 'Other', 'Prefer not to say']"
                  label="Gender *"
                  density="compact"
                  :error-messages="formErrors.gender"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="patientForm.bloodType"
                  :items="[
                    'N/A',
                    'A+',
                    'A-',
                    'B+',
                    'B-',
                    'AB+',
                    'AB-',
                    'O+',
                    'O-',
                  ]"
                  label="Blood Type"
                  density="compact"
                ></v-select>
              </v-col>

              <!-- Row 3: Contact info -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="patientForm.phone"
                  label="Phone *"
                  density="compact"
                  :error-messages="formErrors.phone"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="patientForm.email"
                  label="Email"
                  density="compact"
                  :error-messages="formErrors.email"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field
                      v-model="patientForm.height"
                      label="Height"
                      density="compact"
                      placeholder="cm"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="patientForm.weight"
                      label="Weight"
                      density="compact"
                      placeholder="kg"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Row 4: Address -->
              <v-col cols="12">
                <v-text-field
                  v-model="patientForm.address"
                  label="Address"
                  density="compact"
                ></v-text-field>
              </v-col>

              <!-- Row 5: Medical Conditions and Allergies -->
              <v-col cols="12" md="6">
                <label class="v-label">Medical Conditions</label>
                <v-row dense class="mb-1">
                  <v-col cols="9">
                    <v-text-field
                      v-model="newCondition"
                      density="compact"
                      placeholder="Add"
                      @keyup.enter="addCondition"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-btn
                      @click="addCondition"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

                <div class="mt-1">
                  <v-chip
                    v-for="(condition, index) in patientForm.medicalConditions"
                    :key="index"
                    color="info"
                    size="small"
                    closable
                    @click:close="removeCondition(index)"
                    class="me-1 mb-1"
                  >
                    {{ condition }}
                  </v-chip>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <label class="v-label">Allergies</label>
                <v-row dense class="mb-1">
                  <v-col cols="9">
                    <v-text-field
                      v-model="newAllergy"
                      density="compact"
                      placeholder="Add"
                      @keyup.enter="addAllergy"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-btn
                      @click="addAllergy"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

                <div class="mt-1">
                  <v-chip
                    v-for="(allergy, index) in patientForm.allergies"
                    :key="index"
                    color="warning"
                    size="small"
                    closable
                    @click:close="removeAllergy(index)"
                    class="me-1 mb-1"
                  >
                    {{ allergy }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="py-2 justify-end">
            <v-btn @click="cancel" size="small" variant="outlined" class="me-2">
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              size="small"
              color="primary"
              :loading="isSaving"
            >
              {{ isSaving ? "Saving..." : isEditing ? "Update" : "Create" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </div>
  </v-container>
</template>

<style scoped>
.patient-form {
  max-width: 700px;
  margin: 0 auto;
}

.compact-form .v-label {
  font-weight: 500;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}
</style>
