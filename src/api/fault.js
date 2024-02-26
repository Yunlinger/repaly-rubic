import request from '@/utils/request_rubik'

// save
export function save() {
  return request({
    url: '/fault/save',
    method: 'post',
    data: {}
  })
}

export function start(id, item) {
  item = item || {}
  item.id = id
  return request({
    url: '/fault/start',
    method: 'post',
    data: item
  })
}

export function starts(item, params) {
  item = item || {}
  return request({
    url: '/fault/start',
    method: 'post',
    data: item,
    params: params || ''
  })
}

export function stop(id) {
  return request({
    url: '/fault/stop',
    method: 'post',
    data: { id }
  })
}

export function stops(item, params) {
  item = item || {}
  return request({
    url: '/fault/stop',
    method: 'post',
    data: item,
    params: params || ''
  })
}

// list
export function listNew(fault) {
  return request({
    url: '/fault/list/new',
    method: 'post',
    data: fault
  })
}

export function listDel(id) {
  return request({
    url: '/fault/list/del',
    method: 'post',
    data: { id }
  })
}

// 删除所有故障
export function listDelAll() {
  return request({
    url: '/fault/list/delall',
    method: 'post',
    data: {}
  })
}

export function listUpdate(fault) {
  return request({
    url: '/fault/list/update',
    method: 'post',
    data: fault
  })
}

export function list() {
  return request({
    url: '/fault/list',
    method: 'post',
    data: {}
  })
}

// 当前活动故障
export function activeList() {
  return request({
    url: '/fault/list/getactive',
    method: 'post',
    data: {}
  })
}

// tree
export function treeNew(node) {
  return request({
    url: '/fault/tree/new',
    method: 'post',
    data: node
  })
}

export function treeDel(id) {
  return request({
    url: '/fault/tree/del',
    method: 'post',
    data: { id }
  })
}

export function treeUpdate(node) {
  return request({
    url: '/fault/tree/update',
    method: 'post',
    data: node
  })
}

export function tree() {
  return request({
    url: '/fault/tree',
    method: 'post',
    data: {}
  })
}
