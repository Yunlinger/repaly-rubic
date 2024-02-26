<template>
  <div class="page-container">
    <div class="model">
      模型选择:
      <el-select v-model="value" placeholder="请选择" @change="change()">
        <el-option
          v-for="item in projectTableData"
          :key="item.id"
          :label="item.name"
          :value="item.name"
        >
        </el-option>
      </el-select>
    </div>
    <div class="view">
      <div v-for="(item, index) in list" :key="item.key" class="list_items" :class="{'person': (item.name === cname && item.model)}">
        <div style="padding-left: 10px;">{{ item.name }}</div>
        <div>案例倒计时：{{ formatModelTimeString(item.remainTime * 1000) }}</div>
        <div v-if="item.id && item.model && item.name !== '正在启动...'" style="margin-right: 20px; cursor: pointer;" @click="openProject(item)">
          <el-button type="primary">进入分组</el-button>
        </div>
        <div v-else style="margin-right: 20px; cursor: pointer;" @click="createIns(item,index)">
          <el-button type="success" :loading="item.loading">启动分组</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Loading } from 'element-ui'
import { arrayToTree, formatModelTimeString } from '@/utils'
import * as papi from '@/api/project'
import * as api from '@/api/case'
// import * as fapi from '@/api/fault'
// import * as capi from '@/api/condition'
import * as gapi from '@/api/group'
import * as mapi from '@/api/model'
import * as rapi from '@/api/res'

export default {
  name: 'StudentStudy',
  data() {
    return {
      groups: [],
      option: {
        project: '',
        case: { id: 0, name: '' },
        condition: { id: 0, name: '' },
        fault: { id: 0, name: '' }
      },
      // 原始返回数据
      caseData: {},
      conditionData: {},
      faultData: {},

      // 列表数据
      projectTableData: [],
      caseTableData: [],
      conditionTableData: [],
      faultTableData: [],
      value: '',
      list: []
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'project',
      'cname'
    ])
  },
  mounted() {
    this.fetchProjects()
    this.$on('global:store.updateInst', (inst) => {
      if (this.value === inst.project) {
        let idx = this.list.findIndex(item => item.id === inst.id && inst.id !== 'dev')
        if (idx === -1) {
          if (inst.id !== 'dev' && inst.id !== this.name) {
            this.list.push(inst)
          }
        } else {
          this.list.map((item, index) => {
            if (inst.id !== 'dev') {
              if (item.id === inst.id) {
                this.$set(this.list, index, inst)
              }
            }
          })
        }
      }
    })
    this.$on('global:store.deleteInst', (key) => {
      this.list.map((item, index) => {
        if (item.key === key && item.id !== this.name) {
          this.list.splice(index, 1)
        } else if (item.key === key && item.id === this.name) {
          let obj = { id: this.name, name: this.cname, key: 'key' }
          this.$set(this.list, index, obj)
        }
      })
    })
  },
  methods: {
    formatModelTimeString(time) {
      return formatModelTimeString(time)
    },
    gotoStudy() {
      this.$router.push('/student/study')
    },
    gotoCase() {
      this.$router.push('/student/case')
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
    openProject(item) {
      return this.$store.dispatch('openProject', {
        project: this.value,
        model: 'model',
        id: item.id
      }).then(() => {
        // this.$router.push({ path: '/newproject' })
        this.gotoDCS()
        return Promise.resolve()
      }).catch(() => {
      })
    },
    gotoProfile() {
      this.$router.push('/profile')
    },
    fetchIns() {
      papi.getServerList('Model').then(res => {
        let cache = []
        this.list = []
        for (let k in res.items) {
          if (res.items[k].project === this.value) {
            if (res.items[k].id !== 'dev') {
              cache.push(res.items[k])
            }
          }
        }
        let idx = cache.findIndex(item => item.id === this.name)
        if (idx === -1) {
          let obj = { id: this.name, name: this.cname, key: 'key' }
          cache.unshift(obj)
        }
        this.list = cache.sort(this.sortUser)
      })
    },
    sortUser(a, b) {
      if (a.id === this.name) {
        return -9999
      } else {
        return a.id - b.id
      }
    },
    createIns(item, index) {
      if (item.loading) return
      let id = this.name
      let value = this.cname
      let obj = item
      obj.loading = true
      this.$set(this.list, index, obj)
      papi.startInstance(this.value, 'model', value, id).then(res => {
        obj = res
        obj.loading = false
        this.$set(this.list, index, obj)
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
    async fetchProjects() {
      // this.projects = null
      // let res = await papi.list()
      // this.projects = res.items

      // 构造table数据
      this.projectTableData = []
      let index = 1
      // await Object.keys(this.projects).forEach(key => {
      //   let project = this.projects[key]
      //   let oneProject = {
      //     'id': index++,
      //     'name': project.name,
      //     'desc': project.desc || project.name
      //   }
      //   this.projectTableData.push(oneProject)
      // })
      let uid = this.$store.getters.user.id
      if (!uid) {
        return
      }
      let list = []
      gapi.getGroupsOfUser(uid).then(res => {
        this.groups = res.items || []
        this.groups.sort((a, b) => {
          return a.id - b.id
        })
        let gets = this.groups.map(g => {
          return papi.getProjectsOfGroup(g.id).then((pros) => {
            let projects = []
            for (let name in pros.items) {
              projects.push(pros.items[name])
            }
            list.push(...projects)
          })
        })
        return Promise.all(gets)
      }).then(() => {
        Object.keys(list).forEach(key => {
          let project = list[key]
          let oneProject = {
            'id': index++,
            'name': project.name,
            'desc': project.desc || project.name
          }
          this.projectTableData.push(oneProject)
        })
        this.value = this.projectTableData[0].name
        this.fetchIns()
      })
    },
    async fetchCases() {
      this.caseTableData = []

      if (this.option.project) {
        let res = await papi.getCase(this.option.project)
        if (!res) return
        this.caseData = res
        let rows = []
        Object.keys(res.tree).forEach(key => {
          let t = res.tree[key]
          rows.push({
            id: parseInt(key) + 65535,
            name: t.name,
            label: t.name,
            children: [],
            parent: t.parent ? (parseInt(t.parent) + 65535) : 0
          })
        })

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
    async fetchConditions() {
      this.conditionTableData = []
      if (this.option.project) {
        let res = await papi.getCondition(this.option.project)
        if (!res) return
        this.conditionData = res
        let rows = []

        if (res.list.items) {
          // 构造table数据
          Object.keys(res.list.items).forEach(key => {
            let item = res.list.items[key]
            rows.push({
              id: key - 0,
              name: item.name,
              label: item.name,
              data: item
            })
          })
        }
        rows = arrayToTree(rows)
        this.conditionTableData = rows
      }
    },
    async fetchFaults() {
      this.faultTableData = []
      if (this.option.project) {
        let res = await papi.getFault(this.option.project)
        if (!res) return
        this.faultData = res
        let rows = []
        Object.keys(res.tree).forEach(key => {
          let t = res.tree[key]
          rows.push({
            id: parseInt(key) + 65535,
            name: t.name,
            label: t.name,
            children: [],
            parent: t.parent ? (parseInt(t.parent) + 65535) : 0
          })
        })

        if (res.list.items) {
          // 构造table数据
          Object.keys(res.list.items).forEach(key => {
            let item = res.list.items[key]
            rows.push({
              id: parseInt(item.id),
              name: item.name,
              label: item.name,
              data: item,
              parent: parseInt(item.sort || 0) + 65535
            })
          })
        }
        rows = arrayToTree(rows)
        this.faultTableData = rows
      }
    },

    selectProject(selectedProject) {
      if (selectedProject !== this.option.project) {
        this.option.project = selectedProject.name
        this.option.case = { name: '', id: 0 }
        this.option.condition = { name: '', id: 0 }
        this.option.fault = { name: '', id: 0 }
        // 同步打开案例, 工况, 故障
        this.fetchCases()
        this.fetchConditions()
        this.fetchFaults()
      }
    },

    caseTreeNodeClick(nodeData) {
      if (nodeData.id < 65535) {
        this.option.case.id = nodeData.id
        this.option.case.name = nodeData.name
        if (nodeData.data.conID) {
          this.option.condition.id = nodeData.data.conID
          this.option.condition.name = this.conditionData.list.items[nodeData.data.conID].name
        } else {
          this.option.condition.id = 0
          this.option.condition.name = ''
        }
        if (nodeData.data.faultID) {
          this.option.fault.id = nodeData.data.faultID
          this.option.fault.name = this.faultData.list.items[nodeData.data.faultID].name
        } else {
          this.option.fault.id = 0
          this.option.fault.name = ''
        }
      }
    },

    conditionTreeNodeClick(nodeData) {
      if (nodeData.id < 65535) {
        this.option.condition.id = nodeData.id
        this.option.condition.name = nodeData.name
      }
    },

    faultTreeNodeClick(nodeData) {
      if (nodeData.id < 65535) {
        this.option.fault.id = nodeData.id
        this.option.fault.name = nodeData.name
      }
    },

    beginCase() { // 下发任务
      this.$confirm(this.$t('确定开始自定义任务吗?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        this.loading = Loading.service({
          lock: true,
          text: this.$t('正在查找可用实例...'),
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return papi.getServerList('Model')
      }).then((res) => {
        // 查看当前是否有配套实例打开
        for (let k in res.items) {
          if (res.items[k].project === this.option.project && res.items[k].id === this.name) {
            return Promise.resolve(res.items[k])
          }
        }
        // 没有找到对应实例, 自动启动实例
        this.loading.text = this.$t('没有找到可用实例, 正在启动实例...')
        return papi.startInstance(this.option.project, 'model', this.name + ' 在此学习', this.name)
      }).then((res) => {
        this.loading.text = this.$t('连接到可用实例...')
        return this.$store.dispatch('openProject', res)
      }).then(() => {
        // 下发任务
        if (this.option.case.id > 0) {
          this.loading.text = `${this.$t('正在下发任务')}: ${this.option.case.name}...`
          return api.dispatch(this.option.case.id)
        }
        return Promise.resolve()
      }).then(() => {
        // 开始任务
        if (this.option.case.id > 0) {
          this.loading.text = `${this.$t('开始任务')}: ${this.option.case.name}...`
          return api.start(this.option.case.id)
        }
        return Promise.resolve()
      }).then(() => {
        // 运行实例
        return mapi.modelStart(true)
      }).then(() => {
        this.$confirm(this.$t('加载任务成功, 请认真操作'), this.$t('加载任务'), {
          showCancelButton: false,
          showClose: false,
          type: 'success'
        }).catch(() => {})
      }).catch((err) => {
        this.$confirm(`${this.$t('加载任务失败')}, ${err}`, this.$t('加载任务'), {
          showCancelButton: false,
          showClose: false,
          type: 'error'
        }).catch(() => {})
      }).finally(() => {
        if (this.loading) {
          this.loading.close()
        }
      })
    },

    endCase() {
      if (this.option.case.id > 0) {
        this.$confirm(this.$t('确定提交吗?'), this.$t('提示'), {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }).then(() => {
          this.loading = Loading.service({
            lock: true,
            text: this.$t('正在提交...'),
            background: 'rgba(0, 0, 0, 0.8)'
          })
          return api.commit(this.option.case.id)
        }).then(res => {
          this.$confirm(this.$t('提交任务成功'), this.$t('提交任务'), {
            showCancelButton: false,
            showClose: false,
            type: 'success'
          }).catch(() => {})
        }).catch((err) => {
          this.$msg.error(`${this.$t('提交任务失败')}, ${err}`)
        }).finally(() => {
          if (this.loading) {
            this.loading.close()
          }
        })
      }
    },

    change() {
      this.fetchIns()
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-container {
    min-height: calc(100vh - 70px);
    padding: 20px;
  }
  .model {
    height: 50px;
    display: flex;
    align-items: center;
    background: #606266;
    color: #FFF;
    padding-left: 20px;
    border-radius: 5px;
    .el-select {
      padding-left: 20px;
    }
  }
  .view {
    width: 100%;
    height: calc(100vh - 160px);
    overflow-y: auto;
    .list_items {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
      padding-left: 10px;
      border: 1px solid #000;
      border-radius: 5px;
      user-select: none;
    }
  }
  .person {
    background: #67C23A;
    color: #FFF;
  }
  ::v-deep .el-select .el-input {
    width: 220px;
  }
</style>
