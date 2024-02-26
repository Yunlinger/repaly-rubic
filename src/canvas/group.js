// group 相关操作

import { fabric } from 'fabric'

fabric.Canvas.prototype.opGroup = function() {
  if (!this.getActiveObject()) {
    return
  }
  if (this.getActiveObject().type !== 'activeSelection') {
    return
  }
  this.getActiveObject().toGroup()
  this.requestRenderAll()
}

fabric.Canvas.prototype.opUnGroup = function() {
  if (!this.getActiveObject()) {
    return
  }
  if (this.getActiveObject().type !== 'group') {
    return
  }
  this.getActiveObject().toActiveSelection().set('hasControls', false)
  this.requestRenderAll()
}
