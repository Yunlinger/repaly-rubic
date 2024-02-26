
const state = {
  answer_list: []
}

const mutations = {
  Record(state, data) {
    let id = data.id
    state.answer_list[id] = data
  }
}
const getters = {
  examGetters: (state) => (id) => {
    return state.answer_list[id]
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
