<template>
  <div
    v-loading="listLoading"
    v-contextmenu:contextmenu
    class="views"
    style="width:100%;height:100%;padding:5px;"
  >
    <div style="height:100%;" class="fault_box">
      <div
        class="leftviews"
        style="width:100%;height:100%;"
      >
        <div style="width: 100%; height: 28px;display: flex;align-items: center;justify-content: space-between;background: #FFF;">
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"
            style="width: 300px;"
          />
          <div style="width: 40px;text-align: center;cursor: pointer;color: #000;"><i class="el-icon-refresh icon-button" @click="updateTree(project.project)" /></div>
        </div>
        <el-collapse v-if="!filterText" v-model="activeName" accordion>
          <el-collapse-item v-for="(item, index) in nodes" :key="item.id" :title="item.name" :name="String(index)">
            <div class="collapse-item" :style="[collapseStyle]">
              <!-- 选中实例的故障列表是否包含当前故障 :class="(selectedInst.fault && selectedInst.fault.includes(ite.id)) && !isCtl ? 'infault' : ( ite.hover ? 'inchoose' : '' )" -->
              <div
                v-for="(ite, idx) in item.children"
                :key="ite.id"
                class="item"
                @click="hoverIn(item.children, ite)"
              >
                <div class="item_box">
                  <div
                    style="width: calc(100% - 136px);"
                    @contextmenu.prevent.stop="copyId(ite)"
                  >
                    <span
                      :class="ite.ops && !ite.ops[0].dataType ? 'g' : 'y'"
                    >{{ ite.ops && !ite.ops[0].dataType ? '程度' : '开关' }}
                    </span>
                    {{ idx + 1 }}、  {{ ite.name }}
                  </div>
                  <div
                    v-if="!isCtl"
                    style="width: 136px;display: flex; justify-content: flex-end;align-items: center;"
                  >
                    <!-- (selectedInst.fault && selectedInst.fault.includes(ite.id)) || ite.hover  -->
                    <div v-if="ite.hover" style="display: flex; justify-content:space-between;">
                      <!-- (ite.ops && !ite.ops[0].dataType) && !(selectedInst.fault && selectedInst.fault.includes(ite.id)) && !isCtl -->
                      <div
                        v-if="(ite.ops && !ite.ops[0].dataType) && !isCtl"
                      >
                        <el-select
                          v-model="level"
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
                      <span>
                        <el-popconfirm
                          title="确定投入故障？"
                          @onConfirm="startFaults(ite)"
                        >
                          <el-button slot="reference" type="danger">加载</el-button>
                        </el-popconfirm>
                      </span>
                    </div>
                  </div>
                  <div v-else style="width: 136px;display: flex; justify-content: flex-end;align-items: center;">
                    <span v-if="ite.hover">
                      <el-popconfirm
                        title="确定投入故障？"
                        @onConfirm="startFaults(ite)"
                      >
                        <el-button slot="reference" type="danger">加载</el-button>
                      </el-popconfirm>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        <div v-else style="height: calc((100vh - 70px) * 0.6 - 50px); overflow-y: auto;color: #FFF;background: #485a77;font-size: 13px;">
          <div
            v-for="(ite, idx) in filterList"
            :key="ite.id"
            class="item"
            :class="(selectedInst.fault && selectedInst.fault.includes(ite.id)) && !isCtl ? 'infault' : ( ite.hover ? 'inchoose' : '' )"
            @click="hoverIn(filterList, ite)"
          >
            <div class="item_box">
              <div
                style="width: calc(100% - 136px);height: 100%;display: flex; align-items: center;"
                @contextmenu.prevent.stop="copyId(ite)"
              >
                <span :class="ite.ops && !ite.ops[0].dataType ? 'g' : 'y'">{{ ite.ops && !ite.ops[0].dataType ? '程度' : '开关' }}</span>{{ idx + 1 }}、  {{ ite.name }}
              </div>
              <div
                v-if="!isCtl"
                style="width: 136px;display: flex; justify-content: flex-end;align-items: center;"
              >
                <div v-if="(selectedInst.fault && selectedInst.fault.includes(ite.id)) || ite.hover" style="display: flex; justify-content:space-between;">
                  <div
                    v-if="(ite.ops && !ite.ops[0].dataType) && !(selectedInst.fault && selectedInst.fault.includes(ite.id)) && !isCtl"
                  >
                    <el-select
                      v-model="level"
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
                  <span v-if="!(selectedInst.fault && selectedInst.fault.includes(ite.id))">
                    <el-popconfirm
                      title="确定投入故障？"
                      @onConfirm="startFaults(ite)"
                    >
                      <el-button slot="reference" type="danger">加载</el-button>
                    </el-popconfirm>
                  </span>
                </div>
              </div>
              <div v-else style="width: 136px;display: flex; justify-content: flex-end;align-items: center;">
                <span v-if="ite.hover">
                  <el-popconfirm
                    title="确定投入故障？"
                    @onConfirm="startFaults(ite)"
                  >
                    <el-button slot="reference" type="danger">加载</el-button>
                  </el-popconfirm>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="width: calc(100% - 380px); height: 100%;">
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
          <el-button @click="startAll">投入列表故障</el-button>
          <div v-for="(item, index) in faultList" :key="index" class="faultlist">
            <div class="list_item">
              <div v-if="item.name" class="item_info">
                <p>{{ item.name }}</p>
                <div v-if="item.name">
                  <div v-if="item.ops.dataType">
                    故障程度ON
                  </div>
                  <div v-else>
                    故障程度<el-select v-model="item.level" placeholder="请选择">
                      <el-option
                        v-for="ite in levels"
                        :key="ite.value"
                        :label="ite.label"
                        :value="ite.value"
                      >
                      </el-option>
                    </el-select>
                  </div>
                </div>
                <div>
                  <div v-if="!item.load">延时时间
                    <el-select v-model="item.time" placeholder="请选择">
                      <el-option
                        v-for="ite in options"
                        :key="ite.value"
                        :label="ite.label"
                        :value="ite.value"
                      >
                      </el-option>
                    </el-select>
                  </div>
                  <div v-else>延时时间{{ trans(item.time) }}</div>
                </div>
              </div>
              <div v-else class="item_info_reverse">
                空
              </div>
              <div style="float: right; width: 20px;height:100%;display: flex;flex-direction: column;justify-content:center;">
                <i class="el-icon-close" style="cursor:pointer;" @click="deleteItem(index)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item @click="updateTree(false)">刷新</v-contextmenu-item>
      <!-- <v-contextmenu-item divider></v-contextmenu-item>
      <v-contextmenu-item @click="startFault">加载故障</v-contextmenu-item> -->
    </v-contextmenu>
  </div>
</template>

<script>
// import tree from '@/components/ztree'
import * as api from '@/api/fault'
import * as rapi from '@/api/rtd'
import * as papi from '@/api/project'
import { mapGetters } from 'vuex'
// import UploadExcelComponent from './upload.vue'

export default {
  name: 'FaultEdit',
  // components: { UploadExcelComponent },
  data() {
    return {
      activeName: '0',
      filterText: '',
      filterList: [],
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
      options: [{
        value: '0',
        label: '0'
      }, {
        value: '30000',
        label: '0.5分钟'
      }, {
        value: '60000',
        label: '1分钟'
      }, {
        value: '180000',
        label: '3分钟'
      }, {
        value: '300000',
        label: '5分钟'
      }, {
        value: '600000',
        label: '10分钟'
      }],
      timeList: {},
      listLoading: false,
      faultList: [
        { id: '', name: '', level: '', time: '', info: '' },
        { id: '', name: '', level: '', time: '', info: '' },
        { id: '', name: '', level: '', time: '', info: '' },
        { id: '', name: '', level: '', time: '', info: '' },
        { id: '', name: '', level: '', time: '', info: '' }
      ],
      isCtl: false,
      faultshow: false,
      nodes: [],
      name: '',
      level: '1',
      selectItems: {},
      collapseStyle: {
        height: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'selectedInst'
    ])
  },
  watch: {
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
    // this.updateTree(this.$store.getters.project.project)
    // this.$on('global:project.open', (msg) => {
    //   this.updateTree(this.$store.getters.project.project)
    // })
  },
  beforeDestroy() {
    for (let i in this.timeList) {
      clearInterval(this.timeList[i])
    }
  },
  methods: {
    getItem(item) {
      this.selectItems = item
    },
    updateVar(val) {
      this.selectItems.level = val
      // this.startFaults(this.selectItems)
      // if (this.selectedInst.fault && this.selectedInst.fault.includes(this.selectItems.id)) {
      //   this.setVar(this.selectItems, val)
      // } else {
      //   this.startFaults(this.selectItems)
      // }
    },
    async setVar(obj, val) {
      await rapi.setValue(obj.ops[0].var, Number(val) * 100)
      this.setFault()
    },
    rowHeight(num) {
      let row = num || this.nodes.length
      this.collapseStyle.height = `calc((100vh - 70px) * 0.6 - 50px - 48px * ${row})`
    },
    sendItem(data) {
      this.isCtl = data
    },
    startAll() {
      this.start = true
      let faultList = this.faultList.filter(item => item.id !== '')
      faultList.map(item => {
        let time = 0
        time = Number(item.time)
        if (time === 0) {
          this.$emit('loadFaults', item)
          this.deleteItem(item.index)
          return
        }
        let _this = this
        item.load = true
        this.timeList[item.id] = setInterval(() => {
          time = time - 1000
          item.time = time
          if (time === 0) {
            clearInterval(_this.timeList[item.id])
            this.$emit('loadFaults', item)
            item.load = false
            delete _this.timeList[item.id]
            _this.deleteItem(item.index)
          }
        }, 1000)
      })
    },
    trans(item) {
      item = (item / 1000) + '秒'
      return item
    },
    // 左键点击
    handleNodeClick(data) {
      if (Object.prototype.hasOwnProperty.call(data, 'children')) return false
      if (this.faultList.findIndex(item => item.id === data.id) !== -1) return false
      data.level = data.ops.dataType === 1 ? '1' : '1'
      if (this.faultList.length < 6) {
        this.faultshow = true
        for (let i = 0; i < 6; i++) {
          if (this.faultList[i].id === '') {
            this.faultList[i].id = data.id
            this.faultList[i].name = data.name
            this.faultList[i].level = data.level
            this.faultList[i].time = data.time || 0
            this.faultList[i].info = data
            this.faultList[i].ops = data.ops[0]
            this.faultList[i].index = i
            this.faultList[i].load = false
            break
          }
        }
      }
    },
    deleteItem(index) {
      this.faultList[index].id = ''
      this.faultList[index].name = ''
      this.faultList[index].level = ''
      this.faultList[index].time = ''
      this.faultList[index].info = ''
      let i = this.faultList.findIndex(item => item.id !== '')
      if (i === -1) {
        this.faultshow = false
      }
    },
    clear() {
      this.faultList = [
        { id: '', name: '', level: '', time: '' },
        { id: '', name: '', level: '', time: '' },
        { id: '', name: '', level: '', time: '' },
        { id: '', name: '', level: '', time: '' },
        { id: '', name: '', level: '', time: '' }
      ]
    },
    // 更新
    updateTree(name) {
      if (name) {
        this.name = name
      }
      if (this.listLoading) {
        return
      }
      this.clear()
      this.nodes = []
      papi.getFault(this.name).then(async res => {
        let tree = []
        res.tree = res.tree || {}
        for (let i in res.tree) {
          res.tree[i].id = i
          tree.push(res.tree[i])
        }
        let list = res.list.items || {}
        tree.map(item => {
          item.children = []
          for (let i in list) {
            list[i].hover = false
            if (list[i].ops && !list[i].ops[0].dataType) {
              list[i].level = String(list[i].ops[0].target / 100)
            }
            if (list[i].sort === Number(item.id)) {
              item.children.push(list[i])
            }
          }
        })
        let cache = await this.convertList(list)
        let id = this.selectedInst.id
        this.$store.commit('SET_FAULT', { name: id, list: cache })
        this.nodes = tree
        this.rowHeight(tree.length)
      }).catch(err => {
        console.log(err)
      })
    },
    async startFaults(data) {
      let ins = this.selectedInst
      let item = this.selectItems
      if (this.selectedInst.fault && this.selectedInst.fault.includes(this.selectItems.id)) {
        this.setVar(this.selectItems, this.level)
        return
      }
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
          ops: [{
            var: data.ops[0].var, start: 0,
            target: item.id === data.id && item.name === data.name ? Number(item.level * 100) : Number(data.level * 100)
          }]
        }
      }
      if (this.isCtl) {
        this.$emit('loadFault', obj)
        return
      }
      await api.starts(obj, params).then(res => {
        this.$msg.success(`投入故障${data.name}成功`)
        this.setFault()
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
            list[i].value = rapi.getValue(list[i].ops[0].var) || 0
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
  .app-container {
    padding: 0px;
    margin: 0;
    >>> .el-aside {
      padding: 0;
    }
  }
  .container {
    height: calc(100vh - 112px);
  }
  .fault_box {
    display: flex;
    background: #485a77;
  }
  .panel{
    background-color: rgb(127, 127, 127);
    height: 100%;
    width: 100%;
    overflow: auto;
    z-index: 1001;
    color: #FFF;
    user-select: none;
  }
  .faultlist{
    margin:0;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    display: flex;
    i{
      line-height: 25px;
      font-size: 20px;
    }
    .list_item {
      width: 100%;
      height: 90px;
      border: 1px solid #ccc;
      border-radius: 5px;
      span {
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        background-color: rgb(127, 127, 127);
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        color: red;
      }
      .item_info {
        float: left;
        width: calc(100% - 20px);
        height: 100%;
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        p {
          margin: 0;
          padding: 0;
          text-align: center;
          border-radius: 5px;
          color: #FFF;
          background-color: #6FC9F6;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        ::v-deep .el-select .el-input {
          width: 105px !important;
        }
      }
      .item_info_reverse {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
      }
    }

  }
  ::v-deep .el-form-item__label{
    color: #FFF;
    padding: 0 5px 0 0 !important;
  }
  ::v-deep .el-slider__runway{
    margin: 11px 0;
  }
  ::v-deep .custom-tree-node{
    font-size: 15px;
  }
  .leftviews {
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
        .fault_name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
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
