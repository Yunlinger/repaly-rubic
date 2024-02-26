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
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      stripe
      highlight-current-row
      :cell-style="cellStyle"
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="ID" align="center" width="50">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('副标题')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.subtitle }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('标题')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('注意事项')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('开始时间')" width="140">
        <template slot-scope="{row}">
          <span>{{ formatTime(row.startAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('难度')" width="60">
        <template slot-scope="{row}">
          <span>{{ row.difficulty }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="210" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button type="primary" @click="handleUpdate(row)">
            {{ $t('修改') }}
          </el-button>
          <el-button type="primary" @click="gotoJudgeList(row)">
            {{ $t('判卷') }}
          </el-button>
          <el-button type="primary" @click="gotoScoreList(row)">
            {{ $t('统计') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
  </div>
</template>

<script>
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import moment from 'moment'

export default {
  name: 'ExamManage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
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
      this.listQuery.type = this.listQuery.type || 0
      api.readExam(this.listQuery).then(res => {
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
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    gotoJudgeList(row) {
      this.$router.push('/exam/judgelist/' + row.ID)
    },
    gotoScoreList(row) {
      this.$router.push('/exam/scorelist/' + row.ID)
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
    formatTime(dtstr) {
      return moment(dtstr).format('YYYY-MM-DD HH:mm:ss')
    },
    isActive(row) {
      let now = moment(new Date())
      let end = moment(row.startAt).add(row.duration, 'minute')
      return now.isBefore(end)
    },
    cellStyle(cell) {
      let style = 'padding-left: 2px; padding-right: 2px;'
      if (this.isActive(cell.row)) {
        style += 'color: green;'
      }
      return style
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
</style>
