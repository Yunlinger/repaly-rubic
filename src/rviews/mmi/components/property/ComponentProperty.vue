
<template>
  <property-group
    title="控件属性"
    :show="show"
    :expanded="expanded"
  >
    <template>
      <buttons-property label="驱动代码" :buttons="btnTemplate">
      </buttons-property>
      <text-property
        label="属性"
        name="props"
        :multiline="true"
        :value="activeObj && activeObj.props"
        :onChange="normalSet"
      />
    </template>
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import ButtonsProperty from '@/components/property/ButtonsProperty'
import TextProperty from '@/components/property/TextProperty'
import edit from '../ComponentEditor'

export default {
  name: 'ComponentProperty',
  components: {
    PropertyGroup,
    ButtonsProperty,
    TextProperty
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
      btnTemplate: [
        {
          caption: '...',
          callback: () => { this.editComponent() }
        }
      ]
    }
  },
  computed: {
    activeObj() {
      return this.page.activeObj
    },
    show() {
      if (this.page && this.page.activeObj && this.page.activeObj.type === 'component') {
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
        if (n === 'props') {
          this.activeObj.updateProps()
        } else {
          this.activeObj.reCreateComponent()
        }
      }
    },
    editComponent() {
      if (this.activeObj) {
        edit({
          template: this.activeObj.template || '',
          script: this.activeObj.script || '',
          props: this.activeObj.props || '',
          callback: (k, v) => {
            if (this.activeObj) {
              this.activeObj.set(k, v)
              if (k === 'props') {
                this.activeObj.updateProps()
              } else {
                this.activeObj.reCreateComponent()
              }
            }
          }
        })
      }
    }
  }
}
</script>
