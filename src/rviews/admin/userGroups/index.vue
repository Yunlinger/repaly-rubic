<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" style="padding: 8px">
        <el-card>
          <div slot="header">
            <span>已经分配的团队</span>
          </div>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="groups"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            @sort-change="sortChange"
          >
            <el-table-column label="团队名" align="center">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
              <template slot-scope="{row,$index}">
                <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12" style="padding: 8px">
        <el-card :body-style="{height: '100%'}">
          <div slot="header">
            <span>所有团队</span>
            <div style="float: right; padding: 0">
              <el-input v-model="listQuery.name" size="mini" placeholder="团队名" style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter" />
              <el-button type="primary" size="mini" @click="handleFilter">查找</el-button>
            </div>
          </div>
          <el-table
            :key="tableKey"
            v-loading="groupListLoading"
            :data="groupList"
            border
            fit
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column label="团队名" align="center">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
              <template slot-scope="{row,$index}">
                <el-button size="mini" type="primary" @click="handleAdd(row,$index)">
                  分配
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="groupTotal>0" :total="groupTotal" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getGroupList" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { read, addusr, delusr, getGroupsOfUser } from '@/api/group'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'UserGroups',
  directives: { waves },
  components: { Pagination },
  data() {
    return {
      userid: 0,
      tableKey: 0,
      groups: [],
      groupList: [],
      groupTotal: 0,
      listLoading: true,
      groupListLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        name: ''
      }
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.userid = id || 0
    this.userid = parseInt(this.userid)
    this.getGroups()
    this.getGroupList()
  },
  methods: {
    getGroups() {
      this.listLoading = true
      getGroupsOfUser(this.userid).then(res => {
        res = res || {}
        res.items.sort((a, b) => {
          return a.id - b.id
        })
        this.groups = res.items
        this.listLoading = false
      }).catch(err => {
        this.listLoading = false
        console.error(err)
      })
    },
    getGroupList() {
      this.groupListLoading = true
      read(this.listQuery).then(res => {
        this.groupList = res.items || []
        this.groupTotal = res.total || 0
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.groupListLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getGroupList()
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
    handleAdd(group) {
      addusr(group.id, this.userid).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
        this.getGroups()
      }).catch(err => {
        this.$notify({
          title: 'Error',
          message: err,
          type: 'error',
          duration: 2000
        })
      })
    },
    handleDelete(group) {
      delusr(group.id, this.userid).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
        this.getGroups()
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
