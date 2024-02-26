// 实时数据库相关接口

import request from '@/utils/request_rubik'

// save
export function save() {
  return request({
    url: '/rtdb/save',
    method: 'post',
    data: {}
  })
}

// var
export function varNew(item) {
  return request({
    url: '/rtdb/var/new',
    method: 'post',
    data: item
  })
}

export function varDel(id) {
  return request({
    url: '/rtdb/var/del',
    method: 'post',
    data: { id }
  })
}

export function varUpdate(item) {
  return request({
    url: '/rtdb/var/update',
    method: 'post',
    data: item
  })
}

export function varGetDetail(name) {
  return request({
    url: '/rtdb/var/get',
    method: 'post',
    data: { name }
  })
}

export function list(filter) {
  return request({
    url: '/rtdb/var/list',
    method: 'post',
    data: filter || {}
  })
}

// tree
export function treeNew(node) {
  return request({
    url: '/rtdb/tree/new',
    method: 'post',
    data: node
  })
}

export function treeDel(id) {
  return request({
    url: '/rtdb/tree/del',
    method: 'post',
    data: { id }
  })
}

export function treeUpdate(node) {
  return request({
    url: '/rtdb/tree/update',
    method: 'post',
    data: node
  })
}

export function tree() {
  return request({
    url: '/rtdb/tree',
    method: 'post',
    data: {}
  })
}

export function hist(item) {
  return request({
    url: '/rtdb/hist',
    method: 'post',
    data: item
  })
}

// trendgroup
export function newTrendGroup(name) {
  return request({
    url: '/rtdb/tgroup/new',
    method: 'post',
    data: { name }
  })
}

export function delTrendGroup(id) {
  return request({
    url: '/rtdb/tgroup/del',
    method: 'post',
    data: { id }
  })
}

export function updateTrendGroup(node) {
  return request({
    url: '/rtdb/tgroup/update',
    method: 'post',
    data: node
  })
}

export function listTrendGroup() {
  return request({
    url: '/rtdb/tgroup/list',
    method: 'post',
    data: {}
  })
}

// 事件

export function eventList(filter) {
  return request({
    url: '/rtdb/event/list',
    method: 'post',
    data: filter
  })
}

export function eventAck(id) {
  return request({
    url: '/rtdb/event/ack',
    method: 'post',
    data: { id }
  })
}

// 删除事件
// id: 事件ID, 如果不为0, 只删除一个事件, 后面的两个参数没有作用
// sort: 事件的类别, 根据all删除一类事件. sort 值为0时, 没有作用.
// all: 当all为false, 删除已经消失的报警事件, all为true, 删除所有事件
export function eventDel(id, sort, all) {
  return request({
    url: '/rtdb/event/del',
    method: 'post',
    data: { id, sort, all }
  })
}
