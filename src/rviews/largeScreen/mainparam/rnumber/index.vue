<template>
  <box :dheight="50">
    <el-row :gutter="20" style="width: 100%; height: 100%">
      <el-col :span="12" style="height: 100%">
        <div class="panel-text">
          {{ title }}
        </div>
      </el-col>
      <el-col :span="12" style="height: 100%">
        <count-to
          :start-val="value"
          :end-val="value"
          :duration="1"
          :decimals="1"
          class="panel-num"
        />
      </el-col>
    </el-row>
  </box>
</template>

<script>
import CountTo from 'vue-count-to'
import box from '../../component/box'

export default {
  components: {
    CountTo,
    box
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      startValue: 0
    }
  },
  watch: {
    value(val, old) {
      this.startValue = old
    }
  }
}
</script>

<style lang="scss" scoped>
  .panel-text {
    display: flex;
    width: 100%;
    height: 100%;
    color: rgb(72, 117, 240);
    transition: all 0.38s ease-out;
    justify-content: center;
    align-items: center;
    font-size: 1.0rem;
  }
  .panel-num {
    display: flex;
    width: 100%;
    height: 100%;
    color: rgb(214, 255, 102);
    transition: all 0.38s ease-out;
    justify-content: center;
    align-items: center;
    font-size: 1.6rem;
    font-family: digifaw;
  }

</style>
