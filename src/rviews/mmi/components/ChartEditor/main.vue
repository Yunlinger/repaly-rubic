<template>
  <rubik-dialog
    ref="dialog"
    title="图表配置"
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
          <el-tab-pane label="基本配置" name="first">
            <code-editor v-model="config.generateOption" style="height: 552px" />
          </el-tab-pane>
          <el-tab-pane label="数据整理" name="second">
            <code-editor v-model="config.generateDataset" style="height: 552px" />
          </el-tab-pane>
          <el-tab-pane label="其他脚本" name="third">
            <code-editor v-model="config.otherFunc" style="height: 552px" />
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
  name: 'ChartEditor',
  components: { RubikDialog, CodeEditor },
  data() {
    return {
      tabActiveName: 'first',
      config: {
      },
      callback: undefined
    }
  },
  methods: {
    save() {
      this.callback && this.callback(this.config)
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
