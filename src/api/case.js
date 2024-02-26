import request from '@/utils/request_rubik'
import store from '@/store'

// save
export function save() {
  return request({
    url: '/case/save',
    method: 'post',
    data: {}
  })
}

export function dispatch(id, participants, params) {
  if (!participants) {
    participants = [store.getters.name]
  }
  return request({
    url: '/case/dispatch',
    method: 'post',
    data: { id, participants },
    params: params || {}
  })
}
export function start(id, params) {
  return request({
    url: '/case/start',
    method: 'post',
    data: { id },
    params: params || {}
  })
}
export function giveup(id, params) {
  return request({
    url: '/case/giveup',
    method: 'post',
    data: { id },
    params: params || {}
  })
}
export function commit(id, params) {
  return request({
    url: '/case/commit',
    method: 'post',
    data: { id },
    params: params || {}
  })
}
export function query(filter) {
  filter = filter || {
    page: 1,
    pageSize: 100
  }
  return request({
    url: '/case/query',
    method: 'post',
    data: filter
  })
}

// task
export function taskNew(task) {
  return request({
    url: '/case/task/new',
    method: 'post',
    data: task
  })
}

export function taskDel(id) {
  return request({
    url: '/case/task/del',
    method: 'post',
    data: { id }
  })
}

export function taskGet(id) {
  return request({
    url: '/case/task/get',
    method: 'post',
    data: { id }
  })
}

export function taskUpdate(task) {
  return request({
    url: '/case/task/update',
    method: 'post',
    data: task
  })
}

export function taskList() {
  return request({
    url: '/case/task/list',
    method: 'post',
    data: {}
  })
}

// tree
export function treeNew(node) {
  return request({
    url: '/case/tree/new',
    method: 'post',
    data: node
  })
}

export function treeDel(id) {
  return request({
    url: '/case/tree/del',
    method: 'post',
    data: { id }
  })
}

export function treeUpdate(node) {
  return request({
    url: '/case/tree/update',
    method: 'post',
    data: node
  })
}

export function treeList() {
  return request({
    url: '/case/tree/list',
    method: 'post',
    data: {}
  })
}
