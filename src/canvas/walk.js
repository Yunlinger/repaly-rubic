import { fabric } from 'fabric'

fabric.StaticCanvas.prototype.walk = function(callback) {
  callback && this.forEachObject((obj) => {
    obj.walk(callback)
  })
}

fabric.Object.prototype.walk = function(callback) {
  callback && callback(this)
}

fabric.Group.prototype.walk = function(callback) {
  callback && this.forEachObject((obj) => {
    obj.walk(callback)
  })
  fabric.Object.prototype.walk.call(this, callback)
}

fabric.StaticCanvas.prototype.resizeWalk = function() {
  this.walk((obj) => {
    obj && obj.onCanvasResize && obj.onCanvasResize()
  })
}

fabric.StaticCanvas.prototype.walkUntilLib = function(callback) {
  callback && this.forEachObject((obj) => {
    obj.walkUntilLib(callback)
  })
}

fabric.Object.prototype.walkUntilLib = function(callback) {
  callback && callback(this)
}

fabric.Group.prototype.walkUntilLib = function(callback) {
  if (this.type !== 'lib') {
    callback && this.forEachObject((obj) => {
      obj.walkUntilLib(callback)
    })
  }
  fabric.Object.prototype.walkUntilLib.call(this, callback)
}
