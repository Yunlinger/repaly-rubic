// lib 添加fabric对图元的支持

import { open } from '@/api/res'
import { fabric } from 'fabric'

fabric.Lib = fabric.util.createClass(fabric.Group, {
  type: 'lib',

  initialize: function(objects, options) {
    options || (options = {})

    this.callSuper('initialize', objects, options)
    this.set('libName', options.libName || 'default')
  },

  toObject: function(propertiesToInclude) {
    var obj = fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
      libName: this.get('libName')
    })

    if (this.canvas && this.canvas.releaseMode) {
      // releaseMode 将 lib 保存为 group
      obj.type = 'group'
    } else {
      // 普通模式不保存图库内部图形
      delete obj.objects
    }

    return obj
  },

  _render: function(ctx) {
    this.callSuper('_render', ctx)
  },

  calcParam: function(param) {
    var _this = this

    if (!param) {
      return
    }

    for (var key in param) {
      var value = param[key]
      _this.getObjects().forEach(obj => {
        obj.initParam(key, value)
      })
    }
  }
})

fabric.Lib.async = true
fabric.Lib.fromObject = function(object, callback) {
  open('mmi/' + object.libName + '.json').then(c => {
    delete object.objects
    object.objects = c.objects
    fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
      fabric.util.enlivenObjects([object.clipPath], function(enlivedClipPath) {
        let options = fabric.util.object.clone(object, true)
        options.clipPath = enlivedClipPath[0]
        let instWidth = options.width
        let instHeight = options.height
        delete options.objects
        // 清除长宽信息, 获取图元的原始尺寸
        delete options.width
        delete options.height
        let lib = new fabric.Lib(enlivenedObjects, options, true)
        // 当图元的原始尺寸和图页中保存的尺寸不匹配时(添加图元后修改了图元尺寸).调整缩放比例.
        if (Math.abs(instWidth - lib.width) > 0.5) {
          lib.set('scaleX', lib.scaleX * instWidth / lib.width)
        }
        if (Math.abs(instHeight - lib.height) > 0.5) {
          lib.set('scaleY', lib.scaleY * instHeight / lib.height)
        }
        lib.originParam = fabric.util.object.clone(c.param)
        lib.calcParam({ ...lib.originParam, ...lib.param })
        callback && callback(lib)
      })
    })
  }).catch(err => {
    console.log(err)
    fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
      var lib = new fabric.Lib(enlivenedObjects, object)
      callback && callback(lib)
    })
  })
}

fabric.StaticCanvas.prototype.calcParam = function(param) {
  var _this = this

  if (!param) {
    return
  }

  for (var key in param) {
    var value = param[key]
    _this.getObjects().forEach(obj => {
      obj.initParam(key, value)
    })
  }
}

fabric.StaticCanvas.prototype.reloadAttr = function() {
  this.getObjects().forEach(obj => {
    obj.reloadAttr()
  })
}

fabric.Object.prototype.reloadAttr = function() {
  if (this.isText()) {
    this.text = this.text_bck || ''
  }
}

fabric.Group.prototype.reloadAttr = function() {
  this.getObjects().forEach(obj => {
    obj.reloadAttr()
  })
  this.callSuper('reloadAttr')
}

