<template>
  <div v-loading="listLoading" class="container">
    <div class="paper">
      <div class="title">
        <div class="name">
          {{ paper.name }}
        </div>
        <div class="remark">
          {{ paper.remark }}
        </div>
        <div class="time">
          {{ `总分: ${score} 分, ` }}
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
          <div v-for="(question, qidx) of topic.questions" :id="`question_${question.ID}`" :key="qidx" class="question">
            <template v-if="question.type == api.QUESTION_TYPE_SINGLE || question.type == api.QUESTION_TYPE_MULTI">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1}` }}
              </div>
              <div class="answer" style="margin-top: 4px">
                <el-radio-group v-if="question.type == api.QUESTION_TYPE_SINGLE" v-model="commitData.answers[question.ID].answer1" type="vertical">
                  <template v-for="opt of ['A','B','C','D','E','F','G']">
                    <div
                      v-if="question[`option${opt}`]"
                      :key="question[`option${opt}`]"
                      style="margin-top: 18px; margin-left: 18px;"
                    >
                      <el-radio :label="opt">
                        {{ `${opt}: ${question[`option${opt}`]}` }}
                      </el-radio>
                    </div>
                  </template>
                </el-radio-group>
                <template v-if="question.type == api.QUESTION_TYPE_MULTI">
                  <mult-select
                    v-model="commitData.answers[question.ID].answer1"
                    :question="question"
                  >
                  </mult-select>
                </template>
              </div>
              <div v-if="isAns" style="margin-top: 10px;color:#67C23A;">
                参考答案：{{ question.answer1 }}
              </div>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_JUDGE">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1}` }}
              </div>
              <div class="answer">
                <el-radio-group v-model="commitData.answers[question.ID].answer1">
                  <el-radio label="true" border>正确</el-radio>
                  <el-radio label="false" border>错误</el-radio>
                </el-radio-group>
              </div>
              <div v-if="isAns" style="margin-top: 10px;color:#67C23A;">
                参考答案：{{ question.answer1 }}
              </div>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_FILLBLANK">
              <div class="caption">
                {{ `${qidx+1}、` }}
                <template v-for="(item, capIdx) of splitWithBrackets(question.caption1)">
                  <template v-if="item.isBlank">
                    <template v-for="an of ['answer1','answer2','answer3','answer4']">
                      <template v-if="item.index == an">
                        <input
                          :key="`BLANK_${an}_${qidx+1}_${capIdx}`"
                          v-model="commitData.answers[question.ID][an]"
                          class="input"
                          :style="getBlankStyle(question[an])"
                        />
                        <input
                          v-if="isAns"
                          :key="`BLANK_ANS_${an}_${qidx+1}_${capIdx}`"
                          v-model="question[an]"
                          :readonly="true"
                          class="input"
                          :style="getBlankStyle(question[an])"
                          style="color:brown; margin-left: 12px;"
                        />
                      </template>
                    </template>
                  </template>
                  <template v-else>
                    <span :key="`BLANK_CAP_${qidx+1}_${capIdx}`">
                      {{ item.caption }}
                    </span>
                  </template>
                </template>
              </div>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_QA">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1} ` }}
              </div>
              <el-input
                v-model="commitData.answers[question.ID].answer1"
                type="textarea"
                class="qa-input"
                style="color: #1890ff;"
                :rows="8"
                placeholder="请在此作答"
              >
              </el-input>
              <div v-if="isAns" style="margin-top: 10px;color:#67C23A;">
                参考答案：{{ question.answer1 }}
              </div>
            </template>
            <br />
          </div>
          <br />
        </div>
      </div>
    </div>
    <div class="bth">
      <div @click="isAns = !isAns">查看参考答案</div>
      <div style="background-color: red;" @click="reStart">重新生成练习卷</div>
    </div>
  </div>
</template>

<script>
// 试卷管理页

import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import _ from 'lodash'
import MultSelect from '@/rviews/exam/components/MultSelect'
export default {
  name: 'PaperPreview',
  directives: { waves },
  components: { MultSelect },
  props: {
    menu: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      listLoading: false,
      loading: null,
      paperID: 0,
      paper: {},
      score: 0,
      api: api,
      menuOptions: [],
      menuID: '',
      menus: {},
      bigNum: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六'],
      questionTypeOptions: [
        { label: '单选题', key: api.QUESTION_TYPE_SINGLE },
        { label: '多选题', key: api.QUESTION_TYPE_MULTI },
        { label: '判断题', key: api.QUESTION_TYPE_JUDGE },
        { label: '填空题', key: api.QUESTION_TYPE_FILLBLANK },
        { label: '问答题', key: api.QUESTION_TYPE_QA }
      ],
      commitData: {
        examID: 0,
        totalScore: 0,
        answers: {
        }
      },
      isAns: false
    }
  },
  methods: {
    getTrainingPaper() {
      this.isAns = false
      this.listLoading = true
      api.training({ menus: this.menu.join(',') }).then(p => {
        this.paper = p || {}
        // 计算总分
        this.score = 0
        for (let t of this.paper.topics) {
          t.questions = _.shuffle(t.questions)
          this.score = this.score + t.questionCount * t.scorePerQuestion
          for (let q of t.questions) {
            this.$set(this.commitData.answers, q.ID, {
              answer1: '',
              answer2: '',
              answer3: '',
              answer4: '',
              score: 0
            })
          }
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    splitWithBrackets(s) {
      let str = s || ''
      str = str.replaceAll(/（\s*）/g, ' ####__BLANK__#### ')
      str = str.replaceAll(/\(\s*\)/g, ' ####__BLANK__#### ')
      str = str.replaceAll(/（\s*\)/g, ' ####__BLANK__#### ')
      str = str.replaceAll(/\(\s*）/g, ' ####__BLANK__#### ')
      let strs = str.split('####')
      let idx = 0
      strs = strs.map(item => {
        if (item === '__BLANK__') {
          idx = idx + 1
          return {
            isBlank: true,
            index: `answer${idx}`
          }
        }
        return {
          isBlank: false,
          caption: item || ''
        }
      })
      return strs
    },
    getBlankStyle(str) {
      if (typeof str !== 'string') {
        return {}
      }
      let width = Math.max((str.length * 24 + 60), 80)

      return { width: `${width}px` }
    },
    reStart() {
      this.getTrainingPaper()
    }
  }
}
</script>

  <style lang="scss" scoped>
  .container{
    padding: 20px;
    display: flex;
    justify-content: center;
    background: #FFF;
    .paper {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.06) inset;
      font-size: 16px;
      width: 926px;
      height: calc(100vh - 50px);
      overflow-y: auto;
      padding: 50px;
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
              line-height: 32px;
              .input {
                color: #1890ff;
                text-align: center;
                border-bottom: 1px solid #1890ff;
                border-top: 0px;
                border-left: 0px;
                border-right: 0px;
              }
              .input:focus{
                outline: none;
              }
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
    .bth {
      position: fixed;
      right: 10px; top: 20%;
      height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      div {
        color: #FFF;
        padding: 5px;
        text-align: center;
        border-radius: 5px;
        background: #67C23A;
        cursor: pointer;
      }
    }
  }
  </style>

