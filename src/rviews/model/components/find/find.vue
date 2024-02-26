<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form inline size="mini">
        <el-form-item>
          <el-select v-model="filter.content" placeholder="请选择" @change="handleFilter">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-if="shouldShow('inactive')">
          <el-checkbox v-model="filter.inactive" @change="handleFilter">冻结</el-checkbox>
        </el-form-item> -->
        <el-form-item v-if="shouldShow('status')">
          <el-select v-model="filter.status" placeholder="请选择" @change="handleFilter">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="filter.wildcard" @change="handleFilter">正则</el-checkbox>
        </el-form-item>
        <el-form-item v-if="shouldShow('name')">
          <el-input
            ref="filter_name"
            v-model="filter.name"
            placeholder="名称"
            style="width: 196px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item v-if="shouldShow('text')">
          <el-input
            v-model="filter.desc"
            placeholder="文本"
            style="width: 196px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item v-if="shouldShow('alg')">
          <el-input
            v-model="filter.alg"
            placeholder="算法"
            style="width: 96px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item v-if="shouldShow('page') && filter.content !== 'point'">
          <el-input
            v-model="filter.page"
            placeholder="页面"
            style="width: 96px;"
            @keyup.enter.native="handleFilter"
            @focus="onFocus"
          />
        </el-form-item>
        <el-form-item v-if="shouldShow('desc')">
          <el-input
            v-model="filter.desc"
            placeholder="描述"
            style="width: 96px;"
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
    <el-table
      v-loading="listLoading"
      :data="result.items"
      :cell-style="getCellStyle"
      :header-cell-style="getCellStyle"
      border
      fit
      height="512"
      highlight-current-row
      style="width: 100%;"
      @row-dblclick="rowDblClick"
    >
      <el-table-column v-if="shouldShow('id')" label="ID" prop="id" width="50">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('type')" label="类型" prop="type" width="60">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.type === 'def' ? '定义' : '*引用' }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('name')" label="名称" prop="name" width="180">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('alg')" label="算法" prop="alg" width="80">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.alg }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('page')" label="页面" prop="page" width="120">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.page }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('blockName')" label="模块名" prop="blockName" width="120">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.blockName }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('blockID')" label="模块号" prop="blockID" width="60">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.blockID }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('index')" label="索引" prop="index" width="48">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.index }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('x')" label="X" prop="x" width="30">
        <template slot-scope="{row}">
          <span class="nowrap">{{ Math.round(row.x) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('y')" label="Y" prop="y" width="30">
        <template slot-scope="{row}">
          <span class="nowrap">{{ Math.round(row.y) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shouldShow('desc') || shouldShow('text')" label="描述" prop="desc">
        <template slot-scope="{row}">
          <span class="nowrap">{{ row.desc || row.text || "" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" class-name="small-padding">
        <template slot-scope="{row}">
          <button v-if="filter.content == 'block' || filter.content == 'point'" type="primary" size="mini" @click="openBlock(row)">
            打开
          </button>
          <button v-if="filter.content == 'block' || filter.content == 'point'" size="mini" type="primary" @click="locBlock(row)">
            定位
          </button>
          <button v-if="filter.content == 'page'" size="mini" type="primary" @click="openPage(row)">
            打开
          </button>
          <button v-if="filter.content == 'label'" size="mini" type="primary" @click="locLabel(row)">
            定位
          </button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { search } from '@/api/model'
import sb from '../sb'
import router from '@/router'

var filter = {
  wildcard: false,
  content: 'point',
  alg: '',
  name: '',
  desc: '',
  page: '',
  inactive: false,
  status: 0,
  pageIndex: 1,
  pageSize: 20
}

export default {
  name: 'Find',
  props: {
    stype: {
      type: String,
      default: ''
    },
    skey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listLoading: false,
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
        point: new Set(['type', 'name', 'page', 'blockName', 'blockID', 'index', 'desc']),
        block: new Set(['id', 'alg', 'name', 'desc', 'page', 'x', 'y', 'inactive', 'status']),
        label: new Set(['id', 'page', 'text', 'x', 'y']),
        page: new Set(['name', 'desc'])
      },
      result: {
        items: [],
        total: 0,
        pageSize: 20,
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
    if (this.stype === 'var') {
      this.filter.content = 'point'
      this.filter.name = this.skey
      this.handleFilter()
    }
    this.$nextTick(() => {
      if (this.$refs['filter_name']) {
        this.$refs['filter_name'].select()
      }
    })
    this.getPointList()
  },
  methods: {
    getPointList() {
      this.listLoading = true
      search(this.filter).then(result => {
        filter = this.filter
        result || {}
        this.result.items = result.items || []
        this.result.total = result.total || 0
        this.result.pageSize = result.pageSize || filter.pageSize
        this.result.pageIndex = result.pageIndex || filter.pageIndex
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.listLoading = false
      })
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
    openBlock(data) {
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
        'padding': '0px',
        'color': row.type === 'def' ? 'rgb(103, 194, 58)' : '#FFF',
        'background': 'rgb(85, 85, 85)'
      }
    },
    onFocus(event) {
      if (event && event.target && typeof event.target.select === 'function') {
        // 不用选中
        // event.target.select()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container >>> input {
    padding: 0;
    height: 20px;
    line-height: 12px;
    // background: #c0c0c0;
  }
  .app-container >>> .cell {
    padding: 0px;
  }
  .nowrap {
    white-space: nowrap;
  }
  ::v-deep .el-table__body-wrapper {
    background: #CCC;
  }
</style>
