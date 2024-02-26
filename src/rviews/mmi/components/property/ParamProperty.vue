
<template>
  <property-group
    title="图元参数"
    :show="show"
    :expanded="expanded"
  >
    <static-property
      key="key"
      label="链接"
      :value="activeObj && activeObj.libName"
      @cptDblClk="openLib(activeObj && activeObj.libName)"
    />
    <template v-for="(value, key) in param">
      <text-property
        :key="key"
        :label="key"
        :name="key"
        :value="value"
        :onChange="normalSet"
      />
    </template>
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import TextProperty from '@/components/property/TextProperty'
import StaticProperty from '@/components/property/StaticProperty'

export default {
  name: 'ParamProperty',
  components: { PropertyGroup, TextProperty, StaticProperty },
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
    param() {
      if (this.activeObj) {
        return { ... this.activeObj.originParam, ... this.activeObj.param }
      }
      return {}
    },
    show() {
      if (this.page &&
          this.page.activeObj &&
          this.page.activeObj.type === 'lib') {
        return true
      }
      return false
    }
  },
  methods: {
    normalSet(v, n, e) {
      if (this.activeObj) {
        this.activeObj.param = this.activeObj.param || {}
        this.activeObj.param[n] = v
        if (this.activeObj.type === 'lib') {
          this.activeObj.reloadAttr()
          this.activeObj.calcParam({ ...this.activeObj.originParam, ...this.activeObj.param })
          this.activeObj.canvas.requestRenderAll()
        }
      }
    },
    openLib(libName) {
      if (libName) {
        this.$router.push(`/engineer/mmi/edit/${libName}`)
      }
    }
  }
}
</script>
