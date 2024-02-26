<template>
  <div class="app-container">
    <el-table
      v-if="instList.length !== 0"
      ref="instStatusTable"
      :data="instList"
      border
      fit
      stripe
      style="width: 100%"
    >
      <el-table-column
        prop="project"
        :label="$t('模型')"
      >
      </el-table-column>
      <el-table-column
        prop="caseName"
        :label="$t('案例')"
      >
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
        :label="$t('倒计时')"
      >
        <template slot-scope="scope">
          {{ formatModelTimeString(scope.row.remainTime * 1000) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="participants"
        :label="$t('参加人员')"
      >
        <template slot-scope="scope">
          {{ (scope.row.participants || []).join() }}
        </template>
      </el-table-column>
      <el-table-column
        prop="caseStatus"
        :label="$t('状态')"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            type="success"
            disable-transitions
          >{{ [$t('空闲'), $t('已下发'), $t('进行中...'), $t('完成')][scope.row.caseStatus || 0] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('操作')"
      >
        <template slot-scope="scope">
          <!-- <el-button
            v-if="!beInInst(scope.row)"
            type="success"
            size="small"
            @click="changeToCase(scope.row)"
          >
            加入
          </el-button> -->
          <el-button
            type="success"
            size="small"
            @click="entryHMI(scope.row)"
          >
            {{ $t('进入操作界面') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else>
      <em class="el-icon-loading" />
      {{ $t('请耐心等待教员布置任务 ...') }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatModelTimeString } from '@/utils'
import * as rapi from '@/api/res'

export default {
  data() {
    return {
      showAll: true,
      instList: [],
      selectMap: {}
    }
  },

  computed: {
    ...mapGetters(['project'])
  },
  watch: {
    project: {
      deep: true,
      handler: function() {
        this.buildInstList()
      }
    },
    showAll: {
      handler: function() {
        this.buildInstList()
      }
    }
  },
  mounted() {
    this.buildInstList()
    this.$on('global:instance.created', (msg) => {
      setTimeout(() => {
        this.buildInstList()
      }, 100)
    })
    this.$on('global:instance.updated', (msg) => {
      setTimeout(() => {
        this.buildInstList()
      }, 100)
    })
  },

  methods: {
    buildInstList() {
      let ret = []
      Object.keys(this.project.instances).forEach(key => {
        let inst = this.project.instances[key]
        let participants = inst.participants || []
        if (participants.includes(this.$store.getters.user.name)) { // 当前用户应该在这个案例中
          inst.checked = this.selectMap[`/${inst.project}/${inst.model}/${inst.id}`] || false
          ret.push(inst)
        }
      })
      this.instList = ret
    },

    beInInst(inst) {
      return this.project.project === inst.project && this.project.id === inst.id
    },

    formatModelTimeString(ms) {
      return formatModelTimeString(ms)
    },

    handlCheckboxChange(idx) {
      let item = this.instList[idx] || {}
      item.checked = !item.checked
      this.selectMap[`/${item.project}/${item.model}/${item.id}`] = item.checked
    },

    changeToCase(m) {
      this.$store.dispatch('openProject', m)
    },

    entryHMI(m) {
      this.$store.dispatch('openProject', m).then(() => {
        return rapi.open('../model/setting.json')
      }).then(config => {
        switch (config.frame) {
          case 'foxboro':
            this.$router.push({ path: '/framefull/foxboro' })
            break
          case 'default':
          case '':
          default : this.$router.push({ path: '/framefull/default' })
        }
      }).catch(() => {
        this.$router.push({ path: '/framefull/default' })
      })
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
