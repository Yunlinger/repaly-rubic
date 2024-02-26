
<template>
  <property :label="label" :showLabel="showLabel">
    <textarea
      v-if="multiline"
      :class="['input', 'Input']"
      :style="cusStyle"
      :name="name"
      :value="value"
      autoComplete="off"
      wrap="off"
      rows="6"
      @input="handleChange"
    />
    <input
      v-else
      :class="['input', 'Input']"
      :style="cusStyle"
      :name="name"
      :value="value"
      autoComplete="off"
      @input="handleChange"
    />
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'TextProperty',
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
    multiline: {
      type: Boolean,
      default: false
    },
    onChange: {
      type: Function,
      default: null
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleChange(e) {
      this.$emit('input', e.target.value)
      if (this.onChange) {
        this.onChange(e.target.value, this.name, e)
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
