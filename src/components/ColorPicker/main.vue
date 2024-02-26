<template>
  <rubik-dialog
    ref="dialog"
    title="颜色选择器"
    :left="left + 'px'"
    :top="top + 'px'"
    width="222px"
    height="300px"
  >
    <sketch-picker v-model="color" />
  </rubik-dialog>
</template>
<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import { Sketch as SketchPicker } from 'vue-color'
// import store from '@/store'
export default {
  name: 'ColorPicker',
  components: { RubikDialog, SketchPicker },
  data() {
    return {
      color: '',
      left: 0,
      top: 0,
      callback: null
    }
  },

  watch: {
    color: function(c) {
      this.callback && this.callback(c.hex8)
    }
  }
}
</script>

