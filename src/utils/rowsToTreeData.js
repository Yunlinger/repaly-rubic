function exists(rows, parent) {
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === parent) return true
  }
  return false
}

export default function(rows) {
  var nodes = []
  // get the top level nodes
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    if (!exists(rows, row.parent)) {
      nodes.push(row)
    }
  }
  var toDo = []
  for (i = 0; i < nodes.length; i++) {
    toDo.push(nodes[i])
  }
  while (toDo.length) {
    var node = toDo.shift()	// the parent node
    // get the children nodes
    for (i = 0; i < rows.length; i++) {
      if (rows[i].parent === node.id) {
        if (node.children) {
          node.children.push(rows[i])
        } else {
          node.children = [rows[i]]
        }
        toDo.push(rows[i])
      }
    }
  }
  return nodes
}
