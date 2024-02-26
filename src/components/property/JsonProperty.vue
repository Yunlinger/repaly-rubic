
<template>
  <property :label="label" :showLabel="false">
    <js-editor
      :class="['input', 'Input']"
      :value="JSON.stringify(value, null, 2)"
      style="height: 360px;"
      @change="handleChange"
    />
  </property>
</template>

<script>
import Property from './Property'
import JsEditor from '@/components/JsEditor'
export default {
  name: 'TextProperty',
  components: { Property, JsEditor },
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
    multiline: {
      type: Boolean,
      default: false
    },
    onChange: {
      type: Function,
      default: null
    }
  },
  methods: {
    handleChange(nv) {
      let v = JSON.parse(nv)
      this.$emit('input', v)
      if (this.onChange) {
        if (v) {
          this.onChange(v, this.name)
        }
      }
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

.Input.hidden {
  display: none;
}

input:focus, textarea:focus {
  outline: none;
}
</style>
