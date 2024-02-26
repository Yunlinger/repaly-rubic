import request from '@/utils/request_rubik'
import { varGetDetail } from '@/api/rtdb'
import Vue from 'vue'
import store from '@/store'
import router from '@/router'
import { reconnect } from '@/utils/sub'

// Rtd 存实时数值
var Rtd = {}
// rtdb 缓存数据库内容
var RTDB = {}

// 需要获取值的新点
var newVars = {}

window.db = Rtd
window.RTDB = RTDB

export function resetRTDB() {
  Rtd = {}
  window.db = Rtd

  RTDB = {}
  window.RTDB = RTDB
}

export var getValueFromRubik = function(values) {
  return request({
    url: '/rtdb/getvalues',
    method: 'post',
    data: { values }
  })
}

var setValueToRubik = function(values, origin) {
  origin = origin || 'dcs'
  return request({
    url: '/rtdb/setvalues',
    method: 'post',
    data: { values, origin }
  })
}

var unSubValueFromRubik = function(values) {
  return request({
    url: '/rtdb/unsubvalues',
    method: 'post',
    data: { values }
  })
}

var isEmptyObject = function(obj) {
  if (!obj) {
    return true
  }
  for (let key in obj) {
    return false
  }
  return true
}

function subNewValues() {
  if (isEmptyObject(newVars)) {
    return
  }
  var newVarsCopy = { ... newVars }
  newVars = {}
  getValueFromRubik(newVarsCopy).then(res => {
    for (var name in res.values) {
      if (Rtd[name]) {
        Rtd[name].value = res.values[name]
        Rtd[name].rts = new Date()
        Rtd[name].alwaysPush = newVarsCopy[name] === 1024
      } else {
        Rtd[name] = {
          value: res.values[name],
          its: new Date(),
          rts: new Date(),
          uts: new Date(),
          alwaysPush: newVarsCopy[name] === 1024
        }
      }
    }
    Vue.prototype.$emit('global:rtdb', res)
  }).catch(err => {
    console.error(err)
  })
}

function removeUnusedValues() {
  let unUsedValues = {}
  let now = new Date()
  for (let name in Rtd) {
    let val = Rtd[name]
    // 没有接收时间戳
    if (!val.rts) {
      unUsedValues[name] = 0
      delete Rtd[name]
      continue
    }
    // 超过1小时没有刷新数据, (服务端订阅的数据至少1小时有一个推送)
    if (now - val.rts > 3650 * 1000) {
      unUsedValues[name] = 0
      delete Rtd[name]
      continue
    }
    // 总是推送的点, 跳过检查
    if (val.alwaysPush) {
      continue
    }
    // 没有使用时间戳
    if (!val.uts) {
      unUsedValues[name] = 0
      delete Rtd[name]
      continue
    }
    // 超过 5分钟 没有使用
    if (now - val.uts > 300 * 1000) {
      unUsedValues[name] = 0
      delete Rtd[name]
      continue
    }
  }
  if (isEmptyObject(unUsedValues)) {
    return
  }
  unSubValueFromRubik(unUsedValues).then(res => {
  }).catch(err => {
    console.error(err)
  })
}

setInterval(() => {
  subNewValues()
}, 200)

setInterval(() => {
  removeUnusedValues()
}, 1000 * 60)

// 服务端每个循环都推送一下 loop 值, 方便客户端判断数据是否在实时更新
// 这里检查 loop, 判断数据是否刷新
// 开发先停止查询
var lastRtdbLoop = null
function checkRtdbLoop() {
  if (router.app._route.fullPath.startsWith('/login') || !store.getters.project.project) return
  let rtdbLoop = getValue('system.rtdb.loop')
  if (lastRtdbLoop && rtdbLoop === lastRtdbLoop) {
    // 没有变化
    console.log('RTDB update failed, reconnet ...')
    reconnect()
  }
  lastRtdbLoop = rtdbLoop
}

setInterval(() => {
  checkRtdbLoop()
}, 4000)

export function getValue(name, origin) {
  if (typeof name !== 'string') {
    return 0
  }

  if (name.length === 0) {
    return 0
  }

  if (!Rtd[name]) {
    // 添加到新变量列表中
    // origin 用于标识变量用在什么地方, 如果是 1024, 则是画面中使用的变量
    newVars[name] = origin || 0
    if (origin === 1024) {
      Rtd[name] = {
        value: false,
        alwaysPush: true,
        its: new Date()
      }
    }
    return false
  } else {
    // 变量读取时间戳
    Rtd[name].uts = new Date()
    return Rtd[name].value
  }
}

export function setValue(name, value, origin) {
  if (typeof name !== 'string') {
    return
  }

  if (name.length === 0) {
    return
  }

  var values = {}
  values[name] = value || 0
  setValueToRubik(values, origin).then(() => {
  }).catch(() => {
  })

  console.log('setValue, var=', name, 'value=', value)
}

export function sendPulse(name, width, falling, origin) {
  origin = origin || 'dcs'
  width = width || 1000
  falling = falling || false

  console.log('sendPulse, var=', name, 'width=', width || 1000)

  return request({
    url: '/rtdb/pulse',
    method: 'post',
    data: { name, width, falling, origin }
  })
}

export function switchValue(name, origin) {
  console.log('switchValue, var=', name)
  origin = origin || 'dcs'
  return request({
    url: '/rtdb/switch',
    method: 'post',
    data: { name, origin }
  })
}

export function getPointAttr(name, attr) {
  if (typeof name !== 'string') {
    return ''
  }
  if (name === '') {
    return ''
  }

  if (attr === 'name') {
    return name
  }

  if (!attr || attr === 'value') {
    // 没有指定attr, 或者 attr 为 value 时, 获取实时值
    return getValue(name)
  } else if (!RTDB[name]) {
    RTDB[name] = {
      high: 100,
      low: 0
    }
    varGetDetail(name).then(res => {
      RTDB[name] = res
    }).catch(() => {
      delete RTDB[name]
    })
  } else {
    let point = RTDB[name]
    let value = point[attr]
    if (typeof value === 'undefined' && point.additionalProperty) {
      // 如果基本属性没有, 到附加属性里查找
      value = point.additionalProperty[attr]
    }
    if (typeof value === 'undefined') {
      if (attr === 'high' || attr === 'low') {
        return 0
      }
      return ''
    }
    return value
  }

  return ''
}

window.getValue = getValue
window.setValue = setValue
window.sendPulse = sendPulse
window.switchValue = switchValue
window.getPointAttr = getPointAttr
