<template>
  <div ref="view" v-contextmenu:contextmenu style="background-color: #485a77; height: 100%; width: 100%; overflow: hidden;">
    <div class="view">
      <div class="tabs">
        <ul>
          <li :class="{ active:idx == 0 }" @click="tab(0)">公用工况</li>
          <li :class="{ active:idx == 1 }" @click="tab(1)">私有工况</li>
        </ul>
      </div>
      <div class="tabsView">
        <div v-show="idx == 0" style="position: absolute;width: 100%;overflow: hidden;">
          <el-table
            :data="share"
            border
            :header-cell-style="{color: '#FFF', background: '#485a77'}"
            :row-style="{height:'40px',color: '#FFF', background: '#485a77'}"
            :cell-style="{padding:'0px',color: '#FFF', background: '#485a77'}"
            style="width: 100%"
            :height="theight.height"
          >
            <el-table-column
              fixed
              prop="id"
              label="ID"
              width="50"
              align="center"
            >
              <template slot-scope="scope">
                <div>
                  <el-popover
                    placement="right"
                    width="250"
                    trigger="hover"
                  >
                    <p>创建时间：{{ operatingTime(scope.row.created) }}</p>
                    <div slot="reference" style="cursor: pointer;">{{ scope.row.id }}</div>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              fixed
              prop="name"
              label="名称"
            >
              <template slot-scope="scope">
                <div @click="edit(scope.row, scope.$index)">
                  <el-input v-if="scope.row.edit && !isCtl" v-model="scope.row.name" v-focus @focus="focusEvent(scope.row)" @change="inBlur(scope.row)" @blur="scope.row.edit = false"></el-input>
                  <span v-else class="name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              fixed
              label="操作"
              align="center"
              width="120"
            >
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="success" @click="loadCondition(scope.row)"><svg-icon icon-class="put" /></el-button>
                  <el-button v-if="!isCtl && scope.$index > 49" @click="saveCondition(scope.row)"><i class="el-icon-folder-checked" /></el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-show="idx == 1">
          <el-table
            :data="privated"
            border
            :header-cell-style="{color: '#FFF', background: '#485a77'}"
            :row-style="{height:'40px',color: '#FFF', background: '#485a77'}"
            :cell-style="{padding:'0px',color: '#FFF', background: '#485a77'}"
            style="width: 100%"
            :height="theight.height"
          >
            <el-table-column
              fixed
              prop="id"
              label="ID"
              width="50"
              align="center"
            >
              <template slot-scope="scope">
                <div>
                  <el-popover
                    placement="right"
                    width="400"
                    trigger="hover"
                  >
                    <p>创建时间：{{ operatingTime(scope.row.created) }}</p>
                    <div slot="reference" style="cursor: pointer;">{{ scope.row.id }}</div>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              fixed
              prop="name"
              label="名称"
            >
              <template slot-scope="scope">
                <div @click="edit(scope.row)">
                  <el-input v-if="scope.row.edit && !isCtl" v-model="scope.row.name" v-focus @focus="focusEvent(scope.row)" @change="inBlur(scope.row)" @blur="scope.row.edit = false"></el-input>
                  <span v-else class="name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              fixed
              label="操作"
              align="center"
              width="120"
            >
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="success" @click="loadCondition(scope.row)"><svg-icon icon-class="put" /></el-button>
                  <el-button v-if="!isCtl" @click="saveCondition(scope.row)"><i class="el-icon-folder-checked" /></el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item @click="update">刷新</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
import * as api from '@/api/condition'
import * as papi from '@/api/project'
import * as mapi from '@/api/model'
import moment from 'moment'

export default {
  name: 'ConditionList',
  directives: {
    focus: {
      // 指令的定义
      inserted(el) {
        // 聚焦元素
        if (el.querySelector('input')) {
          el.querySelector('input').focus()
        }
      }
    }
  },
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
      share: [], // 系统
      privated: [], // 私有
      idx: 0,
      isCtl: false,
      isLoading: true,
      theight: {
        height: (window.innerHeight - 77) * 0.4
      }
    }
  },
  mounted() {
    this.$on('global:project.open', () => {
      this.getList()
      this.getPersonList()
    })
    // this.getList(name)
    // this.getPersonList()
  },
  methods: {
    // 点击获取索引
    sendItem(data) {
      this.isCtl = data
    },
    edit(row, idx) {
      if (this.isCtl) {
        return
      } else {
        if (row.name && idx > 49) {
          row.edit = true
        }
        return
      }
    },
    saveCondition(row) {
      let personal = this.idx === 0 ? '' : true
      if (personal) {
        this.savePerson(row)
        return
      }
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(async() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        await mapi.modelStart(false)
        return api.saveCond(row.id)
      }).then(() => {
        let name = row.name || `工况${row.id}`
        return api.updateCond(row.id, name)
      }).then(() => {
        this.getList(this.$store.getters.project.project)
        this.$msg.success(row.id, '保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    savePerson(row) {
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(async() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        await mapi.modelStart(false)
        return api.saveCond(row.id, true)
      }).then(() => {
        this.getPersonList()
        this.$msg.success('保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    focusEvent(row) {
      row.oldName = row.name
    },
    // 失去光标
    inBlur(row) {
      let id = row.id
      let name = row.name
      if (row.oldName === row.name) {
        row.edit = false
        return
      } else {
        if (!name) {
          this.$msg.error('名称不能为空')
          row.name = row.oldName
          return
        }
      }
      if (this.idx === 1) {
        let personal = true
        api.updateCond(id, name, personal).then(() => {
          this.$msg.success('修改名称成功')
          row.edit = false
        }).catch((err) => {
          row.name = row.oldName
          this.$msg.error(err, '修改名称失败,请重试')
        })
      } else {
        api.updateCond(id, name).then(res => {
          this.$msg.success('修改名称成功')
          row.edit = false
        }).catch((err) => {
          row.name = row.oldName
          this.$msg.error(err, '修改名称失败,请重试')
        })
      }
    },
    // 转换时间
    operatingTime(time) {
      if (time) {
        return moment(time * 1000).format('YYYY-MM-DD hh:mm:ss')
      } else {
        return '暂无数据'
      }
    },
    // 选项卡索引
    tab(idx) {
      this.idx = idx
    },
    update() {
      if (this.idx === 0) {
        this.getList(this.$store.getters.project.project)
      } else {
        this.getPersonList()
      }
    },
    getList(name) {
      let items = []
      papi.getCondition(name).then(res => {
        let newarr = []
        let list = res.list.items || {}
        for (let i in list) {
          list[i].edit = false
          items.push(list[i])
        }
        for (let i = 1; i <= 101; i++) {
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
            let obj = { id: i, name: '', edit: false }
            newarr.push(obj)
          }
        }
        this.share = newarr
        this.isLoading = false
      })
    },
    getPersonList() {
      let ite = []
      let personal = true
      api.listCond(personal).then(res => {
        let list = res.items
        for (let i in list) {
          list[i].edit = false
          ite.push(list[i])
        }
        let newarr = []
        for (let i = 1; i <= 51; i++) {
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
            let obj = { id: i, name: '', edit: false }
            newarr.push(obj)
          }
        }
        this.privated = newarr
      })
    },
    // 删除工况
    removeNode(row) {
      let id = row.id
      let personal = true
      this.$confirm(`确定删除: ${row.name}`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在删除工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        if (this.idx === 0) {
          return api.delCond(id)
        } else {
          return api.delCond(id, personal)
        }
      }).then(() => {
        if (this.idx === 0) {
          this.getList()
        } else {
          this.getPersonList()
        }
        this.$msg.success('删除工况成功')
      }).catch((err) => {
        this.$msg.error(err, '删除工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    loadsOne(row) {
      let id = row.id
      let personal = true
      this.$confirm(`确定加载工况: ${row.name}`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在加载工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        if (this.idx === 0) {
          return api.loadCond(id)
        } else {
          return api.loadCond(id, personal)
        }
      }).then(() => {
        this.$msg.success('加载工况成功')
      }).catch((err) => {
        this.$msg.error(err, '加载工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    loadCondition(row) {
      if (this.isCtl) {
        let id = row.id
        let personal = true
        this.$confirm(`确定加载工况: ${row.name}`).then(() => {
          if (this.idx === 0) {
            this.$emit('loadConds', { id })
          } else {
            this.$emit('loadConds', { id, personal })
          }
        })
      } else {
        if (this.$store.getters.project.project === '') {
          this.$msg.error('请选择实例')
          return
        }
        if (row.name === '') return
        this.loadsOne(row)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
	.view{
    width: 100%;
    height: 100%;
    .tabs{
      position: sticky;
      left: 0; top: 0;
      height: 36px;
      background: #909399;
      z-index: 100;
      ul{
        list-style: none;
        margin: 0;
        padding: 0;
        li{
          float: left;
          width: 50%;
          text-align: center;
          cursor: pointer;
          line-height: 36px;
        }
      }
    }
    .active{
      background: #67C23A;
      color: #FFF;
    }
    .tabsView{
      width: 100%;
      height: calc(100% - 36px);
      position: relative;
      padding: 3px;
      .name{
        cursor: pointer;
        display: block;
        height: 40px;
        line-height: 40px;
      }
    }
	}
</style>
