<template>
  <transition
    name="el-message-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      v-show="visible"
      ref="dialog"
      :style="style"
      class="el-dialog rubik-dialog"
      role="dialog"
      aria-modal="true"
      @contextmenu="handleContextMenu"
      @click="handleDialogClick"
    >
      <div class="el-dialog__body rubik-dialog__body" style="padding: 0;">
        <el-menu :default-active="activeIndex" mode="vertical">
          <el-menu-item
            v-if="param.check"
            :key="param.check.name"
            style="height: 24px; line-height: 24px;"
            @click="param.check.callback(); close()"
          >
            {{ "检查" }}
          </el-menu-item>
          <el-divider
            v-if="(param.check && param.vars && param.vars.length)"
            :key="param.check.name + '____'"
            style="margin: 2px 0;"
          >
          </el-divider>
          <template v-for="item in param.vars">
            <template>
              <el-menu-item
                :key="item.caption"
                style="height: 24px; line-height: 24px;"
                @click="item.callback(); close()"
              >
                {{ item.caption }}
              </el-menu-item>
            </template>
          </template>
        </el-menu>
      </div>
    </div>
  </transition>
</template>
<script type="text/babel">
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import * as rapi from '@/api/rtdb'

export default {
  name: 'Dialog',
  data() {
    return {
      id: '',
      param: {},
      selected: null,
      appendToBody: false,
      lockScroll: true,
      closeOnPressEscape: true,
      showClose: true,
      width: 'auto',
      height: 'auto',
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
      dangerouslyUseHTMLString: false,
      activeIndex: null
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
    },
    afterEnter() {
      this.$emit('opened')
      for (let item of this.param.vars) {
        if (item.vname) {
          rapi.varGetDetail(item.vname).then(res => {
            res = res || {}
            item.caption = `${item.pre}  ${res.desc || item.vname}`
          }).catch(() => {})
        }
      }
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
    handleContextMenu(e) {
      e.preventDefault()
      return false
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

.el-divider--horizontal {
  margin: 4px 0;
}
</style>
