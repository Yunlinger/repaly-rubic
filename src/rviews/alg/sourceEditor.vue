<template>
  <div class="app-container">
    <el-container style="height: 100%">
      <el-aside width="200px">
        <div
          style="background-color: rgb(238, 241, 246); height: 100%; width: 100%; overflow: auto;"
        >
          <tree
            :setting="treeSetting"
            :nodes="treeNodes"
            @onDblClick="onDblClick"
            @onRightClick.prevent="onContextmenu"
          />
        </div>
      </el-aside>
      <el-main>
        <div v-if="openFiles.length == 0" class="standon">
        </div>
        <div v-if="openFiles.length > 0">
          <el-tabs v-model="openFileName" type="card" editable @edit="handleTabsEdit">
            <el-tab-pane
              v-for="(item, index) in openFiles"
              :key="item.name"
              :label="item.name"
              :name="item.name"
            >
              <span slot="label">
                <i
                  v-if="item.readOnly"
                  class="bi bi-lock-fill"
                  style="padding-right: 6px;"
                />
                <i
                  v-if="item.changed"
                  class="bi bi-save-fill"
                  style="padding-right: 6px;"
                  @click="saveSource(item, index)"
                />
                {{ item.name + (item.changed ? ' *':'') }}
              </span>
              <code-editor
                v-model="item.source"
                :readOnly="item.readOnly || false"
                mode="text/x-c++src"
                class="main-code-editor"
                style="overflow: auto"
                @change="item.changed = true"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
        <div
          id="algSourceTerm"
          class="footer xterm"
          style="padding: 12px 0 0; margin: 0; width: 100%; overflow: auto; "
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>

import _ from 'lodash'
import { mapGetters } from 'vuex'
import CodeEditor from '@/components/CodeEditor'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import * as algApi from '@/api/alg'
import * as api from '@/api/res'
import * as mapi from '@/api/model'
import * as dapi from '@/api/driver'
import tree from '@/components/ztree'

export default {
  name: 'SourceEditor',
  components: { tree, CodeEditor },
  data() {
    return {
      openFiles: [],
      openFileName: '',
      xterm: null,
      xtermInput: '',
      xtermLatestInput: '',
      source: '',
      treeLoading: false,
      treeNodes: [],
      treeSetting: {
        data: {
          keep: {
            leaf: true,
            parent: true
          },
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'pid',
            rootPId: 0
          }
        },
        check: {
          enable: false
        },
        view: {
          nameIsHTML: false,
          selectedMulti: false
        },
        edit: {
          enable: false
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'project'
    ])
  },
  mounted() {
    this.updateTree()
    this.$on('global:alg.build.log', msg => {
      msg = msg || {}
      if (msg.data.log) {
        this.log(msg.data.log)
      }
    })
    this.$nextTick(() => {
      this.initTerm()
    })
  },
  beforeDestroy() {
    this.xterm && this.xterm.dispose()
  },
  methods: {
    initTerm() {
      this.xterm = new Terminal({
        fontSize: 14,
        cursorBlink: true,
        rows: 14
      })
      const fitAddon = new FitAddon()
      this.xterm.loadAddon(fitAddon)
      this.xterm.open(document.getElementById('algSourceTerm'))
      fitAddon.fit()

      this.log('请使用指令 build 生成算法库.')
      this.showRubik()

      this.xterm.onKey(async(e) => {
        if (e.key === '\x7F') {
          // backspace
          if (this.xtermInput.length > 0) {
            this.xtermInput = this.xtermInput.substring(0, this.xtermInput.length - 1)
            this.xterm.write('\b \b')
          }
          return
        }
        if (e.key !== '\r') {
          this.xtermInput += e.key
          this.xterm.write(e.key)
        } else {
          this.xterm.writeln('')
          switch (this.xtermInput) {
            case 'build':
              try {
                await this.buildAlg()
              } catch (err) {
                this.$msg.error(err, '编译失败')
                this.log('编译失败: ' + err)
              }
              break
            case 'cls':
              this.clearLog()
              break
            default:
              if (this.xtermInput !== '') {
                this.log('未知指令: ' + this.xtermInput)
              }
              break
          }
          this.xtermInput = ''
          this.showRubik()
        }
      })
    },
    strcmp(a, b) {
      if (a.isParent !== b.isParent) {
        return (a.isParent > b.isParent ? -1 : 1)
      }
      if (a.isParent && b.isParent) {
        return a.id - b.id
      }
      return ((a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1))
    },
    log(line) {
      if (this.xterm) {
        this.fitAddon && this.fitAddon.fit()
        this.xterm.writeln('  ' + line)
      }
    },
    showRubik() {
      if (this.xterm) {
        this.fitAddon && this.fitAddon.fit()
        this.xterm.write(' \x1b[33mxrubik $\x1b[0m ')
      }
    },
    clearLog() {
      this.xterm && this.xterm.clear()
    },
    updateTree() {
      if (!this.$store.getters.token) {
        // 没有登录
        return
      }
      if (this.listLoading) {
        return
      }
      this.listLoading = true
      this.treeNodes = []
      let nodes = []

      // 先构建文件夹
      nodes.push({
        name: '系统头文件',
        id: 1,
        pid: 0,
        isParent: true,
        open: true
      })
      nodes.push({
        name: '工程头文件',
        id: 2,
        pid: 0,
        isParent: true,
        open: true
      })
      nodes.push({
        name: '工程源文件',
        id: 3,
        pid: 0,
        isParent: true,
        open: true
      })

      api.ls('../../../common/header', '.h').then(items => {
        console.log(items)
        items = items || []
        items.forEach(item => {
          nodes.push({
            name: item.name,
            pid: 1,
            isParent: false,
            open: false,
            path: '../../../common/header/' + item.name,
            readOnly: true
          })
        })

        // 建立算法文件目录
        return api.mkdir('../algorithm/header')
      }).then(() => {
        return api.mkdir('../algorithm/src')
      }).then(() => {
        // 获取工程源文件
        return api.ls('../algorithm/src', '.cpp')
      }).then(items => {
        let opened = false
        items = items || []
        items.forEach(item => {
          let node = {
            name: item.name,
            pid: 3,
            isParent: false,
            open: false,
            path: '../algorithm/src/' + item.name
          }
          nodes.push(node)
          if (!opened && !this.openFiles.length) {
            opened = true
            this.openFile(node)
          }
        })

        // 获取工程源文件
        return api.ls('../algorithm/header', '.h')
      }).then(items => {
        items = items || []
        items.forEach(item => {
          nodes.push({
            name: item.name,
            pid: 2,
            isParent: false,
            open: false,
            path: '../algorithm/header/' + item.name
          })
        })

        nodes.sort((a, b) => {
          return this.strcmp(a, b)
        })
        this.treeNodes = nodes
      }).catch(() => {
        this.nodes = []
      }).finally(() => {
        this.listLoading = false
      })
    },
    async saveSource(item, index) {
      if (item.source && item.changed) {
        return api.mkdir('../algorithm/src').then(() => {
          var fd = new FormData()
          var file = new File([item.source], item.name, {
            type: 'text/plain'
          })
          fd.append('file', file)
          return api.write(item.path, fd)
        }).then(res => {
          item.changed = false
          this.$set(this.openFiles, index, item)
        })
      }
      return Promise.resolve()
    },
    onDblClick(e, id, node) {
      this.openFile(node)
    },
    openFile(node) {
      if (this.openFiles.some(item => {
        if (item.path === node.path) {
          this.openFileName = item.name
          return true
        }
      })) {
        return
      }

      if (node.path) {
        api.open(node.path).then(source => {
          // this.source = source || ''
          this.openFiles.push({
            ... node,
            source: source || ''
          })
          this.openFileName = node.name
        })
      }
    },
    handleTabsEdit(targetName, action) {
      if (action === 'remove') {
        let tabs = this.openFiles
        let activeName = this.openFileName
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.name
              }
            }
          })
        }
        this.openFileName = activeName
        this.openFiles = tabs.filter(tab => tab.name !== targetName)
      }
    },
    async buildAlg() {
      // 记录当前的运行状态
      let running = this.project.running
      this.log('g++ *.cpp -shared -o rubik.alg')
      for (let i = 0; i < this.openFiles.length; i++) {
        if (this.openFiles[i].changed) {
          this.log('save ' + this.openFiles[i].name + ' ...')
          await this.saveSource(this.openFiles[i], i)
        }
      }
      return api.open('../model/setting.json').then(response => {
        return (response || {}).win64driver
      }).then((win64driver) => {
        this.log('build ...')
        return algApi.build(this.project.project, win64driver)
      }).then((res) => {
        res = res || {}
        if (res.code === 1) {
          this.log(res.output)
          return Promise.reject()
        } else {
          this.log('编译成功, 正在重启驱动...')
          this.$msg.success('编译成功, 正在重启驱动')

          return api.open('../alg/libs.json')
        }
      }).then(response => {
        let json = response || {}
        json.libs = json.libs || []
        json.libs = ['rubik.alg.dll', ...json.libs]
        json.libs = _.uniq(json.libs)
        var fd = new FormData()
        var file = new File([JSON.stringify(json)], 'libs.json', {
          type: 'text/plain'
        })
        fd.append('file', file)
        return api.write('../alg/libs.json', fd)
      }).then(() => {
        return mapi.modelStart(false)
      }).then(() => {
        return dapi.restart()
      }).then(() => {
        if (running) {
          setTimeout(() => {
            mapi.modelStart(true)
          }, 2000)
        }
        return Promise.resolve()
      }).then(() => {
        this.log('重启驱动成功')
        this.$msg.success('重启驱动成功')
      })
    },
    onContextmenu(event) {
      this.$contextmenu({
        items: [
          {
            label: '刷新(R)', icon: 'el-icon-refresh', divided: true,
            onClick: () => { this.updateTree() }
          },
          {
            label: '编译(B)', icon: 'el-icon-files', divided: false,
            onClick: () => { this.buildAlg() }
          },
          {
            label: '删除(B)', icon: 'el-icon-delete', divided: false,
            onClick: () => {
              if (event && event.target && event.target.innerText && event.target.innerText.toUpperCase().endsWith('.CPP')) {
                this.$confirm('删除源文件 ' + event.target.innerText).then(() => {
                  return api.rm('../algorithm/src/' + event.target.innerText)
                }).then(() => {
                  this.treeNodes = this.treeNodes.filter(item => item.name !== event.target.innerText)
                })
              }
            }
          }
        ],
        event,
        zIndex: 9527,
        minWidth: 148
      })
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 0;
  margin: 0;
  >>>
  {
    .el-tabs__header {
      margin-bottom: 0;
    }
  }
}
.el-aside {
  padding: 0;
  margin: 0;
  height: calc(100vh - 70px);
}
.el-main {
  padding-top: 0;
  padding-bottom: 0;
}

.standon {
  height: calc(100vh - 240px - 70px);
}

.main-code-editor {
  height: 100%;
  overflow: auto;
  height: calc(100vh - 240px - 70px - 70px);
}

.footer {
  height: 240px;
  padding: 0 6px;
  margin: 0;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  background-color: rgb(240, 242, 245);
}
</style>
