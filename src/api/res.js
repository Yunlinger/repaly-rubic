import store from '@/store'
import request from '@/utils/request_rubik'
import string2fd from '@/utils/string2fd'

export function open(path) {
  path = encodeURIComponent(path)
  let params = { path }
  return request({
    url: '/fs/open',
    method: 'get',
    params: params
  })
}

export function getUrl(path) {
  path = encodeURIComponent(path)
  if (process.env.NODE_ENV === 'development') {
    return `${process.env.VUE_APP_RUBIK_API}/fs/open?rubik.project=${store.getters.project.project}&path=${path}&token=${store.getters.token}`
  }
  return `${process.env.VUE_APP_RUBIK_API}/fs/open?rubik.project=${store.getters.project.project}&path=${path}`
}

export function getImageUrl(path, width) {
  var url = getUrl(path)
  if ((width || 0) >= 32) {
    return `${url}&width=${width}`
  }
  return url
}

export function getStaticUrl(path) {
  path = encodeURIComponent(path)
  return `${process.env.VUE_APP_RUBIK_API}/static/${path}`
}

export function download(path, name) {
  if (!path || typeof path !== 'string') {
    return
  }
  var elem = document.createElement('a')
  if (path.startsWith('data:')) {
    elem.href = path
  } else {
    elem.href = getUrl(path)
  }
  elem.download = name
  elem.style.display = 'none'
  elem.target = '_blank'
  document.body.appendChild(elem)
  elem.click()
  setTimeout(() => {
    document.body.removeChild(elem)
  }, 32)
}

export function ls(path, filter) {
  path = encodeURIComponent(path)
  return request({
    url: '/fs/ls',
    method: 'get',
    params: { path, filter }
  })
}

export function write(path, fd) {
  path = encodeURIComponent(path)
  return request({
    url: '/fs/write',
    method: 'post',
    params: { path },
    data: fd
  })
}

export function touch(path) {
  path = encodeURIComponent(path)
  return request({
    url: '/fs/write',
    method: 'post',
    params: { path },
    data: string2fd('', path)
  })
}

export function mkdir(path) {
  path = encodeURIComponent(path)
  return request({
    url: '/fs/mkdir',
    method: 'post',
    params: { path }
  })
}

export function rm(path) {
  path = encodeURIComponent(path)
  return request({
    url: '/fs/rm',
    method: 'post',
    params: { path }
  })
}

// 移动文件, 可用于重命名
export function mv(src, dst) {
  src = encodeURIComponent(src)
  dst = encodeURIComponent(dst)
  return request({
    url: '/fs/mv',
    method: 'post',
    params: { src, dst }
  })
}

// 这个函数需要带上 project/PRONAME/res
export function cp(src, dst) {
  return request({
    url: '/fs/cp',
    method: 'post',
    data: { src, dst }
  })
}

export function exists(path) {
  path = encodeURIComponent(path)
  return request({
    url: '/fs/exists',
    method: 'get',
    params: { path }
  })
}

export function getCache(name) {
  return request({
    url: '/cache/get',
    method: 'post',
    data: { name }
  })
}

export function setCache(name, payload) {
  return request({
    url: '/cache/set',
    method: 'post',
    data: { name, payload }
  })
}
