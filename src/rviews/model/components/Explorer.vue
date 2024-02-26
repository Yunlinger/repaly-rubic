<template>
  <div v-contextmenu:contextmenu class="icons-container" :style="getStyle">
    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item @click="newFile">新建页面</v-contextmenu-item>
      <v-contextmenu-item @click="newDir">新建分类</v-contextmenu-item>
      <v-contextmenu-item @click="refresh">刷新</v-contextmenu-item>
      <v-contextmenu-item @click="delitem">删除</v-contextmenu-item>
    </v-contextmenu>
    <div class="icons-wrapper">
      <div v-for="item of items" :key="item.id || item.name">
        <div
          :class="size === 'mini' ? 'icon-item-mini' : 'icon-item'"
          @click="click(item, $event)"
          @contextmenu="ritem=item"
        >
          <i :class="item.name == '..' ? 'el-icon-back' : (item.isdir ? 'el-icon-message' : 'el-icon-document')" />
          <div>
            <span style="font-weight: bold;">{{ item.name }}</span>
            <span>{{ item.name == item.desc ? "" : item.desc }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Explorer',
  props: {
    items: {
      type: Array,
      required: true
    },
    size: {
      type: String,
      default: 'normal'
    },
    height: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      menuVisable: false,
      top: 0,
      left: 0,
      ritem: null
    }
  },
  computed: {
    getStyle: function() {
      if (this.height !== 0) {
        return {
          height: this.height + 'px',
          minHeight: 0,
          overflow: 'auto'
        }
      }
      return {}
    }
  },
  events: ['item-click', 'newfile', 'newdir', 'delitem'],
  methods: {
    click(item, event) {
      this.$emit('item-click', item, event)
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
    delitem(event) {
      this.$emit('delitem', this.ritem, event)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.icons-container {
  margin: 0px;
  overflow: hidden;
  min-height: calc(100vh - 130px);
  .icons-wrapper {
    margin: 0 auto;
  }
  .icon-item {
    margin: 5px;
    height: 100px;
    text-align: center;
    width: 90px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
    span {
      display: block;
      font-size: 12px;
      width: 100%;
      word-wrap: break-word;
      white-space: normal;
      user-select: none;
    }
  }
  .icon-item-mini {
    margin: 5px;
    height: 80px;
    text-align: center;
    width: 62px;
    float: left;
    font-size: 25px;
    color: #24292e;
    cursor: pointer;
    span {
      display: block;
      font-size: 10px;
      width: 100%;
      word-wrap: break-word;
      white-space: normal;
      user-select: none;
    }
  }
  .icon-item:hover{
    background-color: #e0e0e0;
  }
  .icon-item-mini:hover{
    background-color: #e0e0e0;
  }
  .disabled{
    pointer-events: none;
  }
}
</style>
