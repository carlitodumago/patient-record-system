export default {
  state: {
    patients: [],
    currentPatient: null,
  },
  mutations: {
    setPatients(state, patients) {
      state.patients = patients;
    },
    addPatient(state, patient) {
      state.patients.push(patient);
    },
    updatePatient(state, patient) {
      const index = state.patients.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        state.patients.splice(index, 1, patient);
      }
    },
    deletePatient(state, patientId) {
      state.patients = state.patients.filter(p => p.id !== patientId);
    },
    setCurrentPatient(state, patient) {
      state.currentPatient = patient;
    },
  },
  actions: {
    // Actions can be added here if needed
  },
  getters: {
    getPatientById: state => id => {
      return state.patients.find(p => p.id === id);
    },
  },
};
