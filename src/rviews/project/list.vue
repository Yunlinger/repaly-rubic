<template>
  <div class="app-container">
    <div v-for="project of projects" :key="project.name">
      <el-divider content-position="center">
        <span>{{ '工程: ' + project.name + '  ' }}</span>
        <el-button type="text" size="mini" @click="instanceStart(project.name)">新建实例</el-button>
      </el-divider>
      <div class="group-wrapper">
        <div v-for="ins of project.instances" :key="ins.id">
          <el-card
            :style="{ width: '220px', margin: '10px' }"
            :body-style="{ padding: '5px', 'background': (currentModel == ins.project+'.'+ins.id) ? 'lightgreen' : ''}"
            @click.native="selectInstance(ins.project, ins.model, ins.id)"
            @dblclick.native="openModel(ins.project, ins.model, ins.id)"
          >
            <div style="padding: 8px; text-align: center">
              <span class="ptitle">{{ '实例ID: ' + ins.id }}</span>
              <span class="time">{{ '模型时间:' + formatModelTimeString(ins.time) }}</span>
              <el-button-group class="bottom">
                <el-button type="primary" size="mini" :disabled="isDisabled(ins.project, ins.id)" @click="modelStart">运行</el-button>
                <el-button type="primary" size="mini" :disabled="isDisabled(ins.project, ins.id)" @click="modelPause">暂停</el-button>
                <el-button type="danger" size="mini" :disabled="isDisabled(ins.project, ins.id)" @click="instanceExit(ins.project, ins.model, ins.id)">退出</el-button>
              </el-button-group>
              <el-button-group class="bottom">
                <el-button type="primary" size="mini" :disabled="isDisabled(ins.project, ins.id)" @click="openModel(ins.project, ins.model, ins.id)">模型</el-button>
                <el-button type="primary" size="mini" :disabled="isDisabled(ins.project, ins.id)" @click="openDCS">画面</el-button>
                <el-button type="primary" size="mini" :disabled="isDisabled(ins.project, ins.id)" @click="save">保存</el-button>
              </el-button-group>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as mapi from '@/api/model'
import * as papi from '@/api/project'
import screenfull from 'screenfull'

export default {
  name: 'ProjectList',
  data() {
    return {
      projects: {}
    }
  },
  computed: {
    currentModel: function() {
      return this.$store.getters.project.project + '.' + this.$store.getters.project.id
    },
    instances: function() {
      return this.$store.getters.project.instances
    }
  },
  mounted() {
    this.getProList()
    this.$on('global:instance.created', () => {
      this.updateInstance()
    })
    this.$on('global:instance.updated', () => {
      this.updateInstance()
    })
    this.timer = setInterval(() => {
      this.updateInstance()
    }, 2000)
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    getProList() {
      papi.list().then(response => {
        this.projects = response.items || {}
      })
    },
    updateInstance() {
      // 清空原来的实例
      let projects = { ...this.projects }
      for (let name in projects) {
        delete (projects[name].instances)
      }
      // 处理接收数据
      for (const name in this.instances) {
        const node = this.instances[name]
        if (projects[node.project]) {
          projects[node.project].instances = projects[node.project].instances || {}
          projects[node.project].instances[name] = node
        }
      }
      this.projects = projects
    },
    selectInstance(project, model, id) {
      if (this.currentModel !== project + '.' + id) {
        this.$store.dispatch('tagsView/delAllViews').then(() => {
          this.$store.dispatch('openProject', {
            project: project,
            model: model,
            id: id
          })
        })
      }
    },
    openModel(project, model, id) {
      if (project) {
        this.$store.dispatch('tagsView/delAllViews').then(() => {
          this.selectInstance(project, model, id)
          this.$router.push({ path: '/engineer/model/explorer' })
        })
      }
    },
    openDCS() {
      if (screenfull.enabled) {
        screenfull.request()
      }
      this.$router.push({ path: '/framefull/foxboro' })
    },
    modelStart() {
      mapi.modelStart(true).then(() => {})
    },
    modelPause() {
      mapi.modelStart(false).then(() => {})
    },
    instanceStart(project) {
      papi.startInstance(project, 'model').then(() => {
      })
    },
    instanceExit(project, model, id) {
      this.$confirm(`确定退出模型 ${project}.${id}?`, '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return papi.stopInstance(project, model, id)
      }).catch(() => {
      })
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
    formatModelTimeString(time) {
      let second = Math.floor((time || 0) / 1000)
      let hour = Math.floor(second / 3600)
      let min = Math.floor((second - 3600 * hour) / 60)
      second = second % 60
      if (second < 10) {
        second = '0' + second
      }
      if (min < 10) {
        min = '0' + min
      }
      if (hour < 10) {
        hour = '0' + hour
      }
      return hour + ':' + min + ':' + second
    },
    isDisabled: function(project, id) {
      return !(this.$store.getters.project.project === project && this.$store.getters.project.id === id)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.group-wrapper {
  margin: 0 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: left;
}

.time {
  font-size: 13px;
  color: #999;
}

.ptitle
{
  font-size: 16px;
}

.bottom {
  margin: 13px auto 0px;
  line-height: 12px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:before,
.clearfix:after {
  clear: both;
}
</style>
