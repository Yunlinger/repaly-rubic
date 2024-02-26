<template>
  <div class="vcenter">
    <el-row :gutter="20">
      <el-col :span="12">
        <rnumber :title="values[0].title" :value="values[0].value" />
      </el-col>
      <el-col :span="12">
        <rnumber :title="values[1].title" :value="values[1].value" />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <rnumber :title="values[2].title" :value="values[2].value" />
      </el-col>
      <el-col :span="12">
        <rnumber :title="values[3].title" :value="values[3].value" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as rapi from '@/api/rtd'
import rnumber from './rnumber'
export default {
  components: {
    rnumber
  },
  data() {
    return {
      timer: null,
      values: [
        { var: 'CP1014_AI:U1193303.PNT', title: '功率', value: 600 },
        { var: '114COALFLOW:F19_10.RO01', title: '总燃料', value: 600 },
        { var: '114CCS:MSP.PNT', title: '主气压', value: 600 },
        { var: '114CCS:MST.PNT', title: '主气温', value: 600 }
      ]
    }
  },
  mounted() {
    this.startTimer()
  },
  destroyed() {
    this.stopTimer()
  },
  methods: {
    startTimer() {
      this.timer = setInterval(() => {
        for (let v of this.values) {
          v.value = rapi.getValue(v.var, v.value)
        }
      }, 1000)
    },

    stopTimer() {
      this.timer && clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .vcenter {
    -ms-transform: translateY(40%);
    transform: translateY(40%);
  }
</style>
