<template>
  <div :id="ztreeId" class="ztree" />
</template>

<script>
import '@ztree/ztree_v3/js/jquery.ztree.all'
import '@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css'

export default {
  props: {
    setting: {
      type: Object,
      require: false,
      default: function() {
        return {}
      }
    },
    nodes: {
      type: Array,
      require: true,
      default: function() {
        return []
      }
    },
    beforeRemove: {
      type: Function,
      require: false,
      default: null
    },
    beforeRename: {
      type: Function,
      require: false,
      default: null
    },
    beforeDrop: {
      type: Function,
      require: false,
      default: null
    }
  },
  data() {
    return {
      ztreeId: 'ztree_' + parseInt(Math.random() * 1e10),
      ztreeObj: null,
      list: [],
      ztreeSetting: {
        view: {
          showIcon: false // default to hide icon
        },
        callback: {
          onAsyncError: (...arg) => {
            this.$emit('onAsyncError', ...arg)
          },
          onAsyncSuccess: (...arg) => {
            this.$emit('onAsyncSuccess', ...arg)
          },
          onCheck: (...arg) => {
            this.$emit('onCheck', ...arg)
          },
          onClick: (...arg) => {
            this.$emit('onClick', ...arg)
          },
          onCollapse: (...arg) => {
            this.$emit('onCollapse', ...arg)
          },
          onDblClick: (...arg) => {
            this.$emit('onDblClick', ...arg)
          },
          onDrag: (...arg) => {
            this.$emit('onDrag', ...arg)
          },
          onDragMove: (...arg) => {
            this.$emit('onDragMove', ...arg)
          },
          onDrop: (...arg) => {
            this.$emit('onDrop', ...arg)
          },
          onExpand: (...arg) => {
            this.$emit('onExpand', ...arg)
          },
          onMouseDown: (...arg) => {
            this.$emit('onMouseDown', ...arg)
          },
          onMouseUp: (...arg) => {
            this.$emit('onMouseUp', ...arg)
          },
          onRemove: (...arg) => {
            this.$emit('onRemove', ...arg)
          },
          onRename: (...arg) => {
            this.$emit('onRename', ...arg)
          },
          onRightClick: (...arg) => {
            this.$emit('onRightClick', ...arg)
          },
          beforeRename: (...arg) => {
            return this.beforeRename && this.beforeRename(...arg)
          },
          beforeRemove: (...arg) => {
            return this.beforeRemove && this.beforeRemove(...arg)
          },
          beforeDrop: (...arg) => {
            return this.beforeDrop && this.beforeDrop(...arg)
          }
        }
      }
    }
  },
  watch: {
    nodes: {
      handler: function(nodes) {
        this.list = nodes
        // update tree
        if (this.ztreeObj) {
          this.ztreeObj.destroy()
        }
        this.$nextTick(() => {
          // eslint-disable-next-line
          this.ztreeObj = $.fn.zTree.init(
            // eslint-disable-next-line
            $('#' + this.ztreeId),
            Object.assign({}, this.ztreeSetting, this.setting),
            this.list
          )
          this.$emit('onCreated', this.ztreeObj)
        })
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    getCheckedNodes() {
      return this.ztreeObj && this.ztreeObj.getCheckedNodes(true)
    }
  }
}
</script>

<style scoped>
  .ztree {
    height: 100%;
    width: 100%;
  }
  .ztree li a input.rename {
    width: "160px";
    height: "16px";
  }
</style>
