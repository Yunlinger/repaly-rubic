<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="dateValue"
        type="datetimerange"
        range-separator="-"
        :start-placeholder="$t('开始时间')"
        :end-placeholder="$t('结束时间')"
      >
      </el-date-picker>
      <el-input v-model="filter.uname" style="width: 120px;" :placeholder="$t('用户名')" @keyup.enter.native="doFilter" />
      <el-button type="primary" @click="doFilter">{{ $t('查询') }}</el-button>
    </div>
    <div class="table-container">
      <el-table
        ref="filterTable"
        v-loading="listLoading"
        :data="result.items"
        border
        stripe
        style="width: 100%"
        height="100%"
      >
        <el-table-column
          prop="uname"
          :label="$t('用户')"
          width="140"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.uname || scope.row.uid }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="op"
          :label="$t('消息')"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.message }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="st"
          :label="$t('登录时间')"
        >
          <template slot-scope="scope">
            <span>{{ timeToString(scope.row.st) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="et"
          :label="$t('退出时间')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.op === 'connectStop' ? timeToString(scope.row.et) : '' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('登录时长')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.op === 'connectStop' ? moment(scope.row.et).diff(moment(scope.row.st), 'minute') + ' 分钟' : '' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="result.total"
        :page.sync="filter.page"
        :limit.sync="filter.limit"
        @pagination="doFilter"
      />
    </div>
  </div>
</template>

<script>
import * as api from '@/api/logger'
import moment from 'moment'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      dateValue: [new Date(new Date() - 24 * 60 * 60 * 1000), ''],
      filter: {
        op: '',
        service: 'conn',
        uname: '',
        page: 0,
        limit: 10
      },
      result: {
        total: 0,
        items: []
      }
    }
  },

  mounted() {
    this.doFilter()
  },

  methods: {
    moment,

    timeToString(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss.SSS')
    },

    doFilter() {
      this.listLoading = true
      this.filter.start = (this.dateValue && moment(this.dateValue[0]).toISOString()) || ''
      this.filter.end = (this.dateValue && moment(this.dateValue[1]).toISOString()) || ''
      api.query(this.filter).then(res => {
        this.result = res
      }).catch(err => {
        this.$notify.error({
          message: this.$t('查询失败') + (err && err.error || '')
        })
      }).finally(() => {
        this.listLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: calc(100vh - 82px);
  padding-top: 24px;
  overflow: auto;
  .table-container {
    height: calc(100% - 110px);
  }
}

</style>
