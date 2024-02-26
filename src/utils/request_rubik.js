import axios from 'axios'
import store from '@/store'
// import { Notification } from 'element-ui'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_RUBIK_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 3600000 // request timeout
})

function isDev() {
  return process.env.NODE_ENV === 'development'
}

function needToLog(url) {
  if (typeof url !== 'string') {
    return false
  }

  return !(
    url.endsWith('/rtdb/getvalues') ||
    url.endsWith('/rtdb/unsubvalues') ||
    url.endsWith('/rtdb/hist') ||
    url.endsWith('/fs/exists') ||
    url.endsWith('/fs/open')
  )
}

function getTimeString() {
  const t = new Date()
  return t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds() + ':' + t.getMilliseconds()
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (isDev() && needToLog(config.url)) {
      console.log('[request]' + getTimeString() + '\n', config.method, config.url, config)
    }
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Token'] = store.getters.token
    }
    if (store.getters.project) {
      config.params = {
        'rubik.project': store.getters.project.project,
        'rubik.model': store.getters.project.model,
        'rubik.id': store.getters.project.id,
        ...config.params
      }
    }
    return config
  },
  error => {
    // do something with request error
    if (isDev()) {
      console.error(error) // for debug
    }
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    if (isDev() && needToLog(response.config.url)) {
      console.log('[response]' + getTimeString() + ' ' + response.config.url + '\n', response.data)
    }
    // 忽略返回的 token 信息
    // if (response.headers.token) {
    //   store.dispatch('user/setToken', response.headers.token)
    // }
    return response.data
  },
  error => {
    if (!error.response) {
      // 网络错误
      if (isDev()) {
        console.error(error)
      }
    } else if (error.response.status === 401) {
      // 401 后直接重置token
      store.dispatch('user/resetToken').then(() => {
        // location.reload()
      })
    } else if (isDev() && needToLog(error.response.config.url)) {
      // 普通错误
      console.log('[debug-error]:', error.response.data.error)
    }
    if (error.response && error.response.data && error.response.data.error) {
      console.log('error:', error.response.data.error)
      return Promise.reject(error.response.data.error)
      // Notification.error({
      //   title: '错误',
      //   message: error.response.data.error
      // })
    }
    return Promise.reject(error)
  }
)

export default service
