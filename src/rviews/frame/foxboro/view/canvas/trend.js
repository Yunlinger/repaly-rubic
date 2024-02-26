// trend

import { getTrendData } from '../../trend'
import fabric from './fabric'

fabric.Trend = fabric.util.createClass(fabric.Rect, {
  type: 'trend',

  stateProperties: fabric.Rect.prototype.stateProperties.concat('selfLoop'),

  pen: {},

  selfLoop: 0,

  initialize: function(options) {
    this.callSuper('initialize', options)
  },

  calcDynamic: function(loop) {
    this.callSuper('calcDynamic', loop)
    this.set('selfLoop', this.get('selfLoop') + 1)
  },

  _render: function(ctx) {
    const w = this.width
    const h = this.height - 14
    const x = -this.width / 2
    const y = -this.height / 2
    const yStep = h / 4
    const xStep = w / 3
    ctx.strokeStyle = '#c0c0c0'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      ctx.moveTo(x, y + yStep * i)
      ctx.lineTo(x + w, y + yStep * i)
    }
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(x + xStep * i, y)
      ctx.lineTo(x + xStep * i, y + h)
    }
    this._renderStroke(ctx)
    ctx.lineWidth = 1
    const trendStep = w / 600
    for (const penid in this.pen) {
      const pen = this.getPen(penid)
      if (!pen) {
        continue
      }
      if (!pen.pen_var || pen.pen_var.length === 0) {
        continue
      }
      if (pen.pen_var === 'P1') {
        pen.pen_var = window.$P1 + '.PNT'
        pen.pen_desc = this.getLocalString(window.$P1 + '.DESCRP')
        pen.pen_yhscale = this.getLocalString(window.$P1 + '.HSCO1')
        pen.pen_ylscale = this.getLocalString(window.$P1 + '.LSCO1')
        pen.pen_engunits = this.getLocalString(window.$P1 + '.EO1')
      }
      ctx.strokeStyle = pen.pen_color
      const values = getTrendData(pen.pen_var)
      if (values.length <= 1) {
        continue
      }
      ctx.beginPath()
      const yhscale = pen.pen_yhscale - 0
      const ylscale = pen.pen_ylscale - 0
      if (yhscale <= ylscale) {
        continue
      }
      for (let i = 0; i < 600 && i < values.length; i++) {
        let value = Math.max(values[i], ylscale)
        value = Math.min(value, yhscale)
        if (i === 0) {
          ctx.moveTo(x + w, y + h - (value - ylscale) / (yhscale - ylscale) * h)
        } else {
          ctx.lineTo(x + w - trendStep * i, y + h - (value - ylscale) / (yhscale - ylscale) * h)
        }
      }
      this._renderStroke(ctx)
    }
  },

  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', ['pen'].concat(propertiesToInclude))
  }

})

fabric.Trend.fromObject = function(object, callback) {
  return fabric.Object._fromObject('Trend', object, callback)
}

fabric.Object.prototype.getVarOfPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id] ? p.trend[id].pen_var : ''
    }
    p = p.group
  }
  return ''
}

fabric.Object.prototype.getDescOfPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id] ? p.trend[id].pen_desc : ''
    }
    p = p.group
  }
  return ''
}

fabric.Object.prototype.getYhscaleOfPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id] ? p.trend[id].pen_yhscale : ''
    }
    p = p.group
  }
  return ''
}

fabric.Object.prototype.getYlscaleOfPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id] ? p.trend[id].pen_ylscale : ''
    }
    p = p.group
  }
  return ''
}

fabric.Object.prototype.getUnitOfPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id] ? p.trend[id].pen_engunits : ''
    }
    p = p.group
  }
  return ''
}

fabric.Object.prototype.getColorOfPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id] ? p.trend[id].pen_color : '#ffffff'
    }
    p = p.group
  }
  return '#ffffff'
}

fabric.Object.prototype.getPen = function(id) {
  let p = this.group
  while (p) {
    if (p.trend) {
      return p.trend[id]
    }
    p = p.group
  }
  return ''
}
