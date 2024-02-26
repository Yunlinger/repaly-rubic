// bar

import fabric from './fabric'

fabric.Bar = fabric.util.createClass(fabric.Rect, {
  type: 'bar',

  stateProperties: fabric.Rect.prototype.stateProperties.concat('fpct', 'fdir'),

  fpct: 0.6,

  fdir: 0,

  initialize: function(options) {
    this.callSuper('initialize', options)
  },

  _render: function(ctx) {
    // 1x1 case (used in spray brush) optimization was removed because
    // with caching and higher zoom level this makes more damage than help
    var w = this.width
    var h = this.height
    var x = -this.width / 2
    var y = -this.height / 2
    // render fill
    var fpct = Math.max(this.fpct, 0)
    fpct = Math.min(fpct, 1)
    switch (this.fdir) {
      default :
      case 0:
        h = this.height * fpct
        y = -this.height / 2 + (this.height * (1 - fpct))
        break
      case 1:
      case 3:
        w = this.width * fpct
        break
    }
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y)
    ctx.closePath()
    this._renderFill(ctx)
    // rend stroke
    w = this.width
    h = this.height
    x = -this.width / 2
    y = -this.height / 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y)
    ctx.closePath()
    this._renderStroke(ctx)
  },

  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', ['fpct', 'fdir'].concat(propertiesToInclude))
  }

})

fabric.Bar.fromObject = function(object, callback) {
  return fabric.Object._fromObject('Bar', object, callback)
}
