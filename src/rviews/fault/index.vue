<template>
  <div class="faultList">
    <div class="menu">
      <el-select v-model="selectIndex" placeholder="请选择" @change="changeSelect">
        <el-option
          v-for="(item, index) in nodes"
          :key="item.id"
          :label="item.name"
          :value="index"
        >
        </el-option>
      </el-select>
      <el-input v-model="filterInput" placeholder="搜索关键字" style="margin-left: 20px;"></el-input>
      <el-button :loading="downLoading" type="primary" style="margin-left: 15px;" @click="exportsExcel">导出Excel</el-button>
      <el-button :loading="downLoading" type="primary" style="margin-left: 15px;" @click="handleUpload">导入Excel</el-button>
      <el-button :loading="listLoading" type="danger" style="margin-left: 15px;" @click="deleteFault">删除全部故障</el-button>
      <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
    </div>

    <div ref="tableView" class="tableView">
      <vxe-grid
        ref="xTable"
        border
        resizable
        show-overflow
        class="my-grid88"
        :height="tableHeight"
        :scroll-y="{mode: 'default'}"
        :loading="listLoading"
        :columns="tableColumn"
        :edit-config="{trigger: 'click', mode: 'cell'}"
        :menu-config="tableMenu"
        @menu-click="contextMenuClickEvent"
      >
      </vxe-grid>
    </div>
  </div>
</template>

<script>
import XLSX from 'xlsx'
import * as api from '@/api/fault'
import * as rdbapi from '@/api/rtd'
import { mapGetters } from 'vuex'
import tableItem from './setting.vue'
import { parseTime } from '@/utils'

export default {
  name: 'FaultEdit',
  props: {
    editable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      listLoading: false,
      downLoading: false,
      currentNode: null,
      nodes: [],
      selectIndex: 0,
      selectDate: [],
      filterInput: '',
      filterDate: [],
      tableHeight: 500,
      tableColumn: [
        { type: 'seq', width: 50 },
        {
          field: '',
          title: '名称',
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='名称' />
            }
          }
        },
        {
          field: '',
          title: '变量',
          width: 120,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='变量' />
            }
          }
        },
        {
          field: '',
          title: '变量类型',
          width: 120,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='变量类型' />
            }
          }
        },
        {
          field: '',
          title: '目标值',
          width: 80,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='目标值' />
            }
          }
        },
        {
          field: '',
          title: '当前值',
          width: 80,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='当前值' />
            }
          }
        },
        {
          field: '',
          title: '延时时间(ms)',
          width: 120,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='延时时间' />
            }
          }
        },
        {
          field: '',
          title: '渐变时间(ms)',
          width: 120,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='渐变时间' />
            }
          }
        },
        {
          field: '',
          title: '保持时间(ms)',
          width: 120,
          slots: {
            default: ({ row }) => {
              return <tableItem row={row} title='保持时间' />
            }
          }
        }
      ],
      tableMenu: {
        className: 'my-menus',
        // header: {
        //   options: [
        //     [
        //       { code: 'exportAll', name: '导出所有.csv' }
        //     ]
        //   ]
        // },
        body: {
          options: [
            [
              { code: 'refresh', name: '刷新', prefixIcon: 'vxe-icon-refresh' }
            ],
            [
              { code: 'edit', name: '修改', prefixIcon: 'vxe-icon-edit' }
            ],
            [
              { code: 'exitEdit', name: '退出修改', prefixIcon: 'vxe-icon-edit' }
            ],
            [
              { code: 'copy', name: '复制', prefixIcon: 'vxe-icon-copy' }
            ],
            [
              { code: 'remove', name: '删除', prefixIcon: 'vxe-icon-delete color-red' }
            ],
            [
              { code: 'save', name: '保存', prefixIcon: 'vxe-icon-save' }
            ]
          ]
        }
      },
      dialogVisible: false,
      fileList: []
    }
  },
  computed: {
    ...mapGetters([
      'selectedInst'
    ])
  },
  watch: {
    filterInput(val) {
      this.changeSelect()
    }
  },
  mounted() {
    this.updateTree()
    this.$on('global:project.open', () => {
      this.updateTree()
    })
    this.tableHeight = this.$refs.tableView.offsetHeight
  },
  methods: {
    strcmp(a, b) {
      if (a.isParent !== b.isParent) {
        return (a.isParent > b.isParent ? -1 : 1)
      }
      return a.id - b.id
    },
    updateTree() {
      if (!this.$store.getters.token) {
        return
      }
      if (this.listLoading) {
        return
      }
      this.listLoading = true
      this.nodes = []
      let nodes = []
      api.tree().then(response => {
        for (const node of response.nodes) {
          nodes.push({ ...node, list: [] })
          nodes = nodes.sort((a, b) => { return a.id - b.id })
        }
        return api.list()
      }).then(response => {
        nodes.map(item => {
          for (const id in response.items) {
            const key = response.items[id]
            if (key.sort === item.id) {
              key.ops = key.ops || []
              key.edit = false
              for (let op of key.ops) {
                op.target = op.target || 0
                op.value = 0
                op.start = op.start || 0
                op.gradient = op.gradient || 0
                op.duration = op.duration || 0
                op.dataType = op.dataType || 0
              }
              item.list.push(key)
            }
          }
          item.list = item.list.sort((a, b) => {
            if ((a.ops[0] && a.ops[0].description) && (b.ops[0] && b.ops[0].description)) {
              return a.ops[0].description.localeCompare(b.ops[0].description, 'zh-CN', { numeric: true })
            }
            return a.id - b.id
          })
        })
        this.nodes = nodes
        this.selectDate = nodes[this.selectIndex || 0].list
        this.filterDate = nodes[this.selectIndex || 0].list.filter(item => item.name.includes(this.filterInput))
        this.reloadDate(this.filterDate)
      }).catch(() => {
        this.nodes = []
      }).finally(() => {
        this.listLoading = false
      })
    },
    // 导出
    exportsExcel() {
      if (this.downLoading) return
      const nodes = this.nodes.reduce((result, item) => {
        return result.concat(item.list)
      }, [])
      if (!nodes.length) return
      this.downLoading = true
      let list = []
      this.nodes.map(item => {
        for (let i of item.list) {
          let { name, ops } = i
          let obj = {
            name: name,
            var: ops[0].var,
            dataType: ops[0].dataType,
            target: ops[0].target,
            sort: item.name,
            start: ops[0].start,
            gradient: ops[0].gradient,
            duration: ops[0].duration
          }
          list.push(obj)
        }
      })
      let tHeader = ['名称', '变量', '变量类型', '目标值', '类型', '延时时间(ms)', '渐变时间(ms)', '保持时间(ms)']
      let filterVal = ['name', 'var', 'dataType', 'target', 'sort', 'start', 'gradient', 'duration']
      this.handleDownload(list, tHeader, filterVal, '故障列表')
    },
    handleDownload(list, tHeader, filterVal, filename) {
      import('@/vendor/Export2Excel').then(excel => {
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename,
          autoWidth: true,
          bookType: 'xlsx'
        })
        this.downLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    // 导入
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    handleClick(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      this.uploadExcel(rawFile)
    },
    uploadExcel(rawFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          // const header = this.getHeaderRow(worksheet)
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.formatFault(results)
          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    },
    formatFault(results) {
      let list = results || []
      let filterDate = {}
      for (let i = 0; i < list.length; i++) {
        let key = list[i]['类型']
        if (!filterDate[key]) {
          filterDate[key] = []
          filterDate[key].push(list[i])
        } else {
          if (key in filterDate) {
            filterDate[key].push(list[i])
          }
        }
      }
      this.uploadFault(filterDate)
    },
    async uploadFault(list) {
      this.downLoading = true
      let cache = []
      try {
        await this.listDelAll(false)
        let menu = this.nodes.map(item => { return { id: item.id, name: item.name } })
        for (let i in list) {
          cache.push(list[i])
        }
        let gets = []
        cache.map((item) => {
        // let gets = []
          for (let i in item) {
            let obj = {
              name: item[i]['名称'],
              ops: [{
                dataType: item[i]['变量类型'],
                description: i,
                duration: item[i]['保持时间(ms)'] || 0,
                gradient: item[i]['渐变时间(ms)'] || 0,
                start: item[i]['延时时间(ms)'] || 0,
                target: item[i]['目标值'],
                var: item[i]['变量']
              }],
              sort: menu.find(ite => ite.name === item[i]['类型']).id
            }
            gets.push(obj)
          }
        })
        let all = []
        for (let i = 0; i < gets.length; i++) {
          all.push(api.listNew(gets[i]))
          // const chunk = gets.slice(i, i + 30) // 每次并发请求数量限制的 URL 切片
          // const chunkRequests = chunk.map(async(url) => {
          //   const response = await api.listNew(url)
          //   return response
          // })

          // await Promise.all(chunkRequests).catch(() => {
          //   this.downLoading = false
          // })
        }
        Promise.all(all).then(() => {
          api.save().then(() => {
            this.updateTree()
          }).finally(() => {
            this.downLoading = false
          })
        })
        // setTimeout(() => {
        //   api.save().then(() => {
        //     this.updateTree()
        //   }).finally(() => {
        //     this.downLoading = false
        //   })
        // }, 0)
      } catch (err) {
        this.$msg.error('请检查文件格式或故障目录')
        this.downLoading = false
      }
    },
    getHeaderRow(sheet) {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
        /* find the cell in the first row */
        let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
      }
      return headers
    },
    changeSelect() {
      this.listLoading = true
      this.selectDate = this.nodes[this.selectIndex].list
      this.filterDate = this.selectDate.filter(item => item.name.includes(this.filterInput))
      this.reloadDate(this.filterDate)
    },
    reloadDate(data) {
      const xTable = this.$refs.xTable
      if (xTable) {
        this.$refs.xTable.reloadData(data).then(() => {
          this.listLoading = false
        })
      }
    },
    removeNode(node) {
      this.$confirm('确定删除故障 ' + node.name + ' ?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.listDel(node.id)
      }).then(() => {
        api.save()
        this.updateTree()
      }).catch(() => {})
    },
    newFault() {
      if (this.currentNode) {
        let sort = 0
        if (this.currentNode.isParent) {
          sort = this.currentNode.data.id
        } else {
          sort = this.currentNode.data.sort
        }
        api.listNew({ sort: sort, name: '新建故障' }).then(() => {
          this.updateTree()
          api.save()
        }).catch(() => {})
      }
    },
    newSort() {
      let parent = 0
      if (this.currentNode) {
        if (this.currentNode.isParent) {
          parent = this.currentNode.data.id
        } else {
          parent = this.currentNode.data.sort
        }
      }
      api.treeNew({ parent: parent, name: '新建分类' }).then(() => {
        this.updateTree()
        api.save()
      }).catch(() => {})
    },
    copyFault(row) {
      this.$prompt('请输入副本名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputErrorMessage: '邮箱格式不正确',
        inputValue: row.name + '副本'
      }).then(({ value }) => {
        const fault = { ...row, id: 0, name: value }
        fault.ops[0].description = fault.ops[0].description + 'a'
        api.listNew(fault).then(res => {
          this.updateTree()
          api.save()
        }).catch(() => {})
      })
    },
    startFault(row) {
      let fault = row
      this.$confirm('确定投入故障 ' + fault.name + ' ?', '提示', {
        confirmButtonText: '投入',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.start(fault.id)
      }).then(() => {
        this.$msg.success(fault.name, '投入故障成功')
      }).catch(err => {
        this.$msg.error(err, '投入故障失败')
      })
    },
    stopFault(row) {
      let fault = row
      api.stop(fault.id).then(() => {
        this.$msg.success(fault.name, '消除故障成功')
      }).catch(err => {
        this.$msg.error(err, '消除故障失败')
      })
    },
    saveCurrent(row) {
      api.listUpdate(row).then(() => {
        this.updateTree()
        return api.save()
      }).then(() => {
        this.$msg.success('保存成功')
      }).catch(err => {
        this.$msg.error(err, '保存失败')
      })
    },
    startOrstop(row) {
      if (this.isFault(row)) {
        this.stopFault(row)
      } else {
        this.startFault(row)
      }
    },
    contextMenuClickEvent({ menu, row, column }) {
      switch (menu.code) {
        case 'refresh':
          // 示例
          this.updateTree()
          break
        case 'edit':
          // 示例
          if (row && column) {
            row.edit = true
          }
          break
        case 'exitEdit':
          // 示例
          if (row && column) {
            row.edit = false
          }
          break
        case 'copy':
          // 示例
          if (row && column) {
            this.copyFault(row)
          }
          break
        case 'remove':
          // 示例
          if (row && column) {
            this.removeNode(row)
          }
          break
        case 'save':
          // 示例
          if (row && row.edit && column) {
            this.saveCurrent(row)
          }
          break
        default:
          'error'
      }
    },
    isFault(row) {
      return (this.selectedInst.fault && this.selectedInst.fault.includes(row.id)) || false
    },
    getValue(row) {
      return rdbapi.getValue(row.ops[0].var)
    },
    listDelAll(key) {
      return new Promise((resolve) => {
        let items
        api.list().then(res => {
          items = res.items || []
          if (!Object.values(items).length) {
            throw new Error('故障库为空，不执行')
          }
          return api.listDelAll()
        }).then(async() => {
          if (key) {
            await api.save()
            this.updateTree()
          }
        }).catch(err => {
          console.log(err)
        }).finally(() => {
          resolve()
        })
      })
    },
    async deleteFault() {
      this.$confirm('确定删除全部故障?').then(async() => {
        this.listDelAll(true)
      })
    },
    listDel(id) {
      return new Promise((resolve) => {
        setTimeout(async() => {
          await api.listDel(id).then(() => { resolve() })
        }, 100)
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

  .faultList {
    background-color: rgb(238, 241, 246);
    height: 100%;
    width: 100%;
    padding: 20px;
     display: flex;
    flex-direction: column;
    // overflow: auto;
  }
  .menu {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    border-radius: 5px;
    .el-input {
      width: 260px !important;
    }
  }
  .tableView {
    height: calc(100% - 50px);
  }
  .minWidth {
    .el-input {
      width: 80px !important;
    }
  }
  .typeWidth {
    ::v-deep .el-select .el-input {
      width: 85px !important;
    }
  }

  .excel-upload-input{
    display: none;
    z-index: -9999;
  }
  ::v-deep .vxe-body--column {
    height: 30px !important;
  }
</style>

