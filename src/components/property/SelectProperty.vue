
<template>
  <property :label="label" class="select-editable" @cptDblClk="cptDblClk">
    <select
      :class="['select', 'Select']"
      :style="cusStyle"
      :name="name"
      :value="value"
      :disabled="disabled"
      @change="handleChange"
    >
      <template v-for="(option, idx) in options">
        <template>
          <option :key="idx" :value="option.hasOwnProperty('value') ? option.value : option">
            {{ option.hasOwnProperty('text') ? option.text : option }}
          </option>
        </template>
      </template>
    </select>
    <input v-if="showInput" type="input" name="format" :value="value" @change="handleChange" />
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'SelectProperty',
  components: { Property },
  props: {
    page: {
      type: Object,
      default: null
    },
    className: {
      type: String,
      default: ''
    },
    cusStyle: {
      type: Object,
      default: null
    },
    options: {
      type: Array,
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
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showInput: {
      type: Boolean,
      default: false
    },
    onChange: {
      type: Function,
      default: null
    }
  },
  methods: {
    handleChange(e) {
      this.$emit('input', e.target.value)
      if (this.onChange) {
        this.onChange(e.target.value, this.name, e)
      }
    },
    cptDblClk() {
      let path = this.page.activeObj.action.mousedown.pic
      let type = this.page.activeObj.action.mousedown.act
      if (path && (type === 'openWindow' || type === 'openPad')) {
        this.$router.push('/engineer/mmi/edit/' + encodeURIComponent(path))
        // this.$router.push(`/engineer/mmi/edit/${path}`)
      }
    }
  }
}
</script>

<style lang="scss" scopped>
.select-editable {
  position:relative;
  background-color:white;
  width:100%;
  height:20px;
}
.select-editable select {
  position:absolute;
  top:0px;
  left:0px;
  font-size:8px;
  border:none;
  width:100%;
  margin:0;
}
.select-editable input {
  position:absolute;
  top: 0px;
  left: 0px;
  width: calc(100% - 20px);
  padding: 1px;
  font-size: 8px;
  border: none;
}
.select-editable select:focus, .select-editable input:focus {
  outline:none;
}

</style>
