<template>
  <div v-loading="listLoading" class="container">
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
        <div class="remark">
          {{ `考生: ${getUserName()} ` }}
        </div>
        <div class="time">
          {{ `总分: ${score} 分, ` }}
          {{ `难度: ${paper.difficulty} ` }}
        </div>
        <div class="time">
          {{ `考试时间: ${paper.duration} 分钟, ` }}
          {{ `开始时间: ${formatTime(paper.startAt)} ` }}
        </div>
        <div v-if="!started" class="name">
          请稍等, 还有
          <span style="color: green;">{{ ` ${waitTime} ` }}</span>
          开始考试.
        </div>
        <div v-if="started && ended" class="name">
          !!考试已经结束!!
        </div>
      </div>
      <div v-if="started && !ended" class="body">
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
                <el-radio-group v-if="question.type == api.QUESTION_TYPE_SINGLE" v-model="commitData.answers[question.ID].answer1" type="vertical" @change="record()">
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
                    @change="record()"
                  >
                  </mult-select>
                </template>
              </div>
              <!-- <div class="answer">
                {{ `参考答案: ${question.answer1}` }}
              </div> -->
            </template>
            <template v-if="question.type == api.QUESTION_TYPE_JUDGE">
              <div class="caption">
                {{ `${qidx+1}、${question.caption1}` }}
              </div>
              <div class="answer">
                <el-radio-group v-model="commitData.answers[question.ID].answer1" @change="record()">
                  <el-radio label="true" border>正确</el-radio>
                  <el-radio label="false" border>错误</el-radio>
                </el-radio-group>
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
                @change="record()"
              >
              </el-input>
              <!-- {{ `参考答案:` }} -->
              <!-- <div class="answer">
                {{ `${question.answer1}` }}
              </div> -->
            </template>
            <br />
          </div>
          <br />
        </div>
      </div>
      <div v-if="started" style="position: fixed; right: 100px; top: 25%; width: 150px;">
        <div v-for="(topic, idx) of paper.topics" :key="idx">
          <div style="font-size: 14px; margin-top: 14px;">
            {{ `${bigNum[idx]}、 ${topic.name} ` }}
          </div>
          <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin-top: 8px;">
            <div
              v-for="(question, qidx) of topic.questions"
              :key="`question_${question.ID}`"
              class="goto-button"
              :style="{ background: commitData.answers[question.ID].answer1 ? '#1890ff' : 'yellow'}"
              @click="goAnchor(`#question_${question.ID}`)"
            >
              {{ `${qidx+1}` }}
            </div>
          </div>
        </div>
        <div style="font-size: 16px; margin-top: 32px;">
          {{ `当前时间: ${serverTime} ` }}
        </div>
        <div style="font-size: 16px; margin-top: 12px;">
          {{ `剩余时间:` }}
          <span style="color: red;">
            {{ `${remainTime}` }}
          </span>
        </div>
        <el-button
          type="primary"
          :disabled="!started || ended"
          size="large"
          style="margin: 12px 0; width: 100%"
          @click="commit()"
        >
          {{ `交卷` }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
// 试卷管理页
import * as api from '@/api/exam'
import MultSelect from '../../../exam/components/MultSelect'
import moment from 'moment'
import storage from '@/utils/storage'
import _ from 'lodash'

export default {
  name: 'TestPaper',
  components: { MultSelect },
  props: {
    id: {
      type: Number,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: true
    }
  },
  data() {
    return {
      started: false,
      ended: true,
      listLoading: true,
      api: api,
      commited: false,
      commitData: {
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
    this.getMenuData().then(() => {
      const id = this.id
      this.examID = parseInt(id) || 0
      this.commitData.examID = this.examID
      return this.getExamDetail(id)
    })
    this.$on('global:ticker', (msg) => {
      this.serverTime = this.formatTime(msg.data.time, 'HH:mm:ss')
      let now = moment(msg.data.time)
      let start = moment(this.paper.startAt)
      let end = start.clone().add(this.paper.duration, 'minute')
      this.started = now.isAfter(start)
      let ended = now.isAfter(end)
      if (!this.ended && ended && !this.commited) {
        // 到时自动提交
        this.commit(true)
      }
      this.ended = ended
      if (!this.started) {
        let remainDuration = moment.duration(start.diff(now))
        let days = remainDuration.days()
        let hours = remainDuration.hours()
        let minutes = remainDuration.minutes()
        let seconds = remainDuration.seconds()
        this.waitTime = moment({ d: days, h: hours, m: minutes, s: seconds }).format('D天H小时m分s秒')
      } else if (!this.ended) {
        let remainDuration = moment.duration(end.diff(now))
        let hours = remainDuration.hours()
        let minutes = remainDuration.minutes()
        let seconds = remainDuration.seconds()
        this.remainTime = moment({ h: hours, m: minutes, s: seconds }).format('HH:mm:ss')
      } else {
        this.remainTime = '00:00:00'
      }
    })
  },
  beforeDestroy() {
    if (!this.commited) {
      this.record()
    }
  },
  methods: {
    // 提交
    commit(auto) {
      if (this.ended) {
        return
      }
      let confirm
      if (auto) {
        confirm = Promise.resolve()
      } else {
        let msg = '确定交卷?'
        for (let id in this.commitData.answers) {
          if (this.commitData.answers[id].answer1 === '') {
            msg = '还有未作答的题目, 确定交卷?'
            break
          }
        }
        confirm = this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
      }
      confirm.then(() => {
        // 计算客观题分数
        let totalScore = 0
        for (let t of this.paper.topics) {
          for (let q of t.questions) {
            if (q.type === api.QUESTION_TYPE_SINGLE || q.type === api.QUESTION_TYPE_MULTI || q.type === api.QUESTION_TYPE_JUDGE) {
              if (this.commitData.answers[q.ID].answer1 === q.answer1) {
                this.commitData.answers[q.ID].score = t.scorePerQuestion
                totalScore += t.scorePerQuestion
              }
            }
            if (q.type === api.QUESTION_TYPE_FILLBLANK) {
              if (this.commitData.answers[q.ID].answer1 === q.answer1 &&
                this.commitData.answers[q.ID].answer2 === q.answer2 &&
                this.commitData.answers[q.ID].answer3 === q.answer3 &&
                this.commitData.answers[q.ID].answer4 === q.answer4) {
                this.commitData.answers[q.ID].score = t.scorePerQuestion
                totalScore += t.scorePerQuestion
              }
            }
          }
        }
        this.commitData.totalScore = totalScore
        return api.commitExam(this.commitData)
      }).then((res) => {
        this.$msg(`提交成功, 客观题得分: ${res.score || 0}`)
        let commitDataKey = `COMMITDATA_${this.$store.getters.name}_${this.examID}`
        storage.remove(commitDataKey)
        this.commited = true
        this.$emit('over')
      }).catch(err => {
        this.$msg.error(err, '提交失败')
      })
    },
    // 临时保存答案到本地缓存
    record() {
      // 用 localStorage 保存临时答案
      let commitDataKey = `COMMITDATA_${this.$store.getters.name}_${this.examID}`
      storage.set(commitDataKey, JSON.stringify(this.commitData))
    },
    // 从缓存中读取临时保存的答案
    loadRecord() {
      let commitDataKey = `COMMITDATA_${this.$store.getters.name}_${this.examID}`
      let cache = storage.get(commitDataKey)
      if (cache) {
        cache = JSON.parse(cache)
        for (let id in cache.answers) {
          if (this.commitData.answers[id]) {
            this.commitData.answers[id].answer1 = cache.answers[id].answer1
            this.commitData.answers[id].answer2 = cache.answers[id].answer2
            this.commitData.answers[id].answer3 = cache.answers[id].answer3
            this.commitData.answers[id].answer4 = cache.answers[id].answer4
          }
        }
      }
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
    getExamDetail(id) {
      this.list = []
      this.listLoading = true
      api.getExamDetail(id).then(res => {
        this.paper = res || {}
        this.listLoading = false
        // 计算总分
        this.score = 0
        for (let t of this.paper.topics) {
          t.questions = _.shuffle(t.questions)
          this.score = this.score + t.questions.length * t.scorePerQuestion
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
        this.loadRecord()
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
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: center;
  background: #fff;
  .paper {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.06) inset;
    font-size: 16px;
    width: 926px;
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
