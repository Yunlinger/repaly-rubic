<template>
  <rubik-dialog
    ref="dialog"
    left="200px"
    :width="(width + 6) + 'px'"
    :height="(height + 6) + 'px'"
  >
    <template #title>
      <span class="el-dialog__title rubik-dialog__title">
        实时趋势
        <!-- {{ `${name} - ${detail.desc || ''}` }} -->
      </span>
    </template>
    <template #buttons>
      <button
        type="button"
        class="rubik-headerbtn"
        aria-label="Close"
        @click="close"
      >
        <em class="el-dialog__close el-icon el-icon-close" />
      </button>
    </template>
    <div
      v-click-outside="handleClickOutside"
      @dragover="allowDrop($event)"
      @drop="onDrop($event)"
    >
      <div :id="id" :style="{'height':`395px`, 'width':'100%'}" />
      <div>
        <el-table
          :data="detailDate"
          border
          style="width: 100%;"
        >
          <el-table-column label="名称" width="150" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.name !== '空'">{{ scope.row.name }}</span>
              <el-button v-else type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="add(scope.row, scope.$index)"></el-button>
            </template>
          </el-table-column>
          <el-table-column label="当前值" width="120" align="center">
            <template slot-scope="{row}">
              <!-- <span v-if="row.name !=='空'">{{ pointList[row.name] }}</span> -->
              <span>{{ (pointList && pointList[row.name]) || row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column label="描述" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.desc }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上限" width="60" align="center">
            <template slot-scope="{row}">
              <span>{{ row.high || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="下限" width="60" align="center">
            <template slot-scope="{row}">
              <span>{{ row.low || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" width="60" align="center">
            <template slot-scope="{row}">
              <span>{{ row.unit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="颜色" width="60">
            <template slot-scope="scope">
              <div
                :style="{widht: '40px', height: '16px', backgroundColor: scope.row.color }"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button-group v-if="scope.row.name !== '空'">
                <el-popover
                  v-model="scope.row.visible"
                  placement="right"
                  width="600"
                  trigger="manual"
                >
                  <div class="editform">
                    <div>
                      <div><span>描述：</span><el-input v-model="scope.row.desc"></el-input></div>
                      <div><span>高：</span><el-checkbox v-model="scope.row.alarmH"></el-checkbox><el-input v-model="scope.row.limitH"></el-input></div>
                    </div>
                    <div>
                      <div><span>上限：</span><el-input v-model="scope.row.high"></el-input></div>
                      <div><span>高高：</span><el-checkbox v-model="scope.row.alarmHH"></el-checkbox><el-input v-model="scope.row.limitHH"></el-input></div>
                    </div>
                    <div>
                      <div><span>下限：</span><el-input v-model="scope.row.low"></el-input></div>
                      <div><span>高三：</span><el-checkbox v-model="scope.row.alarmHHH"></el-checkbox><el-input v-model="scope.row.limitHHH"></el-input></div>
                    </div>
                    <div>
                      <div><span>单位：</span><el-input v-model="scope.row.unit"></el-input></div>
                      <div><span>低：</span><el-checkbox v-model="scope.row.alarmL"></el-checkbox><el-input v-model="scope.row.limitL"></el-input></div>
                    </div>
                    <div>
                      <div></div>
                      <div><span>低低：</span><el-checkbox v-model="scope.row.alarmLL"></el-checkbox><el-input v-model="scope.row.limitLL"></el-input></div>
                    </div>
                    <div>
                      <div></div>
                      <div><span>低三：</span><el-checkbox v-model="scope.row.alarmLLL"></el-checkbox><el-input v-model="scope.row.limitLLL"></el-input></div>
                    </div>
                    <div><el-button type="success" @click="confirmEditVarDesc(scope.row, scope.$index)">确认修改</el-button></div>
                  </div>
                  <el-button slot="reference" type="primary" icon="el-icon-edit" @click="scope.row.visible = !scope.row.visible"></el-button>
                </el-popover>
                <el-button type="primary" icon="el-icon-delete" @click="remove(scope.row, scope.$index)"></el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <!-- <el-form label-width="48px" size="mini">
          <el-form-item label="点名" style="margin-bottom: 6px;">
            <el-input :value="detail.name" readonly></el-input>
          </el-form-item>
          <el-form-item label="描述" style="margin-bottom: 6px;">
            <el-input :value="detail.desc || ''" readonly></el-input>
          </el-form-item>
          <el-form-item label="上限" style="margin-bottom: 6px;">
            <el-input :value="detail.high || 0" readonly></el-input>
          </el-form-item>
          <el-form-item label="下限" style="margin-bottom: 6px;">
            <el-input :value="detail.low || 0" readonly></el-input>
          </el-form-item>
          <el-form-item label="单位" style="margin-bottom: 6px;">
            <el-input :value="detail.unit || ''" readonly></el-input>
          </el-form-item>
          <el-form-item label="自动" style="margin-bottom: 6px;">
            <el-button @click="autoLimit">自适应限值</el-button>
          </el-form-item>
        </el-form> -->
      </div>
    </div>
  </rubik-dialog>
</template>
<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import * as api from '@/api/rtdb'
import store from '@/store/index'
import * as echarts from 'echarts'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'BlockEditor',
  components: { RubikDialog },
  directives: {
    'click-outside': {
      bind: function(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
          // 判断是否位于绑定元素内部
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event)
          }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
      },
      unbind: function(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  },
  data() {
    return {
      loading: false,
      width: 956,
      height: 750,
      name: [],
      detailList: [],
      detailDate: [],
      detail: {},
      chart: null,
      chartID: 'Detail_Chart_' + Math.random(),
      chartOption: {
        backgroundColor: '#000000',
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#FFF'
            }
          },
          formatter: (item) => { return this.replace(item) }
        },
        grid: {
          top: '6%',
          left: '2%',
          right: '2%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          splitNumber: 6,
          show: true,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#404040'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#404040'
            }
          },
          axisLabel: {
            formatter: function(value) {
              return moment(value).format('HH:mm')
            }
          }
        },
        yAxis: [{
          type: 'value',
          scale: true,
          splitNumber: 10,
          boundaryGap: [0, '100%'],
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#404040'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            },
            formatter: '{value} %'
          },
          splitLine: {
            lineStyle: {
              color: '#404040'
            }
          }
        }],
        series: []
      },
      pointList: {}
    }
  },
  mounted() {
    this.getDetailAndRenderChart()
    this.$on('global:rtdb', (msg) => {
      this.pointList = msg.data
    })
    this.timer = setInterval(() => {
      if (this.loading) return
      this.chart && this.getHistData()
    }, 5000)
  },

  methods: {
    close() {
      this.timer && clearInterval(this.timer)
      this.chart && this.chart.dispose()
      this.chart = null
      this.$refs.dialog.close()
    },
    getRandomColor(i) {
      // var color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
      let color = ['#D0291F', '#3257FE', '#7FE50D', '#895BFC', '#F7EA13', '#EF891E', '#124265', '#2F6F6C']
      return color[i - 1]
    },
    getDetailAndRenderChart() {
      if (this.name.length < 1) {
        return
      }
      this.loading = true
      let list = []
      for (let i = 1; i <= 8; i++) {
        let obj = { name: '空', color: this.getRandomColor(i), visible: false, pointList: [] }
        list.push(obj)
      }
      let detailList = []
      let gets = this.name.map(item => {
        return api.varGetDetail(item).then((res) => {
          detailList.push(res || {})
        })
      })
      Promise.all(gets).then(() => {
        for (let i in list) {
          if (detailList[i]) {
            detailList[i].color = list[i].color
            detailList[i].pointList = list[i].pointList
            if (detailList[i].high) {
              detailList[i].low = detailList[i].low || 0
            }
            list[i] = detailList[i]
          }
        }
        this.chartOption.yAxis[0].max = 100
        this.chartOption.yAxis[0].min = 0
        this.detailDate = list
        this.chart = echarts.init(document.getElementById(this.id))
        this.chart.setOption(this.chartOption)
        this.getHistData()
        this.loading = false
      })
    },
    getHistData() {
      let cache = []
      if (this.detailDate.filter(item => item.name === '空').length === 8) return
      for (let i of this.detailDate) {
        cache.push(i.name)
      }
      api.hist({
        vars: cache,
        fn: 'mean',
        start: '-1h',
        end: 'now()',
        group: '5s'
      }).then((data) => {
        let series = []
        data.map((key, index) => {
          let obj = {
            name: this.detailDate[index].desc || `变量${index + 1}`,
            type: 'line',
            showSymbol: false,
            smooth: true,
            color: this.detailDate[index].color,
            data: []
          }
          let source = []
          let list = []
          for (let item of key) {
            if (!_.isNil(item.v)) {
              list.push({ name: moment(new Date(item.t)).format('YYYY-MM-DD HH:mm:ss'),
                value: [
                  new Date(item.t),
                  item.v
                ] })
              this.detailDate[index].pointList = list
              source.push({
                name: new Date(item.t),
                value: [
                  new Date(item.t),
                  (item.v - (this.detailDate[index].low || 0)) / ((this.detailDate[index].high || 100) - (this.detailDate[index].low || 0)) * 100
                ]
              })
              obj.data = source
            }
          }
          series.push(obj)
        })
        if (!this.chart) return
        let option = this.chart.getOption()
        option.series = series
        this.chart && this.chart.setOption(option, true)
      })
    },
    autoLimit() {
      this.chart.dispose()
      delete this.chartOption.yAxis[0].max
      delete this.chartOption.yAxis[0].min
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.chartOption)
      this.getHistData()
    },
    add(row, index) {
      this.$prompt('请输入变量名称', '添加变量', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: ``
      }).then(({ value }) => {
        if (this.name.includes(value)) return
        api.varGetDetail(value).then((res) => {
          let obj = res || {}
          obj.color = this.detailDate[index].color
          this.$set(this.detailDate, index, obj)
        })
        if (this.name.length < 5) this.name.push(value)
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    remove(row, index) {
      let idx = this.name.indexOf(row.name)
      this.name.splice(idx, 1)
      let obj = { name: '空', color: this.getRandomColor(index + 1), visible: false }
      this.$set(this.detailDate, index, obj)
      this.getHistData()
    },
    async confirmEditVarDesc(row, index) {
      let color = row.color
      let obj = row
      api.varUpdate(obj).then(() => {
        // 放开修改限制，非开发分支不可保存
        if (store.getters.selectedInst.id === 'dev') {
          return api.save()
        }
      }).then(() => {
        this.detailDate.map(async(item, idx) => {
          if (item.name === row.name && idx === index) {
            await api.varGetDetail(item.name).then(res => {
              item = res
              item.color = color
              this.$msg.success('修改成功')
            })
          }
        })
        row.visible = false
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    replace(data) {
      let res = ''
      for (let i of data) {
        this.detailDate[i.seriesIndex].pointList && this.detailDate[i.seriesIndex].pointList.map(item => {
          if (item.name === moment(i.data.name).format('YYYY-MM-DD HH:mm:ss')) {
            res = res + `${i.seriesName} ${item.value[1].toFixed(3)}` + '<br />'
          }
        })
      }
      return res
    },
    allowDrop(event) {
      event.preventDefault()
    },
    onDrop(event) {
      var data = event.dataTransfer.getData('text/plain')
      if (!data || data.length === 0) {
        return
      }
      try {
        let dragVar = JSON.parse(data).dragVar || ''
        if (dragVar) {
          api.varGetDetail(dragVar).then((res) => {
            let obj = res || {}
            let index = -1
            for (let i = 0; i < this.detailDate.length && i < 8; i++) {
              if (this.detailDate[i].name === '空') {
                index = i
                break
              } else if (this.detailDate[i].name === dragVar) {
                return
              }
            }
            if (index < 0) {
              return
            }

            obj.color = this.detailDate[index].color
            this.$set(this.detailDate, index, obj)
            this.getHistData()
          })
        }
      } catch (err) { console.log(err) }
    },
    handleClickOutside(event) {
      this.detailDate.map(item => { item.visible = false })
    }
  }
}
</script>

<style lang="scss" scopped>
.rubik-dialog__body {
  padding: 2px;
}
.rubik-dialog__title {
  font-size: 14px;
}
.rubik-headerbtn {
  display: inline-block;
  position: relative;
  top: 0;
  right: 0;
  padding: 4px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  color: #909399;

  :hover {
    color:#409EFF
  }
}
.editform {
  height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    span{
      margin-right: 10px;
    }
    .el-input {
      width: 200px !important;
    }
  }
}
</style>
