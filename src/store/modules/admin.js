export default {
  state: {
    users: [],
    stats: {},
  },
  mutations: {
    setUsers(state, users) {
      state.users = users;
    },
    setStats(state, stats) {
      state.stats = stats;
    },
  },
  actions: {
    // Actions can be added here if needed
  },
  getters: {
    // Getters can be added here if needed
  },
};
