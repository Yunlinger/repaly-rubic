<template>
  <div
    class="views"
    style="width:100%;height:100%;"
  >
    <div style="width: 100%; height: 28px;display: flex;align-items: center;justify-content: space-between;">
      <el-input
        v-model="filterText"
        placeholder="输入关键字进行过滤"
        style="width: 300px;"
      />
      <div style="width: 40px;text-align: center;cursor: pointer;color: #FFF;"><i class="el-icon-refresh icon-button" @click="updateTree(project.project)" /></div>
      <!-- <div v-if="faultshow" style="float: right;width: 85px;font-size: 15px;line-height: 28px;margin-right:5px;border-radius: 5px;background-color: #909399;text-align: center;color: #FFF;cursor: pointer;" @click="startAll">投入全部</div> -->
    </div>
    <el-collapse v-if="!filterText" v-model="activeName" accordion>
      <el-collapse-item v-for="(item, index) in nodes" :key="item.id" :title="item.name" :name="String(index)">
        <div class="collapse-item" :style="{ height: myHeight + 'px' }">
          <div
            v-for="(ite, idx) in item.children"
            :key="ite.id"
            class="item"
            :class="selectedInst.fault && selectedInst.fault.includes(ite.id) ? 'infault' : ( ite.hover ? 'inchoose' : '' )"
            @click="hoverIn(item.children, ite)"
          >
            <div class="item_box">
              <div
                style="width: calc(100% - 136px);"
                :class="selectedInst.fault && selectedInst.fault.includes(ite.id) ? 'f' : ''"
                @click="hoverIn(item.children, ite)"
                @contextmenu.prevent.stop="copyId(ite)"
              >
                <span :class="ite.ops && !ite.ops[0].dataType ? 'g' : 'y'">{{ ite.ops && !ite.ops[0].dataType ? '程度' : '开关' }}</span>{{ idx + 1 }}、  {{ ite.name }}
              </div>
              <div
                v-if="(selectedInst.fault && selectedInst.fault.includes(ite.id)) || ite.hover"
                style="width: 136px;display: flex; justify-content: flex-end;align-items: center;"
              >
                <!-- <span v-if="selectedInst.fault && selectedInst.fault.includes(ite.id)" style="float: left;">值：{{ ite.value }}</span> -->
                <div v-if="ite.ops && !ite.ops[0].dataType">
                  <el-select
                    v-if="ite.hover || selectedInst.fault && selectedInst.fault.includes(ite.id)"
                    v-model="ite.level"
                    placeholder="请选择"
                    @change="updateVar"
                    @focus="getItem(ite)"
                  >
                    <el-option
                      v-for="val in levels"
                      :key="val.value"
                      :label="val.label"
                      :value="val.value"
                    >
                    </el-option>
                  </el-select>
                </div>
                <div>
                  <span v-if="!selectedInst.fault || !selectedInst.fault.includes(ite.id)">
                    <el-popconfirm
                      title="确定投入故障？"
                      @onConfirm="startFaults(ite)"
                    >
                      <el-button slot="reference" type="danger">加载</el-button>
                    </el-popconfirm>
                  </span>
                  <el-button v-if="selectedInst.fault && selectedInst.fault.includes(ite.id)" type="success" @click="repeal(ite)">撤销</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div v-else style="height: calc(100vh - 98px); overflow-y: auto;color: #FFF;font-size: 13px;">
      <div
        v-for="(ite, idx) in filterList"
        :key="ite.id"
        class="item"
        :class="selectedInst.fault && selectedInst.fault.includes(ite.id) ? 'infault' : ( ite.hover ? 'inchoose' : '' )"
        @click="hoverIn(filterList, ite)"
      >
        <div class="item_box">
          <div
            style="width: calc(100% - 136px);height: 100%;display: flex; align-items: center;"
            :class="selectedInst.fault && selectedInst.fault.includes(ite.id) ? 'f' : ''"
            @click="hoverIn(filterList, ite)"
            @contextmenu.prevent.stop="copyId(ite)"
          >
            <span :class="ite.ops && !ite.ops[0].dataType ? 'g' : 'y'">{{ ite.ops && !ite.ops[0].dataType ? '程度' : '开关' }}</span>{{ idx + 1 }}、  {{ ite.name }}
          </div>
          <div
            v-if="(selectedInst.fault && selectedInst.fault.includes(ite.id)) || ite.hover"
            style="width: 136px;display: flex; justify-content: flex-end;align-items: center;"
          >
            <!-- <span v-if="selectedInst.fault && selectedInst.fault.includes(ite.id)" style="float: left;">值：{{ ite.value }}</span> -->
            <div v-if="ite.ops && !ite.ops[0].dataType">
              <el-select
                v-if="ite.hover || selectedInst.fault && selectedInst.fault.includes(ite.id)"
                v-model="ite.level"
                placeholder="请选择"
                @change="updateVar"
                @focus="getItem(ite)"
              >
                <el-option
                  v-for="val in levels"
                  :key="val.value"
                  :label="val.label"
                  :value="val.value"
                >
                </el-option>
              </el-select>
            </div>
            <div>
              <span v-if="!(selectedInst.fault && selectedInst.fault.includes(ite.id))">
                <el-popconfirm
                  title="确定投入故障？"
                  @onConfirm="startFaults(ite)"
                >
                  <el-button slot="reference" type="danger">加载</el-button>
                </el-popconfirm>
              </span>
              <el-button v-if="selectedInst.fault && selectedInst.fault.includes(ite.id)" type="success" @click="repeal(ite)">撤销</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as api from '@/api/fault'
import * as rdbapi from '@/api/rtd'
import * as papi from '@/api/project'
export default {
  data() {
    return {
      activeName: '0',
      nodes: [],
      filterList: [],
      filterText: '',
      levels: [
        {
          value: '0.05',
          label: '5%'
        }, {
          value: '0.1',
          label: '10%'
        }, {
          value: '0.2',
          label: '20%'
        }, {
          value: '0.3',
          label: '30%'
        }, {
          value: '0.4',
          label: '40%'
        },
        {
          value: '0.5',
          label: '50%'
        },
        {
          value: '0.6',
          label: '60%'
        },
        {
          value: '0.7',
          label: '70%'
        },
        {
          value: '0.8',
          label: '80%'
        },
        {
          value: '0.9',
          label: '90%'
        },
        {
          value: '1',
          label: '100%'
        }
      ],
      selectItems: {},
      selectFault: []
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'selectedInst'
    ])
  },
  watch: {
    activeName(val, old) {
      if (val === '' && old !== 0) {
        this.activeName = '0'
      }
    },
    filterText(val) {
      if (val === '') {
        this.filterList = []
      } else {
        let list = []
        this.nodes.map(item => {
          for (let i of item.children) {
            if (i.name.includes(val)) {
              list.push(i)
            }
          }
        })
        this.filterList = list
      }
    }
  },
  mounted() {
    this.updateTree(this.project.project)
    this.$on('global:rtdb', async() => {
      let cache = []
      await this.nodes.map(item => {
        for (let i of item.children) {
          if (this.selectedInst.fault && this.selectedInst.fault.includes(i.id)) {
            i.value = rdbapi.getValue(i.ops[0].var) || 0
            i.level = String(i.value / 100) || i.level
            if (i.ops[0] && !i.ops[0].dataType) {
              cache.push(i)
            }
          }
        }
      })
      if (JSON.stringify(this.selectFault) === JSON.stringify(cache)) return
      let id = this.selectedInst.id
      this.$store.commit('SET_FAULT', { name: id, list: cache })
      this.selectFault = cache
    })
    window.addEventListener('resize', () => { this.rowHeight(this.nodes.length) })
  },
  beforeDestroy() {
    window.removeEventListener('resize', () => {})
  },
  methods: {
    getItem(item) {
      this.selectItems = item
    },
    updateVar(val) {
      if (this.selectedInst.fault && this.selectedInst.fault.includes(this.selectItems.id)) {
        this.setVar(this.selectItems, val)
      }
      // else {
      //   this.startFaults(this.selectItems)
      // }
    },
    async setVar(obj, val) {
      await rdbapi.setValue(obj.ops[0].var, Number(val) * 100)
    },
    rowHeight(num) {
      let height = document.body.clientHeight
      this.myHeight = height - 98 - 48 * num
    },
    // 更新
    updateTree(name) {
      if (name) {
        this.name = name
      }
      if (this.listLoading) {
        return
      }
      this.filterText = ''
      this.nodes = []
      let tree = []
      api.tree().then(res => {
        res = res || {}
        res.nodes = res.nodes || []
        let list = res.nodes.sort((a, b) => { return a.id - b.id })
        for (const node of list) {
          tree.push(node)
        }
        return api.list()
      }).then(res => {
        let list = res.items || {}
        tree.map(item => {
          item.children = []
          for (let i in list) {
            list[i].value = 0
            list[i].hover = false
            if (list[i].ops && !list[i].ops[0].dataType) {
              list[i].level = String(list[i].ops[0].target / 100)
            }
            if (this.selectedInst.fault && this.selectedInst.fault.includes(list[i].id)) {
              list[i].value = rdbapi.getValue(list[i].ops[0].var) || 0
            }
            if (list[i].sort === Number(item.id)) {
              item.children.push(list[i])
            }
          }
          item.children = item.children.sort((a, b) => {
            var aDesc = (a && a.ops && a.ops[0] && a.ops[0].description) || ''
            var bDesc = (b && b.ops && b.ops[0] && b.ops[0].description) || ''
            return aDesc.localeCompare(bDesc, 'zh-CN', { numeric: true })
          })
        })
        this.nodes = tree
        this.rowHeight(tree.length)
      })
    },
    async startFaults(data) {
      let ins = this.selectedInst
      let params = {
        'rubik.project': ins.project,
        'rubik.model': 'model',
        'rubik.id': ins.id
      }
      let obj = {
        id: data.id
      }
      if (data.ops && !data.ops[0].dataType) {
        obj = {
          id: data.id,
          name: data.name,
          sort: data.sort,
          ops: [{ var: data.ops[0].var, start: 0, target: Number(data.level * 100) }]
        }
      }
      await api.starts(obj, params).then(res => {
        this.$msg.success(`投入故障${data.name}成功`)
      }).catch(() => {
        this.$msg.error(`投入故障失败`)
      })
    },
    repeal(data) {
      let id = data.id
      api.stop(id).then(() => {
        this.$msg.success('撤销故障成功')
      }).catch(err => {
        this.$msg.error(err, '撤销故障失败')
      })
    },
    copyId(data) {
      if (data.ops && data.ops[0].var) {
        this.$copyText(data.ops[0].var)
        // .then(() => {
        //   this.$message.success(`变量${data.ops[0].var}已复制到粘贴板`)
        // }).catch(() => {
        //   this.$message.error('请重试')
        // })
      }
    },
    hoverIn(list, ite) {
      list.map(item => {
        if (item.id === ite.id) {
          item.hover = true
        } else {
          item.hover = false
        }
      })
    },
    convertList(list) {
      return new Promise(resolve => {
        let cache = []
        for (let i in list) {
          list[i].value = 0
          list[i].hover = false
          if (list[i].ops && !list[i].ops[0].dataType) {
            list[i].level = String(list[i].ops[0].target / 100)
          }
          if (this.selectedInst.fault && this.selectedInst.fault.includes(list[i].id)) {
            list[i].value = rdbapi.getValue(list[i].ops[0].var) || 0
            list[i].level = list[i].value / 100 ? String(list[i].value / 100) : list[i].level
            if (list[i].ops[0] && !list[i].ops[0].dataType) {
              cache.push(list[i])
            }
          }
        }
        resolve(cache)
      })
    },
    // 给当前投入的程度故障更改程度
    setFault() {
      papi.getFault(this.name).then(async res => {
        let list = res.list.items || {}
        let cache = await this.convertList(list)
        let id = this.selectedInst.id
        this.$store.commit('SET_FAULT', { name: id, list: cache })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.views {
  user-select: none;
  .collapse-item {
    display: block;
    overflow: auto;
    margin-bottom: -25px;
    color: #FFF;
    background: #485a77;
  }
  .item {
    padding-left: 5px;
    user-select: none;
    cursor: pointer;
    .item_box {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .item_text {
        width: calc(100% - 136px);
      }
    }
  }
  .f {
    color: #FFF;
  }
  .f:hover {
    color: #000;
  }
  .y {
    padding: 5px;
    background: rgb(238, 133, 31);
    color: #FFF;
    border-radius: 5px;
  }
  .g {
    padding: 5px;
    background: #67C23A;
    color: #FFF;
    border-radius: 5px;
  }
  .item:hover {
    color: #000;
    background-color: #caf982;
  }
  .inchoose {
    color: #000;
    background: #caf982;
  }
  .infault {
    background: #f59b22;
  }
  ::v-deep .el-collapse-item__header {
    padding-left: 5px;
    color: #FFF;
    background: #384763;
  }
  ::v-deep .el-select .el-input {
    width: 80px !important;
  }
}
</style>
