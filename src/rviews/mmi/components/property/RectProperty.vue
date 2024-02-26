
<template>
  <property-group
    title="矩形属性"
    :show="show"
    :expanded="expanded"
  >
    <number-property
      label="圆角长半轴"
      name="rx"
      :value="activeObj && (activeObj.rx || 0)"
      :onChange="normalSet"
    />
    <number-property
      label="圆角短半轴"
      name="ry"
      :value="activeObj && (activeObj.ry || 0)"
      :onChange="normalSet"
    />
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import NumberProperty from '@/components/property/NumberProperty'

export default {
  name: 'RectProperty',
  components: { PropertyGroup, NumberProperty },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: true
    }
  },
  computed: {
    activeObj() {
      return this.page.activeObj
    },
    show() {
      if (this.page && this.page.activeObj && this.page.activeObj.type === 'rect') {
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
    }
  }
}
</script>
