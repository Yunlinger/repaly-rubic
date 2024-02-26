<template>
  <div
    v-loading="loading"
    class="system"
  >
    <div class="project_list">
      <div class="item_view">
        <div class="name" :style="'background-image:url('+bg_Url+');'">
          <div v-if="psl.length > 0">
            <div style="font-size: 40px;">{{ psl[index].desc || '' }}</div>
            <div>{{ psl[index].name || '' }}</div>
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
                v-for="(item, idx) in psl"
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
      <div ref="list" class="list">
        <ul>
          <li v-for="(item, idx) in showList" :key="idx" ref="list_item" class="list_item">
            <div v-if="item.loadstatus" class="instances_box">
              <div ref="instances" class="instances">
                <div class="instances_user">
                  <div style="cursor: pointer;">
                    <el-badge v-if="item.userInfo.length > 0" :value="item.userInfo.length">
                      <div class="avatar">{{ item.name }}</div>
                    </el-badge>
                    <div v-else class="avatar">{{ item.name }}</div>
                  </div>
                </div>
                <div class="instances_info">
                  <div class="instances_users">
                    <div v-for="ite of 4" :key="ite">
                      <i v-if="item.userInfo[ite - 1 ]" class="el-icon-user"></i>
                      <i v-if="!item.userInfo[ite - 1 ]" class="el-icon-user" style="color: #909399;"></i>
                      <span v-if="item.userInfo[ite - 1 ]">{{ item.userInfo[ite - 1]['cname'] }}</span>
                    </div>
                  </div>
                  <div class="instances_msg">
                    <p v-if="item.time">运行时间：<span>{{ timeToString(item.time) }}</span></p>
                  </div>
                </div>
                <div class="instances_button">
                  <div class="start" @click="openProject(item.project, item.id)">进入分组</div>
                  <div v-if="item.id === uname" class="remove" @click="removeInstances(item)">
                    <i class="el-icon-switch-button" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="instances_box">
              <div ref="instances" class="instances">
                <div class="instances_user">
                  <div style="cursor: pointer;">
                    <div class="avatar">{{ item.name === '正在启动...' ? '加载中' : (item.name ? item.name : cname) }}</div>
                  </div>
                </div>
                <div v-if="item.id === uname && item.loadstatus !== 0" class="instances_button">
                  <div class="start" @click="user()">启动个人分组</div>
                </div>
                <div v-else class="instances_button">
                  <div class="load">分组加载中</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import { formatModelTimeString } from '@/utils'
// import * as mapi from '@/api/model'
import moment from 'moment'
import * as papi from '@/api/project'
import * as gapi from '@/api/group'
export default {
  name: 'Usystem',
  data() {
    return {
      loading: false,
      listLoading: false,
      // 工程列表 大写开头以区分计算属性里的project
      index: 0,
      list: [],
      projects_show: [], // 选择显示的工程
      projectList: [], // 总工程
      psl: [], // 可显示工程列表
      showList: [], // 显示的实例列表
      userList: [],
      bg_Url: require('@/assets/index/1121.png')
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'device', 'project', 'connects']),
    instances: function() {
      return this.$store.getters.project.instances
    },
    showIndex: function() {
      return this.$store.getters.project.index
    },
    uname: function() {
      return this.$store.getters.name
    },
    cname() {
      return this.$store.getters.cname
    }
  },
  watch: {
    index(val, old) {
      if (val === old) return
      this.projectCtlList = []
      this.showList.map(item => {
        item.open = false
      })
      // this.$store.commit('Clear')
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.loading = true
      this.getProList()
      this.$on('global:store.updateInst', (msg) => {
        if (this.listLoading || msg.id === 'dev') return
        this.projectList.map((item, index) => {
          if (item.name === msg.project) {
            let i = item.children.findIndex(ite => ite.id === msg.id && item.name === msg.project)
            if (i !== -1) {
              const { name, owner, project, time, running, caseName, conditionName, fault, faultName } = msg
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
                if (isNaN(msg.id)) {
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
              if (item.children[i].userInfo.length !== 0) {
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
        this.projectList = []
        this.userList = []
        this.getProList()
      })
      this.$refs.list.addEventListener('scroll', this.scroll)
    })
  },
  methods: {
    goDev() {
      let project = this.psl[this.index].name
      this.openProject(project, 'dev')
    },
    name(list, i) {
      if (list === undefined) return false
      if (list[i - 1] !== undefined) {
        return true
      }
    },
    change(index, next) {
      this.index = index
      this.showList = []
      this.showList = this.psl[index].children.sort((a, b) => {
        if (a.id === this.uname) {
          return -1
        } else {
          return a.id - b.id
        }
      })
      if (next !== undefined) {
        this.$store.commit('Set_Index', index)
        // this.$store.commit('Clear')
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
        for (let i of projectList) {
          cache.push(...i.children)
        }
        for (let i in this.instances) {
          this.instances[i].disabled = false
          this.instances[i].open = false
          this.instances[i].loadstatus = this.instances[i].name !== '正在启动...' && this.instances[i].name !== undefined ? 1 : 0
          this.instances[i].userInfo = []
          if (this.instances[i].id !== 'dev') instances.push(this.instances[i])
        }
        for (let k in cache) {
          cache[k].children = []
          if (instances.filter(item => item.project === cache[k].name).findIndex(item => item.id === this.uname) !== -1) {
            cache[k].children.push(...instances.filter(item => item.project === cache[k].name))
          } else {
            cache[k].children.push({ id: this.uname, name: this.cname, userInfo: [], open: false, disabled: false })
            cache[k].children.push(...instances.filter(item => item.project === cache[k].name))
          }
          cache[k].children.sort((a, b) => {
            if (a.id === this.uname) {
              return -1
            } else if (a.id === 'dev') {
              return 1
            } else {
              return a.id - b.id
            }
          })
          list.push({
            key: k,
            label: cache[k].name,
            disabled: k === '0' || k === '1' || k === '2'
          })
        }
        this.clientList(cache)
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
      this.psl = []
      this.showList = []
      this.psl.push(...cache)
      if (this.showIndex !== 0) {
        this.index = this.showIndex
        this.showList = this.psl[this.showIndex].children.sort((a, b) => {
          if (a.id === 'dev') {
            return -1
          } else {
            return a.id - b.id
          }
        })
      } else {
        let list = this.psl[0].children || []
        this.showList = list.sort((a, b) => {
          if (a.id === 'dev') {
            return -1
          } else {
            return a.id - b.id
          }
        })
      }
      this.loading = false
      this.listLoading = false
      setTimeout(() => {
        this.showList.map((item, index) => {
          if (item.id === this.uname) {
            this.$refs.list_item[index].style = 'position: sticky; left: 0; top: 0; z-index: 99;'
          }
        })
      })
    },
    scroll() {
      let scrolled = this.$refs.list.scrollTop
      if (scrolled !== 0) {
        this.$refs.list_item[0].style = 'position: sticky; left: 0; top: 0; z-index: 99;background-color: #000;border-radius: 10px;'
      } else {
        this.$refs.list_item[0].style = ''
      }
    },
    timeToString(date) {
      return moment.utc(date).format('HH:mm:ss')
    },
    removeInstances(ite) {
      let { project, id } = ite
      this.$confirm(`确认关闭ID为${ite.id}的分组`, '提示', {
        confirmButtonText: '关闭',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return papi.stopInstance(project, 'model', id)
      }).then(() => {
        this.projectList[this.index].children.map((item, index) => {
          if (item.id === id) {
            this.projectList[this.index].children[index] = { id: this.uname, name: this.cname, userInfo: [], open: false, disabled: false }
          }
        })
      }).catch(() => {
      })
    },
    // 用户自建
    user() {
      let id = this.uname
      if (this.showList.findIndex(item => item.id === id && item.name && item.running) !== -1) return
      let name = this.psl[this.index].name
      let value = this.$store.state.user.cname
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
    openProject(project, id) {
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
        // this.$router.push({ path: '/index/exercise' })
        // return Promise.resolve()
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './index.scss'
</style>
