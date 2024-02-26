import Vue from 'vue'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
import 'vue-resize/dist/vue-resize.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import Viewer from 'v-viewer' // 引入js
import 'viewerjs/dist/viewer.css' // 引入css
Vue.use(Viewer)

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

Vue.use(VXETable)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

import * as XLSX from 'xlsx'
Vue.prototype.$xlsx = XLSX

import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
Vue.use(contentmenu)

import Contextmenu from '@haoyue/vue-contextmenu'
Vue.use(Contextmenu)

import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

import VueResize from 'vue-resize'
Vue.use(VueResize)

import EventProxy from 'vue-event-proxy'
Vue.use(EventProxy)

import 'bootstrap-icons/font/bootstrap-icons.css'

import { create, all } from 'mathjs'

// create a mathjs instance with configuration
const config = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'BigNumber',
  precision: 64,
  predictable: false,
  randomSeed: null
}
const math = create(all, config)
Vue.prototype.$math = math

// msg 封装
import msg from '@/utils/message'
Vue.use(msg)

// dialog 封装
import dialog from '@/components/Dialog'
Vue.use(dialog)

Vue.use(Element, {
  size: 'mini', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
