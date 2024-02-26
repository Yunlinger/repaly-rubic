<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" style="padding: 8px">
        <el-card>
          <div slot="header">
            <span>本团队成员</span>
          </div>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="filterList"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            @sort-change="sortChange"
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
              <template slot-scope="{row,$index}">
                <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="projectUsers > 0" :total="projectUsers" :page.sync="currentPage" :limit.sync="currentSize" :pageSizes="[10, 20]" @pagination="updatePagedTableData" />
        </el-card>
      </el-col>
      <el-col :span="12" style="padding: 8px">
        <el-card :body-style="{height: '100%'}">
          <div slot="header">
            <span>所有用户</span>
            <div style="float: right; padding: 0">
              <el-input v-model="listQuery.name" size="mini" placeholder="用户名" style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter" />
              <el-input v-model="listQuery.cname" size="mini" placeholder="姓名" style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter" />
              <el-button type="primary" size="mini" @click="handleFilter">查找</el-button>
            </div>
          </div>
          <el-table
            :key="tableKey"
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
              <template slot-scope="{row,$index}">
                <el-button size="mini" type="primary" @click="handleAdd(row,$index)">
                  添加到团队
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="userTotal>0" :total="userTotal" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getUserList" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { read, addusr, delusr, getUsersOfGroup } from '@/api/group'
import * as uapi from '@/api/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'GroupUsers',
  directives: { waves },
  components: { Pagination },
  data() {
    return {
      groupid: 0,
      tableKey: 0,
      list: [],
      filterList: [],
      currentPage: 0,
      currentSize: 10,
      projectUsers: 0,
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
      }
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.groupid = id || 0
    this.groupid = parseInt(this.groupid)
    this.getList()
    this.getUserList()
    read({ id: this.groupid }).then(res => {
      if (res && res.items && res.items.length > 0) {
        let route = Object.assign({}, this.$route, { title: `团队成员管理 - ${res.items[0].name}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
    })
  },
  methods: {
    getList() {
      this.listLoading = true
      getUsersOfGroup(this.groupid).then(res => {
        this.list = res.items || []
        this.projectUsers = res.total
        this.updatePagedTableData()
        this.listLoading = false
      }).catch(err => {
        this.listLoading = false
        console.error(err)
      })
    },
    updatePagedTableData() {
      const startIndex = (this.currentPage - 1) * this.currentSize
      this.filterList = this.list.slice(startIndex, startIndex + this.currentSize)
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
    handleModifyStatus(row, status) {
      this.$notify({
        title: 'Success',
        message: '操作 Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'id ASC'
      } else {
        this.listQuery.sort = 'id DESC'
      }
      this.handleFilter()
    },
    handleAdd(user) {
      addusr(this.groupid, user.id).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(err => {
        this.$notify({
          title: 'Error',
          message: err,
          type: 'error',
          duration: 2000
        })
      })
    },
    handleDelete(user) {
      delusr(this.groupid, user.id).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(err => {
        this.$notify({
          title: 'Error',
          message: err,
          type: 'error',
          duration: 2000
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
</style>
