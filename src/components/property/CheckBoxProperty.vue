
<template>
  <property :label="label">
    <input
      :class="['checkbox', 'Checkbox']"
      :style="cusStyle"
      :name="name"
      :checked="value"
      autoComplete="off"
      type="checkbox"
      @change="handleChange"
    />
  </property>
</template>

<script>
import Property from './Property'
export default {
  name: 'CheckBoxProperty',
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
      this.$emit('input', e.target.checked)
      if (this.onChange) {
        this.onChange(e.target.checked, this.name, e)
      }
    }
  }
}
</script>

<style lang="scss" scopped>
.CheckBox {
    width: 20px;
    height: 20px;
    margin: 0;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAvSURBVDhPYxg6oKur6z8lGGoMAoAEyQWjBkLAqIEkgVEDIWCEGkgJhhoz6AEDAwCX46nq5LTHtAAAAABJRU5ErkJggg==);
    display: inline-block;
    -webkit-appearance: none;
    cursor: pointer;
}

.CheckBox.checked {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACYSURBVDhP1YxRCoMwEERzp9ZL1RO156i306QuTJg1jpHFH/vgQXSHl/6Hx7uUKyJD1CgiMkSNIiJD1CgiMkSNznx9+UaG+OGZw6eUedn+Q4b4Y08VM5Eh7UD5XF2yviFD6mGc9uNqPoiZyBB/NPy32YuZyJB24KP+fSQyRI0q6taKDFGjiMgQNYqIDFGjiMgQNYqIzO1J6Qc9ntav8Xl7ewAAAABJRU5ErkJggg==);
}

.CheckBox.disabled {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAvSURBVDhPYxg64PXr1/8pwVBjEAAkSC4YNRACRg0kCYwaCAEj1EBKMNSYQQ8YGACTLe4e+yPbzQAAAABJRU5ErkJggg==);
    cursor: default;
}

.CheckBox.checked.disabled {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABkSURBVDhP5dBBCsAgDADB/P+rviCXWFYsLaGNYi6VLgREdARln0opNTOduWJztZ+AZlZVta3TINj9fAr0GC2DTxiF4PkvvjeMQpD8xQijIUjRA74pkNgbYTQNzrYxmJnOfD6RAzbN65BiZNB7AAAAAElFTkSuQmCC);
}
</style>
