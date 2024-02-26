// 打开远程画面文件

import { open, getUrl } from '@/api/res'
import store from '@/store'
import { fabric } from 'fabric'

const defaultHeader = {
  width: 1920,
  height: 1080,
  desc: '',
  type: 0,
  param: {}
}

fabric.StaticCanvas.prototype.initHeader = function() {
  this.header = { ...defaultHeader, ...this.header }
  if (this.header.width) {
    this.header.width = parseInt(this.header.width)
  }
  if (this.header.height) {
    this.header.height = parseInt(this.header.height)
  }
  this.param = this.param || {}
}

fabric.StaticCanvas.prototype.rubikLoadFromJSON = function(json, callback) {
  if (!json) {
    return
  }
  // serialize if it wasn't already
  var serialized = json

  var _this = this
  delete serialized.clipPath
  _this._enlivenObjects(serialized.objects, function(enlivenedObjects) {
    _this.clear()
    _this._setBgOverlay(serialized, function() {
      _this.rubikSetupCanvas(serialized, enlivenedObjects, false, callback)
    })
  }, null)
  return _this
}

fabric.StaticCanvas.prototype.rubikSetupCanvas = function(serialized, enlivenedObjects, renderOnAddRemove, callback) {
  var _this = this
  enlivenedObjects.forEach(function(obj, index) {
    // we splice the array just in case some custom classes restored from JSON
    // will add more object to canvas at canvas init.
    _this._objects.push(obj)
    _this._onObjectAdded && _this._onObjectAdded(obj)
  })
  this.renderOnAddRemove = renderOnAddRemove
  // remove parts i cannot set as options
  delete serialized.objects
  delete serialized.backgroundImage
  delete serialized.overlayImage
  delete serialized.background
  delete serialized.overlay
  // this._initOptions does too many things to just
  // call it. Normally loading an Object from JSON
  // create the Object instance. Here the Canvas is
  // already an instance and we are just loading things over it
  this._setOptions(serialized)
  callback && callback()
}

fabric.StaticCanvas.prototype.open = function(filePath, key) {
  this.cancelAnimFrame()
  var debug = true
  var lastTime = new Date()
  var _this = this
  debug && console.log('start', lastTime)
  return new Promise((resolve, reject) => {
    (() => {
      if (typeof filePath === 'string') {
        this.name = filePath
        let fullPath = _this.releaseMode ? ('mmi/' + filePath + '.release') : ('mmi/' + filePath + '.json')
        return new Promise((resolve) => {
          open(fullPath).then(response => {
            resolve({ response })
          }).catch((error) => {
            resolve({ error })
          })
        }).then(res => {
          if (res.error) {
            if (_this.releaseMode) {
              // 在 releaseMode, 并且读取 .release 文件出错, 尝试读取 .json 文件
              fullPath = 'mmi/' + filePath + '.json'
              return open(fullPath)
            }
            return Promise.reject(res.error)
          }
          return Promise.resolve(res.response)
        })
      } else if (typeof filePath === 'object') {
        return Promise.resolve(filePath)
      } else {
        return Promise.reject('invalid filePath')
      }
    })().then(res => {
      res = res || {}
      if (store.state.settings.showKey === 'isDcs' && key !== undefined) {
        store.dispatch('dcs_cache', { path: filePath, key: key })
      }
      if (store.state.settings.showKey === 'isJd' && key !== undefined) {
        store.dispatch('jd_cache', { path: filePath, key: key })
      }
      res.header = { ...defaultHeader, ...res.header }
      if (res.header.width) {
        res.header.width = parseInt(res.header.width)
      }
      if (res.header.height) {
        res.header.height = parseInt(res.header.height)
      }
      let oldHeader = _this.header
      let newHeader = res.header
      _this.walk(obj => obj.dispose && obj.dispose())
      if (res.header && res.header.backgroundImage && res.backgroundImage) {
        res.backgroundImage.src = getUrl('image/' + res.header.backgroundImage)
      }
      debug && console.log('fetch', (new Date()).getTime() - lastTime, 'ms')
      lastTime = new Date()
      _this.rubikLoadFromJSON(res, function() {
        debug && console.log('load', (new Date()).getTime() - lastTime, 'ms')
        lastTime = new Date()
        _this.initHeader()
        // 如果没有保存 backgroundImage, 则通过 header 中配置加载 backgroundImage
        if (_this.header.backgroundImage && _this.header.backgroundImage.length > 0 && !res.backgroundImage) {
          const imageUrl = getUrl('image/' + _this.header.backgroundImage)
          fabric.Image.fromURL(imageUrl, function(img) {
            img.set({
              scaleX: _this.header.width / img.get('width'),
              scaleY: _this.header.height / img.get('height'),
              originX: 'left',
              originY: 'top'
            })
            _this.setBackgroundImage(img, _this.requestRenderAll.bind(_this))
          })
        }

        // 记录历史的初始状态
        if (!_this.running) {
          _this.renderAll()
          // _this._historyInit && _this._historyInit()
        }

        // 适配画面大小
        if (_this.running && oldHeader && newHeader &&
          (oldHeader.width !== newHeader.width || oldHeader.height !== newHeader.height)) {
          var zoomX = _this.width / newHeader.width
          var zoomY = _this.height / newHeader.height

          // this.canvas.setZoom(Math.min(zoomX, zoomY))
          var vpt = _this.viewportTransform.slice(0)
          vpt[0] = zoomX
          vpt[3] = zoomY
          _this.setViewportTransform(vpt)
        }

        // 判断是否有 gif 元素
        if (_this.running) {
          _this.walk((item) => {
            if (item.type === 'rubik-gif') {
              _this.requestAnimFrame()
            }
          })
        }

        debug && console.log('render', (new Date()).getTime() - lastTime, 'ms')
        lastTime = new Date()
        _this.__loop = 0
        resolve()
      })
    }).catch(err => {
      reject(err)
    })
  })
}

fabric.StaticCanvas.prototype.removeUI = function() {
  this.walk(obj => obj.dispose && obj.dispose())
}
