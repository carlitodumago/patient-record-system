import { createStore } from 'vuex';
import auth from './modules/auth';
import patients from './modules/patients';
import notifications from './modules/notifications';
import admin from './modules/admin';

export default createStore({
  modules: {
    auth,
    patients,
    notifications,
    admin,
  },
});
