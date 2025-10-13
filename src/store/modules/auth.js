export default {
  state: {
    user: null,
    isAuthenticated: false,
  },
  mutations: {
    setAuthenticated(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },
    setUser(state, user) {
      state.user = user;
    },
    addUser(state, user) {
      // For mock purposes, you might want to store users in state
      if (!state.users) state.users = [];
      state.users.push(user);
    },
  },
  actions: {
    login({ commit }, userData) {
      commit('setAuthenticated', true);
      commit('setUser', userData);
      localStorage.setItem('user', JSON.stringify(userData));
    },
    logout({ commit }) {
      commit('setAuthenticated', false);
      commit('setUser', null);
      localStorage.removeItem('user');
    },
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
  },
};
