// 远程图片 RubikImage 支持

import { fabric } from 'fabric'
import { getUrl } from '@/api/res'
import gifToSprite from './gif2sprite'

const [GIF_PLAY, GIF_PAUSE, GIF_STOP] = [0, 1, 2]

fabric.RubikGif = fabric.util.createClass(fabric.Rect, {
  type: 'rubik-gif',

  rsrc: '',

  status: GIF_PLAY,

  loaded: false,

  loading: false,

  toLoad: '',

  start: 0,

  delay: 0,

  framesIndex: 0,

  dataUrl: '',

  frameWidth: 0,

  framesLength: 0,

  image: null,

  stateProperties: fabric.Rect.prototype.stateProperties.concat('rsrc', 'loaded', 'status'),

  cacheProperties: fabric.Rect.prototype.cacheProperties.concat('rsrc', 'loaded', 'status'),

  initialize: function(options) {
    options.stroke = '#000'
    options.fill = ''
    options.strokeWidth = 1
    options.strokeDashArray = [4, 4]
    this.callSuper('initialize', options)
  },

  toObject: function(propertiesToInclude) {
    var obj = this.callSuper('toObject', ['rsrc'].concat(propertiesToInclude))
    return obj
  },

  set: function(key, value) {
    if (key === 'rsrc') {
      if (value === this.get('rsrc') && this.loaded) {
        return this
      }
      this.rsrc = value
      this.loadGif(value)
      return this
    } else if (key === 'status') {
      if (value === GIF_PLAY || value === GIF_PAUSE || value === GIF_STOP) {
        this.status = value
      }
      return this
    } else {
      return this.callSuper('set', key, value)
    }
  },

  _render: function(ctx) {
    if (!this.loaded) {
      this.callSuper('_render', ctx)
      return
    }
    if (this.status === GIF_PAUSE || (this.status === GIF_STOP && this.framesIndex === 0)) {
      return
    }
    const now = performance.now()
    const delta = now - this.start
    if (delta > this.delay) {
      this.start = now
      this.framesIndex = this.framesIndex + 1
    }
    if (this.framesIndex === this.framesLength || this.status === GIF_STOP) {
      this.framesIndex = 0
    }
    const sprite = this.image.getElement()
    const scaleX = this.width / this.frameWidth
    const scaleY = this.height / sprite.height
    ctx.drawImage(
      sprite,
      this.frameWidth * this.framesIndex,
      0,
      this.frameWidth,
      sprite.height,
      -this.width / 2,
      -this.height / 2,
      this.frameWidth * scaleX,
      sprite.height * scaleY
    )
    setTimeout(() => {
      this.set('dirty', true)
    }, 1)
  },

  loadGif: function(name) {
    if (this.loading) {
      this.toLoad = name
      return
    }
    this.loading = true
    gifToSprite(getUrl(`image/${name}`)).then(({
      error, dataUrl, delay, frameWidth, framesLength
    }) => {
      this.loaded = false
      if (error) {
        console.error(error)
        this.loading = false
        if (this.toLoad) {
          this.loadGif(this.toLoad)
          this.toLoad = ''
        }
        return
      }
      fabric.Image.fromURL(dataUrl, (img) => {
        const sprite = img.getElement()
        this.framesIndex = 0
        this.start = performance.now()
        this.framesLength = framesLength
        this.frameWidth = frameWidth
        this.delay = delay

        img.width = frameWidth
        img.height = sprite.naturalHeight
        img.mode = 'image'
        img.top = 200
        img.left = 200

        this.image = img

        this.loaded = true
        this.set('dirty', true)
        this.play()
        this.canvas && this.canvas.requestRenderAll()
        this.loading = false
        if (this.toLoad) {
          this.loadGif(this.toLoad)
          this.toLoad = ''
        }
      })
    })
  },

  play: function() {
    this.set('status', GIF_PLAY)
    this.dirty = true
  },

  pause: function() {
    this.set('status', GIF_PAUSE)
    this.dirty = false
  },

  stop: function() {
    this.set('status', GIF_STOP)
    this.dirty = true
  },

  getStatus: function() {
    return ['Playing', 'Paused', 'Stopped'][this.status]
  }
})

fabric.RubikGif.fromObject = function(object, callback) {
  return fabric.Object._fromObject('RubikGif', object, callback)
}
