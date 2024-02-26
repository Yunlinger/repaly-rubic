<template>
  <box :dheight="50">
    <el-row :gutter="20" style="width: 100%; height: 100%">
      <el-col :span="12" style="height: 100%">
        <div class="panel-text">
          {{ title }}
        </div>
      </el-col>
      <el-col :span="12" style="height: 100%">
        <div class="panel-num">
          {{ value }}
        </div>
      </el-col>
    </el-row>
  </box>
</template>

<script>
import box from '../../component/box'

export default {
  components: {
    box
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
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
