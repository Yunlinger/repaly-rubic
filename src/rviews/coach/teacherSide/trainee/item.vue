<template>
  <div v-loading="Loading" class="user_item">
    <div class="title">{{ name.cname }}    上机时长统计</div>
    <img :src="chartbg" />
    <div id="main"></div>
    <div id="mains"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import * as api from '@/api/logger'
import moment from 'moment'
export default {
  name: 'Trainee',
  props: {
    name: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      Loading: false,
      chart: null,
      charts: null,
      chartbg: require('@/assets/teacher/chart_bg.jpg'),
      filter: {
        start: '2023-01-01T00:00:00Z',
        end: '2023-12-31T23:00:00Z',
        every: '1h',
        service: 'rtdb',
        uname: '',
        fn: 'count'
      },
      option: {
        title: {
          top: 30,
          left: 'center',
          text: `日统计`,
          textStyle: {
            color: '#FFF'
          }
        },
        grid: {
          left: 50,
          right: 50
        },
        tooltip: {
          show: true,
          formatter: function(item) {
            let res = '日期：' + item.data[0] + '<br/>' + '时长：' + item.data[1] + '小时'
            return res
          }
        },
        visualMap: [
          {
            min: 0,
            max: 2,
            type: 'piecewise',
            orient: 'horizontal',
            // splitNumber: 12,
            left: 'center',
            top: 65,
            pieces: [
              { gt: 8, color: '#991B1B', symbol: 'rect' },
              { gt: 7, lt: 8, color: '#B91C1C', symbol: 'rect' },
              { gt: 6, lt: 7, color: '#DC2626', symbol: 'rect' },
              { gt: 5, lt: 6, color: '#EF4444', symbol: 'rect' },
              { gt: 4, lt: 5, color: '#F87171', symbol: 'rect' },
              { gt: 3, lt: 4, color: '#FCA5A5', symbol: 'rect' },
              { gt: 2, lt: 3, color: '#FECACA', symbol: 'rect' },
              { gt: 1, lt: 2, color: '#FEE2E2', symbol: 'rect' },
              { lt: 1, color: 'rgb(6,33,69)', symbol: 'rect' }
            ],
            textStyle: {
              color: '#FFF'
            }
          }
        ],
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: [40, 40],
          range: moment().get('year'),
          itemStyle: {
            borderWidth: 0.5
          },
          dayLabel: {
            show: true,
            color: '#FFF'
          },
          monthLabel: {
            show: true,
            color: '#FFF'
          },
          yearLabel: { show: false }
        },
        series: [{
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: []
        }]
      },
      options: {
        barWidth: '20%',
        grid: {
          left: 50,
          right: 50
        },
        title: {
          top: 10,
          left: 'center',
          text: `月统计`,
          textStyle: {
            color: '#FFF'
          }
        },
        tooltip: {
          show: true,
          formatter: function(item) {
            let res = item.data[0] + '月' + '<br/>' + item.data[1] + '小时'
            return res
          }
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            textStyle: {
              color: '#FFF'
            }
          }
        },
        yAxis: {
          type: 'value',
          max: 176,
          axisLabel: {
            textStyle: {
              color: '#FFF'
            }
          }
        },
        series: [
          {
            data: [],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            },
            label: {
              show: true,
              position: 'top',
              color: '#FFF'
            }
          }
        ]
      }
    }
  },
  mounted() {
    // this.initChart()
    this.Loading = true
    this.filter.uname = this.name.name
    this.filter.start = moment().startOf('year').toISOString()
    this.filter.end = moment().endOf('year').toISOString()
    this.init()
  },
  beforeDestroy() {
    this.chart = null
    this.charts = null
  },
  methods: {
    init() {
      api.query(this.filter).then(res => {
        let list = res.items
        let times = []
        let all = [] // 当年每一天日期和时长
        let mouth = [] // 当月月份和总时长
        // 热力图日期数据 day 每一天 alltime 当天总时长
        let addItem = (list) => {
          for (let i in list) {
            let obj = [list[i].day, list[i].alltime]
            all.push(obj)
          }
        }
        // 柱状图月份数据 index 月份 alltime 当月总时长
        let addmouth = (item, index) => {
          mouth.push([index + 1, item.alltime])
        }
        // 按月份存入当月所有数据
        for (let i = 0; i < 12; i++) {
          times[i] = {
            alltime: '', // 当月总时长
            days: [], // 当月每天数据
            alldays: [] // 当月所有数据
          }
        }
        for (let i = 0; i < list.length; i++) {
          let key = moment(list[i]._time).get('month')
          times[key].alldays.push(list[i])
        }
        // 按月份处理数据
        times.map((item, index) => {
          let alltime = 0
          let cache = item.alldays
          // 总时长
          for (let i = 0; i < cache.length; i++) {
            if (cache[i].count !== 0) {
              alltime = alltime + 1
            }
          }
          // 当月总时长
          item.alltime = alltime
          // 处理每天数据
          item.days = this.deal(cache)
          addItem(item.days)
          addmouth(item, index)
        })
        this.initChart(all, mouth)
      }).catch(err => {
        this.$notify.error({
          message: this.$t('查询失败') + (err && err.error || '')
        })
      }).finally(() => {
        this.listLoading = false
      })
    },
    formattimes(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss.SSS')
    },
    deal(list) {
      let times = []
      // 当月多少天
      let month = moment(moment(list[0]._time).format('YYYY-MM'), 'YYYY-MM').daysInMonth()
      for (let i = 1; i <= month; i++) {
        times[i] = {
          day: '',
          alltime: '',
          alldays: []
        }
      }
      // 按照天存入当天所有小时数据
      for (let i in list) {
        let key = moment(list[i]._time).get('date')
        times[key].alldays.push(list[i])
      }
      times.map(item => {
        let time = 0
        for (let i in item.alldays) {
          if (item.alldays[i].count !== 0) time = time + 1
        }
        // 当天总时长
        item.alltime = time
        // 当天日期YYYY-MM-DD
        item.day = this.dealDays(item.alldays)
      })
      return times
    },
    // 返回日期
    dealDays(list) {
      if (list.length === 0) return
      let day = moment(list[0]._time).format('YYYY-MM-DD')
      return day
    },
    initChart(all, mouth) {
      // 热力图
      var chartDom = document.getElementById('main')
      this.chart = echarts.init(chartDom)
      this.option.series[0].data = all
      this.option && this.chart.setOption(this.option)
      // 柱状图
      var chartDoms = document.getElementById('mains')
      this.charts = echarts.init(chartDoms)
      this.options.series[0].data = mouth
      this.options && this.charts.setOption(this.options)
      this.Loading = false
    },
    resizes() {
      this.chart.resize()
      this.charts.resize()
    }
  }
}
</script>

    <style lang="scss" scoped>
    .user_item {
      height: 100%;
      padding: 5px;
      overflow-y: auto;
      border-radius: 10px;
      position: relative;
      .title {
        position: absolute;
        left: 0; top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 115px;
        font-size: 30px;
        z-index: 10;
        color: #FFF;
      }
      // opacity: .6;
      #main {
        padding-top: 80px;
        height: 50%;
      }
      #mains {
        height: 50%;
      }
      img {
        position: absolute;
        left: 0; top: 0;
        width: 100%;
        height: 100%;
      }
    }
    </style>

