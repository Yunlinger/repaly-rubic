<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" :placeholder="$t('关键字')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('副标题')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.subtitle }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('标题')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('注意事项')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('开始时间')" width="200">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.startAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="140" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" @click="start(row)">
            {{ $t('参加考试') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import moment from 'moment'

export default {
  name: 'Activities',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      api: api,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        ID: 0,
        menuID: 0,
        type: 0,
        keyword: '',
        unfinished: true
      },
      importanceOptions: [1, 2, 3],
      menuOptions: [],
      menus: {},
      showReviewer: false,
      downloadLoading: false,
      createExamFlag: false,
      createExamData: {
        paperID: 0,
        title: '考试标题',
        subtitle: '考试副标题',
        remark: '请认真作答',
        startAt: new Date(),
        duration: 120
      }
    }
  },
  created() {
    this.getMenuData().then(() => {
      return this.getList()
    })
  },
  methods: {
    getMenuData() {
      this.menuOptions = [{
        label: this.$t('所有目录'),
        key: 0
      }]
      return api.readMenu(0).then(res => {
        for (let menu of res.items) {
          this.menuOptions.push({
            label: menu.name,
            key: menu.ID
          })
          this.menus[menu.ID] = menu
        }
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.menuID = this.listQuery.menuID || 0
      this.listQuery.type = this.listQuery.type || 0
      api.readExam(this.listQuery).then(res => {
        this.list = res.items
        this.total = res.total || 0
      }).catch(err => {
        this.$msg.error(err, this.$t('读取考试列表错误'))
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      delete this.temp.ID
      this.temp.enable = this.temp.enable || false
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.createExamData = {
        ID: row.ID,
        paperID: row.paperID,
        title: row.title,
        subtitle: row.subtitle,
        remark: row.remark,
        startAt: moment(row.startAt),
        duration: row.duration
      }
      this.createExamFlag = true
    },
    start(row) {
      this.$router.push(`/examination/${row.ID}`)
    },
    formatTime(dtstr) {
      return moment(dtstr).format('YYYY-MM-DD HH:mm:ss')
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
