<template>
  <div class="app-container">
    <el-button type="primary" @click="save()">保存模型</el-button>
    <el-button type="primary">加载模型</el-button>
    <el-button type="primary" @click="frozen(true)">冻结</el-button>
    <el-button type="primary" @click="frozen(false)">运行</el-button>
  </div>
</template>

<script>
import * as mapi from '@/api/model'

export default {
  name: 'SaveModel',
  methods: {
    save() {
      mapi.modelSave().then(res => {
        this.$msg.success('保存成功')
      }).catch((info) => {
        this.$msg.error(`保存失败 ${info.error}`)
      })
    },
    frozen(f) {
      mapi.modelFrozen(f).then(() => {
        this.$msg.success('操作成功')
      })
    }
  }
}
</script>
