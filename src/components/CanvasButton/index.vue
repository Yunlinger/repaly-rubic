<template>
  <div class="rubik-canvas-button" @click="click">
    <el-tooltip effect="light" :content="hint || icon" placement="bottom-start">
      <canvas :id="'buttonCanvas'+icon" width="24" height="24" />
    </el-tooltip>
  </div>
</template>

<script>
import fabric from '@/canvas'
// import store from '@/store'
export default {
  name: 'CanvasButton',
  props: {
    icon: {
      type: String,
      required: true
    },
    hint: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      canvas: null
    }
  },
  event: 'click',
  mounted() {
    this.canvas = new fabric.StaticCanvas('buttonCanvas' + this.icon)
    var obj = require('@/assets/syslib/_' + this.icon + '.json')
    this.canvas.loadFromJSON(JSON.stringify(obj))
  },
  beforeDestroy() {
    if (this.canvas) {
      this.canvas.clear()
      this.canvas.dispose()
    }
  },
  methods: {
    click() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.rubik-canvas-button {
  margin: 1px;
  padding: 0px;
  height: 24px;
  width: 24px;
  border-radius: 5px;
  border: 1px solid #bbb;
  background-color: #e6e6e6;
  cursor: pointer;
}
.rubik-canvas-button:hover {
  background-color: #c6c6c6;
}
</style>
