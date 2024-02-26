<template>
  <div class="app-container" style="padding: 2px;">
    <div class="diagram" style="width: 100%; display: flex; justify-content: space-between">
      <div :id="palleteID" style="width: 100px; margin-right: 2px; background-color: #282c34;"></div>
      <div :id="diagramID" style="flex-grow: 1; background-color: #282c34;"></div>
      <div style="width: 300px">
        <property-edit
          :diagram="diagram"
          :cas="cas"
          :faultItems="faultItems"
          :conditionItems="conditionItems"
          @save="saveCurrent"
          @dispatch="dispatchAndStartCurrent"
          @commit="commitCurrent"
          @startLog="startLog"
          @stopLog="stopLog"
          @batch="batch"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/case'
import go from 'gojs'
import PropertyEdit from './component/PropertyEdit'
import _ from 'lodash'
import * as rapi from '@/api/rtdb'
import * as condApi from '@/api/condition'
import * as faultApi from '@/api/fault'

const $ = go.GraphObject.make

function toLocation(data, node) {
  return new go.Point(data.x, data.y)
}

function fromLocation(loc, data, model) {
  model.setDataProperty(data, 'x', loc.x)
  model.setDataProperty(data, 'y', loc.y)
}

export default {
  name: 'CaseEdit',
  components: { PropertyEdit },
  data() {
    return {
      case: null,
      faultItems: {},
      conditionItems: {},
      logging: false,
      steps: [],
      lastNode: null,
      diagram: null,
      diagramID: 'diagramID',
      palleteID: 'palleteID',
      nodeData: [],
      linkData: [],
      dispatched: false // 当前案例是否下发.
    }
  },
  computed: {
    cas: function() {
      return this.case
    }
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
    this.diagram && this.diagram.clear()
  },
  mounted() {
    const id = this.$route.params && this.$route.params.id
    this.id = parseInt(id)
    this.diagramID = 'CaseDiagram_' + this.id
    this.diagramID = 'CasePallete_' + this.id
    this.$nextTick(() => {
      this.initDiagram()
    })
    condApi.listCond().then(resp => {
      this.conditionItems = resp.items || {}
      return faultApi.list()
    }).then(resp => {
      this.faultItems = resp.items || {}
    }).then(() => {
      if (this.id > 0) {
        this.fetchData()
      }
    })

    this.tempRoute = Object.assign({}, this.$route)

    // 监听任务下发
    this.$on('global:public.case.dispatch', msg => {
      console.log(msg)
      // 有新任务下发, 判断是否是当前案例
      if (msg.data.p === this.$store.getters.project.project &&
          msg.data.m === this.$store.getters.project.model &&
          msg.data.i === this.$store.getters.project.id &&
          msg.data.id === (this.case || {}).id) {
        this.dispatched = true
        // 重置当前的 status
        for (let id in this.case.stepList) {
          let step = this.case.stepList[id]
          step.status = 0
          this.diagram && this.diagram.model.updateTargetBindings(step)
        }
      }
    })
    this.$on('global:case.step.finish', msg => {
      if (msg.data.caseid === this.case.id) {
        let step = this.case.stepList[msg.data.stepid]
        if (step) {
          // refresh
          step.status = msg.data.status
          this.diagram && this.diagram.model.updateTargetBindings(step)
        }
      }
    })
    this.$on('global:case.finish', msg => {
      this.dispatched = false
      if (msg.data.caseid === this.case.id) {
        this.$msg.success('考试结束，分数: ' + msg.data.score)
      }
    })

    // 监听操作记录
    this.$on('global:log', msg => {
      if (!this.logging || msg.data.op !== 'setValue') {
        return
      }

      let type = msg.data.pn.endsWith('_CHK') ? 2 : 1

      let devicePn = msg.data.pn
      if (type === 2) {
        devicePn = msg.data.pn.split('_CHK')[0]
      }

      let node = {
        type: type,
        name: type === 1 ? '下令' : '检查',
        opvar: msg.data.pn,
        opval: msg.data.value || 0,
        score: 2
      }

      rapi.varGetDetail(devicePn).then(detail => {
        if (detail.desc) {
          node.name = node.name + ':' + detail.desc
        } else {
          node.name = node.name + ':' + devicePn
        }
      }).catch(() => {
        node.name = node.name + ':' + devicePn
      }).finally(() => {
        this.diagram.model.addNodeData(node)
        if (this.lastNode) {
          this.diagram.model.addLinkData({
            from: this.lastNode.id,
            to: node.id,
            fromPort: 'OUT',
            toPort: 'IN'
          })
        }
        this.lastNode = node
      })
    })
  },
  methods: {
    makePort(name, align, spot, output, input) {
      // var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom)
      // the port is basically just a transparent rectangle that stretches along the side of the node,
      // and becomes colored when the mouse passes over it
      return $(go.Shape, 'Circle',
        {
          desiredSize: new go.Size(6, 6),
          toLinkableSelfNode: false,
          fill: input ? 'blue' : 'green',
          stroke: input ? 'blue' : 'green',
          strokeWidth: 0, // no stroke
          alignment: align, // align the port on the main Shape
          // stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
          portId: name, // declare this object to be a "port"
          fromSpot: spot, // declare where links may connect at this port
          fromLinkable: output, // declare whether the user may draw links from here
          toSpot: spot, // declare where links may connect at this port
          toLinkable: input, // declare whether the user may draw links to here
          cursor: 'crosshair', // show a different cursor to indicate potential link point
          toMaxLinks: 128,
          fromMaxLinks: 128
        })
    },
    initDiagram() {
      this.diagram =
        $(go.Diagram, this.diagramID, // must be the ID or reference to div
          {
            initialContentAlignment: go.Spot.Center,
            allowCopy: true, // would need to End copied nodes and links to
            allowDelete: true,
            allowDrop: true,
            allowMove: true,
            // 画布边距
            padding: 200
          })

      let bluegrad = $(go.Brush, 'Linear', { 0: '#C4ECFF', 1: '#70D4FF' })
      // let greengrad = $(go.Brush, 'Linear', { 0: '#B1E2A5', 1: '#7AE060' })
      let redgrad = $(go.Brush, 'Linear', { 0: '#F18080', 1: '#DA8080' })
      // let prograd = $(go.Brush, 'Linear', { 0: '#70D4FF', 1: '#117272' })

      // the default node template
      this.diagram.nodeTemplateMap.add('',
        $(go.Node, 'Vertical',
          { locationObjectName: 'BODY', selectionObjectName: 'BODY' },
          new go.Binding('location', '', toLocation).makeTwoWay(fromLocation),
          // the main 'BODY' consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, 'Auto',
            $(go.Shape, 'RoundedRectangle',
              { name: 'BODY' },
              { fill: bluegrad, strokeWidth: 2, stroke: bluegrad },
              new go.Binding('fill', 'status', function(status) {
                if (status === 1 || status === 2) {
                  return redgrad
                } else {
                  return bluegrad
                }
              })
            ),
            $(go.Panel, 'Vertical',
              { margin: 0 },
              $(go.Panel, 'Horizontal',
                $(go.Panel, 'Horizontal',
                  { padding: new go.Margin(0, 10, 0, 0) }
                ),
                $(go.Shape, 'Circle',
                  // { width: 6, height: 6, portId: 'IN', toSpot: go.Spot.Top, fill: 'blue' },
                  {
                    desiredSize: new go.Size(8, 8),
                    toLinkableSelfNode: false,
                    fill: 'blue',
                    stroke: 'blue',
                    strokeWidth: 2, // no stroke
                    portId: 'IN', // declare this object to be a "port"
                    toSpot: go.Spot.Top,
                    toLinkable: true, // declare whether the user may draw links to here
                    cursor: 'crosshair', // show a different cursor to indicate potential link point
                    toMaxLinks: 128
                  },
                  new go.Binding('fill', 'parentLogic', function(logic) {
                    if (logic > 0) {
                      return 'transparent'
                    } else if (logic < 0) {
                      return 'transparent'
                    }
                    return 'blue'
                  }),
                  new go.Binding('strokeWidth', 'parentLogic', function(logic) {
                    if (logic < 0) {
                      return 0
                    }
                    return 2
                  })
                ),
                $(go.Panel, 'Horizontal',
                  { padding: new go.Margin(0, 0, 0, 10) },
                  $(go.Shape, 'Circle',
                    // { width: 6, height: 6, portId: 'IN', toSpot: go.Spot.Top, fill: 'blue' },
                    {
                      desiredSize: new go.Size(4, 4),
                      toLinkableSelfNode: false,
                      fill: 'blue',
                      stroke: 'blue',
                      strokeWidth: 2, // no stroke
                      portId: 'Enable', // declare this object to be a "port"
                      toSpot: go.Spot.Top, // declare where links may connect at this port
                      toLinkable: true, // declare whether the user may draw links to here
                      cursor: 'crosshair', // show a different cursor to indicate potential link point
                      toMaxLinks: 128
                    }
                  )
                )
              ),
              // the title
              $(go.TextBlock,
                {
                  font: 'bold 12pt Verdana, sans-serif',
                  textAlign: 'left',
                  maxSize: new go.Size(240, NaN),
                  wrap: go.TextBlock.WrapFit,
                  editable: true
                },
                new go.Binding('text', 'name').makeTwoWay()
              ),
              // the optional list of actions
              $(go.Panel, 'Vertical',
                // with the list data bound in the Vertical Panel
                $(go.Panel, 'Vertical',
                  {
                    name: 'COLLAPSIBLE', // identify to the PanelExpanderButton
                    padding: 2,
                    stretch: go.GraphObject.Horizontal, // take up whole available width
                    background: 'white', // to distinguish from the node's body
                    defaultAlignment: go.Spot.Left // thus no need to specify alignment on each element
                  },
                  $(go.Panel, 'Horizontal',
                    $(go.TextBlock,
                      { text: '类型: ', font: '10pt Verdana, sans-serif', stroke: 'blue' }
                    ),
                    $(go.TextBlock,
                      { font: '10pt Verdana, sans-serif', stroke: 'red' },
                      new go.Binding('text', 'type', function(type) {
                        type = type || 0
                        if (typeof type !== 'number') {
                          type = 0
                        }
                        if (type > 4 || type < 0) {
                          type = 0
                        }
                        return ['空', '下令', '检查', '现地', '反馈'][type]
                      })
                    )
                  ),
                  $(go.Panel, 'Horizontal',
                    $(go.TextBlock,
                      { text: '描述: ', font: '10pt Verdana, sans-serif', stroke: 'blue' }
                    ),
                    $(go.TextBlock,
                      {
                        font: '10pt Verdana, sans-serif',
                        maxSize: new go.Size(240, NaN),
                        wrap: go.TextBlock.WrapDesiredSize,
                        editable: true
                      },
                      new go.Binding('text', 'tip').makeTwoWay()
                    )
                  ),
                  $(go.Panel, 'Horizontal',
                    $(go.TextBlock,
                      { text: '变量: ', font: '10pt Verdana, sans-serif', stroke: 'blue' }
                    ),
                    $(go.TextBlock,
                      {
                        font: '10pt Verdana, sans-serif',
                        maxSize: new go.Size(240, NaN),
                        wrap: go.TextBlock.WrapDesiredSize,
                        editable: true
                      },
                      new go.Binding('text', 'opvar').makeTwoWay()
                    )
                  ),
                  $(go.Panel, 'Horizontal',
                    $(go.TextBlock,
                      { text: '分值: ', font: '10pt Verdana, sans-serif', stroke: 'blue' },
                      new go.Binding('visible', 'score', function(score) { return !!score })
                    ),
                    $(go.TextBlock,
                      { font: '10pt Verdana, sans-serif' },
                      new go.Binding('text', 'score'),
                      new go.Binding('visible', 'score', function(score) { return !!score })
                    )
                  )
                ) // end action list Vertical Panel
              ), // end optional Vertical Panel
              $(go.Panel, 'Vertical',
                $(go.Shape, 'Circle',
                  {
                    desiredSize: new go.Size(8, 8),
                    toLinkableSelfNode: false,
                    fill: 'green',
                    stroke: 'green',
                    strokeWidth: 1, // no stroke
                    portId: 'OUT', // declare this object to be a "port"
                    fromSpot: go.Spot.Bottom, // declare where links may connect at this port
                    fromLinkable: true, // declare whether the user may draw links from here
                    cursor: 'crosshair', // show a different cursor to indicate potential link point
                    fromMaxLinks: 128
                  }
                )
              )
            ) // end outer Vertical Panel
          )
        )
      )
      // define the Node templates
      this.diagram.nodeTemplateMap.add('Start',
        $(go.Node, 'Auto',
          { locationSpot: go.Spot.Center },
          new go.Binding('location', '', toLocation).makeTwoWay(fromLocation),
          $(go.Shape, 'Diamond',
            {
              fill: 'deepskyblue', stroke: null, strokeWidth: 0,
              desiredSize: new go.Size(48, 48)
            },
            new go.Binding('fill', 'status', function(status) {
              if (status === 1 || status === 2) {
                return redgrad
              } else {
                return bluegrad
              }
            })),
          $(go.TextBlock,
            new go.Binding('text', 'name')),
          this.makePort('OUT', go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ))

      this.diagram.nodeTemplateMap.add('End',
        $(go.Node, 'Auto',
          { locationSpot: go.Spot.Center },
          new go.Binding('location', '', toLocation).makeTwoWay(fromLocation),
          $(go.Shape, 'Circle',
            {
              fill: 'deepskyblue', stroke: null, strokeWidth: 0,
              desiredSize: new go.Size(42, 42)
            },
            new go.Binding('fill', 'status', function(status) {
              if (status === 1 || status === 2) {
                return redgrad
              } else {
                return bluegrad
              }
            })),
          $(go.TextBlock,
            new go.Binding('text', 'name')),
          // this.makePort('IN', go.Spot.Top, go.Spot.TopSide, false, true)
          $(go.Shape, 'Circle',
            {
              desiredSize: new go.Size(6, 6),
              toLinkableSelfNode: false,
              fill: 'blue',
              stroke: 'blue',
              alignment: go.Spot.Top,
              strokeWidth: 2, // no stroke
              portId: 'IN', // declare this object to be a "port"
              toSpot: go.Spot.Top, // declare where links may connect at this port
              toLinkable: true, // declare whether the user may draw links to here
              cursor: 'crosshair', // show a different cursor to indicate potential link point
              toMaxLinks: 128
            },
            new go.Binding('fill', 'parentLogic', function(logic) {
              if (!logic) {
                return 'blue'
              }
              return 'transparent'
            })
          )
        ))

      // define the Link template to be minimal
      this.diagram.linkTemplate =
        $(go.Link,
          {
            routing: go.Link.Orthogonal,
            corner: 10,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: false,
            resegmentable: false
          },
          $(go.Shape,
            { stroke: 'gray', strokeWidth: 2 },
            new go.Binding('stroke', '', function(data) {
              if (data.toPort === 'IN') {
                return 'green'
              }
              return 'gray'
            })
          ),
          $(go.Shape,
            { toArrow: 'Standard', stroke: 'gray', fill: 'gray' }
          )
        )

      var model = $(go.GraphLinksModel)
      model.linkFromPortIdProperty = 'fromPort'
      model.linkToPortIdProperty = 'toPort'
      model.nodeKeyProperty = 'id'
      this.diagram.model = model

      $(go.Palette, this.palleteID, // must name or refer to the DIV HTML element
        {
          // Instead of the default animation, use a custom fade-down
          layout: $(go.TreeLayout,
            { angle: 90, nodeSpacing: 1, layerSpacing: 3 }
          ),
          maxSelectionCount: 1,
          allowHorizontalScroll: false,
          allowVerticalScroll: false,
          contentAlignment: go.Spot.Center,
          nodeTemplateMap: this.diagram.nodeTemplateMap, // share the templates used by myDiagram
          model: new go.GraphLinksModel([ // specify the contents of the Palette
            { category: 'Start', name: '开始' },
            { category: '', parentLogic: 0, type: 1, score: 2, opvar: 'X', opval: 1, name: '下令' },
            { category: '', parentLogic: 0, type: 2, score: 2, opvar: 'X', name: '检查' },
            { category: '', parentLogic: 0, type: 3, score: 2, opvar: 'X', opval: 1, name: '现地' },
            { category: '', parentLogic: 0, type: 4, score: 2, checklogic: 1, opvar: 'X', opval: 1, name: '反馈' },
            { category: 'End', parentLogic: 0, name: '结束' }
          ])
        })
    },
    updateDiagram() {
      if (!this.diagram) {
        return
      }
      this.diagram.clear()

      // stepList 里面是否有坐标信息
      let hasPositionInStep = true
      for (let sid in this.case.stepList) {
        let step = this.case.stepList[sid]
        this.diagram.model.addNodeData(step)
        hasPositionInStep = hasPositionInStep && (step.x || step.y)
      }
      if (!hasPositionInStep) {
        this.diagram.layout = $(go.LayeredDigraphLayout,
          {
            direction: 90,
            layerSpacing: 10,
            columnSpacing: 15,
            angle: 90
          })
      } else {
        this.diagram.layout = $(go.Layout)
      }

      for (let sid in this.case.stepList) {
        let step = this.case.stepList[sid]
        for (let idx in step.parents) {
          let pid = step.parents[idx]
          this.diagram.model.addLinkData({
            from: pid,
            to: sid,
            fromPort: 'OUT',
            toPort: 'IN'
          })
        }
        for (let idx in step.enables) {
          let pid = step.enables[idx]
          this.diagram.model.addLinkData({
            from: pid,
            to: sid,
            fromPort: 'OUT',
            toPort: 'Enable'
          })
        }
      }
      this.diagram.startTransaction('')
      this.diagram.contentAlignment = go.Spot.Center
      this.diagram.commitTransaction('')
      if (!hasPositionInStep) {
        this.diagram.layout = $(go.Layout)
      }
    },
    fetchData() {
      api.taskGet(this.id).then(res => {
        res = res || {}
        this.case = res
        this.case.stepList = this.case.stepList || {}

        // 重置当前的 status
        if (this.case.id !== this.$store.getters.project.selectedInst.case) {
          for (let id in this.case.stepList) {
            let step = this.case.stepList[id]
            step.status = 0
          }
        }

        this.setTagsViewTitle()
        this.updateDiagram()
      }).catch(() => {})
    },
    setTagsViewTitle() {
      if (this.case) {
        const route = Object.assign({}, this.tempRoute, { title: `案例 - ${this.case.id} - ${this.case.name}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
    },
    saveCurrent() {
      // 根据现有图形构建 case 数据
      this.case.stepList = {}
      for (let nodeData of this.diagram.model.nodeDataArray) {
        let nData = _.cloneDeep(nodeData)
        delete (nData.key)
        delete (nData.__gohashid)
        this.case.stepList[nodeData.id] = nData
        this.case.stepList[nodeData.id].parents = [] // 上级关键节点
        this.case.stepList[nodeData.id].enables = [] // 被使能节点
        for (let linkData of this.diagram.model.linkDataArray) {
          if (parseInt(linkData.to) === parseInt(nodeData.id)) {
            if (linkData.toPort === 'IN') {
              this.case.stepList[nodeData.id].parents.push(parseInt(linkData.from))
            } else if (linkData.toPort === 'Enable') {
              this.case.stepList[nodeData.id].enables.push(parseInt(linkData.from))
            }
          }
        }
      }
      api.taskUpdate(this.case).then(() => {
        this.fetchData()
        return api.save()
      }).then(() => {
        this.$msg.success('保存成功')
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    dispatchAndStartCurrent() {
      api.dispatch(this.case.id).then(() => {
        this.$msg.success('下发成功')
        return api.start(this.case.id)
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    commitCurrent() {
      api.commit(this.case.id).then(() => {
        this.$msg.success('提交成功')
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    insertStep() {
      api.stepNew({ tid: this.id, name: '新建步骤' }).then(() => {
        this.fetchData()
      })
    },
    startLog() {
      this.logging = true
      this.$msg('开始录制')
    },
    stopLog() {
      this.logging = false
      this.$msg('停止录制')
    },
    batch() {
      this.$confirmWithInput('批量设置', [{
        caption: '输入步骤数量',
        value: 8
      }, {
        type: 'checkbox',
        caption: '建立下令模块',
        value: false
      }]).then(attrs => {
        let count = parseInt(attrs[0].value)
        let stepType = attrs[1].value ? 1 : 4
        if (count > 0) {
          if (!this.diagram) {
            return
          }
          this.diagram.clear()
          // this.diagram.layout = $(go.LayeredDigraphLayout,
          //   {
          //     direction: 90,
          //     layerSpacing: 10,
          //     columnSpacing: 15,
          //     angle: 90
          //   })

          const itemHeight = 168
          const itemWidth = 336
          const rowCount = 8
          this.diagram.model.addNodeData({ category: 'Start', name: '开始', id: -1, x: 100, y: 20 })
          this.diagram.model.addNodeData({
            category: 'End', name: '结束', id: -2,
            x: 100 + Math.floor((count + 1) / rowCount) * itemWidth,
            y: 100 + ((count + 1) % rowCount) * itemHeight
          })

          for (let i = 0; i < count; i++) {
            this.diagram.model.addNodeData({
              id: i + 1,
              x: 20 + Math.floor((i + 1) / rowCount) * itemWidth,
              y: 20 + ((i + 1) % rowCount) * itemHeight,
              category: '',
              parentLogic: 0,
              type: stepType,
              score: 2,
              opvar: 'OP_VAR_NAME',
              checklogic: 1,
              opval: 1,
              name: `第 ${i + 1} 步`,
              tip: (stepType === 1) ? `执行 XXXX 操作` : `打开 XXX 设备`
            })
            this.diagram.model.addLinkData({
              from: (i === 0) ? -1 : i,
              to: i + 1,
              fromPort: 'OUT',
              toPort: 'IN'
            })
            if (i === count - 1) {
              this.diagram.model.addLinkData({
                from: i + 1,
                to: -2,
                fromPort: 'OUT',
                toPort: 'IN'
              })
            }
          }

          this.diagram.startTransaction('')
          this.diagram.contentAlignment = go.Spot.Center
          this.diagram.commitTransaction('')

          // this.diagram.layout = $(go.Layout)
        }
      }).catch((err) => {
        console.error(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    padding: 8px;
    margin: 0;
    >>> .el-aside {
      padding: 0;
    }
  }
  .diagram{
    width: 100%;
    height: calc(100vh - 76px);
    background-color: #f0f0f0;
  }
</style>
