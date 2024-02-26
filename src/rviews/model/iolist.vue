<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form inline size="mini">
        <el-form-item>
          <el-checkbox v-model="filter.wildcard" @change="handleFilter">正则</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-input
            ref="filter_name"
            v-model="filter.name"
            placeholder="变量名称"
            style="width: 126px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filter.page"
            placeholder="页面"
            style="width: 126px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filter.alg"
            placeholder="算法"
            style="width: 126px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filter.desc"
            placeholder="描述"
            style="width: 126px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter"></el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-pagination
      :current-page="filter.pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="filter.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="result.total"
      @size-change="onPointsPageSizeChange"
      @current-change="onPointsPageCurrentChange"
    >
    </el-pagination>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        :data="result.items"
        :cell-style="getCellStyle"
        :header-cell-style="getCellStyle"
        :row-style="getSelectedStyle"
        border
        stripe
        fit
        height="100%"
        highlight-current-row
        style="width: 100%; height: 100%; overflow: auto;"
        @row-click="rowClick"
      >
        <!-- <el-table-column label="ID" prop="id" width="50">
          <template slot-scope="{row}">
            <span class="nowrap">{{ row.id }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="描述" prop="desc">
          <template slot-scope="{row}">
            <input
              v-model="row.desc"
              class="nowrap"
              style="width: 100%; border: none;"
              :style="getSelectedStyle({ row })"
              @change="$event => descChange($event, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="输入" prop="in1" width="200">
          <template slot-scope="{row}">
            <input
              v-model="row.in1"
              class="nowrap"
              style="width: 100%; border: none;"
              :style="getSelectedStyle({ row })"
              @change="$event => input1Change($event, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="输出" prop="out1" width="200">
          <template slot-scope="{row}">
            <input
              v-model="row.out1"
              class="nowrap"
              style="width: 100%; border: none;"
              :style="getSelectedStyle({ row })"
              @change="$event => output1Change($event, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="值" prop="value1" width="70">
          <template slot-scope="{row}">
            <span>{{ row.value1 || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="系数1" prop="coef1" width="60">
          <template slot-scope="{row}">
            <input
              v-model="row.coef1"
              class="nowrap"
              style="width: 100%; border: none;"
              :style="getSelectedStyle({ row })"
              @change="$event => coefChange($event, row, 0)"
            />
          </template>
        </el-table-column>
        <el-table-column label="系数2" prop="coef2" width="60">
          <template slot-scope="{row}">
            <input
              v-model="row.coef2"
              class="nowrap"
              style="width: 100%; border: none;"
              :style="getSelectedStyle({ row })"
              @change="$event => coefChange($event, row, 1)"
            />
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="name" width="100">
          <template slot-scope="{row}">
            <span class="nowrap">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="算法" prop="alg" width="80">
          <template slot-scope="{row}">
            <span class="nowrap">{{ row.alg }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" class-name="small-padding">
          <template slot-scope="{row, $index}">
            <button type="primary" size="mini" @click="showBlock(row)">
              打开
            </button>
            <button type="primary" size="mini" @click="copyBlock(row, $index)">
              复制
            </button>
            <button type="primary" size="mini" @click="deleteBlock(row, $index)">
              删除
            </button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/model'
import * as rapi from '@/api/rtd'
import sb from './components/sb'
import router from '@/router'

var filter = {
  wildcard: true,
  content: 'block',
  alg: '',
  name: '',
  desc: '',
  page: '',
  inactive: false,
  status: 0,
  auto: true,
  pageIndex: 1,
  pageSize: 50
}

export default {
  name: 'IOList',
  data() {
    return {
      listLoading: false,
      selectedID: 0,
      options: [
        { value: 'point', label: '变量' },
        { value: 'block', label: '模块' },
        { value: 'label', label: '文本' },
        { value: 'page', label: '页面' }
      ],
      statusOptions: [
        { value: 0, label: '所有模块' },
        { value: 1, label: '冻结模块' },
        { value: 2, label: '没有算法' },
        { value: 3, label: '执行出错' }
      ],
      filter: { ...filter },
      attrs: {
        block: new Set(['id', 'alg', 'name', 'desc', 'page', 'x', 'y', 'inactive', 'status'])
      },
      result: {
        items: [],
        total: 0,
        pageSize: 50,
        pageIndex: 1
      }
    }
  },
  watch: {
    filter: {
      deep: true,
      handler: function(newFilter) {
        // this.handleFilter()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs['filter_name']) {
        this.$refs['filter_name'].select()
      }
    })
    this.getPointList()
    this.startUpdateValue()
  },
  unmounted() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    startUpdateValue() {
      if (this.timer) {
        return
      }

      this.timer = setInterval(() => {
        if (this.result && this.result.items) {
          this.result.items.map(item => {
            var v = Math.round((rapi.getValue(item.out1) || 0) * Math.pow(10, 3)) / Math.pow(10, 3)
            this.$set(item, 'value1', v)
          })
        }
      }, 500)
    },
    getPointList() {
      this.listLoading = true
      if (this.filter.name !== '') {
        // 查找点
        this.filter.content = 'point'
        api.search(this.filter).then(result => {
          result || {}
          result.items = (result.items || []).map(item => {
            return {
              blockID: item.blockID,
              page: item.page
            }
          })
          this.result.items = result.items
          this.result.total = result.total || 0
          this.result.pageSize = result.pageSize || filter.pageSize
          this.result.pageIndex = result.pageIndex || filter.pageIndex
          result.items.forEach((item) => {
            this.updateRowWithPoint(item)
          })
        }).catch(err => {
          this.$msg.error(err)
        }).finally(() => {
          this.listLoading = false
        })
      } else {
        // 查找模块
        this.filter.content = 'block'
        api.search(this.filter).then(result => {
          result || {}
          result.items = result.items || []
          this.result.items = result.items
          this.result.total = result.total || 0
          this.result.pageSize = result.pageSize || filter.pageSize
          this.result.pageIndex = result.pageIndex || filter.pageIndex
          result.items.forEach((item) => {
            this.updateRow(item)
          })
        }).catch(err => {
          this.$msg.error(err)
        }).finally(() => {
          this.listLoading = false
        })
      }
    },
    updateRow(item) {
      api.blockGet(item.id).then(block => {
        block = block || {}

        this.$set(item, 'id', block.id)
        this.$set(item, 'name', block.name)
        this.$set(item, 'desc', block.desc)
        this.$set(item, 'alg', block.alg)

        if (block.in && block.in[0]) {
          this.$set(item, 'in1', block.in[0].name || '')
        }
        if (block.out && block.out[0]) {
          this.$set(item, 'out1', block.out[0].name || '')
        }
        if (block.coef && block.coef[0]) {
          this.$set(item, 'coef1', block.coef[0].value || 0)
        }
        if (block.coef && block.coef[1]) {
          this.$set(item, 'coef2', block.coef[1].value || 0)
        }
      }).catch(() => {})
    },
    updateRowWithPoint(item) {
      api.blockGet(item.blockID).then(block => {
        block = block || {}
        this.$set(item, 'id', block.id)
        this.$set(item, 'name', block.name)
        this.$set(item, 'desc', block.desc)
        this.$set(item, 'alg', block.alg)

        if (block.in && block.in[0]) {
          this.$set(item, 'in1', block.in[0].name || '')
        }
        if (block.out && block.out[0]) {
          this.$set(item, 'out1', block.out[0].name || '')
        }
        if (block.coef && block.coef[0]) {
          this.$set(item, 'coef1', block.coef[0].value || 0)
        }
        if (block.coef && block.coef[1]) {
          this.$set(item, 'coef2', block.coef[1].value || 0)
        }
      }).catch(() => {})
    },
    compare(a, b) {
      if (this.filter.content === 'block') {
        if (a.page !== b.page) {
          return ((a.page === b.page) ? 0 : ((a.page > b.page) ? 1 : -1))
        } else {
          return ((a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1))
        }
      } else if (this.filter.content === 'label') {
        if (a.page !== b.page) {
          return ((a.page === b.page) ? 0 : ((a.page > b.page) ? 1 : -1))
        } else {
          return ((a.text === b.text) ? 0 : ((a.text > b.text) ? 1 : -1))
        }
      } else if (this.filter.content === 'page') {
        if (a.desc !== b.desc) {
          return ((a.desc === b.desc) ? 0 : ((a.desc > b.desc) ? 1 : -1))
        } else {
          return ((a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1))
        }
      }
      return 0
    },
    onPointsPageSizeChange(pageSize) {
      this.filter.pageSize = pageSize
      this.getPointList()
    },
    onPointsPageCurrentChange(currentPage) {
      this.filter.pageIndex = currentPage
      this.getPointList()
    },
    handleFilter() {
      this.filter.pageIndex = 1
      this.getPointList()
    },
    shouldShow(filterName) {
      let attrs = this.attrs[this.filter.content]
      if (attrs) {
        return attrs.has(filterName)
      }
      return false
    },
    showBlock(data) {
      if (this.filter.content === 'block') {
        sb({
          bid: data.id
        })
      } else {
        sb({
          bid: data.blockID,
          selected: {
            port: data.type === 'def' ? 'out' : 'in',
            index: data.index
          }
        })
      }
    },
    copyBlock(item, index) {
      api.blockCopy(item.page, [item.id], 20, 20, '', '', []).then(res => {
        let copyResult = res || {}
        let blockMap = copyResult.blocks
        for (var key in blockMap) {
          const block = blockMap[key]
          if (block) {
            let _item = {
              id: block.id,
              page: item.page
            }
            this.result.items.splice(index + 1, 0, _item)
            this.updateRow(_item)
          }
        }
      }).catch(() => {})
    },
    deleteBlock(item, index) {
      this.$confirm(`确定删除 ${item.desc || ''}?`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.blockDel(item.id)
      }).then(() => {
        this.result.items.splice(index, 1)
      }).catch(() => {
      })
    },
    locBlock(data) {
      if (this.filter.content === 'block') {
        router.push({
          path: '/engineer/model/edit/' + data.page,
          query: { selblk: data.id }
        })
        this.$emit(`global:selblk`, { id: data.id })
      } else {
        router.push({
          path: '/engineer/model/edit/' + data.page,
          query: { selblk: data.blockID }
        })
        this.$emit(`global:selblk`, { id: data.blockID })
      }
    },
    openPage(data) {
      router.push({
        path: '/engineer/model/edit/' + data.name
      })
    },
    locLabel(data) {
      router.push({
        path: '/engineer/model/edit/' + data.page,
        query: { sellabel: data.id }
      })
      this.$emit(`global:sellabel`, { id: data.id })
    },
    rowDblClick(row, column, event) {
      switch (this.filter.content) {
        case 'block':
        case 'point':
          this.locBlock(row)
          break
        case 'label':
          this.locLabel(row)
          break
        case 'page':
          this.openPage(row)
          break
        default:
          break
      }
    },
    getCellStyle({ row, column, rowIndex, columnIndex }) {
      return {
        'padding': '0px'
        // 'color': row.type === 'def' ? 'green' : ''
      }
    },
    rowClick(row, column, event) {
      this.selectedID = row.id
    },
    getSelectedStyle({ row, rowIndex }) {
      if (row.id === this.selectedID) {
        return {
          'color': 'blue',
          'font-weight': 'bold'
        }
      } else {
        return {}
      }
    },
    onFocus(event) {
      if (event && event.target && typeof event.target.select === 'function') {
        event.target.select()
      }
    },
    input1Change(e, block) {
      api.setInVar(block.id, 0, e.target.value).then(() => {
        this.$msg('设置输入变量成功')
      }).catch(() => {
        this.updateRow(block)
      })
    },
    output1Change(e, block) {
      api.setOutVar(block.id, 0, e.target.value).then(() => {
        this.$msg('设置输出变量成功')
      }).catch(() => {
        this.updateRow(block)
      })
    },
    descChange(e, block) {
      api.setDesc(block.id, e.target.value).then(() => {
        this.$msg('设置描述成功')
      }).catch(() => {
        this.updateRow(block)
      })
    },
    coefChange(e, block, idx) {
      idx = idx || 0
      let value = parseFloat(e.target.value || '0')
      api.setCoef(block.id, idx, value).then(() => {
        this.$msg('设置系数成功')
      }).catch(() => {
      }).finally(() => {
        this.updateRow(block)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    height: calc(100vh - 82px);
  }
  .app-container >>> input {
    padding: 0;
    height: 20px;
    line-height: 12px;
  }
  .app-container >>> .cell {
    padding: 0px;
  }
  .table-container {
    height: calc(100% - 80px);
  }
  .nowrap {
    white-space: nowrap;
  }
</style>
