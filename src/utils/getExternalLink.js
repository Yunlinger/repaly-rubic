import store from '@/store'
import { Base64 } from 'js-base64'

export default function getExternalLink(to) {
  let links = store.getters.config.links || {}
  if (links[to]) {
    to = links[to]
    to = to.replace('${https}', (window.location.protocol === 'https:') ? '1' : '0')
    to = to.replace('${host}', window.location.host)
    to = to.replace('${token}', store.getters.token)
    to = to.replace('${project}', store.getters.project.project)
    to = to.replace('${id}', store.getters.project.id)
    // context 使用 base64 编码 json, 包含上面的所有信息
    to = to.replace('${context}', buildContext())
  }
  return to
}

function buildContext() {
  var ctx = {
    protocol: window.location.protocol,
    https: (window.location.protocol === 'https:') ? '1' : '0',
    host: window.location.host,
    token: store.getters.token,
    project: store.getters.project.project,
    id: store.getters.project.id
  }

  var str = JSON.stringify(ctx)
  var base64 = Base64.encode(str)

  return base64
}
