<template>
  <div
    class="rubik-box"
    :class="{ noborder: !boxb }"
    :style="{ height: dheight? (dheight + 'px') : '100%' }"
  >
    <!--左上边框-->
    <div v-if="boxb" class="line-box">
      <i class="t-l-line"></i>
      <i class="l-t-line"></i>
    </div>
    <!--右上边框-->
    <div v-if="boxb" class="line-box">
      <i class="t-r-line"></i>
      <i class="r-t-line"></i>
    </div>
    <!--左下边框-->
    <div v-if="boxb" class="line-box">
      <i class="l-b-line"></i>
      <i class="b-l-line"></i>
    </div>
    <!--右下边框-->
    <div v-if="boxb" class="line-box">
      <i class="r-b-line"></i>
      <i class="b-r-line"></i>
    </div>
    <div class="chart">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Rubikbox',
  props: {
    dheight: {
      type: Number,
      default: 0
    },
    boxb: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" src="./index.scss" scopped>
</style>
