<template>
  <div>
    <div style="display: flex;justify-content: space-evenly;font-size: 10px;text-align: center;position: relative;top: 3px;">
      <div :style="JSON.stringify(info) === '{}' ?'cursor: not-allowed;':'cursor: pointer'" @click="JSON.stringify(info) === '{}' ?checkedNull():switchDialogVisible = true">
        <img :src="switchImg" :style="JSON.stringify(info) === '{}' ?'filter: grayscale(100%);height:30px;width:30px':'height:30px;width:30px'">
        <br>
        <span>加载工况</span>
      </div>
      <div :style="JSON.stringify(info) === '{}' ?'cursor: not-allowed;':'cursor: pointer'" @click="JSON.stringify(info) === '{}' ?checkedNull():faultDialogVisible = true">
        <img :src="errorImg" :style="JSON.stringify(info) === '{}'?'filter: grayscale(100%);height:30px;width:30px':'height:30px;width:30px'">
        <br>
        <span>下放故障</span>
      </div>
      <div :style="JSON.stringify(info) === '{}' ?'cursor: not-allowed;':'cursor: pointer'" @click="JSON.stringify(info) === '{}' ?checkedNull():readSnapShot()">
        <img :src="readSnapshotImg" :style="JSON.stringify(info) === '{}' ?'filter: grayscale(100%);height:30px;width:30px':'height:30px;width:30px'">
        <br>
        <span>读取快照</span>
      </div>
    </div>
    <el-dialog
      :visible.sync="switchDialogVisible"
      width="30%"
      height="450px"
      @closed="conditionDb=''"
    >
      <p class="dialogTitle">加载工况</p>
      <el-tabs v-model="activeNamee">
        <el-tab-pane label="公有工况" name="first">
          <div style="width: 100%;">
            <el-table
              height="650"
              :data="conditionList"
              style="width: 100%"
            >
              <el-table-column
                prop="id"
                label="ID"
                width="120"
              >
              </el-table-column>
              <el-table-column
                prop="name"
                label="工况名称"
                width="180"
              >
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作"
                width="100"
              >
                <template slot-scope="scope">
                  <img :src="loadCond" style="cursor: pointer;" @click="switchCondition(scope.row)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

        </el-tab-pane>
        <el-tab-pane label="私有工况" name="second">
          <div style="width: 100%;">
            <el-table
              height="650"
              :data="persConditionList"
              style="width: 100%"
            >
              <el-table-column
                prop="id"
                label="ID"
                width="120"
              >
              </el-table-column>
              <el-table-column
                prop="name"
                label="工况名称"
                width="180"
              >
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作"
                width="100"
              >
                <template slot-scope="scope">
                  <img :src="loadCond" style="cursor: pointer;" @click="switchConditions(scope.row)" />
                  <img :src="saveCond" style="cursor: pointer;" @click="saveCondition()" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog
      :visible.sync="faultDialogVisible"
      width="55%"
    >
      <p class="dialogTitle">下放故障</p>
      <div style="width: 20%;float: left;">
        <p style="color: rgb(106, 104, 104);font-size: 13px;">已选学员机</p>
        <div class="pubBox">
          <div v-for="(item,index) in info" :key="index" style="margin: 5px;background-color: #f2f8fe;height: 30px;line-height: 30px;color: #5d88f7;padding-left: 8px;">{{ item.uname }}</div>
        </div>
      </div>
      <div style="width: 75%;margin-left: 25%;">
        <p>故障列表</p>
        <input
          v-model="fifterTxt"
          placeholder="输入关键字进行过滤"
          style="width: 260px;height: 30px;border: none;background-color: #bacaf161;font-size: 14px;padding-left: 10px;margin-bottom: 10px;border-radius: 4px;"
          @input="changeTxt(fifterTxt)"
        />
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane v-for="item,index in newFaultList" :key="index" :label="item.name" :name="item.id">
            <div style="height: 35vh;overflow: auto;">
              <el-table
                ref="multipleTable"
                :data="item.array"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="name" label="故障名称" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="dataType" label="故障值" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="delay" label="延时时间" show-overflow-tooltip>
                </el-table-column>
                <el-table-column fixed="right" label="操作" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="editFault(scope.row)">编辑</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="faultDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="loadFault()">投入故障</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="readSnapShotdialogVisible" :width="'30%'">
      <p style="font-size: 18px;font-weight: 8;margin-bottom: 30px;">快照列表</p>
      <el-select v-model="config.ticker" @change="tickerChange">
        <el-option key="1" label="1分钟" :value="1" />
        <el-option key="2" label="2分钟" :value="2" />
        <el-option key="5" label="5分钟" :value="5" />
        <el-option key="10" label="10分钟" :value="10" />
      </el-select>
      <el-button type="primary" @click="snapSave()">保存快照</el-button>
      <div style="height: 35vh;overflow: auto;">
        <el-table
          ref="multipleTable"
          :data="snapshotList"
          tooltip-effect="dark"
          style="width: 100%"
        >
          <el-table-column
            prop="id"
            label="快照名称"
            width="140"
          >
          </el-table-column>

          <el-table-column
            label="保存时间"
            width="180"
          >
            <template slot-scope="scope">
              <span :style="{color: scope.row.name === 'auto save' ? 'black' : 'green'}">{{ operatingTime(scope.row.created) }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <el-button type="text" size="small" @click="backSnap(row)">恢复快照</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="readSnapShotdialogVisible = false">取消</el-button>
        <el-button type="primary" @click="readSnapShotdialogVisible = false">保存</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="EditFaultdialogVisible"
      width="22%"
    >
      <p style="font-size: 18px;">{{ tempFaultName }}</p>
      <div style="height: 10vh;">
        <div style="margin-bottom: 20px;margin-left: 10px;">
          <span style="margin-right: 14px;color: #939698;">故障程度:</span>
          <el-select v-if="faultRangeValue !='ON'" v-model="faultRangeValue" :width="60" placeholder="请选择故障程度">
            <el-option
              v-for="item in faultRange"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <span v-else style="font-size: 16px;">ON</span>

        </div>
        <div style="margin: 10px;">
          <span style="margin-right: 14px;color: #939698;">延时时间:</span>
          <el-select v-model="delayRangeValue" placeholder="请选择延时时间">
            <el-option
              v-for="item in delayRange"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>

      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="EditFaultdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFaultConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as papi from '@/api/project'
import * as capi from '@/api/condition'
import * as fapi from '@/api/fault'
import moment from 'moment'
export default {
  name: 'RightSidebarProject',
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loadCond: require('@/assets/hollysys/loadCond.png'),
      saveCond: require('@/assets/hollysys/saveCond.png'),
      conditionDb: '',
      conditionEdit: '',
      fifterTxt: '',
      saving: false,
      config: {
        max: 64,
        ticker: 2
      },
      loadFaultList: [],
      EditFaultdialogVisible: false,
      faultRangeValue: '',
      delayRangeValue: '',
      activeNamee: 'first',
      faultRange: [{
        value: 10,
        text: '10%'
      }, {
        value: 20,
        text: '20%'
      },
      {
        value: 30,
        text: '30%'
      },
      {
        value: 50,
        text: '50%'
      },
      {
        value: 80,
        text: '80%'
      },
      {
        value: 100,
        text: '100%'
      }
      ],
      delayRange: [{
        value: 1,
        text: '1分钟'
      },
      {
        value: 2,
        text: '2分钟'
      },
      {
        value: 3,
        text: '3分钟'
      },
      {
        value: 5,
        text: '5分钟'
      }
      ],
      privated: [],
      fault: [],
      tempFaultName: '',
      activeName: '1',
      persConditionList: [],
      searchContent: '',
      faultIds: [],
      conditionName: '',
      conditionDesc: '',
      snapshopName: '',
      snapshopDesc: '',
      newFaultList: [],
      faultList: [],
      snapshotList: [],
      conditionCheckedID: '',
      conditiondialogVisible: false,
      readSnapShotdialogVisible: false,
      faultDialogVisible: false,
      switchDialogVisible: false,
      conditionList: [],
      studentChecked: [],
      switchImg: require('@/assets/hollysys/switch.png'),
      errorImg: require('@/assets/hollysys/error.png'),
      saveSnapshotImg: require('@/assets/hollysys/saveSnapshot.png'),
      automaticSnapshotImg: require('@/assets/hollysys/automaticSnapshot.png'),
      readSnapshotImg: require('@/assets/hollysys/readSnapshot.png'),
      saveConditonImg: require('@/assets/hollysys/saveCondition.png'),
      conditionCheckedImg: require('@/assets/hollysys/paperChecked.png')
    }
  },
  computed: {
    ...mapState({
      project: state => state.room.project,
      setting: state => state.room.setting
    })

  },
  mounted() {
    this.getList()
    this.getFault()
  },
  methods: {
    editCondition(item) {
      this.conditionEdit = item.name
      this.conditionDb = item.id
    },
    conditionChange(item) {
      capi.updateCond(item.id, this.conditionEdit, false).then(res => {
        this.$msg.success('修改工况成功')
        this.conditionDb = ''
        this.conditionList = []
        this.getList()
      }).catch(res => {
        this.conditionDb = ''
        this.$msg.error('修改工况失败')
      })
    },
    updataPage() {
      this.$forceUpdate()
    },
    // 搜索方法
    changeTxt(fifterTxt) {
      if (fifterTxt !== '') {
        this.newFaultList = []
        for (let i in this.faultList) {
          this.newFaultList.push({
            id: this.faultList[i].id,
            name: this.faultList[i].name,
            array: []
          })
        }
        for (let a in this.faultList) {
          for (let i in this.faultList[a].array) {
            let isAdd = this.faultList[a].array[i].name.indexOf(this.fifterTxt)
            if (isAdd !== -1) {
              this.newFaultList[a].array.push({
                name: this.faultList[a].array[i].name,
                pid: this.faultList[a].id,
                id: this.faultList[a].array[i].id,
                var: this.faultList[a].array[i].var,
                sort: this.faultList[a].array[i].sort,
                dataType: `${this.faultList[a].array[i].dataType == null ? `${this.faultList[a].array[i].target}` : 'ON'}`,
                delay: 0
              })
            }
          }
        }
      } else {
        this.newFaultList = this.faultList
      }
    },
    // 保存快照
    snapSave() {
      if (this.saving === true) {
        return
      }
      this.saving = true
      capi.saveSnapshot({}).then(res => {
        this.$msg.success('保存快照成功')
        this.readSnapShot()
      }).catch(err => {
        this.$msg.error(err, '保存快照失败')
      }).finally(() => {
        this.saving = false
      })
    },
    tickerChange(v) {
      this.config.ticker = v
      if (this.config.max < 64) {
        this.config.max = 64
      }
      capi.setSnapshotConfig(this.config)
    },
    // 回退快照
    backSnap(row) {
      this.$confirm('确定恢复快照: ' + row.id + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return capi.restoreSnapshot(row.id).then(() => {
          this.$msg.success('恢复快照成功')
        })
      })
    },
    // 确认修改故障数据
    editFaultConfirm() {
      for (let i in this.faultList) {
        if (this.faultList[i].id === this.faultIds[0]) {
          for (let j in this.faultList[i].array) {
            if (this.faultIds[1] === this.faultList[i].array[j].id) {
              console.log(this.delayRangeValue)
              this.faultList[i].array[j].dataType = this.faultRangeValue
              this.faultList[i].array[j].delay = this.delayRangeValue
            }
          }
        }
      }
      this.EditFaultdialogVisible = false
    },
    // 点击编辑故障
    editFault(val) {
      this.EditFaultdialogVisible = true
      this.tempFaultName = val.name
      this.faultRangeValue = val.dataType
      this.delayRangeValue = val.delay
      this.faultIds = [
        val.pid,
        val.id
      ]
    },
    // 下放故障
    async loadFault() {
      console.log(this.loadFaultList)
      let uniqueData = {}
      for (const key in this.info) {
        const item = this.info[key]
        uniqueData[item.i] = item
      }
      this.info = uniqueData
      for (let key in this.info) {
        let params = {
          'rubik.project': this.project,
          'rubik.model': 'model',
          'rubik.id': this.info[key].i
        }
        for (let i in this.loadFaultList) {
          let obj = {
            id: this.loadFaultList[i].id,
            name: this.loadFaultList[i].name,
            sort: this.loadFaultList[i].sort,
            ops: [{ var: this.loadFaultList[i].var, start: this.loadFaultList[i].delay * 1000, target: Number(this.loadFaultList[i].level * 100) }]
          }
          await fapi.starts(obj, params).then(() => {
            this.$msg.success(`投入故障${this.loadFaultList[i].name}成功`)
          }).catch(() => {
            this.$msg.error(`投入故障失败`)
          })
        }
      }
      this.faultDialogVisible = false

      this.loadFaultList = []
    },
    // 保存工况
    async saveCondition() {
      this.$store.dispatch('show_instances', { project: this.project, model: 'model', id: Object.values(this.info)[0]['i'] })
      let all = Object.values(this.info).map(async(item) => {
        return await capi.saveCond(item.uid.toString(), true)
      })
      Promise.all(all).then(() => {
        Object.values(this.info).map(async item => {
          return await capi.updateCond(item.uid.toString(), '', true).then(() => {
            this.$notify({
              title: '工况保存成功',
              type: 'success'
            })
          })
        })
      })
    },
    // 时间戳的转换
    operatingTime(time) {
      return moment(time * 1000).format('MM-DD HH:mm:ss')
    },
    // 快照列表
    readSnapShot() {
      let keys = Object.keys(this.info)
      let firstKey = keys[0]
      let iValue = this.info[firstKey].i
      this.readSnapShotdialogVisible = true
      this.$store.dispatch('show_instances', { project: this.project, model: 'model', id: iValue })
      capi.listSnapshot({}).then(res => {
        let snapshotList = []
        for (let i in res.items) {
          snapshotList.push(res.items[i])
          snapshotList.sort((a, b) => {
            return b.id - a.id
          })
        }
        this.snapshotList = snapshotList
      })
    },
    // 选中故障执行的函数
    handleSelectionChange(val) {
      this.loadFaultList = val
      console.log(this.loadFaultList)
    },
    // 切换下放故障标签
    switchTag(tab, event) {
      console.log(tab, event)
    },
    // 工况列表
    getList() {
      let items = []
      let item = []
      capi.listCond().then(res => {
        let list = res.items || {}
        for (let i in list) {
          list[i].edit = false
          items.push(list[i])
        }
        for (let index = 0; index < items.length; index++) {
          this.conditionList.push(items[index])
        }
      })
      capi.listCond(true).then(res => {
        let list = res.items || {}
        for (let i in list) {
          list[i].edit = false
          item.push(list[i])
        }
        for (let index = 0; index < item.length; index++) {
          this.persConditionList.push(item[index])
        }
      })
    },
    // 保存快照
    saveSnapshot() {
      for (let i in this.info) {
        this.$store.dispatch('show_instances', { project: this.project, model: 'model', id: this.info[i].i })
        let data = {
          name: this.snapshopName,
          describe: this.snapshopDesc
        }
        capi.saveSnapshot(data).then(res => {
          this.$msg.success('保存快照成功')
          console.log(res)
        })
      }
    },

    // 获取故障列表
    getFault() {
      papi.getFault(this.project).then(async res => {
        let list = res.list.items || {}
        for (let i in res.tree) {
          this.faultList.push({
            id: i,
            name: res.tree[i].name,
            seq: res.tree[i].seq,
            array: []
          })
        }
        for (let a of this.faultList) {
          for (let i in list) {
            if (list[i].sort === a.seq) {
              a.array.push({
                name: list[i].name,
                pid: a.id,
                id: list[i].id,
                var: list[i].ops[0].var,
                sort: list[i].sort,
                dataType: `${list[i].ops[0].dataType == null ? `${list[i].ops[0].target}` : 'ON'}`,
                hidden: false,
                show: true,
                delay: 0
              })
            }
          }
        }
        this.newFaultList = this.faultList
        console.log(this.newFaultList)
        console.log(621)
      }).catch(err => {
        console.log(err)
      })
    },

    checkedNull() {
      this.$msg.error('学员选择错误')
    },

    // 点击切换工况弹窗确认按钮-切换工况
    switchCondition(val) {
      this.conditionEdit = ''
      this.switchDialogVisible = false
      let params = {
        'rubik.project': this.project,
        'rubik.model': 'model',
        'rubik.id': Object.values(this.info)[0]['i']
      }
      capi.loadCond(val.id, false, params).then(() => {
        this.$notify({
          title: '工况投入成功',
          type: 'success'
        })
      })
    },
    // 点击切换工况弹窗确认按钮-切换工况
    switchConditions(val) {
      console.log(val)
      this.conditionEdit = ''
      this.switchDialogVisible = false
      let params = {
        'rubik.project': this.project,
        'rubik.model': 'model',
        'rubik.id': Object.values(this.info)[0]['i']
      }
      capi.loadCond(val.id, true, params).then(() => {
        this.$notify({
          title: '工况投入成功',
          type: 'success'
        })
      })
    },
    // 点击选中工况
    checkedCondition(item) {
      this.conditionCheckedID = item.id
    }
  }
}

</script>

<style scoped>
/* .optionBox {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  justify-items: center;
  align-content: start;
}

.pubBox{
  border: 1px solid #f1f1f1;
 background-color: antiquewhite;
 height: 265px;
 overflow-y: auto;
} */

.conditionCheckedImg{
  margin-top: 3px;
  float: right;
  height: 20px;
  width: 20px;
  line-height: 15px;
  margin-right: 40px;
  /* background-color: #5d88f7; */
}

.dialogTitle{
  flex: 18px;
  font-weight: bold;
}

/* .optionBox div {
  width: 90%;
  height: 8vh;
  border-radius: 6px;
  background: #f0f8fb;
  background-color: #697c9e;
  box-shadow: 0px 10px 0px 0px #50607d;
  transition: all .5s;
} */

.condName{
  font-size: 14px;
}

.conditionChecked{
  width: 100%;
  height: 30px;
  background-color: #f2f8fe;
  color: #6c94f8;
  line-height: 30px;
  font-size: 12px;
  padding-left: 13px;
  cursor: pointer;
}

.conditionNotChecked{
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  padding-left: 13px;
  cursor: pointer;
}

/* .opbox {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightgray;
  text-align: center;
  cursor: pointer;
}

.opbox img{
   height: 20px;
   width: 20px;
   margin-top: 20%;
}

.opbox span{
  font-size:10px;
  color: white;
} */

/* .conditionEdit{
  line-height: 30px;
   color:#6c94f8;
   float: right;
   height: 30px;
   width: 50%;
} */
/* .conditionEditInput{
  line-height: 30px;
  float: left;
  height: 30px;
  width: 50%;
} */
</style>
