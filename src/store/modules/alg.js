import * as api from '@/api/alg'
import { buildNodeTemplate } from '../../utils/gojs'

const alg = {
  state: {
    tree: {},
    algs: {},
    bulks: {},
    nodeTemplate: {},
    showPath: 0, // 显示
    clipboard: {
      project: '',
      algs: {}
    }
  },

  mutations: {
    SET_ALG: (state, algs) => {
      // 删除模板
      for (const name in algs) {
        delete state.nodeTemplate[name]
      }
      // alg 缺省值处理
      for (const name in algs) {
        algs[name].in = algs[name].in || []
        algs[name].coef = algs[name].coef || []
        algs[name].out = algs[name].out || []

        for (const idx in algs[name].in) {
          algs[name].in[idx].connable = algs[name].in[idx].connable || false
          algs[name].in[idx].x = algs[name].in[idx].x || 0
          algs[name].in[idx].y = algs[name].in[idx].y || 0
          algs[name].in[idx].dir = algs[name].in[idx].dir || 0
        }
        for (const idx in algs[name].out) {
          algs[name].out[idx].connable = algs[name].out[idx].connable || false
          algs[name].out[idx].x = algs[name].out[idx].x || 0
          algs[name].out[idx].y = algs[name].out[idx].y || 0
          algs[name].out[idx].dir = algs[name].out[idx].dir || 0
        }
      }
      state.algs = { ...state.algs, ...algs }
    },
    SET_TREE: (state, tree) => {
      state.tree = { ...state.tree, ...tree }
    },
    SET_BULK: (state, bulks) => {
      state.bulks = { ...state.bulks, ...bulks }
    },
    SET_TEMP: (state, t) => {
      for (const name in t) {
        state.nodeTemplate[name] = t[name]
      }
    },
    CLEAR_ALG: (state) => {
      state.algs = {}
      state.tree = {}
      state.bulks = {}
      state.nodeTemplate = {}
    },
    SET_SHOWPATH: (state, p) => {
      state.showPath = p
    },
    SET_CLIPBOARD: (state, c) => {
      state.clipboard = c
    }
  },

  actions: {
    AlgClear({ commit }) {
      commit('CLEAR_ALG')
    },
    AlgGetOne({ commit }, name) {
      return new Promise((resolve, reject) => {
        api.getOne(name).then(res => {
          res.name = name
          var a = {}
          // 单独获取的图元, 设置 fetchAt 属性
          res.fetchAt = new Date()
          a[name] = res
          commit('SET_ALG', a)
          resolve(a)
        }).catch(err => {
          reject(err)
        })
      })
    },
    AlgGetAll({ commit, dispatch }) {
      api.getAll().then(res => {
        commit('CLEAR_ALG')
        commit('SET_ALG', res.algs)
        commit('SET_TREE', res.nodes)
        commit('SET_BULK', res.bulks || {})
      }).catch(err => {
        console.error(err)
      })
    },
    BuildNodeTemplate({ commit, state }, algsUsed) {
      return new Promise((resolve, reject) => {
        let t = {}
        for (let name in algsUsed) {
          if (!state.nodeTemplate[name]) {
            let a = state.algs[name]
            if (a) {
              a.name = name
              t[name] = buildNodeTemplate(a)
              algsUsed[name] = t[name]
            } else {
              reject('alg ' + name + ' is null')
              return
            }
          } else {
            algsUsed[name] = state.nodeTemplate[name]
          }
        }
        commit('SET_TEMP', t)
        resolve(algsUsed)
      })
    },
    SetShowPath({ commit }, p) {
      commit('SET_SHOWPATH', p)
    },
    copyAlgs({ commit }, clipboard) {
      commit('SET_CLIPBOARD', clipboard)
    }
  }
}

export default alg
