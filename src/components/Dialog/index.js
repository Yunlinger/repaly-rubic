import Vue from 'vue'
import PopupManager from 'element-ui/lib/utils/popup/popup-manager'
import store from '@/store'
import i18n from '@/lang' // 引入国际化

let instance
const instances = []
let seed = 1000

const Dialog = function(constructor, data) {
  if (Vue.prototype.$isServer) return
  const id = 'rubik_dialog_' + seed++
  const DialogConstructor = Vue.extend(constructor)
  instance = new DialogConstructor({ store, i18n, data })

  instance.id = id
  instance.vm = instance.$mount()
  document.body.appendChild(instance.vm.$el)
  instance.vm.visible = true
  instance.dom = instance.vm.$el
  instance.dom.style.zIndex = PopupManager.nextZIndex()
  instances.push(instance)
  return instance.vm
}

Dialog.open = function(constructor, data) {
  return Dialog(constructor, data)
}

Dialog.close = function(id, userOnClose) {
  for (let i = 0, len = instances.length; i < len; i++) {
    if (id === instances[i].id) {
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i])
      }
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

Dialog.install = function(Vue) {
  Vue.prototype.$rdialog = function(constructor, data) {
    return Dialog.open(constructor, data)
  }
}

export default Dialog
