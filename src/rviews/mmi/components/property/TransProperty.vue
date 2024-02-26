
<template>
  <property-group
    title="变换属性"
    :show="show"
    :expanded="expanded"
  >
    <number-property
      label="左"
      name="left"
      :value="activeObj && parseInt(activeObj.left)"
      :onChange="normalSet"
    />
    <number-property
      label="上"
      name="top"
      :value="activeObj && parseInt(activeObj.top)"
      :onChange="normalSet"
    />
    <static-property
      label="宽"
      name="width"
      :value="activeObj && parseInt(activeObj.width)"
      :onChange="normalSet"
    />
    <static-property
      label="高"
      name="height"
      :value="activeObj && parseInt(activeObj.height)"
      :onChange="normalSet"
    />
    <select-property
      label="中心X"
      name="originX"
      :value="activeObj && activeObj.originX"
      :onChange="setOrigin"
      :options="originXOptions"
      :showInput="true"
    />
    <select-property
      label="中心Y"
      name="originY"
      :value="activeObj && activeObj.originY"
      :onChange="setOrigin"
      :options="originYOptions"
      :showInput="true"
    />
    <number-property
      label="旋转角度"
      name="angle"
      :value="activeObj && activeObj.angle"
      :onChange="normalSet"
    />
    <check-box-property
      label="横向翻转"
      name="flipX"
      :value="activeObj && activeObj.flipX"
      :onChange="normalSet"
    />
    <check-box-property
      label="纵向翻转"
      name="flipY"
      :value="activeObj && activeObj.flipY"
      :onChange="normalSet"
    />
    <number-property
      label="横向缩放"
      name="scaleX"
      :value="activeObj && activeObj.scaleX"
      :onChange="normalSet"
    />
    <number-property
      label="纵向缩放"
      name="scaleY"
      :value="activeObj && activeObj.scaleY"
      :onChange="normalSet"
    />
    <number-property
      label="透明度"
      name="opacity"
      :value="activeObj && activeObj.opacity"
      :onChange="normalSet"
    />
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import CheckBoxProperty from '@/components/property/CheckBoxProperty'
import NumberProperty from '@/components/property/NumberProperty'
import SelectProperty from '@/components/property/SelectProperty'
import StaticProperty from '@/components/property/StaticProperty'

export default {
  name: 'TransProperty',
  components: { PropertyGroup, CheckBoxProperty, NumberProperty, SelectProperty, StaticProperty },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: true,
      originXOptions: ['left', 'center', 'right', '0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'],
      originYOptions: ['top', 'center', 'bottom', '0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0']
    }
  },
  computed: {
    activeObj() {
      return this.page.activeObj
    },
    show() {
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
    setOrigin(v, n, e) {
      if (this.activeObj) {
        var num = parseFloat(v)
        this.activeObj.set(n, isNaN(num) ? v : num)
        this.activeObj.setCoords()
        this.activeObj.canvas.requestRenderAll()
      }
    }
  }
}
</script>
