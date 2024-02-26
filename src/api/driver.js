import request from '@/utils/request_rubik'

export function getout() {
  return request({
    url: '/driver/getout',
    method: 'post',
    data: {}
  })
}

export function startup() {
  return request({
    url: '/driver/startup',
    method: 'post',
    data: {}
  })
}

export function restart() {
  return new Promise((resolve, reject) => {
    getout().then(() => {
      startup().then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    }).catch(() => {
      startup().then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  })
}

export function stepRun(params) {
  return request({
    url: '/driver/steprun',
    method: 'post',
    data: {},
    params: params || {}
  })
}

/**
 *
 * @param {*} freezeVar
 * @param {*} freezeOp // 0 NOP;  1 ==; 2 >; 3 >=; 4 <; 5 <=;
 * @param {*} freezeValue
 * @returns
 */
export function freezeIf(freezeVar, freezeOp, freezeValue) {
  return request({
    url: '/driver/freezeif',
    method: 'post',
    data: { freezeVar, freezeOp, freezeValue }
  })
}
