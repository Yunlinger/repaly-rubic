<template>
  <div style="width: 100%; height: 100%" class="unselectable">
    <div style="width: 100%; height: 36px; display: flex; flex-direction: row; justify-content: space-evenly; align-items: center;">
      <i class="el-icon-refresh icon-button" @click="getList()" />
      <el-select v-model="config.ticker" @change="tickerChange">
        <el-option key="1" label="1分钟" :value="1" />
        <el-option key="2" label="2分钟" :value="2" />
        <el-option key="5" label="5分钟" :value="5" />
        <el-option key="10" label="10分钟" :value="10" />
      </el-select>
      <i class="el-icon-camera-solid icon-button" @click="save()" />
    </div>
    <div class="view">
      <el-table
        :data="snapshotList"
        border
        style="width:100%;"
        height="100%"
        :show-header="false"
        :header-cell-style="{color: '#FFF', background: '#485a77'}"
        :cell-style="{padding:'0px', background: '#ccc'}"
        :row-class-name="rowClassName"
        @row-dblclick="rowDblclick"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="60"
        ></el-table-column>
        <el-table-column
          label="时间"
        >
          <template slot-scope="scope">
            <span :style="{color: scope.row.name === 'auto save' ? '#FFF' : 'green'}">{{ operatingTime(scope.row.created) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label=""
          width="40"
        >
          <template slot-scope="{ row }">
            <div
              style="cursor: pointer;font-size: 23px; text-align: center;"
              @click="restore(row)"
            >
              <svg-icon icon-class="load"></svg-icon>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/condition'
import moment from 'moment'

export default {
  name: 'Snapshot',
  data() {
    return {
      loading: false,
      saving: false,
      snapshotList: [],
      config: {
        max: 64,
        ticker: 2
      },
      selectTimeId: null
    }
  },
  mounted() {
    this.getList()
    this.$on('global:project.open', () => {
      this.getList()
    })
    this.$on('global:log', msg => {
      if (msg.data.op === 'SnapshotSave' || msg.data.op === 'SnapshotSetConfig') {
        this.getList()
        return
      }
    })
  },
  methods: {
    rowClassName({ row }) {
      if (!row.select) return
      return 'selectedCondition'
    },
    getList() {
      // getConfig
      api.getSnapshotConfig().then(conf => {
        this.config = conf || {}
      })

      if (this.loading === true) {
        return
      }
      this.loading = true
      this.snapshotList = []
      let snapshotList = []
      api.listSnapshot().then(res => {
        for (let i in res.items) {
          snapshotList.push(res.items[i])
          snapshotList.sort((a, b) => {
            return b.id - a.id
          })
        }
        this.snapshotList = snapshotList
      }).catch(err => {
        this.$msg.error(err, '列表获取失败')
      }).finally(() => {
        this.loading = false
      })
    },
    // 转换时间
    operatingTime(time) {
      return moment(time * 1000).format('MM-DD HH:mm:ss')
    },
    save() {
      if (this.saving === true) {
        return
      }
      this.saving = true
      api.saveSnapshot({}).then(res => {
        this.$msg.success('保存快照成功')
        this.getList()
      }).catch(err => {
        this.$msg.error(err, '保存快照失败')
      }).finally(() => {
        this.saving = false
      })
    },
    restore(row) {
      this.$confirm('确定恢复快照: ' + row.id + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.restoreSnapshot(row.id)
      }).then(() => {
        this.selectTimeId = row.id
        const arr = this.snapshotList.map(item => {
          if (item.id === row.id) {
            item.select = true
          } else {
            if (item.select) delete item.select
          }
          const result = { ...item }
          return result
        })
        this.snapshotList = arr
        this.$msg.success('恢复快照成功')
      }).catch(err => {
        this.$msg.error(err, '恢复快照失败')
      })
    },
    rowDblclick(row) {
      this.restore(row)
    },
    tickerChange(v) {
      this.config.ticker = v
      if (this.config.max < 64) {
        this.config.max = 64
      }
      api.setSnapshotConfig(this.config)
    }
  }
}
</script>

<style lang="scss" scoped>
	.view{
		height: calc(100% - 36px);
		width: 100%;
	}
  .unselectable {
    -webkit-user-select: none;  /* Chrome all / Safari all */
    -moz-user-select: none;     /* Firefox all */
    -ms-user-select: none;      /* IE 10+ */
    user-select: none;          /* Likely future */
  }
  .icon-button {
    display: inline-block;
    line-height:32px;
    font-size: 24px;
    cursor: pointer;
  }
  .icon-button:hover {
    color: rgb(30, 182, 37);
  }
  ::v-deep .el-table tbody tr:hover > td {
    background-color: #80d3f8 !important;
  }
  ::v-deep .el-table .selectedCondition > td {
    background-color: rgb(30, 182, 37) !important;
  }
</style>
