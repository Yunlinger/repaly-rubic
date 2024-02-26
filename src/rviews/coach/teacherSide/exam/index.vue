<template>
  <div class="exam">
    <div class="tab">
      <div v-if="userRole" class="tab_item" :class="{ active:index === 0 }" @click="index = 0">
        <svg-icon icon-class="paper"></svg-icon>
        试卷管理
      </div>
      <el-divider v-if="userRole"></el-divider>
      <div v-if="userRole" class="tab_item" :class="{ active:index === 1 }" @click="index = 1">
        <svg-icon icon-class="examManger"></svg-icon>
        考试管理
      </div>
      <el-divider v-if="userRole"></el-divider>
      <div class="tab_item" :class="{ active:index === 2 }" @click="index = 2">
        <svg-icon icon-class="exam"></svg-icon>
        学员练习&考试
      </div>
      <el-divider></el-divider>
      <div class="tab_item" :class="{ active:index === 4 }" @click="index = 4">
        <svg-icon icon-class="myscore"></svg-icon>
        我的成绩
      </div>
      <el-divider></el-divider>
      <div v-if="userRole" class="tab_item" :class="{ active:index === 5 }" @click="index = 5">
        <svg-icon icon-class="scorelist"></svg-icon>
        查询考试成绩
      </div>
      <el-divider v-if="userRole"></el-divider>
      <div v-if="userRole" class="tab_item" :class="{ active:index === 3 }" @click="index = 3">
        <svg-icon icon-class="question"></svg-icon>
        题库管理
      </div>
    </div>
    <div v-show="index === 0" class="user_view">
      <paper @showPaper="showPaper" @createExam="createExam" />
    </div>
    <div v-show="index === 1" class="user_view">
      <exam ref="exam" @updateExam="updateExam" @examDel="examDel" />
    </div>
    <div v-show="index === 2" class="user_view">
      <activities ref="activities" />
    </div>
    <div v-show="index === 3" class="user_view">
      <question />
    </div>
    <div v-show="index === 4" class="user_view">
      <my-score-list @show="detail" />
    </div>
    <div v-show="index === 5" class="user_view">
      <core-list @show="detail" />
    </div>
    <div v-if="index === 6" class="user_view" style="overflow-y: auto;background-color: #FFF">
      <examView ref="examView" @createExam="createExam" @back="back" />
    </div>
    <div v-if="index === 7" class="user_view" style="overflow-y: auto;background: #FFF;">
      <exam-detail :id="detailId" ref="detail" :marking="false" @back="back" />
    </div>
  </div>
</template>

<script>
import question from './question'
import paper from './paper'
import activities from './activities'
import exam from './exam'
import examView from '@/rviews/exam/paperPreview'
import myScoreList from '@/rviews/exam/myScoreList'
import coreList from '@/rviews/exam/scoreList'
import examDetail from '@/rviews/exam/examDetails.vue'
export default {
  name: 'Exam',
  components: { question, paper, activities, exam, examView, myScoreList, coreList, examDetail },
  data() {
    return {
      index: 0,
      intoIdx: 0,
      userRole: false,
      detailId: null
    }
  },
  watch: {
    index(val, old) {
      if (val === 6 || val === 7) {
        this.intoIdx = old
      }
    }
  },
  created() {
    let roles = this.$store.getters.roles
    if (roles.length > 1) {
      this.userRole = true
    } else if (!roles.includes('student')) {
      this.userRole = true
    } else {
      this.userRole = false
      this.index = 2
    }
  },
  methods: {
    showPaper(id) {
      this.index = 6
      this.$nextTick(() => {
        this.$refs.examView.getPaperDetail(id)
      })
    },
    createExam() {
      this.$refs.activities.getList()
      this.$refs.exam.getMenuData().then(() => {
        this.$refs.exam.getList()
      })
    },
    updateExam() {
      this.$refs.activities.getMenuData().then(() => {
        this.$refs.activities.getList()
      })
    },
    back() {
      if (this.intoIdx !== null) {
        this.index = this.intoIdx
      }
    },
    detail(data) {
      this.detailId = data
      this.index = 7
    },
    examDel() {
      this.$refs.activities.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.exam {
  height: 100%;
  border-radius: 10px;
  user-select: none;
  // opacity: .6;
  .tab {
    float: left;
    width: 170px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #606266;
    .active{
      background: rgb(102, 177, 255) !important;
    }
    .tab_item {
      font-size: 20px;
      color: #FFF;
      height: calc(100% / 6);
      // line-height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      align-items: center;
      border-radius: 5px;
      .svg-icon {
        font-size: 40px;
        margin-bottom: 10px;
      }
    }
    ::v-deep .el-divider--horizontal {
      margin: 0;
    }
  }
  .user_view {
    float: left;
    width: calc(100% - 170px);
    height: 100%;
  }
}
</style>
