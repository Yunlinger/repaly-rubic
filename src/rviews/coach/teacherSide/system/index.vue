<template>
  <div
    v-loading="loading"
    class="system"
  >
    <div class="project_list">
      <div class="item_view">
        <div class="name" :style="'background-image:url('+bg_Url+');'">
          <div v-if="projectList.length > 0">
            <div style="font-size: 40px;">{{ projectList[index].desc || '' }}</div>
            <div>{{ projectList[index].name || '' }}</div>
          </div>
        </div>
        <div class="devBth" @click="goDev()">dev</div>
        <div style="font-size: 35px;position: absolute; left: 55%; bottom: 10px; color: #F56C6C;">
          <el-popover
            placement="bottom"
            title="工程列表"
            width="400"
            trigger="click"
          >
            <div style="height: 200px; overflow-y: auto;">
              <div
                v-for="(item, idx) in projectList"
                :key="idx"
                :style="{ background: index === idx ? '#67C23A' : '', color: index === idx ? '#FFF' : ''}"
                style="padding: 5px;cursor: pointer;user-select: none;"
                @click="change(idx, true)"
              >
                {{ item.name }}
                <span style="float: right;">{{ item.desc }}</span>
              </div>
            </div>
            <div slot="reference" style="cursor: pointer;"><svg-icon icon-class="choose"></svg-icon>选择培训机组</div>
          </el-popover>
        </div>
      </div>
      <div style="width: 100%;">
        <div class="systemctl_menu">
          <div class="title">
            教练员控制台
          </div>
          <div class="switchs">
            <el-switch
              v-model="ctrlMode"
              active-text="总控模式"
              inactive-text="单控模式"
              @change="changeCtrlMode"
            >
            </el-switch>
            <div v-if="projectList.length > 0">
              <el-switch
                v-model="projectList[index].isExamMode"
                active-text="考试模式"
                inactive-text="练习模式"
                @change="examMode"
              >
              </el-switch>
            </div>
          </div>
          <div class="menu_button">
            <div class="buttons" style="color: #67C23A;" @click="startProjects">
              <div style="font-size: 35px;"><i class="el-icon-video-play" /></div>
              <div>运行</div>
            </div>
            <div class="buttons" style="color: #CF291F;" @click="stopProjects">
              <div style="font-size: 35px;"><i class="el-icon-video-pause" /></div>
              <div>冻结</div>
            </div>
          </div>
          <div class="menu_case" @click="toggle()">
            <div style="font-size: 35px;"><i :class="caseShow ? 'el-icon-s-fold' : 'el-icon-s-unfold'" /></div>
            <div>{{ caseShow ? '关闭案例面板' : '打开案例面板' }}</div>
          </div>
          <!-- <div class="item" @click="startProjects">
            <el-tooltip effect="dark" content="运行模型" placement="bottom">
              <i class="el-icon-video-play"></i>
            </el-tooltip>
          </div>
          <div class="item" @click="stopProjects">
            <el-tooltip effect="dark" content="冻结模型" placement="bottom">
              <i class="el-icon-video-pause"></i>
            </el-tooltip>
          </div>
          <div class="item" @click="ctlAll()">
            <el-tooltip effect="dark" content="群控" placement="bottom">
              <i class="el-icon-menu"></i>
            </el-tooltip>
          </div>
          <div class="item" @click="clearAll()">
            <el-tooltip effect="dark" content="清除群控" placement="bottom">
              <i class="el-icon-delete"></i>
            </el-tooltip>
          </div>
          <div v-if="projectList.length > 0" class="item" style="display: flex;flex-direction: column;justify-content: space-around;align-items: center;">
            <el-switch
              v-model="projectList[index].isExamMode"
              :active-value="true"
              :inactive-value="false"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="examMode"
            >
            </el-switch>
            {{ projectList[index].isExamMode ? '考试模式' : '练习模式' }}
          </div>
          <div class="item" @click="toggle()">
            <el-tooltip class="item" effect="dark" content="案例面板" placement="bottom">
              <i class="el-icon-tickets" />
            </el-tooltip>
          </div> -->
        </div>
        <div class="systemctl_project">
          <el-tag
            v-for="tag in projectCtlList"
            :key="tag.id"
            closable
            :disable-transitions="false"
            @close="remove(tag)"
          >
            {{ tag.id }}
          </el-tag>
        </div>
      </div>
      <div ref="list" class="list">
        <ul>
          <li v-for="(item, idx) in showList" :key="index + idx" ref="list_item" :style="{ background: item.choose ? 'rgba(103,194,58, 0.55)' : '' }" class="list_item">
            <div v-if="item.loadstatus" class="instances_box">
              <div ref="instances" class="instances">
                <div class="instances_user" @click="choose(item, idx)">
                  <el-badge :value="item.userInfo.length">
                    <div class="avatar">{{ item.name }}</div>
                  </el-badge>
                </div>
                <div class="instances_info">
                  <div class="instances_users" @click="choose(item, idx)">
                    <div v-for="ite of 4" :key="ite">
                      <i class="el-icon-s-platform" :style="{ color: item.isExamMode ? '#67C23A' : '#53A8FF' }" style="font-size: 70px;" />
                    </div>
                  </div>
                  <div v-if="item.caseName || hasCaseScore(item)" class="instances_case">
                    <div
                      v-if="item.caseName"
                      style="display: flex; flex-direction: column; justify-content: space-around; align-items: center;"
                    >
                      <div style="line-height: 20px;">
                        {{ item.caseName }}
                      </div>
                      <div>
                        <div
                          v-if="item.choose && projectCtlList.length < 2"
                          class="case_button"
                          style="margin-right: 5px;"
                          @click="showCase()"
                        >详情</div>
                        <div class="case_button" @click="giveup(item)">撤销</div>
                      </div>
                      <div>倒计时{{ formatModelTimeString(item.remainTime * 1000) }}</div>
                    </div>
                    <div v-if="!item.caseName && hasCaseScore(item)">
                      得分{{ hasCaseScore(item).score }}
                    </div>
                  </div>
                  <div class="instances_msg">
                    <el-alert v-if="item.conditionName" :title="item.conditionName" type="info" show-icon :closable="false"></el-alert>
                    <div>
                      <div v-for="(ite, num) in item.faultName" :key="num" class="faultName">
                        <span class="fname">{{ ite }}</span>
                        <div>
                          <el-select
                            v-if="isSelectFault(ite) && projectCtlList.length < 2 && item.choose"
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
                          <span style="float: right;background-color: #E6A23C;border-radius: 5px; padding: 3px 2px; line-height: 20px;cursor: pointer;" @click="undo(item, num)">撤销</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="instances_button">
                  <span class="one" style="font-size: 25px;">
                    <i v-if="item.running === true" class="el-icon-video-pause" style="font-size:25px;" @click="start(item, false)"></i>
                    <i v-if="item.running === false" class="el-icon-video-play" style="font-size:25px;" @click="start(item, true)"></i>
                    {{ timeToString(item.time, false) }}
                  </span>
                  <span>
                    <el-button type="primary" @click="openProject(item.project, item.id)">进入分组</el-button>
                    <el-button v-if="item.id !== 'dev'" type="info" @click="removeInstances(item)">关闭</el-button>
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="instances_box">
              <div ref="instances" class="instances">
                <div class="instances_user">
                  <div style="cursor: pointer; ">
                    <el-badge>
                      <div class="avatar">{{ item.name || item.id }}</div>
                    </el-badge>
                  </div>
                </div>
                <div class="instances_info">
                  <div class="instances_users">
                    <div v-for="ite of 4" :key="ite">
                      <i class="el-icon-s-platform" style="font-size: 70px;" />
                      <!-- <span v-if="item.userInfo[ite - 1 ]" style="color: #67C23A;">{{ item.userInfo[ite - 1]['cname'] }}</span> -->
                    </div>
                  </div>
                </div>
                <div v-if="item.loadstatus === 0" style="width: 150px;height: 80px;padding: 10px 0;line-height: 80px;">
                  <div class="loadingBth">分组加载中</div>
                </div>
                <div v-else style="width: 150px;height: 80px;padding: 10px 0;line-height: 80px;">
                  <div style="width: 150px;height: 60px; border-radius: 5px;background-color: #909399;cursor: pointer;text-align: center;line-height: 60px;" @click="user(item.id)">启动分组</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="systemctl_right">
      <div v-if="menu_show" class="right_box">
        <cases v-if="caseShow" ref="cases" :status="true" :projectCtlList="projectCtlList" />
        <div v-show="!caseShow" style="width: 100%; height: 100%;">
          <div class="box_top">
            <div ref="condMain" style="flex: 1;border-top-left-radius: 10px;border-bottom-left-radius: 10px;">
              <cond-list ref="cond" @loadConds="loadConds" />
            </div>
            <div v-if="snapshotMain" style="width: 35%;background: #909399;">
              <snapshot ref="snapshot" />
            </div>
          </div>
          <div class="box_below">
            <fault-list ref="fault" :status="true" @loadFault="loadFault" @loadFaults="loadFaults" />
          </div>
        </div>
      </div>
      <div v-else class="right_empty">
        <div style="margin-top: 50px;">
          <el-image :src="msg_Url"></el-image>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatModelTimeString } from '@/utils'
import * as mapi from '@/api/model'
import * as papi from '@/api/project'
import * as gapi from '@/api/group'
import * as fapi from '@/api/fault'
import * as capi from '@/api/condition'
import * as rdbapi from '@/api/rtd'
import { giveup } from '@/api/case'
import showCaseDialog from '@/rviews/case'
import CondList from './condList'
import FaultList from './faultList'
import Snapshot from '@/rviews/condition/Snapshot'
import cases from '@/rviews/case/list'
export default {
  name: 'System',
  components: { CondList, FaultList, Snapshot, cases },
  data() {
    return {
      loading: false,
      listLoading: false,
      // 工程列表 大写开头以区分计算属性里的project
      index: 0,
      dialogVisible: false,
      // 穿梭框
      list: [],
      projects_show: [], // 选择显示的工程
      projectList: [], // 总工程
      showList: [], // 显示的实例列表
      menu_show: false,
      list_open: null, // 实例列表中打开的实例索引
      projectCtlList: [], // 群控列表
      bg_Url: require('@/assets/index/1121.png'),
      msg_Url: require('@/assets/teacher/msg.jpg'),
      snapshotMain: true,
      isExamMode: false,
      caseShow: false,
      finalScoreList: {},
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
      nodes: [],
      selectFaultItems: {},
      ctrlMode: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'device', 'project', 'connects', 'selectedInst']),
    currentModel: function() {
      return (
        this.$store.getters.project.project + '.' + this.$store.getters.project.id
      )
    },
    instances: function() {
      return this.$store.getters.project.instances
    },
    showIndex: function() {
      return this.$store.getters.project.index
    },
    uname: function() {
      return this.$store.getters.name
    },
    cname: function() {
      return this.$store.getters.cname
    },
    hasCaseScore: function() {
      return (val) => {
        return (this.finalScoreList[val.project] && this.finalScoreList[val.project][val.id]) || false
      }
    },
    levelFault: function() {
      return this.$store.getters.project.levelFault[this.selectedInst.id] || []
    },
    // 程度故障
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
    }
  },
  watch: {
    index(val, old) {
      if (val === old) return
      this.projectCtlList = []
      this.showList.map(item => {
        item.open = false
      })
      this.isExamMode = false
      this.$store.commit('Clear')
    },
    list_open(val, old) {
      if (val !== old) {
        this.projectList[this.index].children.map((item, index) => {
          if (index !== val) {
            item.open = false
          }
        })
      }
      if (old === null) return
    },
    projectCtlList(val, old) {
      if (val.length === 0) {
        this.menu_show = false
        let list = this.$refs.list_item
        if (list) {
          list.map(item => {
            item.style.background = ''
          })
        }
      } else {
        if (val.length === 1) {
          this.$store.dispatch('show_instances', { project: val[0].project, model: 'model', id: val[0].id }).then(() => {
            val[0].open = true
            this.snapshotMain = true
            setTimeout(() => {
              this.$refs.snapshot.getList()
              this.$refs.cond.sendItem(false)
              this.$refs.fault.sendItem(false)
            }, 0)
          })
        }
        // else if (val.length === 1 && old.length === 0) {
        //   this.snapshotMain = false
        // }
        if (val.length > 1) {
          this.snapshotMain = false
          // 故障工况文件直接获取, 案例 SET_PMI群控列表首位为系统默认工程、id, 暂时不清空隐藏
          // this.$store.commit('Clear')
          // if (old.length === 1) this.$refs.condMain.style.width = '100%'
        }
        let list = this.$refs.list_item
        for (let i in this.showList) {
          if (val.findIndex(ite => ite.id === this.showList[i].id) === -1) {
            list[i].style.background = ''
          }
        }
      }
    },
    menu_show(val) {
      if (val) {
        setTimeout(() => {
          this.$refs.cond.getList(this.projectList[this.index].name)
          this.$refs.cond.getPersonList()
          this.$refs.fault.updateTree(this.projectList[this.index].name)
        }, 0)
      }
    }
  },
  // 会报错
  // activated() {
  //   this.clientList(this.projectList)
  // },
  mounted() {
    this.$on('global:case.finish', (msg) => {
      const { p, i, data } = msg
      this.finalScoreList[p] = {}
      this.finalScoreList[p][i] = data
    })
    this.$nextTick(() => {
      this.loading = true
      this.getProList()
      this.$on('global:store.updateInst', (msg) => {
        if (this.listLoading || msg.id === 'dev') return
        this.projectList.map((item, index) => {
          if (item.name === msg.project) {
            item.isExamMode = item.children.findIndex(ite => ite.isExamMode) !== -1
            let i = item.children.findIndex(ite => ite.id === msg.id && item.name === msg.project)
            if (i !== -1) {
              const { name, owner, key, project, isExamMode, time, remainTime, running, caseName, conditionName, fault, faultName } = msg
              let pname = name && (name && name.indexOf('加载') === -1) ? 1 : 0
              item.children[i].loadstatus = pname
              // 当实例id等于当前用户id 实例名称使用用户cname
              if (msg.id === this.uname) {
                item.children[i].name = item.children[i].name || name
              } else {
                item.children[i].name = name && name.includes('加载') ? item.children[i].name : name
              }
              item.children[i].owner = owner || ''
              item.children[i].time = time
              item.children[i].key = key || ''
              item.children[i].remainTime = remainTime
              item.children[i].isExamMode = isExamMode || false
              item.children[i].project = project
              item.children[i].running = running || false
              item.children[i].caseName = caseName || ''
              item.children[i].conditionName = conditionName || ''
              item.children[i].fault = fault || []
              item.children[i].faultName = faultName || []
              if (item.children[i].userInfo === undefined) {
                item.children[i].userInfo = []
              }
              if (index === this.index) {
                this.change(index)
              }
            } else {
              if (msg.name === '正在启动...' && item.name === msg.project) {
                let obj = msg
                obj.loadstatus = obj.name !== '正在启动...' && obj.name !== undefined ? 1 : 0
                item.children.push(obj)
              }
            }
          }
        })
      })
      this.$on('global:store.deleteInst', (msg) => {
        this.projectList.map((item, idx) => {
          if (msg.indexOf(item.name) !== -1) {
            let id = msg.split('/')[4]
            let index = item.children.findIndex(ite => ite.id === id)
            if (index !== -1) {
              if (id === this.uname) {
                item.children[index] = { id: this.uname, name: this.cname, userInfo: [], open: false, disabled: false }
                this.change(idx)
              } else {
                if (isNaN(id)) {
                  item.children.splice(index, 1)
                  return
                }
                item.children[index] = { id: `${index}`, userInfo: [], open: false, disabled: false }
                if (this.index === idx) {
                  this.change(idx)
                }
              }
            }
          }
        })
      })
      this.$on('global:connect.change', (msg) => {
        let data = msg.data
        if (this.listLoading) return
        this.projectList.map((item, index) => {
          if (item.name === data.p) {
            for (let i = 0; i < item.children.length; i++) {
              if (item.children[i].userInfo && item.children[i].userInfo.length !== 0) {
                let list = item.children[i].userInfo
                for (let k = 0; k < list.length; k++) {
                  if (list[k].id === data.id && item.children[i].id !== data.i) {
                    list.splice(k, 1)
                  }
                }
              }
            }
            let idx = item.children.findIndex(ite => ite.id === data.i)
            if (idx === -1) return
            item.children[idx].userInfo.push(data)
          }
        })
      })
      this.$on('global:connect.stop', (msg) => {
        let data = msg.data
        this.projectList.map((item) => {
          if (item.name === data.p) {
            let idx = item.children.findIndex(ite => ite.id === data.i)
            if (idx === -1) return
            let keyIndex = item.children[idx].userInfo.findIndex(key => key.id === data.id)
            item.children[idx].userInfo.splice(keyIndex, 1)
          }
        })
      })
      this.$on('global:websocket.open', () => {
        // websocket 连接成功后刷新视图
        if (this.listLoading) return
        this.getProList()
      })
      // this.$refs.list.addEventListener('scroll', this.scroll)
    })
  },
  methods: {
    goDev() {
      let project = this.projectList[this.index].name
      this.openProject(project, 'dev')
    },
    scroll() {
      let scrolled = this.$refs.list.scrollTop
      if (scrolled !== 0) {
        this.$refs.list_item[0].style = 'position: sticky; left: 0; top: 0; z-index: 99;background-color: #C0C4CC;border-radius: 10px;'
      } else {
        this.$refs.list_item[0].style = ''
      }
    },
    undo(ite, idx) {
      let obj = { id: ite.fault[idx] }
      let params = {
        'rubik.project': ite.project,
        'rubik.model': 'model',
        'rubik.id': ite.id
      }
      fapi.stops(obj, params).then(() => {
        this.$msg.success('撤销故障成功')
      }).catch(err => {
        this.$msg.error(err, '撤销故障失败')
      })
    },
    toggle() {
      if (!this.projectCtlList.length) return
      this.caseShow = !this.caseShow
      this.$nextTick(() => {
        if (this.caseShow) {
          this.$refs.cases.resizes()
        }
      })
    },
    giveup(item) {
      let params = {
        'rubik.project': item.project,
        'rubik.model': 'model',
        'rubik.id': item.id
      }
      this.$confirm(`确认关闭案例考试`, '提示', {
        confirmButtonText: '关闭',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        giveup(item.case, params)
      })
    },
    showCase() {
      showCaseDialog()
    },
    formatModelTimeString(ms) {
      return formatModelTimeString(ms)
    },
    async choose(item, idx) {
      if (this.projectCtlList.length > 1) return
      const { project, id } = this.selectedInst
      if (project === item.project && id === item.id && this.menu_show) return
      this.$store.dispatch('show_instances', { project: item.project, model: 'model', id: item.id }).then(async() => {
        this.menu_show = true
        this.showList.map((ite, index) => {
          if (index !== idx) {
            ite.open = false
            ite.choose = false
          }
        })
        setTimeout(() => {
          this.$refs.fault.setFault()
        }, 0)
        item.open = true
        item.choose = true
        this.projectCtlList.forEach((element, index) => {
          if (element !== item) {
            this.projectCtlList.splice(index, 1)
          }
        })
        if (this.projectCtlList.findIndex(ite => item === ite) !== -1) return
        this.projectCtlList.push(item)
      })
    },
    change(index, next) {
      this.index = index
      this.showList = []
      this.showList = this.projectList[index].children.sort((a, b) => {
        if (a.id === this.uname) {
          return -1
        } else {
          return a.id - b.id
        }
      })
      if (next !== undefined) {
        this.showList.map(item => {
          item.choose = false
        })
        this.$store.commit('Set_Index', index)
        this.$store.commit('Clear')
        this.$store.commit('CLEAR_FAULT')
        this.clearAll()
        // 更新工程故障加载列表
        // this.updateTree()
      }
    },
    getProList() {
      let uid = this.$store.getters.user.id
      if (!uid) {
        return
      }
      let cache = []
      this.listLoading = true
      this.projectList = []
      let projectList = []
      gapi.getGroupsOfUser(uid).then((res) => {
        projectList = res.items || []
        projectList.sort((a, b) => {
          return a.id - b.id
        })
        let gets = projectList.map((g) => {
          return papi.getProjectsOfGroup(g.id).then((pros) => {
            // 与外部projects无关
            let children = []
            for (let name in pros.items) {
              children.push(pros.items[name])
            }
            g.children = children
          })
        })
        return Promise.all(gets)
      }).then(() => {
        // this.Project = JSON.parse(JSON.stringify(this.Project))
        let instances = []
        let list = []
        for (let i = 1; i <= 5; i++) {
          list.push({ id: `${i}`, userInfo: [], open: false, disabled: false })
        }
        for (let i of projectList) {
          for (let k of i.children) {
            k.children = []
            k.isExamMode = false
            k.children.push(...list)
          }
          cache.push(...i.children)
        }
        for (let i in this.instances) {
          this.instances[i].disabled = false
          this.instances[i].open = false
          this.instances[i].choose = false
          this.instances[i].userInfo = []
          instances.push(this.instances[i])
        }
        for (let k in cache) {
          cache[k].children.map((item, index) => {
            for (let i of instances) {
              if (item.id === i.id && cache[k].name === i.project) {
                cache[k].children[index] = i
              }
            }
          })
          // 当实例列表没有账号同名id的实例， 创建空对象置顶
          if (instances.filter(item => item.project === cache[k].name).findIndex(item => item.id === this.uname) === -1) {
            cache[k].children.push({ id: this.uname, name: this.cname, userInfo: [], open: false, disabled: false })
          }
          let nameList = ['1', '2', '3', '4', '5', 'dev']
          // 实例启动会推送加载服务消息， name正在启动已停用
          for (let i of instances) {
            if (i.project === cache[k].name && !nameList.includes(i.id)) {
              i.loadstatus = !i.name.includes('加载') && i.name !== undefined ? 1 : 0
              cache[k].children.push(i)
            } else {
              if (nameList.includes(i.id)) i.loadstatus = !i.name.includes('加载') && i.name !== undefined ? 1 : 0
            }
          }
          cache[k].children.sort((a, b) => {
            if (a.id === this.uname) {
              return -1
            } else {
              return a.id - b.id
            }
          })
        }
        this.clientList(cache)
        this.projectList = cache
      })
    },
    clientList(cache) {
      let list = []
      for (let i in this.connects) {
        list.push(this.connects[i])
      }
      for (let i = 0; i < cache.length; i++) {
        let k = list.filter(item => item.p === cache[i].name)
        if (k.length) {
          for (let j of k) {
            let idx = cache[i].children.findIndex(ite => ite.id === j.i)
            if (idx !== -1) {
              if (cache[i].children[idx].userInfo.findIndex(it => it.id === j.id) === -1) {
                cache[i].children[idx].userInfo.push(j)
              }
            }
          }
        }
      }
      this.projectList = cache
      this.displayList(cache)
    },
    displayList(cache) {
      this.showList = []
      if (this.showIndex !== 0) {
        this.index = this.showIndex
        let list = this.projectList[this.showIndex].children || []
        this.showList = list.sort((a, b) => {
          if (a.id === this.uname) {
            return -1
          } else {
            return a.id - b.id
          }
        })
      } else {
        if (this.projectList.length === 0) return
        let list = this.projectList[0].children || []
        this.showList = list.sort((a, b) => {
          if (a.id === this.uname) {
            return -1
          } else {
            return a.id - b.id
          }
        })
      }
      // this.ctlShow()
      this.loading = false
      this.listLoading = false
    },
    ctlShow() {
      let p = this.projectList[this.index].name
      if (p !== '' && this.showList.length > 0) {
        let id = this.showList[0].id
        this.$store.dispatch('show_instances', { project: p, model: 'model', id: id }).then(() => {
          this.menu_show = true
        })
      }
    },
    createIns() {
      this.$message({
        type: 'info',
        message: '实例开始创建'
      })
      const name = this.projectList[this.index].name
      let instance = '实例' + Number(this.showList.length + 1)
      papi.startInstance(name, 'model', instance).then(() => {
        this.$message({
          type: 'success',
          message: `${instance}创建成功`
        })
      }).catch(() => {
        this.$message({
          type: 'error',
          message: `${instance}创建失败`
        })
      })
    },
    open(item, index) {
      this.list_open = index
    },
    timeToString(time, onlySecond) {
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
    start(item, status) {
      let params = {
        'rubik.project': this.projectList[this.index].name,
        'rubik.model': 'model',
        'rubik.id': item.id
      }
      mapi.modelStart(status, params).then(res => {
        if (status) {
          this.$msg.success(`模型编号${item.id}开始运算`)
        } else {
          this.$msg.success(`模型编号${item.id}停止运算`)
        }
      })
    },
    // 启动模型
    async startProjects() {
      for (let i of this.projectCtlList) {
        let params = {
          'rubik.project': i.project,
          'rubik.model': 'model',
          'rubik.id': i.id
        }
        mapi.modelStart(true, params).then(res => {
          this.$msg.success(`模型编号${i.id}开始运算`)
        })
      }
    },
    // 冻结模型
    async stopProjects() {
      for (let i of this.projectCtlList) {
        let params = {
          'rubik.project': i.project,
          'rubik.model': 'model',
          'rubik.id': i.id
        }
        mapi.modelStart(false, params).then(res => {
          this.$msg.success(`模型编号${i.id}停止运算`)
        })
      }
    },
    // 群控
    async ctlAll() {
      let idx = this.index
      if (idx === null) return
      if (this.projectCtlList.length === this.showList.length) return
      this.projectCtlList = []
      for (let i of this.showList) {
        i.open = false
        // 无key不加入群控
        if (i.name && i.id && i.key) {
          i.choose = true
          this.projectCtlList.push(i)
        }
      }
      // 只有一个或者没有不群控
      if (this.projectCtlList.length === 0 || this.projectCtlList.length < 2) {
        for (let i of this.showList) {
          i.open = false
          i.choose = false
        }
        this.projectCtlList = []
        return
      }
      let obj = this.projectCtlList[0]
      await this.$store.dispatch('show_instances', { project: obj.project, model: 'model', id: obj.id })
      // this.$store.commit('Clear')
      this.loadend()
    },
    loadend() {
      if (this.projectCtlList.length === 0) return
      this.menu_show = true
      setTimeout(() => {
        this.$refs.cond.sendItem(true)
        this.$refs.fault.sendItem(true)
      }, 0)
    },
    async loadConds(data) {
      for (let i of this.projectCtlList) {
        let params = {
          'rubik.project': i.project,
          'rubik.model': 'model',
          'rubik.id': i.id
        }
        if (data.personal) {
          capi.loadCond(data.id, data.personal, params).then(res => {
            this.$msg.success(`编号ID${i.id}加载工况成功`)
          }).catch(() => {
            this.$msg.error(`编号ID${i.id}加载工况失败`)
          })
        } else {
          capi.loadCond(data.id, false, params).then(res => {
            this.$msg.success(`编号ID${i.id}加载工况成功`)
          }).catch(() => {
            this.$msg.error(`编号ID${i.id}加载工况失败`)
          })
        }
      }
    },
    async loadFault(data) {
      for (let i of this.projectCtlList) {
        let params = {
          'rubik.project': i.project,
          'rubik.model': 'model',
          'rubik.id': i.id
        }
        let obj = data
        fapi.starts(obj, params).then(res => {
          this.$msg.success(`编号ID${i.id}投入故障成功`)
        }).catch(() => {
          this.$msg.error(`编号ID${i.id}投入故障失败`)
        })
      }
    },
    async loadFaults(data) {
      for (let i of this.projectCtlList) {
        let params = {
          'rubik.project': i.project,
          'rubik.model': 'model',
          'rubik.id': i.id
        }
        let obj = {
          id: data.id,
          name: data.name,
          sort: data.info.sort,
          ops: [{ var: data.ops.var, start: 0, target: '' }]
        }
        obj.ops[0].target = Number(data.level * 100)
        fapi.starts(obj, params).then(res => {
          this.$msg.success(`编号ID${i.id}投入故障${data.name}成功`)
        }).catch(() => {
          this.$msg.error(`编号ID${i.id}投入故障失败`)
        })
      }
    },
    // 清除群控
    clearAll() {
      if (this.projectCtlList.length === 0) return
      for (let i of this.showList) {
        i.open = false
        i.choose = false
      }
      this.projectCtlList = []
      this.$store.commit('Clear')
      this.menu_show = false
    },
    removeInstances(ite) {
      // if (ite.open) return
      let project = this.projectList[this.index].name
      let { id } = ite
      this.$confirm(`确认关闭ID为${ite.id}的分组`, '提示', {
        confirmButtonText: '关闭',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return papi.stopInstance(project, 'model', id)
      }).then(() => {
        let idx = this.projectCtlList.findIndex(item => item.id === id)
        this.projectCtlList.splice(idx, 1)
      }).catch(() => {
      })
    },
    remove(tag) {
      if (this.ctrlMode) return
      let index = this.projectCtlList.findIndex(item => item.id === tag.id)
      this.projectCtlList.splice(index, 1)
      this.showList.map(item => {
        if (item.id === tag.id) {
          item.open = false
          item.choose = false
        }
      })
    },
    // 教练员台用户自建 改为创建分组
    user(id) {
      let name = this.projectList[this.index].name
      let value = id === this.$store.getters.name ? this.$store.getters.cname : `实例${Number(id)}`
      this.$message({
        type: 'info',
        message: '实例开始创建'
      })
      papi.startInstance(name, 'model', value, id).then(() => {
        this.$message({
          type: 'success',
          message: '创建成功'
        })
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '创建失败'
        })
      })
    },
    async openProject(project, id) {
      if (!project || !id) return
      let index = Object.values(this.instances).findIndex(item => item.project === project && item.id === id)
      if (index === -1) {
        this.$message({
          type: 'error',
          message: '实例未启动'
        })
        return
      }
      this.$store.dispatch('openProject', {
        project: project,
        model: 'model',
        id: id
      }).then(() => {
        this.$router.push({ path: '/engineer' })
      }).catch(() => { })
    },
    async setExam() {
      let list = this.showList.filter(item => item.name && item.id && item.key)
      if (list.length < 1) return
      for (let i of list) {
        let params = { project: i.project, id: i.id }
        papi.setexam(params).catch(() => {
          this.$message({
            type: 'error',
            message: `考试模式加载失败，请重试`
          })
        })
      }
    },
    unsetExam() {
      let list = this.showList.filter(item => item.name && item.id && item.isExamMode)
      if (list.length < 1) return
      for (let i of list) {
        let params = { project: i.project, id: i.id }
        papi.unsetexam(params).catch(() => {
          this.$message({
            type: 'error',
            message: `考试模式取消失败，请重试`
          })
        })
      }
    },
    hasKey(key) {
      // 只有一个时，群控不生效
      if (key) {
        return this.showList.filter(item => item.name && item.id && item.key).length > 1
      }
      return this.showList.filter(item => item.name && item.id && item.key).length
    },
    examMode(val) {
      if (val) {
        if (this.hasKey()) {
          this.setExam()
          return
        }
        this.projectList[this.index].isExamMode = false
      } else {
        this.unsetExam()
      }
    },
    changeCtrlMode(val) {
      if (val) {
        if (this.hasKey('exam')) {
          this.ctlAll()
          return
        }
        this.ctrlMode = false
      } else {
        this.clearAll()
      }
    },
    switchdisable() {
      return !(this.projectCtlList.length === this.showList.filter(item => item.name && item.id).length)
    },
    // 给当前投入的程度故障更改程度
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
    updateTree() {
      papi.getFault(this.projectList[this.index].name).then(async res => {
        let list = res.list.items || {}
        let cache = await this.convertList(list)
        let id = this.selectedInst.id
        this.$store.commit('SET_FAULT', { name: id, list: cache })
      })
    },
    getItem(ite) {
      this.selectFaultItems = this.levelFault.find(item => item.name === ite)
    },
    updateVar(val) {
      this.setVar(this.selectFaultItems, val)
    },
    async setVar(obj, val) {
      await rdbapi.setValue(obj.ops[0].var, Number(val) * 100)
      setTimeout(() => {
        this.updateTree()
      }, 200)
    }
  }
}
</script>

<style scoped src='./iconfont.css'></style>
<style lang="scss" scoped>
  @import './index.scss'
</style>
