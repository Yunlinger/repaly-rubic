
<template>
  <property-group
    title="填充属性"
    :show="show"
    :expanded="expanded"
  >
    <number-property
      label="填充"
      name="fpct"
      :value="(activeObj && activeObj.fpct) || 0"
      :onChange="normalSet"
    />
    <select-property
      label="方向"
      name="fdir"
      :value="(activeObj && activeObj.fdir) || 0"
      :onChange="normalSet"
      :options="dirOptions"
    />
    <select-property
      label="样式"
      name="fstyle"
      :value="(activeObj && activeObj.fstyle) || 'rect'"
      :onChange="normalSet"
      :options="styleOptions"
    />
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import NumberProperty from '@/components/property/NumberProperty'
import SelectProperty from '@/components/property/SelectProperty'

export default {
  name: 'ImageProperty',
  components: { PropertyGroup, NumberProperty, SelectProperty },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: true,
      dirOptions: [
        { text: '向上', value: 0 },
        { text: '向右', value: 1 },
        { text: '向下', value: 2 },
        { text: '向左', value: 3 },
        { text: '中心向外', value: 4 }
      ],
      styleOptions: [
        { text: 'rect', value: 'rect' },
        { text: 'circle', value: 'circle' }
      ]
    }
  },
  computed: {
    activeObj() {
      return this.page.activeObj
    },
    show() {
      if (this.page && this.page.activeObj && this.page.activeObj.type === 'bar') {
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
