<template>
  <el-form v-if="entity" label-width="56px" size="mini">
    <el-form-item v-for="attr in attrs" :key="attr.name" :label="attr.label" style="width:176px;">
      <template v-if="attr.type=='text'">
        <el-input v-model="value[attr.name]" @change="valueChange(attr.name, value[attr.name])" />
      </template>
      <template v-else-if="attr.type=='number'">
        <el-input-number
          v-model="value[attr.name]"
          :step="attr.step"
          :min="attr.min"
          :max="attr.max"
          @change="valueChange(attr.name, value[attr.name])"
        />
      </template>
      <template v-else-if="attr.type=='select'">
        <el-select
          v-model="value[attr.name]"
          @change="valueChange(attr.name, value[attr.name])"
        >
          <el-option
            v-for="item in attr.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
      <template v-else-if="attr.type=='color'">
        <el-color-picker
          v-model="value[attr.name]"
          :show-alpha="attr.alpha"
          color-format="rgb"
          @change="valueChange(attr.name, value[attr.name])"
        />
      </template>
      <template v-else-if="attr.type=='bool'">
        <el-switch v-model="value[attr.name]" @change="valueChange(attr.name, value[attr.name])" />
      </template>
      <template v-else-if="attr.type=='expr'">
        <el-button-group>
          <el-button icon="el-icon-edit" @click="openExprEditor(attr, value[attr.name])"></el-button>
          <el-button v-if="value[attr.name]" icon="el-icon-delete" @click="valueChange(attr.name, null)"></el-button>
        </el-button-group>
      </template>
      <template v-else-if="attr.type=='file'">
        <el-input v-model="value[attr.name]" @change="valueChange(attr.name, value[attr.name])" @focus="uploadKey = attr.name">
          <el-upload
            slot="suffix"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadFile"
            accept=".png"
            action=""
          >
            <i class="el-icon-upload" style="font-size:18px; margin-top:5px;" @click="uploadKey = attr.name" />
          </el-upload>
        </el-input>
      </template>
    </el-form-item>
  </el-form>
</template>
<script>
import * as res from '@/api/res'
import expr from '../ExprEditor'
export default {
  name: 'PropEdit',
  props: {
    attrs: {
      type: Array,
      required: true
    },
    entity: {
      type: Object,
      default: () => null
    }
  },
  event: 'change',
  data() {
    return {
      value: {},
      uploadKey: ''
    }
  },
  watch: {
    attrs: function() {
      this.initValue()
    },
    entity: function() {
      this.initValue()
    }
  },
  methods: {
    initValue() {
      var val = {}
      if (this.attrs && this.entity) {
        for (var i = 0, iLen = this.attrs.length; i < iLen; i++) {
          val[this.attrs[i].name] = this.entity[this.attrs[i].name]
        }
      }
      this.value = val
    },
    optionSelected(index, name, value) {
      if (Array.isArray(this.$props.entity[name]) && this.$props.entity[name].indexOf(value)) {
        return true
      }
      if (this.$props.entity && this.$props.entity[name] && this.$props.entity[name] === value) {
        return true
      } else if (!this.$props.entity && index === 0) {
        return true
      }
      return false
    },
    valueChange(key, value) {
      this.$emit('change', { key, value })
    },
    openExprEditor(attr, dyn) {
      expr({
        attr: attr,
        dyn: dyn,
        callback: this.valueChange
      })
    },
    beforeUpload(file) {
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isPNG) {
        this.$msg.error('上传图片只能是 PNG 格式!')
        return false
      } else if (!isLt2M) {
        this.$msg.error('上传图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    uploadFile(param) {
      const fd = new FormData()
      fd.append('file', param.file)
      res.write('image/' + param.file.name, fd).then(res => {
        if (typeof res === 'string') {
          res = JSON.parse(res)
        }
        this.$emit('change', { key: this.uploadKey, value: res.path.substring(6) })
      })
    }
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 2px;
}
</style>
