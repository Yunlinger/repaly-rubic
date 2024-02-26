/* eslint-disable */
import fabric from './fabric'
import { Message } from 'element-ui'
import { replacePulseVar } from '../../api/rtd'
import ctxmenu from '../components/ctxmenu'
import Vue from 'vue'

// 对 fabric.js 的扩展

fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.cornerSize = 8
fabric.Object.prototype.set({
  snapThreshold: 2.5,
  snapAngle: 5
})
// 设置 center, 方便对齐.
// fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

fabric.RubikCanvas = fabric.util.createClass(fabric.Canvas, {
  type: 'rubikCanvas',
  initialize: function(domID, options) {
    options || (options = {})
    options.preserveObjectStacking = true
    options.imageSmoothingEnabled = false
    options.stopContextMenu = true
    options.fireRightClick = true
    this.domID = domID
    this.callSuper('initialize', domID, options)

    this.renderBounds()
    this.setupEvent()
    this.initHeader()
    this.hoverCursor = 'default'
  },

  initHeader: function() {
    var _this = this

    _this.rwidth = 1024
    _this.rheight = 768
    _this.rtype = 0
    _this.rdesc = ''
  },

  // 绘制边界
  renderBounds: function() {
    var _this = this

    _this.on('after:render', function() {
      _this.contextContainer.strokeStyle = '#555'
      var left = 0 - _this.vptCoords.tl.x * _this.getZoom()
      var top = 0 - _this.vptCoords.tl.y * _this.getZoom()
      var width = (_this.rwidth) || 1024
      var height = (_this.rheight) || 768
      let vpt = _this.viewportTransform.slice(0)
      let zoomX = vpt[0]
      let zoomY = vpt[3]
      _this.contextContainer.strokeRect(left, top, width * zoomX, height * zoomY)
    })
  },

  // 其他事件响应函数
  setupEvent: function() {
    var _this = this

    // 滚轮
    _this.on('mouse:wheel', function(opt) {
      if (opt.e.shiftKey) {
        var delta = opt.e.deltaY
        var zoom = _this.getZoom()
        if (delta < 0) {
          zoom = zoom * 1.2
        } else if (delta > 0) {
          zoom = zoom / 1.2
        }
        _this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
        // _this.zoomToPoint({ x: 0, y: 0 }, zoom)
        _this.calcOffset()
        opt.e.preventDefault()
        opt.e.stopPropagation()
      }
    })

    // 选中
    _this.on('selection:updated', function(opt) {
      if (opt.target.type === 'activeSelection') {
        opt.target.set('hasControls', false)
      }
      _this.showProperty()
    })

    _this.on('selection:created', function(opt) {
      if (opt.target.type === 'activeSelection') {
        opt.target.set('hasControls', false)
      }
      _this.showProperty()
    })

    _this.on('selection:cleared', function(opt) {
      _this.showProperty()
    })

    // 清除
    _this.on('canvas:cleared', function() {
      clearTimeout(_this.timer)
      _this.timer = null
    })

    // 点击事件
    _this.on('mouse:down', function(opt) {
      ctxmenu.closeAll()
      var pointer = _this.getPointer(opt.e, true)
      if (!pointer) {
        return
      }
      var targets = _this.rubikFindTargets(pointer)
      if (!_this.running) {
        return
      }
      if (opt.e.which === 3) {
        // right button
        let vars = []
        targets.forEach(obj => {
          if (obj.var) {
            for (let key in obj.var) {
              let varf = obj.var[key]
              // eslint-disable-next-line no-new-func
              let f = new Function(`return ${varf}`)
              let theVar = replacePulseVar(f.call(obj))
              if (theVar) {
                vars.push({
                  caption: key + '    ' + theVar,
                  callback: () => {
                    Vue.prototype.$copyText(theVar)
                    Message.success('复制变量: ' + theVar)
                  }
                })
              }
            }
          }
        })
        if (vars.length > 0) {
          ctxmenu.open({ vars }, opt.e)
        }
        return
      }
      if (opt.e.ctrlKey) {
        console.log('脚本:')
        targets.forEach(obj => {
          if (obj.dyn) {
            for (let key in obj.dyn) {
              console.log({[key]: obj.dyn[key]})
            }
          }
        })
      } else if (opt.e.altKey) {
        console.log('变量:')
        let cvar = ''
        targets.forEach(obj => {
          if (obj.var) {
            for (let key in obj.var) {
              let varf = obj.var[key]
              // eslint-disable-next-line no-new-func
              let f = new Function(`return ${varf}`)
              let theVar = replacePulseVar(f.call(obj))
              console.log(key, theVar)
              if (!cvar) {
                cvar = theVar
                Vue.prototype.$copyText(theVar)
                Message.success('复制变量: ' + cvar)
              }
            }
          }
        })
      } else {
        targets.forEach(obj => {
          obj.dynf && obj.dynf['click'] && obj.dynf['click'].call(obj, opt.e)
        })
      }
    })

    _this.on('drop', function(opt) {
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
      })
    })

    _this.on('object:modified', function(opt) {
      if (!(opt.target.scaleX !== 1 || opt.target.scaleY !== 1)) {
        return
      }

      switch (opt.target.type) {
        case 'rect':
        case 'triangle':
          var prop = {
            scaleX: 1,
            scaleY: 1,
            width: opt.target.width * opt.target.scaleX,
            height: opt.target.height * opt.target.scaleY
          }
          opt.target.set(prop)
          break
        case 'ellipse':
          prop = {
            scaleX: 1,
            scaleY: 1,
            rx: opt.target.rx * opt.target.scaleX,
            ry: opt.target.ry * opt.target.scaleY
          }
          opt.target.set(prop)
          break
        case 'polyline':
        case 'polygon':
          var poly = opt.target
          var dim = poly._calcDimensions()
          poly.points.forEach(function(v) {
            v.x = poly.left + (v.x - dim.left) * poly.scaleX
            v.y = poly.top + (v.y - dim.top) * poly.scaleY
          })

          dim = poly._calcDimensions()
          poly.set({
            scaleX: 1,
            scaleY: 1,
            ...dim,
            pathOffset: {
              x: dim.left + dim.width / 2,
              y: dim.top + dim.height / 2
            }
          })
          poly.setCoords()
          break
      }
    })

    // FreeDraw 结束
    _this.on('path:created', function(opt) {
      _this.isDrawingMode = false
    })

    // 添加基本图形
    _this.on('mouse:down', function(opt) {
      if (!_this.insertGraphType) {
        return
      }
      var pointer = _this.getPointer(opt.e, false)
      var graph = null

      switch (_this.insertGraphType) {
        case 'rect':
          graph = new fabric.Rect({
            top: pointer.y,
            left: pointer.x,
            width: 20,
            height: 20,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'ellipse':
          graph = new fabric.Ellipse({
            top: pointer.y,
            left: pointer.x,
            rx: 15,
            ry: 10,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'triangle':
          graph = new fabric.Triangle({
            top: pointer.y,
            left: pointer.x,
            width: 20,
            height: 20,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'circle':
          graph = new fabric.Circle({
            top: pointer.y,
            left: pointer.x,
            radius: 25,
            fill: '',
            stroke: '#000'
          })
          _this.add(graph)
          break

        case 'rimage':
          fabric.RubikImage.fromFile('default.png', function(image) {
            image.set({
              top: pointer.y,
              left: pointer.x
            }).setCoords()
            _this.add(image)
            _this.setActiveObject(image)
          })
          break
        case 'image':
          fabric.Image.fromURL(process.env.IMAGE_ADDR + 'default.png', function(image) {
            image.set({
              top: pointer.y,
              left: pointer.x
            }).setCoords()
            _this.add(image)
            _this.setActiveObject(image)
          })
          break

        case 'text':
          graph = new fabric.IText('text', {
            top: pointer.y,
            left: pointer.x,
            fontFamily: 'helvetica',
            fontSize: 16
          })
          _this.add(graph)
          break

        case 'textbox':
          graph = new fabric.Textbox('textbox', {
            top: pointer.y,
            left: pointer.x,
            width: 100,
            fontFamily: 'helvetica',
            fontSize: 16,
            backgroundColor: '#ddd'
          })
          _this.add(graph)
          break
      }

      if (graph) {
        _this.setActiveObject(graph)
      }
      _this.insertGraphType = false
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
      console.log(p)
      if (!canvas.isDrawingPolyBegin) {
        canvas.isDrawingPolyBegin = true
        var poly = new fabric.Polyline([p, p], {
          stroke: 'red',
          strokeWidth: 1,
          fill: 'transparent',
          left: p.x,
          top: p.y,
          originX: 'left',
          originY: 'top'
        })
        console.log(poly)
        canvas.add(poly)
      } else {
        var objs = canvas.getObjects()
        poly = objs[objs.length - 1]
        if (p.x !== poly.points[poly.points.length - 2].x || p.y !== poly.points[poly.points.length - 2].y) {
          poly.points.push(p)
        }
        canvas.remove(poly)
        if (canvas.isDrawPolygon) {
          poly = new fabric.Polygon(poly.points, {
            stroke: 'red',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        } else {
          poly = new fabric.Polyline(poly.points, {
            stroke: 'red',
            strokeWidth: 1,
            fill: 'transparent',
            originX: 'left',
            originY: 'top'
          })
        }
        canvas.add(poly)
      }
    })
  },

  beginDrawPolyline: function(isPolygon) {
    this.isDrawingPolyMode = true
    this.isDrawPolygon = !!isPolygon
    this.isDrawingPolyBegin = false
  },

  interGraph: function(graphType) {
    this.insertGraphType = graphType
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

    if (_this.timer) {
      return
    }

    var loop = 0
    _this.timer = setInterval(function() {
      _this.calcDynamic(loop++)
    }, 500)
  },

  calcDynamic: function(loop) {
    var _this = this

    _this.getObjects().forEach(obj => {
      obj.calcDynamic(loop)
    })

    _this.requestRenderAll()
  },

  initDynamic: function() {
    var _this = this

    _this.getObjects().forEach(obj => {
      obj.initDynamic()
      obj.set('selectable', false)
    })
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

fabric.Object.prototype.calcDynamic = function(loop) {
  var _this = this

  if (!_this.dynf) {
    return
  }
  let alreadySetFColor = false
  let alreadySetEColor = false
  let alreadySetTColor = false
  for (var key in _this.dynf) {
    switch (key) {
      case 'rclick':
      case 'click':
        break
      case 'angle':
        _this.rotate(_this.dynf[key].call(_this, loop) % 360)
        break

      case 'clip':
        var clip = _this.dynf[key].call(_this, loop)
        if (_this.__oldClip !== clip) {
          _this.__oldClip = clip
          _this.clipTo = function(ctx) {
            ctx.rect(0 - _this.width / 2 - _this.strokeWidth,
              _this.height * (0.5 - clip),
              _this.width + _this.strokeWidth * 2,
              _this.height * clip + _this.strokeWidth)
          }
          _this.set('dirty', true)
        }
        break
      case 'fpct':
        let fpct = _this.dynf[key].call(_this, loop)
        _this.set(key, fpct)
        _this.set('dirty', true)
        break
      case 'text':
        if (_this.isEditing) {
          break
        } else {
          _this.set(key, _this.dynf[key].call(_this, loop))
        }
        break
      case 'fcolor':
        if (!alreadySetFColor) {
          _this.iaDynFColor(_this.dynf[key].call(_this, loop))
        }
        break
      case 'fblink':
        if (_this.dynf[key].call(_this, loop) && (loop % 2)) {
          _this.iaDynFColor('#b0b0b0')
          alreadySetFColor = true
        }
        break
      case 'tblink':
        if (_this.dynf[key].call(_this, loop) && (loop % 2)) {
          _this.iaDynTColor('#b0b0b0')
          alreadySetTColor = true
        }
        break
      case 'eblink':
        if (_this.dynf[key].call(_this, loop) && (loop % 2)) {
          _this.iaDynEColor('#b0b0b0')
          alreadySetEColor = true
        }
        break
      case 'ecolor':
        if (!alreadySetEColor) {
          _this.iaDynEColor(_this.dynf[key].call(_this, loop))
        }
        break
      case 'tcolor':
        if (!alreadySetTColor) {
          _this.iaDynTColor(_this.dynf[key].call(_this, loop))
        }
        break
      default:
        _this.set(key, _this.dynf[key].call(_this, loop))
        break
    }
  }
}

fabric.Group.prototype.calcDynamic = function(loop) {
  var _this = this

  _this.callSuper('calcDynamic', loop)

  _this.getObjects().forEach(obj => {
    obj.calcDynamic(loop)
  })
}

fabric.Object.prototype.initDynamic = function() {
  var _this = this
  _this.isText = (_this.type === 'text' || _this.type === 'itext' || _this.type === 'textbox')

  if (!_this.dyn) {
    return
  }

  _this.dynf = null

  for (var key in _this.dyn) {
    _this.dynf = _this.dynf || {}
    try {
      if (key === 'init') {
        // eslint-disable-next-line no-new-func
        let f = new Function(_this.dyn[key])
        f.call(_this)
        _this.set('dirty', true)
        _this.canvas.requestRenderAll()
      } else if (key !== 'click') {
        // eslint-disable-next-line no-new-func
        const f = new Function('loop', _this.dyn[key])
        if (f) {
          _this.dynf[key] = f
        } else {
          console.log('生成函数失败,', _this.dyn[key])
        }
      } else {
        // eslint-disable-next-line no-new-func
        const f = new Function('evnet', 'this.event = event; ' + _this.dyn[key])
        if (f) {
          _this.dynf[key] = f
        } else {
          console.log('生成函数失败,', _this.dyn[key])
        }
      }
    } catch (err) {
      console.log(_this.dyn[key])
      console.error(err)
    }
  }
}

fabric.Group.prototype.initDynamic = function() {
  var _this = this

  _this.callSuper('initDynamic')

  _this.getObjects().forEach(obj => {
    obj.initDynamic()
  })
}

fabric.Object.prototype.initParam = function(key, value) {
  var _this = this

  if (_this.dyn) {
    for (var _key in _this.dyn) {
      _this.dyn[_key] = _this.dyn[_key].replace('{' + key + '}', value)
    }
  }

  if (typeof _this.get('text') === 'string') {
    _this.set('text', _this.get('text').replace('{' + key + '}', value))
  }
}

fabric.Group.prototype.initParam = function(key, value) {
  var _this = this

  _this.getObjects().forEach(obj => {
    obj.initParam(key, value)
  })
  _this.callSuper('initParam', key, value)
}

// 运行时可以通过 group.set 修改组内属性。
fabric.Group.prototype.set = function(name, value) {
  if (this.canvas && this.canvas.running === true &&
    (name === 'fill' || name === 'stroke')) {
    this.getObjects().forEach(function(obj) {
      obj.set(name, value)
    })
    return this
  } else {
    return this.callSuper('set', name, value)
  }
}

const objectSet = fabric.Object.prototype.set

fabric.Object.prototype.set = function(name, value) {
  if (this.canvas && this.canvas.running === true &&
    (name === 'fill' || name === 'stroke')) {
    if (name === 'fill' && this.get('fill')) {
      objectSet.call(this, name, value)
    } else if (name === 'stroke' && this.get('stroke')) {
      objectSet.call(this, name, value)
    }
    return this
  } else {
    return objectSet.call(this, name, value)
  }
}

// 保存时删除 clipTo 函数
fabric.Canvas.prototype.rmClipTo = function() {
  var _this = this

  _this.forEachObject(function(obj) {
    obj.rmClipTo()
  })
}

fabric.Object.prototype.rmClipTo = function() {
  var _this = this

  delete _this.clipTo
}

fabric.Group.prototype.rmClipTo = function() {
  var _this = this

  delete _this.clipTo

  _this.forEachObject(function(obj) {
    obj.rmClipTo()
  })
}
