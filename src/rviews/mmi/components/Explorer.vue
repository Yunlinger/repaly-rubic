<template>
  <div class="icons-container" @click="selectItem(null)" @contextmenu.prevent="onContextmenu">
    <div class="icons-wrapper">
      <div v-for="item of items" :key="(item.isdir?'dir__':'pic__') + item.name">
        <div
          :class="(item === selectedItem) ? 'icon-item selected' : 'icon-item'"
          :draggable="(!item.isdir) ? 'true' : 'false'"
          :title="item.name"
          @dragstart="dragstart(item, $event)"
          @dragend="dragend(item, $event)"
          @click.prevent="click(item, $event)"
          @contextmenu="selectItem(item)"
        >
          <template>
            <em
              v-if="item.isdir"
              style="height: 40px;"
              :class="item.name == '..' ? 'el-icon-back' : 'el-icon-folder'"
            />
            <div v-else :style="getPngIconStyle(item)" />
          </template>
          <span class="caption">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUrl } from '@/api/res'
export default {
  name: 'Explorer',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      menuVisable: false,
      top: 0,
      left: 0,
      selectedItem: null,
      copied: false
    }
  },
  watch: {
    items: {
      deep: true,
      handler: function(newValue) {
        this.selectItem(null)
      }
    }
  },
  events: ['item-click', 'newfile', 'newdir'],
  methods: {
    click(item, event) {
      this.selectItem(item)
      this.$emit('item-click', item, event)
      event.preventDefault()
    },
    newFile(event) {
      this.$emit('newfile', event)
    },
    copyItem(event) {
      this.$emit('copyItem', this.selectedItem, event)
      this.copied = true
    },
    pasteItem(event) {
      this.$emit('pasteItem', this.selectedItem, event)
    },
    renameFile(event) {
      this.$emit('renamefile', this.selectedItem, event)
    },
    newDir(event) {
      this.$emit('newdir', event)
    },
    refresh(event) {
      this.$emit('refresh', event)
    },
    remove(event) {
      this.$emit('remove', this.selectedItem, event)
    },
    copyPath(event) {
      this.$emit('copyPath', this.selectedItem, event)
    },
    release(event) {
      if (this.selectedItem) {
        this.$emit('release', [this.selectedItem], event)
      } else {
        this.$emit('release', this.items, event)
      }
    },
    selectItem(item) {
      this.selectedItem = item
    },
    dragstart(item, event) {
      console.log('dragstart: ', item, event)
      event.dataTransfer.setData('text/plain', JSON.stringify({ url: item.url }))
    },
    dragend(item, event) {
      console.log('dragend: ', item, event)
    },
    getPngIconStyle(item) {
      const iconUrl = getUrl(`mmi/${item.url}.png`)
      return {
        display: 'inline-block',
        width: '60px',
        height: '40px',
        'border-radius': '4px',
        'border-style': 'solid',
        'border-width': '1px',
        'border-color': '#E0E0E0',
        background: 'url("' + iconUrl + '") no-repeat center  center',
        'background-size': 'contain'
      }
    },
    onContextmenu(event) {
      this.$contextmenu({
        items: [
          {
            label: '刷新(R)', icon: 'el-icon-refresh', divided: true, disabled: false,
            onClick: () => { this.refresh() }
          },
          {
            label: '新建画面(N)', icon: 'el-icon-document-add', divided: false, disabled: false,
            onClick: () => { this.newFile() }
          },
          {
            label: '复制画面', icon: 'el-icon-document-copy', divided: false, disabled: !this.selectedItem || this.selectedItem.isdir,
            onClick: () => { this.copyItem() }
          },
          {
            label: '粘贴画面', icon: 'el-icon-document-add', divided: false, disabled: !this.copied,
            onClick: () => { this.pasteItem() }
          },
          {
            label: '重命名(M)', icon: 'el-icon-edit', divided: true, disabled: !this.selectedItem || this.selectedItem.isdir,
            onClick: () => { this.renameFile() }
          },
          {
            label: '新建目录(N)', icon: 'el-icon-folder-add', divided: true, disabled: false,
            onClick: () => { this.newDir() }
          },
          {
            label: '删除(D)', icon: 'el-icon-delete', divided: true, disabled: false,
            onClick: () => { this.remove() }
          },
          {
            label: '画面路径', icon: 'el-icon-link', divided: false, disabled: !this.selectedItem || this.selectedItem.isdir,
            onClick: () => { this.copyPath() }
          },
          {
            label: '发布', icon: 'el-icon-finished', divided: false, disabled: false,
            onClick: () => { this.release() }
          }
        ],
        event,
        zIndex: 12003,
        minWidth: 148
      })
      return false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.icons-container {
  margin: 0px;
  overflow: auto;
  min-height: 320px;
  height: 100%;
  .icons-wrapper {
    margin: 0 auto;
  }
  .icon-item {
    margin: 4px;
    height: 80px;
    text-align: center;
    width: 62px;
    float: left;
    font-size: 25px;
    color: #24292e;
    cursor: pointer;
    border-radius: 4px;
    .caption {
      display: block;
      margin-top: -12px;
      font-size: 11px;
      line-height: 12px;
      font-weight: bold;
      width: 100%;
      word-wrap: break-word;
      white-space: normal;
      user-select: none;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }
  .selected {
    border-style: solid;
    border-width: 1px;
    border-color: hotpink;
  }
  .icon-item:hover{
    background-color: #CCC;
  }
  .disabled{
    pointer-events: none;
  }
}
</style>
