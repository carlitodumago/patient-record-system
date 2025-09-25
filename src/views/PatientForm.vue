// Use the standardizePatientDates utility to ensure consistent date formatting
const formattedPatient = standardizePatientDates(patientData); let savedPatient;
if (isEditing.value) { // Update existing patient via API savedPatient = await
patientService.updatePatient(patientId.value, formattedPatient); // Update store
only with actual database response store.commit('updatePatient', savedPatient);
// Add notification only for actual update addPatientNotification(store,
savedPatient, 'updated'); } else { // Create new patient via API const today =
new Date(); const newPatientData = { ...formattedPatient, lastVisit:
formatDate(today) }; savedPatient = await
patientService.createPatient(newPatientData); // Add to store only with actual
database response (includes real ID from database) store.commit('addPatient',
savedPatient); // Add notification only for actual creation
addPatientNotification(store, savedPatient, 'added'); } saveSuccess.value =
true; // Navigate back to patient list after success setTimeout(() => {
router.push('/patients'); }, 1500);
