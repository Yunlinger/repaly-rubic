// lib

import fabric from './fabric'

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

    // 不保存图库内部图形
    delete obj.objects

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
  var url = process.env.MMI_ADDR + object.libName + '.json'
  var xhr = fabric.util.request(url, {
    onComplete: function() {
      if (xhr.status === 200) {
        var c = JSON.parse(xhr.response)
        delete object.objects
        object.objects = c.objects
        fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
          fabric.util.enlivenObjects([object.clipPath], function(enlivedClipPath) {
            var options = fabric.util.object.clone(object, true)
            options.clipPath = enlivedClipPath[0]
            delete options.objects
            var lib = new fabric.Lib(enlivenedObjects, options, true)
            lib.originParam = fabric.util.object.clone(c.param)
            lib.calcParam({ ...lib.originParam, ...lib.param })
            callback && callback(lib)
          })
        })
      } else {
        fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
          var lib = new fabric.Lib(enlivenedObjects, object)
          callback && callback(lib)
        })
      }
    }
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
