import request from '@/utils/request_rubik'

export function create(group) {
  return request({
    url: '/usr/group/create',
    method: 'post',
    data: group
  })
}

export function read(filter) {
  return request({
    url: '/usr/group/read',
    method: 'post',
    data: filter
  })
}

export function update(group) {
  return request({
    url: '/usr/group/update',
    method: 'post',
    data: group
  })
}

export function del(group) {
  return request({
    url: '/usr/group/delete',
    method: 'post',
    data: group
  })
}

export function addusr(gid, uid) {
  return request({
    url: '/usr/group/addusr',
    method: 'post',
    data: { gid, uid }
  })
}

export function delusr(gid, uid) {
  return request({
    url: '/usr/group/delusr',
    method: 'post',
    data: { gid, uid }
  })
}

export function getUsersOfGroup(gid) {
  return request({
    url: '/usr/group/getusrsofgroup',
    method: 'post',
    data: { id: gid }
  })
}

export function getGroupsOfUser(uid) {
  return request({
    url: '/usr/group/getgroupsofuser',
    method: 'post',
    data: { id: uid }
  })
}

