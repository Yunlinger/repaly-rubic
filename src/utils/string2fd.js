export default function(data, name) {
  var fd = new FormData()
  var file = new File([data], name, {
    type: 'text/plain'
  })
  fd.append('file', file)

  return fd
}
