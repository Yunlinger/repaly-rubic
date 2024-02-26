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
      <v-contextmenu-item @click="newTask">新建案例</v-contextmenu-item>
      <v-contextmenu-item @click="newSort">新建分类</v-contextmenu-item>
      <v-contextmenu-item @click="expandAll">展开全部</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
import tree from '@/components/ztree'
import * as api from '@/api/case'

export default {
  name: 'CaseTree',
  components: { tree },
  data() {
    return {
      listLoading: true,
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
          enable: false
        }
      }
    }
  },
  events: ['openCase'],
  mounted() {
    this.$on('global:project.open', () => {
      this.updateTree()
    })
  },
  created() {
    this.updateTree()
  },
  methods: {
    strcmp(a, b) {
      if (a.isParent !== b.isParent) {
        return (a.isParent > b.isParent ? -1 : 1)
      }
      return ((a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1))
    },
    updateTree() {
      this.nodes = []
      api.treeList().then(response => {
        for (const node of response.nodes) {
          this.nodes.push({
            ... node,
            id: node.id + 65532,
            pid: node.parent ? (node.parent + 65532) : 0,
            isParent: true,
            data: node,
            open: !!this.expand[node.id] || !node.parent
          })
        }
        return api.taskList()
      }).then(response => {
        for (const id in response.items) {
          const item = response.items[id]
          item.ops = item.ops || []
          this.nodes.push({
            ... item,
            id: id,
            pid: item.sort ? (item.sort + 65532) : 0,
            isParent: false,
            data: item
          })
        }
        this.nodes.sort((a, b) => {
          return this.strcmp(a, b)
        })
      }).catch(() => {})
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
            api.save()
            this.updateTree()
          }).catch(() => {})
        }
      } else {
        this.$confirm('确定删除故障 ' + node.data.name + ' ?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return api.taskDel(node.data.id)
        }).then(() => {
          api.save()
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
      if (this.currentNode) {
        if (!this.currentNode.isParent) {
          this.$emit('openCase', this.currentNode.data.id)
        }
      }
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
          api.save()
        }).catch(() => {})
      } else {
        const t = { ...node.data }
        t.name = newName
        api.taskUpdate(t).then(() => {
          this.updateTree()
          api.save()
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
            api.save()
            this.updateTree()
          }).catch(() => {})
        } else if (target) {
          const t = { ...node.data, sort: target.data.id }
          api.taskUpdate(t).then((nd) => {
            api.save()
            this.updateTree()
          }).catch(() => {})
        }
      }
      return false
    },
    newTask() {
      if (this.currentNode) {
        let sort = 0
        if (this.currentNode.isParent) {
          sort = this.currentNode.data.id
        } else {
          sort = this.currentNode.data.sort
        }
        api.taskNew({ sort: sort, name: '新建案例' }).then(() => {
          this.updateTree()
          api.save()
        }).catch(() => {})
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
