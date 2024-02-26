import variables from '@/styles/element-variables.scss'
import defaultSettings from '@/settings'

const { showSettings, tagsView, fixedHeader, sidebarLogo, title, logo } = defaultSettings

const state = {
  theme: variables.theme,
  showSettings: showSettings,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  title: title,
  logo: logo,
  showKey: 'isDev',
  viewCache: {
    'isDev': {
      name: '开发',
      disabled: false
    },
    'isDcs': {
      name: 'DCS',
      disabled: false
    },
    'isNcs': {
      name: 'NCS',
      disabled: true
    },
    'isJd': {
      name: '就地',
      disabled: false
    }
  },
  iconList: [
    { name: '计算器', disabled: false },
    { name: '考试模式', disabled: false },
    { name: '保存快照', disabled: false },
    { name: '加速', disabled: false },
    { name: '条件冻结', disabled: false },
    { name: '当前故障', disabled: false },
    { name: '故障总表', disabled: false },
    { name: '当前案例', disabled: false },
    { name: '操作记录', disabled: false },
    { name: '工况', disabled: false },
    { name: '快照列表', disabled: false },
    { name: '故障投入列表', disabled: false }
  ],
  isDev: true,
  isView: false
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (!Object.keys(value || {}).length) return
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      if (key === 'iconList') {
        let list = state.iconList
        for (let item of list) {
          if (!value.some((i) => { return i.name === item.name })) {
            value.push(item)
          }
        }
        state[key] = value
        return
      }
      state[key] = value
    }
  },
  CHANGE_DEV: (state, data) => {
    state.isDev = data
  },
  CHANGE_VIEW: (state, data) => {
    state.showKey = data
    for (let key in state.viewCache) {
      state.viewCache[key].show = (data === key)
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  changeDev({ commit }, data) {
    commit('CHANGE_DEV', data)
  },
  changeView({ commit }, data) {
    let name = data
    commit('CHANGE_VIEW', name)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

