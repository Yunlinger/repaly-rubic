
var getStore = function() {
  return window.localStorage
}

var supported = function() {
  return window.localStorage
}

var get = function(key) {
  var store = getStore()
  if (store) {
    return store.getItem(key)
  }
  return undefined
}

var set = function(key, value) {
  var store = getStore()
  if (store) {
    return store.setItem(key, value)
  }
}

var remove = function(key) {
  var store = getStore()
  if (store) {
    return store.removeItem(key)
  }
}

export default {
  supported,
  get,
  set,
  remove
}
