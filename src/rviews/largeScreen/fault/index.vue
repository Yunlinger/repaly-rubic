<template>
  <tree
    :setting="setting"
    :nodes="nodes"
    @onClick="onClick"
    @onDblClick="onDblClick"
    @onExpand="onExpand"
    @onCollapse="onCollapse"
  />
</template>

<script>
import tree from '@/components/ztree'
import * as api from '@/api/fault'
import { mapGetters } from 'vuex'

export default {
  name: 'FaultEdit',
  components: { tree },
  data() {
    return {
      listLoading: true,
      treeObj: null,
      currentNode: null,
      nodes: [],
      lproject: '',
      lid: '',
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
          showIcon: false,
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
    ...mapGetters(['project'])
  },
  watch: {
    project: {
      deep: true,
      handler: function(val, oldVal) {
        if (val.project !== this.lproject || val.id !== this.lid) {
          console.log('fault_update')
          this.updateTree()
          this.lproject = val.project
          this.lid = val.id
        }
      }
    }
  },
  created() {
    this.updateTree()
  },
  methods: {
    strcmp(str1, str2) {
      return ((str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1))
    },
    updateTree() {
      this.nodes = []
      api.tree().then(response => {
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
        return api.list()
      }).then(response => {
        for (const id in response.items) {
          const item = response.items[id]
          this.nodes.push({
            ... item,
            id: id,
            pid: item.sort ? (item.sort + 65532) : 0,
            isParent: false,
            data: item
          })
        }
        this.nodes.sort((a, b) => {
          return this.strcmp(a.name, b.name)
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
            // this.treeObj.removeNode(node)
            this.updateTree()
          }).catch(() => {})
        }
      } else {
        this.$confirm('确定删除故障 ' + node.data.name + ' ?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return api.listDel(node.data.id)
        }).then(() => {
          // this.treeObj.removeNode(node)
          this.updateTree()
        }).catch(() => {})
      }
    },
    onCreated(treeObj) {
      this.treeObj = treeObj
    },
    onCheck(e, id, node) {
      console.log('onCkeck', node)
    },
    onClick(e, id, node) {
      this.currentNode = node
      console.log('onClick', node)
    },
    onDblClick(e, id, node) {
      this.currentNode = node
      if (node.isParent) {
        return
      }

      this.$confirm('加入故障 ' + node.data.name + ' ?', '提示', {
        confirmButtonText: '加入',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.start(node.data.id)
      }).then(() => {
      }).catch(() => {})
    },
    onRightClick(e, id, node) {
      this.currentNode = node
      console.log('onRightClick', node)
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
          // node.name = newName
          // this.treeObj.refresh()
          this.updateTree()
        }).catch(() => {})
      } else {
        const t = { ...node.data }
        t.name = newName
        api.listUpdate(t).then(() => {
          // node.name = newName
          // this.treeObj.refresh()
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
            // node.data = nd
            // this.treeObj.moveNode(target, node, 'inner', false)
            this.updateTree()
          }).catch(() => {})
        } else if (target) {
          const t = { ...node.data, sort: target.data.id }
          api.listUpdate(t).then((nd) => {
            // node.data = nd
            // this.treeObj.moveNode(target, node, 'inner', false)
            this.updateTree()
          }).catch(() => {})
        }
      }
      return false
    },
    newFault() {
      if (this.currentNode) {
        let sort = 0
        if (this.currentNode.isParent) {
          sort = this.currentNode.data.id
        } else {
          sort = this.currentNode.data.sort
        }
        api.listNew({ sort: sort, name: '新建故障' }).then(() => {
          this.updateTree()
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
      }).catch(() => {})
    },
    copyFault() {
      if (!this.currentNode) {
        return
      }
      const fault = { ...this.currentNode.data, id: 0 }
      api.listNew(fault).then(res => {
        this.updateTree()
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

<style lang="scss">
  .ztree {
    color: #5ab1ef;
    li {
      a {
        color: #5ab1ef;
        &.curSelectedNode {
          color: #5ab1ef;
          background-color: transparent;
          border: 1px #5ab1ef solid;
        }
      }
    }
  }
</style>
