<template>
  <rubik-dialog
    ref="dialog"
    left="200px"
    :width="(width + 6) + 'px'"
    :height="(height + 6) + 'px'"
  >
    <template #title>
      <span class="el-dialog__title rubik-dialog__title">
        {{ loading ? '正在加载...' : `${block.name} [ ${alg.name} - ${block.desc || alg.desc} ]` }}
      </span>
    </template>
    <template #buttons>
      <!-- 执行速率 -->
      <select
        v-model="tick"
        style="font-size: 12px; background-color: lightgray;"
        @change="onTickChange"
      >
        <template v-for="(option, idx) in tickOptions">
          <template>
            <option :key="idx" :value="option.value">
              {{ option.label }}
            </option>
          </template>
        </template>
      </select>
      <!-- 修改描述 -->
      <button
        type="button"
        class=" rubik-headerbtn"
        aria-label="Close"
        title="修改模块描述"
        @click="changeDesc"
      >
        <em class="el-dialog__close el-icon el-icon-edit" />
      </button>
      <!-- 定位按钮 -->
      <button
        type="button"
        class=" rubik-headerbtn"
        aria-label="Close"
        title="定位模块到图页"
        @click="gotoPage"
      >
        <em class="el-dialog__close el-icon el-icon-location" />
      </button>
      <!-- 模块运行冻结按钮 -->
      <button
        type="button"
        class=" rubik-headerbtn"
        aria-label="Close"
        title="运行/冻结"
        @click="switchBlockFrozen"
      >
        <em
          :class=" !frozen? 'el-icon-video-play' : 'el-icon-video-pause'"
          :style="{ color: !frozen?'#00BB00':'#BB0000' }"
          class="el-dialog__close el-icon"
        />
      </button>
      <!-- 变量名/描述切换按钮 -->
      <button
        type="button"
        class=" rubik-headerbtn"
        aria-label="Close"
        title="切换 变量名/描述"
        @click="switchShowPortDesc"
      >
        <em class="el-dialog__close el-icon el-icon-info" />
      </button>
      <!-- 全部关闭按钮 -->
      <button
        type="button"
        class=" rubik-headerbtn"
        aria-label="Close"
        title="关闭全部"
        @click="closeAll"
      >
        <em class="el-dialog__close el-icon el-icon-circle-close" />
      </button>
      <!-- 关闭按钮 -->
      <button
        type="button"
        class=" rubik-headerbtn"
        aria-label="Close"
        title="关闭"
        @click="close"
      >
        <em class="el-dialog__close el-icon el-icon-close" />
      </button>
    </template>
    <el-row :gutter="24" style="margin-left: 0; margin-right: 0; color: #FFF;">
      <el-col :span="9" style="padding: 0;background: #555555;">
        <div style="margin: 1px;">
          <hot-table :ref="`tableIn_${bid}`" :settings="tableInSettings" />
        </div>
      </el-col>
      <el-col :span="6" style="padding: 0;background: #555555;">
        <div style="margin: 1px;">
          <hot-table :ref="`tableCoef_${bid}`" :settings="tableCoefSettings" />
        </div>
      </el-col>
      <el-col :span="9" style="padding: 0;background: #555555;">
        <div style="margin: 1px;">
          <hot-table :ref="`tableOut_${bid}`" :settings="tableOutSettings" />
        </div>
      </el-col>
    </el-row>
  </rubik-dialog>
</template>
<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import Dialog from '@/components/Dialog'
import store from '@/store'
import router from '@/router'
import { HotTable } from '@handsontable/vue'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.css'
import _ from 'lodash'
import * as mapi from '@/api/model'
import * as rapi from '@/api/rtd'
import search from '../search'
import sb from './'

var showPortDesc = false
const defaultFontSize = '12px'
const baseSetting = {
  data: [],
  stretchH: 'all',
  autoWrapRow: false,
  width: '100%',
  height: 460,
  maxRows: 256,
  manualRowResize: false,
  manualColumnResize: true,
  rowHeaders: true,
  rowHeaderWidth: 30,
  manualRowMove: false,
  manualColumnMove: false,
  filters: false,
  // colHeaders: [
  //   'Var',
  //   'Value'
  // ],
  colHeaders: false,
  columns: [
    {
      data: 'name',
      type: 'text',
      width: '70%',
      wordWrap: false
    },
    {
      data: 'value',
      type: 'numeric',
      width: '30%',
      wordWrap: false
    }
  ],
  fillHandle: false,
  selectionMode: 'single'
}
export default {
  name: 'BlockEditor',
  components: { RubikDialog, HotTable },
  data() {
    return {
      loading: true,
      width: 910,
      height: 48,
      defaultFontSize: '12px',
      name: '',
      alg: {},
      block: {},
      bid: 0,
      selected: null,
      frozen: false,
      tick: 500,
      tickOptions: [
        { value: 10, label: '10 ms' },
        { value: 50, label: '50 ms' },
        { value: 100, label: '100 ms' },
        { value: 200, label: '200 ms' },
        { value: 500, label: '500 ms' },
        { value: 1000, label: '1 s' },
        { value: 2000, label: '2 s' },
        { value: 10000, label: '10 s' }
      ],
      showPortDesc: showPortDesc,
      timer: null,
      duration: 500,
      tableInSettings: {
        ... _.cloneDeep(baseSetting),
        afterChange: this.afterInChange,
        cells: this.inCellRender(),
        afterOnCellMouseUp: this.afterInOnCellMouseDown,
        rowHeaders: this.inHeaderRender
      },
      tableOutSettings: {
        ... _.cloneDeep(baseSetting),
        afterChange: this.afterOutChange,
        cells: this.outCellRender(),
        afterOnCellMouseUp: this.afterOutOnCellMouseDown,
        rowHeaders: this.outHeaderRender
      },
      tableCoefSettings: {
        ... _.cloneDeep(baseSetting),
        columns: [
          {
            data: 'desc',
            type: 'text',
            width: '60%',
            readOnly: true
          },
          {
            data: 'value',
            type: 'numeric',
            width: '40%',
            wordWrap: false
          }
        ],
        afterChange: this.afterCoefChange,
        afterOnCellMouseUp: this.afterCoefOnCellMouseDown,
        cells: this.coefCellRender()
      }
    }
  },

  mounted() {
    setTimeout(() => {
      this.getBlock()
      this.startTimer()
    }, 100)
  },

  methods: {
    close() {
      this.clearTimer()
      this.$refs.dialog.close()
    },

    closeAll() {
      Dialog.closeAll()
    },

    clearTimer() {
      this.timer && clearInterval(this.timer)
      this.$off('global:rtdb')
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.updateTableValue()
      }, 5000)
      this.$on('global:rtdb', () => {
        this.updateTableValue()
      })
    },

    setValue(name, value) {
      return rapi.setValue(name, value, 'debug')
    },

    getBlock() {
      var _this = this
      mapi.blockGet(this.bid).then(res => {
        this.loading = false
        if (!res) {
          return
        }

        this.$refs[`tableIn_${this.bid}`].hotInstance.render()
        this.$refs[`tableCoef_${this.bid}`].hotInstance.render()
        this.$refs[`tableOut_${this.bid}`].hotInstance.render()

        this.block = res
        this.name = res.name
        this.tick = res.tick
        // 清空表格
        this.$set(_this.tableInSettings, 'data', [])
        this.$set(_this.tableOutSettings, 'data', [])
        this.$set(_this.tableCoefSettings, 'data', [])
        // 获取alg
        this.alg = store.getters.algs[res.alg]
        if (!this.alg) {
          return
        }
        // 根据 alg 动态计算高度
        let line = 3
        if (this.alg.in) {
          let l = 0
          for (let i = 0; i < this.alg.in.length; i++) {
            l = l + 1
            if (this.alg.in[i].type > 0) {
              let bulk = store.getters.bulks[this.alg.in[i].type]
              if (bulk) {
                l = l + (bulk.items || []).length
              }
            }
          }
          line = Math.max(l, line)
        }
        if (this.alg.out) {
          let l = 0
          for (let i = 0; i < this.alg.out.length; i++) {
            l = l + 1
            if (this.alg.out[i].type > 0) {
              let bulk = store.getters.bulks[this.alg.out[i].type]
              if (bulk) {
                l = l + (bulk.items || []).length
              }
            }
          }
          line = Math.max(l, line)
        }
        if (this.alg.coef) {
          line = Math.max(this.alg.coef.length, line)
        }
        this.height = line * 24
        this.height = Math.min(this.height, document.body.clientHeight - 240)
        this.$set(_this.tableInSettings, 'height', this.height)
        this.$set(_this.tableOutSettings, 'height', this.height)
        this.$set(_this.tableCoefSettings, 'height', this.height)
        //
        var vars = []
        var di = []
        var i = 0
        for (i = 0; res.in && i < res.in.length; i++) {
          let portData
          if (res.in[i]) {
            portData = {
              ...res.in[i],
              value: typeof res.in[i].value === 'undefined' ? ((_this.alg && _this.alg.in[i].value) || '') : res.in[i].value,
              desc: _this.alg.in[i].desc
            }
            vars.push(res.in[i].name)
          } else {
            portData = { name: '', value: (_this.alg && _this.alg.in[i].value) || '', desc: _this.alg.in[i].desc }
          }
          portData.index = i
          portData.subIndex = 0
          di.push(portData)
          // 添加子变量
          if (res.in[i].items && res.in[i].items.length) {
            for (let j = 0; j < res.in[i].items.length; j++) {
              let portData
              let v = res.in[i].items[j]
              if (v) {
                portData = { ...v, value: v.value || 0 }
                vars.push(v.name)
              } else {
                portData = { name: '', value: 0 }
              }
              portData.index = i
              portData.subIndex = j + 1
              di.push(portData)
            }
          }
        }
        _this.$set(_this.tableInSettings, 'data', di)

        var dc = []
        for (i = 0; res.coef && i < res.coef.length; i++) {
          dc.push({ ...res.coef[i], value: res.coef[i].value || 0, desc: _this.alg.coef[i].desc })
          vars.push(res.coef[i].name)
        }
        _this.$set(_this.tableCoefSettings, 'data', dc)

        var dout = []
        for (i = 0; res.out && i < res.out.length; i++) {
          let portData
          if (res.out[i]) {
            portData = { ...res.out[i], value: res.out[i].value || 0, desc: _this.alg.out[i].desc }
            vars.push(res.out[i].name)
          } else {
            portData = { name: '', value: 0, desc: _this.alg.out[i].desc }
          }
          portData.index = i
          portData.subIndex = 0
          dout.push(portData)
          // 添加子变量
          if (res.out[i].items && res.out[i].items.length) {
            for (let j = 0; j < res.out[i].items.length; j++) {
              let portData
              let v = res.out[i].items[j]
              if (v) {
                portData = { ...v, value: v.value || 0 }
                vars.push(v.name)
              } else {
                portData = { name: '', value: 0 }
              }
              portData.index = i
              portData.subIndex = j + 1
              dout.push(portData)
            }
          }
        }
        _this.$set(_this.tableOutSettings, 'data', dout)

        // 刷新一次数据，以后靠实时数据更新事件刷新数据
        setTimeout(() => {
          _this.updateTableValue()
        }, 100)

        setTimeout(() => {
          if (this.selected) {
            if (this.selected.port === 'in') {
              this.$refs[`tableIn_${this.bid}`].hotInstance.selectCell(this.selected.index, 0)
            } else {
              this.$refs[`tableOut_${this.bid}`].hotInstance.selectCell(this.selected.index, 0)
            }
            // 取消选中, 防止刷新时又选中, 出现误操作.
            this.selected = null
          }
        }, 300)
      }).catch((err) => {
        console.error(err)
      })
    },
    gotoPage() {
      mapi.blockGetPage(this.bid).then(res => {
        router.push({
          path: '/engineer/model/edit/' + res.name,
          query: { selblk: this.bid }
        })
        this.$emit(`global:selblk`, { id: this.bid })
      })
    },
    afterOutChange(changes) {
      if (changes) {
        for (var change of changes) {
          if (change[3] === change[2]) {
            continue
          }
          if (change[1] === 'value') {
            if (change[3] === '') {
              change[3] = 0
            }
            this.setValue(this.tableOutSettings.data[change[0]].name, change[3])
          } else if (change[1] === 'name') {
            if (change[3] === '') {
              setTimeout(() => {
                this.tableOutSettings.data[change[0]].name = change[2]
              }, 1)
              return
            }
            let portData = this.tableOutSettings.data[change[0]]
            if (portData.subIndex === 0) {
              new Promise((resolve, reject) => {
                mapi.varGetDetailByName(change[3]).then((detail) => {
                  if (detail && detail.defs && detail.defs.length > 0) {
                    // 变量有定义，现在重复定义，提示一下。
                    this.$confirm(`变量 ${change[3]} 已经在模块 ${detail.defs[0].name} 的输出 ${detail.defs[0].index + 1} 定义，是否需要重复定义 ?`, '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(() => {
                      return resolve()
                    }).catch(() => {
                      return reject('取消')
                    })
                  } else if (detail && detail.refs && detail.refs.length > 0) {
                    // 变量存在但未定义，现在定义，提示一下
                    this.$confirm(`变量 ${change[3]} 已经在模块 ${detail.refs[0].name} 的输入 ${detail.refs[0].index + 1} 等 ${detail.refs.length} 处引用，是否需要定义 ?`, '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(() => {
                      return resolve()
                    }).catch(() => {
                      return reject('取消')
                    })
                  } else {
                    // 没有定义也没有引用的变量
                    return resolve()
                  }
                }).catch(() => {
                  // 变量不存在
                  return resolve()
                })
              }).then(() => {
                // 修改输出时确认一下.
                return this.$confirm(`修改输出变量 ${change[2]} => ${change[3]} ?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                })
              }).then(() => {
                return mapi.setOutVar(this.bid, portData.index, change[3])
              }).then(() => {
                this.getBlock()
                this.updateTableValue()
              }).catch(() => {
                setTimeout(() => {
                  let di = _.cloneDeep(this.tableOutSettings.data)
                  di[change[0]].name = change[2]
                  this.$set(this.tableOutSettings, 'data', di)
                }, 200)
              })
            } else {
              setTimeout(() => {
                this.tableOutSettings.data[change[0]].name = change[2]
              }, 1)
            }
          }
        }
      }
    },
    afterCoefChange(changes) {
      if (changes) {
        for (var change of changes) {
          if (change[3] === change[2]) {
            continue
          }
          if (change[1] === 'value') {
            if (change[3] === '') {
              change[3] = 0
            }
            // this.setValue(this.name + '/C#' + (change[0] + 1), change[3])
            mapi.setCoef(this.bid, change[0], change[3])
          }
        }
      }
    },
    afterInChange(changes) {
      if (changes) {
        for (var change of changes) {
          if (change[3] === change[2]) {
            continue
          }
          if (change[1] === 'value') {
            if (change[3] === '') {
              change[3] = 0
            }
            this.setValue(this.tableInSettings.data[change[0]].name, change[3])
          } else if (change[1] === 'name') {
            let portData = this.tableInSettings.data[change[0]]
            if (portData.subIndex === 0) {
              mapi.setInVar(this.bid, portData.index, change[3]).then(() => {
                this.getBlock()
                this.updateTableValue()
              }).catch(() => {
                setTimeout(() => {
                  let di = _.cloneDeep(this.tableInSettings.data)
                  di[change[0]].name = change[2]
                  this.$set(this.tableInSettings, 'data', di)
                }, 200)
              })
            } else {
              setTimeout(() => {
                this.tableInSettings.data[change[0]].name = change[2]
              }, 1)
            }
          }
        }
      }
    },
    updateTableValue() {
      var _this = this
      var i = 0
      for (i = 0; i < _this.tableInSettings.data.length; i++) {
        if (_this.tableInSettings.data[i].name) {
          let value = rapi.getValue(_this.tableInSettings.data[i].name)
          if (value !== false) {
            _this.tableInSettings.data[i].value = value
          }
        } else {
          _this.tableInSettings.data[i].value = ''
        }
      }

      for (i = 0; i < _this.tableCoefSettings.data.length; i++) {
        let value = rapi.getValue(_this.name + '/C#' + (i + 1))
        if (value !== false) {
          _this.tableCoefSettings.data[i].value = value
        }
      }

      for (i = 0; i < _this.tableOutSettings.data.length; i++) {
        let value = rapi.getValue(_this.tableOutSettings.data[i].name)
        if (value !== false) {
          _this.tableOutSettings.data[i].value = value
        }
      }
      // 获取运行状态
      let frozen = rapi.getValue(_this.name + '/$FROZEN')
      if (frozen !== false) {
        _this.frozen = (frozen === 1)
      }
    },
    switchShowPortDesc() {
      this.showPortDesc = !this.showPortDesc
      showPortDesc = this.showPortDesc
      // this.tableInSettings.columns[0].data = this.tableOutSettings.columns[0].data = this.showPortDesc ? 'desc' : 'name'
      // this.tableInSettings.columns[0].readOnly = this.tableOutSettings.columns[0].readOnly = this.showPortDesc
      this.$refs[`tableIn_${this.bid}`].hotInstance.render()
      this.$refs[`tableCoef_${this.bid}`].hotInstance.render()
      this.$refs[`tableOut_${this.bid}`].hotInstance.render()
    },
    switchBlockFrozen() {
      this.setValue(this.name + '/$FROZEN', this.frozen ? 0 : 1)
    },
    inCellRender() {
      var _this = this
      return function(row, col) {
        var cellProperties = {}
        if (col === 0) {
          cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
            let pdata = _this.tableInSettings.data[row]
            if (_this.showPortDesc) {
              if (!value) {
                // 没有变量
                td.style.color = '#ccc'
              }
              if (pdata.subIndex > 0) {
                value = '-' + store.getters.bulks[_this.alg.in[pdata.index].type].items[pdata.subIndex - 1].desc || ''
              } else {
                value = _this.alg.in[pdata.index].desc || pdata.name
                if (_this.alg.in[pdata.index].type) {
                  let bulkName = store.getters.bulks[_this.alg.in[pdata.index].type].name
                  value = (value || '') + ' [' + bulkName + ']'
                }
              }
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else if (_this.alg.in[pdata.index].type && pdata.subIndex === 0) {
              if (!value) {
                value = _this.alg.in[pdata.index].desc
                td.style.color = '#fff'
              }
              let bulkName = store.getters.bulks[_this.alg.in[pdata.index].type].name
              value = (value || '') + ' [' + bulkName + ']'
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else if (pdata.subIndex > 0) {
              if (!value) {
                value = store.getters.bulks[_this.alg.in[pdata.index].type].items[pdata.subIndex - 1].desc || ''
              }
              value = '-  ' + value
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else {
              if (!value) {
                value = _this.alg.in[pdata.index].desc
                // 无变量变灰
                td.style.color = '#CCC'
                Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
              } else {
                Handsontable.renderers.TextRenderer.apply(this, arguments)
              }
            }
            if (_this.tableInSettings.data[row].def) {
              td.style.color = 'rgb(103, 194, 58)'
              if (_this.showPortDesc) {
                td.style.color = 'rgb(148, 196, 30)'
              }
              td.style.fontWeight = 'bold'
            } else {
              if (_this.showPortDesc) {
                td.style.color = '#E5DA9E'
                if (!_this.alg.in[pdata.index].desc && pdata.name) {
                  td.style.color = '#FFF'
                }
              }
            }
            if (pdata.subIndex > 0) {
              td.style.fontStyle = 'italic'
            }
            td.style.backgroundColor = '#555555'
            td.style.fontSize = pdata.subIndex > 0 ? '11px' : defaultFontSize
          }
        } else if (col === 1) {
          cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
            let pdata = _this.tableInSettings.data[row]
            if (value === '') {
              value = _this.alg.in[pdata.index].value || 0
              td.style.color = '#ccc'
              Handsontable.renderers.NumericRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else {
              Handsontable.renderers.NumericRenderer.apply(this, arguments)
            }
            td.style.backgroundColor = '#555555'
            td.style.fontSize = defaultFontSize
          }
        }
        return cellProperties
      }
    },
    outCellRender() {
      var _this = this
      return function(row, col) {
        var cellProperties = {}
        if (col === 0) {
          cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
            let pdata = _this.tableOutSettings.data[row]
            if (_this.showPortDesc) {
              if (pdata.subIndex > 0) {
                value = '-' + store.getters.bulks[_this.alg.out[pdata.index].type].items[pdata.subIndex - 1].desc || ''
              } else {
                // 没有描述时显示变量
                value = _this.alg.out[pdata.index].desc || pdata.name
                if (_this.alg.out[pdata.index].type) {
                  let bulkName = store.getters.bulks[_this.alg.out[pdata.index].type].name
                  value = (value || '') + ' [' + bulkName + ']'
                }
              }
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else if (_this.alg.out[pdata.index].type && pdata.subIndex === 0) {
              let bulkName = store.getters.bulks[_this.alg.out[pdata.index].type].name
              value = (value || '') + ' [' + bulkName + ']'
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else if (pdata.subIndex > 0) {
              if (!value) {
                value = store.getters.bulks[_this.alg.out[pdata.index].type].items[pdata.subIndex - 1].desc || ''
              }
              value = '-  ' + value
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties])
            } else {
              Handsontable.renderers.TextRenderer.apply(this, arguments)
            }
            // 描述 引用绿色 未引用黄色
            if (_this.tableOutSettings.data[row].ref) {
              td.style.color = 'rgb(103, 194, 58)'
              if (_this.showPortDesc) {
                td.style.color = 'rgb(148, 196, 30)'
              }
              td.style.fontWeight = 'bold'
            } else {
              if (_this.showPortDesc) {
                td.style.color = '#E5DA9E'
                if (!_this.alg.out[pdata.index].desc && pdata.name) {
                  td.style.color = '#FFF'
                }
              }
            }
            if (pdata.subIndex > 0) {
              td.style.fontStyle = 'italic'
            }
            td.style.fontSize = pdata.subIndex > 0 ? '11px' : defaultFontSize
            td.style.backgroundColor = '#555555'
          }
        } else if (col === 1) {
          cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.NumericRenderer.apply(this, arguments)
            td.style.fontSize = defaultFontSize
            td.style.backgroundColor = '#555555'
          }
        }
        return cellProperties
      }
    },
    coefCellRender() {
      var _this = this
      return function(row, col) {
        var cellProperties = {}
        var data = this.instance.getData()
        if (col === 0) {
          cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.NumericRenderer.apply(this, arguments)
            td.style.color = '#000'
            if (data[row][col] !== (_this.alg.coef[row].value || 0)) {
              td.style.color = '#FFF'
            }
            td.style.backgroundColor = '#555555'
            td.style.fontSize = defaultFontSize
          }
        }
        if (col === 1) {
          cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.NumericRenderer.apply(this, arguments)
            if (data[row][col] !== (_this.alg.coef[row].value || 0)) {
              td.style.color = '#FFF'
              td.style.fontWeight = 'bold'
            }
            td.style.backgroundColor = '#555555'
            td.style.fontSize = defaultFontSize
          }
        }
        return cellProperties
      }
    },
    afterOutOnCellMouseDown(e, coords, td) {
      var dblclk = false
      var now = new Date()
      if (this.lastDownTime && now - this.lastDownTime < 256) {
        dblclk = true
      }
      this.lastDownTime = now
      if (!dblclk) {
        return
      }
      let hotInstance = this.$refs[`tableOut_${this.bid}`].hotInstance
      const editor = hotInstance.getActiveEditor()
      if (editor && editor.TEXTAREA.nodeName === 'TEXTAREA') {
        const editorDom = editor.TEXTAREA
        editorDom.style.color = '#FFF200' // 设置字体颜色为亮黄色
      }
      if (coords.col === -1) { // header
        e.preventDefault()
        // 打开引用模块
        let portData = this.tableOutSettings.data[coords.row]
        if (portData.id) {
          mapi.varGetDetail(portData.id).then(res => {
            if (res.refs && res.refs.length === 1) {
              // 单引用
              sb({
                bid: res.refs[0].id,
                selected: {
                  port: 'in',
                  index: res.refs[0].index || 0
                }
              })
            } else {
              // 多引用
              search({
                stype: 'varid',
                skey: portData.id
              })
            }
          }).catch(() => {})
        }
      }
    },
    afterInOnCellMouseDown(e, coords, td) {
      var dblclk = false
      var now = new Date()
      if (this.lastDownTime && now - this.lastDownTime < 256) {
        dblclk = true
      }
      this.lastDownTime = now
      if (!dblclk) {
        return
      }
      let hotInstance = this.$refs[`tableIn_${this.bid}`].hotInstance
      const editor = hotInstance.getActiveEditor()
      if (editor && editor.TEXTAREA.nodeName === 'TEXTAREA') {
        const editorDom = editor.TEXTAREA
        editorDom.style.color = '#FFF200' // 设置字体颜色为亮黄色
      }
      if (coords.col === -1) { // header
        e.preventDefault()
        // 打开定义模块
        let portData = this.tableInSettings.data[coords.row]
        if (portData.id) {
          mapi.varGetDetail(portData.id).then(res => {
            if (res.defs && res.defs.length === 1) {
              sb({
                bid: res.defs[0].id,
                selected: {
                  port: 'out',
                  index: res.defs[0].index || 0
                }
              })
            } else {
              // 多定义
              search({
                stype: 'varid',
                skey: portData.id
              })
            }
          }).catch(() => {})
        } else if (portData.subIndex === 0) {
          // 双击定义黑变量
          let v = this.name
          if (this.alg.in[portData.index].name) {
            v = `${this.name}_${this.alg.in[portData.index].name}`
          } else {
            v = `${this.name}_IN${portData.index + 1}`
          }
          mapi.setInVar(this.bid, portData.index, v).then(() => {
            this.getBlock()
          })
        }
      }
    },
    afterCoefOnCellMouseDown(e, coords, td) {
      let hotInstance = this.$refs[`tableCoef_${this.bid}`].hotInstance
      const editor = hotInstance.getActiveEditor()
      if (editor && editor.TEXTAREA.nodeName === 'TEXTAREA') {
        const editorDom = editor.TEXTAREA
        editorDom.style.color = '#FFF200' // 设置字体颜色为亮黄色
      }
    },
    outHeaderRender(row) {
      let pdata = this.tableOutSettings.data[row]
      return `<span>${pdata.index + 1}${pdata.subIndex ? ('.' + pdata.subIndex) : ''}</span>`
    },
    inHeaderRender(row) {
      let pdata = this.tableInSettings.data[row]
      return `<span>${pdata.index + 1}${pdata.subIndex ? ('.' + pdata.subIndex) : ''}</span>`
    },
    onTickChange() {
      mapi.setTick(this.bid, this.tick).catch(() => {})
    },
    async changeDesc() {
      try {
        let { value } = await this.$prompt('请输入模块描述', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: this.block.desc
        })
        await mapi.setDesc(this.bid, value)
        this.getBlock()
      } catch (err) {
        if (err !== 'cancel') {
          this.$msg.error(err)
        }
      }
    }
  }
}
</script>

<style lang="scss" scopped>
.rubik-dialog__body {
  padding: 2px;
}
.rubik-dialog__title {
  font-size: 14px;
}
.rubik-headerbtn {
  display: inline-block;
  position: relative;
  top: 0;
  right: 0;
  padding: 4px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  color: #909399;

  :hover {
    color:#409EFF
  }
}
</style>
