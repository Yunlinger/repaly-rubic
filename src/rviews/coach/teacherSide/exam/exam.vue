<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-select v-model="listQuery.menuID" :placeholder="$t('目录')" clearable class="filter-item" style="width: 130px;margin-right: 20px;" @change="getList()">
        <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select> -->
      <el-input v-model="listQuery.keyword" :placeholder="$t('关键字回车筛选')" style="width: 200px;margin-right: 20px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="handleFilter">
        {{ $t('刷新') }}
      </el-button>
    </div>

    <div class="main">
      <div
        v-for="item in list"
        :key="item.ID"
        class="main_item"
        :class="{load: item.isStart === 2}"
        :style="{background: item.isStart === 1 ? '#409EFF' : (item.isStart === 3 ? '#C0C4CC' : '#67C23A'), color: item.isStart === 3 ? '#000' : (item.isStart === 1 ? '' : '')}"
      >
        <div class="title">
          <div>{{ item.title }}</div>
          <div>{{ item.subtitle }}</div>
        </div>
        <div class="info">
          <div>考试时间：<span>{{ formatTime(item.startAt) }}</span></div>
          <div>{{ times(item) }}</div>
        </div>
        <div class="handle">
          <el-button v-if="item.isStart === 1" type="warning" @click="handleUpdate(item)">
            {{ $t('修改') }}
          </el-button>
          <el-button v-if="item.isStart === 2" :loading="true" round type="warning">考试中</el-button>
          <el-button v-if="item.isStart === 3" type="primary" @click="handleMark(item)">
            {{ $t('判卷') }}
          </el-button>
          <el-button v-if="item.isStart === 3" type="primary" @click="stat(item)">
            {{ $t('统计') }}
          </el-button>
          <el-popconfirm
            title="确定取消考试吗？"
            @onConfirm="examDel(item)"
          >
            <el-button v-if="item.isStart !== 3" slot="reference" type="danger" style="margin-left: 10px;">取消考试</el-button>
          </el-popconfirm>
        </div>
      </div>
    </div>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog
      title="修改考试"
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
        <el-button type="primary" @click="updateExam">
          {{ $t('确定') }}
        </el-button>
        <el-button @click="createExamFlag = false">
          {{ $t('取消') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="考试信息统计"
      :visible.sync="dialogVisible"
      width="901px"
      height="300"
      append-to-body
    >
      <el-table
        :data="statList"
        border
        fit
        stripe
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column :label="$t('用户名')" width="120">
          <template slot-scope="{row}">
            <span>{{ row.studentName || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('姓名')" width="80">
          <template slot-scope="{row}">
            <span>{{ row.studentCName || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('考试名称')" width="240">
          <template slot-scope="{row}">
            <span>{{ row.exam.title }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('总分')" width="60">
          <template slot-scope="{row}">
            <span>{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('开始时间')" width="140">
          <template slot-scope="{row}">
            <span>{{ formatTime(row.startAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('提交时间')" width="140">
          <template slot-scope="{row}">
            <span>{{ formatTime(row.CreatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="duration"
          :label="$t('用时')"
          width="80"
        >
          <template slot-scope="scope">
            <span>{{ `${scope.row.duration+1} 分钟` }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <msk v-if="judge" :id="judegId" :type="3" :userList="table" @over="testOver()" />

  </div>
</template>

<script>
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import moment from 'moment'
import msk from './msk.vue'

export default {
  name: 'ExamManage',
  components: { Pagination, msk },
  directives: { waves },
  data() {
    return {
      api: api,
      tableKey: 0,
      list: [],
      table: [],
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
      importanceOptions: [1, 2, 3],
      menuOptions: [],
      menus: {},
      showReviewer: false,
      downloadLoading: false,
      createExamFlag: false,
      createExamData: {
        paperID: 0,
        title: '考试标题',
        subtitle: '考试副标题',
        remark: '请认真作答',
        startAt: new Date(),
        duration: 120
      },
      timer: null,
      judge: false,
      judegId: 0,
      dialogVisible: false,
      statList: []
    }
  },
  created() {
    this.getMenuData().then(() => {
      return this.getList()
    })
    this.$on('global:ticker', (msg) => {
      this.timers()
    })
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
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
      this.listQuery.type = this.listQuery.type || 0
      api.readExam(this.listQuery).then(res => {
        for (let i of res.items) {
          i.isStart = this.isActive(i)
        }
        this.list = res.items
        this.total = res.total || 0
      }).catch(err => {
        this.$msg.error(err, this.$t('读取考试列表错误'))
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      delete this.temp.ID
      this.temp.enable = this.temp.enable || false
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.createExamData = {
        ID: row.ID,
        paperID: row.paperID,
        title: row.title,
        subtitle: row.subtitle,
        remark: row.remark,
        startAt: moment(row.startAt),
        duration: row.duration
      }
      this.createExamFlag = true
    },
    updateExam() {
      this.createExamData.startAt = this.createExamData.startAt.toISOString()
      api.updateExam(this.createExamData).then(() => {
        this.$msg(`成功更新考试 ${this.createExamData.title}`)
        this.createExamFlag = false
        this.getList()
        this.$emit('updateExam')
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    formatTime(dtstr) {
      return moment(dtstr).format('YYYY-MM-DD HH:mm:ss')
    },
    handleMark(row) {
      let obj = {
        page: 1,
        pageSize: 10,
        examID: row.ID
      }
      api.getCommitList(obj).then(res => {
        if (res.items.length === 0) {
          this.$msg.error('参考人数0')
          return
        }
        this.table = res
        this.judegId = row.ID
        this.judge = true
      }).catch(err => {
        this.$msg.error(err, this.$t('读取列表错误'))
      })
    },
    testOver() {
      this.judegId = ''
      this.judge = false
    },
    handleDelete(row, index) {
      this.$confirm(this.$t('确认删除该考试?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      }).then(() => {
        return api.deleteExam(row.ID)
      }).then(() => {
        this.$msg(this.$t('删除成功'))
        this.getList()
      }).catch(err => {
        this.$msg.error(err, this.$t('删除失败'))
      })
    },
    menuCommand(...args) {
      let cmd = args[0]
      let row = args[1]
      let index = args[2]
      switch (cmd) {
        case 'del':
          this.handleDelete(row, index)
          break
        case 'start':
          this.start(row.ID)
          break
      }
    },
    isActive(row) {
      let now = moment(new Date())
      let start = moment(row.startAt)
      let end = moment(row.startAt).add(row.duration, 'minute')
      return now.isBefore(start) ? 1 : (now.isBefore(end) ? 2 : 3)
    },
    cellStyle(cell) {
      let style = 'padding-left: 2px; padding-right: 2px;'
      if (this.isActive(cell.row)) {
        style += 'color: green;'
      }
      return style
    },
    timers() {
      if (this.listLoading) return
      let list = this.list
      list.map(item => {
        item.isStart = this.isActive(item)
      })
    },
    times(row) {
      return row.isStart === 1 ? '考试未开始' : (row.isStart === 2 ? `考试时长：${row.duration}` : '考试已结束')
    },
    examDel(item) {
      let id = item.ID
      api.deleteExam(id).then(() => {
        this.getList()
        this.$emit('examDel')
      })
    },
    stat(item) {
      let obj = {
        page: 1,
        pageSize: 20,
        examID: item.ID
      }
      api.getCommitList(obj).then(res => {
        if (res.items.length === 0) {
          this.$msg.error('参考人数0')
          return
        }
        if (res.items) {
          for (var i = 0; i < res.items.length; i++) {
            res.items[i].duration = moment(res.items[i].CreatedAt).diff(moment(res.items[i].startAt), 'minute')
          }
        }
        this.statList = res.items
        this.dialogVisible = true
      }).catch(err => {
        this.$msg.error(err, this.$t('读取列表错误'))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
  .main {
    height: calc(100vh - 234px);
    overflow: auto;
    .main_item {
      height: 80px;
      display: flex;
      justify-content: space-between;
      color: #FFF;
      border-radius: 5px;
      margin-bottom: 10px;
      user-select: none;
      .title {
        width: 300px;
        min-width: 300px;
        text-indent: 2em;
        line-height: 40px;
      }
      .info {
        line-height: 40px;
        // span {
        //   color: #67C23A;
        // }
      }
      .number, .handle {
        line-height: 80px;
      }
      .handle {
        width: 180px;
        margin-right: 10px;
      }
    }
  }
  .load {
    animation:mymove 3s ease infinite;
  }
	@keyframes mymove {
    from {
      opacity: 1.0;
    }
    50% {
      opacity: 0.4;
    }
    to {
      opacity: 1.0;
    }
  }
  ::-webkit-scrollbar{
    height: 9px;
    width: 9px;
    cursor: pointer;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    border-style: dashed;
    border-color: transparent;
    border-width: 2px;
    background-color: rgba(157, 165, 183, 0.4);
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #67C23A;
  }
</style>
