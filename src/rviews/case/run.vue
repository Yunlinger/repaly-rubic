<template>
  <div class="app-container" style="padding: 6px;">
    <div class="diagram" style="width: 100%; display: flex; justify-content: space-between">
      <div :id="diagramID" style="flex-grow: 1; background-color: #282c34;"></div>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/case'
import go from 'gojs'

const $ = go.GraphObject.make

export default {
  name: 'CaseRunning',
  data() {
    return {
      case: null,
      logging: false,
      steps: [],
      lastNode: null,
      diagram: null,
      diagramID: 'diagramID',
      nodeData: [],
      linkData: []
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
    this.diagramID = 'CaseDiagramRunning'
    this.$nextTick(() => {
      this.initDiagram()
    })
    if (this.id > 0) {
      this.fetchData()
    }
    this.tempRoute = Object.assign({}, this.$route)
    this.$on('global:case.step.finish', msg => {
      if (msg.data.caseid === this.case.id) {
        let step = this.case.stepList[msg.data.stepid]
        if (step) {
          step.status = msg.data.status
          this.diagram && this.diagram.model.updateTargetBindings(step)
        }
      }
    })
    this.$on('global:case.finish', msg => {
      if (msg.data.caseid === this.case.id) {
        this.$msg.success('考试结束，分数: ' + msg.data.score)
        this.fetchData()
      }
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
            allowCopy: false,
            allowDelete: false,
            allowDrop: false,
            allowMove: false,
            allowLink: false,
            layout: $(go.LayeredDigraphLayout,
              {
                direction: 90,
                layerSpacing: 2,
                angle: 90
              })
          })

      // define the Node templates
      this.diagram.nodeTemplateMap.add('',
        $(go.Node, 'Auto',
          $(go.Shape, 'RoundedRectangle', { fill: 'wheat' },
            new go.Binding('fill', 'status', function(status) {
              if (status === 1) {
                return 'green'
              } else if (status === 2) {
                return 'red'
              } else if (status === 3) {
                return '#600000'
              }
              return 'wheat'
            })
          ),
          $(go.Panel, 'Table',
            $(go.RowColumnDefinition,
              { row: 0, alignment: go.Spot.Top }),
            $(go.RowColumnDefinition,
              { row: 4, alignment: go.Spot.Bottom }),
            $(go.TextBlock, // the node title
              { column: 0, row: 1, columnSpan: 3,
                alignment: go.Spot.Center,
                font: 'bold 10pt sans-serif',
                margin: new go.Margin(5, 10),
                editable: false
              },
              new go.Binding('text', 'name')),
            $(go.TextBlock, // the node title
              { column: 0, row: 2, columnSpan: 3,
                alignment: go.Spot.Left,
                font: '8pt sans-serif',
                margin: new go.Margin(0, 2, 10, 2),
                editable: false,
                stroke: '#080808'
              },
              new go.Binding('text', 'score', function(score) {
                return '分值: ' + (score || 0)
              })),
            $(go.Panel, 'Vertical',
              { row: 0, column: 1 },
              $(go.Shape, 'Circle',
                // { width: 6, height: 6, portId: 'IN', toSpot: go.Spot.Top, fill: 'blue' },
                {
                  desiredSize: new go.Size(8, 8),
                  toLinkableSelfNode: false,
                  fill: 'blue',
                  stroke: 'blue',
                  strokeWidth: 2, // no stroke
                  portId: 'IN', // declare this object to be a "port"
                  toSpot: go.Spot.Top, // declare where links may connect at this port
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
              )
            ),
            $(go.Panel, 'Vertical',
              { row: 4, column: 1, columnSpan: 2 },
              $(go.Shape, 'Circle',
                // { width: 6, height: 6, portId: 'OUT', fromSpot: go.Spot.Bottom, fill: 'blue' }
                {
                  desiredSize: new go.Size(6, 6),
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
          )
        )
      )

      this.diagram.nodeTemplateMap.add('Start',
        $(go.Node, 'Auto',
          { locationSpot: go.Spot.Center },
          $(go.Shape, 'Diamond',
            {
              fill: 'deepskyblue', stroke: null, strokeWidth: 0,
              desiredSize: new go.Size(48, 48)
            }),
          $(go.TextBlock,
            new go.Binding('text', 'name')),
          this.makePort('OUT', go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ))

      this.diagram.nodeTemplateMap.add('End',
        $(go.Node, 'Auto',
          { locationSpot: go.Spot.Center },
          $(go.Shape, 'Circle',
            {
              fill: 'deepskyblue', stroke: null, strokeWidth: 0,
              desiredSize: new go.Size(42, 42)
            }),
          $(go.TextBlock,
            new go.Binding('text', 'name')),
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
            corner: 5,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: false,
            resegmentable: false
          },
          $(go.Shape,
            { stroke: 'gray', strokeWidth: 1.5 }),
          $(go.Shape,
            { toArrow: 'Standard', stroke: 'gray', fill: 'gray' }
          )
        )

      var model = $(go.GraphLinksModel)
      model.linkFromPortIdProperty = 'fromPort'
      model.linkToPortIdProperty = 'toPort'
      model.nodeKeyProperty = 'id'
      this.diagram.model = model
    },
    updateDiagram() {
      if (!this.diagram) {
        return
      }
      this.diagram.clear()
      for (let sid in this.case.stepList) {
        let step = this.case.stepList[sid]
        this.diagram.model.addNodeData(step)
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
      }
      // this.diagram.startTransaction('')
      this.diagram.contentAlignment = go.Spot.Center
      // this.diagram.commitTransaction('')
    },
    fetchData() {
      api.taskGet(this.id).then(res => {
        res = res || {}
        this.case = res
        this.case.stepList = this.case.stepList || {}
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
    dispatchCurrent() {
      api.dispatch(this.case.id).then(() => {
        this.$msg.success('下发成功')
        this.fetchData()
      }).catch(() => {})
    },
    startCurrent() {
      api.start(this.case.id).then(() => {
        this.$msg.success('考试考试')
        this.fetchData()
      }).catch(() => {})
    },
    giveupCurrent() {
      api.giveup(this.case.id).then(() => {
        this.$msg.warning('放弃考试')
        this.fetchData()
      }).catch(() => {})
    },
    commitCurrent() {
      api.commit(this.case.id).then(() => {
        this.$msg.success('提交考试成功')
        this.fetchData()
      }).catch(() => {})
    },
    openCase(id) {
      this.id = id
      this.fetchData()
      console.log('openCase', id)
    }
  }
}
</script>

<style lang="scss" scoped>
  .diagram{
    width: 100%;
    height: calc(100vh - 82px);
    background-color: #f0f0f0;
  }
</style>
