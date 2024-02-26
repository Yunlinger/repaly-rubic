<template>
  <rubik-dialog
    title="搜索"
    width="680px"
    height="482px"
  >
    <el-input
      ref="input-key"
      v-model="skey"
      placeholder="input key"
      autofocus
      style="margin-bottom:8px;"
      @keyup.enter.native="doSearch"
    >
      <el-select slot="prepend" v-model="stype" placeholder="请选择" :popper-append-to-body="false">
        <el-option label="变量" value="var" />
        <el-option label="变量ID" value="varid" />
      </el-select>
      <el-button slot="append" icon="el-icon-search" @click="doSearch" />
    </el-input>
    <div class="result-container">
      <el-row v-if="stype=='var'||stype=='varid'" :gutter="24" style="margin-left: 0; margin-right: 0; ">
        <el-col :span="24" style="padding: 0;">
          <div style="margin: 1px;">
            <hot-table ref="tableOut" :settings="tableOutSettings" />
          </div>
          <div style="margin: 1px;">
            <hot-table ref="tableIn" :settings="tableInSettings" />
          </div>
        </el-col>
      </el-row>
    </div>
  </rubik-dialog>
</template>

<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import { HotTable } from '@handsontable/vue'
import 'handsontable/dist/handsontable.full.css'
import _ from 'lodash'
import * as mapi from '@/api/model'
import sb from '../sb'
const baseSetting = {
  data: [],
  stretchH: 'all',
  autoWrapRow: false,
  width: '100%',
  height: 360,
  maxRows: 4096,
  manualRowResize: false,
  manualColumnResize: true,
  rowHeaders: true,
  rowHeaderWidth: 30,
  manualRowMove: false,
  manualColumnMove: false,
  filters: false,
  colHeaders: [
    'name',
    'id',
    'index',
    'alg',
    'desc'
  ],
  columns: [
    {
      data: 'name',
      type: 'text',
      width: '20%',
      readOnly: true
    },
    {
      data: 'id',
      type: 'numeric',
      width: '10%',
      readOnly: true
    },
    {
      data: 'index',
      type: 'numeric',
      width: '10%',
      readOnly: true
    },
    {
      data: 'alg',
      type: 'text',
      width: '20%',
      readOnly: true
    },
    {
      data: 'desc',
      type: 'text',
      width: '40%',
      readOnly: true
    }
  ],
  fillHandle: false,
  selectionMode: 'single'
}
export default {
  name: 'VarDetail',
  components: { RubikDialog, HotTable },
  data() {
    return {
      stype: 'var',
      skey: '',
      varid: 0,
      vardetail: {},
      showSearchBar: false,
      selected: null,
      tableInSettings: {
        ... _.cloneDeep(baseSetting),
        afterOnCellMouseUp: this.afterOnInCellMouseUp
      },
      tableOutSettings: {
        ... _.cloneDeep(baseSetting),
        height: 56,
        afterOnCellMouseUp: this.afterOnOutCellMouseUp
      }
    }
  },

  mounted() {
    setTimeout(this.handleDialogClick, 200)
    this.doSearch()
    this.$nextTick(() => {
      this.$refs['input-key'].focus()
    })
  },

  methods: {
    doSearch() {
      this.$refs['tableIn'].hotInstance.render()
      this.$refs['tableOut'].hotInstance.render()
      switch (this.stype) {
        case 'var':
          this.skey && this.getDetailByName(this.skey)
          break
        case 'varid':
          this.skey && this.getVarDetail(this.skey)
          break
      }
    },
    getDetailByName(name) {
      this.$set(this.tableInSettings, 'data', [])
      this.$set(this.tableOutSettings, 'data', [])
      mapi.varGetDetailByName(name).then(res => {
        this.updateTable(res)
      }).catch(() => {})
      this.showSearchBar = false
    },
    getVarDetail(id) {
      this.$set(this.tableInSettings, 'data', [])
      this.$set(this.tableOutSettings, 'data', [])
      mapi.varGetDetail(id).then(res => {
        this.updateTable(res)
      }).catch(() => {})
    },
    updateTable(res) {
      this.vardetail = res || {}
      this.name = res.name
      this.varid = res.id
      res.defs = res.defs || []
      res.refs = res.refs || []
      for (const i in res.defs) {
        res.defs[i].index = res.defs[i].index || 0
      }
      for (const i in res.refs) {
        res.refs[i].index = res.refs[i].index || 0
      }
      this.$set(this.tableInSettings, 'data', res.refs)
      this.$set(this.tableOutSettings, 'data', res.defs)
    },
    afterOnInCellMouseUp(e, coords, td) {
      var dblclk = false
      var now = new Date()
      if (this.lastDownTime && now - this.lastDownTime < 256) {
        dblclk = true
      }
      this.lastDownTime = now
      if (!dblclk) {
        return
      }
      e.preventDefault()
      // 打开模块
      sb({
        bid: this.vardetail.refs[coords.row].id,
        selected: {
          port: 'in',
          index: this.vardetail.refs[coords.row].index
        }
      })
    },
    afterOnOutCellMouseUp(e, coords, td) {
      var dblclk = false
      var now = new Date()
      if (this.lastDownTime && now - this.lastDownTime < 256) {
        dblclk = true
      }
      this.lastDownTime = now
      if (!dblclk) {
        return
      }
      e.preventDefault()
      // 打开模块
      sb({
        bid: this.vardetail.defs[coords.row].id,
        selected: {
          port: 'out',
          index: this.vardetail.defs[coords.row].index
        }
      })
    }
  }
}
</script>

<style scopped>
.el-select .el-input {
  width: 70px;
}

.result-container {
  background-color: #f8f8f8;
  height: 424px;
  overflow: auto;
}
</style>
