<template>
  <div class="app-container">
    <el-container>
      <el-main>
        <el-container>
          <el-header height="30px" style="overflow: hidden; display: flex;">
            <canvas-button hint="保存" icon="buttonSave" @click="save" />
            <canvas-button hint="试运行" icon="buttonRun" @click="run" />
            <canvas-button hint="自由画" icon="graphFreeDraw" style="margin-left: 10px;" @click="canvas.beginFreeDraw()" />
            <canvas-button hint="折线" icon="graphPolyline" @click="canvas.beginDrawPolyline()" />
            <canvas-button hint="多边形" icon="graphPolygon" @click="canvas.beginDrawPolyline(true)" />
            <canvas-button hint="矩形" icon="graphRect" @click="canvas.interGraph('rect')" />
            <canvas-button hint="椭圆" icon="graphEllipse" @click="canvas.interGraph('ellipse')" />
            <canvas-button hint="三角形" icon="graphTriangle" @click="canvas.interGraph('triangle')" />
            <canvas-button hint="图片(png)" icon="graphImage" @click="canvas.interGraph('rimage')" />
            <canvas-button hint="动图(gif)" icon="graphGif" @click="canvas.interGraph('gif')" />
            <canvas-button hint="按钮" icon="graphButton" @click="canvas.interGraph('button')" />
            <canvas-button hint="文本" icon="graphText" @click="canvas.interGraph('text')" />
            <canvas-button hint="文本框" icon="graphTextBox" @click="canvas.interGraph('textbox')" />
            <canvas-button hint="填充" icon="graphBar" @click="canvas.interGraph('bar')" />
            <canvas-button hint="图表" icon="graphChart" @click="canvas.interGraph('chart')" />
            <canvas-button hint="Vue控件" icon="graphVue" @click="canvas.interGraph('component')" />
            <el-upload
              :show-file-list="false"
              :before-upload="importSvg"
              accept=".svg"
              action=""
            >
              <canvas-button hint="导入 SVG" icon="graphSvg" style="margin-left: 10px;" />
            </el-upload>
            <el-upload
              :show-file-list="false"
              :before-upload="loadFromJSON"
              accept=".json"
              action=""
            >
              <canvas-button hint="导入 JSON" icon="graphJSON" />
            </el-upload>
            <canvas-button hint="导出 JSON" icon="graphJSONExport" @click="saveToJSON()" />
            <!-- <canvas-button hint="撤销" icon="graphUndo" style="margin-left: 10px;" @click="undo()" />
            <canvas-button hint="重做" icon="graphRedo" @click="redo()" /> -->
            <canvas-button hint="成组" icon="graphGroup" style="margin-left: 10px;" @click="opGroup" />
            <canvas-button hint="解组" icon="graphUnGroup" @click="opUnGroup" />
            <canvas-button hint="删除" icon="graphRemove" style="margin-left: 10px;" @click="removeSelect" />
            <canvas-button hint="还原缩放" icon="canvasPan" @click="resetRoom" />
            <canvas-button hint="替换" icon="replace" @click="showReplaceDialog" />
            <canvas-button hint="左对齐" icon="alignLeft" style="margin-left: 10px;" @click="canvas.alignItems('left')" />
            <canvas-button hint="X中间对齐" icon="alignCenterX" @click="canvas.alignItems('centerX')" />
            <canvas-button hint="右对齐" icon="alignRight" @click="canvas.alignItems('right')" />
            <canvas-button hint="上对齐" icon="alignTop" @click="canvas.alignItems('top')" />
            <canvas-button hint="Y中间对齐" icon="alignCenterY" @click="canvas.alignItems('centerY')" />
            <canvas-button hint="下对齐" icon="alignBottom" @click="canvas.alignItems('bottom')" />
            <canvas-button hint="等宽到最小" icon="sizeMinWidth" @click="canvas.alignSize('minw')" />
            <canvas-button hint="等高到最小" icon="sizeMinHeight" @click="canvas.alignSize('minh')" />
            <canvas-button hint="等宽到最大" icon="sizeMaxWidth" @click="canvas.alignSize('maxw')" />
            <canvas-button hint="等高到最大" icon="sizeMaxHeight" @click="canvas.alignSize('maxh')" />
            <canvas-button hint="X等距" icon="spaceX" @click="canvas.alignSize('spaceX')" />
            <canvas-button hint="Y等距" icon="spaceY" @click="canvas.alignSize('spaceY')" />
            <canvas-button hint="置前" icon="graphFront" style="margin-left: 10px;" @click="canvas.getActiveObject() && canvas.getActiveObject().bringToFront()" />
            <canvas-button hint="置后" icon="graphBack" @click="canvas.getActiveObject() && canvas.getActiveObject().sendToBack()" />
          </el-header>
          <el-main class="rubik-canvas">
            <canvas :id="'fabricPage' + fileName" />
          </el-main>
        </el-container>
      </el-main>
      <el-aside width="260px" class="property-container">
        <div style="overflow: auto;" :style="getTreeStyle()">
          <tree
            :setting="treeSetting"
            :nodes="treeNodes"
            @onClick="onTreeNodeClick"
          />
        </div>
        <el-tabs type="card">
          <el-tab-pane label="基本">
            <page-property :page="page" />
            <basic-property :page="page" />
            <trans-property v-if="page.activeObj && !page.activeObj.group" :page="page" />
            <shadow-property :page="page" />
            <rect-property :page="page" />
            <label-property v-if="page.activeObj && !page.activeObj.group" :page="page" />
            <image-property :page="page" />
            <bar-property :page="page" />
            <chart-property :page="page" />
            <component-property :page="page" />
            <param-property :page="page" />
          </el-tab-pane>
          <el-tab-pane label="动态">
            <div style="width: 100%; height: 24px; display: flex; flex-direction: row; justify-content: center;">
              <i class="el-icon-document-copy icon-button" @click="copyDynAndAction()" />
              <i class="bi bi-clipboard2 icon-button" @click="pasteDynAndAction()" />
            </div>
            <dyn-property :page="page" />
          </el-tab-pane>
          <el-tab-pane label="动作">
            <div style="width: 100%; height: 24px; display: flex; flex-direction: row; justify-content: center;">
              <i class="el-icon-document-copy icon-button" @click="copyDynAndAction()" />
              <i class="bi bi-clipboard2 icon-button" @click="pasteDynAndAction()" />
            </div>
            <action-property :page="page" />
          </el-tab-pane>
        </el-tabs>
      </el-aside>
    </el-container>
    <el-dialog
      title="替换"
      :visible.sync="replaceDialogVisible"
      width="600px"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="替换范围">
          <el-checkbox v-model="replaceScope.param" label="参数"></el-checkbox>
          <el-checkbox v-model="replaceScope.dyn" label="动态"></el-checkbox>
          <el-checkbox v-model="replaceScope.text" label="文本"></el-checkbox>
          <el-checkbox v-model="replaceScope.lib" label="图元"></el-checkbox>
        </el-form-item>
        <el-form-item label="替换规则">
          <template v-for="(rep, idx) in replaces">
            <template>
              <p :key="'replaces' + idx" style="margin-block-start: 2px; margin-block-end: 2px;">
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
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="appendReplaces"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="replaceDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="replace">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import fabric from '@/canvas'
import CanvasButton from '@/components/CanvasButton'
import tree from '@/components/ztree'
import * as mmiapi from '@/api/res'
import Mousetrap from 'mousetrap'
import _ from 'lodash'
import { Base64 } from 'js-base64'

import PageProperty from './components/property/PageProperty'
import BasicProperty from './components/property/BasicProperty'
import TransProperty from './components/property/TransProperty'
import ShadowProperty from './components/property/ShadowProperty'
import RectProperty from './components/property/RectProperty'
import LabelProperty from './components/property/LabelProperty'
import ImageProperty from './components/property/ImageProperty'
import BarProperty from './components/property/BarProperty'
import ChartProperty from './components/property/ChartProperty'
import ComponentProperty from './components/property/ComponentProperty'
import ParamProperty from './components/property/ParamProperty'
import DynProperty from './components/property/DynProperty'
import ActionProperty from './components/property/ActionProperty'

// 全局记录替换配置
var globalMmiReplaces = [{ old: '', new: '' }]
var globalMmireplaceScope = { param: false, dyn: false, text: false, lib: false }

export default {
  name: 'MmiEditor',
  components: {
    tree,
    CanvasButton,
    LabelProperty,
    TransProperty,
    ShadowProperty,
    PageProperty,
    BasicProperty,
    RectProperty,
    ImageProperty,
    BarProperty,
    ChartProperty,
    ComponentProperty,
    ParamProperty,
    DynProperty,
    ActionProperty
  },
  data() {
    return {
      tempRoute: null,
      canvas: {},
      fileName: '',
      replaceScope: {
        param: false,
        dyn: false,
        text: false,
        lib: false
      },
      replaces: [{
        old: '',
        new: ''
      }],
      replaceDialogVisible: false,
      page: {
        canvas: null,
        activeObj: null
      },
      treeNodes: [],
      treeSetting: {
        data: {
          keep: {
            leaf: true,
            parent: true
          },
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'pid',
            rootPId: 0
          }
        },
        check: {
          enable: false
        },
        view: {
          nameIsHTML: false,
          selectedMulti: false
        },
        edit: {
          enable: false
        }
      }
    }
  },
  watch: {
    replaces: {
      deep: true,
      handler: function(newValue) {
        this.saveReplaceConfig()
      }
    },
    replaceScope: {
      deep: true,
      handler: function(newValue) {
        this.saveReplaceConfig()
      }
    }
  },
  created() {
    // openFile 防抖处理, 2s 只能调用一次
    this.openFile = _.debounce(this._openFile, 2000, { leading: true, trailing: false })
    this.tempRoute = Object.assign({}, this.$route)
    if (this.$route.params && this.$route.params.path) {
      this.fileName = decodeURIComponent(this.$route.params.path)
    }
  },
  mounted() {
    this.canvas = new fabric.RubikCanvas('fabricPage' + this.fileName)
    this.canvas.setWidth(1920)
    this.canvas.setHeight(1080)
    var _this = this
    this.canvas.on('selection:updated', function(opt) {
      _this.showProperty(_this.canvas.getActiveObject())
    })

    this.canvas.on('selection:created', function(opt) {
      _this.showProperty(_this.canvas.getActiveObject())
    })

    this.canvas.on('selection:cleared', function(opt) {
      _this.showProperty(_this.canvas.getActiveObject())
    })
    if (this.fileName) {
      this.openFile(this.fileName)
    }
    this.bindMousetrap()
  },
  destroyed() {
    this.canvas.dispose()
  },
  activated() {
    this.bindMousetrap()
    // 从缓存中打开的时候判断是否需要刷新
    this.$store.dispatch('tagsView/needToUpdate', this.$route).then(update => {
      if (update && this.fileName) {
        this.openFile(this.fileName)
      }
    })
  },
  deactivated() {
    Mousetrap.reset()
  },
  methods: {
    // 使用 openFile 防抖处理后调用 _openFile
    _openFile(fileName) {
      this.canvas.open(fileName).then(() => {
        this.showProperty()
      }).catch(err => {
        this.$msg.error(err, '打开画面错误')
      }).finally(() => {
        this.setTagsViewTitle()
        this.canvas.setWidth(Math.max(this.canvas.header.width, 1920))
        this.canvas.setHeight(Math.max(this.canvas.header.height, 1080))
        if (this.canvas.header.width < 200 || this.canvas.header.height < 200) {
          this.canvas.absolutePan({ x: -100, y: -50 })
        }
      })
    },
    bindMousetrap() {
      var _this = this
      // Mousetrap.bind(['command+z', 'ctrl+z'], function(e) {
      //   _this.undo()
      // })
      Mousetrap.bind(['command+d', 'ctrl+d', 'del'], function(e) {
        e.preventDefault && e.preventDefault()
        _this.removeSelect()
      })
      Mousetrap.bind(['left', 'right', 'up', 'down'], function(e) {
        e.preventDefault && e.preventDefault()
        if (_this.canvas && _this.canvas.getActiveObject()) {
          switch (e.key) {
            case 'ArrowRight':
              _this.canvas.getActiveObject().set('left', _this.canvas.getActiveObject().get('left') + 1)
              break
            case 'ArrowLeft':
              _this.canvas.getActiveObject().set('left', _this.canvas.getActiveObject().get('left') - 1)
              break
            case 'ArrowUp':
              _this.canvas.getActiveObject().set('top', _this.canvas.getActiveObject().get('top') - 1)
              break
            case 'ArrowDown':
              _this.canvas.getActiveObject().set('top', _this.canvas.getActiveObject().get('top') + 1)
              break
            default:
              break
          }
          _this.canvas.requestRenderAll()
        }
      })
      Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
        e.preventDefault && e.preventDefault()
        if (_this.canvas) {
          _this.save()
        }
      })
      Mousetrap.bind(['command+a', 'ctrl+a'], function(e) {
        e.preventDefault && e.preventDefault()
        if (_this.canvas) {
          _this.canvas.discardActiveObject()

          let objs = _this.canvas.getObjects().map(function(o) {
            return o.set('active', true)
          })

          let selection = new fabric.ActiveSelection(objs, {
            canvas: _this.canvas
          })
          _this.canvas.setActiveObject(selection)
          _this.canvas.requestRenderAll()
        }
      })
      Mousetrap.bind(['command+c', 'ctrl+c'], function(e) {
        if (_this.canvas.getActiveObject()) {
          _this.canvas.getActiveObject().clone(function(cloned) {
            window.rubikClipboard = cloned
          }, ['dyn', 'action', 'param'])
        }
      })
      Mousetrap.bind(['command+x', 'ctrl+x'], function(e) {
        if (_this.canvas.getActiveObject()) {
          _this.canvas.getActiveObject().clone(function(cloned) {
            window.rubikClipboard = cloned
            _this.canvas.removeSelect()
          }, ['dyn', 'action', 'param'])
        }
      })
      Mousetrap.bind(['command+v', 'ctrl+v'], function(e) {
        if (window.rubikClipboard) {
          // 粘贴图形时, 深拷贝一份动态信息
          window.rubikClipboard.walkUntilLib((item) => {
            if (item.dyn) {
              item.dyn = _.cloneDeep(item.dyn)
            }
            if (item.action) {
              item.action = _.cloneDeep(item.action)
            }
            if (item.param) {
              item.param = _.cloneDeep(item.param)
            }
          })
          window.rubikClipboard.clone(function(clonedObj) {
            _this.canvas.discardActiveObject()
            clonedObj.set({
              left: clonedObj.left + 20,
              top: clonedObj.top + 20,
              evented: true
            })
            if (clonedObj.type === 'activeSelection') {
              // active selection needs a reference to the canvas.
              clonedObj.canvas = _this.canvas
              clonedObj.forEachObject(function(obj) {
                _this.canvas.add(obj)
              })
              // this should solve the unselectability
              clonedObj.setCoords()
            } else {
              _this.canvas.add(clonedObj)
            }
            window.rubikClipboard.top += 20
            window.rubikClipboard.left += 20
            _this.canvas.setActiveObject(clonedObj)
            _this.canvas.requestRenderAll()
          }, ['dyn', 'action', 'param'])
        }
      })
    },
    // keepTree 从 tree 中设置activeObj时, 不更新 tree
    showProperty(target, keepTree) {
      this.page.activeObj = target
      this.page.canvas = this.canvas
      if (!keepTree) {
        this.updateTree()
      }
    },
    updateTree() {
      let id = 0
      let nodes = []
      let stack = []
      if (this.page.activeObj) {
        stack.push({
          obj: this.page.activeObj,
          pid: 0
        })
        while (stack.length) {
          let item = stack.pop()
          id = id + 1
          let name = item.obj.type
          if (item.obj.dyn || item.obj.action) {
            name = name + '*'
          }

          switch (item.obj.type) {
            case 'activeSelection':
            case 'group':
              nodes.push({
                name: name,
                id: id,
                pid: item.pid,
                isParent: true,
                open: item.pid === 0,
                getObj: () => { return item.obj }
              })
              item.obj.forEachObject((obj) => {
                stack.push({
                  obj: obj,
                  pid: id
                })
              })
              break
            default:
              nodes.push({
                name: name,
                id: id,
                pid: item.pid,
                isParent: false,
                getObj: () => { return item.obj }
              })
          }
        }
      }
      this.treeNodes = nodes
    },
    opGroup() {
      this.canvas.opGroup()
      this.showProperty(this.canvas.getActiveObject())
    },
    opUnGroup() {
      this.canvas.opUnGroup()
      this.showProperty(this.canvas.getActiveObject())
    },
    removeSelect() {
      this.$confirm(this.$t('确认删除?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消')
      }).then(() => {
        this.canvas.removeSelect()
        this.showProperty(this.canvas.getActiveObject())
      }).catch(() => {})
    },
    onTreeNodeClick(e, id, node) {
      if (node.getObj) {
        let obj = node.getObj()
        this.showProperty(obj, true)

        // 闪烁
        let loop = 0
        let id = setInterval(() => {
          obj.set('visible', !(loop % 2))
          this.canvas.requestRenderAll()
          loop = loop + 1
          if (loop >= 20) {
            clearInterval(id)
            obj.set('visible', true)
            this.canvas.requestRenderAll()
          }
        }, 50)
      }
    },
    getTreeStyle() {
      if (!this.treeNodes || this.treeNodes.length === 1) {
        return {
          height: '0px'
        }
      }
      return {
        height: Math.min((this.treeNodes || []).length, 8) * 20 + 'px'
      }
    },
    saveToJSON() {
      if (!this.fileName) {
        return
      }
      this.canvas.includeDefaultValues = false
      var json = this.canvas.toDatalessJSON(['header', 'param', 'dyn', 'action'])
      delete json.backgroundImage
      json = JSON.stringify(json, null, '  ')
      json = 'data:data/json;base64,' + Base64.encode(json)
      mmiapi.download(json, this.fileName + '.json')
    },
    save() {
      if (!this.fileName) {
        return
      }
      this.canvas.includeDefaultValues = false
      var json = this.canvas.toDatalessJSON(['header', 'param', 'dyn', 'action'])
      // delete json.backgroundImage
      var fd = new FormData()
      var file = new File([JSON.stringify(json)], this.fileName + '.json', {
        type: 'text/plain'
      })
      fd.append('file', file)
      mmiapi.write('mmi/' + this.fileName + '.json', fd).then(res => {
        this.savePreviewPng()
        return this.release()
      }).then(() => {
        this.$msg('保存成功')
      }).catch(err => {
        console.error(err)
        this.$msg.error(err, '保存失败')
      })
    },
    release() {
      let tempCanvas = new fabric.RubikCanvas()
      tempCanvas.setWidth(1920)
      tempCanvas.setHeight(1080)

      return tempCanvas.open(this.fileName).then(() => {
        tempCanvas.setWidth(Math.max(tempCanvas.header.width, 1920))
        tempCanvas.setHeight(Math.max(tempCanvas.header.height, 1080))
        tempCanvas.includeDefaultValues = false
        tempCanvas.releaseMode = true
        var json = tempCanvas.toDatalessJSON(['header', 'param', 'dyn', 'action'])
        tempCanvas.releaseMode = false
        var fd = new FormData()
        var file = new File([JSON.stringify(json)], this.fileName + '.release', {
          type: 'text/plain'
        })
        fd.append('file', file)
        return mmiapi.write('mmi/' + this.fileName + '.release', fd)
      })
    },
    dataURLtoFile(dataUrl, fileName) {
      var arr = dataUrl.split(',')
      var mime = arr[0].match(/:(.*?);/)[1]
      var bstr = atob(arr[1])
      var n = bstr.length
      var u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], fileName, { type: mime })
    },
    savePreviewPng() {
      // 保存缩略图
      let width = (this.canvas.header && this.canvas.header.width) || 800
      let height = (this.canvas.header && this.canvas.header.height) || 600
      this.canvas.setZoom(1)
      this.canvas.absolutePan({ x: 0, y: 0 })
      let multiplier = Math.min(240 / width, 180 / height)
      try {
        let dataURL = this.canvas.toDataURL({
          format: 'png',
          multiplier: multiplier,
          width: width,
          height: height
        })
        if (dataURL) {
          let blob = this.dataURLtoFile(dataURL, this.fileName + '.png')
          var fd = new FormData()
          fd.append('file', blob)
          mmiapi.write('mmi/' + this.fileName + '.png', fd).catch(err => {
            this.$msg.error(err, '保存缩略图失败')
          })
        }
      } catch (err) {
        // console.log(err)
      }
      this.canvas.requestRenderAll()
    },
    setTagsViewTitle() {
      const route = Object.assign({}, this.tempRoute, { title: '画面 - ' + this.fileName })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    run() {
      this.$router.push({ path: '/engineer/mmi/run/' + encodeURIComponent(this.fileName) })
    },
    loadFromJSON(file) {
      let reader = new FileReader()
      reader.onload = (e) => {
        let succ = true
        try {
          let json = e.target.result
          if (typeof json === 'string') {
            json = JSON.parse(json)
          }
          this.canvas.open(json).then(() => {
            this.showProperty()
          }).catch(err => {
            this.$msg.error(err, '打开画面错误')
          }).finally(() => {
            this.canvas.setWidth(Math.max(this.canvas.header.width, 1920))
            this.canvas.setHeight(Math.max(this.canvas.header.height, 1080))
            if (this.canvas.header.width < 200 || this.canvas.header.height < 200) {
              this.canvas.absolutePan({ x: -100, y: -50 })
            }
          })
        } catch (err) {
          succ = false
          this.$msg.error(err)
        }
        if (succ) {
          this.$msg('导入成功')
        }
      }
      reader.onerror = (e) => {
        this.$msg.error(e)
      }
      reader.readAsText(file)
    },
    resetRoom() {
      this.canvas.setZoom(1)
      this.canvas.absolutePan({ x: 0, y: 0 })
      this.canvas.requestRenderAll()
    },
    importSvg(file) {
      let reader = new FileReader()
      reader.onload = (e) => {
        let str = e.target.result
        fabric.loadSVGFromString(str, (objects, options) => {
          var obj = fabric.util.groupSVGElements(objects, options)
          this.canvas.add(obj).centerObject(obj).requestRenderAll()
          obj.setCoords()
        })
        this.$msg('导入成功')
      }
      reader.onerror = (e) => {
        this.$msg.error(e)
      }
      reader.readAsText(file)
    },
    undo() {
      this.loading = this.$loading({
        lock: true,
        text: '正在撤销 ...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      })
      this.canvas.undo(() => {
        this.loading.close()
      }, () => {
        this.loading.close()
      })
    },
    redo() {
      this.loading = this.$loading({
        lock: true,
        text: '正在重做 ...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      })
      this.canvas.redo(() => {
        this.loading.close()
      }, () => {
        this.loading.close()
      })
    },
    copyDynAndAction() {
      let active = this.canvas.getActiveObject()
      if (!active) {
        return
      }
      let copy = {
        dyn: active.dyn,
        action: active.action
      }
      window.copy_of_dyn = _.cloneDeep(copy)
      this.$msg('复制动态信息成功')
    },
    pasteDynAndAction() {
      let active = this.canvas.getActiveObject()
      if (!active) {
        return
      }
      if (!window.copy_of_dyn) {
        return
      }
      (() => {
        if (active.dyn || active.action) {
          return this.$confirm(this.$t('当前图元已经有动态信息, 是否粘贴并替换动态信息?'), this.$t('提示'), {
            confirmButtonText: this.$t('确定'),
            cancelButtonText: this.$t('取消')
          })
        } else {
          return Promise.resolve()
        }
      })().then(() => {
        active.dyn = _.cloneDeep(window.copy_of_dyn.dyn) || {}
        active.action = _.cloneDeep(window.copy_of_dyn.action) || {}

        this.showProperty(active)
        this.$msg('粘贴动态信息成功')
      }).catch(() => {
      })
    },
    saveReplaceConfig() {
      globalMmiReplaces = _.cloneDeep(this.replaces)
      globalMmireplaceScope = _.cloneDeep(this.replaceScope)
    },
    reloadReplaceConfig() {
      this.replaces = _.cloneDeep(globalMmiReplaces)
      this.replaceScope = _.cloneDeep(globalMmireplaceScope)
    },
    showReplaceDialog() {
      this.reloadReplaceConfig()
      this.replaceDialogVisible = true
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
    replaceString(str) {
      if (typeof str !== 'string') {
        return ''
      }
      let r = ''
      let m = {}
      for (let i = 0; i < this.replaces.length; i++) {
        if (!this.replaces[i].old) {
          continue
        }
        if (r) {
          r = r + '|' + this.replaces[i].old
        } else {
          r = this.replaces[i].old
        }
        m[this.replaces[i].old] = this.replaces[i].new
      }
      let reg = new RegExp(r, 'g')
      return str.replace(reg, function(matchstr, p1) {
        return m[matchstr] || matchstr
      })
    },
    replace() {
      // 保存当前配置
      this.saveReplaceConfig()

      this.replaceDialogVisible = false
      let loopRange = this.canvas.getActiveObject()
      if (!loopRange) {
        loopRange = this.canvas
      }
      let changed = false
      let replaceLib = false
      loopRange && loopRange.walkUntilLib((obj) => {
        // 替换 param
        if (this.replaceScope.param && obj.type === 'lib' && obj.param) {
          obj.param = obj.param || {}
          for (let key in obj.param) {
            obj.param[key] = this.replaceString(obj.param[key])
          }
          obj.reloadAttr()
          obj.calcParam({ ...obj.originParam, ...obj.param })
          changed = true
        }

        // 替换 text
        if (this.replaceScope.text && obj.isText() && obj.get('text')) {
          obj.set('text', this.replaceString(obj.get('text')))
          changed = true
        }

        // 替换动态信息
        if (this.replaceScope.dyn) {
          for (let key in obj.dyn || {}) {
            if (obj.dyn[key].useScript) {
              obj.dyn[key].script = this.replaceString(obj.dyn[key].script)
              continue
            }
            if (key === 'fpct') {
              obj.dyn[key].name = this.replaceString(obj.dyn[key].name)
              obj.dyn[key].expr = this.replaceString(obj.dyn[key].expr)
            } else if (
              key === 'point' ||
              key === 'check'
            ) {
              obj.dyn[key].name = this.replaceString(obj.dyn[key].name)
            } else if (
              key === 'calcAngle' ||
              key === 'moveX' ||
              key === 'moveY' ||
              key === 'value' ||
              key === 'fpct'
            ) {
              obj.dyn[key].expr = this.replaceString(obj.dyn[key].expr)
            } else {
              if (obj.dyn[key].exprs instanceof Array) {
                for (let dyn of obj.dyn[key].exprs) {
                  dyn.expr = this.replaceString(dyn.expr)
                }
              }
            }
          }

          for (let key in obj.action || {}) {
            if (obj.action[key].confirm) {
              obj.action[key].confirm = this.replaceString(obj.action[key].confirm)
            }
            if (obj.action[key].name) {
              obj.action[key].name = this.replaceString(obj.action[key].name)
            }
            if (obj.action[key].pic) {
              obj.action[key].pic = this.replaceString(obj.action[key].pic)
            }
            if (obj.action[key].param) {
              for (let pk in obj.action[key].param) {
                obj.action[key].param[pk] = this.replaceString(obj.action[key].param[pk])
              }
            }
          }
        }

        // 替换图元
        if (this.replaceScope.lib && obj.type === 'lib') {
          let newLibName = this.replaceString(obj.libName)
          if (newLibName !== obj.libName) {
            obj.libName = newLibName
            changed = true
            replaceLib = true
          }
        }
      })
      if (replaceLib) {
        // 替换图元后, 重新加载画面
        this.canvas.walk(obj => obj.dispose && obj.dispose())
        this.canvas.includeDefaultValues = false
        var json = this.canvas.toDatalessJSON(['header', 'param', 'dyn', 'action'])
        this.canvas.rubikLoadFromJSON(json, () => {
          this.canvas.requestRenderAll()
        })
      } else if (changed) {
        // 如果有改变, 刷新画面
        this.canvas.requestRenderAll()
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-container {
  padding: 0;
  margin: 0;
  >>> {
    .el-tabs__content {
      padding: 4px 0;
    }
    .el-input__inner {
      padding: 0 2px;
    }
    .el-form-item__label {
      padding: 0 2px 0 0;
    }
    .el-tabs__item {
      padding: 0 10px;
    }
  }
}
.el-tabs--border-card > .el-tabs__content {
  padding: 0px important;
}

.rubik-canvas {
  position: relative;
  height: calc(100vh - 100px);
}

.property-container {
  height: calc(100vh - 80px);
}

.el-container {
  padding: 0;
  margin: 0;
}

.el-main {
  padding: 0;
  margin: 0;
}

.el-aside {
  padding: 0;
  margin: 0;
}

.el-header {
  padding: 0 6px;
  margin: 0;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  background-color: rgb(240, 242, 245);
}

.icon-button {
  display: inline-block;
  line-height:24px;
  font-size: 20px;
  padding: 0 6px;
  cursor: pointer;
}
.icon-button:hover {
  color: rgb(30, 182, 37);
}

</style>
