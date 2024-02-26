<template>
  <div v-loading="listLoading" class="page-container">
    <div class="condition">
      <div class="menu_l">
        <div style="padding-left:20px;"><el-checkbox v-model="allChecked" @change="selectList">全选</el-checkbox></div>
        <div>
          团队
          <el-select v-model="selectedGroup" placeholder="请选择学员" @change="onGroupSelectChanged">
            <el-option
              v-for="item in groups"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div><i class="el-icon-right" /></div>
        <div>
          模型
          <el-select v-model="model" filterable :disabled="selectedGroup === ''" placeholder="请选择模型" @change="selectProject(model)">
            <el-option
              v-for="item in projectTableData"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            >
            </el-option>
          </el-select>
        </div>
        <div><i class="el-icon-right" /></div>
        <div style="padding-right:10px;"><el-button type="primary" @click="create()">建立</el-button></div>
      </div>
      <div class="menu_r" style="justify-content: flex-start;">
        <div style="margin-left: 20px;"><el-checkbox v-model="allInsChecked" @change="selectLists">全选</el-checkbox></div>
        <div>
          <el-select v-model="caseID" :disabled="model === ''" filterable placeholder="请选择案例">
            <el-option
              v-for="item in caseTableData"
              :key="item.id"
              :label="item.id + ': ' + item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <div><el-button type="primary" @click="startTasks">下发案例</el-button></div>
        <div><el-button type="danger" @click="delAll">关闭所选</el-button></div>
      </div>
    </div>
    <div class="view">
      <div style="float: right;width: calc(100% - 550px);height: calc(100vh - 163px);overflow-y: auto;border-left: 1px solid #C0C4CC;">
        <div v-for="item in selectedUsers" :key="item.id">
          <div v-if="item.hasModel && !item.loading" :style="{background: item.hasModel ? 'rgba(64,158,255, 0.45)' : ''}" class="list_item">
            <div style="width: 50px;padding-left:20px;"><el-checkbox v-model="item.checked"></el-checkbox></div>
            <div style="width: 100px;text-align: center;cursor: pointer;" @click="item.checked = !item.checked">{{ item.cname }}</div>
            <div style="width: 150px;flex-shrink: 0;">
              <p>模型时间: {{ formatModelTimeString(item.time) }}</p>
              <p>案例时间: {{ formatModelTimeString(item.remainTime * 1000) }}</p>
            </div>
            <div style="width: 500px;overflow:hidden; white-space: nowrap;text-overflow: ellipsis;">
              <p>模型名称:<span style="color: #E6A23C;">{{ item.project }}</span></p>
              <p>案例名称:<span style="color: #E6A23C;">{{ item.caseID +': ' + item.caseName }}</span></p>
            </div>
            <div class="text" @click="openProject(item)">
              <p v-if="item.hasModel && !item.loading" style="color: #000;cursor: pointer;"><i class="el-icon-edit-outline" />进入</p>
              <p v-if="item.score !== undefined">得分：{{ item.score }}</p>
            </div>
            <div style="cursor: pointer;padding-right:20px;" @click="remove(item)">
              <i class="el-icon-delete"></i>
            </div>
          </div>
        </div>
      </div>
      <div style="float: left;width: 550px;height: calc(100vh - 163px);overflow-y: auto;">
        <div v-for="item in selectedUsers" :key="item.id">
          <div v-if="!item.hasModel" :class="{ loadingBth: item.loading }" class="list_item_f">
            <div style="width: 50px;padding-left:20px;"><el-checkbox v-model="item.checked"></el-checkbox></div>
            <div style="width: 150px;cursor: pointer;" @click="item.checked = !item.checked">用户名：{{ item.name }}</div>
            <div style="width: 150px;cursor: pointer;" @click="item.checked = !item.checked">姓名：{{ item.cname }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { arrayToTree, formatModelTimeString } from '@/utils'

// import Pagination from '@/components/Pagination'

import * as papi from '@/api/project'
import * as api from '@/api/case'
import * as mapi from '@/api/model'
// import * as fapi from '@/api/fault'
// import * as capi from '@/api/condition'
import * as rapi from '@/api/res'
import * as gapi from '@/api/group'
// import * as uapi from '@/api/user'

export default {
  name: 'TeacherDispatchs',
  // components: { Pagination },
  data() {
    return {
      model: '',
      allChecked: false,
      allInsChecked: false,
      caseID: '',
      // 用户列表
      groups: [],
      userList: [],
      selectedUsers: [],
      selectedGroup: '',
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        name: '',
        cname: '',
        status: 0
      },

      // 原始返回数据
      caseData: {},
      // 列表数据
      projectTableData: [],
      caseTableData: []
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'cname',
      'avatar',
      'roles',
      'project'
    ])
  },
  beforeDestroy() {
    let path = this.$route.path
    if (!(path === '/framefull/foxboro' || path === '/framefull/default')) {
      this.$store.commit('SET_SELECTEDGROUP', { group: 0 })
      this.$store.commit('SET_SELECTEDMODEL', { model: 0 })
    }
  },
  mounted() {
    this.getAllGroup()
    // this.fetchProjects()
    this.$on('global:case.finish', (msg) => {
      this.selectedUsers.map((item, index) => {
        if (item.project === msg.p && item.pid === msg.i) {
          let obj = item
          obj.score = msg.data.score
          this.$set(this.selectedUsers, index, obj)
        }
      })
    })
    this.$on('global:store.deleteInst', (key) => {
      this.selectedUsers.map((item, index) => {
        if (item.key === key) {
          let obj = item
          obj.hasModel = false
          delete obj.key
          delete obj.pname
          delete obj.project
          delete obj.pid
          delete obj.caseName
          this.$set(this.selectedUsers, index, obj)
        }
      })
    })
    this.$on('global:store.updateInst', (inst) => {
      setTimeout(() => {
        let project = this.model
        if (this.listLoading) return
        if (project !== inst.project) return
        let idx = this.selectedUsers.findIndex(ite => ite.name === inst.id)
        if (idx === -1) return
        if (!this.selectedUsers[idx].loading) {
          if (!inst.running && inst.name === '正在启动...') {
            let obj = this.selectedUsers[idx]
            obj.key = inst.key
            obj.loading = true
            obj.pid = inst.id
            this.$set(this.selectedUsers, idx, obj)
            return
          }
        }
        this.selectedUsers.map((item, index) => {
          if (item.key === inst.key) {
            let obj = item
            if (inst.name === '正在启动...') {
              obj.loading = true
              obj.hasModel = false
            } else {
              obj.loading = false
              obj.hasModel = true
            }
            obj.project = inst.project
            obj.pname = inst.name || ''
            obj.remainTime = inst.remainTime || 0
            obj.time = inst.time || 0
            obj.caseName = inst.caseName || ''
            obj.caseID = inst.case || 0
            this.$set(this.selectedUsers, index, obj)
          }
        })
      }, 100)
    })
  },
  methods: {
    async getAllGroup() {
      let listQuery = {
        page: 1,
        pageSize: 2048,
        status: 0
      }
      let res = await gapi.read(listQuery)
      res.items = res.items || []
      this.groups = res.items
      this.selectedGroup = this.project.selectedGroup || this.groups[0].id
      this.onGroupSelectChanged(this.selectedGroup)
    },
    sortUser(a, b) {
      return a - b
    },
    // 切换团队
    onGroupSelectChanged(id) {
      this.listLoading = true
      let list = []
      this.$store.commit('SET_SELECTEDGROUP', { group: id })
      gapi.getUsersOfGroup(id).then(res => {
        for (let u of res.items || []) {
          u.checked = false
          u.hasModel = false
          u.loading = false
          u.remainTime = 0
          u.time = 0
          list.push(u)
        }
        list = list.sort(this.sortUser)
        this.userList = list
        this.getList(id)
      }).catch(err => {
        console.error(err)
      })
    },
    getList(id) {
      this.projectTableData = []
      papi.getProjectsOfGroup(id).then(res => {
        Object.keys(res.items).forEach(key => {
          let project = res.items[key]
          let oneProject = {
            'name': project.name,
            'desc': project.desc || project.name
          }
          this.projectTableData.push(oneProject)
        })
        this.model = this.project.selectedModel || this.projectTableData[0].name
        this.upServerList(this.userList, this.model)
      })
    },
    // 更新列表
    upServerList(list, project) {
      papi.getServerList('Model').then(resp => {
        let cache = []
        for (let k in resp.items) {
          if (resp.items[k].project === project && resp.items[k].id !== 'dev') {
            cache.push(resp.items[k])
          }
        }
        list.map(item => {
          item.hasModel = false
          item.checked = false
          item.remainTime = 0
          item.key = ''
          item.pid = ''
          item.time = 0
          item.pname = ''
          item.project = ''
          item.loading = false
          for (let p of cache) {
            if (p.id === item.name) {
              item.hasModel = !(p.name === '正在启动...')
              item.key = p.key
              item.pid = p.id
              item.pname = p.name
              item.project = p.project
              item.loading = p.name === '正在启动...'
              item.caseName = p.caseName || ''
            }
          }
        })
        this.selectedUsers = list
        this.listLoading = false
      })
      this.fetchCases()
    },
    openProject(item) {
      return this.$store.dispatch('openProject', {
        project: item.project,
        model: 'model',
        id: item.pid
      }).then(() => {
        // this.$router.push({ path: '/newproject' })
        this.gotoDCS()
        return Promise.resolve()
      }).catch(() => {
        this.$message({
          message: '当前模型没有权限',
          type: 'warning'
        })
      })
    },
    gotoDCS() {
      rapi.open('../model/setting.json').then(config => {
        switch (config.frame) {
          case 'foxboro':
            this.$router.push({ path: '/framefull/foxboro' })
            break
          case 'default':
          case '':
          default : this.$router.push({ path: '/framefull/default' })
        }
      }).catch(() => {
        this.$router.push({ path: '/framefull/default' })
      })
    },
    delAll() {
      let idx = this.selectedUsers.findIndex(item => item.hasModel && item.checked)
      if (idx === -1) return
      this.$confirm(`确认关闭选择的分组`, '提示', {
        confirmButtonText: '关闭',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let list = this.selectedUsers.map(item => {
          if (item.hasModel && item.checked) {
            item.checked = false
            return papi.stopInstance(this.model, 'model', item.pid)
          }
        })
        Promise.all(list)
      })
    },
    remove(item) {
      if (item.hasModel) {
        this.$confirm(`确认关闭分组`, '提示', {
          confirmButtonText: '关闭',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return papi.stopInstance(this.model, 'model', item.pid)
        })
      }
    },
    async fetchProjects() {
      this.projects = null
      let res = await papi.list()
      this.projects = res.items

      // 构造table数据
      this.projectTableData = []
      let index = 1
      Object.keys(this.projects).forEach(key => {
        let project = this.projects[key]
        let oneProject = {
          'id': index++,
          'name': project.name,
          'desc': project.desc || project.name
        }
        this.projectTableData.push(oneProject)
      })
    },
    async fetchCases() {
      this.caseTableData = []

      if (this.model) {
        let res = await papi.getCase(this.model)
        if (!res) return
        this.caseData = res
        let rows = []
        // Object.keys(res.tree).forEach(key => {
        //   let t = res.tree[key]
        //   rows.push({
        //     id: parseInt(key) + 65535,
        //     name: t.name,
        //     label: t.name,
        //     children: [],
        //     parent: t.parent ? (parseInt(t.parent) + 65535) : 0
        //   })
        // })

        if (res.list.items) {
          // 构造table数据
          Object.keys(res.list.items).forEach(key => {
            let item = res.list.items[key]
            rows.push({
              id: key - 0,
              name: item.name,
              label: item.name,
              data: item,
              parent: parseInt(item.sort || 0) + 65535
            })
          })
        }
        rows = arrayToTree(rows)
        this.caseTableData = rows
      }
    },
    // 建立分组
    create() {
      if (this.model && this.selectedGroup) {
        this.selectedUsers.map((item, index) => {
          if (item.checked && !item.hasModel) {
            this.$message({
              message: '建组已开始',
              type: 'success'
            })
            this.startIns(item)
          }
        })
      } else {
        this.$message({
          message: '请选择模型和学员',
          type: 'warning'
        })
      }
    },
    // 创建实例
    startIns(item) {
      item.pid = item.name
      let project = this.model
      papi.startInstance(project, 'model', item.cname, item.name).catch(() => {
        item.pid = ''
        this.$message({
          message: '创建失败',
          type: 'warning'
        })
      })
    },
    // 下发任务并开始实例
    async startTasks() {
      if (this.caseID) {
        let idx = this.selectedUsers.findIndex(item => item.checked)
        if (idx === -1) {
          this.$message({
            message: '请选择实例',
            type: 'error'
          })
          return
        }
        let gets = this.selectedUsers.map(item => {
          if (item.checked) {
            let params = {
              'rubik.project': this.model,
              'rubik.model': 'model',
              'rubik.id': item.name
            }
            let participants = [item.name]
            return api.dispatch(this.caseID, participants, params)
          }
        })
        await Promise.all(gets).catch(() => {
          this.$message({
            message: '下发任务失败',
            type: 'error'
          })
        })
        this.selects()
      }
    },
    // 开启实例
    async selects() {
      let insts = []
      for (let i of this.selectedUsers) {
        if (i.checked) {
          insts.push(this.beginCases(i))
        }
      }
      if (insts.length > 0) {
        try {
          await Promise.all(insts)
          this.$message({
            message: '下发任务成功',
            type: 'success'
          })
          // this.onGroupSelectChanged(this.selectedGroup)
          insts = []
        } catch (error) {
          this.$msg.error(`${this.$t('下发任务错误')}, ${error}`)
        }
      }
    },
    async beginCases(m) {
      let params = {
        'rubik.project': m.project,
        'rubik.model': m.model || 'model',
        'rubik.id': m.pid
      }
      await api.start(this.caseID, params)
      await mapi.modelStart(true, params)
    },
    // 更新列表时间
    buildInstList() {
      let ret = []
      Object.keys(this.project.instances).forEach(key => {
        let inst = this.project.instances[key]
        if (inst.project === this.model && // 当前登录教员下发任务的实例
          inst.id !== 'dev' // 显示非开发实例
        ) {
          ret.push(inst)
        }
      })
      this.selectedUsers.map(item => {
        for (let i of ret) {
          if (item.pname === i.name) {
            item.remainTime = i.remainTime
            item.time = i.time
          }
        }
      })
    },
    formatModelTimeString(ms) {
      return formatModelTimeString(ms)
    },
    selectList(type) {
      if (type) {
        this.selectedUsers.map(item => {
          if (!item.hasModel) {
            item.checked = type
          }
        })
      } else {
        this.selectedUsers.map(item => { item.checked = false })
      }
    },
    selectLists(type) {
      if (type) {
        this.selectedUsers.map(item => {
          if (item.hasModel) {
            item.checked = type
          }
        })
      } else {
        this.selectedUsers.map(item => {
          if (item.hasModel) {
            item.checked = false
          }
        })
      }
    },
    selectProject(selectedProject) {
      this.$store.commit('SET_SELECTEDGROUP', { model: selectedProject })
      this.caseID = ''
      this.caseTableData = []
      this.upServerList(this.userList, selectedProject)
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-container {
    min-height: calc(100vh - 82px);
    padding: 20px;
    overflow: hidden;
    user-select: none;
    .condition {
      min-width: 1125px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 50px;
      background: #DCDFE6;
      .menu_l {
        width: 550px;
      }
      .menu_r {
        width: calc(100% - 550px);
        border-left: 1px solid #C0C4CC;
        ::v-deep .el-select .el-input {
          width: 300px;
        }
        div {
          margin-left: 10px;
        }
      }
      .menu_l, .menu_r {
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .view{
      min-width: 1125px;
      .list_item_f {
        p {
          width: 120px;
          height: 30px;
          line-height: 30px;
        }
      }
      .list_item {
        float: right;
        width: 100%;
        p{
          margin: 0;
          line-height: 35px;
        }
        .text p {
          width: 120px;
          height: 30px;
          line-height: 30px;
        }
      }
      .list_item, .list_item_f {
        height: 70px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #C0C4CC;
      }
    }
  }
  .loadingBth {
    color: #FFF;
    border-radius: 5px;
    background-color: #F56C6C;
    cursor: pointer;
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

  @-webkit-keyframes fade {
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

</style>
