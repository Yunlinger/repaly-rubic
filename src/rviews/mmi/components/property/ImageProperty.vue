
<template>
  <property-group
    title="图片属性"
    :show="show"
    :expanded="expanded"
  >
    <file-property
      label="图片"
      name="rsrc"
      :value="activeObj && activeObj.rsrc"
      :accept="(activeObj && activeObj.type == 'rubik-gif') ? '.gif' : 'image/*'"
      :onChange="normalSet"
      @more="selectImage(activeObj && activeObj.rsrc)"
    />
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import FileProperty from '@/components/property/ImageProperty'
import ImageSelect from '@/components/ImageSelect'

export default {
  name: 'ImageProperty',
  components: { PropertyGroup, FileProperty },
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
      if (this.page && this.page.activeObj &&
        (this.page.activeObj.type === 'rubik-image' || this.page.activeObj.type === 'rubik-gif')
      ) {
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
    selectImage(oimg) {
      this.$rdialog(ImageSelect, {
        oimg: oimg,
        callback: (imageName) => {
          this.normalSet(imageName, 'rsrc')
        }
      })
    }
  }
}
</script>
