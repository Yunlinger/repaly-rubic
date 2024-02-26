<template>
  <rubik-dialog
    title="事件一览"
    width="1080px"
    height="620px"
    :center="true"
    @closed="onClose"
  >
    <!-- <el-button type="primary" @click="doFilter">刷新</el-button> -->
    <el-table
      v-loading="listLoading"
      :data="result.items"
      height="528px"
      border
      stripe
      style="width: 100%"
      :cell-style="cellStyle"
      :header-cell-style="{ padding: 0 }"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="60"
      >
      </el-table-column>
      <el-table-column
        prop="ts"
        label="时间"
        width="160"
      >
        <template slot-scope="scope">
          <span>{{ timeToString(scope.row.ts) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="数据点名"
        width="180"
      >
      </el-table-column>
      <el-table-column
        prop="varDescprition"
        label="数据点描述"
      >
      </el-table-column>
      <el-table-column
        prop="descprition"
        label="事件描述"
        width="200"
      >
      </el-table-column>
      <el-table-column
        prop="opUserName"
        label="操作员"
        width="100"
      >
      </el-table-column>
      <el-table-column
        label="确认"
        width="100"
      >
        <template slot-scope="scope">
          <button v-if="!scope.row.acked" :style="buttonStyle(scope)" @click="ack(scope.row)">确认</button>
          <span v-else>{{ scope.row.ackUserName || "" }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="result.total"
      :page.sync="filter.page"
      :limit.sync="filter.pageSize"
      @pagination="doFilter"
    />
    <div style="position: absolute; right: 20px; bottom: 20px">
      <el-button size="mini" type="primary" @click="ackPage">确认本页</el-button>
      <el-button size="mini" type="warning" @click="ackAll">确认所有</el-button>
    </div>
  </rubik-dialog>
</template>

<script>
import RubikDialog from '@/components/Dialog/Wrapper'
import resize from './mixins/resize'
import moment from 'moment'
import * as api from '@/api/rtdb'
import * as rapi from '@/api/rtd'
import Pagination from '@/components/Pagination'

export default {
  name: 'EventView',
  components: { RubikDialog, Pagination },
  mixins: [resize],
  data() {
    return {
      listLoading: false,
      filter: {
        pageSize: 20,
        page: 1
      },
      result: {
        paegSize: 20,
        page: 1,
        total: 0,
        items: []
      }
    }
  },

  mounted() {
    this.doFilter()
    this.$on('global:event.new', (msg) => {
      this.result.items.unshift(msg.data)
    })
    this.$on('global:event.ack', (msg) => {
      for (let i = 0; i < this.result.items.length; i++) {
        if (this.result.items[i].id === msg.data.id) {
          this.result.items[i].acked = true
          this.result.items[i].ackts = msg.data.ackts
          this.result.items[i].ackUserName = msg.data.ackUserName
        }
      }
    })
    rapi.sendPulse('sys.event.view')
  },

  methods: {
    onClose() {
      this.$off('global:event.new')
      this.$off('global:event.ack')
    },

    timeToString(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss.SSS')
    },

    doFilter() {
      this.listLoading = true
      this.result.items = []
      api.eventList(this.filter).then(res => {
        this.result = res
      }).catch(err => {
        this.$notify.error({
          message: '查询失败' + (err && err.error || '')
        })
      }).finally(() => {
        this.listLoading = false
      })
    },
    cellStyle(cell) { // 根据报警级别显示颜色？
      let style = 'padding: 0;'
      if (cell.row.type === 1) { // OP
        if (cell.rowIndex % 2) {
          style += 'background: #b9f8f8;'
        } else {
          style += 'background: #d9f8f8;'
        }
        if (!cell.row.acked) {
          style += 'color: red;'
        }
      } else {
        if (cell.rowIndex % 2) {
          style += 'background: rgb(251, 251, 148);'
        } else {
          style += 'background: rgb(251, 251, 178);'
        }
        if (!cell.row.acked) {
          style += 'color: red;'
        }
      }

      return style
    },
    buttonStyle(cell) { // 根据报警级别显示颜色？
      let style = 'height: 18px; cursor: pointer;'
      if (cell.row.type === 1) { // OP
        style += 'background: #b9f8f8;'
        if (!cell.row.acked) {
          style += 'animation: rblink 1000ms step-end infinite;'
        }
      } else {
        style += 'background: rgb(251, 251, 158);'
        if (!cell.row.acked) {
          style += 'animation: rblink 1000ms step-end infinite;'
        }
      }
      return style
    },
    ack(row) {
      api.eventAck(row.id)
    },
    ackPage() {
      for (let i = 0; i < this.result.items.length; i++) {
        api.eventAck(this.result.items[i].id)
      }
      rapi.sendPulse('sys.event.ack')
    },
    ackAll() {
      // id 为-1, 确认所有事件
      api.eventAck(-1)
      rapi.sendPulse('sys.event.ack')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  input {
    padding: 0;
    height: 20px;
    line-height: 20px;
  }
  .cell {
    padding-left: 0px;
    padding-right: 0px;
  }
  .el-aside {
    padding: 2px;
  }
</style>

<style rel="stylesheet/scss" lang="scss">
  @keyframes rblink {
    from {
      background: red;
    }
    50% {
      background: white;
    }
    to {
      background: red;
    }
  }
</style>
