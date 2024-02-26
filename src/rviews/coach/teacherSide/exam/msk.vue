<template>
  <div class="msk">
    <!-- 考试 -->
    <test-paper v-if="type === 1" :id="id" @over="over" />
    <!-- 判卷 -->
    <marks v-if="type === 3" :id="markId" ref="marks" :studentCName="studentCName" @loadData="loadData" />
    <!-- 练习 -->
    <exercise v-if="type === 2" :id="id" ref="exercise" :menu="menu" />
    <div class="close" @click="over">
      <i class="el-icon-close" />
    </div>
    <div v-if="type === 3" class="user">
      <div class="userList">
        <div v-for="item in stuList.items" :key="item.ID" class="item">
          <div>
            <el-button @click="changeMark(item)">
              {{ item.studentCName }}
            </el-button>
          </div>
          <div style="color:#67C23A;float: right;">考试分数：{{ item.totalScore }}</div>
        </div>
      </div>
      <div style="padding-left: 10px;">
        页数
        <el-select v-model="index" placeholder="请选择" @change="getUsrMark">
          <el-option
            v-for="item in totalList"
            :key="item"
            :value="item"
            :label="`第${item}页`"
          >
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/exam'
import TestPaper from './testPaper.vue'
import exercise from './exercise.vue'
import marks from '@/rviews/exam/mark'
export default {
  components: { TestPaper, exercise, marks },
  props: {
    id: {
      type: Number,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: true
    },
    type: {
      type: Number, // 1考试 2练习 3判卷
      // eslint-disable-next-line vue/require-valid-default-prop
      default: true
    },
    userList: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: true
    },
    menu: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      markId: 0,
      stuList: {},
      studentCName: '',
      index: 1,
      totalList: []
    }
  },
  created() {
    if (this.type === 2) {
      this.$nextTick(() => {
        this.$refs.exercise.getTrainingPaper()
      })
    }
    if (this.type === 3) {
      this.stuList = this.userList
      let num = Math.ceil(this.userList.total / 10)
      for (let i = 1; i <= num; i++) {
        this.totalList.push(i)
      }
      this.studentCName = this.userList.items[0].studentCName
      this.markId = Number(this.userList.items[0].ID)
    }
  },
  methods: {
    over() {
      this.$emit('over')
    },
    deletePaper() {
      this.$emit('deletePaper', this.id)
    },
    changeMark(row) {
      if (row.ID === this.markId) return
      this.markId = row.ID
      this.studentCName = row.studentCName
      this.$refs.marks.getExamAnswer(row.ID)
    },
    loadData() {
      this.getCommitList(this.index)
    },
    getUsrMark(e) {
      this.getCommitList(e)
    },
    getCommitList(idx) {
      let obj = {
        page: idx,
        pageSize: 10,
        examID: this.id
      }
      api.getCommitList(obj).then(res => {
        if (res.items.length === 0) {
          this.$msg.error('参考人数0')
          return
        }
        this.stuList = res
        this.totalList = []
        let num = Math.ceil(res.total / 10)
        for (let i = 1; i <= num; i++) {
          this.totalList.push(i)
        }
      }).catch(err => {
        this.$msg.error(err, this.$t('读取列表错误'))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.msk {
  position: fixed;
  left: 0;
  right: 0;
  top: 50px;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, .3);
  height: calc(100vh - 50px);
  overflow-y: auto;
}
.close {
  position: fixed;
  right: 0; top: 50px;
  font-size: 40px;
  z-index: 101;
  cursor: pointer;
}
.user {
  position: fixed;
  left: 0; top: 50px;
  width: 200px;
  height: 100%;
  background: #EFEFEF;
  .userList {
    width: 100%;
    padding: 5px;
    height: calc(100% - 70px);
    .item {
      height: 40px;
      line-height: 30px;
      margin: 10px 0;
      border-bottom: 1px solid #CCC;
      div {
        float: left;
      }
    }
  }
}
</style>
