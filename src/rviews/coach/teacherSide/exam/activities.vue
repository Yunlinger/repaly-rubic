<template>
  <div v-loading="listLoading" class="app-container">
    <div class="filter-container" style="position: relative;">
      <el-input v-model="listQuery.keyword" placeholder="输入关键字回车筛选" style="width: 200px;margin-right: 20px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('查找') }}
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-refresh" @click="handleFilter">
        {{ $t('刷新') }}
      </el-button>
      <el-popover
        v-if="!test"
        placement="bottom"
        width="400"
        trigger="click"
      >
        <div style="height: 150px;">
          <div style="height: 20px;">请选择试卷目录</div>
          <div style="height: 102px; overflow-y: auto;">
            <el-checkbox-group v-model="menu">
              <el-checkbox v-for="item in menuOptions" :key="item.key" :label="item.key">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <div style="float: right;">
            <el-button type="success" style="margin-left: 10px;" @click="exercise">确定</el-button>
          </div>
        </div>
        <el-button slot="reference" class="filter-item" style="position: absolute; top: 0; right: 0;" type="success" icon="el-icon-circle-plus-outline">
          自由练习
        </el-button>
      </el-popover>
    </div>
    <div class="main">
      <div v-if="!test" style="height: 100%; overflow-y: auto;">
        <div v-for="i in list" :key="i.ID" class="item" :class="{load: isActive(i) === 2}" :style="{background:isActive(i) === 1 ? '#409EFF' : '#67C23A'}">
          <div class="title">
            <div>{{ i.title }}</div>
            <div>{{ i.subtitle }}</div>
          </div>
          <div style="line-height: 40px;">
            <div>开始时间：<span>{{ formatTime(i.startAt) }}</span></div>
            <div>考试时长：<span>{{ i.duration }}</span></div>
          </div>
          <div style="margin-right: 10px;">
            <el-button type="primary" @click="start(i)">
              {{ $t('参加考试') }}
            </el-button>
          </div>
        </div>
      </div>
      <msk v-else :id="testId" :type="exam" :userList="{}" :menu="menu" @over="testOver()">
      </msk>
    </div>

    <pagination v-if="!test" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as api from '@/api/exam'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import moment from 'moment'
import { mapGetters } from 'vuex'
import msk from './msk.vue'

export default {
  name: 'Activities',
  components: { Pagination, msk },
  directives: { waves },
  data() {
    return {
      api: api,
      tableKey: 0,
      list: [],
      total: 0,
      loading: null,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10,
        ID: 0,
        menuID: 0,
        type: 0,
        keyword: '',
        unfinished: true
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
      test: false,
      testId: 0,
      exam: 1,
      menu: []
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created() {
    this.getMenuData().then(() => {
      return this.getList()
    })
    this.$on('global:ticker', (msg) => {
      this.times()
    })
  },
  methods: {
    getMenuData() {
      this.menuOptions = []
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
    start(row) {
      this.ack(row).then(() => {
        this.exam = 1
        this.testId = row.ID
        this.test = true
      }).catch(() => {
        this.$msg.error('已交卷')
      })
    },
    ack(row) {
      let obj = {
        page: 1,
        pageSize: 10,
        examID: row.ID,
        studentID: this.user.id
      }
      return api.getCommitList(obj).then(res => {
        if (res.items.length > 0) {
          return Promise.reject()
        } else {
          return Promise.resolve()
        }
      })
    },
    formatTime(dtstr) {
      return moment(dtstr).format('YYYY-MM-DD HH:mm:ss')
    },
    testOver() {
      this.test = false
    },
    isActive(row) {
      let now = moment(new Date())
      let start = moment(row.startAt)
      let end = moment(row.startAt).add(row.duration, 'minute')
      return now.isBefore(start) ? 1 : (now.isBefore(end) ? 2 : 3)
    },
    times() {
      let list = this.list
      list.map(item => {
        let hasEnd = this.isActive(item)
        if (hasEnd === 3) this.getList()
      })
    },
    exercise() {
      if (this.menu.length < 1) {
        this.menu = []
      }
      this.exam = 2
      this.test = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    user-select: none;
  }
  .main{
    height: calc(100vh - 234px);
    overflow-y: auto;
  }
  .item {
    height: 80px;
    display: flex;
    justify-content: space-between;
    line-height: 80px;
    color: #FFF;
    border-radius: 10px;
    margin-bottom: 10px;
    background: rgb(40, 49, 66);
    .title {
      width: 300px;
      min-width: 300px;
      text-indent: 2em;
      line-height: 40px;
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
</style>
