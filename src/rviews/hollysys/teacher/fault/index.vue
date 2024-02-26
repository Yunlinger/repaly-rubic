<template>
  <div class="stu">
    <div style="margin:-5px 0 0 0;">故障管理</div>
    <div class="but">
      <el-select v-model="value" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
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
    <div class="block">
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="name" label="故障名称" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="model" label="故障类型" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="start" label="起始条件" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="end" label="终止条件" show-overflow-tooltip>
        </el-table-column>
        <el-table-column label="创建时间" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.date }}</template>
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
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
        end: 'xxxxxxx',
        date: '2022/07/11 13:40:56',
        model: '通用故障',
        time: '60'
      }, {
        name: '加氢系统开车XXX故障',
        start: 'xxxxxxxx',
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

