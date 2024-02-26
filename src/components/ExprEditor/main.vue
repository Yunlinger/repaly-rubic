<template>
  <rubik-dialog
    ref="dialog"
    :title="'动态配置 ' + (attr && attr.label)"
    :center="true"
    width="800px"
    height="600px"
  >
    <template #buttons>
      <input
        v-if="dyn"
        v-model="dyn.useScript"
        class="el-dialog__headerbtn"
        style="top: 9px; right: 65px; "
        autoComplete="off"
        type="checkbox"
      />
      <button
        v-show="dyn && !dyn.useScript"
        type="button"
        class="el-dialog__headerbtn"
        style="top: 9px; right: 35px; "
        @click="addExpr"
      >
        <i class="el-dialog__close el-icon el-icon-plus" />
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
    <code-editor
      v-if="dyn && dyn.useScript"
      v-model="dyn.script"
      style="height: 100%; width: 100%"
    />
    <el-table
      v-if="!(dyn && dyn.useScript)"
      :data="dyn && dyn.exprs"
      :cell-style="{ padding: '0px' }"
      :header-cell-style="{ padding: '0px' }"
      border
      fit
      highlight-current-row
      style="height: 100%; overflow: auto;"
    >
      <el-table-column align="left" label="条件">
        <template slot-scope="scope">
          <code-editor v-model="scope.row.expr" mode="javascript" style="height: 48px;" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="设定属性" width="260">
        <template slot-scope="scope">
          <template v-if="attr.valueType=='text'">
            <el-input v-model="scope.row.value" class="edit-input" size="mini" />
          </template>
          <template v-if="attr.valueType=='textarea'">
            <el-input
              v-model="scope.row.value"
              type="textarea"
              :rows="2"
              class="edit-input"
              size="mini"
            />
          </template>
          <template v-else-if="attr.valueType=='number'">
            <el-input v-model.number="scope.row.value" class="edit-input" size="mini" />
          </template>
          <template v-else-if="attr.valueType=='color'">
            <div
              :style="{background: scope.row.value, 'user-select': 'none', 'cursor': 'pointer', 'min-height': '16px', 'min-width': '32px' }"
              @click="pickColor($event, scope.row)"
            >
              {{ scope.row.value }}
            </div>
          </template>
          <template v-else-if="attr.valueType=='bool'">
            <el-checkbox v-model="scope.row.value" class="edit-input" size="mini" />
          </template>
          <template v-else-if="attr.valueType=='image'">
            <div style="display: flex; align-items: center; justify-content: space-between; height: 48px;">
              <el-input v-model="scope.row.value" class="edit-input" size="mini" style="width: 70%;" />
              <div
                style="padding: 0px; margin: 0px; width: 48px; height: 48px; cursor: pointer;"
                @click="selImage(scope.row.value, imgName => { scope.row.value = imgName })"
              >
                <el-popover
                  placement="right"
                  trigger="hover"
                >
                  <img :src="getUrl(scope.row.value)" style="max-width: 256px; max-height: 256px;" />
                  <div slot="reference" :style="getImageStyle(scope.row.value)"></div>
                </el-popover>
              </div>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="删除" width="64">
        <template slot-scope="scope">
          <i type="danger" class="el-icon-delete" size="mini" @click="removeItem(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </rubik-dialog>
</template>

<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import CodeEditor from '@/components/CodeEditor'
import cp from '@/components/ColorPicker'
import { getUrl } from '@/api/res'
import ImageSelect from '@/components/ImageSelect'
export default {
  name: 'ExprEditor',
  components: { RubikDialog, CodeEditor },
  data() {
    return {
      left: 0,
      top: 0,
      attr: {},
      dyn: {},
      callback: undefined
    }
  },
  watch: {
    dyn: {
      deep: true,
      handler: function(newValue) {
        let dyn = newValue
        this.callback && this.attr && this.callback(this.attr.name, dyn)
      }
    }
  },
  methods: {
    addExpr() {
      this.dyn = this.dyn || {}
      this.dyn.exprs = this.dyn.exprs || []
      this.dyn.exprs.push({
        expr: '`XXXX/1` == ' + (this.dyn.exprs.length + 1),
        value: this.attr.defaultValue
      })
    },
    close() {
      this.$refs.dialog.close()
    },
    removeItem(item) {
      let idx = -1
      for (var i = 0; i < this.dyn.exprs.length; i++) {
        if (this.dyn.exprs[i] === item) {
          idx = i
          break
        }
      }
      if (idx === -1) {
        return
      }
      this.dyn.exprs.splice(idx, 1)
      if (this.dyn.exprs.length === 0) {
        this.dyn = null
      }
    },
    pickColor(e, item) {
      cp({
        color: item.value,
        left: e.clientX - 220,
        top: e.clientY - 5,
        callback: (c) => {
          item.value = c
        }
      })
    },
    getUrl(name) {
      return getUrl(`image/${name}`)
    },
    getImageStyle(name) {
      const iconUrl = getUrl(`image/${name}`)
      return {
        display: 'inline-block',
        width: `48px`,
        height: `48px`,
        'border-radius': '4px',
        'border-style': 'solid',
        'border-width': '1px',
        'border-color': '#E0E0E0',
        'background-image': 'url(' + iconUrl + ')',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-size': 'contain'
      }
    },
    getBigImageStyle(name) {
      var style = this.getImageStyle(name)
      style.width = '256px'
      style.height = '256px'
    },
    selImage(name, callback) {
      console.log('selImage')
      this.$rdialog(ImageSelect, {
        oimg: name,
        callback: callback
      })
    }
  }
}
</script>

<style>
.rubik-color-picker {
  z-index: 65534;
}
</style>
