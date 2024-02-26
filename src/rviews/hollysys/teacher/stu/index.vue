<template>
  <div>
    <div v-if="currentPages === 'student'" class="stu">
      <div style="margin:-5px 0 0 0;">学员管理</div>
      <div class="but">
        <el-button type="primary" @click="showAddStudentDialog"> + 添加学员 </el-button>
        <el-button @click="showGroupPage">分组管理</el-button>
        <el-button @click="openExportDialog">导出学员</el-button>
        <el-button @click="openImportDialog">导入学员</el-button>
        <el-button>删除</el-button>
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
          :data="userList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="name" label="姓名" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="id" label="学号" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="group" label="组名" show-overflow-tooltip>
          </el-table-column>
          <el-table-column label="创建时间" show-overflow-tooltip>
            <template slot-scope="scope">{{ scope.row.date }}</template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="editStu(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click.native.prevent="deleteRow(scope.$index, tableData)">
                禁用
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="page">
          <el-pagination
            :current-page="currentPage"
            :page-sizes="[10, 20, 40, 50]"
            :page-size="100"
            layout="total,  prev, pager, next, sizes"
            :total="userTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
      </div>
      <el-dialog :visible.sync="dialogVisible" :width="'30%'">
        <p style="font-size: 18px;">添加学员</p>
        <el-form :model="newStudentForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="newStudentForm.name" placeholder="请输入学员用户名"></el-input>
          </el-form-item>
          <el-form-item label="学员姓名">
            <el-input v-model="newStudentForm.cname" placeholder="请输入学员姓名"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="newStudentForm.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="newStudentForm.passwood" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="newStudentForm.mobile" placeholder="请输入手机号"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="newStudentForm.introduction" placeholder="请输入备注"></el-input>
          </el-form-item>

          <!-- 其他表单项... -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addStudent">添加</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="exportDialogVisible" width="30%">
        <p style="font-size: 18px;">导出学员</p>
        <el-form :model="exportFormData" label-width="80px">
          <el-form-item label="存储为">
            <el-input v-model="exportFormData.fileName" placeholder="请输入文件名"></el-input>
          </el-form-item>
          <el-form-item label="位置">
            <el-input v-model="exportFormData.exportPath" placeholder="请选择导出路径" disabled></el-input>
            <el-button>选择路径</el-button>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="exportStudents">导出</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="importDialogVisible" width="30%">
        <p style="font-size: 18px;">导入学员</p>
        <el-form :model="importFormData" label-width="150px">
          <el-form-item label="请选择要导入的文件" style="color: #888888">
            {{ importFormData.filePath || '未选择文件' }}
          </el-form-item>
          <el-form-item>
            <input type="file" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importStudents">导入</el-button>
        </div>
      </el-dialog>

    </div>
    <div v-if="currentPages === 'group'" class="stu">
      <div style="margin:-5px 0 0 0;">
        <span style="font-size: 14px;color: rgb(139, 137, 137);cursor: pointer;" @click="showStudentPage">学员管理/</span>
        <span>分组管理</span>
      </div>
      <div class="but">
        <el-button type="primary" @click="showAddGroupDialog"> + 添加分组 </el-button>
        <el-button>删除</el-button>
        <div class="sousuo">
          <el-select
            v-model="value"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入组名"
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
          <el-table-column prop="group" label="组名" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="nmb" label="学员数量" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="model" label="分组模式" show-overflow-tooltip>
          </el-table-column>
          <el-table-column label="创建时间" show-overflow-tooltip>
            <template slot-scope="scope">{{ scope.row.date }}</template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button type="text" size="small">编辑</el-button>
              <el-button type="text" size="small" @click.native.prevent="deleteRow(scope.$index, tableData)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="page">
          <el-pagination
            :current-page="currentPage"
            :page-sizes="[10, 20, 40, 50]"
            :page-size="100"
            layout="total,  prev, pager, next, sizes"
            :total="userTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
      </div>
      <el-dialog :visible.sync="addGroupDialogVisible" :width="'44%'">
        <p style="font-size: 18px;">添加分组</p>
        <el-form :model="newGroupForm" label-width="80px">
          <el-form-item label="分组名称">
            <el-input v-model="newGroupForm.name" placeholder="请输入分组名称"></el-input>
          </el-form-item>
          <el-form-item label="分组描述">
            <el-input v-model="newGroupForm.description" type="textarea" placeholder="请输入分组描述"></el-input>
          </el-form-item>
          <el-form-item label="分组模式">
            <el-radio-group v-model="newGroupForm.mode">
              <el-radio label="independent">独立模式</el-radio>
              <el-radio label="collaborative">协同模式</el-radio>
            </el-radio-group>
          </el-form-item>
          <div style="width: 100%;padding-left: 8%;height: 35vh;">
            <el-transfer
              v-model="value"
              filterable
              :filter-method="filterMethod"
              filter-placeholder="请输入城市拼音"
              :data="data"
              :titles="['学员列表', '已选学员']"
            >
            </el-transfer>
          </div>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addGupCl">取消</el-button>
          <el-button type="primary" @click="addNewGroup">添加</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { read, create } from '@/api/user'
export default {
  data() {
    const generateData = _ => {
      const data = []
      const cities = ['上海', '北京', '广州', '深圳', '南京', '西安', '成都']
      const pinyin = ['shanghai', 'beijing', 'guangzhou', 'shenzhen', 'nanjing', 'xian', 'chengdu']
      cities.forEach((city, index) => {
        data.push({
          label: city,
          key: index,
          pinyin: pinyin[index]
        })
      })
      return data
    }
    return {
      data: generateData(),
      userList: [],
      userTotal: 0,
      temp: {
        id: 0,
        name: '',
        cname: '',
        mobile: '',
        email: '123a@abc.com',
        avatar: '',
        introduction: '',
        password: '',
        status: 1,
        roles: ['student']
      },
      listQuery: {
        page: 1,
        pageSize: 10,
        name: '',
        cname: '',
        mobile: '',
        email: '',
        status: 1,
        sort: 'id ASC',
        role: 'student'
      },
      value: [],
      filterMethod(query, item) {
        return item.pinyin.indexOf(query) > -1
      },
      importDialogVisible: false,
      importFormData: {
        filePath: null
      },
      exportDialogVisible: false,
      exportFormData: {
        fileName: '',
        exportPath: ''
      },
      addGroupDialogVisible: false,
      newGroupForm: {
        name: '',
        description: '',
        mode: 'independent'
      },
      selectedStudents: [],
      options: [],
      currentPages: 'student',
      list: [],
      loading: false,
      dialogVisible: false,
      newStudentForm: {
        id: 0,
        name: '',
        cname: '',
        mobile: '',
        email: '123a@abc.com',
        avatar: '',
        introduction: '',
        password: '',
        status: 1,
        roles: ['student']
      },
      groups: ['乙酸xxx开车A组', '其他分组'],
      states: ['test1', 'test2'],
      multipleSelection: [],
      currentPage: 1
    }
  },
  mounted() {
    this.getUserList()
    this.list = this.states.map(item => {
      return { value: `value:${item}`, label: `label:${item}` }
    })
  },
  methods: {
    // 编辑学生信息
    editStu(val) {
      console.log(val)
      // update(tempData).then(() => {
      //   this.dialogFormVisible = false
      //   this.$notify({
      //     title: 'Success',
      //     message: this.$t('更新成功'),
      //     type: 'success',
      //     duration: 2000
      //   })
      //   this.userList()
      // })
    },
    // 获取学员列表
    getUserList() {
      read(this.listQuery).then(res => {
        this.userList = res.items
        this.userTotal = res.total
      })
      console.log(this.userList)
    },
    // 导出学生
    exportStudents() {
      console.log(123)
    },
    // 打开导入学生对话框
    openImportDialog() {
      this.importDialogVisible = true
    },
    // 导入学生
    importStudents() {
      this.importDialogVisible = false
    },
    // 打开导出学生对话框
    openExportDialog() {
      this.exportDialogVisible = true
    },
    // 添加左部分学生到右部分
    addSelectedStudent(studentName) {
      this.selectedStudents.push(studentName)
    },
    // 显示添加分组对话框
    showAddGroupDialog() {
      this.addGroupDialogVisible = true
    },
    // 点击添加分组按钮
    addNewGroup() {
      console.log(this.newGroupForm)
      this.addGroupDialogVisible = false
    },
    // 显示分组页面
    showGroupPage() {
      this.currentPages = 'group'
    },
    // 显示学员页面
    showStudentPage() {
      this.currentPages = 'student'
    },
    // 显示添加学员对话框
    showAddStudentDialog() {
      this.dialogVisible = true
    },
    // 点击添加学员按钮
    addStudent() {
      create(this.newStudentForm).then(() => {
        this.$notify({
          title: 'Success',
          message: this.$t('创建成功'),
          type: 'success',
          duration: 2000
        })
        this.getUserList()
      })
      this.dialogVisible = false
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
    },
    addGupCl() {
      this.selectedStudents = []
      this.addGroupDialogVisible = false
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
    // 点击更换页数数据
    handleCurrentChange(val) {
      this.listQuery.page = val
      console.log(this.listQuery)
      read(this.listQuery).then(res => {
        this.userList = res.items
        this.userTotal = res.total
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="scss">
.stu {
  width: 100%;
  height: 100%;
  padding: 30px;

  .but {
    margin: 25px 0px;
  }

  .sousuo {
    float: right;

    .el-input {
      width: 200px !important;
    }

    .el-input__inner {
      width: 200px !important;
    }

    .el-input--suffix .el-input__inner {
      width: 200px !important;
    }

    .el-input__icon {
      height: 100%;
    }
  }

  .block {
    background-color: #fff;
    position: relative;
    height: 570px;
    width: 100%;
  }

  .page {
    position: absolute;
    right: 0;
    margin-top: 20px;
  }
  /* 添加样式以调整布局和样式 */
.selected-students {
  display: flex;
  flex-wrap: wrap;
}

.selected-student {
  margin-right: 10px;
  margin-bottom: 5px;
}
.student-item {
  padding: 5px;
  cursor: pointer;
  margin-bottom: 2px;

}
}
</style>
