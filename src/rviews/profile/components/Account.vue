<template>
  <el-form ref="dataForm" :model="user" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;">
    <el-form-item label="用户名" prop="name">
      <el-input v-model="user.name" :readonly="true" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="user.password" type="password" />
    </el-form-item>
    <el-form-item label="姓名" prop="cname">
      <el-input v-model="user.cname" />
    </el-form-item>
    <el-form-item label="手机号" prop="mobile">
      <el-input v-model="user.mobile" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" />
    </el-form-item>
    <el-form-item label="备注" prop="introduction">
      <el-input v-model="user.introduction" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" />
    </el-form-item>
    <el-button type="primary" @click="updateData()">
      确定
    </el-button>
  </el-form>
</template>

<script>
import { update } from '@/api/user'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: ''
        }
      }
    }
  },
  mounted() {
  },
  methods: {
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const uData = Object.assign({}, this.user)
          this.user.password = ''
          update(uData).then(() => {
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
            this.$notify({
              title: 'Error',
              message: err,
              type: 'error',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
