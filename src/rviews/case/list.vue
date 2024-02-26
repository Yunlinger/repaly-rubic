<template>
  <div
    class="views"
    style="width:100%;height:100%;"
  >
    <div style="width: 100%; height: 28px;display: flex;align-items: center;justify-content: space-between;">
      <div style="width: 40px;text-align: center;cursor: pointer;color: #FFF;"><i class="el-icon-refresh icon-button" @click="updateTree(project.project)" /></div>
      <!-- <div v-if="faultshow" style="float: right;width: 85px;font-size: 15px;line-height: 28px;margin-right:5px;border-radius: 5px;background-color: #909399;text-align: center;color: #FFF;cursor: pointer;" @click="startAll">投入全部</div> -->
    </div>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item v-for="(item, index) in nodes" :key="item.id" :title="item.name" :name="String(index)">
        <div ref="collapse" class="collapse-item" :style="[collapseStyle]">
          <div v-for="(ite, idx) in item.children" :key="ite.id" class="item">
            <div style="width: calc(100% - 60px);" @click="hoverIn(item.children, ite)">{{ idx + 1 }}、 {{ ite.name }}</div>
            <el-button v-if="ite.hover" type="success" @click="startCase(ite)">加载</el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as api from '@/api/case'
export default {
  props: {
    status: {
      type: Boolean,
      default: () => { return false }
    },
    projectCtlList: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      activeName: '0',
      nodes: [],
      collapseStyle: {
        height: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'selectedInst'
    ])
  },
  watch: {
    activeName(val, old) {
      if (val === '' && old !== 0) {
        this.activeName = '0'
      }
    }
  },
  mounted() {
    this.updateTree()
  },
  methods: {
    resizes() {
      let num = this.nodes.length
      this.collapseStyle.height = `calc(100vh - 70px - 41px - 48px * ${num})`
    },
    strcmp(a, b) {
      if (a.isParent !== b.isParent) {
        return (a.isParent > b.isParent ? -1 : 1)
      }
      return a.id - b.id
    },
    // 更新
    updateTree() {
      if (!this.$store.getters.token) {
        return
      }
      this.nodes = []
      let nodes = []
      api.treeList().then(response => {
        for (const node of response.nodes) {
          nodes.push(node)
        }
        return api.taskList()
      }).then(response => {
        let list = response.items || {}
        nodes.map(item => {
          item.children = []
          for (let i in list) {
            list[i].hover = false
            if (list[i].sort === Number(item.id)) {
              item.children.push(list[i])
            }
          }
          item.children.sort((a, b) => {
            return this.strcmp(a, b)
          })
        })
        this.nodes = nodes
        let num = nodes.length
        if (this.status) {
          this.resizes()
          return
        }
        this.collapseStyle.height = `calc(100vh - 70px - 28px - 48px * ${num})`
      }).catch(() => {
        this.nodes = []
      })
    },
    startCase(item) {
      if (this.projectCtlList.length > 1) {
        this.startCases(this.projectCtlList, item)
        return
      }
      this.$confirm('确定启动案例 ' + item.name + ' ?', '提示', {
        confirmButtonText: '启动',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.dispatch(item.id)
      }).then(() => {
        return api.start(item.id)
      }).then(() => {
        this.$msg.success(item.name, '启动案例成功')
      }).catch(err => {
        this.$msg.error(err, '启动案例失败')
      })
    },
    // 群控时执行，下发两个后会有一个收不到结束推送
    startCases(list, caseItem) {
      let all = list.map(async(ite) => {
        let params = {
          'rubik.project': ite.project,
          'rubik.model': 'model',
          'rubik.id': ite.id
        }
        // participants固定teacher
        return await api.dispatch(caseItem.id, ['teacher'], params).then(() => {
          api.start(caseItem.id, params)
        })
      })
      Promise.all(all)
    },
    hoverIn(list, ite) {
      list.map(item => {
        if (item.id === ite.id) {
          item.hover = true
        } else {
          item.hover = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.views {
  user-select: none;
  .collapse-item {
    display: block;
    height: calc(100vh - 70px - 28px - 48px * 3);
    overflow: auto;
    margin-bottom: -25px;
    color: #FFF;
    background: #485a77;
  }
  .item {
    height: 35px;
    padding-left: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    cursor: pointer;
  }
  .item:hover {
    color: #000;
    background-color: #caf982;
  }
  ::v-deep .el-collapse-item__header {
    padding-left: 5px;
    color: #FFF;
    background: #384763;
  }
}
</style>
