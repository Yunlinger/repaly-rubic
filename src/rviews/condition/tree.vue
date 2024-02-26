<template>
  <div v-contextmenu:contextmenu style="background-color: rgb(238, 241, 246); height: 100%; width: 100%; overflow: auto;">
    <tree
      v-contextmenu:contextmenu
      :setting="setting"
      :nodes="nodes"
      :beforeRemove="beforeRemove"
      :beforeRename="beforeRename"
      :beforeDrop="beforeDrop"
      @onClick="onClick"
      @onDblClick="onDblClick"
      @onRightClick="onRightClick"
      @onCreated="onCreated"
      @onCheck="onCheck"
      @onExpand="onExpand"
      @onCollapse="onCollapse"
    />
    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item @click="newCondition">新建工况</v-contextmenu-item>
      <v-contextmenu-item @click="newSort">新建分类</v-contextmenu-item>
      <v-contextmenu-item @click="expandAll">展开全部</v-contextmenu-item>
      <v-contextmenu-item @click="updateTree">刷新</v-contextmenu-item>
      <v-contextmenu-item divider></v-contextmenu-item>
      <v-contextmenu-item @click="loadCondition">加载工况</v-contextmenu-item>
      <v-contextmenu-item @click="saveCondition">保存工况</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
import tree from '@/components/ztree'
import * as api from '@/api/condition'

export default {
  name: 'ConditionTree',
  components: { tree },
  props: {
    editable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      listLoading: false,
      treeObj: null,
      currentNode: null,
      nodes: [],
      expand: {}, // 记录节点展开信息
      setting: {
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
          enable: true
        }
      }
    }
  },
  mounted() {
    // 根据 editable 调整 tree 的属性
    this.setting.edit.enable = !!this.editable

    this.updateTree()
    this.$on('global:project.open', () => {
      this.updateTree()
    })
  },
  methods: {
    strcmp(a, b) {
      if (a.isParent !== b.isParent) {
        return (a.isParent > b.isParent ? -1 : 1)
      }
      return a.id - b.id
    },
    updateTree() {
      if (this.listLoading) {
        return
      }
      this.listLoading = true
      this.nodes = []
      let nodes = []
      return api.listCond().then(response => {
        for (const id in response.items) {
          const item = response.items[id]
          nodes.push({
            ... item,
            id: id,
            pid: item.sort ? (item.sort + 65532) : 0,
            isParent: false,
            data: item
          })
        }
        nodes.sort((a, b) => {
          return this.strcmp(a, b)
        })
        this.nodes = nodes
      }).catch(() => {
        this.nodes = []
      }).finally(() => {
        this.listLoading = false
      })
    },
    removeNode(node) {
      if (node.isParent) {
        if (node.children && node.children.length) {
          this.$msg.warning('目录非空，不能删除')
        } else {
          this.$confirm('确定删除分类 ' + node.data.name + ' ?', '提示', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            return api.treeDel(node.data.id)
          }).then(() => {
            this.updateTree()
          }).catch(() => {})
        }
      } else {
        this.$confirm('确定删除 ' + node.data.name + ' ?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return api.delCond(node.data.id)
        }).then(() => {
          this.updateTree()
        }).catch(() => {})
      }
    },
    onCreated(treeObj) {
      this.treeObj = treeObj
    },
    onCheck(e, id, node) {
      // console.log('onCkeck', node)
    },
    onClick(e, id, node) {
      this.currentNode = node
      // console.log('onClick', node)
    },
    onDblClick(e, id, node) {
      this.currentNode = node
      this.loadCondition()
      // console.log('onDblClick', node)
    },
    onRightClick(e, id, node) {
      this.currentNode = node
      // console.log('onRightClick', node)
    },
    beforeRename(id, node, newName, isCancel) {
      if (isCancel) {
        return true
      }
      if (newName === node.name) {
        return true
      }
      if (!newName) {
        this.treeObj.cancelEditName()
        return false
      }
      if (node.isParent) {
        const t = { ...node.data }
        t.name = newName
        api.treeUpdate(t).then(() => {
          this.updateTree()
        }).catch(() => {})
      } else {
        const t = { ...node.data }
        t.name = newName
        api.updateCond(t).then(() => {
          this.updateTree()
        }).catch(() => {})
      }
      this.treeObj.cancelEditName()
      return false
    },
    beforeRemove(id, node) {
      this.removeNode(node)
      return false
    },
    beforeDrop(id, nodes, target, moveType, isCopy) {
      if (target && !target.isParent) {
        return false
      }
      for (const node of nodes) {
        if (node.isParent) {
          let parent = 0
          if (target) {
            parent = target.data.id
          }
          const t = { ...node.data, parent: parent }
          api.treeUpdate(t).then((nd) => {
            this.updateTree()
          }).catch(() => {})
        } else if (target) {
          const t = { ...node.data, sort: target.data.id }
          api.updateCond(t).then((nd) => {
            this.updateTree()
          }).catch(() => {})
        }
      }
      return false
    },
    newCondition() {
      if (this.currentNode) {
        let sort = 0
        if (this.currentNode.isParent) {
          sort = this.currentNode.data.id
        } else {
          sort = this.currentNode.data.sort
        }
        api.newCond({ sort: sort, name: '新建工况' }).then(() => {
          this.updateTree()
        }).catch(() => {})
      }
    },
    loadCondition() {
      if (this.currentNode) {
        if (this.currentNode.isParent) {
          return
        }
        this.$confirm(`确定加载工况: ${this.currentNode.data.name}`).then(() => {
          let id = this.currentNode.data.id
          this.loading = this.$loading({
            lock: true,
            text: `正在加载工况: ${this.currentNode.data.name}`,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)'
          })
          return api.loadCond(id)
        }).then(() => {
          this.$msg.success(this.currentNode.data.name, '加载工况成功')
        }).catch((err) => {
          this.$msg.error(this.currentNode.data.name + err, '加载工况失败')
        }).finally(() => {
          this.loading && this.loading.close()
        })
      }
    },
    saveCondition() {
      if (this.currentNode) {
        if (this.currentNode.isParent) {
          return
        }
        this.$confirm(`确定保存工况: ${this.currentNode.data.name}`).then(() => {
          let id = this.currentNode.data.id
          this.loading = this.$loading({
            lock: true,
            text: `正在保存工况: ${this.currentNode.data.name}`,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)'
          })
          return api.saveCond(id)
        }).then(() => {
          this.$msg.success(this.currentNode.data.name, '保存工况成功')
        }).catch((err) => {
          this.$msg.error(err, '保存工况失败')
        }).finally(() => {
          this.loading && this.loading.close()
        })
      }
    },
    newSort() {
      let parent = 0
      if (this.currentNode) {
        if (this.currentNode.isParent) {
          parent = this.currentNode.data.id
        } else {
          parent = this.currentNode.data.sort
        }
      }
      api.treeNew({ parent: parent, name: '新建分类' }).then(() => {
        this.updateTree()
        api.save()
      }).catch(() => {})
    },
    expandAll() {
      this.treeObj.expandAll(true)
    },
    onExpand(e, id, node) {
      this.expand[node.data.id] = true
    },
    onCollapse(e, id, node) {
      this.expand[node.data.id] = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    padding: 0px;
    margin: 0;
    >>> .el-aside {
      padding: 0;
    }
  }
  .container {
    height: calc(100vh - 112px);
  }
</style>
