<template>
  <div style="width: 100%; height: 100%" class="unselectable">
    <div style="width: 100%; height: 36px; display: flex; flex-direction: row; justify-content: space-evenly; align-items: center">
      <i class="el-icon-refresh icon-button" @click="refresh()" />
      <el-switch
        v-model="personal"
        style="display: block"
        active-color="#ff4949"
        inactive-color="#13ce66"
        active-text="私有"
        inactive-text="公有"
      >
      </el-switch>
    </div>
    <div class="view">
      <el-table
        :data="personal ? privated : share"
        border
        style="width:100%;"
        height="100%"
        :show-header="false"
        :row-class-name="rowClassName"
        :cell-style="{padding:'0px', background: '#ccc'}"
      >
        <el-table-column
          prop="id"
          label="ID"
          align="center"
          width="42"
        ></el-table-column>
        <el-table-column
          prop="name"
          label="名称"
        >
          <template slot-scope="scope">
            <!-- <span style="font-size: 10px; color: gray;">{{ row.updated ? operatingTime(row.updated) : '' }}</span>
            <br /> -->
            <div class="cellStyle">
              <span>{{ scope.row.name }}</span>
              <i
                v-if="scope.row.updated && (personal || roles.includes('engineer') || scope.$index > 49) "
                class="el-icon-edit icon-button-mini"
                style="margin-left: 8px;float: right;"
                @click="editCondition(scope.row)"
              ></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="更新时间"
          width="150"
        >
          <template slot-scope="scope">
            <div class="cellStyle">
              <span style="font-size: 10px; color: gray;">{{ scope.row.updated ? operatingTime(scope.row.updated) : '' }}</span>
              <div v-if="personal || roles.includes('engineer') || scope.$index > 49">
                <i
                  class="el-icon-camera-solid icon-button-mini"
                  style="float: right;"
                  @click="saveCondition(scope.row)"
                ></i>
                <!-- <i
                  v-if="row.name"
                  class="el-icon-download icon-button-mini"
                  style="float: right;"
                  @click="loadCondition(row)"
                ></i> -->
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="60" align="left">
          <template slot-scope="{ row }">
            <div v-if="row.updated" style="cursor: pointer;font-size: 23px; text-align: center;" @click="loadCondition(row)"><svg-icon icon-class="load"></svg-icon></div>
          </template>
        </el-table-column>
        <!-- <el-table-column
          v-if="editable || personal"
          label=""
          width="60"
        >
          <template slot-scope="{ row }">
            <i
              class="el-icon-camera-solid icon-button-mini"
              @click="saveCondition(row)"
            ></i>
            <i
              class="el-icon-edit icon-button-mini"
              style="margin-left: 8px;"
              @click="editCondition(row)"
            ></i>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as api from '@/api/condition'
import moment from 'moment'

export default {
  name: 'ConditionList',
  props: {
    editable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      listLoading: false,
      maxListCount: 128,
      share: [], // 系统
      privated: [], // 私有
      personal: false
    }
  },
  computed: {
    ...mapGetters([
      'selectedInst',
      'roles'
    ])
  },
  mounted() {
    this.$on('global:project.open', () => {
      this.getList()
      this.getPersonList()
    })
    this.getList()
    this.getPersonList()
  },
  methods: {
    rowClassName({ row }) {
      if (!row.name) return
      if (row.id === this.selectedInst.condition) {
        return 'selectedCondition'
      }
    },
    // 转换时间
    operatingTime(time) {
      return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss')
    },
    getList() {
      if (!this.$store.getters.token) {
        return
      }
      let items = []
      api.listCond().then(res => {
        let list = res.items
        for (let i in list) {
          items.push(list[i])
        }
        let newarr = []
        for (let i = 1; i <= this.maxListCount; i++) {
          let ishave = false
          let hnum = 0
          for (let j = 0; j < items.length; j++) {
            if (items[j].id === i) {
              ishave = true
              hnum = j
            }
          }
          if (ishave) {
            ishave = false
            newarr.push(items[hnum])
          } else {
            let obj = { id: i, name: '' }
            newarr.push(obj)
          }
        }
        this.share = newarr
      })
    },
    refresh() {
      this.getList()
      this.getPersonList()
    },
    getPersonList() {
      if (!this.$store.getters.token) {
        return
      }
      let ite = []
      let personal = true
      api.listCond(personal).then(res => {
        let list = res.items
        for (let i in list) {
          ite.push(list[i])
        }
        let newarr = []
        for (let i = 1; i <= this.maxListCount; i++) {
          let ishave = false
          let hnum = 0
          for (let j = 0; j < ite.length; j++) {
            if (ite[j].id === i) {
              ishave = true
              hnum = j
            }
          }
          if (ishave) {
            ishave = false
            newarr.push(ite[hnum])
          } else {
            let obj = { id: i, name: '' }
            newarr.push(obj)
          }
        }
        this.privated = newarr
      })
    },

    loadCondition(row) {
      this.$confirm(`确定加载工况: ${row.name} ?`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在加载工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return api.loadCond(row.id, this.personal)
      }).then(() => {
        this.$msg.success('加载工况成功')
      }).catch((err) => {
        this.$msg.error(err, '加载工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    saveCondition(row) {
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return api.saveCond(row.id, this.personal)
      }).then(() => {
        if (this.personal === false) {
          this.getList()
        } else {
          this.getPersonList()
        }
        this.$msg.success(row.id, '保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    editCondition(row) {
      this.$prompt('请输入工况描述', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: row.name || `工况 ${row.id}`
      }).then(({ value }) => {
        return api.updateCond(row.id, value, this.personal)
      }).then(() => {
        if (this.personal === false) {
          this.getList()
        } else {
          this.getPersonList()
        }
      }).catch((err) => {
        console.error(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
	.view{
		height: calc(100% - 36px);
		width: 100%;

    >>> .cell {
      padding-left: 2px;
      padding-right: 2px;
    }
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

  .icon-button-mini {
    display: inline-block;
    line-height: 14px;
    font-size: 14px;
    cursor: pointer;
  }
  ::v-deep .el-table .selectedCondition > td {
    background-color: rgb(30, 182, 37) !important;
  }
  .cellStyle {
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  ::v-deep .el-table tbody tr:hover > td {
    background-color: #80d3f8 !important;
  }
  ::v-deep .el-switch__label.is-active {
    color: #f59b22;
  }
  ::v-deep .el-switch__label {
    color: #FFF;
  }

</style>
