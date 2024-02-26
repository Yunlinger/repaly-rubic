
const state = {
  project: '',
  setting: {}
}

const mutations = {
  SET_PROJECT: (state, config) => {
    state.project = config
  },
  SET_SETTING: (state, config) => {
    state.setting = config
  }
}

const actions = {
  setProject({ commit }, config) {
    commit('SET_PROJECT', config)
  },
  setSetting({ commit }, config) {
    commit('SET_SETTING', config)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
