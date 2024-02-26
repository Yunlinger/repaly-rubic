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
      @click="handleDialogClick"
    >
      <div class="el-dialog__header rubik-dialog__header">
        <slot name="fileName">
          <span class="el-dialog__title">{{ shortFileName }}</span>
        </slot>
        <button
          type="button"
          class="el-dialog__headerbtn"
          aria-label="Close"
          style="top: 2px; right: 2px; "
          @click="close"
        >
          <i class="el-dialog__close el-icon el-icon-close" />
        </button>
      </div>
      <div class="el-dialog__body rubik-dialog__body">
        <canvas :id="id" width="1" height="1" />
      </div>
    </div>
  </transition>
</template>
<script type="text/babel">
import { PopupManager } from 'element-ui/src/utils/popup'
import '@/directive/dialogDragResize'
import fabric from '../../canvas'
import '../../dynamic'
import path from 'path'

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
      width: '20px',
      height: '30px',
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
      closed: false,
      timer: null,
      dangerouslyUseHTMLString: false
    }
  },

  computed: {
    style() {
      const style = {}
      if (!this.fullscreen) {
        style.top = this.top
        if (this.width) {
          style.width = this.width
        }
        if (this.height) {
          style.height = this.height
        }
        if (this.left) {
          style.left = this.left
        }
        style.position = 'fixed'
      }
      return style
    },
    shortFileName() {
      return path.basename(this.fileName)
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
      this.openMMI()
    },
    afterLeave() {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },
    handleDialogClick() {
      // 设置当前窗口在上层
      this.$el.style.zIndex = PopupManager.nextZIndex()
    },
    pxToNum(px) {
      return px.split('px')[0] - 0
    },
    openMMI() {
      this.canvas = new fabric.RubikCanvas(this.id)
      if (this.fileName) {
        this.canvas.open(this.fileName)
          .then(() => {
            this.canvas.calcParam({ ...this.canvas.param, ...this.param })
            this.canvas.initDynamic()
            this.canvas.initTimer()
            this.canvas.running = true
            let width = this.canvas.rwidth || 100
            let height = this.canvas.rheight || 200
            this.width = (width * (window.__zoomX || 1) + 4) + 'px'
            this.height = (height * (window.__zoomY || 1) + 40) + 'px'
            this.canvas.setWidth(width * (window.__zoomX || 1))
            this.canvas.setHeight(height * (window.__zoomY || 1))

            var vpt = this.canvas.viewportTransform.slice(0)
            vpt[0] = (window.__zoomX || 1)
            vpt[3] = (window.__zoomY || 1)
            this.canvas.setViewportTransform(vpt)

            // 修正面板位置
            const _left = this.pxToNum(this.left)
            const _width = this.pxToNum(this.width)
            const _top = this.pxToNum(this.top)
            const _height = this.pxToNum(this.height)
            if (_left + _width > window.innerWidth) {
              this.left = (window.innerWidth - _width - 10) + 'px'
            }
            if (_top + _height > window.innerHeight) {
              this.top = (window.innerHeight - _height - 10) + 'px'
            }
            this.canvas.calcDynamic()
          })
          .catch(err => {
            this.$msg.error(err.toString())
            this.close()
          })
      }
    }
  }
}
</script>

<style>
.rubik-dialog__body {
  padding: 0;
}

.el-rubik-dialog__header {
  padding: 0;
  background: lightgrey;
}
.el-dialog__header {
  padding: 0;
}
</style>
