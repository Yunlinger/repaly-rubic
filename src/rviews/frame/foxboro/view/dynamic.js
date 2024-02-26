/* eslint-disable */
import * as rapi from '../api/rtd'
import fabric from './canvas'
import Dialog from './components/dialog'

// 获取值
fabric.Object.prototype.getValue = function(name) {
  return rapi.getValue(name)
}

fabric.Object.prototype.getLocalValue = function(name) {
  return rapi.getLocalValue(name)
}

fabric.Object.prototype.getLocalString = function(name) {
  return rapi.getLocalString(name)
}

// 设定值
fabric.Object.prototype.setValue = function(name, value) {
  rapi.setValue(name, value)
}

// 脉冲
fabric.Object.prototype.sendPulse = function(name, value) {
  rapi.sendPulse(name, value)
}

// 切换
fabric.Object.prototype.toggleValue = function(name) {
  this.setValue(name, 1 - (this.getValue(name) ? 1 : 0))
}

// 模拟量显示
fabric.Object.prototype.showValue = function(name, precision) {
  var value = this.getValue(name) || 0
  const log = Math.log10(Math.abs(value))
  if (log < 0) {
    return value.toFixed(Math.max(precision - 1, 0))
  }
  var _precision = Math.max(precision, log + 1.00003)
  return value.toPrecision(_precision)
}

// 数字量动态
fabric.Object.prototype.dynBool = function(name, trueValue, falseValue) {
  var value = this.getValue(name, true) ? trueValue : falseValue

  return value
}

// 模拟量动态
/*
 values: {
     0: {value}
 }
*/
fabric.Object.prototype.dynAnalog = function(name, values, defaultValue) {
  var value = (values && values[this.getValue(name)]) || defaultValue

  return value
}

// 阈值动态
/*
thresholds :
[
    {threshold: 0, value: "#f00"}
]
*/

fabric.Object.prototype.dynThreshold = function(name, thresholds, defaultValue) {
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

  return ret
}

// 阈值动态, 比较符号
/*
thresholds :
[
    {threshold: 0, op: ">", value: "#f00"}
]
*/

fabric.Object.prototype.dynOpThreshold = function(name, thresholds, defaultValue) {
  var value = this.getValue(name)

  var ret = null

  thresholds = thresholds || []
  for (var i = 0; i < thresholds.length; i++) {
    switch (thresholds[i].op) {
      default:
        break
      case '=':
      case '==':
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

  return ret
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
    let mask = values[i].mask
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
      return values[i].value
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

// 模拟量输入
fabric.IText.prototype.editable = false
fabric.IText.prototype.inputValue = function(name) {
  this.editable = true
  if (this.isEditing === true) {
    return
  }
  this.editingBorderColor = 'rgb(0, 255, 0)'
  this.enterEditing()
  this.selectAll()
  this.renderCursorOrSelection()

  this.rubikOnKeyDown = function(e) {
    if (e.keyCode === 13) {
      this.exitEditing()
      this.set('selectable', false)
      var strValue = this.get('text').trim()
      if (!isNaN(strValue)) {
        this.setValue(name, parseFloat(strValue))
      } else {
        console.warn('invalid input: ', strValue)
      }
    } else {
      this.set('dirty', true)
    }
  }

  fabric.util.addListener(this.hiddenTextarea, 'keydown', this.rubikOnKeyDown.bind(this))
}

// 打开面板
fabric.Object.prototype.openDialog = function(name, param) {
  Dialog.open(name, param, this.event)
}

fabric.Object.prototype.openWindow = function(name, param) {
  this.canvas.open(name).then(() => {
    this.canvas.initDynamic()
    this.canvas.running = true
    this.canvas.calcDynamic()
    this.canvas.initTimer()
  }).catch(err => {
    // Message.error(err.toString())
  })
}

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
