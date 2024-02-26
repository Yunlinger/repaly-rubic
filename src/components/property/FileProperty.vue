
<template>
  <property :label="label" @cptDblClk="cptDblClk">
    <input
      :class="['input', 'Input']"
      :style="cusStyle"
      :name="name"
      :value="value"
      style="width: calc(100% - 36px);"
      autoComplete="off"
      @change="handleChange"
      @dblclick="upload('input' + name)"
    />
    <div class="el-upload el-upload--text">
      <i class="el-icon-upload" style="font-size: 18px; margin: 0px;" @click="upload('input' + name)" />
      <input
        :ref="'input' + name"
        type="file"
        :name="name"
        :accept="accept || '.png'"
        class="el-upload__input"
        @change="fileChange"
      >
      <i
        slot="prefix"
        class="el-icon-download"
        style="font-size:18px; margin-top:5px; cursor: pointer;"
        @click="download"
      />
    </div>
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'FileProperty',
  components: { Property },
  props: {
    className: {
      type: String,
      default: ''
    },
    cusStyle: {
      type: Object,
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    onChange: {
      type: Function,
      default: null
    },
    accept: {
      type: String,
      default: '.png'
    }
  },
  methods: {
    handleChange(e) {
      this.$emit('input', e.target.value)
      if (this.onChange) {
        this.onChange(e.target.value, this.name, e)
      }
    },
    upload(ref) {
      this.$refs[ref].click()
    },
    fileChange(e) {
      if (!e.target.files || e.target.files.length < 1) {
        return
      }
      let attrName = e.target.name
      let file = e.target.files[0]
      this.$emit('upload', attrName, file, e)
    },
    download(e) {
      this.$emit('download', e)
    },
    cptDblClk() {
      this.$emit('cptDblClk')
    }
  }
}
</script>

<style lang="scss" scopped>
.Input {
    width: 100%;
    margin: 1px 0;
    padding: 0 2px;
    border: none;
    box-sizing: border-box;
    vertical-align: top;
    line-height: 18px;
}

.file {
  width: 100px;
}

.Input.hidden {
  display: none;
}

input:focus, textarea:focus {
  outline: none;
}
</style>
