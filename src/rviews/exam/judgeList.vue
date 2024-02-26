<template>
  <div class="app-container">
    <!-- <div class="filter-container">
      <el-select v-model="listQuery.menuID" :placeholder="$t('目录')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-input v-model="listQuery.keyword" :placeholder="$t('关键字')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
    </div> -->

    <el-table
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
      <el-table-column label="ID" prop="ID" align="center" width="50">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
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
      <el-table-column :label="$t('操作')" align="center" width="80" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" @click="handleMark(row)">
            {{ $t('判卷') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
// 判卷列表
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import moment from 'moment'

export default {
  name: 'JudgeList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      examID: 0,
      api: api,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        examID: 0
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
      api.getCommitList(this.listQuery).then(res => {
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
    handleMark(row) {
      console.log(row)
      this.$router.push('/exam/mark/' + row.ID)
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
