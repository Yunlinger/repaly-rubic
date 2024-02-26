<template>
  <div class="vcenter">
    <el-row :gutter="20">
      <el-col :span="24">
        <rnumber title="仿真时间" :value="modtime" />
      </el-col>
      <el-col :span="24">
        <rnumber title="运行状态" :value="modrunning" />
      </el-col>
      <el-col :span="24">
        <rnumber title="加速倍率" :value="modspeed" />
      </el-col>
      <el-col :span="24">
        <rnumber title="当前工况" value="" />
      </el-col>
      <el-col :span="24">
        <rnumber title="活动故障" value="" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import rnumber from './rnumber'
export default {
  components: {
    rnumber
  },
  data() {
    return {
      timer: null,
      modtime: '00:00:00',
      modrunning: 'stopped',
      modspeed: '1'
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  watch: {
    project: {
      deep: true,
      handler: function() {
        const instName = this.project.project + '/' + this.project.model + '/' + this.project.id + '/'
        if (this.project.instances[instName]) {
          let second = Math.floor((this.project.instances[instName].time || 0) / 1000)
          let hour = Math.floor(second / 3600)
          let min = Math.floor((second - 3600 * hour) / 60)
          second = second % 60
          if (second < 10) {
            second = '0' + second
          }
          if (min < 10) {
            min = '0' + min
          }
          if (hour < 10) {
            hour = '0' + hour
          }
          this.modtime = hour + ':' + min + ':' + second
          this.modrunning = this.project.instances[instName].running ? 'running' : 'stopped'
          this.modspeed = this.project.instances[instName].speed + ''
        }
      }
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
  // .vcenter {
  //   -ms-transform: translateY(40%);
  //   transform: translateY(40%);
  // }
</style>
