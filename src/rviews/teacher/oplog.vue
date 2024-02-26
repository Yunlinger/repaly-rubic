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
      <el-input v-model="filter.project" style="width: 120px;" :placeholder="$t('工程名')" @keyup.enter.native="doFilter" />
      <el-input v-model="filter.id" style="width: 120px;" :placeholder="$t('实例ID')" @keyup.enter.native="doFilter" />
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
          prop="time"
          :label="$t('时间')"
          width="160"
        >
          <template slot-scope="scope">
            <span>{{ timeToString(scope.row.time || scope.row._time) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="p"
          :label="$t('工程名')"
          width="100"
        >
        </el-table-column>
        <el-table-column
          prop="i"
          :label="$t('实例ID')"
          width="90"
        >
        </el-table-column>
        <el-table-column
          prop="uname"
          :label="$t('用户名')"
          width="100"
        >
        </el-table-column>
        <el-table-column
          prop="pn"
          :label="$t('变量')"
          width="100"
        >
        </el-table-column>
        <el-table-column
          prop="desc"
          :label="$t('描述')"
        >
        </el-table-column>
        <el-table-column
          prop="message"
          :label="$t('消息')"
        >
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
        service: 'rtdb',
        project: '',
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
