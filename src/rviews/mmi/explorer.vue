<template>
  <div class="mmi-container">
    <div style="width: 100%; height: 36px; display: flex; flex-direction: row; justify-content: space-evenly; align-items: center">
      <el-input
        v-model="searchKey"
        placeholder="搜索,可用正则表达式"
        autofocus
        @keyup.enter.native="doSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="doSearch" />
      </el-input>
    </div>
    <div class="view">
      <explorer
        :items="(searchKey == '') ? items : searchItems"
        @item-click="itemClick"
        @newfile="callNewFile"
        @copyItem="callCopyItem"
        @pasteItem="callPasteItem"
        @renamefile="callRenameFile"
        @newdir="callNewDir"
        @refresh="refresh"
        @copyPath="copyPath"
        @remove="remove"
        @release="release"
      />
    </div>
  </div>
</template>

<script>
import fabric from '@/canvas'
import * as mmiapi from '@/api/res'
import Explorer from './components/Explorer'
import { ls, touch, mkdir, rm, cp, mv, exists } from '@/api/res'
export default {
  name: 'MmiExplorer',
  components: { Explorer },
  data() {
    return {
      path: [],
      items: [],
      copy: {
        path: '',
        name: ''
      },
      searchKey: '',
      searchItems: []
    }
  },
  computed: {
    url() {
      var u = ''
      for (var i = 0; i < this.path.length; i++) {
        u = u + this.path[i] + '/'
      }
      return u
    },
    codeurl() {
      var u = ''
      for (var i = 0; i < this.path.length; i++) {
        u = u + this.path[i] + '%2F'
      }
      return u
    }
  },
  watch: {
    searchKey: {
      handler: function() {
        this.doSearch()
      }
    }
  },
  mounted() {
    this.updateItems()
    this.$on('global:project.open', () => {
      this.path = []
      this.items = []
      this.updateItems()
    })
  },
  methods: {
    updateItems() {
      ls('mmi/' + this.url, '.json').then(res => {
        if (typeof res === 'string') {
          res = JSON.parse(res)
        }
        var items = []
        if (this.url !== '') {
          items.push({ name: '..', isdir: true })
        }
        items.push(...res)
        items.forEach(item => {
          item.isdir = item.isdir || false
          if (!item.isdir) {
            item.name = item.name.slice(0, item.name.length - 5)
            item.url = this.url + item.name
          }
        })
        items = items.sort((i1, i2) => {
          if (i1.isdir === i2.isdir) {
            return i1.name.localeCompare(i2.name, 'zh-CN')
          } else {
            return i2.isdir - i1.isdir
          }
        })
        this.items = items
        this.searchKey = ''
      }).catch(() => {})
    },
    itemClick(item, event) {
      if (!item.isdir) {
        this.$router.push({ path: '/engineer/mmi/edit/' + encodeURIComponent(this.url + item.name) })
      } else {
        if (item.name === '..') {
          this.path.pop()
          this.updateItems()
        } else {
          this.path.push(item.name)
          this.updateItems()
        }
      }
    },
    copyPath(item, event) {
      if (!item.isdir) {
        let path = this.url + item.name
        this.$copyText(path)
        this.$msg(path, '成功复制路径')
      }
    },
    remove(item, event) {
      this.$confirm('确定删除: ' + item.name, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let path = ''
        if (item.isdir) {
          path = this.url + item.name
        } else {
          path = this.url + item.name + '.json'
        }
        return rm('mmi/' + path)
      }).then(() => {
        this.updateItems()
      }).catch(() => {})
    },
    callNewFile() {
      this.$prompt('请输入画面名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value) {
          touch('mmi/' + this.url + value + '.json').then(res => {
            this.updateItems()
          })
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    // 复制
    callCopyItem(item, event) {
      if (!item.isdir) {
        let path = this.url + item.name
        this.copy = { path: path, name: item.name }
        this.$msg(path, '复制成功')
      }
    },
    // 粘贴
    callPasteItem() {
      const { path, name } = this.copy
      const src = `mmi/${path}`
      let dst = `mmi/${path}`
      if (path === '') return
      this.$prompt('请输入画面名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: name
      }).then(({ value }) => {
        dst = `mmi/${this.url + value}`
        return exists(dst + '.json')
      }).then(res => {
        if (res.exists) {
          return Promise.reject('当前目录有同名文件, 请修改名称')
        }
      }).then(() => {
        cp(
          `project/${this.$store.getters.project.project}/res/${src}.png`,
          `project/${this.$store.getters.project.project}/res/${dst}.png`
        ).catch(() => {})
        return cp(
          `project/${this.$store.getters.project.project}/res/${src}.json`,
          `project/${this.$store.getters.project.project}/res/${dst}.json`
        )
      }).then(() => {
        this.updateItems()
      }).catch((err) => {
        if (err !== 'cancel') {
          this.$msg.error(err, '粘贴失败')
        }
      })
    },
    callRenameFile(item, event) {
      if (!item.isdir) {
        let src = this.url + item.name
        let dst = src
        this.$prompt('请输入画面名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: item.name
        }).then(({ value }) => {
          if (!value) {
            return Promise.reject('名称不能为空, 请修改名称')
          }
          dst = this.url + value
          return exists(`mmi/${dst}.json`)
        }).then(res => {
          if (res.exists) {
            return Promise.reject('当前目录有同名文件, 请修改名称')
          }
        }).then(() => {
          mv(
            `mmi/${src}.png`,
            `mmi/${dst}.png`
          ).catch(() => {})
          mv(
            `mmi/${src}.release`,
            `mmi/${dst}.release`
          ).catch(() => {})
          return mv(
            `mmi/${src}.json`,
            `mmi/${dst}.json`
          )
        }).then(() => {
          this.updateItems()
          this.$msg(`${src} -> ${dst}`, '重命名成功')
        }).catch((err) => {
          this.$msg.error(err, '重命名失败')
        })
      }
    },
    callNewDir(dirName) {
      this.$prompt('请输入目录名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value) {
          mkdir('mmi/' + this.url + value).then(res => {
            this.updateItems()
          })
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    refresh() {
      this.updateItems()
    },
    async release(items, event) {
      this.loading = this.$loading({
        lock: true,
        text: `正在发布 ...`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      })

      for (let idx = 0; idx < items.length; idx++) {
        let item = items[idx]
        if (item.isdir) {
          continue
        }

        this.loading.text = `正在发布 ${item.url}, 进度 ${parseInt((idx + 0.5) / items.length * 1000) / 10}%  ... `

        let path = this.url + item.name
        let tempCanvas = new fabric.RubikCanvas()
        tempCanvas.setWidth(1920)
        tempCanvas.setHeight(1080)

        try {
          let rels = tempCanvas.open(path).then(() => {
            tempCanvas.setWidth(Math.max(tempCanvas.header.width, 1920))
            tempCanvas.setHeight(Math.max(tempCanvas.header.height, 1080))
            tempCanvas.includeDefaultValues = false
            tempCanvas.releaseMode = true
            var json = tempCanvas.toJSON(['header', 'param', 'dyn', 'action'])
            tempCanvas.releaseMode = false
            var fd = new FormData()
            var file = new File([JSON.stringify(json)], path + '.release', {
              type: 'text/plain'
            })
            fd.append('file', file)
            return mmiapi.write('mmi/' + path + '.release', fd)
          })
          await rels
        } catch (err) {
          this.$msg.error(err)
        }
      }

      this.loading && this.loading.close()
      this.$msg('发布完成')
    },
    doSearch() {
      this.searchItems = []
      if (!this.searchKey) {
        return
      }
      let reg = null
      try {
        reg = new RegExp(this.searchKey, 'i')
      } catch (err) {
        this.$msg.error('正则表达式错误: ' + err)
        return
      }

      for (let item of this.items || []) {
        if (reg.test(item.name)) {
          this.searchItems.push(item)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .mmi-container {
    height: 100%;
  }
	.view {
		height: calc(100% - 36px);
		width: 100%;
    overflow: auto;
	}
  .unselectable {
    -webkit-user-select: none;  /* Chrome all / Safari all */
    -moz-user-select: none;     /* Firefox all */
    -ms-user-select: none;      /* IE 10+ */
    user-select: none;          /* Likely future */
  }
</style>
