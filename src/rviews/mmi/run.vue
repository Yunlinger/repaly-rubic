<template>
  <div class="app-container">
    <el-container>
      <el-main id="canvasContainer">
        <canvas id="MmiRun" width="100%" height="100%" />
      </el-main>
    </el-container>
  </div>
</template>

<script>

import * as rapi from '@/api/res'
import fabric from '@/canvas'
import resize from './mixins/resize'
import './dynamic'
export default {
  name: 'MmiRun',
  mixins: [resize],
  data() {
    return {
      canvas: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCanvas()
      this.$on('global:rtdb', () => {
        this.canvas && this.canvas.calcDynamic()
      })
    })
  },
  beforeDestroy() {
    this.canvas.removeUI()
    this.canvas.clear()
    this.canvas.fire('canvas:destroyed')
    this.canvas = null
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.RunCanvas('MmiRun')
      let main = this.$route.params && this.$route.params.main
      rapi.open('../model/setting.json').then(config => {
        if (config.index && !main) {
          main = config.index
        }
      }).catch(() => {
      }).finally(() => {
        if (!main) {
          main = 'main'
        }
        main = decodeURIComponent(main)
        this.canvas.running = true
        this.canvas.releaseMode = true
        this.canvas.open(main).then(() => {
          this.resizeCanvas()
          this.canvas.initDynamic()
          this.canvas.initTimer()
        })
      })
    },
    resizeCanvas() {
      if (!this.canvas) {
        return
      }

      var container = document.getElementById('canvasContainer')

      var clientHeight = container.clientHeight
      var clientWidth = container.clientWidth

      this.canvas.setWidth(clientWidth)
      this.canvas.setHeight(clientHeight)

      var zoomX = clientWidth / this.canvas.header.width
      var zoomY = clientHeight / this.canvas.header.height

      // this.canvas.setZoom(Math.min(zoomX, zoomY))
      var vpt = this.canvas.viewportTransform.slice(0)
      vpt[0] = zoomX
      vpt[3] = zoomY
      this.canvas.setViewportTransform(vpt)
      this.canvas.resizeWalk()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/variables.scss";
.app-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: calc(100vh - #{$navbarHeight} - #{$tagsviewHeight});
}

.el-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

#canvasContainer {
  width: 100%;
  height: 100%;
  background: #567475;
  position: relative;
  overflow: hidden;
}

.el-main {
  padding: 0;
  margin: 0;
}

.el-aside {
  padding: 0;
  margin: 0;
}

.el-header {
  padding: 0 6px;
  margin: 0;
}

.el-header {
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
    background-color: rgb(240, 242, 245);
  }

.height1{
  position: relative;
  height: calc(100vh - 110px);
}
</style>
