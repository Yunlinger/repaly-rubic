<template>
  <transition
    name="el-message-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      v-show="visible"
      ref="dialog"
      v-dialogdragresize
      :aria-label="fileName || 'dialog'"
      :class="[{ 'is-fullscreen': fullscreen, 'el-dialog--center': center }, customClass]"
      :style="style"
      class="el-dialog rubik-dialog"
      role="dialog"
      aria-modal="true"
      @mousedown="active"
    >
      <div class="el-dialog__header rubik-dialog__header" :class="[{ 'active': beActive, 'deactive': !beActive }]">
        <slot name="fileName">
          <span class="el-dialog__title" style="font-size: 12px;">{{ loaded?fileName:`${fileName} ...` }}</span>
        </slot>
        <button
          type="button"
          class="el-dialog__headerbtn"
          aria-label="Close"
          style="top: 5px; right: 5px; "
          @click="close"
        >
          <i class="el-dialog__close el-icon el-icon-circle-close" />
        </button>
      </div>
      <div class="el-dialog__body rubik-dialog__body">
        <canvas :id="id" width="100%" height="100%" />
      </div>
    </div>
  </transition>
</template>
<script type="text/babel">
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import '@/directive/dialogDragResize'
import fabric from '@/canvas'
import '../../dynamic'
import msg from '@/utils/message'

export default {
  name: 'Dialog',
  data() {
    return {
      id: '',
      canvas: null,
      fileName: '',
      param: {},
      selected: null,
      appendToBody: false,
      lockScroll: true,
      closeOnPressEscape: true,
      showClose: true,
      width: '80px',
      height: '120px',
      left: '10vh',
      top: '15vh',
      fullscreen: false,
      customClass: '',
      beforeClose: null,
      center: false,
      visible: false,
      duration: 200,
      iconClass: '',
      onClose: null,
      deactiveAll: null,
      closed: false,
      timer: null,
      dangerouslyUseHTMLString: false,
      beActive: false,
      loaded: false
    }
  },

  computed: {
    style() {
      const style = {}
      if (!this.fullscreen) {
        style.top = this.top + 'px'
        if (this.width) {
          style.width = this.width
        }
        if (this.height) {
          style.height = this.height
        }
        if (this.left) {
          style.left = this.left + 'px'
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

  beforeDestroy() {
    this.canvas.clear()
    this.canvas.dispose()
    document.removeEventListener('keydown', this.keydown)
  },

  mounted() {
    document.addEventListener('keydown', this.keydown)
  },

  methods: {
    close() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    },
    keydown(e) {
      if (e.keyCode === 27) { // esc关闭消息
        if (!this.closed) {
          this.close()
        }
      }
    },
    afterEnter() {
      this.$emit('opened')
      this.active()
      this.openMMI()
    },
    afterLeave() {
      this.canvas && this.canvas.fire('canvas:destroyed')
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },
    active() {
      if (!this.beActive) {
        this.deactiveAll && this.deactiveAll()
        this.$el.style.zIndex = PopupManager.nextZIndex()
        this.beActive = true
      }
    },
    deactive() {
      this.beActive = false
    },
    openMMI() {
      this.canvas = new fabric.RunCanvas(this.id)
      if (this.fileName) {
        this.canvas.open(this.fileName).then(() => {
          this.canvas.calcParam({ ...this.canvas.param, ...this.param })
          this.canvas.initDynamic()
          this.canvas.initTimer()
          this.canvas.running = true
          const width = Number(this.canvas.header.width) || 100
          const height = Number(this.canvas.header.height) || 200
          this.canvas.setWidth(width)
          this.canvas.setHeight(height)
          this.width = (width) + 'px'
          this.height = (height + 24) + 'px'
          if (this.center) {
            this.left = Math.max((window.innerWidth - width) / 2, 0)
            this.top = Math.max((window.innerHeight - height) / 2, 0)
          }
          if (this.left + width > window.innerWidth) {
            this.left = Math.max(window.innerWidth - width - 8, 0)
          }
          if (this.top + height + 24 > window.innerHeight) {
            this.top = Math.max(window.innerHeight - height - 24 - 8, 0)
          }
          this.loaded = true
        }).catch((err) => {
          msg.error(`FileName: ${this.fileName}, \r\n ${err}`, '打开面板错误')
          this.close()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rubik-dialog {
  border-radius: 4px;
}
.rubik-dialog__header {
  padding: 2px;
  height: 24px;
}
.active {
  background: linear-gradient(to right, rgb(53, 123, 177), lightgrey);
}
.deactive {
  background: linear-gradient(to right, grey, lightgrey);
}
.rubik-dialog__body {
  padding: 0px;
  height: calc(100% - 24px);
  overflow: hidden;
  position: relative;
}
</style>
