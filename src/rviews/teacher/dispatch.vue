<template>
  <div class="page-container">
    <el-row>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>{{ $t('选项预览') }}</span>
          </div>
          <el-form label-width="100px">
            <el-form-item :label="$t('选中模型')" style="height: 24px; width: 240px;">
              <span>{{ option.project }}</span>
            </el-form-item>
            <el-form-item :label="$t('选中案例')" style="height: 24px; color: blue; width: 240px;">
              <el-tag
                v-if="option.case.id > 0"
                closable
                :disable-transitions="false"
                @close="option.case = { name: '', id: 0 }"
              >
                {{ option.case.name }}
              </el-tag>
            </el-form-item>
            <!-- <el-form-item :label="$t('选中工况')" style="height: 24px; color: green; width: 240px;">
              <el-tag
                v-if="option.condition.id > 0"
                closable
                type="success"
                :disable-transitions="false"
                @close="option.condition = { name: '', id: 0 }"
              >
                {{ option.condition.name }}
              </el-tag>
            </el-form-item>
            <el-form-item :label="$t('选中故障') " style="height: 24px; color: red; width: 240px;">
              <el-tag
                v-if="option.fault.id > 0"
                closable
                type="danger"
                :disable-transitions="false"
                @close="option.fault = { name: '', id: 0 }"
              >
                {{ option.fault.name }}
              </el-tag>
            </el-form-item> -->
            <el-form-item :label="$t('分组名称')" style="height: 24px; color: red; width: 100%;">
              <el-input v-model="option.groupName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('每人一组') " style="height: 24px; color: red; width: 100%;">
              <el-switch v-model="option.oneInstPerStu"></el-switch>
            </el-form-item>
            <el-form-item :label="$t('操作')" style="height: 24px; width: 100%;">
              <el-button
                type="success"
                size="small"
                :disabled="!option.project"
                @click="beginCase"
              >
                {{ $t('下发任务') }}
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="gotoStatus"
              >
                {{ $t('分组列表') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>{{ $t('分组成员') }}</span>
            <el-button
              style="float: right;"
              type="text"
              @click=" selectedUsers = [] "
            >{{ $t('清空') }}</el-button>
            <el-select v-model="selectedGroup" :placeholder="$t('选择团队')" style="float: right" @change="onGroupSelectChanged">
              <el-option
                v-for="item in groups"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
            <el-select
              v-if="false"
              v-model="selectedFilterUser"
              filterable
              remote
              reserve-keyword
              :placeholder="$t('选择用户')"
              style="float: right"
              :remote-method="filterUser"
              :loading="filterUserLoading"
              @change="onUserSelectChanged"
            >
              <el-option
                v-for="item in filterUsers"
                :key="item.name"
                :value="item"
                :label="item.name + ' (' + item.cname + ')'"
              >
              </el-option>
            </el-select>
            <el-button
              style="float: right;"
              @click=" dialogSelectuserVisible = true; getUserList(); "
            >{{ $t('选择用户') }}</el-button>
          </div>
          <el-table
            :data="selectedUsers"
            border
            fit
            height="260"
            style="width: 100%;"
            highlight-current-row
          >
            <el-table-column property="id" :label="$t('编号')" width="60">
            </el-table-column>
            <el-table-column :label="$t('用户')" align="center">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('名字')" align="center">
              <template slot-scope="{row}">
                <span>{{ row.cname }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" align="center" width="80">
              <template slot-scope="scope">
                <el-button type="warning" @click="removeFromSelectedUsers(scope.$index)">{{ $t('移除') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>{{ $t('选择模型') }}</span>
          </div>
          <el-table
            ref="projectTable"
            :data="projectTableData"
            highlight-current-row
            border
            height="260"
            style="width: 100%;"
            @current-change="selectProject"
          >
            <el-table-column
              property="id"
              :label="$t('编号')"
              width="60"
            >
            </el-table-column>
            <el-table-column
              property="name"
              :label="$t('模型名称')"
            >
            </el-table-column>
            <el-table-column
              property="desc"
              :label="$t('模型描述')"
            >
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>{{ $t('选择案例') }}</span>
            <el-button
              style="float: right; padding: 0"
              type="text"
              @click=" option.case = { name: '', id: 0 } "
            >{{ $t('清空选择') }}</el-button>
          </div>
          <el-tree
            class="filter-tree"
            :data="caseTableData"
            style="height: 260px; overflow: auto;"
            @node-click="caseTreeNodeClick"
          >
          </el-tree>
        </el-card>
      </el-col>
      <!-- <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>{{ $t('选择工况') }}</span>
            <el-button
              style="float: right; padding: 0"
              type="text"
              @click=" option.condition = { name: '', id: 0 } "
            >{{ $t('清空选择') }}</el-button>
          </div>
          <el-tree
            class="filter-tree"
            :data="conditionTableData"
            style="height: 260px; overflow: auto;"
            @node-click="conditionTreeNodeClick"
          >
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>{{ $t('设置故障') }}</span>
            <el-button
              style="float: right; padding: 0"
              type="text"
              @click=" option.fault = { name: '', id: 0 } "
            >{{ $t('清空选择') }}</el-button>
          </div>
          <el-tree
            class="filter-tree"
            :data="faultTableData"
            style="height: 260px; overflow: auto;"
            @node-click="faultTreeNodeClick"
          >
          </el-tree>
        </el-card>
      </el-col> -->
    </el-row>
    <el-dialog title="选择用户" :visible.sync="dialogSelectuserVisible" append-to-body>
      <div style="float: right; padding: 0">
        <el-input v-model="listQuery.name" size="mini" placeholder="用户名" style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-input v-model="listQuery.cname" size="mini" placeholder="姓名" style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button type="primary" size="mini" @click="handleFilter">查找</el-button>
      </div>
      <el-table
        key="tableKey"
        v-loading="userListLoading"
        :data="userList"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="用户名" align="center">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名字" align="center">
          <template slot-scope="{row}">
            <span>{{ row.cname }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-if="!userSelected(row)" size="mini" type="primary" @click="selectUser(row)">
              选择
            </el-button>
            <el-button v-else size="mini" type="warning" @click="removeSelectedUsers(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="userTotal>0" :total="userTotal" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getUserList" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Loading } from 'element-ui'
import { arrayToTree } from '@/utils'

import Pagination from '@/components/Pagination'

import * as papi from '@/api/project'
import * as api from '@/api/case'
// import * as fapi from '@/api/fault'
// import * as capi from '@/api/condition'
import * as gapi from '@/api/group'
import * as uapi from '@/api/user'

export default {
  name: 'TeacherDispatch',
  components: { Pagination },
  data() {
    return {
      option: {
        project: '',
        groupName: '',
        case: { id: 0, name: '' },
        condition: { id: 0, name: '' },
        fault: { id: 0, name: '' },
        oneInstPerStu: false
      },

      // 用户列表
      groups: [],
      selectedUsers: [],
      selectedGroup: '',
      filterUsers: [],
      selectedFilterUser: '',
      filterUserLoading: false,
      dialogSelectuserVisible: false,
      userList: [],
      userTotal: 0,
      listLoading: true,
      userListLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        name: '',
        cname: '',
        status: 0
      },

      // 原始返回数据
      caseData: {},
      conditionData: {},
      faultData: {},

      // 列表数据
      projectTableData: [],
      caseTableData: [],
      conditionTableData: [],
      faultTableData: []
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
  mounted() {
    this.fetchProjects()
    this.getAllGroup()
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
      console.log(this.groups)
    },
    getUserList() {
      this.userListLoading = true
      uapi.read(this.listQuery).then(res => {
        this.userList = res.items || []
        this.userTotal = res.total || 0
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.userListLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getUserList()
    },
    selectUser(user) {
      for (let u of this.selectedUsers) {
        if (u.name === user.name) {
          return
        }
      }
      this.selectedUsers.push(user)
    },
    userSelected(user) {
      for (let u of this.selectedUsers) {
        if (u.name === user.name) {
          return true
        }
      }
      return false
    },
    onGroupSelectChanged(id) {
      gapi.getUsersOfGroup(id).then(res => {
        for (let u of res.items || []) {
          this.selectUser(u)
        }
      }).catch(err => {
        console.error(err)
      })
    },
    onUserSelectChanged(user) {
      this.selectUser(user)
    },
    removeFromSelectedUsers(index) {
      this.selectedUsers.splice(index, 1)
    },
    removeSelectedUsers(user) {
      for (let i = 0; i < this.selectedUsers.length; i++) {
        let u = this.selectedUsers[i]
        if (u.name === user.name) {
          this.selectedUsers.splice(i, 1)
          return
        }
      }
    },
    gotoStatus() {
      this.$router.push('/teacher/status')
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
      console.log(selectedProject)
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
      console.log(this.option)
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

    async startTask(groupName, participants) {
      this.loading.text = this.$t('正在启动实例') + `${groupName} ...`
      return papi.getServerList('Model').then((res) => {
        // 查看当前是否有配套实例打开
        for (let k in res.items) {
          if (res.items[k].project === this.option.project &&
          res.items[k].owner === this.name &&
          res.items[k].name === groupName &&
          (res.items[k].caseStatus || 0) === 0) {
            return Promise.resolve(res.items[k])
          }
        }
        // 没有找到对应实例, 自动启动实例
        this.loading.text = this.$t('没有找到可用实例, 正在创建实例') + `${groupName} ...`
        return papi.startInstance(this.option.project, 'model', groupName)
      }).then((res) => {
        // 下发任务
        if (this.option.case.id > 0) {
          let params = {
            'rubik.project': this.option.project,
            'rubik.model': 'model',
            'rubik.id': res.id
          }
          this.loading.text = this.$t('正在下发任务') + `: ${this.option.case.name}...`
          return api.dispatch(this.option.case.id, participants, params)
        }
        return Promise.resolve()
      })
      // .then(() => {
      //   // 工况
      //   if (this.option.condition.id > 0) {
      //     this.loading.text = this.$t('正在加载工况') + `: ${this.option.condition.name}...`
      //     return capi.loadCond(this.option.condition.id)
      //   }
      //   return Promise.resolve()
      // }).then(() => {
      //   // 故障
      //   if (this.option.fault.id > 0) {
      //     this.loading.text = this.$t('正在加载故障') + `: ${this.option.fault.name}...`
      //     return fapi.start(this.option.fault.id)
      //   }
      //   return Promise.resolve()
      // })
    },

    // 下发任务
    async beginCase() {
      this.$confirm(this.$t('确定要下发任务吗?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        if ((this.selectedUsers || []).length === 0) {
          return Promise.reject(this.$t('请选择下发学员!'))
        }
        return Promise.resolve()
      }).then(async() => {
        this.loading = Loading.service({
          lock: true,
          text: this.$t('开始下发任务...'),
          background: 'rgba(0, 0, 0, 0.8)'
        })
        let participants = this.selectedUsers.map(item => item.name)
        let groupName = this.option.groupName || this.cname + this.$t('下发的任务')
        if (this.option.oneInstPerStu) {
          let all = []
          for (let stuName of participants) {
            all.push(this.startTask(stuName, [stuName]))
            if (all.length >= 6) {
              await Promise.all(all)
              all = []
            }
          }
          if (all.length > 0) {
            await Promise.all(all)
          }
        } else {
          await this.startTask(groupName, participants)
        }
      }).then(() => {
        this.$confirm(this.$t(`下发任务成功`), this.$t('加载任务'), {
          showCancelButton: false,
          showClose: false,
          type: 'success'
        }).catch(() => {})
      }).catch((err) => {
        if (`${err}` !== 'cancel') {
          this.$confirm(this.$t('加载任务失败') + `, ${err}`, this.$t('加载任务'), {
            showCancelButton: false,
            showClose: false,
            type: 'error'
          }).catch(() => {})
        }
      }).finally(() => {
        if (this.loading) {
          this.loading.close()
        }
      })
    },

    filterUser(keyword) {
      let filter = {
        name: keyword,
        page: 1
      }
      this.filterUserLoading = true
      uapi.read(filter).then(res => {
        console.log(res.items)
        this.filterUsers = res.items || []
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.filterUserLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-container {
    min-height: calc(100vh - 82px);
    padding: 20px;
  }

  .el-col {
    padding: 10px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .card {
    height: 360px;
  }

</style>
