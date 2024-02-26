import Vue from 'vue'
import Main from './main.vue'
import { PopupManager } from 'element-ui/src/utils/popup'
import { isVNode } from 'element-ui/src/utils/vdom'
const DialogConstructor = Vue.extend(Main)

let instance
const instances = []
let seed = 1

const Dialog = function(name, param, event) {
  if (Vue.prototype.$isServer) return
  var options = {}
  options.param = param
  options.fileName = name
  const userOnClose = options.onClose
  const id = 'foxview_dialog_' + seed++
  options.id = id

  options.onClose = function() {
    Dialog.close(id, userOnClose)
  }

  if (event instanceof TouchEvent) {
    options.left = event.touches[0].clientX + 'px'
    options.top = event.touches[0].clientY + 'px'
  } else {
    options.left = event.clientX + 'px'
    options.top = event.clientY + 'px'
  }

  instance = new DialogConstructor({
    data: options
  })
  instance.id = id
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
    if (!instances[i]) {
      instances.splice(i, 1)
      break
    }
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

export default Dialog
