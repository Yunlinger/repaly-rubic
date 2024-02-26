<template>
  <div class="stu">
    <div style="margin:-5px 0 0 0;">工程工况</div>
    <div class="but">
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
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
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
        <el-table-column prop="group" label="工程名称" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="desc" label="工程描述" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="model" label="工程类型" show-overflow-tooltip>
        </el-table-column>
        <el-table-column fixed="right" label="操作" show-overflow-tooltip>
          <template>
            <el-button type="text" size="small" @click="showCondition()">
              查看工况
            </el-button>
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
      value: [],
      states: ['test1', 'test2'],
      tableData: [{
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }, {
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }, {
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }, {
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }, {
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }, {
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }, {
        desc: 'xxxxxx',
        group: '乙酸xxx开车A组',
        model: '仿真工程'
      }],
      multipleSelection: [],
      currentPage: 1
    }
  },
  methods: {
    showCondition() {
      alert(4235)
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
