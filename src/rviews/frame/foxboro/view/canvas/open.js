import fabric from './fabric'
import * as res from '@/api/res'

fabric.StaticCanvas.prototype.open = function(filePath) {
  var _this = this
  _this.name = filePath
  return new Promise((resolve, reject) => {
    const jsonPath = 'mmi/' + filePath + '.json'
    res.open(jsonPath).then(res => {
      _this.clear()
      _this.loadFromJSON(res)
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}
