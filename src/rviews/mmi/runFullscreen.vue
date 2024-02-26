<template>
  <div class="app-container">
    <el-container>
      <el-main style="overflow: hidden">
        <!-- id='canvasContainer' -->
        <div
          :id="'canvasContainer' + setting"
          style="width: 100%;height: 100%;overflow: hidden;position: relative;background: #567475;"
          draggable="true"
          @dragstart="dragstart($event)"
        >
          <canvas :id="'MmiRun' + setting" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>

import fabric from '@/canvas'
import resize from './mixins/resize'
import { mapGetters } from 'vuex'
import './dynamic'
import Dialog from './components/dialog'
import * as rapi from '@/api/res'
import screenfull from 'screenfull'
export default {
  name: 'DefaultRunFrame',
  mixins: [resize],
  props: {
    setting: {
      type: String,
      default() {
        return '00'
      }
    },
    exercise: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      canvas: null,
      isFullscreen: screenfull.isFullscreen || false,
      hasNewEvent: false
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'selectedInst'
    ])
  },
  mounted() {
    this.$nextTick(() => {
      this.initCanvas()
      this.$on('global:rtdb', () => {
        this.canvas && this.canvas.calcDynamic()
      })
      this.$on('global:event.new', () => {
        this.hasNewEvent = true
      })
      this.$on('global:store.updateInst', (inst) => {
        if (inst.project === this.project.project && inst.id === this.project.id) {
          if (inst.case === 0) {
            this.selectedInst.case = inst.case
          }
        }
      })
    })
    screenfull.on('change', this.onScreenfullChanged)
  },
  beforeDestroy() {
    this.canvas.running = false
    this.canvas.removeUI()
    this.canvas.clear()
    this.canvas.fire('canvas:destroyed')
    this.canvas = null
    screenfull.off('change', this.onScreenfullChanged)
  },
  methods: {
    initCanvas() {
      let name = 'MmiRun' + this.setting
      this.canvas = new fabric.RunCanvas(name)
      this.goHome()
    },
    toPath(path, key) {
      // 先退出所有弹板
      Dialog.closeAll()

      this.canvas.open(path, key).then(() => {
        this.canvas.initDynamic()
        this.canvas.initTimer()
        this.canvas.running = true
        this.canvas._calcDynamic()
        this.canvas.renderAll()
      }).catch((err) => {
        this.$msg.error(`FileName: ${name}, ${err}`, '切换画面错误')
        console.log(err)
      }).finally(() => {
        this.canvas.openingWindow = false
        this.canvas.setCursor('default')
      })
    },
    goHome() {
      let main = 'main'
      let ncsPath = ''
      let jdPath = ''
      rapi.open('../model/setting.json').then(config => {
        const { ncs, jd } = config
        ncsPath = ncs
        jdPath = jd
        if (config.index) {
          main = config.index
        }
      }).catch(() => {
      }).finally(() => {
        this.canvas.running = true
        this.canvas.releaseMode = true
        let key = this.setting === 'dcs' ? main : (this.setting === 'jd' ? jdPath : ncsPath)
        if (key) {
          // 先退出所有弹板
          Dialog.closeAll()

          this.canvas.open(key, {}).then(() => {
            if (this.setting === 'dcs') {
              this.$store.dispatch('dcs_cache', { path: key, key: {}})
            }
            if (this.setting === 'jd') {
              this.$store.dispatch('jd_cache', { path: key, key: {}})
            }
            this.resizeCanvas()
            this.canvas.initDynamic()
            this.canvas.initTimer()
          }).catch(() => {})
        }
      })
    },
    goScreenFull() {
      screenfull.toggle()
    },
    resizeCanvas() {
      if (!this.canvas) return
      let cDom = 'canvasContainer' + this.setting
      var container = document.getElementById(cDom)

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
    },
    onScreenfullChanged() {
      this.isFullscreen = screenfull.isFullscreen
    },
    dragstart(event) {
      if (this.canvas && this.canvas.onDragstart) {
        this.canvas.onDragstart(event)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/variables.scss";
// @import "./iconfont.css";
.app-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%
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
  overflow: hidden;
  position: relative;
  background: #567475;
}
.showIndex {
  z-index: 999;
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

.sunken {
  padding: 4px;
  border-right: 1px solid white;
  border-bottom: 1px solid white;
  border-left: 1px solid gray;
  border-top: 1px solid gray;
}

.dev-buttons-left {
  float: left;
}

.dev-buttons-right {
  float: right;
}
.el-divider--vertical {
  height: 30px;
  background-color: #CCC;
}
.tabMain {
  margin-left: 20px;
  width: 150px;
  line-height: 36px;
  text-align: center;
  user-select: none;
  div {
    float: left;
    width: 50%;
    background: #909399;
    cursor: pointer;
  }
}
.tabActive {
  background: rgb(1, 167, 240) !important;
}
.dev-buttons {
    display: flex;
    height: 40px;
    align-items: center;
    padding-right: 10px;
  }
  .dev-button {
    cursor: pointer;
    width: 36px;
    height: 36px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    &.hover-effect {
      cursor: pointer;
      transition: background .3s;

      &:hover {
        background: rgba(0, 0, 0, .025)
      }
    }
  }

</style>
