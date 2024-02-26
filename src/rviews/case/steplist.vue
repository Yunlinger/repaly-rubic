<template>
  <rubik-dialog
    :title="title"
    width="800px"
    height="600px"
    top="100px"
    right="32px"
    @closed="onClose"
  >
    <div :style="{ height: '100%', width: '100%', padding: '1px'}">
      <div>
        <!-- <el-button type="primary" @click="dispatchCurrent">下发</el-button> -->
        <el-button type="primary" :disabled="restart" @click="startCurrent">重新开始</el-button>
        <el-button type="primary" :disabled="!restart" @click="commitCurrent">提交</el-button>
        <el-button type="danger" :disabled="!restart" @click="giveupCurrent">放弃</el-button>
        <span style="margin-left: 10px;">倒计时：{{ formatModelTimeString(remainTime * 1000) }}</span>
        <span v-if="!restart" style="float: right;margin-right: 10px;">
          考试得分
          <span style="font-size: 16px; color: red">
            {{ finalScore.toFixed(2) }}
          </span>
        </span>
      </div>
      <div class="diagram" style="width: 100%; display: flex; justify-content: space-between">
        <el-table
          :data="steps"
          border
          stripe
          style="width:100%;"
          height="100%"
          :show-header="true"
          :cell-style="{padding:'0px'}"
        >
          <el-table-column
            type="index"
            label="序号"
            width="52"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="操作项目"
          >
            <template slot-scope="{ row }">
              <span :style="{ color: row.status===1 || row.status===2?'green':'black' }">{{ `${row.name||''} ${row.tip||''}` }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="执行情况"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag v-if="(row.status == 1)" type="primary" size="mini">执行成功</el-tag>
              <el-tag v-if="(row.status == 2)" type="primary" size="mini">计分</el-tag>
              <el-tag v-if="(row.status == 3)" type="danger" size="mini">未计分</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="score"
            label="得分"
            width="52"
          >
            <template slot-scope="{ row }">
              <span>{{ (row.status === 1 || row.status === 2 ? ((row.score || 0) / totalScore * 100).toFixed(2) : '') }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </rubik-dialog>
</template>

<script>
import RubikDialog from '@/components/Dialog/Wrapper'
import * as api from '@/api/case'
import store from '@/store'
import { formatModelTimeString } from '@/utils'

export default {
  name: 'StepListDialog',
  components: { RubikDialog },
  data() {
    return {
      title: '当前案例',
      case: null,
      logging: false,
      steps: [],
      finalScore: 0,
      remainTime: 0,
      restart: true,
      totalScore: 100
    }
  },
  computed: {
    cas: function() {
      return this.case
    },
    project: function() {
      return store.getters.project
    }
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
  },
  mounted() {
    const id = store.getters.selectedInst.case || 0
    this.id = parseInt(id)
    if (this.id > 0) {
      this.fetchData()
    }
    this.$on('global:public.case.dispatch', msg => {
      // 有新任务下发
      this.fetchData()
    })
    this.$on('global:case.step.finish', msg => {
      if (msg.data.caseid === this.case.id) {
        let step = this.case.stepList[msg.data.stepid]
        if (step) {
          step.status = msg.data.status
          // refresh
          this.steps = [...this.steps]
        }
      }
    })
    this.$on('global:case.finish', msg => {
      if (msg.data.caseid === this.case.id) {
        this.finalScore = msg.data.score
        this.$msg.success('考试结束，分数: ' + msg.data.score)
        this.restart = false
        this.fetchData()
      }
    })
    this.$on('global:store.updateInst', (inst) => {
      if (inst.project === this.project.project && inst.id === this.project.id) {
        this.remainTime = inst.remainTime
      }
    })
  },
  methods: {
    formatModelTimeString(ms) {
      return formatModelTimeString(ms)
    },
    onClose() {
      this.$off('global:public.case.dispatch')
      this.$off('global:case.step.finish')
      this.$off('global:case.finish')
    },
    fetchData() {
      api.taskGet(this.id).then(res => {
        this.steps = []
        res = res || {}
        this.case = res
        this.case.stepList = this.case.stepList || {}
        this.title = ` 案例${this.id}: ${this.case.name}`
        let totalScore = 0
        for (let id in this.case.stepList) {
          let step = this.case.stepList[id]
          this.steps.push(step)
          totalScore += (step.score || 0)
        }
        this.totalScore = totalScore
        this.steps.sort(this.compareStep)
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    before(step1, step2) {
      if (!step2) {
        return false
      }
      let befores = new Set([...(step2.parents || []), ...(step2.enables || [])])
      if (befores.has(step1.id)) {
        return true
      }
      let values = befores.values()
      for (let value of values) {
        if (this.case.stepList[value] && this.before(step1, this.case.stepList[value])) {
          return true
        }
      }
      return false
    },
    compareStep(step1, step2) {
      if (step1.id === step2.id) {
        return 0
      }
      if (this.before(step1, step2)) {
        return -1
      }
      return 1
    },
    dispatchCurrent() {
      api.dispatch(this.case.id).then(() => {
        this.$msg.success('下发成功')
        this.fetchData()
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    startCurrent() {
      api.dispatch(this.case.id).then(() => {
        return api.start(this.case.id)
      }).then(() => {
        this.restart = true
        this.$msg.success(this.case.name, '启动案例成功')
      }).catch(err => {
        this.$msg.error(err, '启动案例失败')
      })
    },
    giveupCurrent() {
      api.giveup(this.case.id).then(() => {
        this.$msg.warning('放弃当前案例')
        this.restart = false
        this.fetchData()
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    commitCurrent() {
      api.commit(this.case.id).then(() => {
        this.$msg.success('提交成功')
        this.fetchData()
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    openCase(id) {
      this.id = id
      this.fetchData()
    }
  }
}

</script>

<style lang="scss" scoped>
  .diagram{
    width: 100%;
    height: calc(100% - 30px);
    background-color: #f0f0f0;
  }
</style>
