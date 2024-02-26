<template>
  <rubik-dialog
    ref="dialog"
    title="控件"
    width="1024px"
    height="628px"
    :center="true"
  >
    <template #buttons>
      <button
        type="button"
        class="el-dialog__headerbtn"
        style="top: 9px; right: 35px; "
        @click="save"
      >
        <i class="el-dialog__close el-icon el-icon-check" />
      </button>
      <button
        type="button"
        class="el-dialog__headerbtn"
        style="top: 9px; right: 5px; "
        @click="close"
      >
        <i class="el-dialog__close el-icon el-icon-close" />
      </button>
    </template>
    <el-row style="height: 100%">
      <el-col :span="24" style="height: 100%">
        <el-tabs v-model="tabActiveName" type="card">
          <el-tab-pane label="模板" name="first">
            <code-editor v-model="template" style="height: 552px" />
          </el-tab-pane>
          <el-tab-pane label="脚本" name="second">
            <code-editor v-model="script" style="height: 552px" />
          </el-tab-pane>
          <el-tab-pane label="属性" name="third">
            <code-editor v-model="props" style="height: 552px" />
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="0" style="height: 100%">
        <div class="grid-content bg-purple-light">

        </div>
      </el-col>
    </el-row>
  </rubik-dialog>
</template>

<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import CodeEditor from '@/components/CodeEditor'
export default {
  name: 'ComponentEditor',
  components: { RubikDialog, CodeEditor },
  data() {
    return {
      tabActiveName: 'first',
      template: '',
      script: '',
      props: '',
      callback: undefined
    }
  },
  methods: {
    save() {
      if (this.callback) {
        this.callback('template', this.template)
        this.callback('script', this.script)
        this.callback('props', this.props)
      }
      // console.log('save', this.config)
    },
    close() {
      this.$refs['dialog'].close()
    }
  }
}
</script>

<style>
.rubik-color-picker {
  z-index: 65534;
}
</style>
