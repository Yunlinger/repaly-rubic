// Component 封装 vue 控件

import { fabric } from 'fabric'
import api from '@/api'
import Vue from 'vue'

if (!Vue.prototype.$api) {
  Vue.prototype.$api = api
}

function VueComponent(components, propsData, parentNode) {
  this.cmp = null
  this.components = components
  this.propsData = propsData
  this.parentNode = parentNode
  this._init()
  this._insert(parentNode)
}

VueComponent.prototype._init = function() {
  this.cmp = new (Vue.extend(this.components))({ propsData: this.propsData }).$mount()
  if (this.cmp) {
    console.log('api:', this.cmp.$api)
  }
}

VueComponent.prototype._insert = function(parentNode) {
  parentNode.appendChild(this.cmp.$el)
}

VueComponent.prototype._destroy = function() {
  this.parentNode.removeChild(this.cmp.$el)
  this.cmp.$destroy()
  this.cmp = null
}

VueComponent.prototype.on = function(eventName, callback) {
  this.cmp.$on(eventName, callback)
}

const defaultComponent = {
  template:
`
  <div>
    <el-button type="primary" @click="onClick" style="width: 100%; height: 100%">
      {{ caption }}
    </el-button>
  </div>
`,

  script:
`{
  data() {
    return {
      name: 'name' + Math.random()
    }
  },
  props: {
    caption: {
      type: String,
      default: 'button'
    }
  },
  methods: {
    onClick() {
      console.log(this.caption)
    }
  },
}`,

  props:
`{
  caption: 'button'
}`
}

fabric.Component = fabric.util.createClass(fabric.Rect, {
  type: 'component',

  stateProperties: fabric.Rect.prototype.stateProperties.concat('cssText'),

  cacheProperties: fabric.Rect.prototype.cacheProperties.concat('cssText'),

  cssText: '',

  template: '',

  script: '',

  props: '',

  initialize: function(options) {
    this.callSuper('initialize', options)
    this.config = this.config || {}
    this.set('config', this.config)
    this.on('modified', function() {
      this.resetStyle()
    })
    this.on('moving', function() {
      this.resetStyle()
    })
    this.on('scaling', function() {
      this.resetStyle()
    })
  },

  dispose: function() {
    if (this.vueComponent) {
      this.vueComponent._destroy()
    }
  },

  getStyle: function() {
    let style = {}
    let vpt = this.getViewportTransform()
    let matrix = this.calcTransformMatrix()
    matrix = fabric.util.multiplyTransformMatrices(vpt, matrix)
    let lt = fabric.util.transformPoint(new fabric.Point(0 - this.width / 2, 0 - this.height / 2), matrix, false)
    let opt = fabric.util.qrDecompose(matrix)

    style['pointer-events'] = this.canvas.running ? 'all' : 'none'
    style['position'] = 'absolute'
    style['left'] = `${lt.x}px`
    style['top'] = `${lt.y}px`
    style['width'] = `${this.width * opt.scaleX}px`
    style['height'] = `${this.height * opt.scaleY}px`
    if (!this.visible) {
      style['display'] = 'none'
    }

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

  resetStyle() {
    if (this.el) {
      try {
        let style = this.getStyle()
        this.cssText = style.cssText
        this.el.style.cssText = style.cssText
        this.el.setAttribute('width', style.width)
        this.el.setAttribute('height', style.height)
      } catch (err) {
        console.error('resetStyle error: ', err)
      }
    }
  },

  updateProps() {
    var props = this.genObject(this.props)
    if (this.vueComponent && this.vueComponent.cmp) {
      for (let key in props) {
        this.vueComponent.cmp[key] = props[key]
      }
      this.vueComponent.cmp.$forceUpdate()
    }
  },

  reCreateComponent() {
    if (this.vueComponent && this.vueComponent.cmp) {
      this.vueComponent._destroy()
      this.vueComponent = null
      this.el = null
    }
    this.createComponent()
  },

  genObject(mstr) {
    var obj = {}
    try {
      obj = (new Function(`return ${mstr}`))()
    } catch (err) {
      console.error('genObject error: ', err)
    }

    return obj
  },

  createComponent() {
    if (!this.el) {
      this.template = this.template || defaultComponent.template
      this.script = this.script || defaultComponent.script
      this.props = this.props || defaultComponent.props

      var comp = this.genObject(this.script) || {}
      comp.template = this.template
      var props = this.genObject(this.props)

      var vueComponent = new VueComponent(comp, props, this.canvas.uiContainer)
      this.vueComponent = vueComponent
      this.el = this.vueComponent.cmp.$el
      this.resetStyle()
    }
  },

  _render: function(ctx) {
    if (!this.el) {
      this.createComponent()
    } else {
      this.resetStyle()
    }
  },

  onParentModified: function() {
    this.resetStyle()
  },

  onCanvasResize: function() {
    this.resetStyle()
  },

  toObject: function(propertiesToInclude) {
    return this.callSuper('toObject', ['template', 'script', 'props'].concat(propertiesToInclude))
  }

})

fabric.Component.fromObject = function(object, callback) {
  return fabric.Object._fromObject('Component', object, callback)
}

fabric.Component.prototype.set = function(key, value) {
  if (key === 'angle') {
    value = 0
  }

  var ret = this.callSuper('set', key, value)

  if (key === 'visible') {
    this.resetStyle()
  }

  return ret
}
