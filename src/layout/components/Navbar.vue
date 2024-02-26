<template>
  <div class="navbar">
    <div id="keyboardDisplay">
      <div v-for="keyObject in keyArray" :key="keyObject.timestamp" class="keyDiv">
        {{ keyObject.key }}
      </div>
    </div>
    <div id="screen" :class="displayScreen? 'dodisplay':'displayornot'">
      <div id="playback"></div>
    </div>
    <div class="right-menu">
      <el-dropdown v-if="!isScadaMode" class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img alt="avatar" :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <em class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="dialogVisible = true">
            {{ $t('我的') }}
          </el-dropdown-item>
          <el-dropdown-item @click.native="goIndex">
            {{ $t('首页') }}
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">
              {{ $t('退出') }}
            </span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="refresh">
            <span style="display:block;">
              {{ $t('刷新') }}
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- <template v-if="device!=='mobile'"> -->
      <!-- <search id="header-search" class="right-menu-item" /> -->

      <!-- <error-log class="errLog-container right-menu-item hover-effect" />
        <lang-select class="right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" /> -->

      <!-- <el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      <!-- </template> -->
      <div v-if="isDev" class="left-menu">
        <div class="home" @click="goIndex">
          <el-tooltip content="返回首页" effect="dark" placement="bottom">
            <i class="el-icon-back" />
          </el-tooltip>
        </div>
        <div class="bthGroup">
          <div v-if="forbid && isDisabled('isDev')" :class="isShow('isDev') ? 'active' : '' " @click="showView('isDev')">
            开发
          </div>
          <div v-if="isDisabled('isDcs')" :class="isShow('isDcs') ? 'active' : '' " @click="showView('isDcs')">
            DCS
          </div>
          <div v-if="isDisabled('isJd')" :class="isShow('isJd') ? 'active' : '' " @click="showView('isJd')">
            就地
          </div>
          <div v-if="isDisabled('isNcs')" :class="isShow('isNcs') ? 'active' : '' " @click="showView('isNcs')">
            NCS
          </div>
        </div>
        <div class="info">
          <div>模型： <span>{{ projectName || selectedInst.project }}</span></div>
          <el-divider style="color: #FFA500;" direction="vertical"></el-divider>
          <div>分组： <span>{{ selectedInst.name }}</span></div>
          <el-divider v-if="selectedInst.conditionName" style="color: #FFA500;" direction="vertical"></el-divider>
          <div v-if="selectedInst.conditionName">工况： <span>{{ selectedInst.conditionName }}</span></div>
        </div>
      </div>
    </div>
    <!-- <breadcrumb id="breadcrumb-container" class="breadcrumb-container" /> -->

    <div v-if="isDev && (!isExamMode || isAccord) && (!isScadaMode)" class="dev-buttons">
      <el-tooltip content="全局加速" effect="dark" placement="bottom">
        <div style="display: flex;">
          <div :class="selectedInst.speed === 1 ? 'speedBthAct' : ''" class="speedBth" @click="speedAll(1)">1x</div>
          <div :class="selectedInst.speed === 2 ? 'speedBthAct' : ''" class="speedBth" @click="speedAll(2)">2x</div>
          <div :class="selectedInst.speed === 3 ? 'speedBthAct' : ''" class="speedBth" @click="speedAll(3)">3x</div>
          <!-- <el-button :type="selectedInst.speed === 1 ? 'success' : 'info'" @click="speedAll(1)">1x</el-button>
          <el-button :type="selectedInst.speed === 2 ? 'success' : 'info'" @click="speedAll(2)">2x</el-button>
          <el-button :type="selectedInst.speed === 3 ? 'success' : 'info'" @click="speedAll(3)">3x</el-button> -->
        </div>
      </el-tooltip>
      <el-tooltip content="计算器" effect="dark" placement="bottom">
        <el-popover
          placement="bottom"
          width="545"
          trigger="click"
        >
          <calculator v-if="show" />
          <div
            v-if="forbid && isDisableds('计算器')"
            slot="reference"
            class="dev-button"
            style="color: #FFF"
            @click="calculator()"
          >
            <svg-icon icon-class="calculator" @click="show = !show"></svg-icon>
          </div>
        </el-popover>
      </el-tooltip>
      <el-tooltip content="考试模式" effect="dark" placement="bottom">
        <div v-if="roles.includes('teacher') && isDisableds('考试模式')" class="dev-button" style="margin-left: 8px;" @click="startExamMode()">
          <i class="el-icon-switch-button" :style="{color: isExamMode ? '#00FF66' : 'red'}" />
        </div>
      </el-tooltip>
      <el-tooltip content="保存快照" effect="dark" placement="bottom">
        <div v-if="isDisableds('保存快照')" class="dev-button" style="margin-left: 8px;" @click="saveSnp()">
          <svg-icon icon-class="ckz" />
          <!-- <i class="el-icon-camera-solid icon-button" @click="saveSnp()" /> -->
        </div>
      </el-tooltip>
      <el-tooltip content="加速" effect="dark" placement="bottom">
        <el-popover
          placement="bottom"
          width="400"
          trigger="click"
        >
          <div style="max-height: 200px; overflow-y: auto;">
            <speed @isSpeed="isSpeed" />
          </div>
          <span v-if="isDisableds('加速')" slot="reference" class="dev-button">
            <svg-icon icon-class="speed" :style="{color: isspeed ? 'red' : '#67C23A'}"></svg-icon>
          </span>
        </el-popover>
      </el-tooltip>
      <el-tooltip content="条件冻结" effect="dark" placement="bottom">
        <el-popover
          placement="bottom"
          width="500"
          trigger="click"
          @show="updateFreezeConfig"
        >
          <div style="max-height: 200px; overflow: none;">
            <el-input v-model="freezeConfig.freezeVar" style="width: 210px;" placeholder="变量"></el-input>
            <el-select v-model="freezeConfig.freezeOp" placeholder="NOP" size="mini" style="width: 130px;">
              <el-option
                v-for="op in freezeOps"
                :key="op.value"
                :label="op.label"
                :value="op.value"
              >
              </el-option>
            </el-select>
            <el-input v-model="freezeConfig.freezeValue" style="width: 80px;" placeholder="值"></el-input>
            <el-button size="mini" type="primary" style="width: 50px;" @click="setFreeze">投入</el-button>
          </div>
          <span v-if="isDisableds('条件冻结')" slot="reference" class="dev-button">
            <i class="bi bi-sign-stop"></i>
          </span>
        </el-popover>
      </el-tooltip>
      <el-tooltip v-if="isDisableds('当前故障')" content="当前故障" effect="dark" placement="bottom">
        <el-popover
          placement="bottom"
          width="500"
          trigger="click"
        >
          <div style="max-height: 200px; overflow-y: auto;">
            <div
              v-for="(ite, idx) in selectedInst.faultName"
              :key="ite"
              style="display: flex; align-items: center; justify-content: space-between; margin: 0;height: 35px;line-height: 35px;user-select: none;"
            >
              <span>{{ ite }}</span>
              <div style="display: flex; justify-content: space-between;">
                <el-select
                  v-if="isSelectFault(ite)"
                  v-model="levelFault[isSelectFault(ite, true)].level"
                  placeholder="请选择"
                  @change="updateVar"
                  @focus="getItem(ite)"
                >
                  <el-option
                    v-for="val in levels"
                    :key="val.value"
                    :label="val.label"
                    :value="val.value"
                  >
                  </el-option>
                </el-select>
                <span style="background-color: #E6A23C;border-radius: 5px;padding: 5px; line-height: 20px;cursor: pointer;" @click="undo(idx)">撤销</span>
              </div>
            </div>
          </div>
          <span v-if="selectedInst.faultName !== undefined && selectedInst.faultName.length > 0" slot="reference" class="iconfont el-icon-warning-outline dev-button" style="font-size: 20px;cursor: pointer;color: red;"></span>
          <span v-else slot="reference" class="iconfont el-icon-warning-outline dev-button" style="font-size: 20px;cursor: pointer;"></span>
        </el-popover>
      </el-tooltip>
      <!-- <el-tooltip content="当前工程" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; height: 26px; font-size: 12px; ">
          {{ `${project.project}` }}
        </div>
      </el-tooltip>
      <el-tooltip content="当前分组号" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; height: 26px; font-size: 12px; ">
          {{ `${project.id}` }}
        </div>
      </el-tooltip> -->
      <el-tooltip content="模型时间" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; height: 26px; font-size: 12px; margin-left: 8px;">
          {{ formatModelTimeString(selectedInst.time, false) }}
        </div>
      </el-tooltip>
      <el-tooltip v-if="selectedInst.remainTime > 0" content="案例倒计时" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; height: 26px; font-size: 12px; margin-left: 8px;">
          {{ formatModelTimeString(selectedInst.remainTime * 1000, false) }}
        </div>
      </el-tooltip>
      <!-- <el-tooltip v-if="selectedInst.conditionName" :content="'当前工况: ' + selectedInst.conditionName" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; max-width: 100px; white-space: nowrap; overflow: hidden; height: 26px; font-size: 12px; margin-left: 8px;">
          {{ selectedInst.conditionName }}
        </div>
      </el-tooltip> -->
      <!-- <el-tooltip v-if="selectedInst.faultName" :content="'当前故障: ' + selectedInst.faultName" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; max-width: 100px; white-space: nowrap; overflow: hidden; height: 26px; font-size: 12px; margin-left: 8px;">
          {{ selectedInst.faultName }}
        </div>
      </el-tooltip> -->
      <!-- <el-tooltip v-if="selectedInst.caseName" :content="'当前案例: ' + selectedInst.caseName" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; max-width: 100px; white-space: nowrap; overflow: hidden; height: 26px; font-size: 12px; margin-left: 8px;">
          {{ selectedInst.caseName }}
        </div>
      </el-tooltip> -->
      <el-tooltip v-if="selectedInst.speed > 1" content="模型计算速度" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item sunken" style="width: auto; height: 26px; font-size: 12px; margin-left: 8px;">
          {{ selectedInst.speed + 'x' }}
        </div>
      </el-tooltip>
      <el-tooltip content="运行/冻结" effect="dark" placement="bottom">
        <div
          class="dev-button right-menu-item hover-effect"
          :style="{ color: project.running ? '#00FF66' : 'black' }"
          @click="modelStartOrStop"
        >
          <svg-icon :icon-class="project.running ? 'pause':'play'" />
          <!-- <em :class="project.running ? 'bi bi-pause-btn':'bi bi-play-btn'" /> -->
        </div>
      </el-tooltip>
      <el-tooltip content="单步执行" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item hover-effect" @click="stepRun">
          <em class="bi bi-collection-play" />
        </div>
      </el-tooltip>
      <el-tooltip content="保存模型和算法图元" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="save">
          <!-- <em class="bi bi-save2" /> -->
          <svg-icon icon-class="save" />
        </div>
      </el-tooltip>
      <el-tooltip content="设置" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="gotoSetting">
          <em class="bi bi-gear" />
        </div>
      </el-tooltip>
      <el-tooltip content="变量库" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="gotoPointDB">
          <em class="bi bi-tags" />
        </div>
      </el-tooltip>
      <el-tooltip content="故障列表" effect="dark" placement="bottom">
        <div v-if="forbid && isDisableds('故障总表')" class="dev-button right-menu-item hover-effect" @click="gotoFault">
          <em class="el-icon-tickets" />
        </div>
      </el-tooltip>
      <el-tooltip content="IO模块库" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="gotoIOList">
          <em class="bi bi-list-task" />
        </div>
      </el-tooltip>
      <el-tooltip content="变量引用拓扑图" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="gotoTrace">
          <em class="bi bi-link-45deg" />
        </div>
      </el-tooltip>
      <el-tooltip content="打开趋势窗口" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="showTrend">
          <em class="bi bi-graph-up" />
        </div>
      </el-tooltip>
      <el-tooltip content="查询" effect="dark" placement="bottom">
        <div v-if="forbid" class="dev-button right-menu-item hover-effect" @click="gotoSearch">
          <em class="bi bi-search" />
        </div>
      </el-tooltip>
      <el-tooltip content="查看当前案例" effect="dark" placement="bottom">
        <div v-if="isDisableds('当前案例')" class="dev-button right-menu-item hover-effect" @click="showCurrentCase">
          <em class="bi bi-card-list" />
        </div>
      </el-tooltip>
      <!-- <el-tooltip content="打开人机界面" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item hover-effect" @click="showDCS">
          <em class="bi bi-display" />
        </div>
      </el-tooltip> -->
      <!-- <el-tooltip content="打开调试界面" effect="dark" placement="bottom">
        <div class="dev-button right-menu-item hover-effect" @click="showDCSDebug">
          <em class="bi bi-laptop" />
        </div>
      </el-tooltip> -->
      <div>
        <div style="width: 22px;height: 22px;background-color: rgb(26, 234, 40);border-radius: 100%;cursor: pointer;margin-left: 4px;" @click="startRecording"></div>
      </div>
      <div>
        <div style="width: 22px;height: 22px;background-color: rgb(234, 43, 26);border-radius: 100%;cursor: pointer;margin-left: 4px;" @click="stopRecording"></div>
      </div>
      <div>
        <div style="margin-left: 6px;cursor: pointer; width: 22px;height: 22px;background: red;" @click="togDisplay">V</div>
      </div>
    </div>

    <div v-if="isDev && (!isExamMode || isAccord) && (!isScadaMode)" class="menubar">
      <el-tooltip content="操作记录" effect="dark" placement="bottom">
        <div v-if="isDisableds('操作记录')" class="dev-button" style="margin-left: 8px;" @click="showToolbar('操作记录')">
          <svg-icon icon-class="operation" />
        </div>
      </el-tooltip>
      <el-tooltip content="工况" effect="dark" placement="bottom">
        <div
          v-if="isDisableds('工况')"
          class="dev-button"
          style="color: #000;"
          @click="showToolbar('工况')"
        >
          <svg-icon icon-class="gk"></svg-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="快照列表" effect="dark" placement="bottom">
        <div
          v-if="isDisableds('快照列表')"
          class="dev-button"
          @click="showToolbar('快照')"
        >
          <svg-icon icon-class="kz" />
        </div>
      </el-tooltip>
      <el-tooltip content="故障" effect="dark" placement="bottom">
        <div
          v-if="isDisableds('故障投入列表')"
          class="dev-button"
          @click="showToolbar('故障')"
        >
          <svg-icon icon-class="fault" />
        </div>
      </el-tooltip>
      <el-tooltip content="案例" effect="dark" placement="bottom">
        <div
          class="dev-button"
          style="color: #EE861E;"
          @click="showToolbar('案例')"
        >
          <i class="el-icon-document" />
        </div>
      </el-tooltip>
    </div>

    <!-- 我的账户信息 -->
    <el-dialog
      title="我的"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <profile v-if="dialogVisible" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
// import Hamburger from '@/components/Hamburger'
// import ErrorLog from '@/components/ErrorLog'
// import Screenfull from '@/components/Screenfull'
// import SizeSelect from '@/components/SizeSelect'
// import LangSelect from '@/components/LangSelect'
// import Search from '@/components/HeaderSearch'
import Calculator from './calculator'
import Profile from '@/rviews/profile/index'
import * as mapi from '@/api/model'
import * as rapi from '@/api/res'
import * as papi from '@/api/project'
import * as fapi from '@/api/fault'
import * as rdbapi from '@/api/rtd'
import { stepRun, freezeIf } from '@/api/driver'
import trend from '@/rviews/trend'
import showCaseDialog from '@/rviews/case'
import find from '@/rviews/model/components/find'
import Speed from '@/rviews/fault/speed'
import Mousetrap from 'mousetrap'
import { saveSnapshot } from '@/api/condition'
import { record } from 'rrweb'
import RrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'

export default {
  components: {
    // Breadcrumb,
    // Hamburger,
    // ErrorLog,
    // Screenfull,
    // SizeSelect,
    // LangSelect
    // Search,
    Speed,
    Profile,
    Calculator
  },
  data() {
    return {
      // 录制
      replayArray: [],
      replayer: null,
      displayScreen: false,
      recorder: null,
      recordedEvents: [],
      keyArray: [],
      dialogVisible: false,
      dialog: false,
      show: false,
      isspeed: false,
      isExamMode: false,
      freezeConfig: {
        freezeVar: '',
        freezeOp: 0,
        freezeValue: 0
      },
      // 0 NOP;  1 ==; 2 >; 3 >=; 4 <; 5 <=;
      freezeOps: [
        { value: 0, label: 'NOP' },
        { value: 1, label: '==' },
        { value: 2, label: '>' },
        { value: 3, label: '>=' },
        { value: 4, label: '<' },
        { value: 5, label: '<=' }
      ],
      avatar: require('@/assets/image/user.gif'),
      // 程度故障
      levels: [
        {
          value: '0.05',
          label: '5%'
        }, {
          value: '0.1',
          label: '10%'
        }, {
          value: '0.2',
          label: '20%'
        }, {
          value: '0.3',
          label: '30%'
        }, {
          value: '0.4',
          label: '40%'
        },
        {
          value: '0.5',
          label: '50%'
        },
        {
          value: '0.6',
          label: '60%'
        },
        {
          value: '0.7',
          label: '70%'
        },
        {
          value: '0.8',
          label: '80%'
        },
        {
          value: '0.9',
          label: '90%'
        },
        {
          value: '1',
          label: '100%'
        }
      ],
      selectFaultItems: {},
      config: {},
      projectName: ''
    }
  },
  computed: {
    ...mapGetters([
      // 'device',
      'project',
      'selectedInst',
      'roles'
    ]),
    ...mapState({
      showKey: state => state.settings.showKey,
      viewCache: state => state.settings.viewCache,
      iconList: state => state.settings.iconList,
      forbid: state => state.project.forbid
    }),
    isDev() {
      return this.$route.path.startsWith('/engineer') || this.$route.path.startsWith('/framefull')
    },
    isAccord() {
      return this.roles.includes('teacher') || this.roles.includes('engineer')
    },
    isDisabled() {
      return (val) => { return !this.viewCache[val].disabled }
    },
    isDisableds() {
      return (val) => {
        let idx = this.iconList.findIndex(item => item.name === val)
        return !(idx >= 0 && this.iconList[idx].disabled)
      }
    },
    isShow() {
      return (val) => { return this.showKey === val }
    },
    // 程度故障
    levelFault: function() {
      return this.$store.getters.project.levelFault[this.selectedInst.id] || []
    },
    isSelectFault() {
      return (val, key) => {
        for (let i = 0; i < this.levelFault.length; i++) {
          this.levelFault[i].value = rdbapi.getValue(this.levelFault[i].ops[0].var) || 0
          this.levelFault[i].level = this.levelFault[i].value / 100 ? String(this.levelFault[i].value / 100) : this.levelFault[i].level
        }
        // key为true 返回索引， false 返回v-if所需值
        if (key) {
          return this.levelFault.findIndex(item => item.name === val)
        }
        return this.levelFault.findIndex(item => item.name === val) !== -1
      }
    },
    isScadaMode() {
      if ((this.config.scada && (this.config.scada.project === this.project.project && this.config.scada.id === this.project.id)) &&
      (this.roles.length === 1 && this.roles[0] === 'student')
      ) {
        return true
      }
      return false
    }
  },
  created() {
    let _this = this
    this.isExamMode = this.selectedInst.isExamMode || false
    Mousetrap.bind(['command+f', 'ctrl+f'], function(e) {
      e.preventDefault && e.preventDefault()
      _this.gotoSearch()
    })
    this.getProjectName()
    if (!this.roles.includes('engineer')) {
      this.$store.commit('SET_FORBID', false)
      this.showView('isDcs')
    }
    rapi.getCache('config').then(config => {
      this.config = config || {}
    }).catch(() => {
      this.config = {}
    })
  },
  mounted() {
    this.$on('global:store.updateInst', (msg) => {
      const { project, id } = this.project.selectedInst
      if (project === msg.project && id === msg.id) {
        this.isExamMode = msg.isExamMode || false
      }
    })

    this.$on('global:project.open', () => {
      this.getProjectName()
    })
  },
  beforeDestroy() {
    Mousetrap.unbind(['command+f', 'ctrl+f'])
  },
  methods: {
    togDisplay() {
      this.displayScreen = !this.displayScreen
    },
    // 开始录制
    startRecording() {
      // 使用 record 函数开始录制
      this.recorder = record({
        emit: (event) => {
          // 将事件发送到服务器保存或进行其他处理
          console.log(event)
          this.recordedEvents.push(event)
        }

      })

      // 添加全局键盘事件监听器
      window.addEventListener('keydown', this.handleKeyDown)
      window.addEventListener('keyup', this.handleKeyUp)
    },
    stopRecording() {
      // 停止录制
      this.recorder()

      console.log('Recording stopped')
      this.keyArray = []
      // 移除全局键盘事件监听器
      window.removeEventListener('keydown', this.handleKeyDown)
      window.removeEventListener('keyup', this.handleKeyUp)
      this.replayer = new RrwebPlayer({
        target: document.getElementById('playback'),
        UNSAFE_replayCanvas: true,
        props: {
          events: this.recordedEvents,
          speedOption: [1, 2, 5, 10]
        }
      })

      // 将录制的事件传递给回放页面
      // this.$router.push({ name: 'ReplayPage', params: { recordedEvents: this.recordedEvents }})
    },
    handleKeyDown(event) {
      // 将按键信息添加到数组
      this.keyArray.push({
        key: event.key,
        timestamp: Date.now()
      })
    },
    refresh() {
      location.reload()
    },
    getProjectName() {
      rapi.open('../model/setting.json').then(res => {
        this.projectName = res.name || ''
      })
    },
    async goIndex() {
      if (this.forbid) {
        this.$router.push({ path: '/' })
      } else {
        if (this.roles.includes('teacher') && this.roles.length < 3) {
          this.$router.push({ path: '/index/teacher' })
          return
        } else if (this.roles.includes('student') && this.roles.length < 3) {
          this.$router.push({ path: '/index/student' })
        }
      }
      await this.$store.commit('SET_FORBID', true)
    },
    saveSnp() {
      saveSnapshot({}).then(res => {
        this.$msg.success('保存快照成功')
      }).catch(err => {
        this.$msg.error(err, '保存快照失败')
      })
    },
    undo(index) {
      let id = this.selectedInst.fault[index]
      fapi.stop(id).then(() => {
        this.$msg.success('撤销故障成功')
      }).catch(err => {
        this.$msg.error(err, '撤销故障失败')
      })
    },
    goback() {
      this.$router.back()
    },
    async logout() {
      this.$store.commit('Set_Index', 0)
      await this.$store.commit('SET_FORBID', true)
      await this.$store.dispatch('clear_cache')
      await this.$store.dispatch('settings/changeView', 'isDev')
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
    },

    modelStartOrStop() {
      if (this.project.running) {
        // 停止计算
        mapi.modelStart(false).then(() => {
          this.$msg.success('模型停止运算')
        }).catch((err) => {
          this.$msg.error(err, '停止失败')
        })
      } else {
        // 启动驱动
        mapi.modelStart(true).then(() => {
          this.$msg.success('模型开始运算')
        }).catch((err) => {
          this.$msg.error(err, '启动失败')
        })
      }
    },
    save() {
      this.$confirm('是否保存当前模型和算法图元?', '提示', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: '正在保存模型 ... ',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return mapi.modelStart(false)
      }).then(() => {
        return mapi.modelSave()
      }).then(res => {
        this.$msg.success('模型和算法图元保存成功')
      }).catch(info => {
        this.$msg.error('模型和算法图元保存失败: ' + info)
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    showTrend() {
      // this.$router.push({ path: '/model/trend' })
      trend()
    },
    showCurrentCase() {
      showCaseDialog()
    },
    showDCSDebug() {
      rapi.open('../model/setting.json').then(config => {
        switch (config.frame) {
          case 'foxboro':
            this.$router.push({ path: '/framefull/foxboro' })
            break
          case 'default':
          case '':
          default : this.$router.push({ path: '/engineer/mmi/run' })
        }
      }).catch(() => {
        this.$router.push({ path: '/engineer/mmi/run' })
      })
    },
    showmodel() {
      this.$router.push({ path: '/engineer/model/explorer' })
    },
    gotoSetting() {
      this.$router.push({ path: '/engineer/model/setting' })
    },
    gotoPointDB() {
      this.$router.push({ path: '/engineer/pointdb/index' })
    },
    gotoFault() {
      this.$router.push({ path: '/engineer/fault/index' })
    },
    gotoIOList() {
      this.$router.push({ path: '/engineer/model/iolist' })
    },
    gotoSearch() {
      find()
      // this.$router.push({ path: '/engineer/model/search' })
    },
    gotoTrace() {
      this.$router.push({ path: '/engineer/model/trace' })
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
    },
    stepRun() {
      stepRun().catch(err => {
        this.$msg.error(err)
      })
    },
    showToolbar(data) {
      this.$emit('showToolbar', data)
    },
    calculator() {
      this.show = true
    },
    isSpeed(data) {
      this.isspeed = data
    },
    startExamMode() {
      let status = !this.isExamMode
      if (status) {
        let params = { project: 'YFDCFZ', id: 'dev' }
        papi.setexam(params).catch(() => {
          this.$message({
            type: 'error',
            message: `考试模式取消失败，请重试`
          })
        })
      } else {
        let params = { project: 'YFDCFZ', id: 'dev' }
        papi.unsetexam(params).catch(() => {
          this.$message({
            type: 'error',
            message: `考试模式取消失败，请重试`
          })
        })
      }
    },
    showView(name) {
      this.$store.dispatch('settings/changeView', name)
    },
    updateFreezeConfig() {
      this.freezeConfig.freezeVar = this.project.selectedInst.freezeVar || ''
      this.freezeConfig.freezeOp = this.project.selectedInst.freezeOp || 0
      this.freezeConfig.freezeValue = this.project.selectedInst.freezeValue || 0
    },
    setFreeze() {
      freezeIf(this.freezeConfig.freezeVar, this.freezeConfig.freezeOp, this.freezeConfig.freezeValue).then(() => {
        this.$msg('投入冻结条件成功')
      }).catch(err => {
        this.$msg.error(err, '投入冻结条件失败')
      })
    },
    // 给当前投入的程度故障更改程度
    getItem(ite) {
      this.selectFaultItems = this.levelFault.find(item => item.name === ite)
    },
    updateVar(val) {
      this.setVar(this.selectFaultItems, val)
    },
    async setVar(obj, val) {
      await rdbapi.setValue(obj.ops[0].var, Number(val) * 100)
      this.setFault()
    },
    convertList(list) {
      return new Promise(resolve => {
        let cache = []
        for (let i in list) {
          list[i].value = 0
          list[i].hover = false
          if (list[i].ops && !list[i].ops[0].dataType) {
            list[i].level = String(list[i].ops[0].target / 100)
          }
          if (this.selectedInst.fault && this.selectedInst.fault.includes(list[i].id)) {
            list[i].value = rdbapi.getValue(list[i].ops[0].var) || 0
            list[i].level = list[i].value / 100 ? String(list[i].value / 100) : list[i].level
            if (list[i].ops[0] && !list[i].ops[0].dataType) {
              cache.push(list[i])
            }
          }
        }
        resolve(cache)
      })
    },
    // 给当前投入的程度故障更改程度
    setFault() {
      papi.getFault(this.name).then(async res => {
        let list = res.list.items || {}
        let cache = await this.convertList(list)
        let id = this.selectedInst.id
        this.$store.commit('SET_FAULT', { name: id, list: cache })
      })
    },
    speedAll(val) {
      this.$confirm(`确定执行模型计算速度${val}倍速`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const { id, project } = this.selectedInst
        let obj = {
          id: id,
          model: 'model',
          project: project,
          speed: val
        }
        return papi.setInstSpeed(obj)
      }).then(() => {
        this.$msg('加速执行成功')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";
.navbar {
  height: #{$navbarHeight};
  overflow: hidden;
  position: relative;
  background: #262E40;
  color: #CCC;
  box-shadow: 0 1px 4px rgba(0,21,32,.08);
  display: flex;
  justify-content: space-between;
  #keyboardDisplay {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 999;
  background-color: #f0f0f0;
  padding: 10px;
  border: 1px solid #ccc;
  display: flex;
}
#screen {
  position: fixed;
  top: 40px;
  left: 10px;
  z-index: 999;
  padding: 10px;
  display: flex;
}
.displayornot{
  display: none !important;
}
.dodisplay{
  display: block;
}

.keyDiv {
  margin-right: 5px;
  padding: 5px;
  border: 1px solid #999;
}
  .hamburger-container {
    line-height: #{$navbarHeight};
    height: 100%;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    line-height: #{$navbarHeight};
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .sunken {
    padding: 4px;
    border-right: 1px solid #F0F0F0;
    border-bottom: 1px solid #F0F0F0;
    border-left: 1px solid gray;
    border-top: 1px solid gray;
  }

  .dev-buttons {
    display: flex;
    height: 36px;
    align-items: center;
    padding-right: 20px;
  }
  .dev-button {
    cursor: pointer;
    width: 24px;
    height: 24px;
    margin: 6px 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    &.hover-effect {
      cursor: pointer;
      transition: background .3s;

      &:hover {
        background: rgba(0, 0, 0, .025);
        font-size: 24px;
      }
    }
  }
  .left-menu {
    height: 100%;
    line-height: #{$navbarHeight};
    display: flex;
    .home {
      color: #fff;
      font-size: 30px;
      cursor: pointer;
    }
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }
  }
  .right-menu {
    height: 100%;
    line-height: #{$navbarHeight};
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: calc(#{$navbarHeight} - 12px);
          height: calc(#{$navbarHeight} - 12px);
          border-radius: 6px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -10px;
          top: 12px;
          font-size: 12px;
        }
      }
    }
  }
  .menubar {
    height: 100%;
    line-height: #{$navbarHeight};
    display: flex;
    align-items: center;
    div {
      margin: 0 5px;
    }
  }
  .bthGroup {
    width: 180px;
    margin-left: 5px;
    display: flex;
    justify-content: space-around;
    color: #000;
    background-color: #fff;
    border-radius: 5px;
    user-select: none;
    div {
      flex: 1;
      text-align: center;
      cursor: pointer;
      border-radius: 5px;
    }
  }
  .info {
    margin-left: 10px;
    display: flex;
    align-items: center;
    user-select: none;
    span {
      color: rgb(95, 170, 8);
      text-decoration: underline;
    }
  }
  .active {
    color: #fff;
    background: #409EFF;
  }
  .speedBth {
    width: 30px;
    height: 20px;
    background-color: #FFF;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #000;
    user-select: none;
    cursor: pointer;
  }
  .speedBthAct {
    background-color: #67C23A;
    color: #FFF;
  }
}
</style>
