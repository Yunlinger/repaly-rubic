/*
通过 msgbox 输入一些必要信息.
*/

import { MessageBox } from 'element-ui'

export default function(title, attrs) {
  return new Promise((resolve, reject) => {
    var h = this && this.$createElement
    if (!h) {
      reject('createElement is undefined')
      return
    }
    if (!(attrs instanceof Array)) {
      reject('attrs is not array')
      return
    }

    let domAttrs = []
    for (let attr of attrs) {
      let domProps = {
        value: attr.value,
        type: attr.type || ''
      }
      if (attr.type === 'checkbox') {
        domProps.checked = attr.value || false
      }
      domAttrs.push(h('div', { style: 'margin:10px 0 0 40px;' }, [
        h('span', { style: 'margin-left:10px;font-size:16px;line-height:24px;font-weight:600;vertical-align:middle;' }, `${attr.caption || ''}:  `),
        h('input', {
          style: 'margin-left:10px;font-size:16px;line-height:24px;vertical-align:middle;width:auto;',
          domProps: {
            value: attr.value,
            type: attr.type || ''
          },
          on: {
            input: (event) => {
              attr.value = event.target.value
              if (attr.type === 'checkbox') {
                attr.value = event.target.checked
              }
            }
          }
        })
      ]
      ))
    }
    MessageBox({
      closeOnClickModal: false,
      message: h('div', null, [
        h('i', { class: 'el-icon-question', style: 'color:#f90;font-size:18px;vertical-align:middle' }),
        h('span', { style: 'margin-left:10px;font-size:18px;line-height:40px;font-weight:600;vertical-align:middle;' }, title || '提示'),
        h('div', null, domAttrs)
      ]),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          resolve(attrs)
          done()
        } else {
          done()
        }
      }
    }).catch(err => {
      reject(err)
    })
  })
}
