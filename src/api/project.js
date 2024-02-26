import request from '@/utils/request_rubik'
import store from '@/store'

// startInstance 启动一个模型实例
export function startInstance(project, model, name, id) {
  return request({
    url: '/project/start',
    method: 'post',
    data: {
      project: project,
      model: 'model',
      name: name,
      id: id
    }
  })
}

// stopInstance 停止一个模型实例
export function stopInstance(project, model, id) {
  return request({
    url: '/project/stop',
    method: 'post',
    data: {
      project,
      model,
      id
    }
  })
}

export function list() {
  return request({
    url: '/project/prolist',
    method: 'post',
    data: {}
  })
}

export function alllist() {
  return request({
    url: '/project/allprolist',
    method: 'post',
    data: {}
  })
}

export function getServerList(name) {
  return request({
    url: '/project/instlist',
    method: 'post',
    data: { name }
  })
}

// setInstSpeed 设置实例运行速度
export function setInstSpeed(inst) {
  return request({
    url: '/project/speed',
    method: 'post',
    data: inst
  })
}

// 获取工程文件
function getProjectFile(project, path) {
  if (typeof project !== 'string' || project === '') {
    project = store.getters.project.project
  }
  let params = {
    'rubik.project': project,
    path: path
  }
  return request({
    url: '/fs/open',
    method: 'get',
    params: params
  })
}

// 获取工程设置
export function getSetting(project) {
  return getProjectFile(project, '../model/setting.json')
}

// 获取工程案例
export function getCase(project) {
  return getProjectFile(project, '../model/case.json')
}

// 获取工程工况
export function getCondition(project) {
  return getProjectFile(project, '../condition/list.json')
}

// 获取工程故障
export function getFault(project) {
  return getProjectFile(project, '../fault/fault.json')
}

// create 新建工程
export function create(name, parent) {
  return request({
    url: '/project/create',
    method: 'post',
    data: { name, parent }
  })
}

// delete 删除
export function delet(name) {
  return request({
    url: '/project/delete',
    method: 'post',
    data: { name }
  })
}

// addtogroup 将工程分配到组
export function addToGroup(pname, gid) {
  return request({
    url: '/project/addtogroup',
    method: 'post',
    data: { name: pname, id: gid }
  })
}

// removefromgroup 将工程从组中删除
export function removeFromGroup(pname, gid) {
  return request({
    url: '/project/removefromgroup',
    method: 'post',
    data: { name: pname, id: gid }
  })
}

// removefromgroup 将工程从组中删除
export function getProjectsOfGroup(gid) {
  return request({
    url: '/project/getprojectsofgroup',
    method: 'post',
    data: { id: gid }
  })
}

export function setexam(data) {
  return request({
    url: '/project/setexam',
    method: 'post',
    data: data
  })
}

export function unsetexam(data) {
  return request({
    url: '/project/unsetexam',
    method: 'post',
    data: data
  })
}
