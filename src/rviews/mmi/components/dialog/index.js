import Vue from 'vue'
import _ from 'lodash'
import Main from './main.vue'
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import { isVNode } from 'element-ui/lib/utils/vdom'
import store from '@/store'
import * as papi from '@/api/project'

const DialogConstructor = Vue.extend(Main)

let instance
const instances = []
let seed = 1
let maxPads = {}

const Dialog = function(name, param, event) {
  if (Vue.prototype.$isServer) return

  var pro = store.getters.project.project || ''
  if (!(pro in maxPads)) {
    // 没有读配置文件
    papi.getSetting().then(config => {
      maxPads[pro] = config.maxPads || 0
    })
  }

  // 根据 name 和 param 生成面板唯一名称
  let dialogName = name + '_' + _.values(param).sort().join('_')
  let instIndex = _.findIndex(instances, function(inst) { return inst.dialogName === dialogName })
  if (instIndex >= 0) {
    // 延时激活, 避免和窗口鼠标事件的激活冲突
    setTimeout(() => {
      instances[instIndex].active()
    }, 100)
    return
  }

  var proMaxPads = maxPads[pro] || 0

  if (proMaxPads > 0 && instances.length >= proMaxPads) {
    // 设置了 maxPads
    Dialog.close(instances[0].id)
  }

  var options = {}
  options.param = param
  options.fileName = name
  const userOnClose = options.onClose
  const id = 'dialog_' + seed++
  options.id = id

  options.onClose = function() {
    Dialog.close(id, userOnClose)
  }

  if (event instanceof TouchEvent) {
    options.left = event.touches[0].clientX
    options.top = event.touches[0].clientY
  } else if (event) {
    options.left = event.clientX
    options.top = event.clientY
  }

  instance = new DialogConstructor({
    data: options
  })

  options.deactiveAll = Dialog.deactiveAll

  instance.id = id
  instance.dialogName = dialogName
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.name]
    instance.name = null
  }
  instance.vm = instance.$mount()
  document.body.appendChild(instance.vm.$el)
  instance.vm.visible = true
  instance.dom = instance.vm.$el
  instance.dom.style.zIndex = PopupManager.nextZIndex()
  instances.push(instance)
  return instance.vm
}

Dialog.open = function(name, param, event) {
  return Dialog(name, param, event)
}

Dialog.close = function(id, userOnClose) {
  for (let i = 0, len = instances.length; i < len; i++) {
    if (id === instances[i].fileName || id === instances[i].id) {
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i])
      }
      instances[i].closed = true
      instances.splice(i, 1)
      break
    }
  }
}

Dialog.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

Dialog.deactiveAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].deactive()
  }
}

export default Dialog
