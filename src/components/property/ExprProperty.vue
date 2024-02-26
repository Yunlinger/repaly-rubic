
<template>
  <property :label="label">
    <div
      :class="['input', 'Input']"
      :style="{'user-select': 'none', 'cursor': 'pointer', 'min-height': '16px' }"
      @click="openExprEditor"
    >
      {{ (value && value.useScript) ? 'script' : (value && value.exprs && value.exprs.length > 0 &&value.exprs[0].expr) }}
    </div>
  </property>
</template>

<script>
import Property from './Property'
import expr from '@/components/ExprEditor'
export default {
  name: 'ExprProperty',
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
      type: Object,
      default: null
    },
    config: {
      type: Object,
      default: null
    },
    onChange: {
      type: Function,
      default: null
    }
  },
  methods: {
    openExprEditor(e) {
      expr({
        left: e.clientX - 676,
        top: e.clientY - 5,
        attr: this.config,
        dyn: this.value,
        callback: (n, v) => {
          this.$emit('input', v)
          this.onChange && this.onChange(v, n)
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
