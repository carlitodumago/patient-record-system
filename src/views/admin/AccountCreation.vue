<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-account-plus</v-icon>
            Create New Account
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="accountType"
                    :items="accountTypes"
                    label="Account Type"
                    required
                    :rules="[v => !!v || 'Account type is required']"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="role"
                    :items="roles"
                    label="Role"
                    required
                    :rules="[v => !!v || 'Role is required']"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row v-if="accountType === 'patient'">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="firstName"
                    label="First Name"
                    required
                    :rules="[v => !!v || 'First name is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="middleName"
                    label="Middle Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="lastName"
                    label="Last Name"
                    required
                    :rules="[v => !!v || 'Last name is required']"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row v-if="accountType === 'staff'">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="firstName"
                    label="First Name"
                    required
                    :rules="[v => !!v || 'First name is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="middleName"
                    label="Middle Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="lastName"
                    label="Last Name"
                    required
                    :rules="[v => !!v || 'Last name is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="contactNumber"
                    label="Contact Number"
                    required
                    :rules="[v => !!v || 'Contact number is required']"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    required
                    :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="birthDate"
                    label="Birth Date"
                    type="date"
                    required
                    :rules="[v => !!v || 'Birth date is required']"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row v-if="accountType === 'patient'">
                <v-col cols="12">
                  <v-textarea
                    v-model="address"
                    label="Address"
                    required
                    :rules="[v => !!v || 'Address is required']"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="gender"
                    :items="genders"
                    label="Gender"
                    required
                    :rules="[v => !!v || 'Gender is required']"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-alert type="info" outlined>
                    <strong>Generated Credentials:</strong><br>
                    Username: {{ generatedUsername }}<br>
                    Password: {{ generatedPassword }}
                  </v-alert>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" @click="resetForm">Reset</v-btn>
            <v-btn color="primary" @click="createAccount" :loading="loading" :disabled="!valid">
              Create Account
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()

const form = ref(null)
const valid = ref(false)
const loading = ref(false)
const accountType = ref('')
const role = ref('')
const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const email = ref('')
const birthDate = ref('')
const address = ref('')
const gender = ref('')
const contactNumber = ref('')

const accountTypes = [
  { text: 'Patient', value: 'patient' },
  { text: 'Staff', value: 'staff' }
]

const roles = [
  { text: 'Nurse', value: 'nurse' },
  { text: 'Staff', value: 'staff' }
]

const genders = [
  { text: 'Male', value: 'male' },
  { text: 'Female', value: 'female' },
  { text: 'Other', value: 'other' }
]

const generatedUsername = computed(() => {
  if (firstName.value && lastName.value) {
    const baseUsername = `${firstName.value.toLowerCase()}.${lastName.value.toLowerCase()}`
    // In a real implementation, check for duplicates and append counter
    return baseUsername
  }
  return ''
})

const generatedPassword = computed(() => {
  if (birthDate.value) {
    const date = new Date(birthDate.value)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}-${day}-${year}`
  }
  return ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

watch([firstName, lastName, birthDate], () => {
  // Trigger reactivity for generated credentials
})

const resetForm = () => {
  form.value.reset()
  accountType.value = ''
  role.value = ''
  firstName.value = ''
  middleName.value = ''
  lastName.value = ''
  email.value = ''
  birthDate.value = ''
  address.value = ''
  gender.value = ''
  contactNumber.value = ''
}

const createAccount = async () => {
  if (!form.value.validate()) return

  loading.value = true
  try {
    const accountData = {
      accountType: accountType.value,
      role: role.value,
      firstName: firstName.value,
      middleName: middleName.value,
      lastName: lastName.value,
      email: email.value,
      birthDate: birthDate.value,
      address: address.value,
      gender: gender.value,
      contactNumber: contactNumber.value,
      username: generatedUsername.value,
      password: generatedPassword.value
    }

    await authStore.createAccount(accountData)

    snackbar.value = {
      show: true,
      message: 'Account created successfully! Credentials sent via email and SMS.',
      color: 'success'
    }

    resetForm()
  } catch (error) {
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to create account',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
