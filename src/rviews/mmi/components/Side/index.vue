<template>
  <div class="rubik-collapse-item">
    <mmi-explorer />
  </div>
</template>

<script>
import MmiExplorer from '@/rviews/mmi/explorer'

export default {
  name: 'MmiSide',
  components: { MmiExplorer }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .rubik-collapse-item {
    height: calc(100vh - 88px);
    overflow: auto;
    background: #f8f8f8;
  }
</style>
