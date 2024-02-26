
<template>
  <div :class="['property', typeName]">
    <div v-if="showLabel" class="label" @dblclick="dblclk()">{{ label }}</div>
    <div class="field" :style="!showLabel ? { width: '100%', maxWidth: '100%', minWidth: '100%' } : {} ">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Property',
  props: {
    typeName: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    dblclk() {
      this.$emit('cptDblClk')
    }
  }
}
</script>
