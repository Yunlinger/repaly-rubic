<template>
  <div class="app-container">
    <el-form label-width="100px" inline size="mini">
      <el-form-item :label="$t('显示所有分组')" style="height: 24px; width: 180px;">
        <el-switch
          v-model="showAll"
        >
        </el-switch>
      </el-form-item>
      <el-form-item :label="$t('操作')" style="height: 24px; width: 580px;">
        <el-button
          type="success"
          @click="beginCheckedCase"
        >
          {{ $t('开始任务') }}
        </el-button>
        <el-button
          type="success"
          @click="commitCheckedCase"
        >
          {{ $t('提交任务') }}
        </el-button>
        <el-button
          type="danger"
          @click="shutDownCheckedInst"
        >
          {{ $t('退出选中实例') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="instStatusTable"
      :data="instList"
      border
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      >
      </el-table-column>
      <el-table-column
        prop="project"
        :label="$t('工程名')"
        width="110"
      >
      </el-table-column>
      <el-table-column
        prop="id"
        :label="$t('ID')"
        width="60"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        :label="$t('实例名')"
        width="140"
      >
      </el-table-column>
      <el-table-column
        prop="caseName"
        :label="$t('案例')"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.caseName"
            type="success"
            style="cursor: pointer;"
            disable-transitions
            @click="showRunCase(scope.row)"
          >{{ scope.row.caseName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="conditionName"
        :label="$t('工况')"
      >
      </el-table-column>
      <el-table-column
        prop="faultName"
        :label="$t('故障')"
      >
      </el-table-column>
      <el-table-column
        prop="remainTime"
        :label="$t('仿真时间')"
        width="80"
      >
        <template slot-scope="scope">
          {{ formatModelTimeString(scope.row. time) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="remainTime"
        :label="$t('倒计时')"
        width="80"
      >
        <template slot-scope="scope">
          {{ formatModelTimeString(scope.row.remainTime * 1000) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="participants"
        :label="$t('参与者')"
      >
        <template slot-scope="scope">
          {{ (scope.row.participants || []).join() }}
        </template>
      </el-table-column>
      <el-table-column
        prop="caseStatus"
        :label="$t('状态')"
        width="60"
      >
        <template slot-scope="scope">
          <el-tag
            type="success"
            disable-transitions
          >{{ [$t('空闲'), $t('已下发'), $t('进行中'), $t('完成')][scope.row.caseStatus || 0] }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatModelTimeString } from '@/utils'
import { Loading } from 'element-ui'
import _ from 'lodash'

import * as api from '@/api/case'
import * as mapi from '@/api/model'
import * as papi from '@/api/project'

export default {
  name: 'TeacherStatus',
  data() {
    return {
      showAll: true,
      instList: [],
      selectedList: []
    }
  },

  computed: {
    ...mapGetters(['project']),
    myName: function() {
      return this.$store.getters.user.name
    }
  },
  watch: {
    showAll: {
      handler: function() {
        this.buildInstList(true)
      }
    }
  },
  mounted() {
    this.buildInstList()
    this.$on('global:store.deleteInst', () => {
      setTimeout(() => {
        this.buildInstList(true)
      }, 100)
    })
    this.$on('global:store.updateInst', () => {
      setTimeout(() => {
        this.buildInstList(true)
      }, 100)
    })
  },

  methods: {
    buildInstList(keepSelectedList) {
      let ret = []
      Object.keys(this.project.instances).forEach(key => {
        let inst = this.project.instances[key]
        if ((this.showAll || inst.duname === this.$store.getters.user.name) && // 当前登录教员下发任务的实例
          inst.id !== 'dev' // 显示非开发实例
        ) {
          ret.push(inst)
        }
      })
      this.instList = ret
      if (!keepSelectedList) {
        this.$refs.instStatusTable.clearSelection()
        this.selectedList = []
      } else {
        let selList = []
        for (let item of this.selectedList) {
          for (let instItem of this.instList) {
            if (item.project === instItem.project && item.id === instItem.id) {
              selList.push(instItem)
              break
            }
          }
        }
        this.selectedList = selList
        this.$nextTick(() => {
          for (let item of selList) {
            this.$refs.instStatusTable.toggleRowSelection(item, true)
          }
        })
      }
    },

    formatModelTimeString(ms) {
      return formatModelTimeString(ms)
    },

    handleSelectionChange(val) {
      this.selectedList = val
    },

    showRunCase(m) {
      this.$store.dispatch('openProject', m).then(() => {
        this.$router.push(`/teacher/case/run/${m.case || 0}`)
      })
    },

    async beginCheckedCase() {
      this.loading = Loading.service({
        lock: true,
        text: this.$t('开始任务'),
        background: 'rgba(0, 0, 0, 0.8)'
      })
      let insts = _.cloneDeep(this.selectedList)

      let all = []
      for (let idx in insts) {
        let inst = insts[idx]
        all.push(this.beginCase(inst))
        if (all.length >= 8) {
          try {
            await Promise.all(all)
            all = []
          } catch (error) {
            this.$msg.error(`${this.$t('下发任务错误')}, ${error}`)
          }
        }
      }
      if (all.length > 0) {
        try {
          await Promise.all(all)
          all = []
        } catch (error) {
          this.$msg.error(`${this.$t('下发任务错误')}, ${error}`)
        }
      }
      if (this.loading) {
        this.loading.close()
      }
    },

    async beginCase(m) {
      this.loading.text = `${this.$t('开始任务')}: ${m.name}`
      // await this.$store.dispatch('openProject', m)
      let params = {
        'rubik.project': m.project,
        'rubik.model': m.model || 'model',
        'rubik.id': m.id
      }
      await api.start(m.case, params)
      await mapi.modelStart(true, params)
    },

    async commitCheckedCase() {
      await this.$confirm('确定退出所选实例 ??? ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      this.loading = Loading.service({
        lock: true,
        text: this.$t('提交任务'),
        background: 'rgba(0, 0, 0, 0.8)'
      })
      let insts = _.cloneDeep(this.selectedList)
      let all = []
      for (let idx in insts) {
        let inst = insts[idx]
        all.push(this.commitCase(inst))
        if (all.length >= 8) {
          try {
            await Promise.all(all)
            all = []
          } catch (error) {
            this.$msg.error(`${this.$t('结束任务错误')}, ${error}`)
          }
        }
      }
      if (all.length > 0) {
        try {
          await Promise.all(all)
          all = []
        } catch (error) {
          this.$msg.error(`${this.$t('结束任务错误')}, ${error}`)
        }
      }
      if (this.loading) {
        this.loading.close()
      }
    },

    async commitCase(m) {
      this.loading.text = `${this.$t('结束任务')}: ${m.name}`
      // await this.$store.dispatch('openProject', m)
      let params = {
        'rubik.project': m.project,
        'rubik.model': m.model || 'model',
        'rubik.id': m.id
      }
      await api.commit(m.case, params)
    },

    async shutDownCheckedInst() {
      await this.$confirm('确定退出所选实例 ??? ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })

      this.loading = Loading.service({
        lock: true,
        text: this.$t('退出实例'),
        background: 'rgba(0, 0, 0, 0.8)'
      })
      let insts = _.cloneDeep(this.selectedList)

      for (let idx in insts) {
        let inst = insts[idx]
        this.loading.text = `${this.$t('正在退出实例')} ${inst.name}`
        try {
          await papi.stopInstance(inst.project, inst.model, inst.id)
        } catch (error) {
          this.$msg.error(`${this.$t('退出实例错误')} ${inst.name} : ${error}`)
        }
      }
      if (this.loading) {
        this.loading.close()
      }
      setTimeout(() => {
        this.buildInstList()
      }, 2000)
    }
  }
}
</script>

<style lang="scss" scoped>
.dispatch-container {
  height: calc(100vh - 82px);
  padding-top: 24px;
  overflow: auto;
  .control-buttons {
    padding: 12px 64px;
    display: flex;
    justify-content: space-between;
  }
  .operate {
    .project {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    .dispatch {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

</style>
