<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.menuID" :placeholder="$t('目录')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-input v-model="listQuery.keyword" :placeholder="$t('关键字')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('新建') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('目录')" align="center" width="120">
        <template slot-scope="{row}">
          <el-tag>{{ menus[row.menuID] ? menus[row.menuID].name : '所有目录' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('名称')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('时长')" prop="duration" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ (row.duration || 0) + $t('分钟') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('目标难度')" prop="difficulty" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.difficultyTarget || 0.8 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('实际难度')" prop="difficulty" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.difficulty || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('范围')" prop="scope" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ [$t('考试和练习'),$t('只用于考试'),$t('只用于练习')][(row.scope || 0) % 3] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('随机')" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="!row.random" type="danger">{{ $t('固定') }}</el-tag>
          <el-tag v-if="row.random" type="success">{{ $t('随机') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="120">
        <template slot-scope="{row,$index}">
          <el-dropdown split-button type="primary" trigger="click" @click="showPaper(row)" @command="menuCommand($event, row, $index)">
            {{ $t('预览') }}
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="update">{{ $t('修改试卷') }}</el-dropdown-item>
              <el-dropdown-item command="generate">{{ $t('生成试卷') }}</el-dropdown-item>
              <!-- <el-dropdown-item command="preview">{{ $t('试卷预览') }}</el-dropdown-item> -->
              <el-dropdown-item command="del">{{ $t('删除试卷') }}</el-dropdown-item>
              <el-dropdown-item command="exam">{{ $t('发起考试') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :center="true"
      width="60%"
      append-to-body
    >
      <el-tabs v-model="activeName">
        <el-tab-pane :label="$t('基本设置')" name="基本设置">
          <el-form ref="dataForm" :model="temp" inline label-position="right" label-width="100px" style="width: 90%;" size="small">
            <el-form-item :label="$t('目录')" style="width: 45%;">
              <el-select v-model="temp.menuID" :placeholder="$t('目录')" class="filter-item">
                <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('时长')" style="width: 45%;">
              <el-input v-model="temp.duration" />
            </el-form-item>
            <el-form-item :label="$t('适用范围')" style="width: 45%;">
              <el-select v-model="temp.scope" :placeholder="$t('适用范围')" class="filter-item">
                <el-option v-for="item in scopeOptions" :key="item.key" :label="$t(item.label)" :value="item.key" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('难度')+'(0~1)'" style="width: 45%;">
              <el-input v-model="temp.difficultyTarget" />
            </el-form-item>
            <el-form-item :label="$t('随机')" style="width: 45%;">
              <el-checkbox v-model="temp.random"></el-checkbox>
            </el-form-item>
          </el-form>
          <el-form ref="dataForm" :model="temp" label-position="right" label-width="100px" style="width: 90%;" size="small">
            <el-form-item :label="$t('名称')">
              <el-input v-model="temp.name" />
            </el-form-item>
            <el-form-item :label="$t('备注')">
              <el-input v-model="temp.remark" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane name="题型配置" :label="$t('题型配置')">
          <div>
            <el-tag style="width: 100px;">{{ $t('题号') }}</el-tag>
            <el-tag style="width: 200px;">{{ $t('名称') }}</el-tag>
            <el-tag style="width: 130px;">{{ $t('题型') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('每题分数') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('题目数量') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('删除') }}</el-tag>
          </div>
          <div v-for="(t, idx) in (dialogStatus === 'create' ? questionTypeLlist : topics)" :key="t.questionType">
            <el-tag style="width: 100px;">{{ idx+1 }}</el-tag>
            <el-input v-model="t.name" style="width: 200px;" size="mini" @change="updateTopic(t, temp.ID)" />
            <el-select v-model="t.questionType" :placeholder="$t('题型')" style="width: 130px" size="mini" @change="updateTopic(t, temp.ID)">
              <el-option v-for="item in questionTypeOptions" :key="item.key" :label="$t(item.label)" :value="item.key" />
            </el-select>
            <el-input v-model="t.scorePerQuestion" style="width: 100px;" size="mini" @change="updateTopic(t, temp.ID)" />
            <el-input v-model="t.questionCount" style="width: 100px;" size="mini" @change="updateTopic(t, temp.ID)" />
            <el-button icon="el-icon-delete" size="mini" @click="deleteTopic(t.ID, temp.ID, idx)"></el-button>
          </div>
          <br />
          <!-- <el-button v-if="topics.length === 0" type="primary" size="mini" @click="insertDefaultTopic(temp.ID)">{{ $t('使用缺省题型配置') }}</el-button> -->
          <el-button v-if="dialogStatus !=='create'" type="primary" size="mini" @click="addTopic(temp.ID)">{{ $t('添加题型') }}</el-button>
          <br /><br />
          <el-tag style="width: 100px;">{{ $t('总分') + `: ${totalScore}` }}</el-tag>
        </el-tab-pane>
        <el-tab-pane name="难度分布" :label="$t('难度分布')">
          <div>
            <el-tag style="width: 100px;">{{ $t('难度') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('分值') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('删除') }}</el-tag>
          </div>
          <div v-for="(d, idx) in difficulties" :key="idx">
            <el-input v-model="d.difficulty" style="width: 100px;" size="mini" @change="updateDifficulty(d)" />
            <el-input v-model="d.score" style="width: 100px;" size="mini" @change="updateDifficulty(d)" />
            <el-button icon="el-icon-delete" size="mini" @click="deleteDifficulty(idx)"></el-button>
          </div>
          <br />
          <el-button type="primary" size="mini" @click="addDifficulty()">{{ $t('添加') }}</el-button>
          <br /><br />
          <el-tag style="width: 100px;">{{ $t('总分') + `: ${totalScore}` }}</el-tag>
        </el-tab-pane>
        <el-tab-pane name="出题范围" :label="$t('出题范围')">
          <div>
            <el-tag style="width: 130px;">{{ $t('范围') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('分值') }}</el-tag>
            <el-tag style="width: 100px;">{{ $t('删除') }}</el-tag>
          </div>
          <div v-for="(m, idx) in scoresOfMenu" :key="idx">
            <el-select v-model="m.menuID" style="width: 130px;" :placeholder="$t('目录')" class="filter-item" size="mini" @change="updateScoresOfMenu(m)">
              <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
            <el-input v-model="m.score" style="width: 100px;" size="mini" @change="updateScoresOfMenu(m)" />
            <el-button icon="el-icon-delete" size="mini" @click="deleteScoresOfMenu(idx)"></el-button>
          </div>
          <br />
          <el-button type="primary" size="mini" @click="addScoresOfMenu()">{{ $t('添加') }}</el-button>
          <br /><br />
          <el-tag style="width: 100px;">{{ $t('总分') + `: ${totalScore}` }}</el-tag>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clear()">
          {{ $t('取消') }}
        </el-button>
        <el-button type="success" @click="dialogStatus==='create'? createData() : updateData()">
          {{ $t('确定') }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="发起考试"
      :visible.sync="createExamFlag"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :center="true"
      width="50%"
      append-to-body
    >
      <el-form :model="createExamData" label-position="right" label-width="100px" style="width: 90%;" size="small">
        <el-form-item :label="$t('标题')">
          <el-input v-model="createExamData.title" />
        </el-form-item>
        <el-form-item :label="$t('副标题')">
          <el-input v-model="createExamData.subtitle" />
        </el-form-item>
        <el-form-item :label="$t('注意事项')">
          <el-input v-model="createExamData.remark" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
        </el-form-item>
        <el-form-item :label="$t('开始时间')">
          <el-date-picker
            v-model="createExamData.startAt"
            type="datetime"
            placeholder="选择日期时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('考试时长(分)')">
          <el-input v-model.number="createExamData.duration" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createExam">
          {{ $t('确定') }}
        </el-button>
        <el-button @click="createExamFlag = false">
          {{ $t('取消') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 试卷管理页

import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import numeral from 'numbro'

let typeLlist = [
  {
    paperID: 0,
    name: '单选题',
    questionType: api.QUESTION_TYPE_SINGLE,
    scorePerQuestion: 2,
    questionCount: 5
  },
  {
    paperID: 0,
    name: '多选题',
    questionType: api.QUESTION_TYPE_MULTI,
    scorePerQuestion: 4,
    questionCount: 5
  },
  {
    paperID: 0,
    name: '判断题',
    questionType: api.QUESTION_TYPE_JUDGE,
    scorePerQuestion: 4,
    questionCount: 5
  },
  {
    paperID: 0,
    name: '填空题',
    questionType: api.QUESTION_TYPE_FILLBLANK,
    scorePerQuestion: 4,
    questionCount: 5
  },
  {
    paperID: 0,
    name: '问答题',
    questionType: api.QUESTION_TYPE_QA,
    scorePerQuestion: 10,
    questionCount: 3
  }
]
export default {
  name: 'PaperManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      activeName: '基本设置',
      api: api,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        ID: 0,
        menuID: 0,
        type: 0,
        keyword: ''
      },
      questionTypeOptions: [
        { label: '单选题', key: api.QUESTION_TYPE_SINGLE },
        { label: '多选题', key: api.QUESTION_TYPE_MULTI },
        { label: '判断题', key: api.QUESTION_TYPE_JUDGE },
        { label: '填空题', key: api.QUESTION_TYPE_FILLBLANK },
        { label: '问答题', key: api.QUESTION_TYPE_QA }
      ],
      questionTypeLlist: [],
      scopeOptions: [
        { label: '考试和练习', key: 0 },
        { label: '只用于考试', key: 1 },
        { label: '只用于练习', key: 2 }
      ],
      menuOptions: [],
      menus: {},
      topics: [],
      difficulties: [{
        difficulty: 1,
        score: 100
      }], // 临时记录试卷难度配置
      scoresOfMenu: [{
        menuID: 0,
        score: 100
      }], // 临时记录试卷的出题范围
      showReviewer: false,
      temp: {
        ID: 0,
        menuID: 0,
        scope: 0,
        random: false,
        name: '',
        remark: '',
        duration: 60,
        difficultyTarget: 0.8
      },
      totalScore: 100, // 总分
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('修改'),
        create: this.$t('新建')
      },
      downloadLoading: false,
      createExamFlag: false,
      createExamData: {
        paperID: 0,
        title: '考试标题',
        subtitle: '考试副标题',
        remark: '请认真作答',
        startAt: new Date(),
        duration: 120
      }
    }
  },
  created() {
    this.getMenuData().then(() => {
      return this.getList()
    })
  },
  methods: {
    getMenuData() {
      this.menuOptions = [{
        label: this.$t('所有目录'),
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
    getList() {
      this.listLoading = true
      this.listQuery.menuID = this.listQuery.menuID || 0
      api.readPaper(this.listQuery).then(res => {
        this.list = res.items
        this.total = res.total || 0
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.listLoading = false
      })
    },
    getTopics(id) {
      api.readTopic({ ID: id }).then((res) => {
        this.topics = res.items || []
        this.totalScore = 0
        for (let t of this.topics) {
          this.totalScore += (t.scorePerQuestion || 0) * (t.questionCount || 0)
        }
      }).catch(err => {
        this.topics = []
        this.$msg.error(err)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$msg(this.$t('操作成功'))
      row.status = status
    },
    handleCreate() {
      this.activeName = '基本设置'
      delete this.temp.ID
      this.topics = []
      this.temp.random = this.temp.random || false
      this.getTypeList()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    clear() {
      this.temp = {
        ID: 0,
        menuID: 0,
        scope: 0,
        random: false,
        name: '',
        remark: '',
        duration: 60,
        difficultyTarget: 0.8
      }
      this.$refs['dataForm'].resetFields()
      this.dialogFormVisible = false
    },
    getTypeList() {
      let deepClone = (obj) => {
        let newObj = obj.constructor === Array ? [] : {}
        if (typeof obj !== 'object') {
          return obj
        } else {
          for (var i in obj) {
            if (typeof obj[i] === 'object') {
              newObj[i] = deepClone(obj[i])
            } else {
              newObj[i] = obj[i]
            }
          }
        }
        return newObj
      }
      this.questionTypeLlist = deepClone(typeLlist)
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          delete this.temp.ID
          this.updateScoresOfMenu()
          this.updateDifficulty()
          api.createPaper(this.temp).then((newPaper) => {
            this.temp.ID = newPaper.ID
            return this.insertDefaultTopic(newPaper.ID)
          }).then(() => {
            return api.generatePaper(this.temp.ID)
          }).then(() => {
            this.$msg(this.$t('创建成功'))
          }).catch(err => {
            this.$msg.error(err, 'Error')
          }).finally(() => {
            this.getList()
            this.clear()
          })
        }
      })
    },
    handleUpdate(row) {
      row.scope = row.scope || 0
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.getTopics(row.ID)
      this.buildDiffcultiesAndMenus()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          api.updatePaper(tempData).then(() => {
            this.dialogFormVisible = false
            this.$msg(this.$t('更新成功'))
            this.getList()
          }).catch(err => {
            this.$msg.error(err, 'Error')
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm(this.$t('确认删除该试卷?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      }).then(() => {
        return api.deletePaper(row.ID)
      }).then(() => {
        this.$msg(this.$t('删除成功'))
        this.getList()
      }).catch(err => {
        this.$msg.error(err, 'Error')
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    async insertDefaultTopic(id) {
      let gets = this.questionTypeLlist.map(item => {
        let params = item
        params.paperID = id
        params.questionCount = Number(params.questionCount)
        params.scorePerQuestion = Number(params.scorePerQuestion)
        return api.createTopic(params)
      })
      await Promise.all(gets).then(() => {
        return Promise.resolve()
      })
    },
    addTopic(id) {
      api.createTopic({
        paperID: id,
        name: this.$t('新加题型'),
        questionType: api.QUESTION_TYPE_SINGLE,
        scorePerQuestion: 4,
        questionCount: 5
      }).then(() => {
        this.getTopics(id)
      })
    },
    deleteTopic(tid, pid, index) {
      this.$confirm(this.$t('确认删除?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      }).then(() => {
        if (this.dialogStatus === 'create') {
          this.questionTypeLlist.splice(index, 1)
          this.updateTopic() // 删除后重新计算分数
          return
        }
        api.deleteTopic(tid || 0).then(() => {
          this.getTopics(pid)
        })
      })
    },
    updateTopic(topic, pid) {
      if (this.dialogStatus === 'create') {
        let num = 0
        this.questionTypeLlist.map(item => {
          if (item.questionCount !== '') {
            num = num + Number(item.questionCount) * Number(item.scorePerQuestion)
          }
        })
        this.totalScore = num
        return
      }
      api.updateTopic(topic || {}).then(() => {
        this.getTopics(pid)
      })
    },
    buildDiffcultiesAndMenus() {
      let difficulties = this.temp.difficulties || ''
      let scoresOfDifficulty = this.temp.scoresOfDifficulty || ''
      difficulties = difficulties.split(',')
      scoresOfDifficulty = scoresOfDifficulty.split(',')
      this.difficulties = []
      for (let i = 0; i < difficulties.length && i < scoresOfDifficulty.length; i++) {
        this.difficulties.push({
          difficulty: Number(difficulties[i]),
          score: Number(scoresOfDifficulty[i])
        })
      }

      let menus = this.temp.menus || ''
      let scoresOfMenu = this.temp.scoresOfMenu || ''
      menus = menus.split(',')
      scoresOfMenu = scoresOfMenu.split(',')
      this.scoresOfMenu = []
      for (let i = 0; i < menus.length && i < scoresOfMenu.length; i++) {
        this.scoresOfMenu.push({
          menuID: Number(menus[i]),
          score: Number(scoresOfMenu[i])
        })
      }
    },
    updateDifficulty(d) {
      this.temp.difficulties = this.difficulties.map(item => item.difficulty).join(',')
      this.temp.scoresOfDifficulty = this.difficulties.map(item => item.score).join(',')
    },
    deleteDifficulty(idx) {
      this.difficulties.splice(idx, 1)
      this.updateDifficulty()
    },
    addDifficulty() {
      this.difficulties.push({
        difficulty: 1,
        score: 100
      })
      this.updateDifficulty()
    },

    updateScoresOfMenu(d) {
      this.temp.menus = this.scoresOfMenu.map(item => item.menuID).join(',')
      this.temp.scoresOfMenu = this.scoresOfMenu.map(item => item.score).join(',')
    },
    deleteScoresOfMenu(idx) {
      this.scoresOfMenu.splice(idx, 1)
      this.updateScoresOfMenu()
    },
    addScoresOfMenu() {
      this.scoresOfMenu.push({
        menuID: this.temp.menuID,
        score: 100
      })
      this.updateScoresOfMenu()
    },
    // 生成试卷
    handleGenerate(id, name) {
      this.loading = this.$loading({
        lock: true,
        text: this.$t('正在生成试卷') + `,${name || ''}`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      })
      api.generatePaper(id).then((ret) => {
        this.$msg.success(this.$t('难度') + `:${numeral(ret.Difficulty).format('0.00')}\n` + this.$t('匹配度') + `:${numeral((1 - ret.Fitness) * 100).format('0.00')}%`, this.$t('生成试卷成功'))
      }).catch(e => {
        this.$msg.error(e, this.$t('生成试卷失败'))
      }).finally(() => {
        this.getList()
        this.loading && this.loading.close()
      })
    },
    showPaper(paper) {
      this.$router.push(`/exam/paper/${paper.ID}`)
    },
    callCreateExamDialog(paper) {
      this.createExamData.paperID = paper.ID
      this.createExamData.title = `使用试卷 ${paper.name} 发起的考试`
      this.createExamData.duration = paper.duration
      this.createExamFlag = true
    },
    createExam() {
      this.createExamData.startAt = this.createExamData.startAt.toISOString()
      api.createExam(this.createExamData).then(() => {
        this.$msg(`成功发起考试 ${this.createExamData.title}`)
        this.createExamFlag = false
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    menuCommand(...args) {
      let cmd = args[0]
      let row = args[1]
      let index = args[2]
      switch (cmd) {
        case 'update':
          this.handleUpdate(row)
          break
        case 'generate':
          this.handleGenerate(row.ID, row.name)
          break
        case 'preview':
          this.showPaper(row)
          break
        case 'del':
          this.handleDelete(row, index)
          break
        case 'exam':
          this.callCreateExamDialog(row)
          break
      }
    }
  }
}
</script>

<style>

</style>
