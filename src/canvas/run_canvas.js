import { fabric } from 'fabric'
import ctxmenu from '@/components/ctxmenu'
import Vue from 'vue'
import * as rapi from '@/api/rtd'
import * as rtdbapi from '@/api/rtdb'
import _ from 'lodash'
import store from '@/store'
import text2image from '@/utils/text2image'

// 设置 objectCaching 为 false, 可以解决图形渲染模糊的问题.
// 这个设置会导致内存使用异常, 画面崩溃, 屏蔽这个设置
// fabric.Object.prototype.objectCaching = false

fabric.StaticCanvas.prototype.requestAnimFrame = function() {
  if (!this.animID) {
    var _this = this
    _this.animID = fabric.util.requestAnimFrame(function render() {
      _this.requestRenderAll()
      _this.animID = fabric.util.requestAnimFrame(render)
    })
  }
}

fabric.StaticCanvas.prototype.cancelAnimFrame = function() {
  if (this.animID) {
    fabric.util.cancelAnimFrame(this.animID)
    this.animID = 0
  }
}

fabric.RunCanvas = fabric.util.createClass(fabric.StaticCanvas, {
  type: 'RunCanvas',

  cursor: 'default',

  initialize: function(domID, options) {
    options || (options = {})
    options.preserveObjectStacking = true
    options.imageSmoothingEnabled = true
    options.stopContextMenu = true
    options.fireRightClick = true
    options.renderOnAddRemove = false
    options.cursor = 'default'
    this.domID = domID
    this.callSuper('initialize', domID, options)

    this.uiContainer = document.createElement('div')
    this.uiContainer.style.cssText = 'overflow: hidden; position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none'
    var parentElement = this.getElement().parentElement
    if (parentElement) {
      parentElement.appendChild(this.uiContainer)
    }
    // 生成内嵌输入框
    this.inputBox = document.createElement('input')
    this.inputBox.type = 'text'
    this.inputBox.style.cssText = 'display: none;'
    this.uiContainer.appendChild(this.inputBox)
    this.initHeader()
    this.addMouseListener()
    this.setupEvent()

    this.calcDynamic = _.throttle(
      () => {
        try {
          this._calcDynamic()
        } catch (err) {
          console.error('calcDynamic error:\n', err)
        }
      },
      400,
      { leading: true, trailing: false }
    )
  },

  _calcDynamic: function() {
    var _this = this

    _this.getObjects().forEach(obj => {
      obj.calcDynamic(_this.__loop || 0)
    })

    _this.__loop = _this.__loop + 1

    _this.requestRenderAll()
  },

  setCursor: function(cur) {
    if (typeof cur !== 'string') {
      cur = ''
    }
    cur = cur || 'default'
    if (this.openingWindow) {
      cur = 'wait'
    }
    if (cur !== this.cursor) {
      this.cursor = cur
      this.getElement().style.cursor = cur
    }
    return this
  },

  initTimer: function() {
    var _this = this
    if (_this.timer) {
      return
    }

    _this.__loop = 0
    // 先计算一下动态
    _this.calcDynamic()
    _this.timer = setInterval(function() {
      _this.calcDynamic()
    }, 490)
  },

  initDynamic: function() {
    var _this = this

    _this.getObjects().forEach(obj => {
      obj.initDynamic()
    })

    // 如果有初始化脚本, 执行初始化脚本
    if (_this.header && _this.header.initScript) {
      let func = `
      async function() {
        ${_this.header.initScript}
      }
      `
      try {
        var scriptf = null
        // eslint-disable-next-line
        eval('scriptf = ' + func )
        if (scriptf) {
          scriptf.call(_this)
        } else {
          console.error('build initScript error: \n', func)
        }
      } catch (err) {
        console.error('call initScript error: \n', func, '\n', err)
      }
    }
    _this.requestRenderAll()
  },

  onMouseDown: function(e) {
    this.fire('mouse:down', { e })
  },

  onMouseUp: function(e) {
    this.fire('mouse:up', { e })
  },

  onMouseMove: function(e) {
    this.fire('mouse:move', { e })
  },

  onDblclick: function(e) {
    this.fire('mouse:dblclick', { e })
  },

  onContextMenu: function(e) {
    if (this.stopContextMenu) {
      e.stopPropagation()
      e.preventDefault()
    }
    return false
  },

  // 添加鼠标事件响应函数
  addMouseListener: function() {
    var addListener = fabric.util.addListener
    addListener(this.getElement(), 'dblclick', this.onDblclick.bind(this), {})
    addListener(this.getElement(), 'mousedown', this.onMouseDown.bind(this), {})
    addListener(this.getElement(), 'mouseup', this.onMouseUp.bind(this), {})
    addListener(this.getElement(), 'mousemove', this.onMouseMove.bind(this), {})
    addListener(this.getElement(), 'contextmenu', this.onContextMenu.bind(this), {})
  },

  // 移除鼠标事件响应函数
  removeMouseListener: function() {
    var removeListener = fabric.util.removeListener
    removeListener(this.getElement(), 'dblclick', this.onDblclick.bind(this), {})
    removeListener(this.getElement(), 'mousedown', this.onMouseDown.bind(this))
    removeListener(this.getElement(), 'mouseup', this.onMouseUp.bind(this))
    removeListener(this.getElement(), 'mousemove', this.onMouseMove.bind(this))
    removeListener(this.getElement(), 'contextmenu', this.onContextMenu.bind(this), {})
  },

  // 其他事件响应函数
  setupEvent: function() {
    var _this = this

    // 点击事件
    _this.on('canvas:destroyed', function(opt) {
      _this.running = false
      _this.cancelAnimFrame()
      _this.timer && clearInterval(_this.timer)
      _this.removeMouseListener()
    })

    // 点击事件
    _this.on('mouse:down', function(opt) {
      if (!_this.running) {
        return
      }
      ctxmenu.closeAll()
      var pointer = _this.getPointer(opt.e, true)
      if (!pointer) {
        return
      }
      this.localVarChanged = false
      var targets = _this.rubikFindTargets(pointer)
      if (opt.e.which === 1) {
        targets.forEach(obj => {
          if (obj.type === 'button') {
            obj.set('beMousedown', true)
            _this.requestRenderAll()
          }
          obj.actionf && obj.actionf['mousedown'] && obj.actionf['mousedown'].call(obj, opt.e)
        })
      }
      if (this.localVarChanged) {
        // 本地变量有更新, 刷新一下画面
        this._calcDynamic()
      }
      if (opt.e.which === 3) {
        targets = _this.rubikFindTargets(pointer, true)
        // 调出变量快捷复制菜单
        let items = []
        let devItems = []
        let itemsMap = {}
        targets.forEach(obj => {
          if (obj.dyn) {
            for (let key in obj.dyn) {
              if (opt.e.shiftKey && obj.dyn[key] && obj.dyn[key].exprs && obj.dyn[key].exprs.length > 0) {
                // 打印驱动表达式
                console.log(`== ${key} ==\n${JSON.stringify(obj.dyn[key].exprs, null, '  ')}\n`)
              }

              if (obj.dyn[key] && obj.dyn[key].script) {
                // 打印当前脚本
                if (opt.e.shiftKey) {
                  console.log(`== ${key} ==\n${obj.dyn[key].script}\n`)
                }

                // 获取脚本中的变量
                if (obj.dynf[key]) {
                  obj.__script_vars__ = []
                  let getValueOld = fabric.Object.prototype.getValue
                  fabric.Object.prototype.getValue = function(name) {
                    if (typeof name !== 'string') {
                      return
                    }
                    if (name.length > 0) {
                      this.__script_vars__.push(name)
                    }

                    return getValueOld.call(this, name)
                  }
                  obj.dynf[key].call(obj)
                  fabric.Object.prototype.getValue = getValueOld

                  obj.mapVarUsed = obj.mapVarUsed || {}
                  obj.mapVarUsed[key] = Array.from(new Set(obj.__script_vars__ || []))
                }
              }

              // 打印当前使用的本地变量和全局变量
              if (opt.e.shiftKey && obj.dynf[key]) {
                obj.__script_vars__ = []
                let getLocalValueOld = fabric.Object.prototype.getLocalValue
                let getGlobalValueOld = fabric.Object.prototype.getGlobalValue
                fabric.Object.prototype.getLocalValue = function(name) {
                  let value = getLocalValueOld.call(this, name)
                  console.log(`LV (${typeof value}): ${name} =`, value)

                  return value
                }

                fabric.Object.prototype.getGlobalValue = function(name) {
                  let value = getGlobalValueOld.call(this, name)
                  console.log(`GV (${typeof value}): ${name} =`, value)

                  return value
                }

                obj.dynf[key].call(obj)

                fabric.Object.prototype.getLocalValue = getLocalValueOld
                fabric.Object.prototype.getGlobalValue = getGlobalValueOld

                obj.mapVarUsed = obj.mapVarUsed || {}
                obj.mapVarUsed[key] = Array.from(new Set(obj.__script_vars__ || []))
              }
            }
          }
          if (obj.checkVarName) {
            // 有检查变量
            items.push({
              label: '检查',
              divided: true,
              icon: 'el-icon-circle-check',
              onClick: () => {
                rapi.sendPulse(obj.checkVarName)
              }
            })
          }
          if (obj.mapVarUsed) {
            for (let key in obj.mapVarUsed) {
              for (let v of obj.mapVarUsed[key]) {
                let cap = key + '    ' + v
                if (!itemsMap[cap]) {
                  itemsMap[cap] = true
                  if (store.getters.selectedInst.id === 'dev' &&
                    (store.getters.roles.includes('engineer') || store.getters.roles.includes('admin'))) {
                    devItems.push({
                      label: cap,
                      icon: 'el-icon-edit-outline',
                      onClick: () => {
                        Vue.prototype.$copyText(v)
                        _this.openVarDefOrRef(v)
                      }
                    })
                  }
                  if (key === 'value' || key === 'fpct' || key === 'point') {
                    let trendItem = {
                      label: '曲线 ' + v,
                      icon: 'el-icon-data-line',
                      onClick: () => {
                        _this.openVarDetail(v)
                      }
                    }
                    let varItem = {
                      label: '变量 ' + v,
                      icon: 'el-icon-copy-document',
                      onClick: () => {
                        Vue.prototype.$copyText(v)
                        Vue.prototype.$msg(v, '复制变量')
                      }
                    }
                    items.push(trendItem, varItem)
                    let desc = ''
                    rtdbapi.varGetDetail(v).then(detail => {
                      if (detail) {
                        desc = detail.desc || v
                      }
                    }).catch(() => {
                      desc = v
                    }).finally(() => {
                      trendItem.label = '曲线 ' + desc
                      varItem.label = '变量 ' + desc
                    })
                  }
                }
              }
            }
          }
        })
        if (items.length || devItems.length) {
          // ctxmenu.open({ vars: items, check: check }, opt.e)
          if (items.length) {
            items[items.length - 1].divided = true
          }
          Vue.prototype.$contextmenu({
            items: [...items, ...devItems],
            event: opt.e,
            zIndex: 12003,
            minWidth: 148
          })
        }
      }
    })
    _this.on('mouse:up', function(opt) {
      if (!_this.running) {
        return
      }
      var pointer = _this.getPointer(opt.e, true)
      if (!pointer) {
        return
      }

      if (opt.e.which !== 1) {
        return
      }

      this.localVarChanged = false

      var targets = _this.rubikFindTargets(pointer)
      targets.forEach(obj => {
        if (obj.type === 'button') {
          obj.set('beMousedown', false)
          _this.requestRenderAll()
        }
        obj.actionf && obj.actionf['mouseup'] && obj.actionf['mouseup'].call(obj, opt.e)
      })

      if (this.localVarChanged) {
        // 本地变量有更新, 刷新一下画面
        this._calcDynamic()
      }
    })
    _this.on('mouse:dblclick', function(opt) {
      if (!_this.running) {
        return
      }
      var pointer = _this.getPointer(opt.e, true)
      if (!pointer) {
        return
      }

      if (opt.e.which !== 1) {
        return
      }

      var targets = _this.rubikFindTargets(pointer)
      targets.forEach(obj => {
        obj.actionf && obj.actionf['mousedblclick'] && obj.actionf['mousedblclick'].call(obj, opt.e)
        if (obj.mapVarUsed) {
          for (let key in obj.mapVarUsed) {
            for (let v of obj.mapVarUsed[key]) {
              if (key === 'value' || key === 'fpct' || key === 'point') {
                Vue.prototype.$copyText(v)
              }
            }
          }
        }
      })
    })
    _this.on('mouse:move', function(opt) {
      // 记录上一时刻的 pointer
      if (!_this.running) {
        return
      }
      var pointer = _this.getPointer(opt.e, true)
      if (!pointer) {
        return
      }
      if (_this.__lastTargets) {
        _this.__lastTargets.forEach(obj => {
          obj.__mouseflag = 1
        })
      }
      var targets = _this.rubikFindTargets(pointer)
      let hasAction = false
      let enabled = false
      targets.forEach(obj => {
        if (obj.actionf) {
          hasAction = true
          if (!obj.disabled) {
            enabled = true
          }
        }
        obj.__mouseflag = (obj.__mouseflag || 0) + 1
        if (obj.__mouseflag === 1) {
          // mouseover
          obj.actionf && obj.actionf['mouseover'] && obj.actionf['mouseover'].call(obj, opt.e)
        }
        obj.__mouseflag = 0
      })

      let cursor = hasAction ? (enabled ? 'pointer' : 'not-allowed') : 'default'

      _this.setCursor(cursor)

      if (_this.__lastTargets) {
        _this.__lastTargets.forEach(obj => {
          if (obj.__mouseflag === 1) {
            // mouseout
            if (obj.type === 'button') {
              obj.set('beMousedown', false)
              _this.requestRenderAll()
            }
            obj.actionf && obj.actionf['mouseout'] && obj.actionf['mouseout'].call(obj, opt.e)
          }
          obj.__mouseflag = 0
        })
      }
      _this.__lastTargets = targets
    })
  },

  getPointer: function(e, ignoreZoom) {
    return {
      x: e.offsetX,
      y: e.offsetY
    }
  },

  rubikFindTargets: function(pointer, includeInvisible) {
    return this.rubikSearchPossibleTargets(this._objects, pointer, includeInvisible)
  },

  rubikSearchPossibleTargets: function(objects, pointer, includeInvisible) {
    // targets to return
    const targets = []
    // Cache all targets where their bounding box contains point.
    let i = objects.length
    while (i--) {
      if (!objects[i].needMouseEvent) {
        continue
      }
      if (this._checkTarget(pointer, objects[i], includeInvisible)) {
        const target = objects[i]
        targets.push(target)
        if (target instanceof fabric.Group) {
          const normalizedPointer = target.group ? this._rubikNormalizePointer(target, pointer) : this._normalizePointer(target, pointer)
          const subTargets = this.rubikSearchPossibleTargets(target._objects, normalizedPointer, includeInvisible)
          targets.push(...subTargets)
        }
      }
    }

    return targets
  },

  _checkTarget: function(pointer, obj, includeInvisible) {
    if (includeInvisible) {
      return obj && obj.containsPoint(pointer)
    }
    return obj && obj.visible && obj.containsPoint(pointer)
  },

  _rubikNormalizePointer: function(object, pointer) {
    const m = object.calcTransformMatrix(true)
    const invertedM = fabric.util.invertTransform(m)
    return fabric.util.transformPoint(pointer, invertedM)
  },

  _normalizePointer: function(object, pointer) {
    var m = object.calcTransformMatrix()
    var invertedM = fabric.util.invertTransform(m)
    var vptPointer = this.restorePointerVpt(pointer)
    return fabric.util.transformPoint(vptPointer, invertedM)
  },

  restorePointerVpt: function(pointer) {
    return fabric.util.transformPoint(
      pointer,
      fabric.util.invertTransform(this.viewportTransform)
    )
  },

  onDragstart(event) {
    let dragVar = ''

    let _this = this
    if (!_this.running) {
      return
    }
    var pointer = _this.getPointer(event, true)
    if (!pointer) {
      return
    }
    var targets = _this.rubikFindTargets(pointer)
    if (event.which === 1) {
      let itemsMap = {}
      targets.forEach(obj => {
        if (obj.dyn) {
          for (let key in obj.dyn) {
            if (obj.dyn[key] && obj.dyn[key].script) {
              // 获取脚本中的变量
              if (obj.dynf[key]) {
                obj.__script_vars__ = []
                let getValueOld = fabric.Object.prototype.getValue
                fabric.Object.prototype.getValue = function(name) {
                  if (typeof name !== 'string') {
                    return
                  }
                  if (name.length > 0) {
                    this.__script_vars__.push(name)
                  }

                  return getValueOld.call(this, name)
                }
                obj.dynf[key].call(obj)
                fabric.Object.prototype.getValue = getValueOld

                obj.mapVarUsed = obj.mapVarUsed || {}
                obj.mapVarUsed[key] = Array.from(new Set(obj.__script_vars__ || []))
              }
            }
          }
        }
        if (obj.mapVarUsed) {
          for (let key in obj.mapVarUsed) {
            for (let v of obj.mapVarUsed[key]) {
              let cap = key + '    ' + v
              if (!itemsMap[cap]) {
                itemsMap[cap] = true
                if (key === 'value' || key === 'fpct' || key === 'point') {
                  dragVar = v
                }
              }
            }
          }
        }
      })
    }
    var dragText = rapi.getPointAttr(dragVar, 'desc') || dragVar || 'NO'
    let img = new Image()
    let base64 = text2image(dragText, 16, '#0F0')
    img.src = base64
    event.dataTransfer.setDragImage(img, 0, 0)
    event.dataTransfer.setData('text/plain', JSON.stringify({ dragVar: dragVar }))
  }
})
