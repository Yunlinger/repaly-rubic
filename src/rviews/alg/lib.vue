<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <el-table :data="libs" border fit highlight-current-row style="width: 100%;">
          <el-table-column label="动态链接库">
            <template slot-scope="scope">
              <span>{{ scope.row }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="动作" width="100">
            <template slot-scope="scope">
              <el-button type="primary" size="small" icon="el-icon-delete" @click="deleteLib(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 20px">
          <el-upload
            :show-file-list="false"
            :before-upload="uploadLib"
            :multiple="true"
            :limit="512"
            accept=".dll"
            action=""
          >
            <el-button type="primary">上传动态链接库</el-button>
          </el-upload>
        </div>
      </el-col>
      <el-col :span="12">
        <el-table :data="dependencies" border fit highlight-current-row style="width: 100%; margin-left: 20px;">
          <el-table-column label="依赖库">
            <template slot-scope="scope">
              <span>{{ scope.row }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="动作" width="100">
            <template slot-scope="scope">
              <el-button type="primary" size="small" icon="el-icon-delete" @click="deleteDependence(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 20px; margin-left: 20px;">
          <el-upload
            :show-file-list="false"
            :before-upload="uploadDependence"
            :multiple="true"
            :limit="512"
            accept=".dll"
            action=""
          >
            <el-button type="primary">上传依赖库</el-button>
          </el-upload>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as api from '@/api/res'
import * as dapi from '@/api/driver'

export default {
  name: 'Lib',
  data() {
    return {
      libs: [],
      dependencies: []
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      api.open('../alg/libs.json').then(response => {
        this.libs = response.libs || []
        this.dependencies = response.dependencies || []
      }).catch(() => {
      })
    },
    saveData() {
      let json = {}
      json.libs = this.libs
      json.dependencies = this.dependencies
      var fd = new FormData()
      var file = new File([JSON.stringify(json)], 'libs.json', {
        type: 'text/plain'
      })
      fd.append('file', file)
      api.write('../alg/libs.json', fd).then(res => {
        this.$msg.success('保存成功')
        return dapi.restart()
      }).then(() => {
        this.$msg.success('驱动重启成功')
      }).catch(err => {
        this.$msg.error(`失败: ${err}`)
      })
    },
    async uploadLib(file) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        let res = await api.write('../lib/' + file.name, fd)
        this.$msg.success('动态链接库上传成功, ' + res.path)
        let s = new Set(this.libs || [])
        s.add(file.name)
        this.libs = Array.from(s)
        this.saveData()
      } catch (e) {
        this.$msg.error('动态链接库上传失败, ' + file.name)
      }
      return Promise.reject(null)
    },
    deleteLib(name) {
      this.$confirm('删除动态链接库 ' + name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.libs.indexOf(name)
        if (index > -1) {
          this.libs.splice(index, 1)
          this.saveData()
        }
      }).catch(() => {
      })
    },
    async uploadDependence(file) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        let res = await api.write('../lib/' + file.name, fd)
        this.$msg.success('依赖库上传成功, ' + res.path)
        let s = new Set(this.dependencies || [])
        s.add(file.name)
        this.dependencies = Array.from(s)
        this.saveData()
      } catch (e) {
        this.$msg.error('依赖库上传失败, ' + file.name)
      }
      return Promise.reject(null)
    },
    deleteDependence(name) {
      this.$confirm('删除依赖库 ' + name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.dependencies.indexOf(name)
        if (index > -1) {
          this.dependencies.splice(index, 1)
          this.saveData()
        }
      }).catch(() => {
      })
    }
  }
}
</script>
