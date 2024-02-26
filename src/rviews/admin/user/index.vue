<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="$t('用户名')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.cname" :placeholder="$t('姓名')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.mobile" :placeholder="$t('手机号')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.email" :placeholder="$t('邮箱')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="头像" align="center">
        <template slot-scope="{row}">
          <img :src="row.avatar" class="user-avatar">
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('用户名')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('姓名')" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cname }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="手机号" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.mobile }}</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="邮箱" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('角色')" align="center">
        <template slot-scope="{row}">
          <el-tag v-for="role in row.roles" :key="role">{{ $t(rolesToTags[role]) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('状态')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'primary':'danger'">{{ ['', '正常', '禁用'][row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('备注')" align="left">
        <template slot-scope="{row}">
          <span>{{ (row.introduction) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row, $index)">
            {{ $t('修改') }}
          </el-button>
          <el-button type="primary" size="mini" @click="manageGroups(row, $index)">
            {{ $t('团队') }}
          </el-button>
          <!-- <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('删除') }}
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" append-to-body>
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 80%; margin-left:50px;">
        <el-form-item :label="$t('用户名')" prop="name">
          <el-input v-model="temp.name" :readonly="dialogStatus!='create'" />
        </el-form-item>
        <el-form-item :label="$t('密码')" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item :label="$t('姓名')" prop="cname">
          <el-input v-model="temp.cname" />
        </el-form-item>
        <el-form-item :label="$t('手机号')" prop="mobile">
          <el-input v-model="temp.mobile" />
        </el-form-item>
        <el-form-item :label="$t('邮箱')" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item :label="$t('角色')" prop="roles">
          <el-select
            v-model="temp.roles"
            multiple
            filterable
            allow-create
            :placeholder="$t('角色')"
          >
            <el-option
              v-for="item in rolesTypeOptions"
              :key="item.key"
              :label="$t(item.label)"
              :value="item.key"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('状态')" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusTypeOptions" :key="item.key" :label="$t(item.label)" :value="item.key" />
          </el-select>
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

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics" append-to-body>
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchPv } from '@/api/article'
import { create, read, update, del } from '@/api/user'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'UserManage',
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
        cname: '',
        mobile: '',
        email: '',
        status: 1,
        sort: 'id ASC'
      },
      importanceOptions: [1, 2, 3],
      statusTypeOptions: [
        { label: this.$t('无'), key: 0 },
        { label: this.$t('正常'), key: 1 },
        { label: this.$t('禁用'), key: 2 }
      ],
      rolesTypeOptions: [
        { label: '管理员', key: 'admin' },
        { label: '工程师', key: 'engineer' },
        { label: '教练员', key: 'teacher' },
        { label: '学员', key: 'student' }
      ],
      rolesToTags: {
        'admin': '管',
        'engineer': '工',
        'teacher': '教',
        'student': '学'
      },
      showReviewer: false,
      temp: {
        id: 0,
        name: '',
        cname: '',
        mobile: '',
        email: '123a@abc.com',
        avatar: '',
        introduction: '',
        password: '',
        status: 1,
        roles: ['student']
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('修改'),
        create: this.$t('新建')
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
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
    manageGroups(row) {
      this.$router.push(`/admin/user/${row.id}/groups`)
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
      this.$confirm(this.$t('确定删除用户?'), '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
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
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
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
