import { getValue } from '../api/rtd'
import store from '@/store'

const cp = {}
export var processAlarms = {}

for (const key in cp) {
  if (cp[key].Type === '$CIN_S') {
    if (cp[key].SAO === '1') {
      processAlarms[key] = cp[key]
    }
  } else if (cp[key].Type === '$AIN_S') {
    if (cp[key].HLOP !== '0' || cp[key].HHAOPT !== '0') {
      processAlarms[key] = cp[key]
    }
  }
}

function calcStateAlarm(key) {
  const value = getValue(key + '.CIN')
  if (value === processAlarms[key].oldValue) {
    return
  }
  processAlarms[key].oldValue = value
  if (value) {
    store.dispatch('insertAlarm', {
      key: key + '@STATE',
      alm: {
        [key + '@STATE']: {
          ts: (new Date()).toLocaleString(),
          ack: false,
          active: true,
          type: 'STATE',
          name: key,
          pri: processAlarms[key].SAP,
          desc: processAlarms[key].DESCRP,
          value: 'ON',
          limit: 'ON',
          unit: ' '
        }
      }
    })
  } else {
    store.dispatch('deActiveAlarm', key + '@STATE')
  }
}

function calcHiAlarm(key) {
  const value = getValue(key + '.PNT')
  if (value === processAlarms[key].oldValue) {
    return
  }
  processAlarms[key].oldValue = value
  if (value >= (processAlarms[key].HAL - 0)) {
    store.dispatch('insertAlarm', {
      key: key + '@H',
      alm: {
        [key + '@H']: {
          ts: (new Date()).toLocaleString(),
          ack: false,
          active: true,
          type: 'HIALM',
          name: key,
          pri: processAlarms[key].HLPR,
          desc: processAlarms[key].DESCRP,
          value: value,
          limit: processAlarms[key].HAL,
          unit: processAlarms[key].EO1
        }
      }
    })
  } else {
    store.dispatch('deActiveAlarm', key + '@H')
  }
}

function calcLoAlarm(key) {
  const value = getValue(key + '.PNT')
  if (value === processAlarms[key].oldValue) {
    return
  }
  processAlarms[key].oldValue = value
  if (value <= (processAlarms[key].LAL - 0)) {
    store.dispatch('insertAlarm', {
      key: key + '@L',
      alm: {
        [key + '@L']: {
          ts: (new Date()).toLocaleString(),
          ack: false,
          active: true,
          type: 'LOALM',
          name: key,
          pri: processAlarms[key].HLPR,
          desc: processAlarms[key].DESCRP,
          value: value,
          limit: processAlarms[key].LAL,
          unit: processAlarms[key].EO1
        }
      }
    })
  } else {
    store.dispatch('deActiveAlarm', key + '@L')
  }
}

function calcHHAlarm(key) {
  const value = getValue(key + '.PNT')
  if (value === processAlarms[key].oldValue) {
    return
  }
  processAlarms[key].oldValue = value
  if (value >= (processAlarms[key].HHALIM - 0)) {
    store.dispatch('insertAlarm', {
      key: key + '@HH',
      alm: {
        [key + '@HH']: {
          ts: (new Date()).toLocaleString(),
          ack: false,
          active: true,
          type: 'HHALM',
          name: key,
          pri: processAlarms[key].HHAPRI,
          desc: processAlarms[key].DESCRP,
          value: value,
          limit: processAlarms[key].HHALIM,
          unit: processAlarms[key].EO1
        }
      }
    })
  } else {
    store.dispatch('deActiveAlarm', key + '@HH')
  }
}

function calcLLAlarm(key) {
  const value = getValue(key + '.PNT')
  if (value === processAlarms[key].oldValue) {
    return
  }
  processAlarms[key].oldValue = value
  if (value <= (processAlarms[key].LLALIM - 0)) {
    store.dispatch('insertAlarm', {
      key: key + '@LL',
      alm: {
        [key + '@LL']: {
          ts: (new Date()).toLocaleString(),
          ack: false,
          active: true,
          type: 'LLALM',
          name: key,
          pri: processAlarms[key].HHAPRI,
          desc: processAlarms[key].DESCRP,
          value: value,
          limit: processAlarms[key].LLALIM,
          unit: processAlarms[key].EO1
        }
      }
    })
  } else {
    store.dispatch('deActiveAlarm', key + '@LL')
  }
}

export var calcAlarm = function() {
  for (const key in processAlarms) {
    if (processAlarms[key].Type === '$CIN_S') {
      calcStateAlarm(key)
    } else {
      if (processAlarms[key].HLOP === '1' || processAlarms[key].HLOP === '2') {
        calcHiAlarm(key)
      }
      if (processAlarms[key].HLOP === '1' || processAlarms[key].HLOP === '3') {
        calcLoAlarm(key)
      }
      if (processAlarms[key].HHAOPT === '1' || processAlarms[key].HHAOPT === '2') {
        calcHHAlarm(key)
      }
      if (processAlarms[key].HHAOPT === '1' || processAlarms[key].HHAOPT === '3') {
        calcLLAlarm(key)
      }
    }
  }
}

// 屏蔽报警功能
// setInterval(() => {
//   calcAlarm()
// }, 1000)
