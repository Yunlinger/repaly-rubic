<template>
  <div class="file">
    <file />
  </div>
</template>

<script>
import file from '@/rviews/explorer/index'
export default {
  name: 'File',
  components: { file },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.file {
  height: 100%;
  border-radius: 10px;
  background: #fff;
}
</style>
