<template>
  <div class="container">
    <div style="position: fixed; top: 70px; right: 30px;font-size: 25px;cursor: pointer;" @click="close">
      <i class="el-icon-close" />
    </div>
    <div class="paper">
      <div class="title">
        <div class="name">
          {{ paper.name }}
        </div>
        <div class="remark">
          {{ paper.remark }}
        </div>
        <div class="time">
          {{ `难度: ${paper.difficulty}, ` }}
          {{ `总分: ${score} 分, ` }}
          {{ `考试时间: ${paper.duration} 分钟` }}
        </div>
      </div>
      <div class="body">
        <div v-for="(topic, idx) of paper.topics" :key="idx" class="topic">
          <div class="name">
            {{ `${bigNum[idx]}、 ${topic.name} ` }}
            <span class="score">
              {{ `（共${topic.questions.length}题, 每题${topic.scorePerQuestion}分）` }}
            </span>
          </div>
          <br />
          <div v-for="(question, qidx) of topic.questions" :key="qidx" class="question">
            <template v-if="question.type == api.QUESTION_TYPE_SINGLE || question.type == api.QUESTION_TYPE_MULTI">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1}` }}
              </div>
              <template v-for="opt of ['A','B','C','D','E','F','G']">
                <div v-if="question[`option${opt}`]" :key="opt" class="option">
                  {{ `${opt}: ${question[`option${opt}`]}` }}
                </div>
              </template>
              <div class="answer">
                {{ `参考答案: ${question.answer1}` }}
              </div>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_JUDGE">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1}` }}
              </div>
              <div class="answer">
                {{ `参考答案: ${question.answer1==='true'?'正确':'错误'}` }}
              </div>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_FILLBLANK">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1} ` }}
              </div>
              {{ `参考答案:` }}
              <div v-for="an of ['answer1','answer2','answer3','answer4','answer5','answer6','answer7','answer8']" :key="an">
                <div v-if="question[an]" class="answer">
                  {{ `${question[an]}` }}
                </div>
              </div>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_QA">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1} ` }}
              </div>
              {{ `参考答案:` }}
              <div class="answer">
                {{ `${question.answer1}` }}
              </div>
            </template>
            <div class="difficulty">
              {{ `难度: ${question.difficulty}` }}
            </div>
            <br />
          </div>
          <br />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 试卷管理页

import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive

export default {
  name: 'PaperPreview',
  directives: { waves },
  data() {
    return {
      listLoading: true,
      api: api,
      paperID: 0,
      paper: {},
      score: 0,
      menuOptions: [],
      menus: {},
      questionTypeOptions: [
        { label: '单选题', key: api.QUESTION_TYPE_SINGLE },
        { label: '多选题', key: api.QUESTION_TYPE_MULTI },
        { label: '判断题', key: api.QUESTION_TYPE_JUDGE },
        { label: '填空题', key: api.QUESTION_TYPE_FILLBLANK },
        { label: '问答题', key: api.QUESTION_TYPE_QA }
      ],
      scopeOptions: [
        { label: '考试和练习', key: 0 },
        { label: '只用于考试', key: 1 },
        { label: '只用于练习', key: 2 }
      ],
      bigNum: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六']
    }
  },
  created() {
    // this.getMenuData().then(() => {
    //   const id = this.$route.params && this.$route.params.id
    //   this.paperID = id || 0
    //   return this.getPaperDetail(id)
    // })
  },
  methods: {
    close() {
      this.$emit('back')
    },
    getMenuData() {
      this.menuOptions = [{
        label: '所有目录',
        key: 0
      }]
      return api.readMenu(0).then(res => {
        for (let menu of res.items) {
          this.menuOptions.push({
            label: menu.name,
            key: menu.ID
          })
          this.menus[menu.ID] = menu
        }
      })
    },
    getPaperDetail(id) {
      this.list = []
      this.listLoading = true
      this.paperID = id || 0
      api.getPaperDetail(id).then(res => {
        this.paper = res || {}
        // 计算总分
        this.score = 0
        for (let t of this.paper.topics) {
          this.score = this.score + t.questionCount * t.scorePerQuestion
        }
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.listLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  padding: 32px;
  display: flex;
  justify-content: center;
  .paper {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.06) inset;
    font-size: 16px;
    width: 926px;
    padding: 64px;
    .title {
      text-align: center;
      .name {
        font-size: 32px;
        padding: 16px;
        font-weight: bold;
      }
      .remark {
        color: #808080;
        padding: 12px;
      }
      .time {
        color: #808080;
        padding: 12px;
      }
    }
    .body {
      margin-top: 48px;
      .topic {
        margin-top: 16px;
        .name {
          color: #000000;
          font-size: 20px;
          font-weight: bold;
          .score {
            color: #000000;
            font-size: 15px;
            font-weight: normal;
          }
        }
        .question {
          // padding-left: 20px;
          padding: 8px 16px 10px 20px;
          .caption {
            color: #000000;
            font-size: 18px;
          }
          .difficulty {
            color: #707070;
            font-size: 12px;
          }
          .option {
            font-size: 16px;
            padding: 8px 0px 8px 16px;
          }
          .answer {
            font-size: 16px;
            color: green;
          }
        }
      }
    }
  }
}
</style>
