<template>
  <rubik-dialog
    ref="dialog"
    :title="title"
  >
    <el-button @click="close">close</el-button>
  </rubik-dialog>
</template>

<script>
import RubikDialog from '@/components/Dialog/Wrapper'

export default {
  name: 'DialogDefine',
  components: { RubikDialog },
  data() {
    return {
      title: ''
    }
  },
  methods: {
    close() {
      this.$refs.dialog.close()
    }
  }
}
</script>
