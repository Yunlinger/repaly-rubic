import { fabric } from 'fabric'
import MessageBox from '@/components/message-box'
import _ from 'lodash'
import { formatNumber } from '@/utils/index'

const uniqueArray = function(array) {
  return Array.from(new Set(array || []))
}

const parser = {
  parse: function(str) {
    let ostr = str
    if (typeof str === 'string') {
      str = str.replaceAll(/`([^`]*)`/g, function(x, p1) {
        return `this.getValue("${p1}")`
      })
      str = str.replaceAll(/'G:([^']*)'/g, function(x, p1) {
        return `this.getGlobalValue("${p1}")`
      })
      str = str.replaceAll(/'([^']*)'/g, function(x, p1) {
        return `this.getLocalValue("${p1}")`
      })
      const code = `(function(){
        if (this.dynError) {
          this.set("backgroundColor", (loop % 2) ? "purple" : "");
          return 0;
        }
        if (this.runSucc) {
          return ${str};
        } else {
          try {
            return ${str};
            this.runSucc = true;
          } catch (error) {
            this.dynError = true;
            this.set("backgroundColor", "purple");
            console.log("expression error: ", "${ostr.replaceAll('\"', '\\\"')}");
          }
          return 0;
        }
      }).call(this)`
      return code
    }
    return '0'
  },
  getVars: function(str) {
    let vars = []
    if (typeof str === 'string') {
      vars = str.match(/`[^`]+`/g) || []
    }
    vars.map((item, idx, array) => {
      array[idx] = item.slice(1, -1)
    })
    return uniqueArray(vars)
  }
}

fabric.Object.prototype.formatValue = function(value, format) {
  return formatNumber(value, format)
}

fabric.Group.prototype.initDynamic = function() {
  var _this = this

  var childNeedCalc = false
  var childNeedMouseEvent = false

  _this.getObjects().forEach(obj => {
    obj.initDynamic()

    childNeedCalc = childNeedCalc || obj.needCalc
    childNeedMouseEvent = childNeedMouseEvent || obj.needMouseEvent
  })

  _this.callSuper('initDynamic')

  _this.needCalc = _this.needCalc || childNeedCalc
  _this.needMouseEvent = _this.needMouseEvent || childNeedMouseEvent
}

fabric.Object.prototype.initDynamic = function() {
  var _this = this

  // 显示驱动
  _this.dynf = undefined
  for (let key in _this.dyn) {
    _this.dynf = _this.dynf || {}
    // 各个动态使用的变量名
    _this.mapVarUsed = _this.mapVarUsed || {}
    // eslint-disable-next-line
    let f = null
    // 使用脚本直接驱动
    if (_this.dyn[key].useScript) {
      // 使用脚本驱动的时候, 响应右键, 搜索变量, 在 console 中显示脚本信息
      _this.needMouseEvent = true

      let func = `
        if (this.dynError) {
          this.set("backgroundColor", (loop % 2) ? "purple" : "")
        } else {
          try {
            ${_this.dyn[key].script || ''}
          } catch (error) {
            this.dynError = true
            this.set("backgroundColor", "purple")
            console.log(this.dyn["${key}"].script)
            console.log("script run error: ", error.toString())
          }
        }
      `
      try {
        // eslint-disable-next-line
        eval('f = function(loop){' + func + '}')
      } catch (error) {
        _this.set('backgroundColor', 'purple')
        console.log(_this.dyn[key].script)
        console.log('parse script error: ', error.toString())
      }
      if (f) {
        _this.dynf[key] = f
      }
      continue
    }
    if (key === 'fpct') {
      let dyn = _this.dyn[key]
      if (dyn.name) {
        let name = dyn.name
        name = name.replace(/^`([^`]*)`$/, function(x, p1) {
          return p1
        })
        // 使用变量名获取值
        _this.mapVarUsed[key] = [name]
        let funcBody = `
          let max = ${dyn.max} || 0
          let min = ${dyn.min} || 0
          if (max === min) {
            max = this.getPointAttr("${name}", "high")
            min = this.getPointAttr("${name}", "low")
          }
          if (max === min) {
            // return 0
            max = 100
            min = 0
          }
          return (this.getValue("${name}") - min) / (max - min)
        `
        try {
          // eslint-disable-next-line
          eval('f = function(loop){' + funcBody + '}')
        } catch (error) {
          console.log('parse express error,', _this.dyn[key].expr)
        }
        if (f) {
          _this.dynf[key] = f
        }
      } else {
        _this.mapVarUsed[key] = parser.getVars(dyn.expr)
        let funcBody = `return (${parser.parse(dyn.expr)} - ${dyn.min || 0}) / (${dyn.max || 100} - ${dyn.min || 0})`
        try {
          // eslint-disable-next-line
          eval('f = function(loop){' + funcBody + '}')
        } catch (error) {
          console.log('parse express error,', _this.dyn[key].expr)
        }
        if (f) {
          _this.dynf[key] = f
        }
      }
    } else if (key === 'calcAngle') {
      let dyn = _this.dyn[key]
      if (!dyn) {
        continue
      }
      _this.mapVarUsed[key] = parser.getVars(dyn.expr)
      let funcBody = `
      var dyn = this.dyn['${key}']
      var startAngle = dyn.minAngle || 0
      var endAngle = dyn.maxAngle || 0

      if (startAngle === endAngle) {
        return startAngle
      }

      var startValue = dyn.min || 0
      var endValue = dyn.max || 0
      if (startValue === endValue) {
        return this.angle
      }

      var value = ${parser.parse(dyn.expr)}

      var angle = startAngle + (endAngle - startAngle) * (value - startValue) / (endValue - startValue);
      if (startAngle < endAngle) {
        angle = Math.max(angle, startAngle);
        angle = Math.min(angle, endAngle);
      } else {
        angle = Math.min(angle, startAngle);
        angle = Math.max(angle, endAngle);
      }

      return angle;
      `
      try {
        // eslint-disable-next-line
        eval('f = function(loop){' + funcBody + '}')
      } catch (error) {
        console.log('parse express error,', _this.dyn[key].expr)
      }
      if (f) {
        _this.dynf[key] = f
      }
    } else if (key === 'moveX' || key === 'moveY') {
      let dyn = _this.dyn[key]
      if (!dyn) {
        continue
      }
      _this.mapVarUsed[key] = parser.getVars(dyn.expr)
      let funcBody = `
      var dyn = this.dyn['${key}'];
      dyn.maxDistance = dyn.maxDistance || 0;
      var d = dyn.maxDistance * (${parser.parse(dyn.expr)}) / (${dyn.max || 100} - ${dyn.min || 0});
      if (dyn.maxDistance > 0) {
        d = Math.min(dyn.maxDistance, d);
        d = Math.max(d, 0);
      }
      if (dyn.maxDistance < 0)  {
        d = Math.max(dyn.maxDistance, d);
        d = Math.min(d, 0);
      }
      return d;
      `
      try {
        // eslint-disable-next-line
        eval('f = function(loop){' + funcBody + '}')
      } catch (error) {
        console.log('parse express error,', _this.dyn[key].expr, error)
      }
      if (f) {
        _this.dynf[key] = f
      }
    } else if (key === 'value') {
      let dyn = _this.dyn[key]
      if (!dyn || !dyn.expr) {
        continue
      }
      _this.mapVarUsed[key] = parser.getVars(dyn.expr)
      let funcBody = `
      var value = ${parser.parse(dyn.expr)}
      if (typeof value === 'number') {
        return this.formatValue(value, '${dyn.format}')
      }
      return value
      `
      try {
        // eslint-disable-next-line
        eval('f = function(loop){' + funcBody + '}')
      } catch (error) {
        console.log('parse express error,', _this.dyn[key].expr)
      }
      if (f) {
        _this.dynf[key] = f
      }
    } else if (key === 'point') {
      let dyn = _this.dyn[key]
      dyn.attr = dyn.attr || 'value'
      if (!dyn || !dyn.name) {
        continue
      }
      let name = dyn.name
      name = name.replace(/^`([^`]*)`$/, function(x, p1) {
        return p1
      })
      if (name) {
        _this.mapVarUsed[key] = [name]
      }
      let funcBody = `
        var value = this.getPointAttr('${name}', '${dyn.attr}')
        if (typeof value === 'number') {
          value = this.formatValue(value, '${dyn.format}')
        }
        // 显示单位
        if (('${dyn.attr}' === 'value') && ${dyn.showUnit}) {
          value = value + ' ' + this.getPointAttr('${name}', 'unit')
        }
        return value
      `
      try {
        // eslint-disable-next-line
        eval('f = function(loop){' + funcBody + '}')
      } catch (error) {
        console.log('parse express error,', _this.dyn[key].expr)
      }
      if (f) {
        _this.dynf[key] = f
      }
    } else if (key === 'check') {
      // 检查
      let dyn = _this.dyn[key]
      _this.mapVarUsed[key] = [dyn.name]
      // 使用 checkVarName 记住检查变量
      _this.checkVarName = dyn.name
    } else {
      let funcBody = ''
      if (_this.dyn[key].exprs instanceof Array) {
        let vars = []
        for (let dyn of _this.dyn[key].exprs) {
          vars.push(...parser.getVars(dyn.expr))
          let retValue = (typeof dyn.value === 'string') ? `\`${dyn.value}\`` : `${dyn.value}`
          funcBody += `if(${parser.parse(dyn.expr)}) return ${retValue} \n`
        }
        _this.mapVarUsed[key] = uniqueArray(vars)

        // for (let i = 0; i < _this.dyn[key].exprs.length; i++) {
        //   let retValue = (typeof _this.dyn[key].exprs[i].value === 'string') ? `'${_this.dyn[key].exprs[i].value}'` : `${_this.dyn[key].exprs[i].value}`
        //   funcBody += `if(${parser.parse(_this.dyn[key].exprs[i].expr)}) return ${retValue} \n`
        // }
      }
      if (funcBody) {
        try {
          // eslint-disable-next-line
          eval('f = function(loop){' + funcBody + '}')
        } catch (error) {
          console.log('parse function error:', error)
        }
      }
      if (f) {
        _this.dynf[key] = f
      }
      if (key === 'text' && this.isText()) {
        if (!this.text_default) {
          this.text_default = this.get('text')
        }
      }
    }
  }

  _this.needCalc = !_.isEmpty(_this.dynf)

  let confirmOption = {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
    showClose: false,
    iconClass: 'el-icon-question',
    customClass: 'rubik-confirm-box',
    followMouse: true
  }

  // 操作驱动
  _this.actionf = undefined
  for (let key in _this.action) {
    _this.actionf = _this.actionf || {}
    let action = _this.action[key]
    /*
        { text: '切换画面', value: 'openWindow' },
        { text: '打开操作端', value: 'openPad' }
    */
    if (action.act === 'setv') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        let setFunc = () => {
          if (action.local) {
            this.setLocalValue(action.name, action.value)
          } else {
            this.setValue(action.name, action.value)
          }
        }
        if (action.confirm) {
          confirmOption.event = event
          MessageBox.confirm(action.confirm, confirmOption).then(() => {
            setFunc()
          }).catch(() => {
          })
        } else {
          setFunc()
        }
      }
      _this.mapVarUsed = _this.mapVarUsed || {}
      _this.mapVarUsed[action.act] = [action.name]
    } else if (action.act === 'pulse') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        let setFunc = () => {
          this.sendPulse(action.name, action.width || 1000)
        }
        if (action.confirm) {
          confirmOption.event = event
          MessageBox.confirm(action.confirm, confirmOption).then(() => {
            setFunc()
          }).catch(() => {
          })
        } else {
          setFunc()
        }
      }
      _this.mapVarUsed = _this.mapVarUsed || {}
      _this.mapVarUsed[action.act] = [action.name]
    } else if (action.act === 'setdelta') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        let setFunc = () => {
          if (this.getValue(action.name) !== false) {
            this.setValue(action.name, this.getValue(action.name) + (action.value || 0))
          }
        }
        if (action.confirm) {
          confirmOption.event = event
          MessageBox.confirm(action.confirm, confirmOption).then(() => {
            setFunc()
          }).catch(() => {
          })
        } else {
          setFunc()
        }
      }
      _this.mapVarUsed = _this.mapVarUsed || {}
      _this.mapVarUsed[action.act] = [action.name]
    } else if (action.act === 'switch') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        let setFunc = () => {
          if (action.local) {
            this.setLocalValue(action.name, this.getLocalValue(action.name) ? 0 : 1)
          } else {
            // if (this.getValue(action.name) !== false) {
            //   this.setValue(action.name, this.getValue(action.name) ? 0 : 1)
            // }
            this.switchValue(action.name)
          }
        }
        if (action.confirm) {
          confirmOption.event = event
          MessageBox.confirm(action.confirm, confirmOption).then(() => {
            setFunc()
          }).catch(() => {
          })
        } else {
          setFunc()
        }
      }
      _this.mapVarUsed = _this.mapVarUsed || {}
      _this.mapVarUsed[action.act] = [action.name]
    } else if (action.act === 'input') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        if (action.local) {
          this.inputLocalValue(action, event)
        } else {
          this.inputValue(action, event)
        }
      }
      _this.mapVarUsed = _this.mapVarUsed || {}
      _this.mapVarUsed[action.act] = [action.name]
    } else if (action.act === 'openWindow') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        if (action.pic) {
          this.openWindow(action.pic, action.param, event)
        }
      }
    } else if (action.act === 'openPad') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        if (action.pic) {
          this.openPad(action.pic, action.param, event)
        }
      }
    } else if (action.act === 'closePad') {
      _this.actionf[key] = function(event) {
        if (this.disabled) {
          return
        }
        this.closeSelf(event)
      }
    } else if (action.act === 'script') {
      let func = `
      async function(event) {
        if (this.disabled) {
          return
        }
        ${action.name}
      }
      `
      try {
        var scriptf = null
        // eslint-disable-next-line
        eval('scriptf = ' + func )
        if (scriptf) {
          _this.actionf[key] = scriptf
        } else {
          console.log('build function error: \n', func)
        }
      } catch (err) {
        console.log('build script error: \n', func, '\n', err)
      }
    }
  }

  _this.needMouseEvent = _this.needMouseEvent || (!_.isEmpty(_this.actionf)) ||
    (!_.isEmpty(_this.mapVarUsed)) ||
    (this.type === 'button') ||
    (this.checkVarName)
}

fabric.Object.prototype.calcDynamic = function(loop) {
  if (!this.needCalc) {
    return
  }

  for (var key in this.dynf) {
    let v = this.dynf[key].call(this, loop)
    if (this.dynf[key].ov !== v) {
      this.dynSet(key, v, this.dyn[key])
      this.dynf[key].ov = v
    }
  }
}

fabric.Group.prototype.calcDynamic = function(loop) {
  var _this = this

  if (!_this.needCalc) {
    return
  }

  _this.callSuper('calcDynamic', loop)

  _this.getObjects().forEach(obj => {
    obj.calcDynamic(loop)
  })
}
