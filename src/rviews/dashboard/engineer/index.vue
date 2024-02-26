<template>
  <div class="app-container" style="padding: 6px;">
    <div class="diagram" style="width: 100%; display: flex; justify-content: space-between">
      <div id="engineerDashboardDiagram" style="flex-grow: 1; background-color: #ffffff;"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import go from 'gojs'
import * as mapi from '@/api/model'
import * as papi from '@/api/project'
import * as uapi from '@/api/user'
import * as gapi from '@/api/group'
// import * as rapi from '@/api/res'
import { formatModelTimeString } from '@/utils'

const $ = go.GraphObject.make

export default {
  name: 'EngineerDashboard',
  data() {
    return {
      logging: false,
      diagram: null,
      groups: [],
      projects: {},
      buttons: {}
    }
  },
  computed: {
    ...mapGetters([
      'roles',
      'user',
      'project'
    ]),
    currentModel: function() {
      return this.$store.getters.project.project + '.' + this.$store.getters.project.id
    },
    instances: function() {
      return this.$store.getters.project.instances
    }
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
    this.diagram && this.diagram.clear()
  },
  created() {
    // 初始化各个按钮

    this.buttons['新建实例'] = this.createButton('开发', (e, obj) => {
      var node = obj.part
      var data = node.data
      this.$prompt('请输入实例名称', '新建实例', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `👤${this.user.cname}\n💪🏻开发中...`
      }).then(({ value }) => {
        this.loading = this.$loading({
          lock: true,
          text: '正在创建实例: ' + value,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return papi.startInstance(data.name, 'model', value, 'dev')
      }).catch((err) => {
        this.$msg.error(err)
      }).finally(() => {
        this.loading && this.loading.close()
      })
    })

    this.buttons['拷贝工程'] = this.createButton('复制', (e, obj) => {
      var node = obj.part
      var data = node.data
      this.$prompt('请输入新工程名称', '复制工程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: data.key + '_copy'
      }).then(({ value }) => {
        this.loading = this.$loading({
          lock: true,
          text: '正在复制工程: ' + value,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        let gid = this.getGroupOfProject(data.key)
        return Promise.all([papi.addToGroup(value, gid), papi.create(value, data.key)])
      }).then(() => {
        this.$msg.success('拷贝完成')
        this.getProList()
      }).catch(err => {
        this.$msg.error(`失败: ${err}`)
      }).finally(() => {
        this.loading && this.loading.close()
      })
    })

    this.buttons['新建工程'] = this.createButton('+', (e, obj) => {
      this.$prompt('请输入新工程名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        return papi.create(value, '')
      }).then(() => {
        this.$msg.success('新建工程完成')
        this.getProList()
      }).catch(err => {
        this.$msg.error(err)
      })
    })

    this.buttons['删除工程'] = this.createButton('删除', (e, obj) => {
      var node = obj.part
      var data = node.data
      this.$prompt(`请输入工程名称 ${data.key} 进行确认`, '删除工程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value === data.key) {
          this.loading = this.$loading({
            lock: true,
            text: '正在删除工程: ' + value,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)'
          })
          let gid = this.getGroupOfProject(data.key)
          return Promise.all([papi.removeFromGroup(data.key, gid), papi.delet(value)])
        } else {
          return Promise.reject('输入工程名称不匹配')
        }
      }).then(() => {
        this.$msg.success('删除成功')
        this.getProList()
      }).catch(err => {
        this.$msg.error(err)
      }).finally(() => {
        this.loading && this.loading.close()
      })
    })

    this.buttons['运行'] = this.createButton('运行', (e, obj) => {
      let node = obj.part
      let data = node.data
      this.openProject(data.inst.project, data.inst.id).then(() => {
        mapi.modelStart(true).then(() => {})
      })
    })

    this.buttons['暂停'] = this.createButton('暂停', (e, obj) => {
      let node = obj.part
      let data = node.data
      this.openProject(data.inst.project, data.inst.id).then(() => {
        mapi.modelStart(false).then(() => {})
      })
    })

    this.buttons['设置'] = this.createButton('设置', (e, obj) => {
      let node = obj.part
      let data = node.data
      this.openProject(data.inst.project, data.inst.id).then(() => {
        this.$router.push({ path: '/engineer/model/setting' })
      })
    })

    this.buttons['退出'] = this.createButton('退出', (e, obj) => {
      var node = obj.part
      var data = node.data
      let { project, model, id, name } = data.inst
      this.$confirm(`确认退出实例 ${name}`, '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return papi.stopInstance(project, model, id)
      }).catch(() => {
      })
    })

    this.buttons['加速'] = this.createButton('加速', (e, obj) => {
      let node = obj.part
      let data = node.data
      let inst = data.inst
      inst.speed = inst.speed || 1
      inst.speed = inst.speed * 2
      this.openProject(data.inst.project, data.inst.id).then(() => {
        return papi.setInstSpeed(inst)
      }).catch(() => {})
    })

    this.buttons['常速'] = this.createButton('常速', (e, obj) => {
      let node = obj.part
      let data = node.data
      let inst = data.inst
      inst.speed = 1
      this.openProject(data.inst.project, data.inst.id).then(() => {
        return papi.setInstSpeed(inst)
      }).catch(() => {})
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.initDiagram()
      this.getProList()
      let onCreatedOrUpdated = (inst) => {
        let nodeData = this.buildInstDataForDiagram(inst)
        var data = this.diagram.model.findNodeDataForKey(nodeData.key)
        if (data) {
          for (let key in nodeData) {
            data[key] = nodeData[key]
          }
          this.diagram.model.updateTargetBindings(data)
        } else {
          // 在有工程节点的情况下新建
          var proNode = this.diagram.model.findNodeDataForKey(inst.project)
          if (proNode) {
            this.diagram.model.addNodeData(nodeData)
            this.diagram.model.addLinkData({
              from: inst.project,
              to: nodeData.key
            })
          }
        }
      }
      this.$on('global:store.updateInst', onCreatedOrUpdated)
      this.$on('global:store.deleteInst', (key) => {
        var part = this.diagram.findPartForKey(key)
        if (part) {
          this.diagram.remove(part)
        }
      })
      this.$on('global:connect.change', (msg) => {
        let u = msg.data
        u.key = u.id
        u.category = 'user'
        // 没有对应的实例, 不显示
        if (!this.diagram.model.findNodeDataForKey(this.formatInstKey(u.p, u.i))) {
          var part = this.diagram.findPartForKey(u.id)
          if (part) {
            this.diagram.remove(part)
          }
          return
        }
        if (!this.diagram.model.findNodeDataForKey(u.key)) {
          // 没有 user 节点，新建
          this.diagram.model.addNodeData(u)
        }
        // 删除到 u 的所有连线
        for (let linkdata of this.diagram.model.linkDataArray) {
          if (linkdata.to === u.id) {
            this.diagram.model.removeLinkData(linkdata)
          }
        }
        this.diagram.model.addLinkData({
          from: this.formatInstKey(u.p, u.i),
          to: u.id
        })
      })
      this.$on('global:connect.start', (msg) => {
        let u = msg.data
        u.key = u.id
        u.category = 'user'

        // 没有对应的实例, 不显示
        if (!this.diagram.model.findNodeDataForKey(this.formatInstKey(u.p, u.i))) {
          return
        }

        if (this.diagram.model.findNodeDataForKey(u.key)) {
          // 已经有当前 user 节点
          return
        }
        this.diagram.model.addNodeData(u)
        // 删除到 u 的所有连线
        for (let linkdata of this.diagram.model.linkDataArray) {
          if (linkdata.to === u.id) {
            this.diagram.model.removeLinkData(linkdata)
          }
        }
        this.diagram.model.addLinkData({
          from: this.formatInstKey(u.p, u.i),
          to: u.key
        })
      })
      this.$on('global:connect.stop', (msg) => {
        var part = this.diagram.findPartForKey(msg.data.id)
        if (part) {
          this.diagram.remove(part)
        }
      })
      this.$on('global:websocket.open', () => {
        // websocket 连接成功后刷新视图
        this.updateDiagram()
      })
    })
  },
  methods: {
    initDiagram() {
      let _this = this
      let myDiagram =
        $(go.Diagram, 'engineerDashboardDiagram',
          {
            initialContentAlignment: go.Spot.Center,
            allowCopy: false,
            allowMove: false,
            allowDelete: true,
            'draggingTool.dragsTree': true,
            'commandHandler.deletesTree': true,
            'undoManager.isEnabled': false,
            layout:
              $(go.TreeLayout,
                {
                  treeStyle: go.TreeLayout.StyleLastParents,
                  arrangement: go.TreeLayout.ArrangementHorizontal,
                  // properties for most of the tree:
                  angle: 90,
                  layerSpacing: 35,
                  // properties for the "last parents":
                  alternateAngle: 90,
                  alternateLayerSpacing: 35,
                  alternateAlignment: go.TreeLayout.AlignmentBus,
                  alternateNodeSpacing: 20
                })
          })
      this.diagram = myDiagram

      // when the document is modified, add a '*' to the title and enable the 'Save' button

      let bluegrad = $(go.Brush, 'Linear', { 0: '#C4ECFF', 1: '#70D4FF' })
      let greengrad = $(go.Brush, 'Linear', { 0: '#B1E2A5', 1: '#7AE060' })
      let redgrad = $(go.Brush, 'Linear', { 0: '#F18080', 1: '#DA8080' })
      let prograd = $(go.Brush, 'Linear', { 0: '#70D4FF', 1: '#117272' })

      // each attr is represented by a name and value
      var attrTemplate =
        $(go.Panel, 'Horizontal',
          $(go.TextBlock,
            { font: '10pt Verdana, sans-serif' },
            new go.Binding('text', 'name', function(name) { return name + ': ' }),
            new go.Binding('visible', 'value', function(value) { return !!value })
          ),
          $(go.TextBlock,
            { font: '10pt Verdana, sans-serif' },
            new go.Binding('text', 'value'),
            new go.Binding('visible', 'value', function(value) { return !!value })
          )
        )

      // each regular Node has body consisting of a title followed by a collapsible list of actions,
      // controlled by a PanelExpanderButton, with a TreeExpanderButton underneath the body
      myDiagram.nodeTemplateMap.add('root', // the default node template
        $(go.Node, 'Vertical',
          { selectionObjectName: 'BODY' },
          // the main 'BODY' consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, 'Auto',
            { name: 'BODY' },
            $(go.Shape, 'RoundedRectangle',
              { fill: bluegrad, stroke: null }
            ),
            $(go.Panel, 'Vertical',
              { margin: 3 },
              { stretch: go.GraphObject.Horizontal },
              // the title
              $(go.Panel, 'Horizontal',
                $(go.TextBlock,
                  {
                    stretch: go.GraphObject.Horizontal,
                    font: 'bold 28pt Verdana, sans-serif',
                    alignment: go.Spot.Center,
                    margin: new go.Margin(12, 12)
                  },
                  new go.Binding('text', 'title')
                )
              )
              // $(go.Panel, 'Horizontal',
              //   this.buttons['新建工程']
              // )
            ) // end outer Vertical Panel
          ), // end 'BODY'  Auto Panel
          $(go.Panel, // this is underneath the 'BODY'
            { height: 17 }, // always this height, even if the TreeExpanderButton is not visible
            $('TreeExpanderButton')
          )
        )
      )
      myDiagram.nodeTemplateMap.add('group', // the default node template
        $(go.Node, 'Vertical',
          { selectionObjectName: 'BODY', isTreeExpanded: true },
          {
            treeExpandedChanged: function(node) {
              _this.setGroupState(node.key, node.isTreeExpanded)
            }
          },
          // the main 'BODY' consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, 'Auto',
            { name: 'BODY' },
            $(go.Shape, 'RoundedRectangle',
              { fill: bluegrad, stroke: null }
            ),
            $(go.Panel, 'Vertical',
              { margin: 3 },
              // the title
              $(go.TextBlock,
                {
                  stretch: go.GraphObject.Horizontal,
                  font: 'bold 12pt Verdana, sans-serif',
                  textAlign: 'center'
                },
                new go.Binding('text', 'name')
              )
            ) // end outer Vertical Panel
          ), // end 'BODY'  Auto Panel
          $(go.Panel, // this is underneath the 'BODY'
            { height: 17 }, // always this height, even if the TreeExpanderButton is not visible
            $('TreeExpanderButton')
          )
        )
      )
      myDiagram.nodeTemplateMap.add('project', // the default node template
        $(go.Node, 'Vertical',
          { selectionObjectName: 'BODY' },
          // the main 'BODY' consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, 'Auto',
            { name: 'BODY' },
            $(go.Shape, 'RoundedRectangle',
              { fill: prograd, stroke: null }
            ),
            $(go.Panel, 'Vertical',
              { margin: 3 },
              // the title
              $(go.TextBlock,
                {
                  stretch: go.GraphObject.Horizontal,
                  font: 'bold 12pt Verdana, sans-serif',
                  textAlign: 'center'
                },
                new go.Binding('text', '', function(pro) {
                  return pro.desc || pro.name
                })
              ),
              $(go.TextBlock,
                {
                  stretch: go.GraphObject.Horizontal,
                  font: 'bold 8pt Verdana, sans-serif',
                  textAlign: 'left',
                  stroke: 'gray'
                },
                new go.Binding('text', '', function(pro) {
                  return pro.name
                })
              ),
              // the optional list of actions
              $(go.Panel, 'Vertical',
                { stretch: go.GraphObject.Horizontal, visible: false }, // not visible unless there is more than one action
                new go.Binding('visible', 'actions', function(acts) {
                  return (Array.isArray(acts) && acts.length > 0)
                }),
                // headered by a label and a PanelExpanderButton inside a Table
                $(go.Panel, 'Vertical',
                  { stretch: go.GraphObject.Horizontal }, // not visible unless there is more than one action
                  // headered by a label and a PanelExpanderButton inside a Table
                  $(go.Panel, 'Horizontal',
                    this.buttons['新建实例'],
                    this.buttons['拷贝工程'],
                    (this.user.roles && this.user.roles.some(it => it === 'admin')) ? this.buttons['删除工程'] : {}
                  )
                ) // end Table panel
              ) // end optional Vertical Panel
            ) // end outer Vertical Panel
          ), // end 'BODY'  Auto Panel
          $(go.Panel, // this is underneath the 'BODY'
            { height: 17 }, // always this height, even if the TreeExpanderButton is not visible
            $('TreeExpanderButton')
          )
        )
      )
      myDiagram.nodeTemplateMap.add('inst', // the default node template
        $(go.Node, 'Vertical',
          { selectionObjectName: 'BODY' },
          // the main 'BODY' consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, 'Auto',
            { name: 'BODY' },
            $(go.Shape, 'RoundedRectangle',
              { fill: bluegrad, strokeWidth: 2, stroke: bluegrad },
              new go.Binding('fill', 'inst', function(inst) {
                return (inst && inst.running) ? redgrad : greengrad
              })
            ),
            $(go.Panel, 'Vertical',
              { margin: 3 },
              $(go.Shape, 'Junction',
                {
                  desiredSize: new go.Size(16, 16),
                  fill: 'transparent',
                  alignment: new go.Spot(1, 0, -2, 2),
                  cursor: 'pointer'
                },
                {
                  click: (e, obj) => {
                    let node = obj.part
                    if (node && node.data && node.data.category === 'inst') {
                      let { project, model, id, name } = node.data.inst
                      _this.$confirm(`确认退出实例 "${name}"`, '提示', {
                        confirmButtonText: '退出',
                        cancelButtonText: '取消',
                        type: 'warning'
                      }).then(() => {
                        return papi.stopInstance(project, model, id)
                      }).catch(() => {
                      })
                    }
                  }
                }
              ),
              // the title
              $(go.TextBlock,
                {
                  stretch: go.GraphObject.Horizontal,
                  font: 'bold 12pt Verdana, sans-serif',
                  textAlign: 'left'
                },
                new go.Binding('text', 'name', function(name) { return `${name}` })
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
                    defaultAlignment: go.Spot.Left, // thus no need to specify alignment on each element
                    itemTemplate: attrTemplate // the Panel created for each item in Panel.itemArray
                  },
                  new go.Binding('itemArray', 'actions') // bind Panel.itemArray to nodedata.actions
                ) // end action list Vertical Panel
              ) // end optional Vertical Panel
            ) // end outer Vertical Panel
          ), // end 'BODY'  Auto Panel
          $(go.Panel, // this is underneath the 'BODY'
            { height: 17 }, // always this height, even if the TreeExpanderButton is not visible
            $('TreeExpanderButton')
          )
        )
      )
      // define a second kind of Node:
      myDiagram.nodeTemplateMap.add('user',
        $(go.Node, 'Spot',
          $(go.Shape, 'Circle',
            { width: 55, height: 55, fill: greengrad, stroke: null },
            new go.Binding('stroke', 'uname', function(uname) {
              let name = _this.$store.getters.name
              return name === uname ? 'red' : null
            })
          ),
          $(go.Panel, 'Vertical',
            $(go.TextBlock,
              { font: '10pt Verdana, sans-serif' },
              new go.Binding('text', 'uname')
            )
            // todo: 显示汉字名字
            // $(go.TextBlock,
            //   { font: '10pt Verdana, sans-serif' },
            //   new go.Binding('text', 'uname')
            // )
          ) // end Table panel
        )
      )

      myDiagram.linkTemplate =
        $(go.Link, go.Link.Orthogonal,
          { deletable: false, corner: 10 },
          $(go.Shape,
            { strokeWidth: 2 }
          ),
          $(go.TextBlock, go.Link.OrientUpright,
            {
              background: 'white',
              visible: false, // unless the binding sets it to true for a non-empty string
              segmentIndex: -2,
              segmentOrientation: go.Link.None
            }
          ))

      // create the Model with the above data, and assign to the Diagram
      myDiagram.model = $(go.GraphLinksModel,
        {
          copiesArrays: true,
          copiesArrayObjects: true,
          nodeDataArray: [],
          linkDataArray: []
        })
      // 设置回调函数
      _this.diagram.addDiagramListener('ObjectDoubleClicked', function(e) {
        if (e.subject.part.data.category === 'inst') {
          let inst = e.subject.part.data.inst
          _this.openProject(inst.project, inst.id, inst.name)
        }
      })
      _this.diagram.addDiagramListener('SelectionDeleting', function(e) {
        e.cancel = true
        e.subject.each(function(n) {
          if (n.data && n.data.category === 'inst') {
            let { project, model, id, name } = n.data.inst
            _this.$confirm(`确认退出实例 "${name}"`, '提示', {
              confirmButtonText: '退出',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              return papi.stopInstance(project, model, id)
            }).catch(() => {
            })
          }
        })
      })
    },
    getProList() {
      let uid = this.$store.getters.user.id
      if (!uid) {
        return
      }
      gapi.getGroupsOfUser(uid).then(res => {
        this.groups = res.items || []
        this.groups.sort((a, b) => {
          return a.id - b.id
        })
        let gets = this.groups.map(g => {
          return papi.getProjectsOfGroup(g.id).then((pros) => {
            let projects = []
            for (let name in pros.items) {
              projects.push(pros.items[name])
            }
            g.projects = projects
          })
        })
        return Promise.all(gets)
      }).then(() => {
        // this.updateInstance()
        this.updateDiagram()
        this.getClients()
        return this.$store.dispatch('getInstances')
      })
    },
    getClients() {
      uapi.clients().then(res => {
        for (let id in res) {
          let u = res[id]
          u.key = u.id
          u.category = 'user'
          // 没有对应的实例, 不建立 user 节点
          if (!this.diagram.model.findNodeDataForKey(this.formatInstKey(u.p, u.i))) {
            continue
          }
          if (this.diagram.model.findNodeDataForKey(u.key)) {
            // 有当前 user 节点
            continue
          }
          this.diagram.model.addNodeData(u)
          this.diagram.model.addLinkData({
            from: this.formatInstKey(u.p, u.i),
            to: u.key
          })
        }
      }).catch(err => {
        console.error(err)
      })
    },
    updateInstance() {
      // 清空原来的实例
      let projects = { ...this.projects }
      for (let name in projects) {
        delete (projects[name].instances)
      }
      // 处理接收数据
      for (const name in this.instances) {
        const node = this.instances[name]
        if (projects[node.project]) {
          projects[node.project].instances = projects[node.project].instances || {}
          projects[node.project].instances[name] = node
        }
      }
      this.projects = projects
    },
    updateDiagram() {
      if (!this.diagram) {
        return
      }
      this.diagram.clear()
      // 根节点
      this.diagram.model.addNodeData({
        key: 'root',
        category: 'root',
        title: 'rubik'
      })
      for (let gidx in this.groups) {
        let group = this.groups[gidx]
        let groupkey = `group_${group.id}`
        this.diagram.model.addNodeData({
          key: groupkey,
          category: 'group',
          name: group.name || groupkey
        })
        this.diagram.model.addLinkData({
          from: 'root',
          to: groupkey
        })
        for (let pidx in group.projects) {
          let pro = group.projects[pidx]
          let prokey = `${pro.name}`
          this.diagram.model.addNodeData({
            key: prokey,
            category: 'project',
            name: pro.name,
            desc: pro.desc,
            actions: [
              { name: '名称', value: pro.name }
            ]
          })
          this.diagram.model.addLinkData({
            from: groupkey,
            to: prokey
          })
          for (const name in this.instances) {
            const node = this.instances[name]
            if (node.project === pro.name) {
              let nodeData = this.buildInstDataForDiagram(node)
              this.diagram.model.addNodeData(nodeData)
              this.diagram.model.addLinkData({
                from: prokey,
                to: nodeData.key
              })
            }
          }
          // for (let instKey in this.instances) {
          //   let inst = pro.instances[instKey]
          //   let nodeData = this.buildInstDataForDiagram(inst)
          //   this.diagram.model.addNodeData(nodeData)
          //   this.diagram.model.addLinkData({
          //     from: prokey,
          //     to: nodeData.key
          //   })
          // }
        }

        // 添加完成后收起子节点
        let groupPart = this.diagram.findPartForKey(groupkey)
        if (groupPart) {
          groupPart.isTreeExpanded = this.project.groupOpened[groupkey] || false
        }
      }
    },
    buildInstDataForDiagram(inst) {
      inst = inst || {}
      let data = {
        key: inst.key,
        category: 'inst',
        name: inst.name || ('实例: ' + inst.id),
        inst: inst,
        roles: this.roles,
        actions: [
          { name: '编号', value: inst.id },
          { name: '考试', value: inst.isExamMode ? '正在考试' : '' },
          { name: '时间', value: formatModelTimeString(inst.time || 0) },
          { name: '创建', value: inst.owner || '' },
          { name: '下发', value: inst.duname || '' },
          { name: '案例', value: inst.caseName || '' },
          { name: '工况', value: inst.conditionName || '' },
          { name: '故障', value: inst.faultName || '' },
          { name: '计时', value: inst.remainTime ? formatModelTimeString(inst.remainTime * 1000) : '' }
        ]
      }
      return data
    },
    createButton(text, callback) {
      return $('Button',
        { margin: 2,
          click: (e, obj) => {
            callback && callback(e, obj)
          }
        },
        $(go.TextBlock, text))
    },
    openProject(pro, id, name) {
      return this.$confirm(`是否进入实例 ${pro} / ${id} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        iconClass: 'el-icon-question'
      }).then(() => {
        return this.$store.dispatch('openProject', {
          project: pro,
          model: 'model',
          id: id
        })
      }).then(() => {
        this.$router.push({ path: '/engineer/model/setting' })
      }).catch((err) => {
        if (err !== 'cancel') {
          this.$msg.error(err, '打开工程错误')
        }
      })
    },
    getGroupOfProject(pname) {
      for (let gidx in this.groups) {
        let group = this.groups[gidx]
        for (let pidx in group.projects) {
          let pro = group.projects[pidx]
          if (pro.name === pname) {
            return group.id
          }
        }
      }
      return 0
    },
    setGroupState(gname, opened) {
      this.$store.dispatch('updateGroupOpened', { name: gname, opened: opened })
    },
    formatInstKey(project, instID) {
      return `/rubik_state/${project}/model/${instID}/`
    }
  }
}
</script>

<style lang="scss" scoped>
  .diagram{
    width: 100%;
    height: calc(100vh - 82px);
    background-color: #ffffff;
  }
</style>
