<template>
  <div class="dashboard-editor-container">
    <el-row>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>使用模式选择</span>
          </div>
          <el-form ref="form" :model="form" label-width="160px">
            <el-form-item label="培训学习模式">
              <el-button type="primary" disabled>理论学习</el-button>
              <el-button type="primary" @click="gotoStudy">操作学习</el-button>
            </el-form-item>
            <el-form-item label="个人鉴定模式">
              <el-button type="primary" disabled @click="gotoExam">理论考试</el-button>
              <el-button type="primary" @click="gotoCase">操作鉴定</el-button>
            </el-form-item>
            <el-form-item label="成组竞赛模式">
              <el-button type="primary" @click="gotoCase">进入竞赛模式</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>记录查询</span>
          </div>
          <el-form ref="form" :model="form" label-width="160px">
            <el-form-item label="学员历史操作记录">
              <el-button type="primary" icon="el-icon-search">查询</el-button>
            </el-form-item>
            <el-form-item label="学员历史学习记录">
              <el-button type="primary" icon="el-icon-search">查询</el-button>
            </el-form-item>
            <el-form-item label="学员历史成绩记录">
              <el-button type="primary" icon="el-icon-search">查询</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card class="card">
          <div slot="header" class="clearfix">
            <span>学员信息</span>
            <el-button
              style="float: right; padding: 0"
              type="text"
              @click="gotoProfile"
            >修改我的信息</el-button>
          </div>
          <el-form ref="form" :model="form" label-width="160px">
            <el-form-item label="学员名">
              <span>{{ name }}</span>
            </el-form-item>
            <el-form-item label="学员工种">
              <span>{{ "新员工" }}</span>
            </el-form-item>
            <el-form-item label="级别">
              <span>{{ "一级" }}</span>
            </el-form-item>
            <el-form-item label="仿真模式">
              <span>{{ "个人学习模式" }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DashboardEditor',
  data() {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      radioGroup: ''
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  },
  methods: {
    gotoStudy() {
      this.$router.push('/student/study')
    },
    gotoExam() {
      this.$router.push('/student/exam')
    },
    gotoCase() {
      this.$router.push('/student/case')
    },
    gotoProfile() {
      this.$router.push('/profile')
    }
  }
}
</script>

<style lang="scss" scoped>
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .dashboard-editor-container {
    min-height: calc(100vh - 82px);
    padding: 20px;
  }

  .el-col {
    padding: 10px;
  }
</style>
