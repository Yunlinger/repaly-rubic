<template>
  <div class="tree-container" @contextmenu.prevent="onContextmenu">
    <tree
      ref="modelPageTree"
      :setting="treeSetting"
      :nodes="project.nodes"
      :beforeDrop="beforeDrop"
      @onDblClick="onDblClick"
      @onRightClick="onRightClick"
      @onExpand="onExpand"
      @onCollapse="onCollapse"
      @onCreated="onCreated"
    />
    <el-dialog
      :title="'从 ' + importModelConfig.fromProject + '/' + importModelConfig.fromID + ' 导入模型'"
      :visible.sync="importDialogVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      :center="true"
      width="600px"
    >
      <el-form ref="importConfigForm" label-width="100px">
        <el-form-item label="导入内容">
          <span v-if="importModelConfig.fromDir != 0"> {{ `导入文件夹 ${importModelConfig.fromDirName} 到文件夹 ${importModelConfig.toDirName} 中` }} </span>
          <span v-else> {{ `导入页面 ${importModelConfig.fromPages} 到文件夹 ${importModelConfig.toDirName} 中` }} </span>
        </el-form-item>
        <el-form-item v-if="importModelConfig.fromDir > 0" label="文件夹重命名">
          <el-input v-model="importModelConfig.newDirName"></el-input>
        </el-form-item>
        <template v-if="!(project.project == importModelConfig.fromProject && project.id == importModelConfig.fromID)">
          <el-form-item label="只导入算法">
            <el-checkbox v-model="importModelConfig.onlyAlg"></el-checkbox>
          </el-form-item>
          <el-form-item label="算法源文件">
            <el-checkbox v-model="importModelConfig.importCpp" label="导入"></el-checkbox>
            <el-checkbox v-if="importModelConfig.importCpp" v-model="importModelConfig.overwriteCpp" label="覆盖"></el-checkbox>
          </el-form-item>
          <el-form-item label="算法图元文件">
            <el-checkbox v-model="importModelConfig.importIcon" label="导入"></el-checkbox>
            <el-checkbox v-if="importModelConfig.importIcon" v-model="importModelConfig.overwriteIcon" label="覆盖"></el-checkbox>
          </el-form-item>
        </template>
        <el-form-item label="添加名字前缀">
          <el-input v-model="importModelConfig.prefixOfName"></el-input>
        </el-form-item>
        <el-form-item label="名字替换规则">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="appendReplaceOfName"
          />
          <template v-for="(rep, idx) in repsOfName">
            <template>
              <p :key="'replaceOfName_' + idx" style="margin: 1px 0;">
                <input v-model="rep.old" style="width: 180px;" />
                <span>--></span>
                <input v-model="rep.new" style="width: 180px;" />
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-delete"
                  style="margin-left: 24px;"
                  @click="removeReplaceOfName(idx)"
                />
              </p>
            </template>
          </template>
        </el-form-item>
        <el-form-item label="添加描述前缀">
          <el-input v-model="importModelConfig.prefixOfDesc"></el-input>
        </el-form-item>
        <el-form-item label="描述替换规则">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="appendReplaceOfDesc"
          />
          <template v-for="(rep, idx) in repsOfDesc">
            <template>
              <p :key="'replaceOfDesc_' + idx" style="margin: 1px 0;">
                <input v-model="rep.old" style="width: 180px;" />
                <span>--></span>
                <input v-model="rep.new" style="width: 180px;" />
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-delete"
                  style="margin-left: 24px;"
                  @click="removeReplaceOfDesc(idx)"
                />
              </p>
            </template>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="importModel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as mapi from '@/api/model'
import { mapGetters } from 'vuex'
import tree from '@/components/ztree'

export default {
  name: 'PageTree',
  components: { tree },
  data() {
    return {
      listLoading: true,
      treeObj: null,
      currentNode: null,
      rightClickNode: null,
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
          enable: true
        },
        view: {
          nameIsHTML: false,
          selectedMulti: true
        },
        edit: {
          enable: true,
          showRenameBtn: false,
          showRemoveBtn: false,
          drag: {
            isCopy: false
          }
        }
      },
      importDialogVisible: false,
      importModelConfig: {
        'fromProject': '',
        'fromModel': '',
        'fromID': '',
        'fromPages': [],
        'fromDir': 0,
        'newDirName': '',
        'toDir': 0,
        'repsOfName': [],
        'repsOfDesc': [],
        'prefixOfName': '',
        'prefixOfDesc': '',
        'onlyAlg': false,
        'importCpp': false,
        'overwriteCpp': false,
        'importIcon': false,
        'overwriteIcon': false
      },
      repsOfName: [],
      repsOfDesc: []
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  created() {
    this.$store.dispatch('getPageList', 0)
    this.$on('global:project.open', () => {
      this.$store.dispatch('getPageList', 0)
    })
  },
  methods: {
    strcmp(str1, str2) {
      return ((str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1))
    },
    onCreated(treeObj) {
      this.treeObj = treeObj
    },
    onDblClick(e, id, node) {
      if (!node.isParent) {
        this.$router.push({ path: '/engineer/model/edit/' + node.data.name })
      }
    },
    onExpand(e, id, node) {
      this.$store.dispatch('openPageDir', { id: node.id, open: true })
      this.$store.dispatch('getPageList', node.id)
    },
    onCollapse(e, id, node) {
      this.$store.dispatch('openPageDir', { id: node.id, open: false })
    },
    onRightClick(e, id, node) {
      this.rightClickNode = node
      this.onContextmenu(e)
    },
    newSort() {
      let parent = 0
      if (this.rightClickNode) {
        parent = this.rightClickNode.isParent ? this.rightClickNode.id : this.rightClickNode.pid
      }
      this.$prompt('请输入分类名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        return mapi.pageTreeAddItem(0, parent, value)
      }).then(res => {
        this.$store.dispatch('openPageDir', { id: parent, open: true })
        this.$store.dispatch('getPageList', parent)
      }).catch((err) => {
        console.error(err)
      })
    },
    newPage() {
      let parent = 0
      if (this.rightClickNode) {
        parent = this.rightClickNode.isParent ? this.rightClickNode.id : this.rightClickNode.pid
      }
      this.$confirmWithInput('新建流程图', [
        { caption: '图页名称', value: '' },
        { caption: '图页描述', value: '' }
      ]).then((attrs) => {
        console.log(attrs)
        attrs[0].value = (attrs[0].value || '').trim().toUpperCase()
        return mapi.pageNew(attrs[0].value, attrs[1].value, parent)
      }).then(() => {
        this.$store.dispatch('openPageDir', { id: parent, open: true })
        this.$store.dispatch('getPageList', parent)
      }).catch((err) => {
        if (err !== 'cancel') {
          this.$msg.error(err, '新建流程图失败')
        }
      })
    },
    delPage() {
      if (this.rightClickNode.isParent) {
        return
      }
      this.$confirm('确定删除页面 ' + this.rightClickNode.data.name + ' ?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return mapi.pageDel(this.rightClickNode.data.name)
      }).then(res => {
        this.refresh()
      }).catch(err => {
        console.error(err)
      })
    },

    async changeDesc() {
      if (this.rightClickNode.isParent) {
        return
      }
      let { value } = await this.$prompt('请输入流程图描述', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.rightClickNode.data.desc
      })
      await mapi.pageSet(this.rightClickNode.data.name, 'desc', value)
      this.refresh()
    },

    async renameDir() {
      if (!this.rightClickNode.isParent) {
        return
      }
      let { value } = await this.$prompt('请输入分类名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await mapi.pageTreeUpdate(this.rightClickNode.id, this.rightClickNode.pid, value)
      this.$store.dispatch('getPageList', this.rightClickNode.pid)
    },
    delDir() {
      if (!this.rightClickNode.isParent) {
        return
      }
      this.$confirm(`确定删除目录  ${this.rightClickNode.name}? `, '提示! 这将删除目录中所有内容', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return mapi.pageTreeDelete(this.rightClickNode.id)
      }).then(res => {
        this.$store.dispatch('getPageList', this.rightClickNode.pid)
      }).catch(err => {
        console.error(err)
      })
    },
    refresh() {
      this.$store.dispatch('getPageList', 0)
    },
    exportSource() {
      if (this.rightClickNode.isParent) {
        return
      }
      console.log(this.rightClickNode.data.name)
      mapi.pageSource(this.rightClickNode.data.name).then(res => {
        this.$copyText(res.src).then(() => {
          this.$msg.success('源代码已经复制到剪切板中')
        }).catch(e => {
          console.log(res.src)
          this.$msg.warning('复制源代码错误，请在 console 中查看源代码')
        })
      }).catch(err => {
        console.error(err)
      })
    },
    beforeDrop(id, nodes, target, moveType, isCopy) {
      if (target && !target.isParent) {
        return false
      }
      for (const node of nodes) {
        if (node.isParent) {
          // 移动文件夹
          let parent = 0
          if (target) {
            parent = parseInt(target.id)
          }
          mapi.pageTreeUpdate(parseInt(node.id), parent, node.name).then((nd) => {
            this.refresh()
          }).catch(() => {})
        } else {
          let sort = 0
          if (target) {
            sort = parseInt(target.id)
          }
          if (sort !== node.data.sort) {
            mapi.pageSet(node.data.name, 'sort', sort).then((nd) => {
              this.refresh()
            }).catch(() => {})
          }
        }
      }
      return false
    },
    onContextmenu(event) {
      this.$contextmenu({
        items: [
          {
            label: '刷新(R)', icon: 'el-icon-refresh', divided: true, disabled: false,
            onClick: () => { this.refresh() }
          },
          {
            label: '新建流程图', icon: 'el-icon-document-add', divided: false, disabled: false,
            onClick: () => { this.newPage() }
          },
          {
            label: '修改描述', icon: 'el-icon-edit', divided: false, disabled: (!this.rightClickNode || this.rightClickNode.isParent),
            onClick: () => { this.changeDesc() }
          },
          {
            label: '删除流程图', icon: 'el-icon-delete', divided: true, disabled: (!this.rightClickNode || this.rightClickNode.isParent),
            onClick: () => { this.delPage() }
          },
          {
            label: '新建目录', icon: 'el-icon-folder-add', divided: false, disabled: false,
            onClick: () => { this.newSort() }
          },
          {
            label: '修改目录名', icon: 'el-icon-edit', divided: false, disabled: (!this.rightClickNode || !this.rightClickNode.isParent),
            onClick: () => { this.renameDir() }
          },
          {
            label: '删除目录', icon: 'el-icon-delete', divided: true, disabled: (!this.rightClickNode || !this.rightClickNode.isParent),
            onClick: () => { this.delDir() }
          },
          {
            label: '导出', icon: 'el-icon-share', divided: false, disabled: !this.rightClickNode,
            onClick: () => { this.exportModel() }
          },
          {
            label: '导入', icon: 'el-icon-receiving', divided: false,
            disabled: (this.rightClickNode && !this.rightClickNode.isParent) || !this.project.importModelConfig.fromProject,
            onClick: () => { this.openImportDialog() }
          }
        ],
        event,
        zIndex: 12003,
        minWidth: 148
      })
      return false
    },
    exportModel() {
      var config = {
        fromProject: this.$store.getters.project.project,
        fromModel: this.$store.getters.project.model,
        fromID: this.$store.getters.project.id,
        fromPages: [],
        fromDir: 0,
        fromDirName: '',
        toDir: 0,
        importCpp: false,
        importIcon: false
      }
      if (this.rightClickNode.isParent) {
        this.$confirm(`导出分类 ${this.rightClickNode.data.name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          config.fromDirName = this.rightClickNode.data.name
          config.fromDir = parseInt(this.rightClickNode.id)
          this.$store.dispatch('exportModel', config)
        }).catch(() => {})
      } else {
        // 查找所有的选中项
        let checknodes = this.$refs['modelPageTree'].getCheckedNodes() || []
        checknodes = checknodes.filter(item => !item.isParent)
        let fromPages = []
        if (checknodes.length) {
          fromPages = checknodes.map(item => item.data.name)
        } else {
          fromPages = [this.rightClickNode.data.name]
        }
        this.$confirm(`导出图页 ${fromPages}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          config.fromPages = fromPages
          this.$store.dispatch('exportModel', config)
        }).catch(() => {})
      }
    },
    openImportDialog() {
      this.importModelConfig = { ...this.importModelConfig, ...(this.project.importModelConfig || {}) }
      if (!this.importModelConfig.fromProject) {
        return
      }
      if (this.rightClickNode && !this.rightClickNode.isParent) {
        return
      }
      if (!this.rightClickNode) {
        this.importModelConfig.toDir = 0
        this.importModelConfig.toDirName = '根目录'
      } else {
        this.importModelConfig.toDir = parseInt(this.rightClickNode.id)
        this.importModelConfig.toDirName = this.rightClickNode.data.name
      }
      if (this.importModelConfig.fromDir) {
        this.importModelConfig.newDirName = this.importModelConfig.fromDirName
      }

      this.importModelConfig.repsOfName = this.importModelConfig.repsOfName || []
      this.importModelConfig.repsOfDesc = this.importModelConfig.repsOfDesc || []

      this.repsOfName = this.importModelConfig.repsOfName
      this.repsOfDesc = this.importModelConfig.repsOfDesc

      this.importDialogVisible = true
      return
    },
    importModel() {
      this.loading = this.$loading({
        lock: true,
        text: 'importing ...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      })

      this.importModelConfig.repsOfName = this.repsOfName
      this.importModelConfig.repsOfDesc = this.repsOfDesc
      mapi.importModel(this.importModelConfig).then((res) => {
        this.$msg(`共导入算法${res.algCount || 0}个, 模型${res.pageCount || 0}页, 模块${res.blockCount || 0}个,`, '导入模型成功')
        // 回写配置文件, 记住配置
        this.$store.dispatch('exportModel', this.importModelConfig)
      }).catch(err => {
        if (err !== 'cancel') {
          this.$msg.error(err, '导入模型失败')
        }
      }).finally(() => {
        this.importDialogVisible = false
        this.refresh()
        this.$store.dispatch('AlgGetAll')
        this.loading && this.loading.close()
      })
    },
    appendReplaceOfName() {
      this.repsOfName = this.repsOfName || []
      this.repsOfName.push({
        old: '',
        new: ''
      })
    },
    removeReplaceOfName(idx) {
      this.repsOfName.splice(idx, 1)
    },
    appendReplaceOfDesc() {
      this.repsOfDesc = this.repsOfDesc || []
      this.repsOfDesc.push({
        old: '',
        new: ''
      })
    },
    removeReplaceOfDesc(idx) {
      this.repsOfDesc.splice(idx, 1)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .tree-container {
    padding: 0px;
    margin: 0px;
    height: 100%;
  }
  .ztree {
    padding: 0px;
  }
</style>
