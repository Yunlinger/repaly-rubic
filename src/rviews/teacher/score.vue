<template>
  <div class="app-container">
    <div class="filter-container">
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
        v-model="filter.project"
        style="width: 120px;"
        class="filter-item"
        :placeholder="$t('工程名')"
        @keyup.enter.native="query"
      />
      <el-input
        v-model="filter.caseName"
        style="width: 180px;"
        class="filter-item"
        :placeholder="$t('案例名')"
        @keyup.enter.native="query"
      />
      <el-input
        v-model="filter.userName"
        style="width: 120px;"
        class="filter-item"
        :placeholder="$t('学员名')"
        @keyup.enter.native="query"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="query">
        {{ $t('查询') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="query">
        {{ $t('刷新') }}
      </el-button>
    </div>

    <el-table
      ref="filterTable"
      :data="result.results"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column
        prop="userName"
        :label="$t('用户名')"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="userCName"
        :label="$t('姓名')"
        width="120"
      >
      </el-table-column>
      <el-table-column
        prop="project"
        :label="$t('工程名')"
        width="120"
      >
      </el-table-column>
      <el-table-column
        prop="caseID"
        :label="$t('案例ID')"
        width="80"
      >
      </el-table-column>
      <el-table-column
        prop="caseName"
        :label="$t('案例名')"
      >
      </el-table-column>
      <!-- <el-table-column
        prop="name"
        label="任务名"
      >
      </el-table-column> -->
      <el-table-column
        prop="startTime"
        :label="$t('开始时间')"
        width="140"
      >
        <template slot-scope="scope">
          <span>{{ timeToString(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="endTime"
        :label="$t('结束时间')"
        width="140"
      >
        <template slot-scope="scope">
          <span>{{ timeToString(scope.row.endTime) }}</span>
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
      <el-table-column
        prop="autoScore"
        :label="$t('自动判分')"
        width="80"
      >
        <template slot-scope="scope">
          <span>{{ (scope.row.autoScore || 0).toFixed(1) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="teacherScore"
        label="教员给分"
      >
      </el-table-column>
      <el-table-column
        prop="totalScore"
        label="任务总分"
      >
      </el-table-column> -->
    </el-table>
    <pagination
      v-show="result.total > 0"
      :total="result.total"
      :page.sync="filter.page"
      :limit.sync="filter.pageSize"
      @pagination="query"
    />
  </div>
</template>

<script>
import * as api from '@/api/case'
import moment from 'moment'
import Pagination from '@/components/Pagination'

export default {
  name: 'Score',
  components: { Pagination },
  data() {
    return {
      dateValue: [new Date(new Date() - 30 * 24 * 60 * 60 * 1000), new Date()],
      filter: {
        project: '',
        caseName: '',
        userName: '',
        page: 1,
        pageSize: 10
      },
      result: {
        results: [],
        total: 0
      }
    }
  },

  mounted() {
    this.query()
  },

  methods: {
    timeToString(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },

    query() {
      api.query({
        startTime: (this.dateValue && moment(this.dateValue[0]).format()) || '',
        endTime: (this.dateValue && moment(this.dateValue[1]).format()) || '',
        ... this.filter
      }).then(res => {
        res = res || {}

        if (res.results) {
          for (var i = 0; i < res.results.length; i++) {
            res.results[i].duration = moment(res.results[i].endTime).diff(moment(res.results[i].startTime), 'minute')
          }
        }
        res.total = res.total || 0
        this.result = res
      }).catch(err => {
        this.$notify.error({
          message: this.$t('查询失败') + (err && err.error || '')
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dispatch-container {
  height: calc(100vh - 82px);
  padding-top: 24px;
  overflow: auto;
  .control-buttons {
    padding: 12px 64px;
    display: flex;
    justify-content: space-between;
  }
  .operate {
    .project {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    .dispatch {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

</style>
