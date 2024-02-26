// bar 添加 fabric 对棒图的支持

import { fabric } from 'fabric'

fabric.Bar = fabric.util.createClass(fabric.Rect, {
  type: 'bar',

  stateProperties: fabric.Rect.prototype.stateProperties.concat('fpct', 'fdir', 'fstyle'),

  cacheProperties: fabric.Rect.prototype.cacheProperties.concat('fpct', 'fdir', 'fstyle'),

  fpct: 0.6,

  fdir: 0,

  fstyle: 'rect',

  initialize: function(options) {
    this.callSuper('initialize', options)
  },

  _renderRect: function(ctx) {
    var w = this.width
    var h = this.height
    var x = -this.width / 2
    var y = -this.height / 2
    // render fill
    let fdir = this.fdir % 5
    let fpct = Math.max(this.fpct, -1)
    if (fdir < 4) {
      fpct = Math.max(this.fpct, 0)
    }
    fpct = Math.min(fpct, 1)
    ctx.beginPath()

    switch (fdir) {
      case 1:
        w = this.width * fpct
        break
      case 2:
        h = this.height * fpct
        break
      case 3:
        w = this.width * fpct
        x = this.width / 2 - this.width * fpct
        break
      case 4: // 中心向外
        if (fpct >= 0) {
          h = this.height / 2 * fpct
          y = 0 - this.height / 2 * fpct
        } else {
          h = 0 - this.height / 2 * fpct
          y = 0
        }
        break
      case 0:
      default:
        h = this.height * fpct
        y = this.height / 2 - this.height * fpct
        break
    }
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

  _renderCircle: function(ctx) {
    var w = this.width
    var h = this.height
    // render fill
    let fpct = Math.max(this.fpct, 0)
    fpct = Math.min(fpct, 1)
    let startAngle = Math.asin((0.5 - fpct) * 2)
    let endAngle = Math.PI - startAngle

    let fdir = this.fdir % 4
    startAngle += Math.PI / 2 * fdir
    endAngle += Math.PI / 2 * fdir

    ctx.beginPath()
    ctx.save()
    ctx.transform(1, 0, 0, h / w, 0, 0)
    ctx.arc(
      0,
      0,
      w / 2,
      startAngle,
      endAngle,
      false
    )
    ctx.restore()
    this._renderFill(ctx)

    // rend stroke
    w = this.width
    h = this.height
    ctx.beginPath()
    ctx.save()
    ctx.transform(1, 0, 0, h / w, 0, 0)
    ctx.arc(
      0,
      0,
      w / 2,
      0,
      Math.PI * 2,
      false
    )
    ctx.restore()
    this._renderStroke(ctx)
  },

  _render: function(ctx) {
    // 1x1 case (used in spray brush) optimization was removed because
    // with caching and higher zoom level this makes more damage than help
    if (this.fstyle === 'circle') {
      return this._renderCircle(ctx)
    } else {
      return this._renderRect(ctx)
    }
  },

  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', ['fpct', 'fdir', 'fstyle'].concat(propertiesToInclude))
  }

})

fabric.Bar.fromObject = function(object, callback) {
  return fabric.Object._fromObject('Bar', object, callback)
}
