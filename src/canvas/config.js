import { fabric } from 'fabric'

fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.cornerSize = 8
fabric.Object.prototype.strokeUniform = true
fabric.Object.prototype.set({
  snapThreshold: 2.5,
  snapAngle: 5
})
fabric.Object.prototype.hoverCursor = 'default'
// 设置 center, 方便对齐.
// fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'
