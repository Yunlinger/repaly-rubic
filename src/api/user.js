import request from '@/utils/request_rubik'

export function login(data) {
  return request({
    url: '/usr/login',
    method: 'post',
    data
  })
}

export function ssologin(appid, account, token) {
  return request({
    url: '/usr/ssologin',
    method: 'post',
    data: { appid, account, token }
  })
}

export function getInfo() {
  return request({
    url: '/usr/info',
    method: 'post',
    data: {}
  })
}

export function logout() {
  return Promise.resolve()
  // return request({
  //   url: '/usr/logout',
  //   method: 'post'
  // })
}

export function create(user) {
  return request({
    url: '/usr/create',
    method: 'post',
    data: user
  })
}

export function read(filter) {
  return request({
    url: '/usr/read',
    method: 'post',
    data: filter
  })
}

export function update(user) {
  return request({
    url: '/usr/update',
    method: 'post',
    data: user
  })
}

export function del(user) {
  return request({
    url: '/usr/delete',
    method: 'post',
    data: user
  })
}

export function clients() {
  return request({
    url: '/conn/clients',
    method: 'get'
  })
}

export function teamRead(filter) {
  return request({
    url: '/usr/team/read',
    method: 'post',
    data: filter
  })
}

export function teamCreate(team) {
  return request({
    url: '/usr/team/create',
    method: 'post',
    data: team
  })
}

export function teamUpdate(team) {
  return request({
    url: '/usr/team/update',
    method: 'post',
    data: team
  })
}

export function teamDelete(team) {
  return request({
    url: '/usr/team/delete',
    method: 'post',
    data: team
  })
}

export function teamAddUser(team) {
  return request({
    url: '/usr/team/addusr',
    method: 'post',
    data: team
  })
}

export function teamDelUsr(team) {
  return request({
    url: '/usr/team/delusr',
    method: 'post',
    data: team
  })
}

export function GetUserSofTeam(team) {
  return request({
    url: '/usr/team/getusrsofteam',
    method: 'post',
    data: team
  })
}

export function GetTeamSofUser(team) {
  return request({
    url: '/usr/team/getteamsofuser',
    method: 'post',
    data: team
  })
}
