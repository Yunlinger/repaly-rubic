<template>
  <div>
    <div style="width: 10%;background-color: #2e2e2f;float: left;height: 100vh;display: flex;flex-direction: column;align-items: center;">
      <div class="box" style="margin-top: 6px;">
        <img class="avatars" :src="loginIcon" alt="Avatar">
        <div class="names">{{ cname }}</div>
      </div>

      <div class="box">
        <div class="inner-box" :class="{ 'active': selectedContent === 'system' }" @click="changeContent('system')">
          <img class="inner-image" :src="stupc" alt="Image 1">
          <div class="inner-text">仿真实训</div>
        </div>
        <div class="inner-box" :class="{ 'active': selectedContent === 'exam' }" @click="changeContent('exam')">
          <img class="inner-image" :src="kaoshipc" alt="Image 2">
          <div class="inner-text">考试&练习</div>
        </div>
      </div>
    </div>
    <div class="item_view" style="float: left;">
      <div class="name" style="float: left;">
        <div v-if="psl.length > 0" style="float: left;">
          <div style="font-size: 30px;line-height: 80px;margin-left: 8px;">仿真对象机组: {{ psl[index].desc || '' }}</div>
        </div>
      </div>
      <div style="color: rgb(72, 71, 73);line-height: 80px;float: left;">
        <el-popover
          placement="bottom"
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
              {{ item.desc }}
              <span style="float: right;">{{ item.name }}</span>
            </div>
          </div>
          <div slot="reference" style="cursor: pointer;">
            <svg-icon icon-class="choose"></svg-icon>
            点击选择培训机组
          </div>
        </el-popover>
      </div>
      <div style="position: absolute;right: 50px;height: 80px;line-height: 80px;">
        <span class="lououtbtn" style="color: rgb(3, 3, 3);cursor: pointer;" @click="logout">退出登录</span>
      </div>
    </div>
    <div
      v-if="selectedContent === 'system'"
      v-loading="loading"
      class="system"
    >
      <div class="project_list">
        <div ref="list" class="list">
          <ul>
            <li v-for="(item, idx) in showList" :key="idx" ref="list_item" class="list_item">
              <div class="instances_box">
                <div ref="instances" class="instances">
                  <div class="instances_user">
                    <div>
                      <div style="width: 40px;height: 40px;border-radius: 100%;margin-right: 8px;" :class="item.loadstatus === 1 ? 'startStatus' : 'offStatus'"></div>
                    </div>
                    <div style="cursor: pointer;">
                      <div class="avatar">#{{ item.id }}仿真服务</div>
                    </div>
                  </div>
                  <div class="instances_info">
                    <div v-if="item.loadstatus" class="instances_users">
                      <div v-for="ite of item.userInfo.length" :key="ite">
                        <i v-if="item.userInfo[ite - 1 ]" class="el-icon-user"></i>
                        <i v-if="!item.userInfo[ite - 1 ]" class="el-icon-user" style="color: #909399;"></i>
                        <span v-if="item.userInfo[ite - 1 ]">{{ item.userInfo[ite - 1]['cname'] }}</span>
                      </div>
                    </div>

                  </div>
                  <div class="instances_button">
                    <div :class="item.loadstatus?'start':'disClick'" @click="openProject(item.project, item.id)">进入分组</div>
                    <div v-if="item.id === uname" class="remove" @click="removeInstances(item)">
                      <i class="el-icon-switch-button" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="selectedContent === 'exam'">
      123
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
      loginIcon: require('@/assets/hollysys/loginIcon.svg'),
      stupc: require('@/assets/hollysys/stupc.png'),
      kaoshipc: require('@/assets/hollysys/kaoshipc.png'),
      selectedContent: 'system',
      loading: false,
      listLoading: false,
      // 工程列表 大写开头以区分计算属性里的project
      index: 4,
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
        // if (this.listLoading || msg.id === 'dev') return
        this.projectList.map((item, index) => {
          if (item.name === msg.project) {
            let i = item.children.findIndex(ite => ite.id === msg.id)
            if (i === -1) {
              let name = msg.name
              let pname = name.indexOf('加载') === -1 ? 1 : 0
              if (pname) {
                this.getProList()
              }
            }

            // let pname = name && (name && name.indexOf('加载') === -1) ? 1 : 0
            // item.children[i].loadstatus = pname
            // // 当实例id等于当前用户id 实例名称使用用户cname
            // if (msg.id === this.uname) {
            //   item.children[i].name = item.children[i].name || name
            // } else {
            //   item.children[i].name = name && name.includes('加载') ? item.children[i].name : name
            // }
            // item.children[i].owner = owner || ''
            // item.children[i].time = time
            // item.children[i].project = project
            // item.children[i].running = running || false
            // item.children[i].caseName = caseName || ''
            // item.children[i].conditionName = conditionName || ''
            // item.children[i].fault = fault || []
            // item.children[i].faultName = faultName || []
            // if (item.children[i].userInfo === undefined) {
            //   item.children[i].userInfo = []
            // }
          }
        })
      })
      this.$on('global:store.deleteInst', (msg) => {
        this.projectList.map((item, idx) => {
          if (msg.indexOf(item.name) !== -1) {
            let id = msg.split('/')[4]
            let index = item.children.findIndex(ite => ite.id === id)
            if (index !== -1) {
              this.getProList()
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
    async logout() {
      // window.localStorage.clear()
      // window.sessionStorage.clear()
      // await this.$store.dispatch('user/clearAll')
      await this.$store.commit('SET_FORBID', true)
      await this.$store.commit('Set_Index', 0)
      this.$store.dispatch('settings/changeView', 'isDev')
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
      this.$msg.success('成功退出')
    },
    changeContent(content) {
      this.selectedContent = content
    },
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
      for (let i = 1; i <= 10; i++) {
        this.showList.push({ id: `${i}`, name: `#${i}`, userInfo: [], loadstatus: 0 })
      }
      for (let i = 0; i < this.psl[index].children.length; i++) {
        let currentId = this.psl[index].children[i].id || []
        let foundIndex = this.showList.findIndex(item => item.id === currentId)
        this.showList[foundIndex] = this.psl[index].children[i]
      }
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
      this.showList = []
      this.psl = []
      for (let i = 1; i <= 10; i++) {
        this.showList.push({ id: `${i}`, name: `#${i}`, userInfo: [], loadstatus: 0 })
      }

      this.psl.push(...cache)
      for (let i = 0; i < this.psl[this.index].children.length; i++) {
        let currentId = this.psl[this.index].children[i].id || []
        let foundIndex = this.showList.findIndex(item => item.id === currentId)
        this.showList[foundIndex] = this.psl[this.index].children[i]
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
    // scroll() {
    //   let scrolled = this.$refs.list.scrollTop
    //   if (scrolled !== 0) {
    //     this.$refs.list_item[0].style = 'position: sticky; left: 0; top: 0; z-index: 99;background-color: #000;border-radius: 10px;'
    //   } else {
    //     this.$refs.list_item[0].style = ''
    //   }
    // },
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
.lououtbtn :hover{
  color: red;
}
.item_view {
      background-color: #dbdcdd;
      position: relative;
      width: 90%;
      height: 80px;
      text-align: left;
      color: #000;
}
.inner-box.active {
  background-color: #70b601; /* 选中时的背景颜色 */
}
.box {
  width: 100%;
  margin-bottom: 20px;
}

.startStatus{
  background: green;
}

.offStatus{
  background: rgb(122, 122, 122);
}

.disClick{
  width: 180px;
  border-radius: 5px;
  pointer-events:none;
  background-color:#706e6e;
  color: white;
}

.avatars {
  display: block;
  margin: 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.names {
  text-align: center;
  margin-top: 10px;
  color: white;
}

.inner-box {
  width: 100%;
  padding: 14px 0;
  margin-bottom: 10px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease; /* 添加过渡效果 */

}

.inner-image {
  width: 32px;
  height: 32px;
}

.inner-text {
  text-align: center;
  margin-top: 5px;
  color: white;
}
  .system {
  height: calc(100vh - 80px);
  width: 90%;
  background-color: #c8c7c7;
  float: left;
  display: flex;
  user-select: none;
  // 跑马灯底部按钮
  ::v-deep .el-carousel__indicators {
    display: none;
  }
  ::v-deep .el-carousel__arrow {
    i {
      font-size: 35px;
    }
  }
  ::v-deep .el-avatar {
    background-color: #67C23A;
  }
  .project_list {
    width:100%;
    height:100%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    .project_build {
      display:flex;
      justify-content:space-around;
      height:50px;
      line-height: 50px;
      font-size: 30px;
      cursor: pointer;
      color:#777;
      user-select: none;
    }
    .item_view {
      background-color: #a8a9aa;
      position: relative;
      width: 100%;
      height: 80px;
      text-align: left;
      color: #000;

      .name {
        height: 100%;
        padding-left: 40px;
        line-height: 75px;
        font-size: 20px;
        background-size: auto 100%;
        background-position: center right;
        background-repeat: no-repeat;
      }

      .devBth {
        position: absolute;
        right: 10px; bottom: 10px;
        width: 50px;
        height: 30px;
        line-height: 28px;
        text-align: center;
        border: 1px solid #EEE;
        border-radius: 5px;
        cursor: pointer;
      }
      .devBth:hover {
        color: #FFF;
        background-color: #67C23A;
      }
    }

    .carousel_item_view {
      background-image: linear-gradient(to right, #AFECEC,#51C1FC);
      // color: rgb(175, 236, 236);
      // color: rgb(81, 193, 252);
      position: relative;
      height: 150px;
      line-height: 150px;
      text-align:left;
      color:#000;
      font-size: 40px;
      border-radius: 10px;
      .name {
        padding-left: 40px;
        background-size: auto 100%;
        background-position: center right;
        background-repeat: no-repeat;
        background-attachment: fixed;
      }
    }
    .list {
      height: calc(100vh - 80px);
      overflow-y: auto;
      margin:0;
      padding:0;
    }
    .list::-webkit-scrollbar {
      width: 0;
    }
    ul {
      margin: -5px 0 0 0 ;
      padding: 0;
      .list_item {
        user-select: none;
        list-style: none;
        color: #000;
        width: 100%;
        background: #b0aeae;
        .instances_box {
          width: 100%;
          margin-top: 5px;
          .instances {
            height: 76px;
            padding: 5px;
            color: #FFF;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .instances_user {
              width: 20%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              .avatar {
                width: 100%;
                height: 40px;
                line-height: 40px;
                text-align: center;
                border-radius: 4px;
                color: black;
                font-size: 15px;
              }
            }
            .instances_info {
              width: calc(100% - 350px);
              line-height: 20px;
              font-size: 30px;
              .instances_users {
                float: left;
                width: 90%;
                height: 100%;
                font-size: 24px;
                div {
                  display: flex;
                  float: left;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  margin-right: 14px;
                }
                i {
                  font-size: 45px;
                  color: #8ae061;
                }
              }
              .instances_msg {
                float: left;
                width: 40%;
                height: 100px;
                line-height: 100px;
                overflow-y: auto;
                padding-right: 15px;
                font-size: 30px;
              }
            }
            .instances_button {
              width: 250px;
              height: 60px;
              line-height: 60px;
              text-align: center;
              .start {
                float: left;
                width: 180px;
                border-radius: 5px;
                background-color: #68ad45;
                cursor: pointer;
              }
              .remove {
                font-size: 30px;
                color: red;
                cursor: pointer;
              }
              .load {
                width: 150px;
                height: 60px;
                border-radius: 5px;
                background-color: #F56C6C;
                cursor: pointer;
                text-align: center;
                line-height: 60px;
                animation: fade 600ms infinite;
                -webkit-animation: fade 600ms infinite;
              }
              @keyframes fade {
                from {
                  opacity: 1.0;
                }
                50% {
                  opacity: 0.4;
                }
                to {
                  opacity: 1.0;
                }
              }
            }
          }
          .instances:hover {
            background: rgba(1, 167, 240, .25);
          }
          .item_box {
            display: none;
            width: 100%;
            overflow-y: auto;
            padding: 5px;
            color: #000;
            border-radius: 0 0 5px 5px;
            background-color: #FFF;
          }
        }

        .list_open {
          cursor: not-allowed;
        }
        p {
          margin: 0;
          span {
            cursor: pointer;
          }
        }
      }
    }
  }
  .systemctl_menu {
    width: 100px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .item {
      height: 100px;
      text-align: center;
      color: #FFF;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      user-select: none;
      cursor: pointer;
      i {
        font-size: 40px;
      }
      span{
        height: 20px;
        font-size: 20px;
      }
    }
    .item:hover {
      color: #265faa;
    }
    .systemctl_project {
      height: calc(100% - 400px);
      text-align: center;
      display: flex;
      flex-direction: column;
      .el-tag{
        margin: 5px auto;
        width: 80%;
      }
    }
  }
  .systemctl_right {
    width: calc(100% - 650px);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

</style>
