<template>
  <div class="app-container">
    <el-container>
      <el-aside width="300px">
        <el-button @click="newBulk">新建</el-button>
        <el-button @click="renameBulk">改名</el-button>
        <el-table
          :data="localBulks"
          :cell-style="getCellStyle"
          :header-cell-style="getCellStyle"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @row-click="rowClick"
          @row-dblclick="renameBulk"
        >
          <el-table-column align="center" label="序号" width="50">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column label="名称">
            <template slot-scope="scope">
              <template v-if="scope.row.edit">
                <el-input
                  v-model="scope.row.name"
                  class="edit-input"
                  size="small"
                  @keyup.enter.native="confirmEdit(scope.row)"
                />
              </template>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-aside>
      <el-main height="100%">
        <el-button @click="edit = !!!edit">编辑</el-button>
        <el-button @click="addItem">增加</el-button>
        <el-button @click="saveBulk">保存</el-button>
        <el-table
          :data="selbulk.items"
          border
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column align="center" width="40">
            <template slot-scope="scope">
              <a><em class="el-icon-delete" @click="delItem(scope.$index)" /></a>
            </template>
          </el-table-column>
          <el-table-column align="center" label="序号" width="50">
            <template slot-scope="scope">
              <span>{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column label="名称">
            <template slot-scope="scope">
              <template v-if="edit">
                <el-input
                  v-model="scope.row.name"
                  class="edit-input"
                  size="small"
                  @keyup.enter.native="confirmEdit(scope.row)"
                />
              </template>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="描述">
            <template slot-scope="scope">
              <template v-if="edit">
                <el-input
                  v-model="scope.row.desc"
                  class="edit-input"
                  size="small"
                  @keyup.enter.native="confirmEdit(scope.row)"
                />
              </template>
              <span v-else>{{ scope.row.desc }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位">
            <template slot-scope="scope">
              <template v-if="edit">
                <el-input
                  v-model="scope.row.unit"
                  class="edit-input"
                  size="small"
                  @keyup.enter.native="confirmEdit(scope.row)"
                />
              </template>
              <span v-else>{{ scope.row.unit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="缺省值">
            <template slot-scope="scope">
              <template v-if="edit">
                <el-input-number
                  v-model="scope.row.value"
                  class="edit-input"
                  size="small"
                  style="width:100%;"
                  @keyup.enter.native="confirmEdit(scope.row)"
                />
              </template>
              <span v-else>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import _ from 'lodash'

import * as api from '@/api/alg'

export default {
  name: 'Lib',
  data() {
    return {
      selbulk: {},
      edit: false
    }
  },
  computed: {
    ...mapGetters([
      'bulks'
    ]),
    localBulks() {
      let ret = []
      for (let id in this.bulks) {
        let b = _.cloneDeep(this.bulks[id])
        b.id = parseInt(id)
        b.edit = false
        ret.push(b)
      }
      return ret
    }
  },
  methods: {
    getCellStyle({ row, column, rowIndex, columnIndex }) {
      return 'padding: 0px;'
    },
    rowClick(row, column, event) {
      this.selbulk = row
      api.readBulk(row.id).then(res => {
        // console.log(res)
      })
    },
    confirmEdit(row) {
      row.edit = false
    },
    addItem() {
      if (this.selbulk) {
        this.selbulk.items = this.selbulk.items || []
        this.selbulk.items.push({
          name: 'CH' + (this.selbulk.items.length + 1),
          desc: '',
          unit: '',
          value: 0
        })
      }
    },
    delItem(idx) {
      if (this.selbulk) {
        this.selbulk.items = this.selbulk.items || []
        let len = this.selbulk.items.length
        if (len > 0) {
          this.selbulk.items.splice(idx, 1)
        }
      }
    },
    saveBulk() {
      if (this.selbulk && this.selbulk.items) {
        api.updateBulk(this.selbulk).then(() => {
          this.$msg('保存成功')
          this.$store.dispatch('AlgGetAll')
        })
      }
    },
    renameBulk() {
      if (this.selbulk) {
        let oldName = this.selbulk.name
        let selbulk = this.selbulk
        this.$prompt('请输入名称', '提示', {
          inputValue: this.selbulk.name,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          this.selbulk.name = value
          return api.updateBulk(this.selbulk)
        }).then(() => {
          this.$msg('更改成功')
          this.$store.dispatch('AlgGetAll')
        }).catch(() => {
          selbulk.name = oldName
        })
      }
    },
    newBulk() {
      this.$prompt('请输入名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let bb = {
          name: value,
          desc: value,
          items: [
            { value: 1.1, name: 'ch1', unit: 'unit1', desc: 'desc1' },
            { value: 2.2, name: 'ch2', unit: 'unit2', desc: 'desc2' }
          ]
        }
        api.createBulk(bb).then(() => {
          this.$store.dispatch('AlgGetAll')
        })
      })
    }
  }
}
</script>

<style scoped>
  .el-aside {
    background: white;
  }
</style>
