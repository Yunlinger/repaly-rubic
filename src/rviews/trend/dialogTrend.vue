<template>
  <rubik-dialog
    title="曲线"
    width="960px"
    height="660px"
    top="100px"
    @closed="onClose"
  >
    <div :id="id" :style="{height:'60%', width:'100%'}" />
    <el-container style="height: 40%">
      <el-aside>
        <div v-contextmenu:contextmenu class="app-container" style="padding: 4px">
          <v-contextmenu ref="contextmenu">
            <v-contextmenu-item @click="addGroup()">新建趋势组</v-contextmenu-item>
          </v-contextmenu>
          <el-table
            :data="trendGroupList"
            :cell-style="getCellStyle"
            :header-cell-style="getCellStyle"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            @row-click="rowClick"
          >
            <el-table-column align="center" label="编号" width="50">
              <template slot-scope="scope">
                <span>{{ scope.row.id }}</span>
              </template>
            </el-table-column>

            <el-table-column label="趋势组名称">
              <template slot-scope="scope">
                <template v-if="scope.row.edit">
                  <el-input
                    v-model="scope.row.name"
                    class="edit-input"
                    size="small"
                    @keyup.enter.native="confirmEdit(scope.row)"
                  />
                </template>
                <span
                  v-else
                  @dblclick="beginEdit(scope.row)"
                >{{ scope.row.name || " ------------ " }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-aside>
      <el-main>
        <el-select v-model="rangeTime" placeholder="选择时间跨度">
          <el-option
            v-for="item in rangeTimeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button icon="el-icon-caret-left" @click="timeMoveLeft" />
        <el-date-picker
          v-model="endTime"
          type="datetime"
          placeholder="选择结束时刻"
          align="right"
          :picker-options="pickerOptions"
        />
        <el-button icon="el-icon-caret-right" @click="timeMoveRight" />
        <!-- <el-button icon="el-icon-plus" @click="addPoint" /> -->
        <!-- <el-button icon="el-icon-plus" @click="addGroup" /> -->
        <el-table
          :data="selectGroup.items"
          height="240px"
          border
          style="width: 100%"
          :cell-style="{ padding: 0 }"
          :header-cell-style="{ padding: 0 }"
        >
          <el-table-column label="变量名" width="160">
            <template slot-scope="scope">
              <template v-if="scope.row.edit">
                <el-input
                  v-model="scope.row.name"
                  class="edit-input"
                  size="small"
                  @keyup.enter.native="confirmEditVarName(scope.row)"
                />
              </template>
              <span v-else @dblclick="beginEdit(scope.row)">
                {{ scope.row.name || " ------------ " }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="desc" label="描述">
            <template slot-scope="scope">
              <template v-if="scope.row.edit">
                <el-input
                  v-model="scope.row.desc"
                  class="edit-input"
                  size="small"
                  @keyup.enter.native="confirmEditVarDesc(scope.row)"
                />
              </template>
              <span v-else @dblclick="beginEdit(scope.row)">
                {{ scope.row.desc || " ------------ " }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="实时值" width="100">
            <template slot-scope="scope">
              <span>
                {{ scope.row.value }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="颜色" width="60">
            <template slot-scope="scope">
              <div
                :style="{widht: '40px', height: '16px', backgroundColor: scope.row.color }"
                @dblclick="pickColor(scope.row, $event)"
              />
            </template>
          </el-table-column>
          <el-table-column label="类型" width="60">
            <template slot-scope="scope">
              <span @dblclick="setTrendType(scope.row, $event)">
                {{ trendTypeString[((scope.row.type || 0)%3)] }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </rubik-dialog>
</template>

<script>
import _ from 'lodash'
import * as echarts from 'echarts'
import RubikDialog from '@/components/Dialog/Wrapper'
import resize from './mixins/resize'
import cp from '@/components/ColorPicker'

import * as rapi from '@/api/rtdb'
import * as rtdapi from '@/api/rtd'
import moment from 'moment'

export default {
  name: 'LineTrend',
  components: { RubikDialog },
  mixins: [resize],
  data() {
    return {
      chart: null,
      id: 'Chart_' + Math.random(),
      endTime: null,
      rangeTime: 300,
      trendGroupList: [],
      selectGroup: { items: [] },
      timerTrendUpdate: null,
      trendTypeString: ['曲线', '阶跃', '柱状'],
      trendStepValues: [false, 'end', 'middle'],
      pickerOptions: {
        shortcuts: [{
          text: '半小时前',
          onClick(picker) {
            picker.$emit('pick', new Date() - 1800 * 1000)
          }
        }, {
          text: '一小时前',
          onClick(picker) {
            picker.$emit('pick', new Date() - 3600 * 1000)
          }
        }, {
          text: '二小时前',
          onClick(picker) {
            picker.$emit('pick', new Date() - 3600 * 1000 * 2)
          }
        }, {
          text: '十二小时前',
          onClick(picker) {
            picker.$emit('pick', new Date() - 3600 * 1000 * 12)
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      rangeTimeOptions: [{
        value: 60,
        label: '一分钟'
      }, {
        value: 120,
        label: '二分钟'
      }, {
        value: 300,
        label: '五分钟'
      }, {
        value: 600,
        label: '十分钟'
      }, {
        value: 1200,
        label: '二十分钟'
      }, {
        value: 1800,
        label: '半小时'
      }, {
        value: 3600,
        label: '一小时'
      }, {
        value: 3600 * 2,
        label: '二小时'
      }, {
        value: 3600 * 6,
        label: '六小时'
      }, {
        value: 3600 * 12,
        label: '十二小时'
      }, {
        value: 3600 * 24,
        label: '一天'
      }, {
        value: 3600 * 24 * 7,
        label: '一周'
      }, {
        value: 3600 * 24 * 30,
        label: '一月'
      }],
      chartOption: {
        backgroundColor: '#394056',
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        grid: {
          top: '6%',
          left: '2%',
          right: '2%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: [{
          type: 'time',
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#57617B'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          scale: true,
          boundaryGap: true,
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          },
          splitLine: {
            lineStyle: {
              color: '#57617B'
            }
          }
        }],
        series: []
      }
    }
  },
  watch: {
    endTime: function() {
      this.updateChart()
    },
    rangeTime: function(newValue) {
      this.updateChart()
    },
    selectGroup: {
      deep: false,
      handler: function() {
        this.updateChart()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  methods: {
    onClose() {
      if (this.timerTrendUpdate) {
        clearInterval(this.timerTrendUpdate)
      }
      if (this.timerValueUpdate) {
        clearInterval(this.timerValueUpdate)
      }
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))

      this.chart.setOption(this.chartOption)

      this.getTrendGroupList()
      this.initTimer()
    },
    initTimer() {
      this.timerTrendUpdate = setInterval(() => {
        if (!this.endTime) {
          this.updateChart()
        }
      }, 5000)
      this.timerValueUpdate = setInterval(() => {
        this.updateValues()
      }, 500)
    },
    updateValues() {
      this.selectGroup.items.map(item => {
        if (item.name) {
          // 更新实时值
          item.value = rtdapi.getValue(item.name)
        }
      })
    },
    getRandomColor() {
      var letters = '1234CDEF'
      var color = '#'
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 8)]
      }
      return color
    },
    getTrendGroupList() {
      rapi.listTrendGroup().then((group) => {
        let list = []
        for (let id in group.items) {
          group.items[id].items = group.items[id].items || []
          if (group.items[id].items.length < 8) {
            for (let i = group.items[id].items.length; i < 8; i++) {
              group.items[id].items.push({ name: '', color: this.getRandomColor(), edit: false, desc: '', type: 0 })
            }
          }
          for (let item of group.items[id].items) {
            item.edit = false
            item.desc = ''
            item.type = item.type || 0
            item.value = rtdapi.getValue(item.name)
          }
          list.push({
            ...group.items[id],
            edit: false
          })
        }
        this.trendGroupList = list
        if (!group) this.selectGroup = this.trendGroupList[0]
        this.fetchVarDetail()
      }).catch(() => {})
    },
    updateChart() {
      let stop = moment().toISOString()
      if (this.endTime) {
        stop = moment(this.endTime).toISOString()
      }
      let start = moment(stop).subtract(this.rangeTime, 's').toISOString()

      let legendData = []
      let vars = []
      //
      this.selectGroup.items.map(item => {
        vars.push(item.name || '')
        if (item.name) {
          legendData.push(item.desc || item.name)
        }
      })

      let group = ''
      let fn = ''
      if (this.rangeTime > 3600 * 24) {
        group = '1h'
        fn = 'mean'
      } else if (this.rangeTime >= 1800) {
        group = '1m'
        fn = 'mean'
      } else if (this.rangeTime > 300) {
        group = '10s'
        fn = 'mean'
      } else if (this.rangeTime > 120) {
        group = '5s'
        fn = 'mean'
      } else {
        group = ''
        fn = ''
      }
      let req = {
        'vars': vars,
        'start': start,
        'stop': this.endTime ? stop : '',
        'group': group,
        'fn': fn
      }
      rapi.hist(req).then((res) => {
        res = res || []
        let series = []
        for (let i = 0; i < res.length; i++) {
          let item = this.selectGroup.items[i]
          let hdata = res[i]
          let serie = {
            name: item.desc || item.name,
            type: (item.type <= 1) ? 'line' : 'bar',
            step: this.trendStepValues[item.type || 0],
            smooth: false,
            symbol: 'circle',
            symbolSize: 2,
            showSymbol: false,
            lineStyle: { color: item.color, width: 2 },
            itemStyle: { color: item.color },
            data: []
          }
          for (let record of hdata) {
            if (!_.isNil(record.v)) {
              let tm = new Date(record.t)
              serie.data.push({
                name: tm,
                value: [tm, record.v]
              })
            }
          }
          series.push(serie)
        }
        if (this.chart) {
          let option = this.chart.getOption()
          option.legend.data = legendData
          option.series = series
          this.chart.setOption(option, true)
        }
      })
    },
    addGroup() {
      this.$prompt('请输入趋势分组名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        return rapi.newTrendGroup(value)
      }).then(res => {
        this.getTrendGroupList()
      }).catch((err) => {
        console.error(err)
      })
    },
    timeMoveLeft() {
      let end = this.endTime || new Date()
      this.endTime = end - this.rangeTime * 1000 / 2
    },
    timeMoveRight() {
      let end = this.endTime || new Date()
      this.endTime = end + this.rangeTime * 1000 / 2
    },
    beginEdit(row) {
      row.edit = true
      row.oldName = row.name
    },
    formatGroup(group) {
      let ug = _.cloneDeep(group)
      delete ug.edit
      for (let idx in ug.items) {
        ug.items[idx] = {
          name: ug.items[idx].name,
          color: ug.items[idx].color,
          type: ug.items[idx].type
        }
      }
      return ug
    },
    confirmEdit(row) {
      row.edit = false
      let ug = this.formatGroup(this.selectGroup)
      rapi.updateTrendGroup(ug).then(() => {
      }).catch(() => {
        row.name = row.oldName
      })
    },
    confirmEditVarName(row) {
      row.edit = false
      let ug = this.formatGroup(this.selectGroup)
      rapi.updateTrendGroup(ug).then(() => {
        this.fetchVarDetail()
        this.updateChart()
      }).catch(() => {
        row.name = row.oldName
      })
    },
    confirmEditVarDesc(row) {
      console.log(row)
      row.edit = false
      if (row.name) {
        rapi.varGetDetail(row.name).then(detail => {
          detail.desc = row.desc
          return rapi.varUpdate(row)
        }).catch((err) => {
          this.$msg.error(err)
        })
      }
    },
    saveCondition(row) {
    },
    loadCondition(row) {
    },
    getCellStyle({ row, column, rowIndex, columnIndex }) {
      return 'padding: 0px;'
    },
    rowClick(row, column, event) {
      this.selectGroup = row
      for (let i = 0; i < this.selectGroup.items.length; i++) {
        let item = this.selectGroup.items[i]
        item.edit = false
      }
      this.fetchVarDetail()
    },
    fetchVarDetail() {
      for (let i = 0; i < this.selectGroup.items.length; i++) {
        let item = this.selectGroup.items[i]
        if (item.name) {
          rapi.varGetDetail(item.name).then(detail => {
            item.desc = detail.desc
            item.varDetail = detail
          })
        }
      }
    },
    pickColor(row, e) {
      cp({
        color: row.color,
        left: e.clientX - 220,
        top: e.clientY - 5,
        callback: (c) => {
          row.color = c
          rapi.updateTrendGroup(this.selectGroup).then(() => {
            this.updateChart()
          }).catch(() => {})
        }
      })
    },
    setTrendType(row) {
      row.type = row.type || 0
      row.type = (row.type + 1) % 3
      rapi.updateTrendGroup(this.selectGroup).then(() => {
        this.updateChart()
      }).catch(() => {})
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
