// 工况 api

import request from '@/utils/request_rubik'

// 保存工况
export function saveCond(id, personal) {
  return request({
    url: '/condition/cond/save',
    method: 'post',
    data: { id, personal }
  })
}

// 加载工况
export function loadCond(id, personal, params) {
  return request({
    url: '/condition/cond/load',
    method: 'post',
    data: { id, personal },
    params: params || {}
  })
}

export function delCond(id, personal) {
  return request({
    url: '/condition/cond/del',
    method: 'post',
    data: { id, personal }
  })
}

export function listCond(personal) {
  return request({
    url: '/condition/cond/list',
    method: 'post',
    data: { personal }
  })
}

export function updateCond(id, name, personal) {
  return request({
    url: '/condition/cond/update',
    method: 'post',
    data: { id, name, personal }
  })
}

// snapshot
// 保存快照
export function saveSnapshot(data) {
  return request({
    url: '/condition/snapshot/save',
    method: 'post',
    data: data
  })
}

// 恢复快照
export function restoreSnapshot(id) {
  return request({
    url: '/condition/snapshot/restore',
    method: 'post',
    data: { id }
  })
}

// 快照列表
export function listSnapshot() {
  return request({
    url: '/condition/snapshot/list',
    method: 'post',
    data: {}
  })
}

export function getSnapshotConfig() {
  return request({
    url: '/condition/snapshot/getconfig',
    method: 'post',
    data: {}
  })
}

export function setSnapshotConfig(config) {
  return request({
    url: '/condition/snapshot/setconfig',
    method: 'post',
    data: config
  })
}

