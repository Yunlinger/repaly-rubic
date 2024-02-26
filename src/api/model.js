import request from '@/utils/request_rubik'

// // model
export function modelSave() {
  return request({
    url: '/model/save',
    method: 'post',
    data: {}
  })
}

// import Model
export function importModel(config) {
  return request({
    url: '/model/import',
    method: 'post',
    data: config
  })
}

export function modelStart(state, params) {
  state = state || false
  return request({
    url: '/model/start',
    method: 'post',
    data: { state },
    params: params || {}
  })
}

// search
export function search(filter) {
  return request({
    url: '/model/search',
    method: 'post',
    data: filter || {}
  })
}

// export function modelLoad() {
//   return emit('modelLoad')
// }

// tree
export function pageTreeAddItem(id, parent, name) {
  parent = parent - 0
  return request({
    url: '/page/tree/new',
    method: 'post',
    data: { id, parent, name }
  })
}

export function pageTreeUpdate(id, parent, name) {
  parent = parent - 0
  id = id - 0
  return request({
    url: '/page/tree/update',
    method: 'post',
    data: { id, parent, name }
  })
}

export function pageTreeDelete(id) {
  id = id - 0
  return request({
    url: '/page/tree/delete',
    method: 'post',
    data: { id }
  })
}

// page
export function pageOpen(name) {
  return request({
    url: '/page/open',
    method: 'post',
    data: { name }
  })
}

export function pageNew(name, desc, sort) {
  sort = sort - 0
  return request({
    url: '/page/new',
    method: 'post',
    data: { name, desc, sort }
  })
}

export function pageConfig(name, desc, sort) {
  sort = sort - 0
  return request({
    url: '/page/config',
    method: 'post',
    data: { name, desc, sort }
  })
}

export function pageDel(name) {
  return request({
    url: '/page/delete',
    method: 'post',
    data: { name }
  })
}

export function pageList(sort) {
  sort = sort || 0
  sort = sort - 0
  return request({
    url: '/page/list',
    method: 'post',
    data: { sort }
  })
}

export function pageSource(name) {
  return request({
    url: '/page/source',
    method: 'post',
    data: { name }
  })
}

export function pageSetColor(name, color) {
  return request({
    url: '/page/setcolor',
    method: 'post',
    data: { name, color }
  })
}

export function pageSet(name, key, value) {
  return request({
    url: '/page/set',
    method: 'post',
    data: { name, key, value }
  })
}

// block
export function blockNew(block, desc, alg, page, x, y) {
  return request({
    url: '/block/new',
    method: 'post',
    data: { name: block, page, alg, x, y }
  })
}

export function blockGet(id) {
  id = id - 0
  return request({
    url: '/block/detail',
    method: 'post',
    data: { id }
  })
}

export function blockGetInfo(id) {
  id = id - 0
  return request({
    url: '/block/info',
    method: 'post',
    data: { id }
  })
}

export function blockGetPage(id) {
  id = id - 0
  return request({
    url: '/block/getpage',
    method: 'post',
    data: { id }
  })
}

export function blockDel(id, delref) {
  return request({
    url: '/block/delete',
    method: 'post',
    data: { id, delref }
  })
}

export function blockReName(id, name) {
  return request({
    url: '/block/rename',
    method: 'post',
    data: { id, name }
  })
}

export function blockSetPos(id, x, y) {
  return request({
    url: '/block/set/pos',
    method: 'post',
    data: { id, x, y }
  })
}

/*
blockCopy 拷贝模块, 可以替换拷贝
新接口, 可用多重替换
{
    "page": "TEST",
    "dx": 20,
    "dy": 20,
    "ids": [8, 9, 10, 11],
    "replaces": [
        {"old": "T", "new": "AA"},
        {"old": "AA", "new": "BB"},
        {"old": "0", "new": "000"}
    ]
}
或者用单独替换的老接口
{
    "page": "TEST",
    "dx": 20,
    "dy": 20,
    "ids": [8, 9, 10, 11],
    "old": "T",
    "new": "AA"
}
返回值
{
  blocks: map[id]obj,         // 替换前后模块的对应关系
  varMap: map[string]string,  // 替换前后变量的对应关系
}
*/

export function blockCopy(page, ids, dx, dy, old, _new, replaces) {
  return request({
    url: '/block/copy',
    method: 'post',
    data: { page, ids, dx, dy, old, new: _new, replaces }
  })
}

export function setInVar(id, index, name) {
  return request({
    url: '/block/set/invar',
    method: 'post',
    data: { id, index, name }
  })
}

export function setOutVar(id, index, name) {
  return request({
    url: '/block/set/outvar',
    method: 'post',
    data: { id, index, name }
  })
}

export function setCoef(id, index, value) {
  return request({
    url: '/block/set/coef',
    method: 'post',
    data: { id, index, value }
  })
}

export function setTick(id, tick) {
  return request({
    url: '/block/set/tick',
    method: 'post',
    data: { id, tick }
  })
}

export function setDesc(id, desc) {
  return request({
    url: '/block/set/desc',
    method: 'post',
    data: { id, desc }
  })
}

export function setDirection(id, dir) {
  return request({
    url: '/block/set/dir',
    method: 'post',
    data: { id, dir }
  })
}

// connection
export function connectionNew(page, sb, sp, tb, tp, points) {
  points = points || []
  return request({
    url: '/page/conn/new',
    method: 'post',
    data: { page, sb, sp, tb, tp, points }
  })
}

export function connectionMove(page, id, points) {
  return request({
    url: '/page/conn/move',
    method: 'post',
    data: { page, id, points }
  })
}

export function connectionDel(page, id) {
  return request({
    url: '/page/conn/del',
    method: 'post',
    data: { page, id }
  })
}

// Label
export function labelNew(page, label) {
  return request({
    url: '/page/label/new',
    method: 'post',
    data: { page, label }
  })
}

export function labelMove(page, id, x, y) {
  return request({
    url: '/page/label/move',
    method: 'post',
    data: { page, id, x, y }
  })
}

export function labelSetText(page, id, text) {
  return request({
    url: '/page/label/settext',
    method: 'post',
    data: { page, id, text }
  })
}

export function labelSetColor(page, id, fontColor) {
  return request({
    url: '/page/label/setcolor',
    method: 'post',
    data: { page, id, fontColor }
  })
}

export function labelSetSize(page, id, fontSize) {
  fontSize = fontSize || 10
  fontSize = Math.max(fontSize, 6)
  return request({
    url: '/page/label/setsize',
    method: 'post',
    data: { page, id, fontSize }
  })
}

export function labelDel(page, id) {
  return request({
    url: '/page/label/del',
    method: 'post',
    data: { page, id }
  })
}

// valuebox
export function vbNew(page, name, x, y) {
  return request({
    url: '/page/vbox/new',
    method: 'post',
    data: { page, name, x, y }
  })
}

export function vbMove(page, id, x, y) {
  return request({
    url: '/page/vbox/move',
    method: 'post',
    data: { page, id, x, y }
  })
}

export function vbSetVar(page, id, name) {
  return request({
    url: '/page/vbox/setvar',
    method: 'post',
    data: { page, id, name }
  })
}

export function vbDel(page, id) {
  return request({
    url: '/page/vbox/del',
    method: 'post',
    data: { page, id }
  })
}

// pin
export function pinNew(page, name, x, y) {
  return request({
    url: '/page/pin/new',
    method: 'post',
    data: { page, name, x, y }
  })
}

export function pinGet(page, id) {
  return request({
    url: '/page/pin/get',
    method: 'post',
    data: { page, id }
  })
}

export function pinMove(page, id, x, y) {
  return request({
    url: '/page/pin/move',
    method: 'post',
    data: { page, id, x, y }
  })
}

export function pinSet(page, id, name, desc) {
  return request({
    url: '/page/pin/set',
    method: 'post',
    data: { page, id, name, desc }
  })
}

export function pinDel(page, id) {
  return request({
    url: '/page/pin/del',
    method: 'post',
    data: { page, id }
  })
}

export function varGetDetail(id) {
  return request({
    url: '/var/detail',
    method: 'post',
    data: { id }
  })
}

export function varGetDetailByName(name) {
  return request({
    url: '/var/detailbyname',
    method: 'post',
    data: { name }
  })
}
