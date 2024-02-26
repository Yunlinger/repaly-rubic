<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" style="padding: 8px">
        <el-card>
          <div slot="header">
            <span>本团队工程列表</span>
          </div>
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column label="工程名" align="center">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" align="center">
              <template slot-scope="{row}">
                <span>{{ row.desc }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="{row,$index}">
                <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12" style="padding: 8px">
        <el-card :body-style="{height: '100%'}">
          <div slot="header">
            <span>所有工程列表</span>
          </div>
          <el-table
            :key="tableKey"
            v-loading="allListLoading"
            :data="allList"
            border
            fit
            highlight-current-row
            :max-height="pageHeight"
            style="width: 100%;"
          >
            <el-table-column label="工程名" align="center">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" align="center">
              <template slot-scope="{row}">
                <span>{{ row.desc }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="{row,$index}">
                <el-button size="mini" type="primary" @click="handleAdd(row,$index)">
                  分配到团队
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { read } from '@/api/group'
import * as papi from '@/api/project'
import waves from '@/directive/waves' // waves directive

export default {
  name: 'GroupProjects',
  directives: { waves },
  data() {
    return {
      groupid: 0,
      tableKey: 0,
      list: [],
      allList: [],
      listLoading: true,
      allListLoading: true,
      pageHeight: 700
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.groupid = id || 0
    this.groupid = parseInt(this.groupid)
    this.getList()
    this.getAllList()
    read({ id: this.groupid }).then(res => {
      if (res && res.items && res.items.length > 0) {
        let route = Object.assign({}, this.$route, { title: `团队工程分配 - ${res.items[0].name}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
    })
  },
  mounted() {
    this.updatePageHeight()
    window.addEventListener('resize', this.updatePageHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updatePageHeight)
  },
  methods: {
    updatePageHeight() {
      let pageHeight = window.innerHeight || document.documentElement.clientHeight
      this.pageHeight = pageHeight - 200
    },
    getList() {
      this.listLoading = true
      papi.getProjectsOfGroup(this.groupid).then(res => {
        let list = []
        for (let name in res.items) {
          list.push(res.items[name])
        }
        this.list = list
        this.listLoading = false
      }).catch(err => {
        this.listLoading = false
        console.error(err)
      })
    },
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
    handleModifyStatus(row, status) {
      this.$notify({
        title: 'Success',
        message: '操作 Success',
        type: 'success'
      })
      row.status = status
    },
    handleAdd(project) {
      papi.addToGroup(project.name, this.groupid).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(err => {
        this.$notify({
          title: 'Error',
          message: err,
          type: 'error',
          duration: 2000
        })
      })
    },
    handleDelete(project) {
      papi.removeFromGroup(project.name, this.groupid).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(err => {
        this.$notify({
          title: 'Error',
          message: err,
          type: 'error',
          duration: 2000
        })
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
