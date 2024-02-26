<template>
  <div class="app-container">
    <el-card :body-style="{height: '100%'}">
      <div slot="header">
        <span>所有工程列表</span>
      </div>
      <el-table
        :key="tableKey"
        v-loading="allListLoading"
        :data="showList"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="工程名" align="center">
          <template slot-scope="{row}">
            <span>{{ row.name || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" align="center">
          <template slot-scope="{row}">
            <span>{{ row.desc || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <pagination :total="allList.length" :page.sync="page" :limit.sync="pageSize" @pagination="genShowList" />
  </div>
</template>

<script>
import * as papi from '@/api/project'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ProjectManage',
  directives: { waves },
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      total: 0,
      page: 1,
      pageSize: 10,
      allList: [],
      listLoading: true,
      allListLoading: true
    }
  },
  computed: {
    showList() {
      let start = this.pageSize * (this.page - 1)
      let end = this.pageSize * this.page
      return this.allList.slice(start, end)
    }
  },
  created() {
    this.getAllList()
  },
  methods: {
    getAllList() {
      this.allListLoading = true
      papi.alllist().then(res => {
        let allList = []
        for (let name in res.items) {
          allList.push(res.items[name])
        }
        this.allList = allList
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.allListLoading = false
      })
    },
    genShowList() {

    },
    handleDelete(project) {
      this.$prompt(`请输入工程名称 ${project.name} 进行确认`, '删除工程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value === project.name) {
          this.loading = this.$loading({
            lock: true,
            text: '正在删除工程: ' + value,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)'
          })
          // removeFromGroup, 不再使用 gid 参数
          return papi.removeFromGroup(project.name).then(() => {
            return papi.delet(value)
          })
        } else {
          return Promise.reject('输入工程名称不匹配')
        }
      }).then(() => {
        this.$msg.success('删除成功')
        this.getAllList()
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.loading && this.loading.close()
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
</style>
