
<template>
  <div>
    <property-group
      title="图元类型"
      :show="showType"
      :expanded="expanded"
    >
      <static-property
        label="类型"
        name="type"
        :value="activeObj && activeObj.type"
      />
      <text-property
        v-model="activeObj.name"
        label="名称"
        name="name"
      />
    </property-group>
    <property-group
      title="基本属性"
      :show="show"
      :expanded="expanded"
    >
      <color-property
        label="背景颜色"
        name="backgroundColor"
        :value="activeObj && activeObj.backgroundColor"
        :onChange="normalSet"
      />
      <color-property
        label="线颜色"
        name="stroke"
        :value="activeObj && activeObj.stroke"
        :onChange="normalSet"
      />
      <number-property
        label="线宽"
        name="strokeWidth"
        :value="activeObj && activeObj.strokeWidth"
        :onChange="normalSet"
      />
      <text-property
        label="线样式"
        name="strokeDashArray"
        :value="activeObj && activeObj.strokeDashArray && activeObj.strokeDashArray.toString()"
        :onChange="onStrokeStyleChage"
      />
    </property-group>
    <property-group
      title="填充属性"
      :show="show"
      :expanded="expanded"
    >
      <select-property
        label="填充样式"
        name="fillStyle"
        :value="activeObj && activeObj.fill && activeObj.fill.type"
        :onChange="onFillStyleChange"
        :options="fillStyleOptions"
      />
      <template v-if="activeObj && activeObj.fill && activeObj.fill.type">
        <buttons-property
          label="操作"
          :buttons="buttons"
        />
        <template v-for="(item, idx) in activeObj.fill.colorStops">
          <template>
            <number-property
              :key="'offset' + idx"
              :label="'偏置'+(idx+1)"
              :name="'offset '+idx"
              :value="item.offset"
              :onChange="onOffsetChange"
            />
            <color-property
              :key="'fill' + idx"
              :label="'颜色'+(idx+1)"
              :name="'fill '+idx"
              :value="item.color"
              :onChange="onFillChange"
            />
          </template>
        </template>
      </template>
      <template v-else>
        <color-property
          label="颜色"
          name="fill"
          :value="activeObj && activeObj.fill"
          :onChange="onFillChange"
        />
      </template>
    </property-group>
  </div>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import ColorProperty from '@/components/property/ColorProperty'
import TextProperty from '@/components/property/TextProperty'
import NumberProperty from '@/components/property/NumberProperty'
import SelectProperty from '@/components/property/SelectProperty'
import ButtonsProperty from '@/components/property/ButtonsProperty'
import StaticProperty from '@/components/property/StaticProperty'

export default {
  name: 'BasicProperty',
  components: {
    PropertyGroup,
    NumberProperty,
    ColorProperty,
    SelectProperty,
    ButtonsProperty,
    TextProperty,
    StaticProperty
  },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: true,
      fillStyleOptions: ['', 'linear', 'radial'],
      strokeDashArrayOptions: [
        '',
        'dash',
        'dot',
        'dashdot',
        'dashdotdot'
      ],
      buttons: [
        {
          caption: '+',
          callback: () => { this.insertStopColor() }
        },
        {
          caption: '-',
          callback: () => { this.deleteStopColor() }
        }
      ]
    }
  },
  computed: {
    activeObj() {
      return this.page.activeObj || {}
    },
    show() {
      if (this.page &&
          this.page.activeObj &&
          ['rect', 'circle', 'ellipse', 'path', 'triangle', 'polyline', 'polygon', 'bar'].indexOf(this.page.activeObj.type) > -1) {
        return true
      }
      return false
    },
    showType() {
      if (this.page && this.page.activeObj) {
        return true
      }
      return false
    }
  },
  methods: {
    normalSet(v, n, e) {
      if (this.activeObj) {
        this.activeObj.set(n, v)
        this.activeObj.setCoords()
        this.activeObj.canvas.requestRenderAll()
      }
    },
    onStrokeStyleChage(v, n, e) {
      if (!v || v.length <= 0) {
        return this.normalSet(undefined, n, e)
      }
      let vals = v.split(',')
      for (let i = 0; i < vals.length; i++) {
        vals[i] = parseInt(vals[i])
        if (isNaN(vals[i]) || vals[i] <= 0) {
          return
        }
      }
      this.normalSet(vals, n, e)
    },
    onFillStyleChange(v, n, e) {
      let colorStops = null
      if (this.activeObj.fill.colorStops) {
        colorStops = colorStops || {}
        for (let item of this.activeObj.fill.colorStops) {
          colorStops[item.offset] = item.color
        }
      }
      if (v === 'linear') {
        this.activeObj.setGradient('fill', {
          type: 'linear',
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 0,
          gradientUnits: 'percentage',
          colorStops: colorStops || {
            0: '#FFFFFFFF',
            1: '#000000FF'
          }
        }).canvas.requestRenderAll()
      } else if (v === 'radial') {
        this.activeObj.setGradient('fill', {
          type: 'radial',
          x1: 0.5,
          y1: 0.5,
          x2: 0.5,
          y2: 0.5,
          r1: 0,
          r2: 0.5,
          gradientUnits: 'percentage',
          colorStops: colorStops || {
            0: '#FFFFFFFF',
            1: '#000000FF'
          }
        }).canvas.requestRenderAll()
      } else {
        this.normalSet('', 'fill', e)
      }
    },
    onFillChange(v, n, e) {
      if (this.activeObj.fill.type) {
        if (n.startsWith('fill ')) {
          let idx = parseFloat(n.split(' ')[1])
          this.activeObj.fill.colorStops[idx].color = v
          this.activeObj.dirty = true
          this.activeObj.canvas.requestRenderAll()
        }
      } else {
        this.normalSet(v, n, e)
      }
    },
    onOffsetChange(v, n, e) {
      if (this.activeObj.fill.type) {
        if (n.startsWith('offset ')) {
          let idx = parseFloat(n.split(' ')[1])
          v = Math.min(1, Math.max(0, v))
          this.activeObj.fill.colorStops[idx].offset = v
          this.activeObj.dirty = true
          this.activeObj.canvas.requestRenderAll()
        }
      } else {
        this.normalSet(v, n, e)
      }
    },
    insertStopColor() {
      if (this.activeObj.fill.type) {
        let item = this.activeObj.fill.colorStops[this.activeObj.fill.colorStops.length - 1]
        this.activeObj.fill.colorStops.push({ ...item, offset: 1 })
        this.activeObj.dirty = true
        this.activeObj.canvas.requestRenderAll()
      }
    },
    deleteStopColor() {
      if (this.activeObj.fill.type && this.activeObj.fill.colorStops.length > 2) {
        this.activeObj.fill.colorStops.splice(this.activeObj.fill.colorStops.length - 1, 1)
        this.activeObj.dirty = true
        this.activeObj.canvas.requestRenderAll()
      }
    }
  }
}
</script>
