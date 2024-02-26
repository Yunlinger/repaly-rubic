import request from '@/utils/request_rubik'

export function get(bucket, path, refresh) {
  let params = { bucket, path }
  if (refresh) {
    params.__time__ = new Date()
  }
  return request({
    url: '/minio/get',
    method: 'get',
    params: params
  })
}

export function getUrl(bucket, path) {
  const url = process.env.VUE_APP_RUBIK_API + '/minio/get?bucket=' +
    bucket + '&path=' + path
  return url
}

export function getUrlWithName(bucket, path, name) {
  const url = process.env.VUE_APP_RUBIK_API + '/minio/get/' + name + '?bucket=' +
    bucket + '&path=' + path
  return url
}

export function ls(bucket, path, filter) {
  return request({
    url: '/minio/ls',
    method: 'post',
    data: { bucket, path, filter }
  })
}

export function write(data, onUploadProgress) {
  return request({
    url: '/minio/put',
    method: 'post',
    data,
    onUploadProgress
  })
}

export function mkdir(bucket, path) {
  let fileData = new FormData() // new formData对象
  fileData.append('files', new File([''], '.empty'))
  fileData.append('bucket', bucket)
  fileData.append('path', path)
  return write(fileData)
}

export function rm(bucket, path) {
  return request({
    url: '/minio/remove',
    method: 'post',
    data: { bucket, path }
  })
}

export function cp(src, dst) {
  return request({
    url: '/minio/copy',
    method: 'post',
    data: { src, dst }
  })
}

export function bucketexists(bucket) {
  return request({
    url: '/minio/bucketexists',
    method: 'post',
    data: { bucket }
  })
}

export function newbucket(bucket) {
  return request({
    url: '/minio/newbucket',
    method: 'post',
    data: { bucket }
  })
}
