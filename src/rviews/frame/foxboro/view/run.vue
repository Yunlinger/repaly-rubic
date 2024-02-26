<template>
  <div class="app-container">
    <el-container>
      <el-header height="36px">
        <el-button
          type="info"
          size="mini"
          style="margin: 4px; width: 94px"
          disabled
        >
          System
        </el-button>
        <el-button
          :style="{ background: processButtonFlash ? 'gray' : 'gray' }"
          type="info"
          size="mini"
          style="margin: 4px; width: 94px"
          disabled
        >
          Process
        </el-button>
        <el-button
          type="danger"
          size="mini"
          style="margin: 4px; background: red; float: right;"
          @click="exitDcs()"
        >
          退出
        </el-button>
      </el-header>
      <el-container>
        <el-aside width="140px" style="background: #e0e0e0;">
          <el-button
            v-for="btn in buttons"
            :key="btn.caption"
            type="info"
            size="medium"
            style="margin: 4px; width: 132px; color: black"
            @click="openMMI(btn.path)"
          >
            {{ btn.caption }}
          </el-button>
        </el-aside>
        <el-main id="canvasContainer">
          <canvas id="MmiRun" width="100%" height="100%" />
        </el-main>
      </el-container>
    </el-container>
    <el-dialog
      title="Process Alarm"
      :visible.sync="showAlarm"
      width="80%"
      append-to-body
    >
      <div class="alarmContainer">
        <template v-for="(alm, key) of alarms">
          <el-card
            :key="key"
            :style="{ background: alm.active?'#bb00bb':'#a0a0a0' }"
            :body-style="{ padding: '8px', color: '#ffffff', fontWeight: 'bold' }"
            shadow="always"
            style="margin: 8px 0;"
            @click.native="ackAlm(key)"
          >
            <el-row :gutter="20">
              <el-col :span="11"><div>{{ alm.name }}</div></el-col>
              <el-col :span="9"><div>{{ alm.desc }}</div></el-col>
              <el-col :span="2"><div>{{ alm.type }}</div></el-col>
              <el-col :span="1"><div>{{ alm.pri }}</div></el-col>
              <el-col :span="1"><div>{{ alm.ack ? ' ' : 'U' }}</div></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="5"><div>{{ alm.ts }}</div></el-col>
              <el-col :span="2"><div>{{ alm.value }}</div></el-col>
              <el-col :span="2"><div>{{ alm.unit }}</div></el-col>
              <el-col :span="3"><div>{{ alm.limit }}</div></el-col>
              <el-col :span="12"><div /></el-col>
            </el-row>
          </el-card>
        </template>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="ackAlm()">Ack ALL</el-button>
        <el-button type="primary" plain @click="clearAlm()">Clear ALL</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import fabric from './canvas'
import screenfull from 'screenfull'
import './dynamic'
// import { button, config } from '../../config'
import { processAlarms } from '../alarm'
import { startTrend, stopTrend } from '../trend'
import resize from './mixins/resize'
import * as rapi from '@/api/res'

function loadCP() {
  if (!window.cp) {
    rapi.open('data/cp.json').then((cp) => {
      window.cp = cp
    })
  }
}

function removeCP() {
  delete window.cp
}

export default {
  name: 'FoxboroFrame',
  mixins: [resize],
  data() {
    return {
      main: '',
      buttons: [],
      alarms: {},
      canvas: null,
      showAlarm: false,
      processButtonFlash: false,
      processAlarms: processAlarms
    }
  },
  // computed: {
  //   alarms: function() {
  //     return this.$store.state.Alarm.alarms
  //   }
  // },
  mounted() {
    // 载入 CP
    loadCP()
    // console.log('fabric mounted')
    // this.$nextTick(() => {
    //   this.initCanvas()
    // })
    startTrend()
    // setInterval(() => {
    //   this.setProcessButoonColor()
    // }, 500)

    // loadButtonConfig
    rapi.open('data/config.json').then((res) => {
      this.buttons = res.buttons
      this.main = res.main
      this.initCanvas()
    }).catch(() => {
      this.$msg.error('打开配置文件错误')
    })
  },
  destroyed() {
    // console.log('fabric destroy')
    stopTrend()
    this.canvas.clear()
    this.canvas.dispose()
    removeCP()
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.RubikCanvas('MmiRun')
      var main = this.main
      if (main) {
        this.canvas.open(main).then(() => {
          this.resizeCanvas()
          this.canvas.initDynamic()
          this.canvas.initTimer()
          this.canvas.running = true
        })
      }
    },
    openMMI(mmiPath) {
      this.canvas.open(mmiPath).then(() => {
        this.canvas.initDynamic()
        this.canvas.initTimer()
        this.canvas.running = true
        this.canvas.calcDynamic()
      })
    },
    exitDcs() {
      if (screenfull.enabled) {
        screenfull.exit()
      }
      this.$router.back()
    },
    openAlarmForm() {
      this.showAlarm = true
    },
    closeAlarmForm() {
      this.showAlarm = false
    },
    ackAlm(key) {
      if (!key) {
        this.$store.dispatch('ackAllAlarm')
        return
      }
      this.$store.dispatch('ackAlarm', key)
    },
    clearAlm() {
      this.$store.dispatch('clearAllAlarm')
    },
    setProcessButoonColor() {
      let flash = false
      for (const key in this.alarms) {
        if (this.alarms[key].ack === false) {
          flash = true
          break
        }
      }
      if (flash) {
        this.processButtonFlash = !this.processButtonFlash
      } else {
        this.processButtonFlash = false
      }
    },
    resizeCanvas() {
      var container = document.getElementById('canvasContainer')

      var clientHeight = container.clientHeight
      var clientWidth = container.clientWidth

      this.canvas.setWidth(clientWidth)
      this.canvas.setHeight(clientHeight)

      var zoomX = clientWidth / this.canvas.rwidth
      var zoomY = clientHeight / this.canvas.rheight
      var vpt = this.canvas.viewportTransform.slice(0)
      vpt[0] = zoomX
      vpt[3] = zoomY
      this.canvas.setViewportTransform(vpt)
      // this.canvas.setZoom(Math.min(zoomX, zoomY))
      window.__zoomX = zoomX
      window.__zoomY = zoomY
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-container {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
}

.el-container {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
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

.alarmContainer{
  position: relative;
  height: calc(100vh - 500px);
  overflow: auto;
}

::-webkit-scrollbar {
  width: 16px;
  height: 0px;
  background-color: #e0e0e0;
}

/* 定义滑块 内阴影+圆角 */
::-webkit-scrollbar-thumb
{
  border-radius: 4px;
  background-color: #f0f0f0;
}

</style>
