import { fabric } from 'fabric'

fabric.Object.prototype.initParam = function(key, value) {
  if (this.dyn) {
    for (let _key in this.dyn) {
      if (this.dyn[_key].exprs) {
        for (let i = 0; i < this.dyn[_key].exprs.length; i++) {
          if (typeof this.dyn[_key].exprs[i].expr === 'string') {
            this.dyn[_key].exprs[i].expr = this.dyn[_key].exprs[i].expr.replaceAll('{' + key + '}', value)
          }
          if (typeof this.dyn[_key].exprs[i].value === 'string') {
            this.dyn[_key].exprs[i].value = this.dyn[_key].exprs[i].value.replaceAll('{' + key + '}', value)
          }
        }
      }
      if (typeof this.dyn[_key].expr === 'string') {
        this.dyn[_key].expr = this.dyn[_key].expr.replaceAll('{' + key + '}', value)
      }
      if (typeof this.dyn[_key].script === 'string') {
        this.dyn[_key].script = this.dyn[_key].script.replaceAll('{' + key + '}', value)
      }
      if (typeof this.dyn[_key].name === 'string') {
        this.dyn[_key].name = this.dyn[_key].name.replaceAll('{' + key + '}', value)
      }
      if (typeof this.dyn[_key].attr === 'string') {
        this.dyn[_key].attr = this.dyn[_key].attr.replaceAll('{' + key + '}', value)
      }
      if (typeof this.dyn[_key].format === 'string') {
        this.dyn[_key].format = this.dyn[_key].format.replaceAll('{' + key + '}', value)
      }
    }
  }
  if (this.action) {
    for (let _key in this.action) {
      if (this.action[_key].act === 'openWindow' || this.action[_key].act === 'openPad') {
        if (typeof this.action[_key].pic === 'string') {
          this.action[_key].pic = this.action[_key].pic.replaceAll('{' + key + '}', value)
        }
        if (this.action[_key].param) {
          for (let __key in this.action[_key].param) {
            if (typeof this.action[_key].param[__key] === 'string') {
              this.action[_key].param[__key] = this.action[_key].param[__key].replaceAll('{' + key + '}', value)
            }
          }
        }
      } else {
        this.action[_key].name = this.action[_key].name || ''
        if (typeof this.action[_key].name === 'string') {
          this.action[_key].name = this.action[_key].name.replaceAll('{' + key + '}', value)
        }
        this.action[_key].confirm = this.action[_key].confirm || ''
        if (typeof this.action[_key].confirm === 'string') {
          this.action[_key].confirm = this.action[_key].confirm.replaceAll('{' + key + '}', value)
        }
      }
    }
  }

  if (this.isText()) {
    if (!this.text_bck) {
      this.text_bck = this.text
    }
    this.set('text', this.get('text').replaceAll('{' + key + '}', value))
  }
}

fabric.Group.prototype.initParam = function(key, value) {
  this.getObjects().forEach(obj => {
    obj.initParam(key, value)
  })
  this.callSuper('initParam', key, value)
}
