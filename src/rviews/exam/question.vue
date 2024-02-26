<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.menuID" :placeholder="$t('目录')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.type" :placeholder="$t('题型')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in questionTypeOptions" :key="item.key" :label="$t(item.label)" :value="item.key" />
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
      <el-table-column :label="$t('题型')" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag>{{ $t(questionTypeOptions[row.type].label) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('目录')" align="center" width="120">
        <template slot-scope="{row}">
          <el-tag>{{ menus[row.menuID] ? menus[row.menuID].name : '' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('题干')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.caption1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('难度')" prop="difficulty" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.difficulty || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('状态')" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="!row.enable" type="danger">{{ $t('禁用') }}</el-tag>
          <el-tag v-if="row.enable" type="success">{{ $t('可用') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" width="140" class-name="small-padding">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('修改') }}
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('删除') }}
          </el-button>
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
      <el-form ref="dataForm" :model="temp" inline label-position="right" label-width="100px" style="width: 90%;" size="small">
        <el-form-item :label="$t('目录')" style="width: 45%;">
          <el-select v-model="temp.menuID" :placeholder="$t('目录')" clearable class="filter-item">
            <el-option v-for="item in menuOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('题型')" style="width: 45%;">
          <template v-if="dialogStatus==='update'">
            <el-tag>{{ $t(questionTypeOptions[temp.type || 0].label) }}</el-tag>
          </template>
          <template v-else>
            <el-select v-model="temp.type" :placeholder="$t('题型')" clearable class="filter-item">
              <el-option v-for="item in questionTypeOptions" :key="item.key" :label="$t(item.label)" :value="item.key" />
            </el-select>
          </template>
        </el-form-item>
        <el-form-item :label="$t('可用')" style="width: 45%;">
          <el-checkbox v-model="temp.enable"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('难度')" style="width: 45%;">
          <el-input v-model="temp.difficulty" />
        </el-form-item>
      </el-form>
      <el-form ref="dataForm" :model="temp" label-position="right" label-width="100px" style="width: 90%;" size="small">
        <el-form-item :label="$t('题干')" prop="caption1">
          <el-input v-model="temp.caption1" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" />
        </el-form-item>
        <template v-if="temp.type === api.QUESTION_TYPE_SINGLE || temp.type === api.QUESTION_TYPE_MULTI">
          <el-form-item :label="$t('参考答案')">
            <el-input v-if="temp.type === api.QUESTION_TYPE_MULTI" v-model="temp.answer1" style="width: 130px" />
            <el-select v-else v-model="temp.answer1" :placeholder="$t('参考答案')" class="filter-item" style="width: 130px">
              <el-option v-for="item in ['A','B','C','D','E','F','G']" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="A">
            <el-input v-model="temp.optionA" />
          </el-form-item>
          <el-form-item label="B">
            <el-input v-model="temp.optionB" />
          </el-form-item>
          <el-form-item label="C">
            <el-input v-model="temp.optionC" />
          </el-form-item>
          <el-form-item label="D">
            <el-input v-model="temp.optionD" />
          </el-form-item>
          <el-form-item label="E">
            <el-input v-model="temp.optionE" />
          </el-form-item>
          <el-form-item label="F">
            <el-input v-model="temp.optionF" />
          </el-form-item>
          <el-form-item label="G">
            <el-input v-model="temp.optionG" />
          </el-form-item>
        </template>
        <template v-if="temp.type === api.QUESTION_TYPE_JUDGE">
          <el-form-item :label="$t('参考答案')">
            <el-radio v-model="temp.answer1" label="true">{{ $t('正确') }}</el-radio>
            <el-radio v-model="temp.answer1" label="false">{{ $t('错误') }}</el-radio>
          </el-form-item>
        </template>
        <template v-if="temp.type === api.QUESTION_TYPE_FILLBLANK">
          <el-form-item :label="$t('第1空')">
            <el-input v-model="temp.answer1" />
          </el-form-item>
          <el-form-item :label="$t('第2空')">
            <el-input v-model="temp.answer2" />
          </el-form-item>
          <el-form-item :label="$t('第3空')">
            <el-input v-model="temp.answer3" />
          </el-form-item>
          <el-form-item :label="$t('第4空')">
            <el-input v-model="temp.answer4" />
          </el-form-item>
          <el-form-item :label="$t('第5空')">
            <el-input v-model="temp.answer5" />
          </el-form-item>
          <el-form-item :label="$t('第6空')">
            <el-input v-model="temp.answer6" />
          </el-form-item>
          <el-form-item :label="$t('第7空')">
            <el-input v-model="temp.answer7" />
          </el-form-item>
          <el-form-item :label="$t('第8空')">
            <el-input v-model="temp.answer8" />
          </el-form-item>
        </template>
        <template v-if="temp.type === api.QUESTION_TYPE_QA">
          <el-form-item :label="$t('参考答案')">
            <el-input v-model="temp.answer1" type="textarea" :autosize="{ minRows: 8, maxRows: 16 }" />
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('取消') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('确定') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'QuestionManage',
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
      questionTypeOptions: [
        { label: '所有题型', key: 0 },
        { label: '单选题', key: api.QUESTION_TYPE_SINGLE },
        { label: '多选题', key: api.QUESTION_TYPE_MULTI },
        { label: '判断题', key: api.QUESTION_TYPE_JUDGE },
        { label: '填空题', key: api.QUESTION_TYPE_FILLBLANK },
        { label: '问答题', key: api.QUESTION_TYPE_QA }
      ],
      menuOptions: [],
      menus: {},
      showReviewer: false,
      temp: {
        ID: 0,
        enable: false,
        caption1: '',
        answer1: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('修改'),
        create: this.$t('新建')
      },
      downloadLoading: false
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
      api.readQuestion(this.listQuery).then(res => {
        this.list = res.items
        this.total = res.total || 0
      }).catch(err => {
        this.$msg.error(err, this.$t('获取题库错误'))
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          delete this.temp.ID
          api.createQuestion(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$msg(this.$t('创建成功'))
            this.getList()
          }).catch(err => {
            this.$msg.error(err, this.$t('创建失败'))
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          api.updateQuestion(tempData).then(() => {
            this.dialogFormVisible = false
            this.$msg(this.$t('更新成功'))
            this.getList()
          }).catch(err => {
            this.$msg(err, this.$t('更新失败'))
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm(this.$t('确认从题库中删除该题?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      }).then(() => {
        return api.deleteQuestion(row.ID)
      }).then(() => {
        this.$msg(this.$t('删除成功'))
        this.getList()
      }).catch(err => {
        this.$msg(err, this.$t('删除失败'))
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
