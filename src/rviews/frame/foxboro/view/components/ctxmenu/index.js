import Vue from 'vue'
import Main from './main.vue'
import { PopupManager } from 'element-ui/src/utils/popup'
import { isVNode } from 'element-ui/src/utils/vdom'
const CtxMenuConstructor = Vue.extend(Main)

let instance
const instances = []
let seed = 1

const CtxMenu = function(param, event) {
  if (Vue.prototype.$isServer) return
  var options = {}
  options.param = param
  const userOnClose = options.onClose
  const id = 'foxview_ctx_menu' + seed++
  options.id = id

  options.onClose = function() {
    CtxMenu.close(id, userOnClose)
  }

  options.left = event.clientX - 5 + 'px'
  options.top = event.clientY - 5 + 'px'

  instance = new CtxMenuConstructor({
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

CtxMenu.open = function(param, event) {
  this.closeAll()
  return CtxMenu(param, event)
}

CtxMenu.close = function(id, userOnClose) {
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

CtxMenu.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

export default CtxMenu
