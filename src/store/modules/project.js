import * as api from '@/api/model'
import Vue from 'vue'
import * as papi from '@/api/project'
import * as rapi from '@/api/res'
import { resetRTDB } from '@/api/rtd'
import Cookies from 'js-cookie'

const ProjectSettingKey = 'rubik-project-setting'

function get() {
  let buffer = Cookies.get(ProjectSettingKey)
  if (buffer) {
    return JSON.parse(buffer) || {}
  }

  return {}
}

function set(values) {
  values = values || {}
  let obj = get()
  obj = {
    ... obj,
    ... values
  }
  return Cookies.set(ProjectSettingKey, JSON.stringify(obj))
}

const project = {
  state: {
    project: get().project || '',
    model: get().model || '',
    id: get().id || '',
    sideActive: '1',
    // nodes  模型页面节点
    nodes: [],
    opendNodes: {},
    instances: {},
    selectedInst: {
      time: 0,
      remainTime: 0,
      running: false
    },
    time: 0,
    remainTime: 3600,
    running: false,
    opened: false,
    // 下发任务 选中的团队及模型
    selectedGroup: 0,
    selectedModel: 0,
    // groupOpened 记录当前打开的分组
    groupOpened: get().groupOpened || {},

    // 模型编辑相关配置
    // 不显示模块名
    editorHiddenBlockName: get().editorHiddenBlockName || false,
    editorHiddenLineValue: get().editorHiddenLineValue || false,
    // 记录穿梭框显示的数据
    cache: [],
    test: '',
    // 教练员台切换工程索引
    index: 0,
    // 主页面显示组件索引
    activeName: 0,
    dcsOpenCache: [],
    dcsOpenPath: '',
    dcsOpenIndex: 0,
    dcsKey: '',
    jdOpenCache: [],
    jdOpenPath: '',
    jdOpenIndex: 0,
    jdKey: '',
    forbid: true,
    // 导入模型时用到的中间值
    importModelConfig: {
      fromProject: '',
      fromModel: 'model',
      fromID: 'dev',
      fromPages: [],
      fromDir: 0,
      toDir: 0,
      importCpp: true,
      importIcon: true
    },
    // 当前工程加载的程度故障
    levelFault: {}
  },

  mutations: {
    SET_PMI: (state, { project, model, id }) => {
      state.project = project || ''
      state.model = model || ''
      state.id = id || ''
      let key = `/rubik_state/${state.project}/${state.model}/${state.id}/`
      if (state.instances[key]) {
        state.time = state.instances[key].time || 0
        state.running = state.instances[key].running || false
        state.remainTime = state.instances[key].remainTime || 0

        state.instances[key].time = state.instances[key].time || 0
        state.instances[key].running = state.instances[key].running || false
        state.instances[key].remainTime = state.instances[key].remainTime || 0
        state.selectedInst = state.instances[key]
      }
    },
    CLEAR_NODE: (state) => {
      state.nodes = []
    },
    PUSH_NODE: (state, node) => {
      state.nodes.push(node)
    },
    UPDATE_INST: (state, { name, inst }) => {
      let instances = state.instances || {}
      instances = { ... instances }
      instances[name] = { ...instances[name], ...inst }
      instances[name].time = instances[name].time || 0
      instances[name].running = instances[name].running || false
      instances[name].remainTime = instances[name].remainTime || 0
      state.instances = instances

      if (inst.project === state.project && inst.model === state.model && inst.id === state.id) {
        state.time = state.instances[name].time
        state.running = state.instances[name].running
        state.remainTime = state.instances[name].remainTime
        state.selectedInst = state.instances[name]
      }
      Vue.prototype.$emit(`global:store.updateInst`, state.instances[name])
    },
    DELETE_INST: (state, name) => {
      delete state.instances[name]
      Vue.prototype.$emit(`global:store.deleteInst`, name)
    },
    UPDATE_GROUP_OPENED: (state, { name, opened }) => {
      state.groupOpened[name] = opened
      set({ groupOpened: state.groupOpened })
    },
    SET_OPENED: (state, opened) => {
      state.opened = !!opened
    },
    SET_EDITOR_HIDDEN_BLOCK_NAME: (state, editorHiddenBlockName) => {
      state.editorHiddenBlockName = !!editorHiddenBlockName
      set({ editorHiddenBlockName: state.editorHiddenBlockName })
    },
    SET_EDITOR_HIDDEN_LINE_VALUE: (state, editorHiddenLineValue) => {
      state.editorHiddenLineValue = !!editorHiddenLineValue
      set({ editorHiddenLineValue: state.editorHiddenLineValue })
    },
    SET_SELECTEDGROUP: (state, obj) => {
      state.selectedGroup = obj.group
    },
    SET_SELECTEDMODEL: (state, obj) => {
      state.selectedModel = obj.model
    },
    Set_Index: (state, index) => {
      state.index = index
    },
    Set_Cache: (state, cache) => {
      state.cache = cache
    },
    Set_Index_NUM: (state, index) => {
      state.activeName = index
    },
    Clear: (state) => {
      state.project = ''
      state.model = ''
      state.id = ''
    },
    DCS_CACHE: (state, { cache, path, index, key }) => {
      state.dcsOpenCache = cache
      state.dcsOpenPath = path
      state.dcsOpenIndex = index
      state.dcsKey = key
    },
    JD_CACHE: (state, { cache, path, index, key }) => {
      state.jdOpenCache = cache
      state.jdOpenPath = path
      state.jdOpenIndex = index
      state.jdKey = key
    },
    SET_FORBID: (state, status) => {
      state.forbid = status
    },
    SET_IMPORT_MODEL_CONFIG: (state, c) => {
      state.importModelConfig = c
    },
    SET_FAULT: (state, { name, list }) => {
      Vue.set(state.levelFault, name, list)
    },
    CLEAR_FAULT: (state) => {
      state.levelFault = {}
    }
  },

  actions: {
    initProjectData({ commit, state, dispatch }) {
      if (!state.opened) {
        // 获取所有实例列表
        dispatch('getInstances')
        // 打开工程
        dispatch('openProject', {
          project: state.project,
          model: state.model,
          id: state.id,
          first: true
        })
      }
    },
    openProject({ commit, state, dispatch }, { project = '', model = '', id = '', first = false, forced = false }) {
      commit('SET_OPENED', true)
      return new Promise((resolve, reject) => {
        if (project === '') {
          commit('SET_PMI', { project: '', model: '', id: '' })
          return resolve()
        } else if (state.project !== project || state.model !== model || state.id !== id || first || forced) {
          // 获取可用工程, 确认当前用户可以打开这个工程
          papi.list().then((res) => {
            res.items = res.items || {}
            if (res.items[project] || forced) {
              // 打开模型时默认关闭所有页面
              return dispatch('tagsView/delOthersViews')
            } else {
              commit('SET_PMI', { project: '', model: '', id: '' })
              // Vue.prototype.$msg.error('没有权限打开工程 ' + project)
              return Promise.reject('没有权限打开工程 ' + project)
            }
          }).then(() => {
            commit('SET_PMI', { project, model, id })
            Vue.prototype.$emit('global:project.open', { project, model, id })
            commit('CLEAR_NODE')
            set({ project, model, id })
            dispatch('AlgClear')
            dispatch('AlgGetAll')
            return rapi.open('../model/setting.json')
          }).then(async(res) => {
            const { viewCache, iconList } = res
            let data = { key: 'viewCache', value: viewCache }
            let icon = { key: 'iconList', value: iconList }
            await dispatch('settings/changeSetting', data)
            await dispatch('settings/changeSetting', icon)
            resolve()
          }).catch(err => {
            reject(err)
          })
        } else {
          resolve()
        }
      })
    },
    getPageList({ commit, state, dispatch }, pid) {
      // 删除原有节点
      state.nodes.forEach((node) => {
        state.opendNodes[node.id] = node.open
      })
      api.pageList(pid).then(response => {
        response.nodes = response.nodes || {}
        state.nodes = state.nodes.filter((node) => {
          return ((node.pid !== pid) && pid)
        })
        for (const id in response.nodes) {
          const nd = response.nodes[id]
          state.nodes.push({
            id: id,
            pid: pid,
            name: `[${id}] ${nd.name}`,
            isParent: true,
            data: nd,
            open: state.opendNodes[id] || false
          })
          if (state.opendNodes[id]) {
            setTimeout(() => {
              dispatch('getPageList', id)
            }, 100)
          }
        }
        response.pages = response.pages || {}
        for (const name in response.pages) {
          const nd = response.pages[name]
          state.nodes.push({
            id: name,
            pid: pid,
            name: nd.name + (nd.desc ? (' [' + nd.desc + ']') : ''),
            isParent: false,
            data: nd
          })
        }
      }).catch(() => { })
    },
    openPageDir({ commit, state, dispatch }, { id, open }) {
      for (const nd of state.nodes) {
        if (nd.isParent && nd.id === id) {
          nd.open = !!open
          break
        }
      }
    },
    setSideActive({ commit, state, dispatch }, activeName) {
      state.sideActive = activeName
    },
    getInstances({ commit, state, dispatch }) {
      return papi.getServerList('Model').then(res => {
        // 处理接收数据
        if (res) {
          res.items = res.items || {}
          for (let name in res.items) {
            commit('UPDATE_INST', {
              name,
              inst: res.items[name]
            })
          }
        }
        return Promise.resolve()
      })
    },
    updateInst({ commit }, { name, inst }) {
      commit('UPDATE_INST', { name, inst })
    },
    deleteInst({ commit }, name) {
      commit('DELETE_INST', name)
    },
    updateGroupOpened({ commit }, { name, opened }) {
      commit('UPDATE_GROUP_OPENED', { name, opened })
    },
    hiddenBlockName({ commit }, hidden) {
      commit('SET_EDITOR_HIDDEN_BLOCK_NAME', hidden)
    },
    hiddenLineValue({ commit }, hidden) {
      commit('SET_EDITOR_HIDDEN_LINE_VALUE', hidden)
    },
    // 教练员站 学员站
    show_instances({ state, commit }, { project, model, id }) {
      commit('SET_PMI', { project, model, id })
      // 更换实例需要reset实时库 cookie也需要更新
      Vue.prototype.$emit('global:project.open', { project, model, id })
      resetRTDB()
      set({ project, model, id })
      return new Promise((resolve, reject) => {
        if (state.project) {
          resolve()
        } else {
          reject()
        }
      })
    },
    dcs_cache({ state, commit }, { path, key }) {
      var cache = state.dcsOpenCache || []
      let openIndex = state.dcsOpenIndex || 0
      let index
      if (path.indexOf('主菜单') !== -1) return
      if (key === 'go') {
        if (path === cache[openIndex + 1].path) {
          index = state.dcsOpenIndex + 1
        }
      } else if (key === 'back') {
        if (cache.length > 1 && path === cache[openIndex - 1].path) {
          index = state.dcsOpenIndex - 1
        }
      } else {
        let obj = { path: path }
        if (state.dcsKey === 'back' || state.dcsKey === 'go') {
          cache = cache.slice(0, state.dcsOpenIndex + 1)
        }
        cache.push(obj)
        index = cache.length - 1
      }
      commit('DCS_CACHE', { cache, path, index, key })
    },
    jd_cache({ state, commit }, { path, key }) {
      let cache = state.jdOpenCache
      let openIndex = state.jdOpenIndex
      let index
      if (key === 'go') {
        if (path === cache[openIndex + 1].path) {
          index = state.jdOpenIndex + 1
        }
      } else if (key === 'back') {
        if (cache.length > 1 && path === cache[openIndex - 1].path) {
          index = state.jdOpenIndex - 1
        }
      } else {
        let obj = { path: path }
        if (state.jdKey === 'back' || state.jdKey === 'go') {
          cache = cache.slice(0, state.jdOpenIndex + 1)
        }
        cache.push(obj)
        index = cache.length - 1
      }
      commit('JD_CACHE', { cache, path, index, key })
    },
    clear_cache({ commit }) {
      let cache = []
      let path = ''
      let index = 0
      let key = ''
      commit('DCS_CACHE', { cache, path, index, key })
      commit('JD_CACHE', { cache, path, index, key })
    },
    exportModel({ commit }, config) {
      commit('SET_IMPORT_MODEL_CONFIG', config)
    }
  }
}

export default project
