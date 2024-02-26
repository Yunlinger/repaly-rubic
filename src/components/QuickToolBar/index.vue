<template>
  <div ref="rightPanel" :class="{show:show}" class="rightPanel-container">
    <div class="rightPanel">
      <div class="button-container">
        <!-- 展开右边栏 -->
        <div title="显示/隐藏 快捷栏" @click="show=!show">
          <i :class="show?'el-icon-right':'el-icon-back'" />
        </div>
        <!-- 运行模型按钮 -->
        <div
          :style="{ background: project.running ? '#00FF66' : '#609bb3' }"
          title="运行/冻结"
          @click="modelStartOrStop"
        >
          <i :class="project.running ? 'el-icon-video-pause':'el-icon-video-play'" />
        </div>
        <!-- 保存按钮 -->
        <!-- <div title="保存模型" @click="save">
          <i class="el-icon-download" />
        </div> -->
        <!-- 快照按钮 -->
        <!-- <div title="数据快照">
          <i class="el-icon-camera-solid" />
        </div> -->
        <!-- 曲线按钮 -->
        <!-- <div title="打开趋势窗口" @click="showTrend">
          <i class="el-icon-s-data" />
        </div>
        <div title="进入人机界面" @click="showDCS">
          <i class="el-icon-s-platform" />
        </div>
        <div title="进入开发环境" @click="showmodel">
          <i class="el-icon-edit" />
        </div> -->
        <!-- 模型时间显示 -->
        <!-- <div title="模型时间(s)">
          {{ formatModelTimeString(project.time, true) }}
        </div> -->
      </div>
      <div class="rightPanel-items" style="padding: 2px">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="工况" name="1">
            <div class="rubik-collapse-item">
              <cond-list :editable="false" />
            </div>
          </el-collapse-item>
          <el-collapse-item title="故障" name="2">
            <div class="rubik-collapse-item">
              <fault-tree :editable="false" />
            </div>
          </el-collapse-item>
          <el-collapse-item title="案例" name="3">
            <div class="rubik-collapse-item">
              <case-tree :editable="false" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import { addClass, removeClass } from '@/utils'
import * as mapi from '../../api/model'
import trend from '@/rviews/trend'
import { mapGetters } from 'vuex'
// import CondTree from '@/rviews/condition/tree'
import CondList from '@/rviews/condition/list'
import FaultTree from '@/rviews/fault/tree'
import CaseTree from '@/rviews/case/tree'

export default {
  name: 'QuickToolBar',
  components: { CondList, FaultTree, CaseTree },
  props: {
    clickNotClose: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      show: false,
      activeNames: ['1', '2', '3']
    }
  },
  computed: {
    theme() {
      return this.$store.state.settings.theme
    },
    ...mapGetters(['project'])
  },
  watch: {
    show(value) {
      if (value && !this.clickNotClose) {
        this.addEventClick()
      }
      if (value) {
        addClass(document.body, 'showQuickToolBar')
      } else {
        removeClass(document.body, 'showQuickToolBar')
      }
    }
  },
  mounted() {
    this.insertToBody()
  },
  beforeDestroy() {
    const elx = this.$refs.rightPanel
    elx.remove()
  },
  methods: {
    addEventClick() {
      window.addEventListener('click', this.closeSidebar)
    },
    closeSidebar(evt) {
      const parent = evt.target.closest('.rightPanel')
      if (!parent) {
        this.show = false
        window.removeEventListener('click', this.closeSidebar)
      }
    },
    insertToBody() {
      const elx = this.$refs.rightPanel
      const body = document.querySelector('body')
      body.insertBefore(elx, body.firstChild)
    },
    modelStartOrStop() {
      mapi.modelStart(!this.project.running).then(() => {})
    },
    save() {
      this.$confirm('是否保存当前模型?', '提示', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return mapi.modelStart(false)
      }).then(() => {
        return mapi.modelSave()
      }).then(res => {
        this.$message({
          type: 'success',
          message: '保存成功!',
          duration: 1000
        })
      }).catch(info => {
        this.$message({
          type: 'error',
          message: '保存失败: ' + info,
          duration: 2000
        })
      })
    },
    showTrend() {
      // this.$router.push({ path: '/model/trend' })
      trend()
    },
    showDCS() {
      this.$router.push({ path: '/framefull/foxboro' })
      // Dialog.open(dialogLine)
    },
    showmodel() {
      this.$router.push({ path: '/engineer/model/explorer' })
    },
    formatModelTimeString(time, onlySecond) {
      if (typeof time !== 'number') {
        return ''
      }
      let second = Math.floor((time || 0) / 1000)
      let hour = Math.floor(second / 3600)
      let min = Math.floor((second - 3600 * hour) / 60)
      second = second % 60
      if (second < 10) {
        second = '0' + second
      }
      if (onlySecond) {
        return second
      }
      if (min < 10) {
        min = '0' + min
      }
      if (hour < 10) {
        hour = '0' + hour
      }
      return hour + ':' + min + ':' + second
    }
  }
}
</script>

<style>
.showQuickToolBar {
  overflow: hidden;
  position: relative;
  width: calc(100% - 0px);
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
  background: rgba(0, 0, 0, 0);
  z-index: -1;
}

.rightPanel {
  width: 100%;
  max-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .05);
  transition: all .25s cubic-bezier(.7, .3, .1, 1);
  transform: translate(100%);
  background: #fff;
  z-index: 2700;
}

.show {
  transition: all .3s cubic-bezier(.7, .3, .1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translate(0);
  }
}

.button-container {
  width: 28px;
  left: -28px;
  top: 64px;
  height: auto;
  position: absolute;
  display: -webkit-flex; /* Safari */
  -webkit-flex-flow: row-reverse wrap; /* Safari 6.1+ */
  display: flex;
  flex-flow: column;
  flex-wrap: wrap;

  opacity: 0.3;
  &:hover {
    opacity: 1;
  }

  div {
    max-width: 28px;
    overflow: hidden;
    height: 24px;
    margin-top: 2px;
    text-align: center; //文字位置
    font-size: 14px;//字体大小
    border-radius: 6px 0 0 6px !important;//边框圆角
    border: 1px solid #c3c3c3;
    z-index: 0;
    pointer-events: auto;
    cursor: pointer;
    color: rgb(20, 19, 19);
    background-color: #609bb3;
    line-height: 24px;
    // 图标大小设定
    i {
      font-size: 19px;
      line-height: 24px;
    }
  }
}
.rubik-collapse-item {
  display: block;
  height: calc((100vh - 48px * 2) / 3);
  overflow: auto;
  margin-bottom: -25px;
  background: #fafafa;
}
</style>
