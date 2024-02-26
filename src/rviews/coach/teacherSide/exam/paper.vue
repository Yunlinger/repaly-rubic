<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.menuID" :placeholder="$t('目录')" clearable class="filter-item" style="width: 130px;margin-right: 20px;" @change="getList()">
        <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-input v-model="listQuery.keyword" :placeholder="$t('关键字')" style="width: 200px;margin-right: 20px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新建试卷
      </el-button>
    </div>

    <div ref="main" class="main">
      <div v-for=" i in list" :key="i.ID" class="list_item">
        <div class="item">
          <div v-if="i.ID">
            <p style="margin: 0;cursor: pointer;" @click="showPaper(i)">{{ i.name }}</p>
            <el-divider></el-divider>
            <p>考试时间：<span style="color: #F56C6C">{{ i.duration }}</span></p>
            <p>所属专业：<span style="color: #F56C6C">{{ menus[i.menuID] ? menus[i.menuID].name : '所有目录' }}</span></p>
            <p>备注：<span style="color: #F56C6C">{{ i.remark }}</span></p>
            <div class="item_buttons">
              <el-tooltip effect="dark" content="修改试卷" placement="top">
                <i class="el-icon-edit" @click="handleUpdate(i)" />
              </el-tooltip>
              <span style="background: #67C23A;" @click="callCreateExamDialog(i)">发起考试</span>
              <span style="background: #67C23A;" @click="showPaper(i)">预览试卷</span>
              <el-tooltip effect="dark" content="删除试卷" placement="top">
                <i class="el-icon-delete" @click="handleDelete(i)" />
              </el-tooltip>
              <!-- <span style="background: #E6A23C;" @click="handleUpdate(i)">修改试卷</span>
              <span style="background: #67C23A;" @click="callCreateExamDialog(i)">发起考试</span>
              <span style="background: #F56C6C" @click="handleDelete(i)">删除试卷</span> -->
            </div>
          </div>
          <!-- <div v-else style="text-align: center;line-height: 314px;cursor: pointer;" @click="handleCreate">
            新组试卷<i class="el-icon-plus" />
          </div> -->
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" :pageSizes="pageSizes" @pagination="getList" />

    <!-- 新建/修改试卷 -->
    <!-- <el-dialog
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
          <div style="display: flex; justify-content: space-around;">
            <el-tag v-for="ite in questionTypeOptions" :key="ite.label">{{ ite.label }}题库总数量<span style="color: red;">{{ counts[ite.key] }}</span></el-tag>
          </div>
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
    </el-dialog> -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :center="true"
      width="1000px"
    >
      <el-form ref="dataForm" :model="temp" label-position="right" label-width="100px" style="width: 90%;" size="small">
        <el-form-item :label="$t('目录')" style="width: 45%;">
          <el-select v-model="temp.menuID" :placeholder="$t('目录')" class="filter-item">
            <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('名称')">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('时长') + '(分钟)'" style="width: 45%;">
          <el-input v-model="temp.duration" />
        </el-form-item>
        <el-form-item :label="$t('难度')" style="width: 45%;">
          <el-select v-model="temp.difficultyTarget" placeholder="请选择">
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('备注')">
          <el-input v-model="temp.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
        </el-form-item>
        <el-form-item label="出题范围">
          <el-checkbox-group v-model="cache" @change="updateScoresOfMenu">
            <el-checkbox v-for="item in menuOptions" :key="item.key" :disabled="cache.includes('所有目录') && item.label !== '所有目录'" :label="item.label">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <!-- 难度分布 -->
      <!-- <div style="text-align: center;">
        <div>
          <el-tag style="width: 130px;">{{ $t('范围') }}</el-tag>
          <el-tag style="width: 100px;">{{ $t('分值') }}</el-tag>
          <el-tag style="width: 44px;">{{ $t('删除') }}</el-tag>
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
      </div> -->
      <!-- 出题范围 -->
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; justify-content: space-around;">
          <el-tag v-for="ite in questionTypeOptions" :key="ite.label">{{ ite.label }}题库总数量<span style="color: red;">{{ counts[ite.key] || 0 }}</span></el-tag>
        </div>
        <div>
          <el-tag style="width: 100px;">{{ $t('题号') }}</el-tag>
          <el-tag style="width: 200px;">{{ $t('名称') }}</el-tag>
          <el-tag style="width: 130px;">{{ $t('题型') }}</el-tag>
          <el-tag style="width: 100px;">{{ $t('题库总数量') }}</el-tag>
          <el-tag style="width: 100px;">{{ $t('每题分数') }}</el-tag>
          <el-tag style="width: 100px;">{{ $t('题目数量') }}</el-tag>
          <el-tag style="width: 44px;">{{ $t('删除') }}</el-tag>
        </div>
        <div v-for="(t, idx) in (dialogStatus === 'create' ? questionTypeLlist : topics)" :key="t.questionType">
          <div v-if="counts[t.questionType]">
            <el-tag style="width: 100px;">{{ idx+1 }}</el-tag>
            <el-input v-model="t.name" style="width: 200px;" size="mini" @change="updateTopic(t, temp.ID)" />
            <el-select v-model="t.questionType" :placeholder="$t('题型')" style="width: 130px" size="mini" @change="updateTopic(t, temp.ID)">
              <el-option v-for="item in questionTypeOptions" :key="item.key" :label="$t(item.label)" :value="item.key" />
            </el-select>
            <el-tag style="width: 100px;color: red;">{{ counts[t.questionType] }}</el-tag>
            <el-input v-model="t.scorePerQuestion" style="width: 100px;" size="mini" @change="updateTopic(t, temp.ID)" />
            <el-input v-model="t.questionCount" style="width: 100px;" size="mini" @change="updateTopic(t, temp.ID)" />
            <el-button icon="el-icon-delete" size="mini" @click="deleteTopic(t.ID, temp.ID, idx)"></el-button>
          </div>
        </div>
        <br />
        <!-- <el-button v-if="topics.length === 0" type="primary" size="mini" @click="insertDefaultTopic(temp.ID)">{{ $t('使用缺省题型配置') }}</el-button> -->
        <el-button v-if="dialogStatus !=='create'" type="primary" size="mini" @click="addTopic(temp.ID)">{{ $t('添加题型') }}</el-button>
        <br /><br />
        <el-tag style="width: 100px;">{{ $t('总分') + `: ${totalScore}` }}</el-tag>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clear()">
          {{ $t('取消') }}
        </el-button>
        <el-button type="success" @click="dialogStatus==='create'? createData() : updateData()">
          {{ $t('确定') }}
        </el-button>
      </div>
    </el-dialog>
    <!-- 发起考试 -->
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
            :picker-options="pickerOptions"
            placeholder="选择日期时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('考试时长(分)')">
          <el-select v-model.number="createExamData.duration" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="createExam">
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
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      activeName: '基本设置',
      api: api,
      tableKey: 0,
      list: [],
      total: 0,
      loading: false, // 试卷创建加载
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        ID: 0,
        menuID: 0,
        type: 0,
        keyword: ''
      },
      pageSizes: [10],
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
      menuOptions: [],
      questionTypeLlist: [],
      options: [
        {
          value: 30,
          label: '30分钟'
        }, {
          value: 60,
          label: '1小时'
        }, {
          value: 90,
          label: '90分钟'
        }, {
          value: 120,
          label: '2小时'
        }
      ],
      difficultyOptions: [{
        value: 0.25,
        label: '容易'
      }, {
        value: 0.5,
        label: '中等'
      }, {
        value: 0.75,
        label: '困难'
      }, {
        value: 1,
        label: '非常困难'
      }],
      cache: [],
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
        difficultyTarget: 0.75
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
        duration: 60
      },
      counts: {}
    }
  },
  watch: {
    cache(val) {
      if (val.includes('所有目录') && val.length > 1) {
        this.cache = ['所有目录']
      }
    }
  },
  created() {
    this.getMenuData().then(() => {
      // let width = this.$refs.main.clientWidth
      // let page = Math.trunc(width / 233)
      // this.listQuery.pageSize = page * 2
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
    getList(data) {
      this.list = []
      this.total = 0
      this.listLoading = true
      this.listQuery.menuID = this.listQuery.menuID || 0
      let page = 1
      if (data) {
        page = data.page
      }
      let obj = {
        page: page,
        pageSize: this.listQuery.pageSize,
        ID: this.listQuery.ID,
        menuID: this.listQuery.menuID,
        type: this.listQuery.type,
        keyword: this.listQuery.keyword
      }
      api.readPaper(obj).then(res => {
        this.list = res.items
        this.total = res.total || 0
        this.listQuery.page = page
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
      this.getCount()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    clear() {
      this.temp = {
        ID: 0,
        menuID: 0,
        scope: 0,
        random: true,
        name: '',
        remark: '',
        duration: 60,
        difficultyTarget: 0.5
      }
      this.cache = []
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
            this.dialogFormVisible = false
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
          api.updatePaper(tempData).then(res => {
            this.dialogFormVisible = false
            this.handleGenerate(res.ID)
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
      let list = this.questionTypeLlist.filter(item => this.counts[item.questionType])
      let gets = list.map(item => {
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
        if (topic.questionCount > this.counts[topic.questionType]) {
          topic.questionCount = '0'
          return
        }
        let num = 0
        this.questionTypeLlist.map(item => {
          if (item.questionCount !== '' && this.counts[item.questionType]) {
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
      // let scoresOfMenu = this.temp.scoresOfMenu || ''
      menus = menus.split(',')
      // scoresOfMenu = scoresOfMenu.split(',')
      let cache = this.menuOptions.filter(item => {
        return menus.includes(String(item.key))
      })
      this.cache = [].concat(cache.map(item => String(item.label)))
      // this.scoresOfMenu = []
      // for (let i = 0; i < menus.length && i < scoresOfMenu.length; i++) {
      //   this.scoresOfMenu.push({
      //     menuID: Number(menus[i]),
      //     score: Number(scoresOfMenu[i])
      //   })
      // }
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
    getCount() {
      let list = []
      if (this.temp.menus) {
        list = this.temp.menus.split(',')
        if (list.findIndex(item => item === '0') !== -1) {
          list = []
        }
      }
      let params = { ids: list }
      api.count(params).then(res => {
        this.counts = res.counts
        this.questionTypeLlist.map(item => {
          if (!res.counts[item.questionType]) {
            this.updateTopic(item)
          }
        })
      })
    },
    updateScoresOfMenu(d) {
      let cache = this.menuOptions.filter(item => this.cache.includes(item.label))
      this.temp.menus = cache.map(item => item.key).join(',')
      this.temp.scoresOfMenu = cache.map(item => {
        return '100'
      }).join(',')
      this.getCount()
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
    handleGenerate(id) {
      this.listLoading = this.$loading({
        lock: true,
        text: this.$t('正在修改中'),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      })
      api.generatePaper(id).then((ret) => {
        this.$msg(this.$t('修改成功'))
        this.listLoading && this.listLoading.close()
        this.getList()
        // this.$msg.success(this.$t('难度') + `:${numeral(ret.Difficulty).format('#.00')}\n` + this.$t('匹配度') + `:${numeral((1 - ret.Fitness) * 100).format('#.00')}%`, this.$t('生成试卷成功'))
      }).catch(e => {
        this.$msg.error(e, this.$t('修改试卷失败'))
        this.listLoading && this.listLoading.close()
      })
    },
    showPaper(paper) {
      this.$emit('showPaper', paper.ID)
      // this.$router.push(`/exam/paper/${paper.ID}`)
    },
    callCreateExamDialog(paper) {
      this.createExamData.paperID = paper.ID
      this.createExamData.startAt = new Date()
      this.createExamFlag = true
    },
    createExam() {
      let time = this.createExamData.startAt.toISOString()
      let idx = time.lastIndexOf(':')
      this.createExamData.startAt = time.substring(0, idx) + ':00.000Z'
      this.loading = true
      api.createExam(this.createExamData).then(() => {
        this.$msg(`成功发起考试 ${this.createExamData.title}`)
        this.createExamFlag = false
        this.$emit('createExam')
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.loading = false
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

<style lang="scss" scoped>
.app-container {
    .main {
        width: 100%;
        height: calc(100vh - 244px);
        overflow-y: auto;
        margin-top: 10px;
        padding: 5px;
        display: flex;
        flex-wrap: wrap;
        // justify-content: space-between;
        .list_item {
          flex:0 0 20%;
          .item {
            margin: 0 auto;
            position: relative;
            width: 213px;
            height: 300px;
            padding: 3px;
            background-color: #e3e3e3;
            box-shadow:2px 2px 10px #fff;
            user-select: none;
          }
          .item_buttons {
            position: absolute;
            left: 0; bottom: 5px;
            width: 100%;
            height: 25px;
            display: flex;
            justify-content: space-around;
            font-size: 14px;
            span {
              padding: 3px;
              // color: #FFF;
              border-radius: 5px;
              cursor: pointer;
            }
            i {
              cursor: pointer;
              line-height: 25px;
            }
          }
        }
        .item:hover {
          background: #409EFF;
          color: #FFF;
        }
    }
    ::v-deep .el-divider--horizontal {
        margin: 5px 0;
        background-color: #fff;
    }
}
</style>
