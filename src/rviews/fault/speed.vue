<template>
  <div class="speed">
    <!-- <div style="display: flex; justify-content: space-around;">
      <el-button :type="value === 1 ? 'success' : 'info'" @click="value = 1">1x</el-button>
      <el-button :type="value === 5 ? 'success' : 'info'" @click="value = 5">5x</el-button>
      <el-button :type="value === 10 ? 'success' : 'info'" @click="value = 10">10x</el-button>
      <el-button :type="value === 20 ? 'success' : 'info'" @click="value = 20">20x</el-button>
      <el-button :type="value === 50 ? 'success' : 'info'" @click="value = 50">50x</el-button>
      <el-button type="danger" @click="speedAll()">加速</el-button>
    </div> -->
    <div v-for="item in list" :key="item.id" class="item" :style="{ background: item.isspeed ? '#f59b22' : '' }">
      <div v-if="item.name">{{ item.name }}</div>
      <div v-if="item.name">
        <el-button v-if="item.isspeed" type="danger" @click="speed(item, false)">退出</el-button>
        <el-button v-else type="success" @click="speed(item, true)">投入</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as api from '@/api/rtd'
import * as rapi from '@/api/res'
import * as papi from '@/api/project'
export default {
  data() {
    return {
      list: [],
      value: 1
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'selectedInst'
    ]),
    getLevel: function() {
      return this.ruleForm.value
    }
  },
  mounted() {
    this.getList()
    this.$on('global:rtdb', (msg) => {
      let list = this.list.map(async item => {
        if (item.name) {
          item.isspeed = !!api.getValue(item.var)
          return await api.getValue(item.var)
        }
      })
      Promise.all(list).then(res => {
        if (res.includes(1)) {
          this.$emit('isSpeed', true)
          return
        }
        this.$emit('isSpeed', false)
      })
    })
  },
  methods: {
    getList() {
      this.list = []
      let list = []
      rapi.open('../model/speed.json').then(res => {
        for (let i of res.list) {
          if (i.name) {
            i.isspeed = false
            list.push(i)
          }
        }
        this.list = list
      }).catch(() => {
        console.log('can not open speed.json')
      })
    },
    speed(item, state) {
      this.$confirm(`确定${state ? '执行加速' : '退出'}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await api.setValue(item.var, state ? 1 : 0)
        setTimeout(() => {
          item.isspeed = !!api.getValue(item.var)
        }, 500)
      })
    },
    speedAll() {
      this.$confirm(`确定执行模型计算速度${this.value}倍速`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const { id, project } = this.selectedInst
        let obj = {
          id: id,
          model: 'model',
          project: project,
          speed: this.value
        }
        return papi.setInstSpeed(obj)
      }).then(() => {
        this.$msg('加速执行成功')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.speed {
  height: 100%;
  overflow-y: auto;
  user-select: none;
  background: #bfbfbf;
  color: #FFF;
  .item {
    width: 100%;
    height: 34px;
    margin: 2px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }
  .item:hover {
    background-color: #caf982;
  }
}
</style>
