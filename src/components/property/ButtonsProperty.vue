
<template>
  <property :label="label">
    <template v-for="(btn, idx) in buttons">
      <template>
        <button
          :key="idx"
          :class="['button', 'Button']"
          :style="cusStyle"
          type="button"
          @click="btn.callback"
        >
          {{ btn.caption }}
        </button>
      </template>
    </template>
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'ButtonsProperty',
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
    buttons: {
      type: Array,
      default: null
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
