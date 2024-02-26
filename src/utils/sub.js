import ReconnWebcoket from '@/utils/reconnWebsocket'
import { getToken } from '@/utils/auth'
import Vue from 'vue'
import store from '@/store'
import { MessageBox, Notification } from 'element-ui'
import { resetRTDB } from '@/api/rtd'

var conn = null

// 每隔 8s 发送一个空的 rtdb 消息, 部分画面刷新依赖这个消息.
setInterval(() => {
  Vue.prototype.$emit(`global:rtdb`, {})
}, 8000)

function onmessage(e) {
  let msg = JSON.parse(e.data)
  if (msg.topic === 'rtdb') {
    let count = 0
    for (let name in msg.data) {
      count = count + 1
      if (window.db[name]) {
        window.db[name].value = msg.data[name]
        window.db[name].rts = new Date()
      } else {
        window.db[name] = {
          value: msg.data[name],
          its: new Date(),
          rts: new Date(),
          alwaysPush: true
        }
      }
    }
  } else if (msg.topic === 'log') {
    if (msg.data.level === 'error') {
      Notification.error({
        title: '错误',
        message: msg.data.message
      })
    }
  } else if (msg.topic === 'instance.created' || msg.topic === 'instance.updated' || msg.topic === 'instance.attrUpdated') {
    store.dispatch('updateInst', {
      name: msg.data.key,
      inst: msg.data
    })
  } else if (msg.topic === 'instance.deleted') {
    store.dispatch('deleteInst', msg.data.key)
  } else if (msg.topic === 'connect.start') {
    // 新建连接
    store.dispatch('user/setConnect', msg.data)
  } else if (msg.topic === 'connect.stop') {
    // 终止连接
    store.dispatch('user/delConnect', msg.data)
  } else if (msg.topic === 'connect.change') {
    // 改变连接状态
    store.dispatch('user/setConnect', msg.data)
  } else if (msg.topic === 'public.case.dispatch') {
    // 有任务下发, 查看是否是当前用户的任务
    gotoCase(msg.data)
  } else if (msg.topic === 'ticker') {
    //
  } else if (msg.topic === 'event.new' || msg.topic === 'event.ack' || msg.topic === 'event.gone') {
    //
  } else {
    console.log(msg.topic, msg)
  }

  Vue.prototype.$emit(`global:${msg.topic}`, msg)
}

function gotoCase(data) {
  data.participants = data.participants || []
  if (data.participants.indexOf(store.getters.name) !== -1) {
    if (data.duname !== store.getters.name) {
      MessageBox.alert(`收到${data.duname}发来的任务: ${data.name}`, '提示', {
        type: 'warning', confirmButtonText: '进入'
      }).catch(() => {
      }).finally(() => {
        store.dispatch('openProject', {
          project: data.p,
          model: data.m,
          id: data.i
        })
      })
    } else {
      store.dispatch('openProject', {
        project: data.p,
        model: data.m,
        id: data.i
      })
    }
  }
}

export function connect() {
  let url = ''
  if (process.env.NODE_ENV === 'development') {
    if (process.env.VUE_APP_RUBIK_API.startsWith('https://')) {
      url = 'wss://' + process.env.VUE_APP_RUBIK_API.substring('https://'.length) + '/conn/ws?token=' + getToken()
    } else {
      url = 'ws://' + process.env.VUE_APP_RUBIK_API.substring('http://'.length) + '/conn/ws?token=' + getToken()
    }
  } else {
    let protocol = 'ws:'
    if (window.location.protocol === 'https:') {
      protocol = 'wss:'
    }
    url = protocol + '//' + window.location.host + process.env.VUE_APP_RUBIK_API + '/conn/ws?token=' + getToken()
  }
  conn = new ReconnWebcoket({
    url: url
  })
  conn.onopen = function() {
    Notification.success({
      title: '提示',
      message: '与平台连接成功!'
    })
    Vue.prototype.$emit(`global:websocket.open`)
  }
  conn.onclose = function(e) {
    Notification.warning({
      title: '警告',
      message: '与平台连接中断, 请谨慎操作'
    })
    Vue.prototype.$emit(`global:websocket.close`, e)
  }
  conn.onreconnect = function() {
    // console.log('websocket reconnecting...')
  }
  conn.onerror = function(e) {
    // console.log(`websocket error: ${e}`)
  }

  conn.onmessage = onmessage
}

export function disconnect() {
  if (conn && typeof conn.close === 'function') {
    conn.close()
  }
}

export function reconnect() {
  disconnect()
  connect()
}

export function sub(topic, includeInstInfo) {
  if (conn) {
    let data = {
      topic: topic,
      oper: 'sub',
      inst: !!includeInstInfo,
      'p': store.getters.project.project,
      'm': store.getters.project.model,
      'i': store.getters.project.id
    }
    let str = JSON.stringify(data)
    conn.send(str)
  }
}

export function unsub(topic) {
  if (conn) {
    let str = JSON.stringify({
      topic: topic,
      oper: 'unsub'
    })
    conn.send(str)
  }
}

// 订阅所有需要的消息
export function subAllWhenEventCommit(vm) {
  if (!vm || !vm.$on) {
    return
  }
  // 订阅消息
  vm.$on('global:websocket.open', () => {
    // 全局消息主题
    sub('connect.>')
    sub('instance.created')
    sub('instance.attrUpdated')
    sub('instance.deleted')
    sub('log')
    sub('public.>')
    sub('ticker')
    sub('alg.build.log')

    // 实例主题
    sub('rtdb', true)
    sub('log', true)
    sub('case.>', true)
    sub('event.>', true)
    resetRTDB()
  })
  vm.$on('global:websocket.close', () => {
    resetRTDB()
  })
  vm.$on('global:project.open', () => {
    sub('rtdb', true)
    sub('log', true)
    sub('case.>', true)
    sub('event.>', true)
    resetRTDB()
  })
}

