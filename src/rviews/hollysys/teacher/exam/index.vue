<template>
  <div class="stu">
    <div style="margin:-5px 0 0 0;">成绩管理</div>
    <div class="but">
      <el-button type="primary" @click="showAddStudentDialog">导出成绩 </el-button>
      <div class="sousuo">
        <el-select
          v-model="value"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入学员姓名或学号"
          :remote-method="remoteMethod"
          :loading="loading"
        >
          <el-option v-for="item in option" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-button type="plain" icon="el-icon-search"></el-button>
      </div>
    </div>
    <div class="blocks">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="name" label="试卷名称" show-overflow-tooltip>
        </el-table-column>
      </el-table>
    </div>
    <div class="block">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="id" label="学员机" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="name" label="学员姓名" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="number" label="学号" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="group" label="分组" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="date" label="考试开始时间" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="totalScore" label="总得分" show-overflow-tooltip class="totalClass">
        </el-table-column>
        <el-table-column prop="stepScore" label="步骤得分" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="group" label="质量得分" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="group" label="扣分" show-overflow-tooltip>
        </el-table-column>
        <el-table-column fixed="right" label="操作" show-overflow-tooltip>
          <template>
            <el-button type="text" size="small">得分明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[15, 30, 40, 50]"
          :page-size="100"
          layout="total,  prev, pager, next, sizes"
          :total="324"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      options: [],
      option: [{
        value: '选项1',
        label: 'XXXXXXX工程'
      }, {
        value: '选项2',
        label: 'XXXXXXX工程'
      }, {
        value: '选项3',
        label: 'XXXXXXX工程'
      }],
      value: '',
      states: ['test1', 'test2'],
      tableData: [{
        id: '001',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '89',
        stepScore: '12',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        id: '002',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '99',
        stepScore: '20',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        id: '003',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '89',
        stepScore: '20',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        id: '004',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '89',
        stepScore: '20',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        id: '005',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '87',
        stepScore: '20',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        id: '006',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '89',
        stepScore: '20',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        id: '007',
        number: '2345456',
        group: 'XXXA组',
        name: '杨江江',
        totalScore: '89',
        stepScore: '20',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }],
      multipleSelection: [],
      currentPage: 1
    }
  },
  methods: {
    showAddStudentDialog() {
      console.log(234)
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleClick(row) {
      console.log(row)
    },
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.options = this.list.filter(item => {
            return item.label.toLowerCase()
              .indexOf(query.toLowerCase()) > -1
          })
        }, 200)
      } else {
        this.options = []
      }
    }
  }
}

</script>
<style>
  .blocks {
    width: 15%;
    height: 570px;
    float: left;
    margin-right: 2%;
    background: white;
  }
  .block {
    width: 80%;
    height: 570px;
    float: left;
  }

</style>

