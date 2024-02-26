// chart 添加 fabric 对 echart 的支持

import { fabric } from 'fabric'
import * as echarts from 'echarts'
import { hist } from '@/api/rtdb'
import { getValue } from '@/api/rtd'
import defaultOption from './chartoption'

fabric.Chart = fabric.util.createClass(fabric.Rect, {
  type: 'chart',

  stateProperties: fabric.Rect.prototype.stateProperties.concat('config', 'cssText'),

  cacheProperties: fabric.Rect.prototype.cacheProperties.concat('config', 'cssText'),

  config: {
    generateOption: `
function(config) {
    return ${JSON.stringify(defaultOption, null, '    ')}
}
`,
    generateDataset: `
function(config, data, myChart) {
    return data
}
`,
    otherFunc: `
function(config, myChart) {
    // add custom event handler here
}
`,

    history: false, // history == false 获取实时值, 否则获取历史数据
    interval: 5,
    start: '-1h',
    stop: 'now()',
    groupby: '10s',
    fn: 'mean',
    vars: []
  },

  cssText: '',

  initialize: function(options) {
    this.callSuper('initialize', options)
    if (!this.config) {
      this.set('config', {
        generateOption: `return ${JSON.stringify(defaultOption, null, '    ')}`,
        generateDataset: '',
        otherFunc: ''
      })
    } else {
      this.set('config', this.config)
    }
  },

  // 根据 config 中的函数定义字符串生成函数
  evalFunc: function() {
    if (!this.config) {
      return
    }
    let f
    if (this.config.generateOption) {
      f = null
      try {
        // eslint-disable-next-line
        eval('f = ' + this.config.generateOption + ' ')
      } catch (error) {
        console.log('eval optionFunc error:', error)
      }
      this._generateOption = f
    }

    if (this.config.generateDataset) {
      f = null
      try {
        // eslint-disable-next-line
        eval('f = ' + this.config.generateDataset + ' ')
      } catch (error) {
        console.log('eval optionFunc error:', error)
      }
      this._generateDataset = f
    }

    if (this.config.otherFunc) {
      f = null
      try {
        // eslint-disable-next-line
        eval('f = ' + this.config.otherFunc + ' ')
      } catch (error) {
        console.log('eval optionFunc error:', error)
      }
      this._otherFunc = f
    }
  },

  // 生成并且设置 Option
  genAndSetOption() {
    this.evalFunc()
    try {
      if (this._generateOption) {
        let option = this._generateOption(this.config)
        if (option && this.chartInst) {
          this.chartInst.setOption(option, true)
        }
      }
    } catch (error) {
      console.log('chartInst.setOption() error', error)
    }
  },

  dispose: function() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
    if (this.chartInst) {
      this.chartInst.dispose()
    }
    if (this.ecanvas && this.canvas.uiContainer) {
      this.canvas.uiContainer.removeChild(this.ecanvas)
    }
  },

  getChartStyle: function() {
    let style = {}
    if (!this.canvas.running) {
      style['display'] = 'none'
    }
    let vpt = this.getViewportTransform()
    let matrix = this.calcTransformMatrix()
    matrix = fabric.util.multiplyTransformMatrices(vpt, matrix)
    let lt = fabric.util.transformPoint(new fabric.Point(0 - this.width / 2, 0 - this.height / 2), matrix, false)
    let opt = fabric.util.qrDecompose(matrix)

    style['pointer-events'] = 'all'
    style['position'] = 'absolute'
    style['left'] = `${lt.x}px`
    style['top'] = `${lt.y}px`
    style['width'] = `${this.width * opt.scaleX}px`
    style['height'] = `${this.height * opt.scaleY}px`

    let s = ''
    for (let k in style) {
      s += `${k}: ${style[k]};`
    }

    return {
      cssText: s,
      width: this.width * opt.scaleX,
      height: this.height * opt.scaleY
    }
  },

  _render: function(ctx) {
    let imageSmoothingEnabled = ctx.imageSmoothingEnabled
    ctx.imageSmoothingEnabled = false

    if (!this.ecanvas) {
      // 生成 echart 使用的 Canvas
      this.ecanvas = document.createElement('canvas')
      let style = this.getChartStyle()
      this.ecanvas.style.cssText = style.cssText
      this.canvas.uiContainer.appendChild(this.ecanvas)
      // document.body.appendChild(this.ecanvas)
      this.ecanvas.setAttribute('width', style.width)
      this.ecanvas.setAttribute('height', style.height)
      this.chartInst = echarts.init(this.ecanvas)
      this.genAndSetOption()
      if (!this.canvas.running) {
        this.chartInst.on('rendered', () => {
          this.set('dirty', true)
          this.canvas.requestRenderAll()
        })
      }
      // 启动自动更新数据定时器
      if (this.canvas.running && !this.updateTimer) {
        this.updateHistData()
        this.updateTimer = setInterval(() => {
          this.updateHistData()
        }, (this.config.interval || 5) * 1000)
      }
    }
    if (this.ecanvas) {
      let style = this.getChartStyle()
      if (this.chartInst) {
        this.chartInst.resize({ width: style.width, height: style.height })
        this.cssText = style.cssText
        this.ecanvas.style.cssText = style.cssText
      }
      if (!this.canvas.running) {
        ctx.drawImage(this.ecanvas, -this.width / 2, -this.height / 2, this.width, this.height)
      }
    }
    ctx.imageSmoothingEnabled = imageSmoothingEnabled
  },

  resetChartCanvas: function() {
    if (this.ecanvas) {
      // 生成 echart 使用的 Canvas
      let style = this.getChartStyle()
      if (style.cssText !== this.cssText) {
        this.cssText = style.cssText
        this.ecanvas.style.cssText = style.cssText
        if (this.canvas.running) {
          this.chartInst.resize({ width: style.width, height: style.height })
        }
      }
    }
  },

  onCanvasResize: function() {
    this.set('cssText', this.getChartStyle().cssText)
  },

  updateHistData: function() {
    if (!this.canvas.running) {
      return
    }

    if (this.config.history === true) {
      let vars = []
      this.config.vars = this.config.vars || []
      let _this = this
      this.config.vars.map(item => {
        let name = item.name
        // 全局变量替换
        name = name.replaceAll(/'G:([^']*)'/g, function(x, p1) {
          return _this.getGlobalValue(`${p1}`)
        })
        vars.push(name)
      })

      let v = {
        'vars': vars,
        'start': this.config.start || '-1h',
        'stop': this.config.stop || 'now()',
        'group': this.config.groupby,
        'fn': this.config.fn,
        'table': this.config.table || ''
      }
      hist(v).then((data) => {
        data = data || []
        if (this._generateDataset) {
          let dataset = this._generateDataset(this.config, data, this.chartInst)
          if (dataset && this.chartInst) {
            this.chartInst.setOption({
              dataset
            })
          }
        }
      }).catch(err => {
        console.log('update hist data err: ', err)
      })
    } else {
      let vars = this.config.vars
      let _this = this
      let data = vars.map(item => {
        let name = item.name
        // 全局变量替换
        name = name.replaceAll(/'G:([^']*)'/g, function(x, p1) {
          return _this.getGlobalValue(`${p1}`)
        })
        return getValue(name)
      })
      if (this._generateDataset) {
        let dataset = this._generateDataset(this.config, data, this.chartInst)
        if (dataset && this.chartInst) {
          this.chartInst.setOption({
            dataset
          })
        }
      }
    }
  },

  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', ['config'].concat(propertiesToInclude))
  }

})

fabric.Chart.fromObject = function(object, callback) {
  return fabric.Object._fromObject('Chart', object, callback)
}

fabric.Chart.prototype.set = function(key, value) {
  if (key === 'config' && typeof value === 'object') {
    if (this.chartInst) {
      this.genAndSetOption()
    }
  }
  return this.callSuper('set', key, value)
}
