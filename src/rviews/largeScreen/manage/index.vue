<template>
  <table class="table">
    <!-- <thead>
      <tr>
        <th class="col-md-2">{{ "" }}</th>
        <th class="col-md-2">{{ "" }}</th>
        <th class="col-md-4">{{ "" }}</th>
        <th class="col-md-4">{{ "" }}</th>
      </tr>
    </thead> -->
    <tbody>
      <template v-for="(item, index) in projects">
        <tr :key="index">
          <td class="index">{{ index + 1 }}</td>
          <td class="align-left">{{ item.name }}</td>
          <td class="op">
            <span class="btn" @click="startInstance(item.name, 'model')">新建分组</span>
          </td>
        </tr>
        <template v-for="node in nodes">
          <template v-if="node.project == item.name">
            <tr :key="node.name">
              <td class="index">
                {{ isSelected(node) ? ('✅' ) : '' }}
              </td>
              <td class="name" @click="selectInstance(node.project, node.model, node.id)">
                {{ node.name }}
              </td>
              <td class="op">
                <span class="btn" @click="modelStart(node.project, node.model, node.id)">
                  运行
                </span>
                <span class="btn" @click="modelPause(node.project, node.model, node.id)">
                  停止
                </span>
                <span class="btn" @click="modelStop(node.project, node.model, node.id)">
                  退出
                </span>
              </td>
            </tr>
          </template>
        </template>
      </template>
    </tbody>
  </table>
</template>

<script>
import * as mapi from '@/api/model'
import * as papi from '@/api/project'

export default {
  name: 'TeacherModelManage',
  data() {
    return {
      projects: [],
      nodes: []
    }
  },
  mounted() {
    this.updateData()
    this.startTimer()
  },
  destroyed() {
    this.stopTimer()
  },
  methods: {
    updateData() {
      this.projects = []
      this.nodes = []
      papi.list().then(response => {
        for (const name in response.items) {
          const node = response.items[name]
          this.projects.push({
            ... node,
            name: name,
            isParent: true
          })
        }
        return papi.getServerList('Model')
      }).then((response) => {
        response.items = response.items || {}
        for (const name in response.items) {
          const node = response.items[name]
          this.nodes.push({
            ... node,
            name: `${node.project}.${node.id}`,
            isParent: false
          })
        }
      }).catch(() => {})
    },
    updateInstanceNode() {
      papi.getServerList('Model').then((response) => {
        this.nodes = []
        response.items = response.items || {}
        this.$store.dispatch('setInstances', response.items)
        for (const name in response.items) {
          const node = response.items[name]
          this.nodes.push({
            ... node,
            name: `${node.project}.${node.id}`,
            isParent: false
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
    startInstance(project, model) {
      papi.startInstance(project, model)
    },
    modelStart(project, model, id) {
      this.selectInstance(project, model, id)
      mapi.modelStart(true).then(() => {})
    },
    modelPause(project, model, id) {
      this.selectInstance(project, model, id)
      mapi.modelStart(false).then(() => {})
    },
    modelStop(project, model, id) {
      papi.stopInstance(project, model, id)
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.updateInstanceNode()
      }, 1000)
    },
    stopTimer() {
      this.timer && clearInterval(this.timer)
    },
    isSelected(node) {
      if (node.project === this.$store.getters.project.project &&
          node.id === this.$store.getters.project.id) {
        return true
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
  .table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    .align-left {text-align: left;}
    .index {width: 48px;}
    .name {
      &:hover {
        cursor: pointer;
        font-weight: bolder;
        color: #ff0;
      }
    }
    .op {
      width: 120px;
      .btn{
        &:hover {
          cursor: pointer;
          font-weight: bolder;
          color: #ff0;
        }
      }
    }
    tr {
      border: none;
      th {
        font-size: 1.0rem;
        text-align: center;
        background-color: transparent;
        color: #fffdef;
        border: 1px solid#0086B3;
      }
      td {
        font-size: 0.8rem;
        text-align: center;
        border: 1px solid#0086B3;
        color: #19d4ae;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 4px;
      }
    }
  }
</style>
