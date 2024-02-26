import Vue from 'vue'
import { login, ssologin, logout, getInfo, clients } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { reconnect, disconnect } from '@/utils/sub'

const state = {
  id: '',
  token: '',
  name: '',
  cname: '',
  avatar: '',
  introduction: '',
  email: '',
  mobile: '',
  roles: [],
  connects: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    if (token) {
      setToken(token)
    } else {
      removeToken()
    }
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_CNAME: (state, cname) => {
    state.cname = cname
  },
  SET_MOBILE: (state, mobile) => {
    state.mobile = mobile
  },
  SET_CONNECT: (state, conn) => {
    Vue.set(state.connects, conn.id, conn)
    // state.connects[conn.id] = conn
  },
  DEL_CONNECT: (state, conn) => {
    // delete state.connects[conn.id]
    Vue.delete(state.connects, conn.id)
  },
  INIT_CONNECT: (state, conns) => {
    state.connects = conns
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const data = response
        commit('SET_TOKEN', data.token)
        // 登录成功后重启 ws 连接
        reconnect()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  ssologin({ commit }, userInfo) {
    const { appid, account, token } = userInfo
    return new Promise((resolve, reject) => {
      ssologin(appid, account, token).then(response => {
        const data = response
        commit('SET_TOKEN', data.token)
        // 登录成功后重启 ws 连接
        reconnect()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      let tokenPromise
      if (state.token) {
        tokenPromise = Promise.resolve(state.token)
      } else {
        // 使用本地暂存的 token 登录.
        let token = getToken()
        tokenPromise = login({ token: token }).then(response => {
          commit('SET_TOKEN', response.token)
          // 登录成功后重启 ws 连接
          reconnect()
        })
      }
      tokenPromise.then(() => {
        return getInfo(state.token)
      }).then(response => {
        const data = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { id, roles, name, avatar, introduction, email, cname, mobile } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ID', id)
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_EMAIL', email)
        commit('SET_CNAME', cname)
        commit('SET_MOBILE', mobile)

        // 获取客户端连接列表
        commit('INIT_CONNECT', {})
        clients().then(res => {
          if (res) {
            commit('INIT_CONNECT', res)
          }
        }).catch(err => {
          console.error(err)
        })

        // 初始化工程数据
        dispatch('initProjectData', {}, { root: true })

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    // let roles = state.roles
    // if (roles.length === 1 && roles.includes('student')) {
    //   dispatch('clearStuIns', state, { root: true })
    // }
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })
        disconnect()
        resolve()
      }).catch(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        resetRouter()
        disconnect()
        resolve()
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      resolve()
    })
  },

  // setToken
  setToken({ commit, dispatch }, token) {
    return new Promise(resolve => {
      commit('SET_TOKEN', token)
      // 重启 ws 连接
      reconnect()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  },

  // Set conn
  setConnect({ commit }, conn) {
    let c = {
      ... conn
    }
    commit('SET_CONNECT', c)
  },

  // Del conn
  delConnect({ commit }, conn) {
    let c = {
      ...conn
    }
    commit('DEL_CONNECT', c)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
