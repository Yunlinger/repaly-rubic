<template>
  <div class="app-container">
    <explorer
      :items="items"
      :size="size"
      @item-click="itemClick"
      @newfile="showNewFileDialog"
      @newdir="showNewDirDialog"
      @refresh="refresh"
      @delitem="delitem"
    />
    <el-dialog :visible.sync="dialogNewFileVisible" title="新建流程图" append-to-body>
      <el-input v-model="newFileName" autocomplete="off" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogNewFileVisible = false">取 消</el-button>
        <el-button type="primary" @click="callNewFile(newFileName)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogNewDirVisible" title="新建目录" append-to-body>
      <el-input v-model="newDirName" autocomplete="off" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogNewDirVisible = false">取 消</el-button>
        <el-button type="primary" @click="callNewDir(newDirName)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import '@/utils/checkoutAlg'
import Explorer from './components/Explorer'
import * as mapi from '@/api/model'
export default {
  name: 'ModelExplorer',
  components: { Explorer },
  props: {
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
      path: [],
      currentPath: 0,
      items: [],
      dialogNewFileVisible: false,
      newFileName: '',
      dialogNewDirVisible: false,
      newDirName: ''
    }
  },
  mounted() {
    this.updateItems()
  },
  methods: {
    updateItems() {
      mapi.pageList(this.currentPath).then(res => {
        if (typeof res === 'string') {
          res = JSON.parse(res)
        }
        var items = []
        if (this.path.length) {
          items.push({ id: this.path[this.path.length - 1].id, isdir: true, name: '..' })
        }
        for (const id in res.nodes) {
          items.push({ id: id, isdir: true, ...res.nodes[id] })
        }
        for (const name in res.pages) {
          items.push({ isdir: false, ...res.pages[name] })
        }

        this.items = items
      })
    },
    itemClick(item, event) {
      if (!item.isdir) {
        this.$router.push({ path: '/engineer/model/edit/' + item.name })
      } else {
        if (item.name === '..') {
          this.currentPath = this.path.pop().id
          this.updateItems()
        } else {
          this.path.push({ id: this.currentPath, name: item.name })
          this.currentPath = item.id
          this.updateItems()
        }
      }
    },
    showNewFileDialog() {
      this.dialogNewFileVisible = true
    },
    callNewFile(fileName) {
      this.dialogNewFileVisible = false
      mapi.pageNew(fileName, '', this.currentPath).then(res => {
        this.updateItems()
        this.$store.dispatch('getPageList', this.currentPath)
      }).catch(err => {
        console.log('error: ', err)
      })
    },
    showNewDirDialog() {
      this.dialogNewDirVisible = true
    },
    callNewDir(dirName) {
      this.dialogNewDirVisible = false
      mapi.pageTreeAddItem(0, this.currentPath, dirName).then(res => {
        this.updateItems()
        this.$store.dispatch('getPageList', this.currentPath)
      }).catch(err => {
        console.log('error: ', err)
      })
    },
    refresh() {
      this.updateItems()
    },
    delitem(item) {
      if (!item || item.isdir) {
        return
      }

      this.$confirm('确定删除模型图页 ' + item.name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return mapi.pageDel(item.name)
      }).then(() => {
        this.updateItems()
        this.$msg.success('删除模型图页成功 ' + item.name)
      }).catch(error => {
        this.$msg.error(`删除模型图页失败 ${error}`)
      })
    }
  }
}
</script>
