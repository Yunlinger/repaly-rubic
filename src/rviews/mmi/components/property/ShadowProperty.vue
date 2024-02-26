
<template>
  <property-group
    title="阴影"
    :show="show"
    :expanded="expanded"
  >
    <check-box-property
      label="显示阴影"
      name="shadow"
      :value="shadowOn"
      :onChange="switchShadow"
    />
    <color-property
      label="颜色"
      name="color"
      :value="activeObj && activeObj.shadow && activeObj.shadow.color || 'blue'"
      :onChange="normalSet"
    />
    <number-property
      label="模糊"
      name="blur"
      :value="activeObj && activeObj.shadow && parseInt(activeObj.shadow.blur) || 12"
      :onChange="normalSet"
    />
    <number-property
      label="X偏移"
      name="offsetX"
      :value="activeObj && activeObj.shadow && parseInt(activeObj.shadow.offsetX) || 0"
      :onChange="normalSet"
    />
    <number-property
      label="Y偏移"
      name="offsetY"
      :value="activeObj && activeObj.shadow && parseInt(activeObj.shadow.offsetY) || 0"
      :onChange="normalSet"
    />
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import CheckBoxProperty from '@/components/property/CheckBoxProperty'
import NumberProperty from '@/components/property/NumberProperty'
import ColorProperty from '@/components/property/ColorProperty'

export default {
  name: 'TransProperty',
  components: { PropertyGroup, CheckBoxProperty, NumberProperty, ColorProperty },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: false
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
    },
    shadowOn() {
      if (this.page && this.page.activeObj && this.page.activeObj.shadow) {
        return true
      }
      return false
    }
  },
  methods: {
    normalSet(v, n, e) {
      if (this.activeObj && this.activeObj.shadow) {
        this.activeObj.shadow[n] = v
        this.activeObj.canvas.requestRenderAll()
      }
    },
    switchShadow(v, n, e) {
      if (this.activeObj) {
        if (v) {
          this.activeObj.shadow = {
            color: 'blue',
            blur: 12,
            offsetX: 0,
            offsetY: 0
          }
        } else {
          delete this.activeObj.shadow
        }
        this.activeObj.canvas.requestRenderAll()
      }
    }
  }
}
</script>
