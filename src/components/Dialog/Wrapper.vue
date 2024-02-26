<template>
  <transition
    name="dialog-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      v-show="visible"
      ref="dialog"
      v-dialogdragresize
      :aria-label="title || 'dialog'"
      :class="[{'is-fullscreen': fullscreen, 'el-dialog--center': center }, customClass]"
      class="el-dialog rubik-dialog"
      :style="style"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      @mousedown="handleDialogClick"
      @keydown="keydown"
    >
      <div
        class="el-dialog__header rubik-dialog__header"
        style="height: 34px; padding: 4px; background: lightgrey; display: flex; justify-content: space-between; width: 100%;"
      >
        <slot name="title">
          <span class="el-dialog__title rubik-dialog__title">
            {{ title }}
          </span>
        </slot>
        <div style="display:flex; justify-content: flex-end;">
          <slot name="buttons">
            <button
              v-if="showClose"
              type="button"
              class="rubik-headerbtn"
              aria-label="Close"
              @click="close"
            >
              <em class="el-dialog__close el-icon el-icon-close" />
            </button>
          </slot>
        </div>
      </div>
      <div class="el-dialog__body rubik-dialog__body" style="padding: 2px;">
        <slot />
      </div>
      <div v-if="$slots.footer" class="el-dialog__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </transition>
</template>
<script>
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import '@/directive/dialogDragResize'
export default {
  name: 'RubikDialog',
  props: {
    title: {
      type: String,
      default: 'dialog'
    },
    width: {
      type: String,
      default: '50vw'
    },
    height: {
      type: String,
      default: '50vh'
    },
    left: {
      type: String,
      default: '25vw'
    },
    right: {
      type: String,
      default: ''
    },
    top: {
      type: String,
      default: '15vh'
    },
    beforeClose: {
      type: Function,
      default: null
    },
    center: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showClose: true,
      fullscreen: false,
      customClass: '',
      visible: true,
      onClose: null,
      closed: false
    }
  },

  computed: {
    style() {
      const style = {}
      if (!this.fullscreen) {
        if (this.width) {
          style.width = this.width
        }
        if (this.height) {
          style.height = 'calc(' + this.height + ' + 34px)'
        }
        if (!this.center) {
          style.top = this.top
          if (this.right) {
            style.left = 'calc(100vw - ' + this.width + ' - ' + this.right + ')'
          } else if (this.left) {
            style.left = this.left
          }
        } else {
          style.top = 'calc(50vh - ' + (style.height) + ' / 2 )'
          style.left = 'calc(50vw - ' + (style.width) + ' / 2 )'
        }
        style.position = 'fixed'
      }
      return style
    }
  },

  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false
      }
    }
  },

  methods: {
    close() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
      this.$emit('closed')
    },
    keydown(e) {
      if (e.keyCode === 27) { // esc关闭消息
        if (!this.closed) {
          this.close()
        }
        e.preventDefault()
      }
    },
    afterEnter() {
      this.$emit('opened')
    },
    afterLeave() {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },
    handleDialogClick() {
      // 设置当前窗口在上层
      this.$parent.$el.style.zIndex = PopupManager.nextZIndex()
      this.$el.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.rubik-dialog__body {
  padding: 2px;
  height: calc(100% - 34px);
  overflow: hidden;
  position: relative;
}
.rubik-dialog__title {
  font-size: 14px;
}

.rubik-headerbtn {
  display: inline-block;
  position: relative;
  top: 0;
  right: 0;
  padding: 4px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  color: #909399;

  :hover {
    color:#409EFF
  }
}

</style>
