import { fabric } from 'fabric'
import ctxmenu from '@/components/ctxmenu'
import Vue from 'vue'
import * as rapi from '@/api/rtd'

fabric.RubikCanvas = fabric.util.createClass(fabric.Canvas, {
  type: 'rubikCanvas',
  initialize: function(domID, options) {
    options || (options = {})
    options.preserveObjectStacking = true
    options.imageSmoothingEnabled = true
    options.stopContextMenu = true
    options.selectionFullyContained = true
    options.fireRightClick = true
    options.renderOnAddRemove = true
    this.domID = domID
    this.callSuper('initialize', domID, options)

    this.uiContainer = document.createElement('div')
    this.uiContainer.style.cssText = `width: 100%; height: 100%;`
    this.wrapperEl.appendChild(this.uiContainer)
    this.initHeader()
    this.renderBounds()
    this.setupEvent()
    this.enableDrawPolyline()
  },

  // 绘制边界
  renderBounds: function() {
    var _this = this

    _this.on('after:render', function() {
      if (this.running) {
        return
      }
      _this.contextContainer.strokeStyle = '#555'
      var left = 0 - _this.vptCoords.tl.x * _this.getZoom()
      var top = 0 - _this.vptCoords.tl.y * _this.getZoom()
      var width = (_this.header && _this.header.width) || 1024
      var height = (_this.header && _this.header.height) || 768
      let vpt = _this.viewportTransform.slice(0)
      let zoomX = vpt[0]
      let zoomY = vpt[3]
      _this.contextContainer.strokeRect(left, top, width * zoomX, height * zoomY)
    })
  },

  // 其他事件响应函数
  setupEvent: function() {
    var _this = this

    // 滚轮缩放
    _this.on('mouse:wheel', function(opt) {
      if (_this.running) {
        return
      }

      if (opt.e.ctrlKey) {
        var delta = opt.e.deltaY
        var zoom = _this.getZoom()
        if (delta < 0) {
          zoom = zoom * 1.25
        } else if (delta > 0) {
          zoom = zoom * 0.8
        }
        _this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
        // _this.zoomToPoint({ x: 0, y: 0 }, zoom)
        _this.calcOffset()
        opt.e.preventDefault()
        opt.e.stopPropagation()
        _this.requestRenderAll()
      }
    })

    // 鼠标右键拖动画面
    _this.on('mouse:move', function(opt) {
      // right button down
      if (_this.running) {
        return
      }
      if (opt.e.which === 2 || opt.e.which === 3) {
        _this.relativePan({ x: opt.e.movementX, y: opt.e.movementY })
        opt.e.preventDefault()
        opt.e.stopPropagation()
        _this.requestRenderAll()
      }
    })

    // 选中
    _this.on('selection:updated', function(opt) {
      if (this.getActiveObject() && this.getActiveObject().type === 'activeSelection') {
        this.getActiveObject().set('hasControls', false)
      }
      _this.showProperty()
    })

    _this.on('selection:created', function(opt) {
      if (this.getActiveObject() && this.getActiveObject().type === 'activeSelection') {
        this.getActiveObject().set('hasControls', false)
      }
      _this.showProperty()
    })

    _this.on('selection:cleared', function(opt) {
      if (this.getActiveObject() && this.getActiveObject().type === 'activeSelection') {
        this.getActiveObject().set('hasControls', false)
      }
      _this.showProperty()
    })

    // 清除
    _this.on('canvas:cleared', function() {
      _this.timer && clearInterval(_this.timer)
      _this.timer = null
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
      if (opt.e.which === 3) {
        // 调出变量快捷复制菜单
        let items = []
        let check = null
        targets.forEach(obj => {
          if (obj.mapVarUsed) {
            for (let key in obj.mapVarUsed) {
              for (let v of obj.mapVarUsed[key]) {
                items.push({
                  caption: key + '    ' + v,
                  callback: () => {
                    Vue.prototype.$copyText(v)
                    _this.openVarDefOrRef(v)
                  }
                })
              }
            }
          }
          if (obj.checkVarName) {
            // 有检查变量
            check = {
              name: obj.checkVarName,
              callback: () => {
                rapi.sendPulse(obj.checkVarName)
              }
            }
          }
        })
        if (items.length > 0) {
          ctxmenu.open({ vars: items, check: check }, opt.e)
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

      var targets = _this.rubikFindTargets(pointer)
      targets.forEach(obj => {
        if (obj.type === 'button') {
          obj.set('beMousedown', false)
          _this.requestRenderAll()
        }
        obj.actionf && obj.actionf['mouseup'] && obj.actionf['mouseup'].call(obj, opt.e)
      })
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
      targets.forEach(obj => {
        if (obj.actionf) {
          hasAction = true
        }
        obj.__mouseflag = (obj.__mouseflag || 0) + 1
        if (obj.__mouseflag === 1) {
          // mouseover
          obj.actionf && obj.actionf['mouseover'] && obj.actionf['mouseover'].call(obj, opt.e)
        }
        obj.__mouseflag = 0
      })

      if (hasAction !== _this.hasAction) {
        _this.hasAction = hasAction
        let cursor = hasAction ? 'pointer' : 'default'
        _this.set('defaultCursor', cursor)
        _this.set('hoverCursor', cursor)
        _this.set('moveCursor', cursor)
      }

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

    _this.on('drop', function(opt) {
      if (_this.running) {
        return
      }
      var url = opt.e.dataTransfer.getData('text/plain')
      url = JSON.parse(url).url
      if (!url || url.length === 0) {
        return
      }
      var x = opt.e.offsetX
      var y = opt.e.offsetY

      x = opt.e.offsetX / _this.getZoom() + _this.vptCoords.tl.x
      y = opt.e.offsetY / _this.getZoom() + _this.vptCoords.tl.y
      var object = {
        libName: url
      }
      fabric.Lib.fromObject(object, function(lib) {
        lib.set('left', x)
        lib.set('top', y)
        _this.add(lib)
        _this.setActiveObject(lib)
        _this.requestRenderAll()
      })
    })

    _this.on('object:scaling', function(opt) {
      if (opt.target.type === 'rect') {
        opt.target.set({
          width: opt.target.width * opt.target.scaleX,
          height: opt.target.height * opt.target.scaleY,
          scaleX: 1,
          scaleY: 1
        })
        _this.requestRenderAll()
      }
    })

    // _this.on('object:modified', function(opt) {
    //   if (!(opt.target.scaleX !== 1 || opt.target.scaleY !== 1)) {
    //     return
    //   }

    //   switch (opt.target.type) {
    //     case 'rect':
    //     case 'triangle':
    //       var prop = {
    //         scaleX: 1,
    //         scaleY: 1,
    //         width: opt.target.width * opt.target.scaleX,
    //         height: opt.target.height * opt.target.scaleY
    //       }
    //       opt.target.set(prop)
    //       break
    //     case 'ellipse':
    //       prop = {
    //         scaleX: 1,
    //         scaleY: 1,
    //         rx: opt.target.rx * opt.target.scaleX,
    //         ry: opt.target.ry * opt.target.scaleY
    //       }
    //       opt.target.set(prop)
    //       break
    //     case 'polyline':
    //     case 'polygon':
    //       var poly = opt.target
    //       var dim = poly._calcDimensions()
    //       poly.points.forEach(function(v) {
    //         v.x = poly.left + (v.x - dim.left) * poly.scaleX
    //         v.y = poly.top + (v.y - dim.top) * poly.scaleY
    //       })

    //       dim = poly._calcDimensions()
    //       poly.set({
    //         scaleX: 1,
    //         scaleY: 1,
    //         ...dim,
    //         pathOffset: {
    //           x: dim.left + dim.width / 2,
    //           y: dim.top + dim.height / 2
    //         }
    //       })
    //       poly.setCoords()
    //       break
    //   }
    // })

    // FreeDraw 结束
    _this.on('path:created', function(opt) {
      _this.isDrawingMode = false
    })

    // 添加基本图形
    _this.on('mouse:down', function(opt) {
      if (!_this.insertGraphType) {
        return
      }
      _this.insertStartPointer = _this.getPointer(opt.e, false)
    })
    _this.on('mouse:up', function(opt) {
      if (!_this.insertGraphType) {
        return
      }
      var pointer = _this.getPointer(opt.e, false)
      var graph = null
      var left = Math.min(_this.insertStartPointer.x, pointer.x)
      var top = Math.min(_this.insertStartPointer.y, pointer.y)
      var width = Math.abs(_this.insertStartPointer.x - pointer.x)
      var height = Math.abs(_this.insertStartPointer.y - pointer.y)

      switch (_this.insertGraphType) {
        case 'rect':
          graph = new fabric.Rect({
            left, top, width, height,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break
        case 'bar':
          graph = new fabric.Bar({
            left, top, width, height,
            fill: '#f00',
            stroke: '#000'
          })
          _this.add(graph)
          break
        case 'chart':
          graph = new fabric.Chart({
            left, top, width, height,
            fill: '#f00',
            stroke: '#000'
          })
          _this.add(graph)
          break
        case 'component':
          graph = new fabric.Component({
            left, top, width, height,
            fill: '#f00',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'ellipse':
          graph = new fabric.Ellipse({
            left, top,
            rx: width / 2,
            ry: height / 2,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'triangle':
          graph = new fabric.Triangle({
            left, top, width, height,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'rimage':
          fabric.RubikImage.fromFile('default.png', function(image) {
            image.set({
              left, top, width, height
            }).setCoords()
            _this.add(image)
            _this.setActiveObject(image)
          }, {
            width, height
          })
          break

        case 'gif':
          graph = new fabric.RubikGif({
            rsrc: 'default.gif',
            left, top, width, height,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'text':
          graph = new fabric.IText('text', {
            left, top, width, height,
            fontSize: 16
          })
          _this.add(graph)
          break

        case 'textbox':
          graph = new fabric.Textbox('textbox', {
            left, top, width, height,
            fontSize: 16,
            backgroundColor: '#ddd'
          })
          _this.add(graph)
          break

        case 'button':
          graph = new fabric.Button('按钮', {
            left, top, width, height,
            fontSize: 16,
            backgroundColor: '#BFBFBF',
            textAlign: 'center'
          })
          _this.add(graph)
          break
      }

      if (graph) {
        _this.setActiveObject(graph)
      }
      _this.insertGraphType = false
      // 设置当前所有图形可选中
      _this.selections = true
      _this.getObjects().forEach(obj => {
        obj.set('selectable', true)
      })
      _this.requestRenderAll()
    })
  },

  showProperty: function() {
    if (this.getActiveObject()) {
      // console.log('showProperty', this.getActiveObject())
    }
  },

  enableDrawPolyline: function() {
    var canvas = this

    canvas.isDrawingPolyMode = false
    canvas.isDrawingPolyBegin = false

    canvas.on('mouse:down', function(opt) {
      if (!canvas.isDrawingPolyMode) {
        return
      }
      var p = canvas.restorePointerVpt({ x: opt.e.layerX, y: opt.e.layerY })
      if (!canvas.isDrawingPolyBegin) {
        canvas.isDrawingPolyBegin = true
        var poly = new fabric.Polyline([p, p], {
          stroke: '#000',
          strokeWidth: 1,
          fill: 'transparent',
          left: p.x,
          top: p.y,
          originX: 'left',
          originY: 'top'
        })
        canvas.add(poly)
      } else {
        var objs = canvas.getObjects()
        poly = objs[objs.length - 1]
        if (opt.e.shiftKey) {
          let lastP = poly.points[poly.points.length - 2]
          if (Math.abs(p.x - lastP.x) < Math.abs(p.y - lastP.y)) {
            p.x = lastP.x
          } else {
            p.y = lastP.y
          }
        }
        if (p.x !== poly.points[poly.points.length - 2].x || p.y !== poly.points[poly.points.length - 2].y) {
          poly.points.push(p)
        }
        canvas.remove(poly)
        if (canvas.isDrawPolygon) {
          poly = new fabric.Polygon(poly.points, {
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        } else {
          poly = new fabric.Polyline(poly.points, {
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        }
        canvas.add(poly)
        canvas.requestRenderAll()
      }
    })

    canvas.on('mouse:move', function(opt) {
      if (canvas.isDrawingPolyMode && canvas.isDrawingPolyBegin) {
        var p = canvas.restorePointerVpt({ x: opt.e.layerX, y: opt.e.layerY })
        var objs = canvas.getObjects()
        var poly = objs[objs.length - 1]
        if (opt.e.shiftKey) {
          let lastP = poly.points[poly.points.length - 2]
          if (Math.abs(p.x - lastP.x) < Math.abs(p.y - lastP.y)) {
            p.x = lastP.x
          } else {
            p.y = lastP.y
          }
        }
        poly.points[poly.points.length - 1] = p
        canvas.remove(poly)
        if (canvas.isDrawPolygon) {
          poly = new fabric.Polygon(poly.points, {
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        } else {
          poly = new fabric.Polyline(poly.points, {
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        }
        canvas.add(poly)
        canvas.requestRenderAll()
      }
    })

    canvas.on('mouse:dblclick', function(opt) {
      if (canvas.isDrawingPolyMode) {
        canvas.isDrawingPolyMode = false
        canvas.isDrawingPolyBegin = false

        var objs = canvas.getObjects()
        var poly = objs[objs.length - 1]
        // 删除多余的点
        var points = poly.points.slice(0, poly.points.length - 1)
        canvas.remove(poly)
        if (canvas.isDrawPolygon) {
          poly = new fabric.Polygon(points, {
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        } else {
          poly = new fabric.Polyline(points, {
            stroke: '#000',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        }
        canvas.add(poly)
        // 设置当前所有图形可选中
        canvas.selections = true
        canvas.getObjects().forEach(obj => {
          obj.set('selectable', true)
        })
        canvas.requestRenderAll()
      }
    })

    canvas.on('object:modified', function(opt) {
      if (opt.target.type === 'chart' && (opt.target.scaleX !== 1 || opt.target.scaleY !== 1)) {
        opt.target.width = opt.target.width * opt.target.scaleX
        opt.target.height = opt.target.height * opt.target.scaleY
        opt.target.scaleX = 1
        opt.target.scaleY = 1
        opt.target.resetChartCanvas()
        opt.target.set('dirty', true)
        canvas.requestRenderAll()
      }
      opt.target.walk((obj) => {
        if (typeof obj.onParentModified === 'function') {
          obj.onParentModified()
        }
      })
    })
  },

  beginDrawPolyline: function(isPolygon) {
    this.isDrawingPolyMode = true
    this.isDrawPolygon = !!isPolygon
    this.isDrawingPolyBegin = false

    // 设置当前所有图形不可选中
    this.selections = false
    this.discardActiveObject()
    this.getObjects().forEach(obj => {
      obj.set('selectable', false)
    })
  },

  interGraph: function(graphType) {
    this.insertGraphType = graphType
    // 设置当前所有图形不可选中
    this.selections = false
    this.discardActiveObject()
    this.getObjects().forEach(obj => {
      obj.set('selectable', false)
    })
  },

  beginFreeDraw: function() {
    this.freeDrawingMode = 'Pencil'
    this.freeDrawingBrush.width = 1
    this.freeDrawingBrush.color = '#000'
    this.isDrawingMode = true
  },

  removeSelect: function() {
    if (!this.getActiveObject()) {
      return
    }
    // 清除可能的 UI 控件
    this.getActiveObject().walk(obj => obj.dispose && obj.dispose())

    if (this.getActiveObject().type === 'activeSelection') {
      this.remove(...this.getActiveObject().getObjects())
      this.discardActiveObject()
    } else {
      this.remove(this.getActiveObject())
    }
    this.requestRenderAll()
  },

  initTimer: function() {
    var _this = this
    // 先计算一下动态
    _this.calcDynamic()
    if (_this.timer) {
      return
    }

    _this.__loop = 0
    _this.timer = setInterval(function() {
      _this.calcDynamic()
      _this.__loop++
    }, 500)
  },

  calcDynamic: function() {
    var _this = this

    _this.getObjects().forEach(obj => {
      obj.calcDynamic(_this.__loop || 0)
    })

    _this.requestRenderAll()
  },

  initDynamic: function() {
    var _this = this

    _this.getObjects().forEach(obj => {
      obj.initDynamic()
      obj.set('selectable', false)
    })

    // 如果有初始化脚本, 执行初始化脚本
    if (_this.header && _this.header.initScript) {
      let func = `
      async function(event) {
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
  },

  rubikFindTargets: function(pointer) {
    return this.rubikSearchPossibleTargets(this._objects, pointer)
  },

  rubikSearchPossibleTargets: function(objects, pointer) {
    // targets to return
    const targets = []
    // Cache all targets where their bounding box contains point.
    let i = objects.length
    while (i--) {
      if (this._checkTarget(pointer, objects[i])) {
        const target = objects[i]
        targets.push(target)
        if (target instanceof fabric.Group) {
          const normalizedPointer = target.group ? this._rubikNormalizePointer(target, pointer) : this._normalizePointer(target, pointer)
          const subTargets = this.rubikSearchPossibleTargets(target._objects, normalizedPointer)
          targets.push(...subTargets)
        }
      }
    }

    return targets
  },

  _rubikNormalizePointer: function(object, pointer) {
    const m = object.calcTransformMatrix(true)
    const invertedM = fabric.util.invertTransform(m)
    return fabric.util.transformPoint(pointer, invertedM)
  }
})
