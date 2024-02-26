<template>
  <div class="app-container">
    <el-form v-if="fault" label-width="100px" size="mini">
      <el-form-item label="故障编号">
        <el-input v-model="fault.id" :readonly="true"></el-input>
      </el-form-item>
      <el-form-item label="故障名称">
        <el-input v-model="fault.name"></el-input>
      </el-form-item>
      <el-form-item label="故障描述">
        <el-input v-model="fault.desc" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="变量设置">
        <el-table :data="fault.ops" border fit highlight-current-row>
          <el-table-column align="center" label="变量" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.var" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="描述" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.description" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="类型" width="160">
            <template slot-scope="scope">
              <el-select v-model="scope.row.dataType" placeholder="变量类型">
                <el-option label="模拟量" :value="0"></el-option>
                <el-option label="数字量" :value="1"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column align="center" label="当前值">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.value" :readonly="true" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="目标值">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.target" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="延时时间(ms)">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.start" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="渐变时间(ms)">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.gradient" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="保持时间(ms)">
            <template slot-scope="scope">
              <el-input v-model.number="scope.row.duration" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="" width="52">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="deleteFaultVar(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;" @click="addFaultVar" />
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveCurrent">保存</el-button>
        <el-button type="primary" style="float: right;" @click="stopFault">消除故障</el-button>
        <el-button type="danger" style="float: right;" @click="startFault">投入故障</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as api from '@/api/fault'
import * as rdbapi from '@/api/rtd'

export default {
  name: 'FaultEdit',
  data() {
    return {
      listLoading: true,
      fault: {}
    }
  },
  mounted() {
    const id = this.$route.params && this.$route.params.id
    this.id = id
    if (this.id > 0) {
      this.fetchData()
    }
    this.tempRoute = Object.assign({}, this.$route)
    this.$on('global:rtdb', () => {
      for (let op of this.fault.ops) {
        op.value = rdbapi.getValue(op.var) || 0
      }
    })
  },
  methods: {
    fetchData() {
      api.list().then(response => {
        let fault = response.items[this.id] || {}
        fault.ops = fault.ops || []
        for (let op of fault.ops) {
          op.target = op.target || 0
          op.value = rdbapi.getValue(op.var) || 0
          op.start = op.start || 0
          op.gradient = op.gradient || 0
          op.duration = op.duration || 0
          op.dataType = op.dataType || 0
        }
        this.fault = fault
        this.setTagsViewTitle()
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    setTagsViewTitle() {
      if (this.fault) {
        const route = Object.assign({}, this.tempRoute, { title: `故障 - ${this.fault.id} - ${this.fault.name}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
    },
    addFaultVar() {
      this.fault.ops = this.fault.ops || []
      this.fault.ops.push({
        var: 'var' + (this.fault.ops.length + 1),
        target: 1,
        start: 0,
        gradient: 0,
        duration: 0,
        dataType: 0
      })
    },
    deleteFaultVar(item) {
      this.$confirm('确定删除变量 ' + item.var + ' ?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let i = 0; i < this.fault.ops.length; i++) {
          if (this.fault.ops[i] === item) {
            this.fault.ops.splice(i, 1)
            break
          }
        }
      }).catch(() => {})
    },
    saveCurrent() {
      console.log(this.fault)
      api.listUpdate(this.fault).then(() => {
        this.fetchData()
        return api.save()
      }).then(() => {
        this.$msg.success('保存成功')
      }).catch(err => {
        this.$msg.error(err, '保存失败')
      })
    },
    startFault() {
      this.$confirm('确定投入故障 ' + this.fault.name + ' ?', '提示', {
        confirmButtonText: '投入',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.start(this.fault.id)
      }).then(() => {
        this.$msg.success('投入故障: ' + this.fault.name)
      })
    },
    stopFault() {
      api.stop(this.fault.id).then(() => {
        this.$msg.success('消除故障: ' + this.fault.name)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    padding: 8px;
    margin: 0;
  }
</style>
