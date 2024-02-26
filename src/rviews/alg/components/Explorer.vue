<template>
  <div class="icons-container" @contextmenu.prevent="onContextmenu">
    <div class="icons-wrapper">
      <div v-for="item of items" :key="item.name">
        <div
          :class="selItems[item.name] ? 'icon-item selected' : 'icon-item'"
          :draggable="item.isdir ? 'false' : 'true'"
          @dragstart="dragstart(item, $event)"
          @dragend="dragend(item, $event)"
          @click="click(item, $event)"
          @dblclick="dbclick(item, $event)"
          @contextmenu="selectItem(item)"
        >
          <template>
            <em v-if="item.isdir" :class="item.name == '..' ? 'el-icon-back' : 'el-icon-folder'" />
            <div v-else :style="getPngIconStyle(item)" />
          </template>
          <template>
            <span v-if="item.isdir">{{ item.name }}</span>
            <template v-else>
              <div style="margin-top: -12px">
                <span style="font-weight: bold;">{{ item.name }}</span>
                <span>{{ item.name == item.desc ? "" : item.desc }}</span>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/api/res'

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
      selectedItem: null,
      selItems: {},
      top: 0,
      left: 0
    }
  },
  events: ['item-click', 'item-dbclick', 'newfile', 'newdir', 'refresh', 'rename'],
  methods: {
    click(item, event) {
      this.selectItem(item, event)
      this.$emit('item-click', item, event)
    },
    dbclick(item, event) {
      this.selectItem(item, event)
      this.$emit('item-dbclick', item, event)
    },
    newFile(event) {
      this.$emit('newfile', event)
    },
    newDir(event) {
      this.$emit('newdir', event)
    },
    refresh(event) {
      this.$emit('refresh', event)
    },
    manageLib(event) {
      this.$emit('manageLib', event)
    },
    selectItem(item, e) {
      if (e && (e.ctrlKey || e.metaKey)) {
        if (this.selItems[item.name]) {
          this.selItems = { ...this.selItems }
          delete this.selItems[item.name]
        } else {
          this.selItems = { ...this.selItems }
          this.selItems[item.name] = item
        }
      } else {
        if (!this.selItems[item.name]) {
          this.selItems = {}
          this.selItems[item.name] = item
        }
      }
    },
    rename() {
      // 只有一个
      let sel
      for (let key in this.selItems) {
        sel = this.selItems[key]
        break
      }
      this.$emit('rename', sel)
    },
    copy() {
      this.$emit('copy', this.selItems)
    },
    paste() {
      this.$emit('paste')
    },
    del() {
      this.$emit('del', this.selItems)
    },
    dragstart(item, event) {
      let img = new Image()
      img.src = getImageUrl(`icon/${item.image}`, 100)
      event.dataTransfer.setDragImage(img, 0, 0)
      event.dataTransfer.setData('text/plain', JSON.stringify({ alg: item.name }))
    },
    dragend(item, event) {
      // console.log('dragend: ', item, event)
    },
    getPngIconStyle(item) {
      const iconUrl = getImageUrl(`icon/${item.image}`, 100)
      return {
        display: 'inline-block',
        width: '60px',
        height: '30px',
        background: 'url("' + iconUrl + '") no-repeat center  center',
        'background-size': 'contain'
      }
    },
    canRename() {
      if (Object.keys(this.selItems).length !== 1) {
        return false
      }
      let sel
      for (let key in this.selItems) {
        sel = this.selItems[key]
        break
      }
      if (sel && sel.isdir && sel.id) {
        return true
      }
      return false
    },
    canCopy() {
      if (Object.keys(this.selItems).length <= 0) {
        return false
      }
      for (let key in this.selItems) {
        let sel = this.selItems[key]
        if (sel.isdir) {
          return false
        }
      }
      return true
    },
    canPaste() {
      return this.$store.getters.algClipboard.project !== ''
    },
    onContextmenu(event) {
      this.$contextmenu({
        items: [
          {
            label: '刷新(R)', icon: 'el-icon-refresh', divided: true, disabled: false,
            onClick: () => { this.refresh() }
          },
          {
            label: '新建图元', icon: 'el-icon-document-add', divided: false, disabled: false,
            onClick: () => { this.newFile() }
          },
          {
            label: '新建分类', icon: 'el-icon-folder-add', divided: false, disabled: false,
            onClick: () => { this.newDir() }
          },
          {
            label: '重命名', icon: 'el-icon-edit', divided: true, disabled: !this.canRename(),
            onClick: () => { this.rename() }
          },
          {
            label: '复制(C)', icon: 'el-icon-document-copy', divided: false, disabled: !this.canCopy(),
            onClick: () => { this.copy() }
          },
          {
            label: '粘贴(V)', icon: 'el-icon-document-checked', divided: false, disabled: !this.canPaste(),
            onClick: () => { this.paste() }
          },
          {
            label: '删除(D)', icon: 'el-icon-delete', divided: false, disabled: !(this.canRename() || this.canCopy()),
            onClick: () => { this.del() }
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
    overflow: hidden;
    span {
      display: block;
      font-size: 10px;
      line-height: 11px;
      width: 100%;
      word-wrap: break-word;
      white-space: normal;
      user-select: none;
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
