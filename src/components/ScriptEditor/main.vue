<template>
  <rubik-dialog
    ref="dialog"
    :title="title"
    :left="left + 'px'"
    :top="top + 'px'"
    width="680px"
    height="482px"
  >
    <template #buttons>
      <button
        type="button"
        class="el-dialog__headerbtn"
        style="top: 9px; right: 5px; "
        @click="close"
      >
        <em class="el-dialog__close el-icon el-icon-close" />
      </button>
      <button
        type="button"
        class="el-dialog__headerbtn"
        style="top: 9px; right: 25px; "
        @click="save"
      >
        <em class="el-dialog__close el-icon el-icon-check" />
      </button>
    </template>
    <js-editor ref="jsonEditor" v-model="value" />
  </rubik-dialog>
</template>

<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import JsEditor from '@/components/JsEditor'
export default {
  name: 'ExprEditor',
  components: { RubikDialog, JsEditor },
  data() {
    return {
      left: 0,
      top: 0,
      callback: undefined
    }
  },
  methods: {
    close() {
      this.$refs.dialog.close()
    },
    save() {
      this.callback && this.callback(this.value)
    }
  }
}
</script>

<style>
.rubik-color-picker {
  z-index: 65534;
}
</style>
