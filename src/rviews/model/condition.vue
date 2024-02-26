<template>
  <div class="app-container">

    <el-table v-loading="listLoading" :data="conditions" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="Name">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input
              v-model="scope.row.name"
              class="edit-input"
              size="small"
              @keyup.enter.native="confirmEdit(scope.row)"
            />
          </template>
          <span
            v-else
            @dblclick="beginEdit(scope.row)"
          >{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Created">
        <template slot-scope="scope">
          <span>{{ scope.row.created | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Updated">
        <template slot-scope="scope">
          <span>{{ scope.row.updated | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="300">
        <template slot-scope="scope">
          <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">Ok</el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="beginEdit(scope.row)">Edit</el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="saveCondition(scope.row)">Save</el-button>
          <el-button type="primary" size="small" icon="el-icon-upload2" @click="loadCondition(scope.row)">Load</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
import * as capi from '@/api/condition'

export default {
  name: 'Condition',
  data() {
    return {
      conditions: [],
      listLoading: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      capi.list().then(response => {
        var array = []
        for (let i = 1; i <= 128; i++) {
          array.push({ id: i, edit: false })
        }
        this.conditions = array
        for (var id in response) {
          this.$set(this.conditions, id - 1, { ...response[id], edit: false })
        }
        this.listLoading = false
      })
    },
    beginEdit(row) {
      row.edit = true
      row.oldName = row.name
    },
    confirmEdit(row) {
      row.edit = false
      capi.setName(row.id, row.name).then(() => {
      }).catch(() => {
        row.name = row.oldName
      })
    },
    saveCondition(row) {
      capi.save(row.id).then(() => {
        this.getList()
        this.$msg.success('保存工况成功, id = ' + row.id)
      })
    },
    loadCondition(row) {
      capi.load(row.id).then(() => {
        this.$msg.success('加载工况成功, name =  ' + row.name)
      })
    }
  }
}
</script>
