/*
输出提示信息
*/

import { Notification } from 'element-ui'
import MessageBox from '@/components/message-box'
import { inputNum } from './messageboxInputNum'
import msgbox from './msgbox'

function success(msg, title) {
  Notification.success({
    title: title || '',
    message: msg,
    offset: 64
  })
}

function warning(msg, title) {
  Notification.warning({
    title: title || '',
    message: msg,
    offset: 64
  })
}

function info(msg, title) {
  Notification.info({
    title: title || '',
    message: msg
  })
}

function error(msg, title) {
  Notification.error({
    title: title || '',
    message: msg,
    offset: 64
  })
}

function showMessage(msg, title) {
  Notification.success({
    message: msg,
    title: title || '',
    offset: 64
  })
}

function input(msg, title, defaultValue, event) {
  return MessageBox.prompt(msg, title || '请输入', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: defaultValue,
    customClass: 'rubik-confirm-box',
    followMouse: true,
    event: event
  })
}

showMessage.success = success
showMessage.warning = warning
showMessage.info = info
showMessage.error = error
showMessage.input = input
showMessage.inputNum = inputNum
showMessage.install = function(Vue, options) {
  Vue.prototype.$msg = showMessage
  Vue.prototype.$confirmWithInput = msgbox
}

export default showMessage
