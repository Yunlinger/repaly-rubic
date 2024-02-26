<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" label-width="80px" style="margin-top: 16px;">
      <el-form-item label="追踪模式">
        <el-radio-group v-model.number="traceMode">
          <el-radio :label="1">输入</el-radio>
          <el-radio :label="2">输出</el-radio>
          <el-radio :label="3">全部</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="追踪深度">
        <el-input-number v-model="showDepth" :min="2" :max="16" label="追踪深度" />
      </el-form-item>
      <el-form-item label="模块数">
        <el-input-number v-model="maxCount" :min="8" :max="64" :step="4" label="模块数" />
      </el-form-item>
      <el-form-item label="变量">
        <el-input
          ref="input-key"
          v-model="key"
          placeholder="input var"
          autofocus
          @keyup.enter.native="doSearch"
          @focus="inputOnFocus($event)"
        >
          <el-button slot="append" icon="el-icon-search" @click="doSearch" />
        </el-input>
      </el-form-item>
    </el-form>
    <div id="myDiagramDiv" class="diagram" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as mapi from '@/api/model'
import * as rapi from '@/api/rtd'
import { getUrl } from '@/api/res'
import sb from './components/sb'
import go from 'gojs'
import '@/utils/checkoutAlg'
import { Loading } from 'element-ui'

var $ = go.GraphObject.make

export default {
  name: 'Trace',
  data() {
    return {
      showDepth: 8,
      maxCount: 16,
      traceMode: 3, // 1 跟踪输入， 2 跟踪输出， 3 = 1 + 2
      diagram: null,
      key: '',
      nodeData: [],
      nodeSet: new Set(),
      linkData: [],
      loading: null,
      timer: null
    }
  },
  computed: {
    ...mapGetters(['algs', 'project'])
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
    this.diagram && this.diagram.clear()
  },
  mounted() {
    this.initDiagram()
    this.initTimer()
  },
  methods: {
    initDiagram() {
      var _this = this
      this.diagram = $(go.Diagram, 'myDiagramDiv', {
        initialContentAlignment: go.Spot.Center,
        layout: $(go.LayeredDigraphLayout, { direction: 0, layerSpacing: 100 }),
        'toolManager.hoverDelay': 100,
        'animationManager.isEnabled': false,
        'undoManager.isEnabled': false,
        'grid.visible': false,
        'draggingTool.isComplexRoutingRealtime': false,
        // 不能用双击更改模块名
        'textEditingTool.isEnabled': false,
        // 画布边距
        padding: 50
      })
      // 部分选中
      this.diagram.toolManager.dragSelectingTool.isPartialInclusion = true
      // 连线样式
      this.diagram.linkTemplate = $(go.Link,
        {
          curve: go.Link.Bezier,
          adjusting: go.Link.Stretch,
          reshapable: true,
          relinkableFrom: false,
          relinkableTo: false,
          toShortLength: 0
        },
        // new go.Binding('curviness'),
        // the link path shape
        $(go.Shape, { strokeWidth: 2, stroke: 'green' },
          new go.Binding('stroke', 'vardata', function(v) {
            if (v.name === _this.key) {
              return '#FF00FF'
            }
            switch (v.value || 0) {
              case 0: return 'green'
              case 1: return 'red'
              default: return 'gray'
            }
          })
        ),
        // the arrowhead
        // $(go.Shape, { toArrow: 'Standard', stroke: 'green', fill: 'green' })
        $(go.Panel, 'Auto',
          $(go.Shape, // the label background, which becomes transparent around the edges
            {
              fill: $(go.Brush, 'Radial',
                { 0: 'rgba(255, 255, 255, 128)', 0.6: 'rgba(255, 255, 255, 128)', 1: 'rgba(255, 255, 255, 0)' }),
              stroke: null
            }),
          $(go.TextBlock, new go.Binding('text', 'vardata', function(v) { return v.value || 0 }), // the label text
            {
              textAlign: 'center',
              font: 'bold 9pt helvetica, arial, sans-serif',
              margin: 6,
              editable: false, // disable in-place editing
              stroke: 'blue'
            })
        )
      )
      this.diagram.model = go.Model.fromJson(JSON.stringify({
        'class': 'go.GraphLinksModel',
        'linkFromPortIdProperty': 'frompid',
        'linkToPortIdProperty': 'topid',
        'nodeCategoryProperty': 'type'
      }))
      // this.diagram.addDiagramListener('ClipboardChanged', e => {
      //   let show = false
      //   e.subject.each(part => {
      //     if (part.data.key && !show) {
      //       show = true
      //       this.seachAndShowTrace(part.data.key)
      //     }
      //   })
      // })
      this.diagram.addDiagramListener('ObjectDoubleClicked', e => {
        if (e.subject.part.data.key) {
          sb({
            bid: e.subject.part.data.key
          })
        }
      })
      var cmdHandler = this.diagram.commandHandler
      cmdHandler.doKeyDown = function() {
        var e = _this.diagram.lastInput
        if (e.key === 'C' && (e.control || e.meta)) {
          let show = false
          e.diagram.selection.each(part => {
            if (part.data.key && !show) {
              show = true
              _this.seachAndShowTrace(part.data.key)
            }
          })
          e.event.preventDefault()
        } else if (e.key === 'V' && (e.control || e.meta)) {
          let show = false
          e.diagram.selection.each(part => {
            if (part.data.key && !show) {
              show = true
              _this.seachAndShowTrace(part.data.key, true)
            }
          })
          e.event.preventDefault()
        } else {
          // call base method with no arguments
          go.CommandHandler.prototype.doKeyDown.call(this)
        }
      }
      cmdHandler.canPasteSelection = function() {
        return false
      }
    },
    initTimer() {
      this.timer = setInterval(() => {
        if (this.diagram) {
          for (var link of this.diagram.model.linkDataArray) {
            if (link.vardata) {
              link.vardata.value = rapi.getValue(link.vardata.name)
              this.diagram.model.updateTargetBindings(link)
            }
          }
        }
      }, 500)
    },
    makeTemplate(typename, icon, inports, outports, depth) {
      const iconpath = getUrl(`icon/${icon}`)
      const portsNum = Math.max(inports.length, outports.length, 4)
      const height = portsNum * 15 + 10
      var node = $(go.Node, 'Spot',
        $(go.Panel, 'Auto',
          { width: 120, height: height },
          $(go.Shape, 'Rectangle', {
            fill: depth === 0 ? 'green' : 'cornflowerblue',
            stroke: null,
            strokeWidth: 0,
            spot1: go.Spot.TopLeft,
            spot2: go.Spot.BottomRight
          }),
          $(
            go.Panel,
            'Table',
            $(go.Picture, iconpath, { row: 1, width: 56, height: 46 }),
            $(
              go.TextBlock,
              {
                row: 2,
                margin: 3,
                editable: true,
                maxSize: new go.Size(120, 40),
                stroke: 'white',
                font: 'bold 8pt sans-serif'
              },
              new go.Binding('text', 'desc')
            )
          )
        ),
        $(
          go.Panel,
          'Vertical',
          {
            alignment: go.Spot.Left,
            alignmentFocus: new go.Spot(0, 0.5, -4, 0)
          },
          inports
        ),
        $(
          go.Panel,
          'Vertical',
          {
            alignment: go.Spot.Right,
            alignmentFocus: new go.Spot(1, 0.5, 4, 0)
          },
          outports
        )
      )
      this.diagram.nodeTemplateMap.set(typename, node)
    },
    makePort(name, leftside) {
      var port = $(go.Shape, 'Rectangle',
        {
          fill: 'green', stroke: null,
          desiredSize: new go.Size(6, 6),
          portId: name, // declare this object to be a 'port'
          toMaxLinks: 1, // don't allow more than one link into a port
          cursor: 'pointer' // show a different cursor to indicate potential link point
        })
      var lab = $(go.TextBlock, name, // the name of the port
        { font: '7pt sans-serif' })
      var panel = $(go.Panel, 'Horizontal',
        { margin: new go.Margin(2, 0) })
      // set up the port/panel based on which side of the node it will be on
      if (leftside) {
        port.toSpot = go.Spot.Left
        port.toLinkable = true
        lab.margin = new go.Margin(1, 0, 0, 1)
        panel.alignment = go.Spot.Left
        panel.add(port)
        panel.add(lab)
      } else {
        port.fromSpot = go.Spot.Right
        port.fromLinkable = true
        lab.margin = new go.Margin(1, 1, 0, 0)
        panel.alignment = go.Spot.Right
        panel.add(lab)
        panel.add(port)
      }
      return panel
    },
    getPid(alg, index, beIn) {
      index = index || 0
      let pid = ''
      if (beIn) {
        pid = this.algs[alg].in[index].name || ('in' + (index + 1))
      } else {
        pid = this.algs[alg].out[index].name || ('ot' + (index + 1))
      }
      return pid
    },
    findNode(bid) {
      for (var i = 0; i < this.nodeData.length; i++) {
        if (this.nodeData[i].key === bid) {
          return this.nodeData[i]
        }
      }
      return null
    },
    findLink(id) {
      for (var i = 0; i < this.linkData.length; i++) {
        if (this.linkData[i].id === id) {
          return this.linkData[i]
        }
      }
      return null
    },
    addBlockNode(bid, depth) {
      return new Promise((resolve, reject) => {
        if (this.findNode(bid)) {
          resolve(this.findNode(bid).block)
        } else if (Math.abs(depth) > 1 && (this.nodeData.length > this.maxCount || Math.abs(depth) > this.showDepth)) {
          reject()
        } else {
          mapi.blockGet(bid).then(res => {
            if (this.findNode(bid)) {
              // 已经有该模块，直接返回
              resolve(this.findNode(bid).block)
              return
            }
            // 已经获取数据就显示吧
            // if (Math.abs(depth) > 1 && (this.nodeData.length > this.maxCount || Math.abs(depth) > this.showDepth)) {
            //   reject()
            //   return
            // }
            const inp = []
            const otp = []
            for (let i = 0; i < res.in.length; i++) {
              if (res.in[i].def) {
                const pid = this.getPid(res.alg, i, true)
                inp.push(this.makePort(pid, true))
              }
            }
            for (let i = 0; i < res.out.length; i++) {
              if (res.out[i].ref) {
                const pid = this.getPid(res.alg, i, false)
                otp.push(this.makePort(pid, false))
              }
            }
            this.makeTemplate(res.name, this.algs[res.alg] && this.algs[res.alg].image, inp, otp, depth)
            res.depth = depth
            this.nodeData.push({
              type: res.name,
              key: res.id,
              name: res.name,
              desc: res.desc,
              block: res
            })
            resolve(res)
          }).catch(() => {
            reject()
          })
        }
      })
    },
    addALinkOfVar(block, ioindex, vardef, vardata, beIn) {
      return new Promise((resolve, reject) => {
        const depth = (beIn ? block.depth - 1 : block.depth + 1)
        this.addBlockNode(vardef.id, depth).then((b) => {
          let ldat = {}
          if (beIn) {
            ldat = {
              from: vardef.id,
              frompid: this.getPid(b.alg, vardef.index, false),
              to: block.id,
              topid: this.getPid(block.alg, ioindex, true),
              vardata: vardata
            }
          } else {
            ldat = {
              to: vardef.id,
              topid: this.getPid(b.alg, vardef.index, true),
              from: block.id,
              frompid: this.getPid(block.alg, ioindex, false),
              vardata: vardata
            }
          }
          ldat.id = ldat.from + '_' + ldat.frompid + '_' + ldat.to + '_' + ldat.topid
          if (!this.findLink(ldat.id)) {
            this.linkData.push(ldat)
          }
          resolve()
        }).catch(() => {
          reject()
        })
      })
    },
    addLinksOfVar(block, vardata, ioindex, beIn) {
      return new Promise((resolve, reject) => {
        mapi.varGetDetail(vardata.id).then(detail => {
          var promiseArray = []
          if (beIn) {
            for (let j = 0; j < detail.defs.length; j++) {
              promiseArray.push(this.addALinkOfVar(block, ioindex, detail.defs[j], vardata, true))
            }
          } else {
            for (let j = 0; j < detail.refs.length; j++) {
              promiseArray.push(this.addALinkOfVar(block, ioindex, detail.refs[j], vardata, false))
            }
          }
          return Promise.all(promiseArray)
        }).then(() => {
          resolve()
        }).catch(() => {
          reject()
        })
      })
    },
    addLinksOfBlock(block) {
      return new Promise((resolve, reject) => {
        var promiseArray = []
        if ((this.traceMode & 1) && block.depth <= 0) {
          for (let i = 0; i < block.in.length; i++) {
            if (block.in[i].def) {
              promiseArray.push(this.addLinksOfVar(block, block.in[i], i, true))
            }
          }
        }
        if ((this.traceMode & 2) && block.depth >= 0) {
          for (let i = 0; i < block.out.length; i++) {
            if (block.out[i].ref) {
              promiseArray.push(this.addLinksOfVar(block, block.out[i], i, false))
            }
          }
        }
        var handlePromise = Promise.all(promiseArray)
        handlePromise.then(() => {
          resolve(block)
        }).catch(() => {
          reject()
        })
      })
    },
    addLinksOfBlocks() {
      return new Promise((resolve, reject) => {
        var promiseArray = []
        for (const node of this.nodeData) {
          if (!node.linked) {
            node.linked = true
            promiseArray.push(this.addLinksOfBlock(node.block))
          }
        }
        if (promiseArray.length === 0) {
          reject()
          return
        }
        var handlePromise = Promise.all(promiseArray)
        handlePromise.then(() => {
          return this.addLinksOfBlocks()
        }).then(() => {
          resolve()
        }).catch(() => {
          reject()
        })
      })
    },
    loadBlock(bid) {
      return new Promise((resolve, reject) => {
        this.addBlockNode(bid, 0).then(res => {
          return this.addLinksOfBlocks()
        }).then(() => {
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },
    seachAndShowTrace(id, append) {
      this.loading = Loading.service({
        lock: true,
        text: '正在生成拓扑图...',
        background: 'rgba(0, 0, 0, 0.1)'
      })
      const maxCount = this.maxCount
      const showDepth = this.showDepth
      if (append) {
        this.maxCount = this.nodeData.length + 4
        this.showDepth = this.showDepth + 8
        for (var i = 0; i < this.nodeData.length; i++) {
          if (this.nodeData[i].key === id) {
            this.nodeData[i].linked = false
          } else {
            this.nodeData[i].linked = true
          }
        }
      } else {
        this.diagram.nodeTemplateMap.clear()
        this.nodeData = []
        this.linkData = []
      }
      this.loadBlock(id).then(() => {
        this.maxCount = maxCount
        this.showDepth = showDepth
        if (!append) {
          this.diagram.clear()
        }
        // 增量添加
        const nodesToAppend = this.nodeData.filter((node) => {
          return !this.diagram.findNodeForKey(node.key)
        })
        const linksToAppend = this.linkData.filter((link) => {
          return !this.diagram.findLinkForData(link)
        })
        this.diagram.model.addNodeDataCollection(nodesToAppend)
        this.diagram.model.addLinkDataCollection(linksToAppend)
        this.loading.close()
      })
    },
    doSearch() {
      this.key && mapi.varGetDetailByName(this.key).then(res => {
        if (res.defs && res.defs.length > 0) {
          this.seachAndShowTrace(res.defs[0].id)
        } else
        if (res.refs && res.refs.length > 0) {
          this.seachAndShowTrace(res.refs[0].id)
        }
      })
    },
    inputOnFocus(event) {
      event.currentTarget.select()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .diagram{
    width: 100%;
    height: calc(100vh - 148px);
  }
  .app-container {
    padding: 0;
  }
</style>
