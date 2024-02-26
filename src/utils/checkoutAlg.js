import store from '@/store'

var isEmptyObject = function(obj) {
  if (!obj) {
    return true
  }
  for (var key in obj) {
    return false
  }
  return true
}

var ckeck = function() {
  if (isEmptyObject(store.getters.algs)) {
    store.dispatch('AlgGetAll')
  }
}

ckeck()
