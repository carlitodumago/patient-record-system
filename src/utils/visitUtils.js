import { showToast } from './notificationUtils';

/**
 * Mark a visit as completed
 * @param {Object} store - Vuex store
 * @param {String} visitId - Visit ID
 * @param {Object} completion - Completion data
 * @returns {Boolean} - Whether the operation was successful
 */
export const markVisitAsCompleted = (store, visitId, completion = {}) => {
  try {
    // Find the visit in patients
    let foundVisit = null;
    let patient = null;
    
    // Search through all patients for the visit
    for (const p of store.state.patients) {
      if (p.visits) {
        const visit = p.visits.find(v => v.id === visitId);
        if (visit) {
          foundVisit = visit;
          patient = p;
          break;
        }
      }
    }
    
    if (!foundVisit || !patient) {
      console.error('Visit not found:', visitId);
      return false;
    }
    
    // Update the visit
    foundVisit.completed = true;
    foundVisit.completedDate = new Date();
    
    // Add completion data if provided
    if (completion) {
      if (completion.notes) foundVisit.completionNotes = completion.notes;
      if (completion.diagnosis) foundVisit.diagnosis = completion.diagnosis;
      if (completion.followUpNeeded !== undefined) foundVisit.followUpNeeded = completion.followUpNeeded;
      if (completion.followUpDate) foundVisit.followUpDate = completion.followUpDate;
      if (completion.prescriptions) foundVisit.prescriptions = completion.prescriptions;
    }
    
    // Save the updated patient
    store.commit('updatePatient', patient);
    
    // Show a toast notification
    showToast('Visit marked as completed!', { 
      type: 'success',
      duration: 3000,
      showOkButton: true
    });
    
    return true;
  } catch (error) {
    console.error('Error marking visit as completed:', error);
    return false;
  }
}; 