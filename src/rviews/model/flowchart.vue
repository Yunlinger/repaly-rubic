<template>
  <div>
    <div
      id="myDiagramDiv"
      :style="styles"
      class="diagram"
      @dragover="allowDrop($event)"
      @drop="drop($event)"
    />
    <div v-show="loaded" class="tools">
      <em
        class="button el-dialog__close bi bi-zoom-in"
        @click="diagramScale(1)"
      />
      <div class="button" @click="diagramScale(0)">{{ scale +'%' }}</div>
      <em
        class="button el-dialog__close bi bi-zoom-out"
        @click="diagramScale(-1)"
      />
      <div class="split"></div>
      <em
        class="button el-dialog__close bi bi-text-left"
        @click="justify('left')"
      />
      <em
        class="button el-dialog__close bi bi-text-right"
        @click="justify('right')"
      />
      <em
        class="button el-dialog__close bi bi-text-left"
        style="transform: rotate(90deg);"
        @click="justify('top')"
      />
      <em
        class="button el-dialog__close bi bi-text-left"
        style="transform: rotate(-90deg);"
        @click="justify('bottom')"
      />
      <em
        class="button el-dialog__close bi bi-distribute-horizontal"
        @click="justify('distribute-horizontal')"
      />
      <em
        class="button el-dialog__close bi bi-distribute-vertical"
        @click="justify('distribute-vertical')"
      />
      <div class="split"></div>
      <el-popover
        placement="bottom"
        height="30"
        width="50"
        trigger="click"
      >
        <el-slider v-model="fontSize" :min="10" :max="30" @input="setLabelSize"></el-slider>
        <em
          slot="reference"
          class="button el-dialog__close bi bi-file-font"
        />
      </el-popover>
      <template v-for="btn in colorButtons">
        <template>
          <div
            :key="btn"
            class="button"
            :style="`border-radius: 6px; background: ${btn}`"
            @click="setLabelColor(btn)"
          />
        </template>
      </template>
    </div>
    <el-dialog
      title="替换粘贴"
      :visible.sync="pasteDialogVisible"
      width="600px"
      append-to-body
    >
      <el-button
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="appendReplaces"
      />
      <template v-for="(rep, idx) in replaces">
        <template>
          <p :key="'replaces' + idx">
            <input v-model="rep.old" style="width: 180px;" />
            <span>--></span>
            <input v-model="rep.new" style="width: 180px;" />
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-delete"
              style="margin-left: 24px;"
              @click="removeReplaces(idx)"
            />
          </p>
        </template>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="pasteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="replacePaste">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as mapi from '@/api/model'
import * as rapi from '@/api/rtd'
import sb from './components/sb'
import search from './components/search'
import ValueBoxEditor from './components/ValueBoxEditor'
import '@/utils/checkoutAlg'
import go from 'gojs'
import throttle from 'lodash/throttle'
import _ from 'lodash'

// 全局记录替换配置
var globalModelReplaces = [{ old: '', new: '' }]

var $ = go.GraphObject.make
export default {
  name: 'FlowChart',
  data() {
    return {
      loaded: false,
      nodeTemplate: {},
      pageName: '',
      pageDesc: '',
      pageData: {},
      rendered: false,
      diagram: null,
      timer: null,
      colorButtons: ['black', 'red', 'blue', 'green', 'yellow', 'purple'],
      replacePasteOld: '',
      replacePasteNew: '',
      replaces: [{
        old: '',
        new: ''
      }],
      pasteDialogVisible: false,
      confirmDelete: false,
      confirmDeleteRef: false,
      styles: {
        backgroundColor: '#F8F8F8'
      },
      fontSize: 10
    }
  },
  computed: {
    ...mapGetters(['algs', 'project']),
    scale: function() {
      if (!this.diagram) {
        return 1
      }
      return Math.floor(this.diagram.scale * 100)
    }
  },
  watch: {
    algs: {
      deep: true,
      handler: function() {
        this.readPage()
      }
    },
    replaces: {
      deep: true,
      handler: function(newValue) {
        this.saveReplaceConfig()
      }
    }
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route)
    this.pageName = this.$route.params && this.$route.params.name
  },

  beforeDestroy() {
    this.clearTimer()
    this.diagram.clear()
  },

  mounted() {
    this.$on('global:project.open', () => {
      // 当重新打开工程后销毁流程图
      this.$destroy('FlowChart')
    })
    this.$on('global:selblk', (config) => {
      // 选中模块
      var node = this.diagram.findNodeForKey(config.id)
      if (node) {
        this.selectNode(node)
      }
    })
    this.$on('global:sellabel', (config) => {
      // 选中模块
      var node = this.diagram.findNodeForKey(`rubik_label_${config.id}`)
      if (node) {
        this.selectNode(node)
      }
    })
    this.initDiagram()
    this.setOperateHandler()
    this.readPage()
    this.startTimer()
  },
  activated() {
    this.setTagsViewTitle()
    // 从缓存中打开的时候判断是否需要刷新
    this.$store.dispatch('tagsView/needToUpdate', this.$route).then(update => {
      if (update) {
        this.diagram.clear()
        this.readPage()
      }
    })
  },

  methods: {
    clearTimer() {
      this.timer && clearInterval(this.timer)
      this.$off('local:update')
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.$emit('local:update')
      }, 2000)
      this.$on('global:rtdb', () => {
        this.$emit('local:update')
      })
      this.$on('local:update',
        throttle(() => {
          this.updateValue()
        }, 500, {
          leading: true,
          trailing: false
        })
      )
    },
    updateValue() {
      if (!this.diagram) {
        return
      }
      // let now = new Date()
      // console.log('updateValue', now - this.lastUpdateTime)
      // this.lastUpdateTime = now
      // 刷新画面数据
      for (var nodeData of this.diagram.model.nodeDataArray) {
        if (nodeData.type === 'valuebox') {
          var value = rapi.getValue(nodeData.var)
          if (nodeData.value !== value) {
            nodeData.value = value
            this.diagram.model.updateTargetBindings(nodeData)
          }
        } else if (nodeData.type === 'block') {
          var status = rapi.getValue(nodeData.name + '/$FROZEN')
          if (nodeData.status !== status) {
            nodeData.status = status
            this.diagram.model.updateTargetBindings(nodeData)
          }
        }
      }
      // 刷新连线
      for (var linkData of this.diagram.model.linkDataArray) {
        let value = rapi.getValue(linkData.name)
        if (linkData.value !== value) {
          linkData.value = value
          this.diagram.model.updateTargetBindings(linkData)
        }
      }
    },
    // 初始化 画布
    initDiagram() {
      const _this = this

      this.diagram = $(go.Diagram, 'myDiagramDiv', {
        initialContentAlignment: go.Spot.TopLeft,
        // 'toolManager.mouseWheelBehavior': go.ToolManager.WheelNone, // 鼠标滚轮事件禁止
        'toolManager.hoverDelay': 100,
        'animationManager.isEnabled': false,
        'undoManager.isEnabled': false,
        'grid.visible': false,
        'grid.gridCellSize': new go.Size(40, 40),
        'initialPosition': new go.Point(0, 0),
        'draggingTool.isComplexRoutingRealtime': false,
        // 不能用双击更改模块名
        'textEditingTool.isEnabled': false,
        // 设置框选延时为0，实际作用是禁用鼠标拖动
        // 'dragSelectingTool.delay': 100,
        // 画布边距
        'padding': 150,
        'contextClick': _this.contextClick
      })
      // 设置 vuecontext
      this.diagram.vuecontext = _this
      // 部分选中
      this.diagram.toolManager.dragSelectingTool.isPartialInclusion = true
      // 设置框选延时为100
      this.diagram.toolManager.dragSelectingTool.delay = 100
      // 连线样式
      this.diagram.linkTemplate = $(go.Link,
        {
          relinkableFrom: false,
          relinkableTo: false,
          reshapable: true,
          resegmentable: true,
          layerName: 'Background' // 连线放到模块下面
        },
        {
          // but this is changed to go.Link.Orthogonal when the Link is reshaped
          // routing: go.Link.AvoidsNodes, // 设为这个值渲染会很慢
          routing: go.Link.Orthogonal,
          adjusting: go.Link.End,
          curve: go.Link.JumpGap,
          // curve: go.Link.JumpOver, // 设为这个值渲染会很慢
          corner: 4,
          toShortLength: 0
        },
        new go.Binding('points').makeTwoWay(),
        // remember the Link.routing too
        new go.Binding('routing', 'routing', go.Binding.parseEnum(go.Link, go.Link.AvoidsNodes))
          .makeTwoWay(go.Binding.toString),
        // the link path shape
        $(go.Shape,
          { isPanelMain: true, strokeWidth: 2, stroke: 'green' },
          new go.Binding('stroke', 'value', function(v) {
            switch (v || 0) {
              case 0: return 'green'
              case 1: return 'red'
              default: return 'black'
            }
          })
        ),
        // the arrowhead
        $(go.Shape,
          { toArrow: 'Standard', stroke: 'green', fill: 'green' },
          new go.Binding('stroke', 'value', function(v) {
            switch (v || 0) {
              case 0: return 'green'
              case 1: return 'red'
              default: return 'black'
            }
          }),
          new go.Binding('fill', 'value', function(v) {
            switch (v || 0) {
              case 0: return 'green'
              case 1: return 'red'
              default: return 'black'
            }
          })
        ),
        $(go.Panel, 'Auto',
          new go.Binding('visible', 'value', function(v) {
            if (_this.project.editorHiddenLineValue) {
              return false
            }
            return !(v === 0 || v === 1 || !v)
          }),
          $(go.Shape, // the label background, which becomes transparent around the edges
            {
              fill: $(go.Brush, 'Radial',
                {
                  0: 'rgba(255, 255, 255, 0.8)',
                  0.9: 'rgba(255, 255, 255, 0.7)',
                  0.95: 'rgba(255, 255, 255, 0.5)',
                  1: 'rgba(255, 255, 255, 0)'
                }),
              stroke: null
            }),
          $(go.TextBlock, new go.Binding('text', 'value', function(v) {
            v = Number.parseFloat(v)
            if (Number.isInteger(v)) {
              return v.toFixed(0)
            } else if (Math.abs(v) >= 100000 || Math.abs(v) <= 0.00001) {
              return v.toExponential(3)
            } else {
              return v.toFixed(3)
            }
          }), // the label text
          {
            textAlign: 'center',
            font: 'bold 9pt helvetica, arial, sans-serif',
            margin: 6,
            editable: false, // disable in-place editing
            stroke: 'rgba(0, 128, 0, 1)' // 'rgba(128, 0, 128, 1)'
          })
        )
      )
      // test
      this.diagram.model = go.Model.fromJson(JSON.stringify({
        'class': 'go.GraphLinksModel',
        'linkFromPortIdProperty': 'fromPort',
        'linkToPortIdProperty': 'toPort'
      }))
      // 添加 Text node template
      const textTemp =
      $(go.Node, 'Vertical',
        new go.Binding('location', '', _this.toLocation).makeTwoWay(_this.fromLocation),
        { avoidable: false },
        $(go.TextBlock,
          {
            font: 'normal 12px sans-serif',
            editable: true,
            isMultiline: true,
            margin: 2,
            stroke: 'blue',
            cursor: 'move'
          },
          new go.Binding('text', 'text').makeTwoWay(),
          new go.Binding('stroke', 'fontColor').makeTwoWay(),
          new go.Binding('font', '', function(data, node) {
            return `normal ${data.fontSize || 12}px ${data.fontName || 'sans-serif'}`
          })
        )
      )
      this.diagram.nodeTemplateMap.add('$text', textTemp)
      // 添加 ValueBox node template
      const vbTemp =
      $(go.Node, 'Vertical',
        new go.Binding('location', '', _this.toLocation).makeTwoWay(_this.fromLocation),
        { avoidable: false },
        $(go.TextBlock,
          {
            font: 'normal 12px sans-serif',
            editable: true,
            isMultiline: false,
            margin: 2,
            cursor: 'move',
            stroke: 'green',
            textEditor: ValueBoxEditor
          },
          new go.Binding('text', 'value', function(v) {
            v = Number.parseFloat(v)
            if (Number.isInteger(v)) {
              return v.toFixed(0)
            } else if (Math.abs(v) >= 100000 || Math.abs(v) <= 0.00001) {
              return v.toExponential(3)
            } else {
              return v.toFixed(3)
            }
          }).makeTwoWay(),
          new go.Binding('var', 'var').makeTwoWay()
        )
      )
      this.diagram.nodeTemplateMap.add('$valuebox', vbTemp)

      // 添加 Pin node template
      const pinTemp =
      $(go.Node, go.Panel.Auto,
        new go.Binding('location', '', _this.toLocation).makeTwoWay(_this.fromLocation),
        { locationSpot: go.Spot.Center },
        $(go.Shape,
          {
            figure: 'RoundedRectangle',
            desiredSize: new go.Size(30, 10),
            parameter1: 4,
            fill: 'blue', // default fill color
            portId: '',
            fromLinkable: true,
            fromSpot: go.Spot.RightSide,
            toLinkable: true,
            toSpot: go.Spot.LeftSide,
            cursor: 'crosshair'
          }
        ),
        $(go.TextBlock,
          {
            font: 'normal 12px sans-serif',
            editable: true,
            isMultiline: false,
            margin: 2,
            cursor: 'move',
            stroke: '#00000000'
          },
          new go.Binding('var', 'name').makeTwoWay()
        )
      )
      this.diagram.nodeTemplateMap.add('$pin', pinTemp)
    },

    // 操作响应
    setOperateHandler() {
      const _this = this
      this.diagram.addDiagramListener('SelectionMoved', function(e) {
        e.subject.each(part => {
          switch (part.data.type) {
            case 'block':
              // 移动模块
              mapi.blockSetPos(part.data.id, part.data.x, part.data.y)
              // 移动与模块相连的连线
              part.linksConnected.each(function(link) {
                mapi.connectionMove(_this.pageName, link.data.id, link.data.points.toArray())
              })
              break
            case 'text':
              // 移动文本
              mapi.labelMove(_this.pageName, part.data.id, part.data.x, part.data.y)
              break
            case 'valuebox':
              // 移动vb
              mapi.vbMove(_this.pageName, part.data.id, part.data.x, part.data.y)
              break
            case 'pin':
              // 移动pin
              mapi.pinMove(_this.pageName, part.data.id, part.data.x, part.data.y)
              // 移动与引脚相连的连线
              part.linksConnected.each(function(link) {
                mapi.connectionMove(_this.pageName, link.data.id, link.data.points.toArray())
              })
              break
            default:
              break
          }
        })
      })
      this.diagram.addDiagramListener('LinkReshaped', function(e) {
        mapi.connectionMove(_this.pageName, e.subject.data.id, e.subject.data.points.toArray())
      })
      this.diagram.addDiagramListener('LinkDrawn', function(e) {
        var d = e.subject.data
        let from, fromPort, to, toPort
        let fromNode = _this.diagram.findNodeForKey(d.from)
        let toNode = _this.diagram.findNodeForKey(d.to)

        if (fromNode.data.type === 'block') {
          from = fromNode.data.id
          fromPort = d.fromPort - 1
        } else {
          from = fromNode.data.id
          fromPort = -1
        }

        if (toNode.data.type === 'block') {
          to = toNode.data.id
          toPort = 0 - d.toPort - 1
        } else {
          to = toNode.data.id
          toPort = -1
        }
        mapi.connectionNew(
          _this.pageName,
          from,
          fromPort,
          to,
          toPort,
          []
        ).then(res => {
          e.subject.data.id = res.id
          e.subject.data.name = res.name
          if (toNode.data.type === 'pin') {
            _this.updatePin(toNode.data.id)
          }
        }).catch(() => {
          _this.diagram.removeParts([e.subject])
        })
      })
      this.diagram.addDiagramListener('LinkRelinked', function(e) {
        console.log('LinkRelinked:', e.subject.data)
      })
      this.diagram.addDiagramListener('SelectionDeleting', function(e) {
        // 拦截删除事件
        if (_this.confirmDelete) {
          // 已经确认， 直接删除
          e.cancel = false
          _this.confirmDelete = false
        } else {
          e.cancel = true
          var toDelBlock = false
          // 判断待删除列表中是否有模块
          e.subject.each(part => {
            if (part.data.type === 'block') {
              toDelBlock = true
            }
          })
          _this.$confirmWithInput('确定删除选中元件 ?', toDelBlock ? [{
            type: 'checkbox',
            caption: '删除变量引用',
            value: _this.confirmDeleteRef
          }] : []).then(attrs => {
            // 确认后删除
            _this.confirmDeleteRef = (toDelBlock ? !!attrs[0].value : false)
            _this.confirmDelete = true
            _this.diagram.commandHandler.deleteSelection()
          }).catch(() => {
          })
        }
      })
      this.diagram.addDiagramListener('SelectionDeleted', function(e) {
        // 先删除连线
        e.subject.each(part => {
          if (!part.data.type) {
            mapi.connectionDel(_this.pageName, part.data.id).catch(() => {
              // 有可能删除不存在的连线
            })
          }
        })
        // 再删除其他元素
        e.subject.each(part => {
          switch (part.data.type) {
            case 'block':
              mapi.blockDel(part.data.id, _this.confirmDeleteRef)
              break
            case 'text':
              mapi.labelDel(_this.pageName, part.data.id)
              break
            case 'valuebox':
              mapi.vbDel(_this.pageName, part.data.id)
              break
            case 'pin':
              mapi.pinDel(_this.pageName, part.data.id)
              break
            default:
              break
          }
        })
      })
      this.diagram.addDiagramListener('ObjectDoubleClicked', function(e) {
        if (e.subject.part.data.type === 'block') {
          sb({
            bid: e.subject.part.data.id
          })
        } else if (e.subject.part.data.type === 'text') {
          _this.diagram.commandHandler.editTextBlock(e.subject)
        } else if (e.subject.part.data.type === 'valuebox') {
          _this.diagram.commandHandler.editTextBlock(e.subject)
        } else if (e.subject.part.data.type === 'pin') {
          // _this.setPinVar(e.subject.part.data)
          _this.gotoPinRefAndDef(e.subject.part.data)
        }
      })
      this.diagram.addDiagramListener('TextEdited', function(e) {
        if (e.subject.part.data.type === 'text') {
          if (e.subject.part.data.text === e.parameter) {
            return
          }
          mapi.labelSetText(_this.pageName, e.subject.part.data.id, e.subject.part.data.text)
        } else if (e.subject.part.data.type === 'valuebox') {
          e.subject.part.data.var = e.subject.part.data.value
          _this.diagram.model.updateTargetBindings(e.subject.part.data)
          mapi.vbSetVar(_this.pageName, e.subject.part.data.id, e.subject.part.data.var)
        } else if (e.subject.part.data.type === 'block') {
          if (e.subject.part.data.name === e.parameter) {
            return
          }
          mapi.blockReName(e.subject.part.data.id, e.subject.part.data.name).then(() => {
            _this.diagram.model.updateTargetBindings(e.subject.part.data)
          }).catch(() => {
            e.subject.part.data.name = e.parameter
            _this.diagram.model.updateTargetBindings(e.subject.part.data)
          })
        }
      })

      var cmdHandler = _this.diagram.commandHandler
      // cmdHandler.doKeyDown = function() {
      //   var e = _this.diagram.lastInput
      //   if (e.key === 'F' && (e.control || e.meta)) {
      //     search({ stype: 'var' })
      //     e.event.preventDefault()
      //   } else {
      //     // call base method with no arguments
      //     go.CommandHandler.prototype.doKeyDown.call(this)
      //   }
      // }
      cmdHandler.canPasteSelection = function() {
        return true
      }
      cmdHandler.copyToClipboard = function(parts) {
        var modelClipboard = window.modelClipboard || new go.List()
        modelClipboard.clear()
        parts.each(part => {
          modelClipboard.push(part.data)
        })
        window.modelClipboard = modelClipboard
      }

      cmdHandler.pasteFromClipboard = function(beReplace) {
        let _old = (_this.replaces && _this.replaces.length && _this.replaces[0].old) || ''
        let _new = (_this.replaces && _this.replaces.length && _this.replaces[0].new) || ''
        _this.diagram.clearSelection()
        var datas = window.modelClipboard
        if (!datas) {
          return new go.List()
        }
        var blocks = datas.filter(data => {
          return data.type === 'block'
        })
        var ids = []
        blocks.each(data => {
          ids = ids.concat(data.id)
        })
        let blockMap = {}
        let pinMap = {}
        let copyResult = {}
        mapi.blockCopy(_this.pageName, ids, 20, 20,
          beReplace ? _old : '',
          beReplace ? _new : '',
          beReplace ? (_this.replaces || []) : []
        ).then(res => {
          copyResult = res || {}
          blockMap = copyResult.blocks
          for (var key in blockMap) {
            const block = blockMap[key]
            if (block) {
              _this.addBlockToDiagram(block, true)
            }
          }

          // 先建立 pin, 然后才能连线
          let pins = datas.filter(data => {
            return data.type === 'pin'
          })
          let all = []
          pins.each(data => {
            // 通过返回的变量对应关系, 生成独立引脚的新变量
            let name = (copyResult.varMap && copyResult.varMap[data.name]) || data.name
            all.push(mapi.pinNew(_this.pageName, name, data.x + 20, data.y + 20).then(res => {
              _this.addPinToDiagram({
                id: res.id,
                name: name,
                x: data.x + 20,
                y: data.y + 20
              }, true)
              pinMap[data.id] = res
            }))
          })
          return Promise.all(all)
        }).then(() => {
          var others = datas.filter(data => {
            return data.type !== 'block' && data.type !== 'pin'
          })
          others.each(data => {
            switch (data.type) {
              case 'block':
                break
              case 'text':
                {
                  let req = {
                    text: data.text,
                    x: data.x + 20,
                    y: data.y + 20,
                    fontSize: data.fontSize,
                    fontColor: data.fontColor,
                    fontName: data.fontName
                  }
                  mapi.labelNew(_this.pageName, req).then(res => {
                    _this.addTextToDiagram({
                      ...data,
                      text: req.text,
                      x: data.x + 20,
                      y: data.y + 20,
                      id: res.id
                    }, true)
                  })
                }
                break
              case 'valuebox':
                {
                  let name = (copyResult.varMap && copyResult.varMap[data.var]) || data.var
                  mapi.vbNew(_this.pageName, name, data.x + 20, data.y + 20).then(res => {
                    _this.addValueboxToDiagram({
                      id: res.id,
                      x: data.x + 20,
                      y: data.y + 20,
                      var: name
                    }, true)
                  })
                }
                break
              default:
                var linkData = {}
                linkData.fromPort = data.fromPort
                linkData.toPort = data.toPort
                if (data.from < 0) {
                  linkData.from = pinMap[0 - data.from].id
                  linkData.fromPort = -1
                } else {
                  linkData.from = blockMap[data.from].id
                }

                if (data.to < 0) {
                  linkData.to = pinMap[0 - data.to].id
                  linkData.toPort = -1
                } else {
                  linkData.to = blockMap[data.to].id
                }

                linkData.points = new go.List()
                data.points.each(p => {
                  linkData.points.push(new go.Point(p.x + 20, p.y + 20))
                })
                mapi.connectionNew(
                  _this.pageName,
                  linkData.from,
                  linkData.fromPort === -1 ? -1 : (linkData.fromPort - 1),
                  linkData.to,
                  linkData.toPort === -1 ? -1 : (0 - linkData.toPort - 1),
                  linkData.points.toArray()
                ).then(res => {
                  linkData.id = res.id
                  linkData.name = res.name || ''
                  if (linkData.fromPort === -1) {
                    linkData.from = 0 - linkData.from
                  }
                  if (linkData.toPort === -1) {
                    linkData.to = 0 - linkData.to
                  }
                  _this.diagram.model.addLinkData(linkData)
                })
                break
            }
          })
        })
        return new go.List()
      }
    },

    connInfo2Port(conn) {
      let from, fromPort, to, toPort
      if (conn.source.index === -1) {
        from = 0 - conn.source.block
        fromPort = -1
      } else {
        from = conn.source.block
        fromPort = '' + ((conn.source.index || 0) + 1)
      }

      if (conn.target.index === -1) {
        to = 0 - conn.target.block
        toPort = -1
      } else {
        to = conn.target.block
        toPort = '' + (0 - ((conn.target.index || 0) + 1))
      }

      return { from, fromPort, to, toPort }
    },

    // 读取页面信息
    readPage() {
      mapi.pageOpen(this.pageName).then(res => {
        this.pageDesc = res.desc
        this.setTagsViewTitle()

        // 自动建立的接口图页, 不显示.
        if (res.sort < 0) {
          this.diagram.clear()
          return
        }

        // 清空页面
        this.diagram.clear()
        this.styles.backgroundColor = res.background || this.styles.backgroundColor
        // 生成 NodeTemplate
        var algUsed = {}
        for (var name in res.blocks) {
          var block = res.blocks[name]
          algUsed[block.alg] = true
        }
        // 先清空原有 nodeTemplateMap
        for (let k in algUsed) {
          this.diagram.nodeTemplateMap.remove(k)
        }
        this.$store.dispatch('BuildNodeTemplate', algUsed).then((nodeTemplate) => {
          for (let name in nodeTemplate) {
            this.diagram.nodeTemplateMap.add(name, nodeTemplate[name])
          }
          // 订阅变量
          let vars = []
          for (let id in res.blocks) {
            let b = res.blocks[id]
            this.addBlockToDiagram(b)
            vars.push(b.name + '/$FROZEN')
          }
          for (let id in res.pins) {
            var pin = res.pins[id]
            this.addPinToDiagram(pin)
          }

          var linkData = []
          for (let id in res.connections) {
            const conn = res.connections[id]
            const points = new go.List()
            conn.points = conn.points || []
            for (let point of conn.points) {
              points.push(new go.Point(point.x || 0, point.y || 0))
            }
            linkData.push({
              ...this.connInfo2Port(conn),
              id: conn.id,
              points: points,
              name: conn.name
            })
          }
          if (linkData.length) {
            this.diagram.model.addLinkDataCollection(linkData)
          }

          for (let id in res.labels) {
            let label = res.labels[id]
            this.addTextToDiagram(label)
          }
          for (let id in res.valueboxs) {
            let vb = res.valueboxs[id]
            this.addValueboxToDiagram(vb)
            vars.push(vb.var)
          }
          // 到这里所有数据初始化完成，可以进行刷新
          this.loaded = true
          setTimeout(() => {
            // 选中模块
            if (this.$route.query.selblk) {
              let node = this.diagram.findNodeForKey(this.$route.query.selblk)
              if (node) {
                this.selectNode(node)
              }
            }
            // 选中文本
            if (this.$route.query.sellabel) {
              let node = this.diagram.findNodeForKey(`rubik_label_${this.$route.query.sellabel}`)
              if (node) {
                this.selectNode(node)
              }
            }
            this.updateValue()
          }, 1)
        }).catch((err) => {
          console.log(err)
        })
      })
    },

    nodeStyle() {
      return [
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('isShadowed', 'isSelected').ofObject(), {
          selectionAdorned: false,
          shadowOffset: new go.Point(0, 0),
          shadowBlur: 15,
          shadowColor: 'blue' }]
    },

    shapeStyle(width, height) {
      return {
        name: 'NODESHAPE',
        fill: 'lightgray',
        stroke: 'darkslategray',
        desiredSize: new go.Size(width, height),
        strokeWidth: 2
      }
    },

    portStyle(input, direction) {
      input = input || false
      var spot = go.Spot.Right
      switch (direction) {
        case 0:
          spot = go.Spot.Top
          break
        case 1:
          spot = go.Spot.Right
          break
        case 2:
          spot = go.Spot.Bottom
          break
        case 3:
          spot = go.Spot.Left
          break
      }
      return {
        desiredSize: new go.Size(4, 4),
        fill: input ? 'blue' : 'green',
        stroke: input ? 'blue' : 'green',
        fromSpot: spot,
        fromLinkable: !input,
        fromLinkableSelfNode: !input,
        fromEndSegmentLength: 20,
        toSpot: spot,
        toLinkable: input,
        toLinkableSelfNode: input,
        toEndSegmentLength: 20,
        toMaxLinks: 1,
        cursor: 'pointer'
      }
    },
    allowDrop(event) {
      event.preventDefault()
    },
    drop(event) {
      var alg = event.dataTransfer.getData('text/plain')
      if (!alg || alg.length === 0) {
        return
      }
      try {
        alg = JSON.parse(alg).alg
      } catch (err) {
        // console.log('parse alg err: ', err)
        alg = null
      }
      if (!alg || alg.length === 0) {
        return
      }
      var x = event.offsetX + this.diagram.position.x
      var y = event.offsetY + this.diagram.position.y
      mapi.blockNew('', '', alg, this.pageName, x, y).then(res => {
        return Promise.resolve(res.id)
      }).then(id => {
        return mapi.blockGetInfo(id)
      }).then(b => {
        this.addBlockToDiagram(b)
      })
    },
    _addBlockToDiagram(block, isSelected) {
      var data = {
        category: block.alg,
        alg: block.alg,
        desc: block.desc,
        name: block.name,
        hideName: this.project.editorHiddenBlockName, // this.hideBlockName || false,
        id: block.id,
        key: block.id,
        status: 0,
        type: 'block',
        x: block.x || 0,
        y: block.y || 0,
        direction: (block.direction || 0) % 4
      }
      this.diagram.model.addNodeData(data)
      this.diagram.findPartForData(data).isSelected = isSelected || false
      this.diagram.findPartForData(data).contextClick = (e, obj) => { this.contextClick(e, obj) }
    },
    addBlockToDiagram(block, isSelected) {
      if (this.diagram.nodeTemplateMap.has(block.alg)) {
        this._addBlockToDiagram(block, isSelected)
        return
      }
      var algUsed = {}
      algUsed[block.alg] = true
      this.$store.dispatch('BuildNodeTemplate', algUsed).then(() => {
        const nodeTemplate = this.$store.getters.nodeTemplate
        this.diagram.nodeTemplateMap.add(block.alg, nodeTemplate[block.alg])
        this._addBlockToDiagram(block, isSelected)
      }).catch((err) => {
        console.log(err)
      })
    },
    addTextToDiagram(text, isSelected) {
      var data = {
        category: '$text',
        id: text.id,
        key: `rubik_label_${text.id}`,
        text: text.text,
        type: 'text',
        x: text.x || 0,
        y: text.y || 0,
        fontSize: text.fontSize || 12,
        fontName: text.fontName || '',
        fontColor: text.fontColor || 'blue'
      }
      this.diagram.model.addNodeData(data)
      this.diagram.findPartForData(data).isSelected = isSelected || false
      this.diagram.findPartForData(data).contextClick = (e, obj) => { this.contextClick(e, obj) }
    },
    addValueboxToDiagram(vb, isSelected) {
      var data = {
        category: '$valuebox',
        type: 'valuebox',
        id: vb.id,
        key: `rubik_valuebox_${vb.id}`,
        var: vb.var,
        value: rapi.getValue(vb.var),
        x: vb.x || 0,
        y: vb.y || 0
      }
      this.diagram.model.addNodeData(data)
      this.diagram.findPartForData(data).isSelected = isSelected || false
      this.diagram.findPartForData(data).contextClick = (e, obj) => { this.contextClick(e, obj) }
    },
    addPinToDiagram(pin, isSelected) {
      var data = {
        category: '$pin',
        type: 'pin',
        id: pin.id,
        key: 0 - pin.id,
        name: pin.name,
        value: rapi.getValue(pin.name),
        x: pin.x || 0,
        y: pin.y || 0
      }
      this.diagram.model.addNodeData(data)
      this.diagram.findPartForData(data).isSelected = isSelected || false
      this.diagram.findPartForData(data).contextClick = (e, obj) => { this.contextClick(e, obj) }
    },
    makeButton(text, action, visiblePredicate) {
      return $('ContextMenuButton',
        $(go.TextBlock, text),
        { click: action },
        // don't bother with binding GraphObject.visible if there's no predicate
        visiblePredicate ? new go.Binding('visible', '', function(o, e) { return o.diagram ? visiblePredicate(o, e) : false }).ofObject() : {})
    },
    toLocation(data, node) {
      return new go.Point(data.x, data.y)
    },
    fromLocation(loc, data, model) {
      model.setDataProperty(data, 'x', loc.x)
      model.setDataProperty(data, 'y', loc.y)
    },
    setTagsViewTitle() {
      const route = Object.assign({}, this.tempRoute, { title: `模型 - ${this.pageDesc || this.pageName}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    diagramScale(sc) {
      if (typeof sc !== 'number') {
        return
      }
      if (!this.diagram) {
        return
      }
      let scale = this.diagram.scale
      if (sc < 0) {
        scale = scale - 0.1
      } else if (sc > 0) {
        scale = scale + 0.1
      } else {
        scale = 1
      }
      this.diagram.commandHandler.resetZoom(scale)
    },
    setLabelColor(color) {
      this.diagram.selection.each(part => {
        if (part.data.type === 'text') {
          mapi.labelSetColor(this.pageName, part.data.id, color).then(() => {
            part.data.fontColor = color
            this.diagram.model.updateTargetBindings(part.data)
          })
        }
      })
    },
    setLabelSize(fontSize) {
      fontSize = fontSize || 10
      fontSize = Math.max(6, fontSize)
      this.diagram.selection.each(part => {
        if (part.data.type === 'text') {
          mapi.labelSetSize(this.pageName, part.data.id, fontSize).then(() => {
            part.data.fontSize = fontSize
            this.diagram.model.updateTargetBindings(part.data)
          })
        }
      })
    },
    justify(dir) {
      dir = dir || 'left'
      this.justifyItems(dir, 'text', (data) => {
        mapi.labelMove(this.pageName, data.id, data.x, data.y).then(() => {
          this.diagram.model.updateTargetBindings(data)
        })
      })
      this.justifyItems(dir, 'block', (data) => {
        mapi.blockSetPos(data.id, data.x, data.y).then(() => {
          this.diagram.model.updateTargetBindings(data)
        })
      })
      this.justifyItems(dir, 'pin', (data) => {
        mapi.pinMove(this.pageName, data.id, data.x, data.y).then(() => {
          this.diagram.model.updateTargetBindings(data)
        })
      })
      this.justifyItems(dir, 'valuebox', (data) => {
        mapi.vbMove(this.pageName, data.id, data.x, data.y).then(() => {
          this.diagram.model.updateTargetBindings(data)
        })
      })
    },

    justifyItems(dir, itemType, updateFunc) {
      var minX = 9999999
      var minY = 9999999
      var maxX = -9999999
      var maxY = -9999999
      var datas = []
      this.diagram.selection.each(part => {
        if (part.data.type === itemType) {
          minX = Math.min(part.data.x, minX)
          minY = Math.min(part.data.y, minY)
          maxX = Math.max(part.data.x, maxX)
          maxY = Math.max(part.data.y, maxY)
          datas.push(part.data)
        }
      })
      if (dir === 'left') {
        for (let i = 0; i < datas.length; i++) {
          datas[i].x = minX
          if (updateFunc) {
            updateFunc(datas[i])
          }
        }
      } if (dir === 'right') {
        for (let i = 0; i < datas.length; i++) {
          datas[i].x = maxX
          if (updateFunc) {
            updateFunc(datas[i])
          }
        }
      } else if (dir === 'top') {
        for (let i = 0; i < datas.length; i++) {
          datas[i].y = minY
          if (updateFunc) {
            updateFunc(datas[i])
          }
        }
      } else if (dir === 'bottom') {
        for (let i = 0; i < datas.length; i++) {
          datas[i].y = maxY
          if (updateFunc) {
            updateFunc(datas[i])
          }
        }
      } else if (dir === 'distribute-vertical') {
        // 对 parts 排序
        datas = datas.sort((a, b) => { return a.y - b.y })
        // 设置位置
        for (let i = 1; i < datas.length - 1; i++) {
          let y = minY + (maxY - minY) / (datas.length - 1) * i
          datas[i].y = y
          if (updateFunc) {
            updateFunc(datas[i])
          }
        }
      } else if (dir === 'distribute-horizontal') {
        // 对 parts 排序
        datas = datas.sort((a, b) => { return a.x - b.x })
        // 设置位置
        for (let i = 1; i < datas.length - 1; i++) {
          let x = minX + (maxX - minX) / (datas.length - 1) * i
          datas[i].x = x
          if (updateFunc) {
            updateFunc(datas[i])
          }
        }
      }
    },

    saveReplaceConfig() {
      globalModelReplaces = _.cloneDeep(this.replaces)
    },
    reloadReplaceConfig() {
      this.replaces = _.cloneDeep(globalModelReplaces)
    },

    appendReplaces() {
      this.replaces = this.replaces || []
      this.replaces.push({
        old: '',
        new: ''
      })
    },
    removeReplaces(idx) {
      this.replaces.splice(idx, 1)
    },
    replacePaste() {
      this.saveReplaceConfig()
      this.diagram.commandHandler.pasteFromClipboard(true)
      this.pasteDialogVisible = false
    },
    updatePin(pinid, name) {
      for (var nodeData of this.diagram.model.nodeDataArray) {
        if (nodeData.type === 'pin' && nodeData.id === pinid) {
          if (name) {
            nodeData.name = name
            this.diagram.model.updateTargetBindings(nodeData)
          } else {
            mapi.pinGet(this.pageName, nodeData.id).then(pin => {
              nodeData.name = pin.name || ''
              this.diagram.model.updateTargetBindings(nodeData)
            }).catch(() => {})
          }
        }
      }
    },
    gotoPage(bid) {
      mapi.blockGetPage(bid).then(res => {
        this.$router.push({
          path: '/engineer/model/edit/' + res.name,
          query: { selblk: bid }
        })
        this.$emit(`global:selblk`, { id: bid })
      })
    },
    gotoPinRefAndDef(data) {
      let goDef = false
      let goRef = false
      let varName = (data && data.name) || ''
      if (!varName) {
        return
      }
      this.diagram.links.each(part => {
        if (part.data.from === data.key) {
          goDef = true
        }
        if (part.data.to === data.key) {
          goRef = true
        }
      })
      mapi.varGetDetailByName(varName).then(res => {
        if (goDef || goRef) {
          // 有连线
          if (goDef && res.defs && res.defs.length >= 1) {
            this.gotoPage(res.defs[0].id)
          } else if (goRef && res.refs && res.refs.length === 1) {
            this.gotoPage(res.refs[0].id)
          } else {
            search({
              skey: varName
            })
          }
        } else {
          // 没有连线时, 先尝试跳转到定义, 没有定义的话跳转到引用.
          if (res.defs && res.defs.length >= 1) {
            this.gotoPage(res.defs[0].id)
          } else if (res.refs && res.refs.length >= 1) {
            this.gotoPage(res.refs[0].id)
          } else {
            search({
              skey: varName
            })
          }
        }
      }).catch(() => {})
    },
    setPinVar(data) {
      this.$prompt('请输入引脚变量', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: data.name || ''
      }).then(({ value }) => {
        return mapi.pinSet(this.pageName, data.id, value, '')
      }).then(pin => {
        this.updatePin(pin.id, pin.name)
      }).catch(() => {})
    },
    selectNode(node) {
      this.diagram.select(node)
      let point = new go.Point(node.position.x, node.position.y)
      point.x -= 400
      point.y -= 200
      this.diagram.position = point
    },
    contextClick(e, obj) {
      console.log(e)
      var documentPoint = e.documentPoint

      let baseItems = [
        {
          label: '刷新', icon: 'bi-arrow-repeat', divided: true, disabled: false,
          onClick: () => { this.readPage() }
        },
        {
          label: '粘贴', icon: 'bi-clipboard-heart', divided: false, disabled: !window.modelClipboard,
          onClick: () => { this.reloadReplaceConfig(); this.pasteDialogVisible = true }
        },
        {
          label: '新建', icon: 'bi-plus-square', divided: false, disabled: false,
          children: [
            {
              label: '引脚', icon: 'bi-link', divided: false, disabled: false,
              onClick: () => {
                var x = documentPoint.x
                var y = documentPoint.y
                mapi.pinNew(this.pageName, '', x, y).then(res => {
                  this.addPinToDiagram({
                    id: res.id,
                    x: x,
                    y: y,
                    name: ''
                  })
                }).catch(err => {
                  console.error('pinNew err: ', err)
                })
              }
            },
            {
              label: '文本', icon: 'bi-textarea-t', divided: false, disabled: false,
              onClick: () => {
                let label = {
                  text: '新添加的文本',
                  x: documentPoint.x,
                  y: documentPoint.y
                }
                mapi.labelNew(this.pageName, label).then(res => {
                  this.addTextToDiagram({
                    ...label,
                    id: res.id
                  })
                }).catch(err => {
                  console.error('labelNew err: ', err)
                })
              }
            },
            {
              label: '数显', icon: 'bi-123', divided: false, disabled: false,
              onClick: () => {
                var x = documentPoint.x
                var y = documentPoint.y
                mapi.vbNew(this.pageName, '', x, y).then(res => {
                  this.addValueboxToDiagram({
                    id: res.id,
                    x: x,
                    y: y,
                    var: ''
                  })
                }).catch(err => {
                  console.error('vbNew err: ', err)
                })
              }
            }
          ]
        },
        {
          label: '对齐', icon: 'bi-justify-left', divided: true, disabled: false,
          children: [
            {
              label: '左对齐', icon: 'bi-align-start', divided: false, disabled: false,
              onClick: () => { this.justify('left') }
            },
            {
              label: '右对齐', icon: 'bi-align-end', divided: false, disabled: false,
              onClick: () => { this.justify('right') }
            },
            {
              label: '上对齐', icon: 'bi-align-top', divided: false, disabled: false,
              onClick: () => { this.justify('top') }
            },
            {
              label: '下对齐', icon: 'bi-align-bottom', divided: false, disabled: false,
              onClick: () => { this.justify('bottom') }
            },
            {
              label: '水平等距', icon: 'bi-distribute-horizontal', divided: false, disabled: false,
              onClick: () => { this.justify('distribute-horizontal') }
            },
            {
              label: '垂直等距', icon: 'bi-distribute-vertical', divided: false, disabled: false,
              onClick: () => { this.justify('distribute-vertical') }
            }
          ]
        }
      ]
      let periods = [10, 50, 100, 200, 500, 1000]
      let periodChildren = periods.map((period) => {
        return {
          label: `${period}ms`, icon: 'bi-alarm', divided: false, disabled: false,
          onClick: () => {
            this.diagram.selection.each(part => {
              if (part.data.type === 'block') {
                mapi.setTick(part.data.id, period)
              }
            })
          }
        }
      })
      let frozeItems = [
        {
          label: '冻结', icon: 'bi-pause-btn', divided: false, disabled: false,
          onClick: () => {
            this.diagram.selection.each(part => {
              if (part.data.type === 'block') {
                let fname = part.data.name + '/$FROZEN'
                rapi.setValue(fname, 1)
              }
            })
          }
        },
        {
          label: '解冻', icon: 'bi-play-btn', divided: false, disabled: false,
          onClick: () => {
            this.diagram.selection.each(part => {
              if (part.data.type === 'block') {
                let fname = part.data.name + '/$FROZEN'
                rapi.setValue(fname, 0)
              }
            })
          }
        },
        {
          label: '计算周期', icon: 'bi-alarm', divided: true, disabled: false,
          children: periodChildren
        }
      ]
      let blockItems = [
        {
          label: '复制模块名', icon: 'bi-box-fill', divided: false, disabled: false,
          onClick: () => {
            var blockName = (obj && obj.part && obj.part.data && obj.part.data.name) || ''
            this.$copyText(blockName)
            this.$msg(blockName, '复制模块名')
          }
        },
        {
          label: '更改模块名', icon: 'bi-pencil-square', divided: false, disabled: false,
          onClick: () => {
            e.diagram.commandHandler.editTextBlock(e.part)
          }
        },
        {
          label: '打开算法', icon: 'bi-three-dots', divided: false, disabled: false,
          onClick: () => {
            var contextmenu = obj.part
            var nodedata = contextmenu.data
            e.diagram.vuecontext.$router.push({ path: '/engineer/alg/edit/' + nodedata.alg })
          }
        },
        {
          label: '旋转90°', icon: 'bi-arrow-clockwise', divided: true, disabled: false,
          onClick: () => {
            var contextmenu = obj.part
            var nodedata = contextmenu.data
            var direction = (nodedata.direction + 1) % 4
            mapi.setDirection(nodedata.id, direction).then(() => {
              e.diagram.model.set(nodedata, 'direction', direction)
            }).catch(err => {
              this.$msg.error(err, '旋转失败')
            })
          }
        }
      ]
      let pinItems = [
        {
          label: '设置引脚变量', icon: 'bi-pencil-square', divided: true, disabled: false,
          onClick: () => {
            this.setPinVar(obj.part.data)
          }
        }
      ]
      let hiddenItems = [
        {
          label: this.project.editorHiddenBlockName ? '显示模块名' : '隐藏模块名',
          icon: this.project.editorHiddenBlockName ? 'bi-eye' : 'bi-eye-slash',
          divided: false, disabled: false,
          onClick: () => {
            this.$store.dispatch('hiddenBlockName', !this.project.editorHiddenBlockName)
            this.readPage()
          }
        },
        {
          label: this.project.editorHiddenLineValue ? '显示连线值' : '隐藏连线值',
          icon: this.project.editorHiddenLineValue ? 'bi-eye' : 'bi-eye-slash',
          divided: false, disabled: false,
          onClick: () => {
            this.$store.dispatch('hiddenLineValue', !this.project.editorHiddenLineValue)
            this.readPage()
          }
        }
      ]

      let containsBlock = false
      this.diagram.selection.each(part => {
        if (part.data.type === 'block') {
          containsBlock = true
        }
      })
      this.$contextmenu({
        items: [
          // 基本操作
          ... baseItems,
          // 冻结操作
          ... containsBlock ? frozeItems : [],
          // 模块操作
          ... ((obj && obj.part && obj.part.data && obj.part.data.type === 'block') ? blockItems : []),
          // pin操作
          ... ((obj && obj.part && obj.part.data && obj.part.data.type === 'pin') ? pinItems : []),
          // 显隐操作
          ... hiddenItems
        ],
        event: e.event,
        zIndex: 12003,
        minWidth: 148
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/variables.scss";
  .app-container {
    padding: 0;
    margin: 0;
  }
  .diagram {
    width: 100%;
    height: calc(100vh - #{$navbarHeight} - #{$tagsviewHeight});
    background-color: #f0f0f0;
  }
  .tools {
    z-index: 3;
    position: fixed;
    top: calc(#{$navbarHeight} + #{$tagsviewHeight} + 4px);
    right: 64px;
    width: auto;
    height: 30px;
    padding-left: 8px;
    padding-right: 8px;
    background-color: #e8e8e8;
    opacity: 0.3;
    border: 1px solid #c0c0c0;
    border-radius: 8px;
    display: flex;
    justify-content: space-around;
    align-items: center;

    &:hover {
      opacity: 1;
    }

    .button {
      user-select: none;
      cursor: pointer;
      min-width: 18px;
      min-height: 18px;
      opacity: 0.8;
      border-radius: 4px;
      padding: 2px;
      font-size: 18px;

      &:hover {
        opacity: 1;
        background-color: #f8f8f8;
        font-size: 20px;
        color: blue;
      }
    }
    .split {
      user-select: none;
      min-width: 6px;
      min-height: 18px;
      opacity: 0.3;
    }
  }
</style>
