
<template>
  <property :label="label">
    <div
      :class="['input', 'Input']"
      :style="{background: value, 'user-select': 'none', 'cursor': 'pointer', 'min-height': '16px' }"
      @click="pickColor"
    >
      {{ value }}
    </div>
  </property>
</template>

<script>
import Property from './Property'
import cp from '@/components/ColorPicker'
export default {
  name: 'ColorProperty',
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
      type: [String, Object],
      default: ''
    },
    onChange: {
      type: Function,
      default: null
    }
  },
  methods: {
    pickColor(e) {
      cp({
        color: this.value,
        left: e.clientX - 220,
        top: e.clientY - 5,
        callback: (c) => {
          this.$emit('input', c)
          this.onChange && this.onChange(c, this.name)
        }
      })
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
