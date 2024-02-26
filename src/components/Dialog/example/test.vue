<template>
  <div>
    <el-button @click="openDialog">openDialog</el-button>
  </div>
</template>

<script>
import DialogDefine from './dialogDefine'
import Dialog from '@/components/Dialog'
export default {
  methods: {
    openDialog() {
      Dialog.open(DialogDefine, { title: 'hahahahxixi' })
    }
  }
}
</script>
