import { fabric } from 'fabric'

var linearTween = function(t, b, c, d) {
  return c * t / d + b
}

fabric.Group.prototype.dynSet = function(key, value, option) {
  this.callSuper('dynSet', key, value, option)
  if (key.endsWith('color')) {
    this.getObjects().forEach(obj => {
      obj.dynSet(key, value, option)
    })
  }
}

fabric.Object.prototype.dynSet = function(key, value, option) {
  option = option || {}
  switch (key) {
    case 'fcolor':
      if (this.isText() && this.backgroundColor) {
        return this.set('backgroundColor', value)
      } else if (this.fill !== 'transparent') {
        if (!this.fill_bck) {
          this.fill_bck = this.fill
        }
        return this.set('fill', value || this.fill_bck)
      }
      return this
    case 'ecolor':
      if (!this.isText()) {
        if (!this.stroke_bck) {
          this.stroke_bck = this.stroke
        }
        return this.set('stroke', value || this.stroke_bck)
      }
      return this
    case 'tcolor':
      if (this.isText()) {
        if (!this.fill_bck) {
          this.fill_bck = this.fill
        }
        return this.set('fill', value || this.fill_bck)
      }
      return this
    case 'bcolor':
      if (!this.backgroundColor_bck) {
        this.backgroundColor_bck = this.backgroundColor
      }
      return this.set('backgroundColor', value || this.backgroundColor_bck)
    case 'calcAngle':
      return this.dynSet('angle', value || 0)
    case 'angle':
      if ((this.canvas.__loop || 0) < 4) {
        // 刚打开画面, 不用动画
        return this.set('angle', value || 0)
      }
      return this.animate('angle', value || 0, {
        duration: 500,
        onChange: () => {
          try {
            // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
            this.canvas.requestRenderAll()
          } catch (err) {
            this.animateChangeError = err
          }
        },
        abort: function() {
          return this.animateChangeError || !this.canvas.running
        },
        easing: linearTween
      })
    case 'moveX':
    {
      value = value || 0
      this.lastMoveX = this.lastMoveX || 0
      if (value === this.lastMoveX) {
        return this
      }
      this.lastMoveX = value

      if (!this.leftBck && this.leftBck !== 0) {
        this.leftBck = this.left
      }
      let left = this.leftBck + value
      if ((this.canvas.__loop || 0) < 4) {
        // 第一次设置, 不用动画
        return this.set('left', left)
      }

      return this.animate('left', left, {
        duration: option.duration || 1000,
        onChange: () => {
          try {
            // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
            this.canvas.requestRenderAll()
          } catch (err) {
            this.animateChangeError = err
          }
        },
        abort: function() {
          return this.animateChangeError || !this.canvas.running
        },
        easing: linearTween
      })
    }
    case 'moveY':
    {
      value = value || 0
      this.lastMoveY = this.lastMoveY || 0
      if (value === this.lastMoveY) {
        return this
      }
      this.lastMoveY = value

      if (!this.topBck && this.topBck !== 0) {
        this.topBck = this.top
      }
      let top = this.topBck + value
      if ((this.canvas.__loop || 0) < 4) {
        // 第一次设置, 不用动画
        return this.set('top', top)
      }
      return this.animate('top', top, {
        duration: option.duration || 1000,
        onChange: () => {
          try {
            // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
            this.canvas.requestRenderAll()
          } catch (err) {
            this.animateChangeError = err
          }
        },
        abort: function() {
          return this.animateChangeError || !this.canvas.running
        },
        easing: linearTween
      })
    }
    case 'opacity':
      return this.animate('opacity', value, {
        duration: 500,
        onChange: () => {
          try {
            // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
            this.canvas.requestRenderAll()
          } catch (err) {
            this.animateChangeError = err
          }
        },
        abort: function() {
          return this.animateChangeError || !this.canvas.running
        },
        easing: fabric.util.ease['easeInOutSine']
      })
    case 'rotate':
      if (value !== this.rotateFlag && value !== 0) {
        this.rotateFlag = value
        let delta = 7776000000 * value
        if (delta >= 0) {
          delta = '+=' + delta
        } else {
          delta = '-=' + Math.abs(delta)
        }
        this.animate('angle', delta, {
          duration: 3600 * 1000 * 24 * 1000,
          onChange: () => {
            try {
              // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
              this.canvas.requestRenderAll()
            } catch (err) {
              this.animateChangeError = err
            }
          },
          abort: function() {
            return this.rotateFlag !== value || this.animateChangeError || !this.canvas.running
          },
          easing: (t, b, c, d) => {
            return c * (t / d) + b
          }
        })
      }
      if (value === 0) {
        this.rotateFlag = 0
      }
      return this
    case 'flow':
      if (value !== this.flowFlag && value !== 0) {
        this.flowFlag = value
        let delta = -4320000000 * value
        if (delta >= 0) {
          delta = '+=' + delta
        } else {
          delta = '-=' + Math.abs(delta)
        }
        this.animate('strokeDashOffset', delta, {
          duration: 3600 * 1000 * 24 * 1000,
          onChange: () => {
            try {
              // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
              this.canvas.requestRenderAll()
            } catch (err) {
              this.animateChangeError = err
            }
          },
          easing: (t, b, c, d) => {
            return c * (t / d) + b
          },
          abort: function() {
            return this.flowFlag !== value || this.animateChangeError || !this.canvas.running
          }
        })
      }
      if (value === 0) {
        this.flowFlag = 0
      }
      return this
    case 'value':
      if (this.isText()) {
        value = value || ''
        return this.set('text', value)
      }
      return this
    case 'point':
    case 'text':
      if (this.isText()) {
        if (this.isEditing) {
          return this
        }
        if (typeof value === 'undefined') {
          value = this.text_default
        }
        value = String(value) || ''
        let otext = this.get('text') || ''
        this.set('text', value)
        if (otext !== value) {
          if (typeof this.maxLength === 'undefined') {
            this.maxLength = otext.length || 1
          }
          // 判断是否需要重新计算边框
          if (value.length > this.maxLength + 6) {
            this.maxLength = value.length
            this.setCoords()
            this.set('dirty', true)
            this.group && this.group.addWithUpdate()
          }
        }
        return this
      }
      return this
    case 'rsrc':
      if (this.type === 'rubik-image' || this.type === 'rubik-gif') {
        return this.set('rsrc', value || this.get('rsrc'))
      }
      return this
    case 'visible':
      return this.set('visible', value)
    case 'disabled':
      return this.set('disabled', value)
    case 'fpct':
      if (this.type === 'bar') {
        if (!this.fpctSeted || (this.canvas.__loop || 0) < 4) {
          // 第一次设置 fpct, 不用动画
          this.fpctSeted = true
          return this.set('fpct', value || 0)
        }
        return this.animate('fpct', value || 0, {
          duration: 500,
          onChange: () => {
            try {
              // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
              this.canvas.requestRenderAll()
            } catch (err) {
              this.animateChangeError = err
            }
          },
          abort: function() {
            return this.animateChangeError || !this.canvas.running
          },
          easing: linearTween
        })
      }
      return this
    case 'scaleX':
    case 'scaleY':
      if ((this.canvas.__loop || 0) < 4) {
        // 刚打开画面, 不用动画
        return this.set(key, value || 1)
      }
      return this.animate(key, value || 1, {
        duration: 500,
        onChange: () => {
          try {
            // 可能在动画过程中切换画面或者关闭面板, 导致 requestRenderAll 执行失败
            this.canvas.requestRenderAll()
          } catch (err) {
            this.animateChangeError = err
          }
        },
        abort: function() {
          return this.animateChangeError || !this.canvas.running
        },
        easing: linearTween
      })
    default :
      console.log('dynSet() default:', key, value, option)
      return this
  }
}
