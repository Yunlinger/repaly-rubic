
<template>
  <property :label="label">
    <input
      :class="['input', 'Input']"
      :style="cusStyle"
      :name="name"
      :value="value"
      autoComplete="off"
      type="number"
      @input="handleChange"
    />
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'NumberProperty',
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
      type: Number,
      default: 0
    },
    onChange: {
      type: Function,
      default: null
    }
  },
  methods: {
    handleChange(e) {
      this.$emit('input', parseFloat(e.target.value))
      if (this.onChange) {
        this.onChange(parseFloat(e.target.value), this.name, e)
      }
    }
  }
}
</script>

<style lang="scss" scopped>
.Input {
    width: 100%;
    font: 12px 'Microsoft YaHei';
    margin: 1px 0;
    padding: 0 2px;
    border: none;
    box-sizing: border-box;
    vertical-align: top;
    line-height: 18px;
}

.Input.hidden {
  display: none;
}

input:focus, textarea:focus {
  outline: none;
}
</style>
