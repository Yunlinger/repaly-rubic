<template>
  <div class="trainee">
    <div class="search">
      <div class="left">
        <div>年份：</div>
        <el-select v-model="yaers" placeholder="请选择" @change="changeYears">
          <el-option
            v-for="item in yearsList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <div>用户名：</div>
        <el-input v-model="listQuery.name"></el-input>
        <el-button type="success" @click="getuser">查找</el-button>
      </div>
      <div class="right">
        <el-select v-model="exportModel" placeholder="请选择">
          <el-option label="年数据" value="year"></el-option>
          <el-option label="月数据" value="month"></el-option>
        </el-select>
        <el-select v-if="exportModel === 'month'" v-model="month" placeholder="请选择">
          <el-option
            v-for="item in 12"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
        <el-button :loading="downloadLoading" type="primary" @click="exportExcel">导出</el-button>
      </div>
    </div>
    <div v-show="!details" ref="content" class="content">
      <el-table
        v-if="tableHeight"
        v-loading="listLoading"
        :data="listDate"
        border
        stripe
        :height="tableHeight"
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column
          type="index"
          width="50"
          label="序号"
        >
        </el-table-column>
        <el-table-column label="账号">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="姓名">
          <template slot-scope="scope">
            {{ scope.row.cname }}
          </template>
        </el-table-column>
        <el-table-column label="年度上机时长">
          <template slot-scope="scope">
            {{ scope.row.time }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="getdetails(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <vxe-grid
        ref="xTable"
        border
        resizable
        show-overflow
        class="my-grid88"
        :height="500"
        :scroll-y="{mode: 'default'}"
        :loading="listLoading"
        :columns="tableColumn"
        :edit-config="{trigger: 'click', mode: 'cell'}"
        :menu-config="tableMenu"
        @menu-click="contextMenuClickEvent"
      >
      </vxe-grid> -->
    </div>
    <div v-if="details" class="msk">
      <i class="el-icon-circle-close" @click="closeMsk" />
      <Item ref="item" :name="detailsobj" />
    </div>
    <pagination v-show="total > 0 && !details" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" :pageSizes="[10, 20]" @pagination="getuser" />
  </div>
</template>

<script>
import * as api from '@/api/logger'
import * as uapi from '@/api/user'
import moment from 'moment'
import { parseTime } from '@/utils'
import Item from './item'
import Pagination from '@/components/Pagination'
export default {
  name: 'Trainee',
  components: { Item, Pagination },
  data() {
    return {
      listDate: [],
      listLoading: false,
      tableHeight: 0,
      yaers: 2023,
      month: '',
      exportModel: '',
      yearsList: [],
      downloadLoading: false,
      total: 0,
      tableColumn: [
        { type: 'seq', width: 50 },
        {
          field: '',
          title: '账号',
          slots: {
            default: ({ row }) => {
              return row.name
            }
          }
        },
        {
          field: 'cname',
          title: '名称'
        },
        {
          field: 'time',
          title: '年度总时长'
        }
      ],
      tableMenu: {
        className: 'my-menus',
        body: {
          options: [
            [
              { code: 'refresh', name: '刷新', prefixIcon: 'vxe-icon-refresh' }
            ],
            [
              { code: 'detail', name: '查看详情', prefixIcon: 'vxe-icon-refresh' }
            ]
          ]
        }
      },
      listQuery: {
        page: 1,
        pageSize: 20,
        name: '',
        cname: '',
        mobile: '',
        email: '',
        status: 1,
        sort: 'id ASC'
      },
      filter: {
        start: '',
        end: '',
        every: '1h',
        service: 'rtdb',
        uname: '',
        fn: 'count'
      },
      details: false,
      detailsobj: {}
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.tableHeight = window.innerHeight - 230
      if (!this.details) return
      this.$nextTick(() => {
        this.$refs.item.resizes()
      })
    })
    this.yearsList = []
    this.tableHeight = (window.innerHeight - 230) + 'px'
    let years = moment().year()
    for (let i = 2023; i <= years; i++) {
      let obj = { label: i, value: i }
      this.yearsList.push(obj)
    }
    this.yaers = years
    this.filter.start = moment().startOf('year').toISOString()
    this.filter.end = moment().endOf('year').toISOString()
    this.getuser()
  },
  methods: {
    getuser() {
      this.listLoading = true
      let start = moment().startOf('year').toISOString()
      let end = moment().endOf('year').toISOString()
      uapi.read(this.listQuery).then(res => {
        let list = res.items || []
        this.total = res.total || 0
        let cache = []
        let all = list.map(item => {
          let params = {
            start: start,
            end: end,
            every: '1h',
            service: 'rtdb',
            uname: item.name,
            fn: 'count'
          }
          let time = 0
          let allList = []
          return api.query(params).then(res => {
            for (let i = 0; i < res.items.length; i++) {
              if (res.items[i].count !== 0) {
                time = time + 1
              }
              allList.push(res.items[i])
            }
            item.time = time
            item.allList = allList

            cache.push(item)
          })
        })
        Promise.all(all).then(() => {
          this.listDate = cache
          this.listLoading = false
        })
      })
    },
    reloadDate(data) {
      this.listLoading = true
      const xTable = this.$refs.xTable
      if (xTable) {
        this.$refs.xTable.reloadData(data).then(() => {
          this.listLoading = false
        })
      }
    },
    formattimes(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss.SSS')
    },
    getdetails(item) {
      if (!item.time) return
      this.detailsobj = item
      this.details = true
    },
    closeMsk() {
      this.detailsobj = {}
      this.details = false
    },
    contextMenuClickEvent({ menu, row, column }) {
      switch (menu.code) {
        case 'refresh':
          // 示例
          this.getuser()
          break
        case 'detail':
          // 示例
          this.getdetails(row)
          break
        default:
          'error'
      }
    },
    changeYears(val) {
      let year = String(val)
      this.filter.start = moment(year).startOf('year').toISOString()
      this.filter.end = moment(year).endOf('year').toISOString()
      this.getuser()
    },
    exportExcel() {
      if (this.downloadLoading) return
      this.downloadLoading = true
      let month = this.month
      let val = String(this.yaers)
      let start = moment(val).startOf('year').toISOString()
      let end = moment(val).endOf('year').toISOString()
      let data = {
        page: 1,
        pageSize: 999,
        name: '',
        cname: '',
        mobile: '',
        email: '',
        status: 1,
        sort: 'id ASC'
      }
      let cache = []
      uapi.read(data).then(res => {
        let list = res.items || []
        let all = list.map(item => {
          let params = {
            start: start,
            end: end,
            every: '1h',
            service: 'rtdb',
            uname: item.name,
            fn: 'count'
          }
          return api.query(params).then(res => {
            let list = res.items
            let time = 0
            let times = []
            if (this.exportModel === 'month') {
              for (let i = 0; i < list.length; i++) {
                let key = moment(list[i]._time).get('month')
                if (key === month - 1) {
                  times.push(list[i])
                }
              }
              for (let i = 0; i < times.length; i++) {
                if (times[i].count !== 0) time = time + 1
              }
              cache.push({ name: item.name, cname: item.cname, time: time })
            } else {
              for (let i = 0; i < list.length; i++) {
                if (list[i].count !== 0) time = time + 1
              }
              cache.push({ name: item.name, cname: item.cname, time: time })
            }
          })
        })
        Promise.all(all).then(() => {
          cache = cache.sort((a, b) => { return a.name.localeCompare(b.name, 'zh-CN', { numeric: true }) })
          if (this.exportModel === 'month') {
            let tHeader = ['账号', '姓名', `${month}月上机时长`]
            let filterVal = ['name', 'cname', 'time']
            let filename = this.yaers + '年' + month + '月上机时长报告'
            this.handleDownload(cache, tHeader, filterVal, filename)
          } else {
            let tHeader = ['账号', '姓名', '年度上机时长']
            let filterVal = ['name', 'cname', 'time']
            let filename = this.yaers + '年度上机时长报告'
            this.handleDownload(cache, tHeader, filterVal, filename)
          }
          this.downloadLoading = false
        }).catch(() => { this.downloadLoading = false })
      })
    },
    handleDownload(list, tHeader, filterVal, filename) {
      import('@/vendor/Export2Excel').then(excel => {
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename,
          autoWidth: true,
          bookType: 'xlsx'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

  <style lang="scss" scoped>
  .trainee {
    height: 100%;
    padding: 5px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background: #fff;
    // opacity: .6;
    .search {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      .left {
        width: 500px;
        height: 50px;
        display: flex;
        align-items: center;
        div {
          margin: 0 5px;
        }
        .el-input {
          width: 120px !important;
        }
      }
      .right {
        width: 360px;
        height: 50px;
        display: flex;
        align-items: center;
        div {
          margin: 0 5px;
        }
      }
    }
    .content {
      height: calc(100% - 50px);
    }
    .msk {
      position: absolute;
      left: 0; right: 0;
      top: 60px; bottom: 0;
      background: rgba(0, 0, 0, .8);
      i {
        position: absolute;
        right: 0; top: 0;
        font-size: 35px;
        z-index: 10;
        color: #FFF;
        z-index: 11;
        cursor: pointer;
      }
    }
  }
  </style>

