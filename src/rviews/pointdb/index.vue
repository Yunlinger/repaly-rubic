<template>
  <div class="app-container">
    <el-container class="container">
      <div style="background-color: rgb(238, 241, 246); height: 100%; width: 260px; overflow: auto;">
        <tree
          :setting="setting"
          :nodes="nodes"
          @onClick="onClick"
          @onRightClick="onRightClick"
          @onCreated="onCreated"
        />
      </div>
      <el-main>
        <div class="filter-container">
          <el-select v-model="pointsFilter.type" placeholder="变量类型" class="filter-item" @change="getPointList">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-input v-model="pointsFilter.name" clearable placeholder="点名" style="width: 200px;" class="filter-item" @input="handleFilter" />
          <el-input v-model="pointsFilter.desc" clearable placeholder="点描述" style="width: 200px;" class="filter-item" @input="handleFilter" />
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            查找
          </el-button>
        </div>
        <div class="table-container">
          <!-- 模拟量显示 -->
          <el-table
            v-if="pointsFilter.type === 0"
            v-loading="dbLoading"
            :data="points"
            border
            fit
            stripe
            highlight-current-row
            style="width: 100%;"
            height="100%"
          >
            <el-table-column label="点名" prop="name" width="120">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" prop="dataType" width="60">
              <template slot-scope="{row}">
                <span>{{ ['模拟量', '开关量'][((row.dataType || 0) % 2)] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" prop="desc" min-width="200">
              <template slot-scope="{row}">
                <el-input
                  v-if="row.edit"
                  v-model="row.desc"
                  placeholder="请输入内容"
                  clearable
                >
                </el-input>
                <span v-else>{{ row.desc || "" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单位" prop="unit" width="80">
              <template slot-scope="{row}">
                <el-input
                  v-if="row.edit"
                  v-model="row.unit"
                  placeholder="请输入内容"
                  clearable
                >
                </el-input>
                <span v-else>{{ row.unit || "" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="上限" prop="high" width="110">
              <template slot-scope="{row}">
                <el-input
                  v-if="row.edit"
                  v-model="row.high"
                  placeholder="请输入内容"
                  clearable
                >
                </el-input>
                <span v-else>{{ row.high || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="下限" prop="low" width="80">
              <template slot-scope="{row}">
                <el-input
                  v-if="row.edit"
                  v-model="row.low"
                  placeholder="请输入内容"
                  clearable
                >
                </el-input>
                <span v-else>{{ row.low || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="高" width="50">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmH ? 'red':'#606266' }">{{ row.limitH || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="高高" width="50">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmHH ? 'red':'#606266' }">{{ row.limitHH || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="高3" width="50">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmHHH ? 'red':'#606266' }">{{ row.limitHHH || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="低" width="50">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmL ? 'red':'#606266' }">{{ row.limitL || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="低低" width="50">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmLL ? 'red':'#606266' }">{{ row.limitLL || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="低3" width="50">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmLLL ? 'red':'#606266' }">{{ row.limitLLL || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="高报" width="100">
              <template slot-scope="{row}">
                <el-select v-if="row.edit" v-model="row.alarmH" placeholder="请选择">
                  <el-option label="0" :value="false"></el-option>
                  <el-option label="1" :value="true"></el-option>
                </el-select>
                <span v-else :style="{ color: row.alarmH ? 'red':'#606266' }">{{ row.alarmH ? 1 : 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="低报" width="100">
              <template slot-scope="{row}">
                <el-select v-if="row.edit" v-model="row.alarmL" placeholder="请选择">
                  <el-option label="0" :value="false"></el-option>
                  <el-option label="1" :value="true"></el-option>
                </el-select>
                <span v-else :style="{ color: row.alarmL ? 'red':'#606266' }">{{ row.alarmL ? 1 : 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button v-if="scope.row.edit" class="filter-item" type="success" icon="el-icon-check" @click="submitPoint(scope.row)">
                </el-button>
                <el-button v-if="scope.row.edit" class="filter-item" type="primary" icon="el-icon-close" @click="closePoint(scope.$index)">
                </el-button>
                <el-button v-else class="filter-item" type="primary" icon="el-icon-edit" @click="editPoint(scope.row)">
                </el-button>
              </template>
            </el-table-column>

            <!-- <el-table-column label="操作" align="center" width="100" class-name="small-padding">
              <template slot-scope="{row}">
                <el-button-group size="mini">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="modifyPoint(row)"></el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="deletePoint(row)"></el-button>
                </el-button-group>
              </template>
            </el-table-column> -->
          </el-table>
          <!-- 开关量显示 -->
          <el-table
            v-if="pointsFilter.type === 1"
            v-loading="dbLoading"
            :data="points"
            border
            fit
            stripe
            highlight-current-row
            style="width: 100%;"
            height="100%"
          >
            <el-table-column label="点名" prop="name" width="120">
              <template slot-scope="{row}">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" prop="dataType" width="60">
              <template slot-scope="{row}">
                <span>{{ ['模拟量', '开关量'][((row.dataType || 0) % 2)] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" prop="desc" min-width="200">
              <template slot-scope="{row}">
                <el-input v-if="row.edit" v-model="row.desc" placeholder="请输入内容" clearable></el-input>
                <span v-else>{{ row.desc || "" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="ON报警" width="80">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmOn ? 'red':'#606266' }">{{ row.alarmOn || false }}</span>
              </template>
            </el-table-column>
            <el-table-column label="OFF报警" width="80">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmOff ? 'red':'#606266' }">{{ row.alarmOff || false }}</span>
              </template>
            </el-table-column>
            <el-table-column label="ON级别" width="80">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmOn ? 'red':'#606266' }">{{ row.levelOn || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="OFF级别" width="80">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmOff ? 'red':'#606266' }">{{ row.levelOff || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="ON描述" width="80">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmOn ? 'red':'#606266' }">{{ row.descOn || '' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="OFF描述" width="80">
              <template slot-scope="{row}">
                <span :style="{ color: row.alarmOff ? 'red':'#606266' }">{{ row.descOff || '' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button v-if="scope.row.edit" class="filter-item" type="success" icon="el-icon-check" @click="submitPoint(scope.row)">
                </el-button>
                <el-button v-if="scope.row.edit" class="filter-item" type="primary" icon="el-icon-close" @click="closePoint(scope.$index)">
                </el-button>
                <el-button v-else class="filter-item" type="primary" icon="el-icon-edit" @click="editPoint(scope.row)">
                </el-button>
              </template>
            </el-table-column>
            <!-- <el-table-column label="操作" align="center" width="100" class-name="small-padding">
              <template slot-scope="{row}">
                <el-button-group size="mini">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="modifyPoint(row)"></el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="deletePoint(row)"></el-button>
                </el-button-group>
              </template>
            </el-table-column> -->
          </el-table>
        </div>
        <el-pagination
          :current-page="pointsFilter.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pointsFilter.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pointsLength"
          @size-change="onPointsPageSizeChange"
          @current-change="onPointsPageCurrentChange"
        >
        </el-pagination>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import tree from '@/components/ztree'
import * as api from '@/api/rtdb'

export default {
  name: 'PointDB',
  components: { tree },
  props: {
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      listLoading: false,
      dbLoading: false,
      treeObj: null,
      currentNode: null,
      nodes: [],
      expand: {}, // 记录节点展开信息
      typeOptions: [
        { value: 0, label: '模拟量' },
        { value: 1, label: '开关量' }
      ],
      pointsFilter: {
        sort: 1,
        type: 0,
        name: '',
        desc: '',
        page: 1,
        pageSize: 20
      },
      points: [],
      pointsLength: 0,
      setting: {
        data: {
          keep: {
            leaf: true,
            parent: true
          },
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'pid',
            rootPId: 0
          }
        },
        check: {
          enable: false
        },
        view: {
          nameIsHTML: false,
          selectedMulti: false
        },
        edit: {
          enable: false
        }
      },
      editobj: {}
    }
  },
  // watch: {
  //   pointsFilter: {
  //     deep: true,
  //     handler: function() {
  //       this.getPointList()
  //     }
  //   }
  // },
  mounted() {
    // 根据 editable 调整 tree 的属性
    this.setting.edit.enable = !!this.editable

    this.updateTree()
    this.getPointList()
    this.$on('global:project.open', () => {
      this.updateTree()
      this.getPointList()
    })
  },
  methods: {
    strcmp(a, b) {
      if (a.isParent !== b.isParent) {
        return (a.isParent > b.isParent ? -1 : 1)
      }
      return ((a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1))
    },
    updateTree() {
      if (this.listLoading) {
        return
      }
      this.listLoading = true
      this.nodes = []
      let nodes = []
      nodes.push({
        name: '变量库',
        id: -9527,
        pid: 0,
        isParent: true,
        open: true
      })
      api.tree().then(response => {
        for (const node of response.nodes) {
          nodes.push({
            ... node,
            name: '[' + node.id + '] ' + (node.name || ''),
            id: node.id,
            pid: node.parent || -9527,
            isParent: true,
            data: node,
            open: false
          })
          nodes.push({
            name: '模拟量',
            id: 'a_' + node.id,
            pid: node.id,
            data: node,
            isParent: false
          })
          nodes.push({
            name: '开关量',
            id: 'd_' + node.id,
            pid: node.id,
            data: node,
            isParent: false
          })
        }
        nodes.sort((a, b) => {
          return this.strcmp(a, b)
        })
        this.nodes = nodes
      }).catch(() => {
        this.nodes = []
      }).finally(() => {
        this.listLoading = false
      })
    },
    getPointList() {
      this.dbLoading = true
      api.list(this.pointsFilter).then(result => {
        result = result || {}
        result.items.map(item => { item.edit = false })
        this.points = result.items
        this.pointsLength = result.total || 0
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.dbLoading = false
      })
    },
    onPointsPageSizeChange(pageSize) {
      this.pointsFilter.pageSize = pageSize
      this.getPointList()
    },
    onPointsPageCurrentChange(currentPage) {
      this.pointsFilter.page = currentPage
      this.getPointList()
    },
    handleFilter() {
      this.pointsFilter.sort = 0
      if (this.pointsFilter.desc === '' && this.pointsFilter.name === '') {
        this.pointsFilter.sort = (this.currentNode && this.currentNode.data.id) || 1
      }
      this.pointsFilter.page = 1
      this.getPointList()
    },
    onCreated(treeObj) {
      this.treeObj = treeObj
    },
    onClick(e, id, node) {
      this.currentNode = node
      if (this.currentNode) {
        if (!this.currentNode.isParent) {
          if (this.currentNode.name === '模拟量') {
            this.pointsFilter.type = 0
          }
          if (this.currentNode.name === '开关量') {
            this.pointsFilter.type = 1
          }
          this.pointsFilter.sort = this.currentNode.data.id
          this.pointsFilter.page = 1
          this.getPointList()
        }
      }
    },
    onRightClick() {
      return
    },
    modifyPoint(point) {
      return
    },
    deletePoint(point) {
      return
    },
    editPoint(row) {
      this.editobj = JSON.parse(JSON.stringify(row))
      row.edit = true
    },
    closePoint(index) {
      this.$set(this.points, index, this.editobj)
      this.editobj = {}
    },
    submitPoint(row) {
      api.varUpdate(row).then(() => {
        this.$message({
          message: '修改成功',
          type: 'success'
        })
        this.getPointList()
      }).catch((err) => {
        this.$msg.error(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    padding: 0px;
    margin: 0;
    >>> .el-aside {
      padding: 0;
    }
  }
  .container {
    height: calc(100vh - 72px);
  }

  .table-container {
    height: calc(100% - 80px);
  }
  ::v-deep .table-container .el-select .el-input {
    width: 60px;
  }
</style>
