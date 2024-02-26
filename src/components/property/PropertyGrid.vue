
<template>
  <div :class="['PropertyGrid', className]" :style="cusStyle">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PropertyGrid',
  props: {
    className: {
      type: String,
      default: ''
    },
    cusStyle: {
      type: Object,
      default: null
    }
  }
}
</script>

<style lang="css">
  .PropertyGrid {
    position: relative;
    color: black;
    font: 12px 'Microsoft YaHei';
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    cursor: default;
    user-select: none;
}
</style>
