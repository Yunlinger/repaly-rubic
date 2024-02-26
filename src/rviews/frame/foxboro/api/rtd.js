// import { cp, varProxy } from '../config'
import * as api from '@/api/rtd'

const varProxy = {}

var Pulses = {}

export function getValue(name) {
  if (typeof name === 'number') {
    return name
  }
  return api.getValue(varProxy[name] || name, 0)
}

function sendValue(name, value) {
  return api.setValue(name, value)
}

export function setValue(name, value) {
  console.log('画面操作: ', name, value)
  let ackVar = null
  if (name.endsWith('.OUT')) {
    ackVar = name.replace(/\.OUT/g, '.OPACK')
    name = name.replace(/\.OUT/g, '.OP')
  } else if (name.endsWith('.PNT')) {
    ackVar = name.replace(/\.PNT/g, '.BOPACK')
    name = name.replace(/\.PNT/g, '.BOP')
  } else if (name.endsWith('.BIAS')) {
    ackVar = name.replace(/\.BIAS/g, '.BOPACK')
    name = name.replace(/\.BIAS/g, '.BOP')
  } else if (name.endsWith('.SPTARG')) {
    ackVar = name.replace(/\.SPTARG/g, '.SPACK')
    name = name.replace(/\.SPTARG/g, '.SP')
  } else if (name.endsWith('.SPT')) {
    ackVar = name.replace(/\.SPT/g, '.SPACK')
    name = name.replace(/\.SPT/g, '.SP')
  } else if (name.endsWith('.MA')) {
    if (value) {
      // auto
      ackVar = name.replace(/\.MA/g, '.AUTSW')
    } else {
      ackVar = name.replace(/\.MA/g, '.MANSW')
    }
    name = ''
  }
  if (name) {
    console.log('实际发送: ', name, value)
    sendValue(name, value)
  }
  if (ackVar) {
    sendPulse(ackVar, 300)
  }
}

export function replacePulseVar(name) {
  name = name.replace(/\.SPTARG\.I/g, '.SI')
  name = name.replace(/\.SPTARG\.QI/g, '.SQI')
  name = name.replace(/\.SPTARG\.D/g, '.SD')
  name = name.replace(/\.SPTARG\.QD/g, '.SQD')
  name = name.replace(/\.SPT\.I/g, '.SI')
  name = name.replace(/\.SPT\.QI/g, '.SQI')
  name = name.replace(/\.SPT\.D/g, '.SD')
  name = name.replace(/\.SPT\.QD/g, '.SQD')
  name = name.replace(/\.OUT\.I/g, '.OI')
  name = name.replace(/\.OUT\.QI/g, '.OQI')
  name = name.replace(/\.OUT\.D/g, '.OD')
  name = name.replace(/\.OUT\.QD/g, '.OQD')
  name = name.replace(/\.PNT\.I/g, '.BOI')
  name = name.replace(/\.PNT\.QI/g, '.BOQI')
  name = name.replace(/\.PNT\.D/g, '.BOD')
  name = name.replace(/\.PNT\.QD/g, '.BOQD')
  name = name.replace(/\.BIAS\.I/g, '.BOI')
  name = name.replace(/\.BIAS\.QI/g, '.BOQI')
  name = name.replace(/\.BIAS\.D/g, '.BOD')
  name = name.replace(/\.BIAS\.QD/g, '.BOQD')
  return name
}

export function sendPulse(name, value) {
  name = replacePulseVar(name)
  console.log('发送脉冲: ', name, value)
  sendValue(name, 1)
  if (Pulses[name]) {
    clearTimeout(Pulses[name])
    delete (Pulses[name])
  }
  const timer = setTimeout(() => {
    sendValue(name, 0)
    delete (Pulses[name])
  }, value)
  Pulses[name] = timer
}

function isNumber(val) {
  // 非负整数
  var regPosInt = / ^\d+$/
  // 负整数
  var regNegInt = /^\-[1-9][0-9]*$/
  // 非负浮点数
  var regPosFloat = /^\d+(\.\d+)?$/
  // 负浮点数
  var regNegFloat = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
  if (regPosInt.test(val) ||
    regNegInt.test(val) ||
    regPosFloat.test(val) ||
    regNegFloat.test(val)) {
    return true
  } else {
    return false
  }
}

export function getLocalString(varName) {
  var ret = ''
  if (!window.cp) {
    return ret
  }
  var s = varName.split('.')
  if (s[0] && s[1] && window.cp[s[0]]) {
    ret = window.cp[s[0]][s[1]] || ''
  }

  return ret
}

export function getLocalValue(varName) {
  var ret = ''
  if (!window.cp) {
    return ret
  }
  var s = varName.split('.')
  if (s[0] && s[1] && window.cp[s[0]]) {
    ret = window.cp[s[0]][s[1]] || ''
  }

  if (isNumber(ret)) {
    ret = parseFloat(ret)
  }
  return ret
}
