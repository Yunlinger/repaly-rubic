<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="$t('分组名')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" :placeholder="$t('状态')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.label+'('+item.key+')'" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('新建') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('名称')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('状态')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'primary':'danger'">{{ $t(['', '正常', '禁用'][row.status]) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('权限')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag>{{ row.public ? $t('公开') : $t('私有') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('备注')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.introduction }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="manageProjects(row)">
            {{ $t('工程') }}
          </el-button>
          <el-button type="primary" size="mini" @click="manageUsers(row)">
            {{ $t('成员') }}
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('修改') }}
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('删除') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" append-to-body>
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 80%; margin-left:50px;">
        <el-form-item :label="$t('团队名')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('状态')" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('权限')" prop="status">
          <el-switch v-model="temp.public" :active-text="$t('公开')" :inactive-text="$t('私有')"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('备注')" prop="introduction">
          <el-input v-model="temp.introduction" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('取消') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('确定') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { create, read, update, del } from '@/api/group'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'GroupManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        name: '',
        status: 0
      },
      importanceOptions: [1, 2, 3],
      statusTypeOptions: [
        { label: this.$t('无'), key: 0 },
        { label: this.$t('正常'), key: 1 },
        { label: this.$t('禁用'), key: 2 }
      ],
      showReviewer: false,
      temp: {
        id: 0,
        name: '',
        introduction: '',
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('修改'),
        create: this.$t('新建')
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      read(this.listQuery).then(res => {
        this.list = res.items
        this.total = res.total
        this.listLoading = false
      }).catch(err => {
        this.listLoading = false
        console.error(err)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$notify({
        title: 'Success',
        message: this.$t('操作成功'),
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
    handleCreate() {
      this.temp.id = 0
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          create(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: this.$t('创建成功'),
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
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    manageUsers(row) {
      this.$router.push(`/admin/group/${row.id}/users`)
    },
    manageProjects(row) {
      this.$router.push(`/admin/group/${row.id}/projects`)
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: this.$t('更新成功'),
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
      })
    },
    handleDelete(row, index) {
      this.$confirm(this.$t('确定删除分组?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      }).then(() => {
        return del(row)
      }).then(() => {
        this.$notify({
          title: 'Success',
          message: this.$t('更新成功'),
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
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
