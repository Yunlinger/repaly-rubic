import { fabric } from 'fabric'

// Save additional attributes in Serialization
fabric.Object.prototype.name = ''
fabric.Object.prototype.toObject = (function(toObject) {
  return function(properties) {
    let obj = {
      name: this.name
    }
    if (!this.name) {
      delete obj.name
    }
    return fabric.util.object.extend(toObject.call(this, properties), obj)
  }
})(fabric.Object.prototype.toObject)
