<template>
  <div class="container">
    <div class="paper">
      <div class="title">
        <div class="subtitle">
          {{ paper.subtitle }}
        </div>
        <div class="name">
          {{ paper.title }}
        </div>
        <div class="remark">
          {{ paper.remark }}
        </div>
        <div class="time">
          {{ `试卷总分: ${score} 分, ` }}
          {{ `考生得分: ${commitData.totalScore} 分, ` }}
          <span style="color: red;font-size: 20px;">{{ `学生姓名: ${studentCName} ` }}</span>
        </div>
        <div class="time">
          {{ `考试时间: ${paper.duration} 分钟, ` }}
          {{ `开始时间: ${formatTime(paper.startAt)} ` }}
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
            <template>
              <el-tag :type="(commitData.answers[question.ID].score > 0) ? 'primary' : 'danger'" size="small">
                {{ '得分: ' + ((commitData.answers[question.ID] && commitData.answers[question.ID].score) || 0) }}
              </el-tag>
              <el-tag :type="(commitData.answers[question.ID] && commitData.answers[question.ID].judgeID) ? 'primary' : 'warning'" size="small">
                {{ '赋分人: ' + ((commitData.answers[question.ID] && commitData.answers[question.ID].judgeID) || '系统') }}
              </el-tag>
              <template v-if="question.type != api.QUESTION_TYPE_SINGLE && question.type != api.QUESTION_TYPE_MULTI && question.type != api.QUESTION_TYPE_JUDGE">
                <el-button type="primary" @click="judgeQuestion(question, topic.scorePerQuestion, topic.scorePerQuestion)">赋满分</el-button>
                <el-button type="danger" @click="judgeQuestion(question, topic.scorePerQuestion, 0)">赋零分</el-button>
                <el-button type="primary" @click="judgeQuestion(question, topic.scorePerQuestion)">自定义赋分</el-button>
              </template>
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_SINGLE || question.type == api.QUESTION_TYPE_MULTI">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1}` }}
              </div>
              <div class="answer" style="margin-top: 4px">
                <el-radio-group
                  v-if="question.type == api.QUESTION_TYPE_SINGLE"
                  :value="commitData.answers[question.ID].answer1"
                  type="vertical"
                >
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
                    :readonly="true"
                  >
                  </mult-select>
                </template>
              </div>
              <div class="answer">
                {{ `参考答案: ${question.answer1}` }}
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
              <div class="answer">
                {{ `参考答案: ${question.answer1}` }}
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
                          :disabled="true"
                          :style="getBlankStyle(question[an])"
                        />
                        <input
                          :key="`__BLANK_${an}_${qidx+1}_${capIdx}`"
                          :value="`${question[an]}`"
                          class="input-answer"
                          :disabled="true"
                          :style="getBlankStyle(question[an])"
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
              <!-- {{ `参考答案:` }} -->
              <div class="answer">
                {{ `${question.answer1}` }}
              </div>
            </template>
            <br />
          </div>
          <br />
        </div>
      </div>
      <div style="position: fixed; right: 24px; top: 20%; width: 150px;">
        <div v-for="(topic, idx) of paper.topics" :key="idx">
          <div style="font-size: 14px; margin-top: 14px;">
            {{ `${bigNum[idx]}、 ${topic.name} ` }}
          </div>
          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin-top: 8px;">
            <div
              v-for="(question, qidx) of topic.questions"
              :key="`question_${question.ID}`"
              class="goto-button"
              :style="{ background: commitData.answers[question.ID].judgeID ? '#1890ff' : 'yellow'}"
              @click="goAnchor(`#question_${question.ID}`)"
            >
              {{ `${qidx+1}` }}
            </div>
          </div>
        </div>
        <div style="font-size: 16px; margin-top: 32px;">
          {{ `考生得分: ${commitData.totalScore}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 试卷管理页
import * as api from '@/api/exam'
import MultSelect from './components/MultSelect'
import moment from 'moment'

export default {
  name: 'PaperMark',
  components: { MultSelect },
  props: {
    id: {
      type: Number,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: true
    },
    studentCName: {
      type: String,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      listLoading: true,
      api: api,
      commited: false,
      commitData: {
        commitID: 0,
        examID: 0,
        totalScore: 0,
        answers: {
        }
      },
      examID: 0,
      paper: {},
      remainTime: '00:00:00',
      waitTime: '',
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
      bigNum: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六'],
      // 服务器时间
      serverTime: this.formatTime(new Date(), 'HH:mm:ss')
    }
  },
  created() {
    this.listLoading = true
    this.loadData()
    this.$on('global:ticker', (msg) => {
      this.serverTime = this.formatTime(msg.data.time, 'HH:mm:ss')
    })
  },
  methods: {
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
    loadData() {
      this.getMenuData().then(() => {
        const id = this.id
        this.commitID = parseInt(id) || 0
        this.commitData.commitID = this.commitID
        return api.getExamAnswer(id)
      }).then(resp => {
        this.examID = resp.examID
        this.commitData.examID = this.examID
        this.commitData.totalScore = resp.totalScore || 0
        this.commitData.answers = resp.answers
        return this.getExamDetail(resp.examID)
      })
    },
    getExamAnswer(id) {
      api.getExamAnswer(id).then(resp => {
        this.examID = resp.examID
        this.commitData.examID = this.examID
        this.commitData.totalScore = resp.totalScore || 0
        this.commitData.answers = resp.answers
        return this.getExamDetail(resp.examID)
      })
    },
    getExamDetail(id) {
      this.list = []
      this.listLoading = true
      api.getExamDetail(id).then(res => {
        this.paper = res || {}
        this.listLoading = false
        // 计算总分
        this.score = 0
        for (let t of this.paper.topics) {
          this.score = this.score + t.questions.length * t.scorePerQuestion
        }
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.listLoading = false
      })
    },
    formatTime(dtstr, fmt) {
      fmt = fmt || 'YYYY-MM-DD HH:mm:ss'
      return moment(dtstr).format(fmt)
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
    goAnchor(selector) {
      var anchor = this.$el.querySelector(selector)
      if (anchor) {
        this.$el.parentElement && this.$el.parentElement.scrollTo(0, anchor.offsetTop)
      }
    },
    getUserName() {
      return this.$store.getters.cname
    },
    judgeQuestion(question, hiLimit, score) {
      if (score === 0 || score > 0) {
        api.judgeQuestion(this.commitData.commitID, question.ID, score).then(() => {
          this.$msg('赋分成功')
          this.loadData()
          this.$emit('loadData')
        }).catch((err) => {
          this.$msg.error(err, '赋分失败')
        })
        return
      }

      this.$prompt('请输入分数', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let score = parseFloat(value)
        if (score > hiLimit || score < 0) {
          return Promise.reject('请输入合理的分数')
        }
        return api.judgeQuestion(this.commitData.commitID, question.ID, score)
      }).then(() => {
        this.$msg('赋分成功')
        this.loadData()
        this.$emit('loadData')
      }).catch((err) => {
        this.$msg.error(err, '赋分失败')
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
  background: #FFF;
  .paper {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.06) inset;
    font-size: 16px;
    width: 926px;
    padding: 64px;
    border-radius: 8px;
    .title {
      text-align: center;
      .subtitle {
        color: #808080;
        padding: 12px;
        font-size: 20px;
      }
      .name {
        font-size: 32px;
        padding: 16px;
        font-weight: bold;
      }
      .remark {
        color: #808080;
        padding: 12px;
        font-size: 14px;
      }
      .time {
        color: #808080;
        padding: 12px;
        font-size: 12px;
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
            .input-answer {
              margin-left: 12px;
              color: red;
              text-align: center;
              border-bottom: 1px solid red;
              border-top: 0px;
              border-left: 0px;
              border-right: 0px;
            }
            .input-answer:focus{
                outline: none;
            }
          }
          .qa-input {
            color: #1890ff;
            font-size: 14px;
            line-height: 24px;
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
.goto-button {
  width: 26px;
  height: 26px;
  margin: 1px 2px;
  border-radius: 4px;
  border: 1px solid gray;
  cursor: pointer;
  text-align: center;
}
.goto-button:hover {
  width: 28px;
  height: 28px;
  margin: 0 1px;
  opacity: 0.7;
}
</style>
