
<template>
  <property :label="label" @cptDblClk="cptDblClk">
    <input
      :class="['input', 'Input', 'static']"
      :style="cusStyle"
      :name="name"
      :value="value"
      :readonly="true"
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
      type: [String, Number],
      default: ''
    }
  },
  methods: {
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

.static {
  background-color: #f0f0f0;
}

.Input.hidden {
  display: none;
}

input:focus, textarea:focus {
  outline: none;
}
</style>
