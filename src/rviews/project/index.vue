<template>
  <div class="app-container">
    <el-container height="800px">
      <el-aside width="360px" style="background-color: rgb(238, 241, 246)">
        <tree
          v-contextmenu:contextmenu
          :setting="setting"
          :nodes="nodes"
          @onDblClick="onDblClick"
          @onClick="onClick"
        />
        <!-- :beforeRemove="beforeRemove"
          :beforeRename="beforeRename"
          :beforeDrop="beforeDrop"
          @onClick="onClick"
          @onRightClick="onRightClick"
          @onCreated="onCreated"
          @onCheck="onCheck"
          @onExpand="onExpand"
          @onCollapse="onCollapse" -->
        <v-contextmenu ref="contextmenu">
          <v-contextmenu-item @click="updateTree">刷新</v-contextmenu-item>
        </v-contextmenu>
      </el-aside>
      <el-main>
        <!-- <el-input v-model="currentModel" placeholder="" :readonly="true">
          <template slot="prepend">当前打开的模型实例：</template>
        </el-input>
        <br> -->
        <el-button v-if="currentNode && currentNode.isParent" type="primary" @click="startInstance">启动新实例</el-button>
        <el-button v-if="currentNode && !currentNode.isParent" type="primary" @click="save">存盘</el-button>
        <el-button v-if="currentNode && !currentNode.isParent" type="primary" @click="modelStart">运行</el-button>
        <el-button v-if="currentNode && !currentNode.isParent" type="primary" @click="modelPause">停止</el-button>
        <el-button v-if="currentNode && !currentNode.isParent" type="primary" @click="modelStop">退出</el-button>
        <el-button v-if="currentNode && !currentNode.isParent" type="primary" @click="openDCSFull">打开DCS</el-button>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import * as mapi from '@/api/model'
import * as papi from '@/api/project'
import screenfull from 'screenfull'
import tree from '@/components/ztree'

export default {
  name: 'ProjectOp',
  components: { tree },
  data() {
    return {
      treeObj: null,
      currentNode: null,
      nodes: [],
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
  computed: {
    currentModel: function() {
      return this.$store.getters.project.project + '.' + this.$store.getters.project.id
    }
  },
  created() {
    this.updateTree()
  },
  methods: {
    updateTree() {
      this.nodes = []
      papi.list().then(response => {
        for (const name in response.items) {
          const node = response.items[name]
          this.nodes.push({
            name: node.name,
            id: node.name,
            pid: 0,
            isParent: true,
            data: node,
            open: true
          })
        }
        return papi.getServerList('Model')
      }).then((response) => {
        response.items = response.items || {}
        for (const name in response.items) {
          const node = response.items[name]
          this.nodes.push({
            name: `${node.project}.${node.id}`,
            id: `${node.project}.${node.id}`,
            pid: node.project,
            isParent: false,
            data: node
          })
        }
      }).catch(() => {})
    },
    selectInstance(project, model, id) {
      this.$store.dispatch('openProject', {
        project: project,
        model: model,
        id: id
      })
    },
    openDCSFull() {
      if (screenfull.enabled) {
        screenfull.request()
      }
      this.$router.push({ path: '/framefull/foxboro' })
    },
    openDCSTab() {
      this.$router.push({ path: '/frame/foxboro' })
    },
    save() {
      mapi.modelStart(false).then(() => {
        return mapi.modelSave()
      }).then(res => {
        this.$msg.success('保存成功')
      }).catch(info => {
        this.$msg.error('保存失败: ' + info.error)
      })
    },
    modelStart() {
      mapi.modelStart(true).then(() => {})
    },
    modelPause() {
      mapi.modelStart(false).then(() => {})
    },
    modelStop() {
      if (this.currentNode && !this.currentNode.isParent) {
        const { project, model, id } = this.currentNode.data
        papi.stopInstance(project, model, id).then(() => {
          let loop = 0
          const timer = setInterval(() => {
            papi.getServerList('Model').then(response => {
              response.items = response.items || {}
              if (!response.items[`${project}/${model}/${id}/`]) {
                clearInterval(timer)
                this.currentNode = null
                this.updateTree()
                this.$msg.success(`退出模型 ${project}.${model}.${id} 成功!`)
                return
              }
              loop = loop + 1
              if (loop > 32) {
                clearInterval(timer)
                return
              }
            })
          }, 1000)
        })
      }
    },
    startInstance() {
      if (this.currentNode && this.currentNode.isParent) {
        const project = this.currentNode.name
        const model = 'model'
        let id = 0
        papi.getServerList('Model').then(response => {
          response.items = response.items || {}
          while (response.items[`${project}/${model}/${id}/`]) {
            id = id + 1
          }
          return papi.startInstance(project, model, `${id}`)
        }).then(() => {
          let loop = 0
          const timer = setInterval(() => {
            papi.getServerList('Model').then(response => {
              response.items = response.items || {}
              if (response.items[`${project}/${model}/${id}/`]) {
                clearInterval(timer)
                this.updateTree()
                this.$msg.success(`装载模型 ${project}.${model}.${id} 成功!`)
                return
              }
              loop = loop + 1
              if (loop > 32) {
                clearInterval(timer)
                return
              }
            })
          }, 1000)
        })
      }
    },
    onDblClick(e, id, node) {
      if (node.data.project) {
        this.$store.dispatch('tagsView/delAllViews').then(() => {
          this.selectInstance(node.data.project, node.data.model, node.data.id)
          this.$router.push({ path: '/engineer/model/explorer' })
        })
      }
    },
    onClick(e, id, node) {
      this.currentNode = node
      if (node.data.project) {
        this.$store.dispatch('tagsView/delAllViews').then(() => {
          this.selectInstance(node.data.project, node.data.model, node.data.id)
        })
      }
    }
  }
}
</script>
