<template>
  <div class="app-container">
    <div v-if="!examID" class="filter-container">
      <el-date-picker
        v-model="dateValue"
        type="datetimerange"
        range-separator="-"
        class="filter-item"
        :start-placeholder="$t('开始时间')"
        :end-placeholder="$t('结束时间')"
      >
      </el-date-picker>
      <el-input
        v-model="listQuery.examName"
        :placeholder="$t('考试名称')"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.studentName"
        :placeholder="$t('考生名字')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="handleFilter">
        {{ $t('刷新') }}
      </el-button>
    </div>

    <div style="height: calc(100vh - 234px);"><el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      stripe
      highlight-current-row
      :cell-style="cellStyle"
      style="width: 100%;"
    >
      <el-table-column :label="$t('用户名')" width="120">
        <template slot-scope="{row}">
          <span>{{ row.studentName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('姓名')" width="80">
        <template slot-scope="{row}">
          <span>{{ row.studentCName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('考试名称')" width="240">
        <template slot-scope="{row}">
          <span>{{ row.exam.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('总分')" width="60">
        <template slot-scope="{row}">
          <span>{{ row.totalScore }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('评价')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.comment }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('总结')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.summary }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('开始时间')" width="140">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.startAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('提交时间')" width="140">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.CreatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="duration"
        :label="$t('用时')"
        width="80"
      >
        <template slot-scope="scope">
          <span>{{ `${scope.row.duration+1} 分钟` }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="80" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" @click="handleDetail(row)">
            {{ $t('详情') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
// 考试情况统计
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import moment from 'moment'

export default {
  name: 'ScoreList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      dateValue: [new Date(new Date() - 30 * 24 * 60 * 60 * 1000), new Date()],
      examID: 0,
      api: api,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        examID: 0,
        examName: '',
        studentName: ''
      },
      menuOptions: [],
      menus: {},
      showReviewer: false
    }
  },
  created() {
    this.getMenuData().then(() => {
      return this.getList()
    })
    this.examID = parseInt((this.$route.params && this.$route.params.id) || '0')
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
      this.listQuery.examID = this.examID || 0
      api.getCommitList({
        begin: (this.dateValue && moment(this.dateValue[0]).format()) || '',
        end: (this.dateValue && moment(this.dateValue[1]).format()) || '',
        ...this.listQuery
      }).then(res => {
        res = res || {}
        if (res.items) {
          for (var i = 0; i < res.items.length; i++) {
            res.items[i].duration = moment(res.items[i].CreatedAt).diff(moment(res.items[i].startAt), 'minute')
          }
        }
        this.list = res.items
        this.total = res.total || 0
      }).catch(err => {
        this.$msg.error(err, this.$t('读取列表错误'))
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    formatTime(dtstr) {
      return moment(dtstr).format('YYYY-MM-DD HH:mm:ss')
    },
    isActive(row) {
      let now = moment(new Date())
      let end = moment(row.startAt).add(row.duration, 'minute')
      return now.isBefore(end)
    },
    cellStyle(cell) {
      let style = 'padding-left: 2px; padding-right: 2px;'
      if (this.isActive(cell.row)) {
        style += 'color: green;'
      }
      return style
    },
    handleDetail(row) {
      if (row.exam.title === '') {
        this.$msg.error(this.$t('考试详情错误'))
        return
      }
      this.$emit('show', row.ID)
      // this.$router.push('/exam/view/' + row.ID)
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
