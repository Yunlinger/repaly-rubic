import { fabric } from 'fabric'
import search from '@/rviews/model/components/find'
import sb from '@/rviews/model/components/sb'
import detail from '@/rviews/model/components/detail'
import * as mapi from '@/api/model'

fabric.Object.prototype.isText = function() {
  return (this.type === 'text' ||
          this.type === 'i-text' ||
          this.type === 'textbox' ||
          this.type === 'button'
  )
}

fabric.StaticCanvas.prototype.openVarDetail = function(v) {
  detail({
    name: [v]
  })
}

fabric.StaticCanvas.prototype.openVarDefOrRef = function(v) {
  new Promise((resolve) => {
    mapi.varGetDetailByName(v).then(res => {
      if (res.defs && res.defs.length === 1) {
        sb({
          bid: res.defs[0].id,
          selected: {
            port: 'out',
            index: res.defs[0].index || 0
          }
        })
      } else if (res.refs && res.refs.length === 1) {
        // 单引用
        sb({
          bid: res.refs[0].id,
          selected: {
            port: 'in',
            index: res.refs[0].index || 0
          }
        })
      } else if ((!res.defs || res.defs.length === 0) && (!res.refs || res.refs.length === 0)) {
        // 游离变量, 没有定义, 也没有引用
        resolve(false)
        return
      } else {
        // 多定义
        search({
          stype: 'var',
          skey: v
        })
      }
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  }).then((varExists) => {
    if (!varExists) {
      return mapi.search({
        wildcard: false,
        content: 'block',
        name: v,
        pageIndex: 1,
        pageSize: 10
      }).then(res => {
        if (res && res.items && res.items.length) {
          sb({ bid: res.items[0].id })
          return
        }

        return Promise.reject('no block')
      })
    }
    return Promise.resolve()
  }).catch((e) => {
    search({
      stype: 'var',
      skey: v
    })
  })
}
