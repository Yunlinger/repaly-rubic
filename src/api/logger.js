import request from '@/utils/request_rubik'

export function query(filter) {
  filter = filter || {}
  return request({
    url: '/log/query',
    method: 'post',
    data: filter
  })
}
