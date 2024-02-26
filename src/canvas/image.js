// 远程图片 RubikImage 支持

import { fabric } from 'fabric'
import { getUrl } from '@/api/res'

fabric.RubikImage = fabric.util.createClass(fabric.Image, {
  type: 'rubik-image',

  rsrc: '',

  loaded: false,

  stateProperties: fabric.Image.prototype.stateProperties.concat('rsrc'),

  cacheProperties: fabric.Image.prototype.cacheProperties.concat('rsrc'),

  initialize: function(img, options) {
    this.callSuper('initialize', img, options)
    options && this.set('rsrc', options.rsrc)
  },

  toObject: function(propertiesToInclude) {
    var obj = this.callSuper('toObject', ['rsrc'].concat(propertiesToInclude))
    delete obj.src
    return obj
  }
})

fabric.RubikImage.async = true

fabric.RubikImage.fromFile = function(name, callback, imgOptions) {
  fabric.util.loadImage(getUrl(`image/${name}`), function(img) {
    imgOptions = imgOptions || {}
    imgOptions.rsrc = name
    callback && callback(new fabric.RubikImage(img, imgOptions))
  }, null, imgOptions && imgOptions.crossOrigin)
}

fabric.RubikImage.fromObject = function(object, callback) {
  object.src = getUrl(`image/${object.rsrc}`)
  fabric.util.loadImage(object.src, function(img) {
    callback && callback(new fabric.RubikImage(img, object))
  })
}

fabric.RubikImage.prototype.set = function(key, value) {
  var _this = this
  if (key === 'rsrc') {
    if (value === this.get('rsrc') && this.loaded) {
      return this
    }
    _this.rsrc = value
    let imgPath = getUrl(`image/${value}`)
    let width = _this.width
    let height = _this.height
    let scaleX = _this.scaleX
    let scaleY = _this.scaleY
    _this.setSrc(imgPath, function(img) {
      if (img.width === 0 || img.height === 0) {
        // 没有图片时显示缺省图片
        let defaultImagePath = getUrl('image/default.png')
        _this.setSrc(defaultImagePath, function(img) {
          if (!(img.width === 0 || img.height === 0)) {
            img.set('scaleX', width / img.width * scaleX)
            img.set('scaleY', height / img.height * scaleY)
            img.set('dirty', true)
            _this.loaded = true
          }
        })
      } else {
        // 确保图片尺寸不变
        img.set('scaleX', width / img.width * scaleX)
        img.set('scaleY', height / img.height * scaleY)
        img.set('dirty', true)
      }
      _this.loaded = true
      img.set('dirty', true)
      img.canvas && img.canvas.requestRenderAll()
    })
    return _this
  } else {
    return _this.callSuper('set', key, value)
  }
}
