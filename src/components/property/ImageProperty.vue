
<template>
  <property :label="label">
    <input
      :class="['input', 'Input']"
      :style="cusStyle"
      :name="name"
      :value="value"
      :readonly="true"
      style="width: calc(100% - 24px);"
      autoComplete="off"
      @change="handleChange"
    />
    <div class="el-upload el-upload--text">
      <i
        slot="prefix"
        class="el-icon-more"
        style="font-size:18px; cursor: pointer;"
        @click="more"
      />
    </div>
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'ImageProperty',
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
    more(e) {
      this.$emit('more', e)
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
