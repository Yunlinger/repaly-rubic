// button

import { fabric } from 'fabric'

fabric.Button = fabric.util.createClass(fabric.Textbox, {
  type: 'button',

  beMousedown: false,

  stateProperties: fabric.Textbox.prototype.stateProperties.concat('beMousedown'),

  cacheProperties: fabric.Textbox.prototype.cacheProperties.concat('beMousedown'),

  initialize: function(text, options) {
    let def = { textAlign: 'center', editable: false }
    options = { ...options, ...def }
    this.callSuper('initialize', text, options)
    if (!options.scaleY) {
      this.set('scaleY', options.height / this.get('height'))
    }
  },

  _drawLine: function(ctx) {
    ctx.save()
    if (this.strokeUniform) {
      ctx.scale(1 / this.scaleX, 1 / this.scaleY)
    }
    this._setLineDash(ctx, [])
    this._setStrokeStyles(ctx, this)
    ctx.stroke()
    ctx.restore()
  },

  _render: function(ctx) {
    // rend stroke
    this.callSuper('_render', ctx)

    // /*
    let w = this.width
    let h = this.height
    let x = -this.width / 2
    let y = -this.height / 2

    let stroke = this.stroke
    let strokeWidth = this.strokeWidth

    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x + w, y)

    let downFlag = this.beMousedown && (!this.disabled)

    this.stroke = downFlag ? '#EFEFEF' : '#5F5F5F'
    this.strokeWidth = 1
    this._drawLine(ctx)

    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.lineTo(x, y)
    ctx.lineTo(x + w, y)

    this.stroke = (!downFlag) ? '#EFEFEF' : '#5F5F5F'
    this.strokeWidth = 1
    this._drawLine(ctx)

    this.stroke = stroke
    this.strokeWidth = strokeWidth
    // */
  },

  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', [].concat(propertiesToInclude))
  }
})

fabric.Button.fromObject = function(object, callback) {
  return fabric.Object._fromObject('Button', object, callback, 'text')
}
