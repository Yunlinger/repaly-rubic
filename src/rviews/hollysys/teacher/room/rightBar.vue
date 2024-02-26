<template>
  <div style="height: 100%;">
    <div style="width: 23px;float: left;height: 100vh;">
      <div style="font-size: 22px;height:60px ; background-color: #cac8c8;border-radius: 4px;line-height: 60px;position: absolute;top:35vh;cursor: pointer;" @click="changeRightbar">
        <i :class="{ 'rotated': !changeRight }" class="el-icon-arrow-right"></i>
      </div>
    </div>
    <div style="width: calc(100% - 23px); float: right;">
      <el-tabs v-show="Object.values(info).length>=1 && changeRight" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="工况" name="first">
          <div>
            <button style="border: none;outline: none;background-color: #5d88f8;color: white;border-radius: 4px;padding: 6px 15px;position: absolute;z-index: 999;right: 5%;top: .5vh;cursor: pointer;" @click="reCondition"><i class="el-icon-refresh icon-button" /></button>
            <el-tabs v-model="activeNamee" type="border-card">
              <el-tab-pane label="公有工况" name="first">
                <div ref="pubCondition" style="width: 100%;height:calc(100vh - 200px);overflow: auto;">
                  <el-table
                    :show-header="false"
                    :border="true"
                    :data="conditionList"
                    highlight-current-row
                    class="custom-table"
                  >
                    <el-table-column
                      prop="id"
                      aligen="center"
                      width="40"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="name"
                      label="工况名称"
                    >
                    </el-table-column>
                    <el-table-column
                      width="40"
                      label="操作"
                    >
                      <template slot-scope="scope">
                        <!-- <el-button type="text" size="small" @click="switchCondition(scope.row)">加载</el-button> -->
                        <el-button slot="reference" type="success" @click="switchCondition(scope.row)"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                      <!-- <el-button v-if="scope.row.id>20" type="text" @click="saveCondition(scope.row)">保存</el-button> -->

                      </template>
                    </el-table-column>
                  </el-table>
                </div>

              </el-tab-pane>
              <el-tab-pane label="私有工况" name="second">
                <div ref="perCondition" style="width: 100%;height:calc(100vh - 200px);overflow: auto;">
                  <el-table
                    :show-header="false"
                    :border="true"
                    highlight-current-row
                    :data="persConditionList"
                  >

                    <el-table-column
                      prop="id"
                      width="40"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="name"
                    >
                    </el-table-column>
                    <el-table-column
                      width="40"
                    >
                      <template slot-scope="scope">
                        <el-button slot="reference" type="success" @click="switchCondition(scope.row)"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                      <!-- <el-button type="text" @click="perSaveCondition(scope.row)">保存</el-button> -->
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

            </el-tabs>
          </div>
        </el-tab-pane>
        <el-tab-pane label="故障" name="second">
          <div>
            <input
              v-model="fifterTxt"
              placeholder="输入关键字进行过滤"
              style="width: 75%;height: 30px;border: none;background-color: #bacaf161;font-size: 14px;padding-left: 10px;margin-bottom: 4px;border-radius: 4px;"
              @input="changeTxt(fifterTxt)"
            />
            <button style="border: none;outline:none;border-radius:0;background: #67c23a;cursor: pointer;padding: 6px 12px;border-radius: 4px;color: white;margin-left: 10px;" @click="updateTree()"><i class="el-icon-refresh icon-button" /></button>
            <el-tabs v-if="!fifterTxt" v-model="activeNameee" type="border-card">
              <el-tab-pane v-for="item,index in faultList" :key="index" :label="item.name" :name="item.id">
                <div ref="fault" style="width: 100%;height:calc(100vh - 245px);overflow: auto;">
                  <el-table
                    :show-header="false"
                    highlight-current-row
                    :data="item.array"
                  >
                    <el-table-column width="30" prop="index" align="center">
                    </el-table-column>
                    <el-table-column prop="name">
                    </el-table-column>
                    <el-table-column width="90" align="center">
                      <template slot-scope="scope">
                        <el-select v-if="scope.row.dataType!='ON'" v-model="scope.row.dataType" :width="60" placeholder="程度" @change="changeFaultRange">
                          <el-option
                            v-for="items in faultRange"
                            :key="items.value"
                            :label="items.text"
                            :value="items.value"
                          >
                          </el-option>
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column width="40" align="center" label="操作">
                      <template slot-scope="scope">
                        <div>
                          <span>
                            <el-popconfirm
                              title="确定投入故障？"
                              @onConfirm="loadFault(scope.row)"
                            >
                              <el-button slot="reference" type="success"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                            </el-popconfirm>
                          </span>
                        </div>
                      <!-- <el-button type="text" @click="loadFault(scope.row)">投入</el-button> -->
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
            <div v-else>
              <div ref="faults" style="width: 100%;height:calc(100vh - 190px);overflow: auto;">
                <el-table
                  :show-header="false"
                  highlight-current-row
                  :data="newFaultList"
                >
                  <el-table-column width="30" prop="index" align="center">
                  </el-table-column>
                  <el-table-column prop="name">
                  </el-table-column>
                  <el-table-column width="90">
                    <template slot-scope="scope">
                      <el-select v-if="scope.row.dataType!='ON'" v-model="scope.row.dataType" :width="60" placeholder="程度" @change="changeFaultRange">
                        <el-option
                          v-for="items in faultRange"
                          :key="items.value"
                          :label="items.text"
                          :value="items.value"
                        >
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column width="40" align="center" label="操作">
                    <template slot-scope="scope">
                      <div>
                        <span>
                          <el-popconfirm
                            title="确定投入故障？"
                            @onConfirm="loadFault(scope.row)"
                          >
                            <el-button slot="reference" type="success"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                          </el-popconfirm>
                        </span>
                      </div>
                    <!-- <el-button type="text" @click="loadFault(scope.row)">投入</el-button> -->
                    </template>
                  </el-table-column>
                </el-table>
              </div>

            </div>

          </div>

        </el-tab-pane>
        <el-tab-pane v-show="disOrhidd(info)" label="快照" name="third">
          <div>
            <button style="border: none;outline:none;border-radius:0;background: #67c23a;cursor: pointer;padding: 6px 12px;border-radius: 4px;color: white;margin-left: 4px;margin-right: 4px;"><i class="el-icon-refresh icon-button" @click="reSnap()" /></button>
            <el-select v-model="config.ticker" @change="tickerChange">
              <el-option key="1" label="1分钟" :value="1" />
              <el-option key="2" label="2分钟" :value="2" />
              <el-option key="5" label="5分钟" :value="5" />
              <el-option key="10" label="10分钟" :value="10" />
            </el-select>
            <button style="border: none;outline:none;border-radius:0;background: #5d88f8;cursor: pointer;padding: 6px 12px;border-radius: 4px;font-size: 14px;color: white;" @click="snapSave()">保存快照</button>
            <div ref="snaShot" style="width: 100%;height:calc(100vh - 190px);overflow: auto;">
              <el-table
                :data="snapshotList"
                :show-header="false"
                highlight-current-row
                :border="true"
              >
                <el-table-column
                  prop="id"
                  label="快照名称"
                  align="center"
                  width="90"
                >
                </el-table-column>

                <el-table-column
                  align="center"
                  label="保存时间"
                >
                  <template slot-scope="scope">
                    <span :style="{color: scope.row.name === 'auto save' ? 'black' : 'green'}">{{ operatingTime(scope.row.created) }}</span>
                  </template>
                </el-table-column>
                <el-table-column width="80" align="center">
                  <template slot-scope="{ row }">
                    <el-button type="text" size="small" @click="backSnap(row)">恢复</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div v-show="Object.values(info).length<1 && changeRight">
        <h3>请选择要操作的学员</h3>
        <img :src="noStu" alt="1" style="width: 80%;margin: 20px auto;display: block;">
      </div>
    </div>

    <el-dialog
      :visible.sync="EditFaultdialogVisible"
      width="22%"
    >
      <p style="font-size: 18px;">{{ tempFaultName }}</p>
      <div style="height: 10vh;">
        <div style="margin-bottom: 20px;margin-left: 10px;">
          <span style="margin-right: 14px;color: #939698;">故障程度:</span>
          <el-select v-if="faultRangeValue !='ON'" v-model="faultRangeValue" :width="60" placeholder="程度">
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
import moment from 'moment'
import { mapState } from 'vuex'
import * as papi from '@/api/project'
import * as capi from '@/api/condition'
import * as fapi from '@/api/fault'
export default {
  name: 'RightBar',
  props: {
    info: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      noStu: require('@/assets/hollysys/noStu.svg'),
      hide: require('@/assets/hollysys/hide.png'),
      tableRowIndex: 0,
      newFaultList: [],
      faultList: [],
      EditFaultdialogVisible: false,
      tempFaultName: '',
      fifterTxt: '',
      activeName: 'first',
      snapshotList: [],
      activeNamee: 'first',
      loadFaultList: [],
      activeNameee: '1',
      conditionList: [],
      s: '',
      faultIds: [],
      config: {
        max: 64,
        ticker: 2
      },
      delayRangeValue: '',
      saving: false,
      changeRight: true,
      faultRangeValue: '',
      persConditionList: [],
      maxListCount: 128,
      personal: false,
      uniqueData: {},
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
      ]
    }
  },
  computed: {
    // store/room 教室配置文件全局保存
    ...mapState({
      project: state => state.room.project,
      setting: state => state.room.setting
    })
  },
  mounted() {
    this.getList()
    this.getFault()
    this.getPersonList()
  },
  methods: {
    changeRightbar() {
      this.changeRight = !this.changeRight
      this.$parent.rightBarHiden()
    },
    disOrhidd(val) {
      for (const key in val) {
        const iValue = val[key].i
        if (!(iValue in this.uniqueData)) {
          this.uniqueData[iValue] = val[key]
        }
      }
      if (Object.values(this.uniqueData).length > 1) {
        return false
      } else {
        return true
      }
    },
    // 刷新工况
    reCondition() {
      this.persConditionList = []
      this.conditionList = []
      this.getList()
      this.getPersonList()
    },
    // 刷新快照
    reSnap() {
      this.snapshotList = []
      this.readSnapShot()
    },
    // 刷新故障
    updateTree() {
      this.faultList = []
      this.getFault()
    },

    changeFaultRange(val) {
      this.faultRangeValue = val
    },
    getName(val) {
      console.log(val)
      if (val.dataType === 'ON') {
        return '开关'
      } else {
        return '程度'
      }
    },
    handleClick(tab, event) {
      if (tab.label === '快照') {
        this.readSnapShot()
      }
    },

    // 时间戳的转换
    operatingTime(time) {
      return moment(time * 1000).format('MM-DD HH:mm:ss')
    },
    // 快照列表
    readSnapShot() {
      if (Object.values(this.uniqueData).length === 1) {
        let keys = Object.keys(this.info)
        let firstKey = keys[0]
        let iValue = this.info[firstKey].i
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
      } else {
        this.$notify.error({
          title: '错误',
          message: '请正确选取学员'
        })
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
      this.snapshotList = []
      this.readSnapShot()
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
    // // 选中故障执行的函数
    // handleSelectionChange(val) {
    //   this.loadFaultList = val
    //   console.log(this.loadFaultList)
    // },
    // 下放故障
    async loadFault(val) {
      console.log(val)
      for (let key in this.info) {
        let params = {
          'rubik.project': this.project,
          'rubik.model': 'model',
          'rubik.id': this.info[key].i
        }

        let obj = {
          id: val.id,
          name: val.name,
          sort: val.sort,
          ops: [{ var: val.var, start: 0, target: Number(val.level * 100) }]
        }
        await fapi.starts(obj, params).then(() => {
          this.$msg.success(`投入故障${val.name}成功`)
          this.faultDialogVisible = false
        }).catch((err) => {
          this.$msg.error(err)
          this.faultDialogVisible = false
        })

        // for (let i in this.loadFaultList) {
        //   let obj = {
        //     id: this.loadFaultList[i].id,
        //     name: this.loadFaultList[i].name,
        //     sort: this.loadFaultList[i].sort,
        //     ops: [{ var: this.loadFaultList[i].var, start: this.loadFaultList[i].delay * 1000, target: Number(this.loadFaultList[i].level * 100) }]
        //   }
        //   await fapi.starts(obj, params).then(() => {
        //     this.$msg.success(`投入故障${this.loadFaultList[i].name}成功`)
        //     this.faultDialogVisible = false
        //   }).catch((err) => {
        //     this.$msg.error(err)
        //     this.faultDialogVisible = false
        //   })
        // }
      }
      // this.loadFaultList = []
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
    // 搜索方法
    changeTxt(fifterTxt) {
      if (fifterTxt !== '') {
        let count = 1
        this.newFaultList = []
        for (let a in this.faultList) {
          for (let i in this.faultList[a].array) {
            let isAdd = this.faultList[a].array[i].name.indexOf(this.fifterTxt)
            if (isAdd !== -1) {
              this.newFaultList.push({
                index: count,
                name: this.faultList[a].array[i].name,
                pid: this.faultList[a].id,
                id: this.faultList[a].array[i].id,
                var: this.faultList[a].array[i].var,
                sort: this.faultList[a].array[i].sort,
                dataType: `${this.faultList[a].array[i].dataType !== 'ON' ? `${this.faultList[a].array[i].dataType}` : 'ON'}`,
                delay: 0
              })
              count += 1
            }
          }
        }
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
              let index = a.array.length + 1
              a.array.push({
                index: index,
                name: list[i].name,
                pid: a.id,
                id: list[i].id,
                var: list[i].ops[0].var,
                sort: list[i].sort,
                dataType: `${list[i].ops[0].dataType == null ? `${list[i].ops[0].target}` : 'ON'}`,
                delay: 0
              })
            }
          }
        }
        this.newFaultList = this.faultList
      }).catch(err => {
        console.log(err)
      })
    },
    // 点击切换工况弹窗确认按钮-切换工况
    switchCondition(val) {
      this.conditionEdit = ''
      this.switchDialogVisible = false
      let uniqueData = {}
      for (const key in this.info) {
        const item = this.info[key]
        uniqueData[item.i] = item
      }
      let info = uniqueData
      let all = Object.values(info).map(async(i) => {
        let params = {
          'rubik.project': this.project,
          'rubik.model': 'model',
          'rubik.id': i.i
        }
        this.loading = this.$loading({
          lock: true,
          text: `正在载入工况`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return await capi.loadCond(val.id, false, params)
      })

      Promise.all(all).then(() => {
        this.loading.close()
        this.$notify({
          title: '工况载入成功',
          type: 'success'
        })
      })
    },
    // 公有工况列表
    getList() {
      let items = []
      capi.listCond().then(res => {
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
        this.conditionList = newarr
      })
    },
    // 私有工况列表
    getPersonList() {
      let ite = []
      let personal = true
      capi.listCond(personal).then(res => {
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
        this.persConditionList = newarr
      })
    },
    // 保存工况
    saveCondition(row) {
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return capi.saveCond(row.id, false)
      }).then(() => {
        this.getList()
        this.$msg.success(row.id, '保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    perSaveCondition(row) {
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return capi.saveCond(row.id, true)
      }).then(() => {
        this.getPersonList()
        this.$msg.success(row.id, '保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    updataPage() {
      console.log(4444)
      this.$forceUpdate()
    }

  }
}
</script>
<style>
.rotated {
  transform: rotate(180deg);
  transition: transform .6s;
}
.el-table--mini th, .el-table--mini td {
    padding: 0;
}
.el-tabs--border-card > .el-tabs__content {
  padding: 5px;
}
.rightData{
  height: calc(95vh - 120px);
}
.el-button--mini {
    padding: 5px 7px;
    font-size: 9px;
    border-radius: 3px;
}
.cell{
  padding-left: 0px;
}
.el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 23px;
    padding-left: 4px;
    padding-right: 0px;
}
.el-select .el-input {
    width: 80px;
}
.el-tabs__header {
    padding: 0;
    position: relative;
    margin: 0px 14px 4px;
}
.el-table__body tr.current-row > td {
    background-color: #8ca2fffa;
}
.el-table tbody tr:hover>td {
            background-color:#8ca2fffa !important;
        }

</style>
