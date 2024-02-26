import request from '@/utils/request_rubik'

export function getAll() {
  return request({
    url: '/alg/all',
    method: 'post',
    data: {}
  })
}

export function getOne(name) {
  return request({
    url: '/alg/one',
    method: 'post',
    data: { name }
  })
}

export function uploadIcon(name, data) {
  const p = {
    path: 'icon/' + name
  }
  return request({
    url: '/fs/write',
    method: 'post',
    params: p,
    data
  })
}

export function getTree() {
  return request({
    url: '/alg/all',
    method: 'post',
    data: {}
  })
}

export function createSort(name, parent) {
  parent = parent || 0
  parent = parent - 0
  return request({
    url: '/alg/createsort',
    method: 'post',
    data: { name, parent }
  })
}

export function deleteSort(id) {
  id = id || 0
  id = id - 0
  return request({
    url: '/alg/deletesort',
    method: 'post',
    data: { id }
  })
}

export function setSortName(id, name) {
  id = id || 0
  id = id - 0
  return request({
    url: '/alg/setsortname',
    method: 'post',
    data: { id, name }
  })
}

export function save(name, alg) {
  return request({
    url: '/alg/save',
    method: 'post',
    data: { name, alg }
  })
}

export function del(name) {
  return request({
    url: '/alg/delete',
    method: 'post',
    data: { name }
  })
}

export function createBulk(bulk) {
  return request({
    url: '/bulk/create',
    method: 'post',
    data: bulk
  })
}

export function readBulk(id) {
  return request({
    url: '/bulk/read',
    method: 'post',
    data: { id }
  })
}

export function updateBulk(bulk) {
  return request({
    url: '/bulk/update',
    method: 'post',
    data: bulk
  })
}

export function deleteBulk(id) {
  return request({
    url: '/bulk/delete',
    method: 'post',
    data: { id }
  })
}

export function build(project, m64) {
  return request({
    url: '/fs/build',
    method: 'post',
    data: { path: project, m64: !!m64 }
  })
}
