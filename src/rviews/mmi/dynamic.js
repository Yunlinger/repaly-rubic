import * as rapi from '@/api/rtd'
import * as rtdbapi from '@/api/rtdb'
import fabric from '@/canvas'
import Dialog from './components/dialog'
import msg from '@/utils/message'
import _ from 'lodash'

// 获取值
fabric.Object.prototype.getValue = function(name) {
  if (typeof name === 'number') {
    return name
  }

  if (typeof name !== 'string') {
    return 0
  }

  return rapi.getValue(name, 1024)
}

// 异步取值
fabric.Object.prototype.asyncGetValue = function(name) {
  let value = this.getValue(name)
  if (value !== false) {
    return value
  }
  // 点表中没有这个点
  let vars = {}
  vars[name] = 0
  return new Promise((resolve) => {
    rapi.getValueFromRubik(vars).then(res => {
      res = res || {}
      res.values = res.values || {}
      resolve(res.values[name] || 0)
    }).catch(() => {
      resolve(0)
    })
  })
}

fabric.Object.prototype.getPointAttr = function(name, attr) {
  return rapi.getPointAttr(name, attr)
}

// 设定值
fabric.Object.prototype.setValue = function(name, value) {
  console.log('setValue, var=', name, 'value=', value)
  rapi.setValue(name, value)
}

// 获取本地值
fabric.Object.prototype.getLocalValue = function(name) {
  this.canvas.localVars = this.canvas.localVars || {}
  let value = this.canvas.localVars[name]
  if (typeof value === 'string') {
    return value
  }
  return value || 0
}

// 设定本地值
fabric.Object.prototype.setLocalValue = function(name, value) {
  this.canvas.localVars = this.canvas.localVars || {}
  if (name instanceof RegExp) {
    for (let key in this.canvas.localVars) {
      if (typeof key === 'string' && key.match(name)) {
        console.log('setLocalValue, var=', key, 'value=', value)
        this.canvas.localVars[key] = value
      }
    }
  } else {
    console.log('setLocalValue, var=', name, 'value=', value)
    this.canvas.localVars[name] = value
  }

  // 设置本地变量后刷新一下
  this.canvas.localVarChanged = true

  return this
}

function getGlobalValue(name) {
  if (window) {
    window.globalVars = window.globalVars || {}
    let value = window.globalVars[name]
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'undefined') {
      window.globalVars[name] = 0
    }
    return value || 0
  }
  return 0
}

// 获取全局变量
fabric.Object.prototype.getGlobalValue = getGlobalValue

function setGlobalValue(name, value) {
  if (window) {
    window.globalVars = window.globalVars || {}
    if (name instanceof RegExp) {
      for (let key in window.globalVars) {
        if (typeof key === 'string' && key.match(name)) {
          console.log('setGlobalValue, var=', key, 'value=', value)
          window.globalVars[key] = value
        }
      }
    } else {
      console.log('setGlobalValue, var=', name, 'value=', value)
      window.globalVars[name] = value
    }
  }

  // 设置本地变量后刷新一下
  if (this.canvas) {
    this.canvas.localVarChanged = true
  } else {
    this.localVarChanged = true
  }
}

// 设定全局变量
fabric.Object.prototype.setGlobalValue = setGlobalValue

// 脉冲
fabric.Object.prototype.sendPulse = function(name, value) {
  rapi.sendPulse(name, value)
}

// 脉冲
fabric.Object.prototype.switchValue = function(name, origin) {
  rapi.switchValue(name, origin)
}

// 模拟量显示
fabric.Object.prototype.showValue = function(name, precision) {
  precision = precision || 0
  return this.getValue(name, 1024).toFixed(precision)
}

// 获取值
fabric.StaticCanvas.prototype.getValue = function(name) {
  if (typeof name === 'number') {
    return name
  }

  if (typeof name !== 'string') {
    return 0
  }

  return rapi.getValue(name, 1024)
}

// 异步取值
fabric.StaticCanvas.prototype.asyncGetValue = function(name) {
  let value = this.getValue(name)
  if (value !== false) {
    return value
  }
  // 点表中没有这个点
  let vars = {}
  vars[name] = 0
  return new Promise((resolve) => {
    rapi.getValueFromRubik(vars).then(res => {
      res = res || {}
      res.values = res.values || {}
      resolve(res.values[name] || 0)
    }).catch(() => {
      resolve(0)
    })
  })
}

fabric.StaticCanvas.prototype.getPointAttr = function(name, attr) {
  return rapi.getPointAttr(name, attr)
}

// 设定值
fabric.StaticCanvas.prototype.setValue = function(name, value) {
  console.log('setValue, var=', name, 'value=', value)
  rapi.setValue(name, value)
}

// 获取本地值
fabric.StaticCanvas.prototype.getLocalValue = function(name) {
  this.localVars = this.localVars || {}
  let value = this.localVars[name]
  if (typeof value === 'string') {
    return value
  }
  return value || 0
}

// 设定本地值
fabric.StaticCanvas.prototype.setLocalValue = function(name, value) {
  this.localVars = this.localVars || {}
  if (name instanceof RegExp) {
    for (let key in this.localVars) {
      if (typeof key === 'string' && key.match(name)) {
        console.log('setLocalValue, var=', key, 'value=', value)
        this.localVars[key] = value
      }
    }
  } else {
    console.log('setLocalValue, var=', name, 'value=', value)
    this.localVars[name] = value
  }

  this.localVarChanged = true
}

// 获取全局变量
fabric.StaticCanvas.prototype.getGlobalValue = getGlobalValue

// 设定全局变量
fabric.StaticCanvas.prototype.setGlobalValue = setGlobalValue

// 脉冲
fabric.StaticCanvas.prototype.sendPulse = function(name, value) {
  rapi.sendPulse(name, value)
}

// 脉冲
fabric.StaticCanvas.prototype.switchValue = function(name, origin) {
  rapi.switchValue(name, origin)
}

// 数字量动态
fabric.Object.prototype.dynBool = function(name, trueValue, falseValue, loop) {
  var value = this.getValue(name, true) ? trueValue : falseValue

  if (typeof value === 'object') {
    return loop % 2 ? value.blink : value.value
  } else {
    return value
  }
}

// 模拟量动态
/*
 values: {
     0: {value}
 }
*/
fabric.Object.prototype.dynAnalog = function(name, values, defaultValue, loop) {
  var value = (values && values[this.getValue(name)]) || defaultValue

  if (typeof value === 'object') {
    return loop % 2 ? value.blink : value.value
  } else {
    return value
  }
}

// 阈值动态
/*
thresholds :
[
    {threshold: 0, value: "#f00"}
]
*/

fabric.Object.prototype.dynThreshold = function(name, thresholds, defaultValue, loop) {
  var value = this.getValue(name)

  var ret = defaultValue

  thresholds = thresholds || []
  if (thresholds.length >= 1) {
    if (value < thresholds[0].threshold) {
      ret = defaultValue
    } else if (value >= thresholds[thresholds.length - 1].threshold) {
      ret = thresholds[thresholds.length - 1].value
    } else {
      for (var i = 0; i < thresholds.length - 1; i++) {
        if (value >= thresholds[i].threshold && value < thresholds[i + 1].threshold) {
          ret = thresholds[i].value
          break
        }
      }
    }
  }

  if (typeof ret === 'object') {
    return loop % 2 ? ret.blink : ret.value
  } else {
    return ret
  }
}

// 阈值动态, 比较符号
/*
thresholds :
[
    {threshold: 0, op: ">", value: "#f00"}
]
*/

fabric.Object.prototype.dynOpThreshold = function(name, thresholds, defaultValue, loop) {
  var value = this.getValue(name)

  var ret = null

  thresholds = thresholds || []
  for (var i = 0; i < thresholds.length; i++) {
    switch (thresholds[i].op) {
      default:
        break
      case '=':
        if (value === thresholds[i].threshold) {
          ret = thresholds[i].value
        }
        break
      case '>':
        if (value > thresholds[i].threshold) {
          ret = thresholds[i].value
        }
        break
      case '>=':
        if (value >= thresholds[i].threshold) {
          ret = thresholds[i].value
        }
        break
      case '<':
        if (value < thresholds[i].threshold) {
          ret = thresholds[i].value
        }
        break
      case '<=':
        if (value <= thresholds[i].threshold) {
          ret = thresholds[i].value
        }
        break
      case '!=':
        if (value !== thresholds[i].threshold) {
          ret = thresholds[i].value
        }
        break
    }
    if (ret) {
      break
    }
  }

  if (!ret) {
    ret = defaultValue
  }

  if (typeof ret === 'object') {
    return loop % 2 ? ret.blink : ret.value
  } else {
    return ret
  }
}

// 位动态
/*
 values: [
     {mask: 0x0000ffff, match: 0x00000001, all: true, value: "#f00"},
     {mask: 0x0000ffff, match: 0x00000002, all: false, value: "#0f0"}
    ]
*/
fabric.Object.prototype.dynBit = function(name, values, defaultValue, loop) {
  if (typeof values !== 'object') {
    return defaultValue
  }

  var value = this.getValue(name)

  for (var i = 0; i < values.length; i++) {
    const mask = values[i].mask || 0xffffffff
    let get = false
    if (values[i].all) {
      if ((value & mask) === (values[i].match & mask)) {
        get = true
      }
    } else {
      if (value & mask & values[i].match) {
        get = true
      }
    }
    if (get) {
      value = values[i].value

      if (typeof value === 'object') {
        return loop % 2 ? value.blink : value.value
      } else {
        return value
      }
    }
  }

  return defaultValue
}

// 标准化、归一化
fabric.Object.prototype.dynNormalize = function(name, high, low) {
  var value = this.getValue(name)
  if (high <= low) {
    high = low + 100
  }
  value = Math.min(value, high)
  value = Math.max(value, low)

  return (value - low) / (high - low)
}

fabric.Object.prototype.inputInBox = function(option) {
  option = option || {}
  return new Promise((resolve, reject) => {
    if (!this.canvas.inputBox) {
      reject('no inputBox')
      return
    }
    let inputBox = this.canvas.inputBox
    // 设置 inputbox 位置
    let style = {}
    if (!this.canvas.running) {
      style['display'] = 'none'
    }
    let vpt = this.getViewportTransform()
    let matrix = this.calcTransformMatrix()
    matrix = fabric.util.multiplyTransformMatrices(vpt, matrix)
    let lt = fabric.util.transformPoint(new fabric.Point(0 - this.width / 2, 0 - this.height / 2), matrix, false)
    let opt = fabric.util.qrDecompose(matrix)

    style['pointer-events'] = 'all'
    style['position'] = 'absolute'
    style['left'] = `${lt.x}px`
    style['top'] = `${lt.y}px`
    style['width'] = `${this.width * opt.scaleX}px`
    style['height'] = `${this.height * opt.scaleY}px`

    let cssText = ''
    for (let k in style) {
      cssText += `${k}: ${style[k]};`
    }

    let cssDisvisible = 'display: none;'

    inputBox.value = option.local ? this.getLocalValue(option.name) : (this.getValue(option.name, 1024) || 0)
    inputBox.style.cssText = cssText
    setTimeout(() => {
      inputBox.select()
      inputBox.focus()
    }, 10)

    inputBox.onkeyup = (e) => {
      // enter, 确认输入
      if (e.keyCode === 13) {
        inputBox.style.cssText = cssDisvisible
        resolve({
          value: inputBox.value
        })
      }

      // 本地变量并且同步更新值
      if (option.local && option.syncValue) {
        let value = e.target.value
        if (!option.isString) {
          value = parseFloat(value)
        }
        this.setLocalValue(option.name, value)
      }
    }

    inputBox.onblur = (e) => {
      // 失去焦点
      inputBox.style.cssText = cssDisvisible
      reject('cancel')
    }
  })
}

fabric.Object.prototype.inputValue = function(option, event) {
  if (typeof option === 'string') {
    option = { name: option }
  }
  option = option || {}

  // 获取变量描述信息
  new Promise((resolve) => {
    rtdbapi.varGetDetail(option.name).then(detail => {
      resolve(detail || {})
    }).catch(() => {
      resolve({})
    })
  }).then(detail => {
    if (option.inputBox) {
      return this.inputInBox(option)
    }
    return msg.inputNum(`${rapi.getValue(option.name, 1024) || 0}`, `请设定: ${detail.desc || option.name}`, '', event)
  }).then(({ value }) => {
    value = value.trim()
    if (value.length <= 0) {
      return Promise.reject('invlalid input')
    }
    value = parseFloat(value)
    rapi.setValue(option.name, value)
  }).catch(err => {
    if (err !== 'cancel') {
      msg.error(err)
    }
  })
}

fabric.Object.prototype.inputLocalValue = function(option, event) {
  if (typeof option === 'string') {
    option = { name: option }
  }
  option = option || {}

  // 同步更新本地值, 在 inputInBox 里面处理
  if (option.local && option.syncValue) {
    this.inputInBox(option)
    return
  }

  // 获取变量描述信息
  new Promise((resolve) => {
    resolve({})
  }).then(detail => {
    if (option.inputBox) {
      return this.inputInBox(option)
    }
    return msg.input(`当前值: ${this.getLocalValue(option.name) || 0}`, `请设定: ${detail.desc || option.name}`, '', event)
  }).then(({ value }) => {
    value = value.trim()
    if (value.length <= 0) {
      return Promise.reject('invlalid input')
    }
    if (!option.isString) {
      value = parseFloat(value)
    }
    this.setLocalValue(option.name, value)
  }).catch(err => {
    if (err !== 'cancel') {
      msg.error(err)
    }
  })
}

// 打开面板
fabric.Object.prototype.openPad = function(name, param, event) {
  Dialog.open(name, param || {}, event)
}

// 切换画面, 防抖处理, 1s 只能调用一次.
fabric.Object.prototype.openWindow = _.debounce(
  function(name, param, event, key = {}) {
    let canvas = this.canvas
    if (!canvas) {
      msg.error(`nil canvas`, '切换画面错误')
      return
    }
    if (canvas.openingWindow) {
      // 如果正在打开画面, 直接退出
      return
    }

    // 先退出所有弹板
    Dialog.closeAll()

    canvas.setCursor('wait')
    canvas.openingWindow = true
    canvas.open(name, {}).then(() => {
      canvas.initDynamic()
      canvas.initTimer()
      canvas.running = true
      // 打开后立即计算动态
      canvas._calcDynamic()
    }).catch((err) => {
      msg.error(`FileName: ${name}, ${err}`, '切换画面错误')
      console.log(err)
    }).finally(() => {
      canvas.openingWindow = false
      canvas.setCursor('default')
    })
  }, 200, { leading: true, trailing: false }
)

fabric.Object.prototype.closeSelf = function() {
  Dialog.close(this.canvas.name)
}

fabric.Object.prototype.closeDialog = function(name) {
  Dialog.close(name)
}

fabric.Object.prototype.iaDynFColor = function(color) {
  if (this.isText) {
    if (this.backgroundColor) {
      return this.set('backgroundColor', color)
    }
    return this
  }
  if (this.fill) {
    return this.set('fill', color)
  }
  return this
}

fabric.Group.prototype.iaDynFColor = function(color) {
  this.forEachObject(function(obj) {
    obj.iaDynFColor(color)
  })

  return this
}

fabric.Object.prototype.iaDynEColor = function(color) {
  if (this.isText) {
    return this
  }
  if (this.stroke) {
    return this.set('stroke', color)
  }
  return this
}

fabric.Group.prototype.iaDynEColor = function(color) {
  this.forEachObject(function(obj) {
    obj.iaDynEColor(color)
  })

  return this
}

fabric.Text.prototype.iaDynTColor = function(color) {
  if (this.fill) {
    return this.set('fill', color)
  }
  return this
}

// sleep
fabric.StaticCanvas.prototype.sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
