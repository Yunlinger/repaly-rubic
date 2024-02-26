import MessageBox from '@/components/message-box'

let nowNum = ''
// eslint-disable-next-line no-unused-vars, space-before-function-paren
const addNumber = (i) => {
  if (i !== 'back') {
    nowNum = nowNum + i
  } else {
    nowNum = nowNum.substring(0, nowNum.length - 1)
  }
  let ele = document.getElementById('inputnum')
  ele.value = `${nowNum}`
}
const changeVal = () => {
  let ele = document.getElementById('inputnum')
  nowNum = ele.value
}
window.addNumber = addNumber
window.changeVal = changeVal

function reset(val) {
  nowNum = val
  let ele = document.getElementById('inputnum')
  if (ele) ele.value = val
}

function inspectVal(val) {
  if (val.length > 0) {
    return val.substr(-1) === '.' || val.substr(-1) === '-' || (val.charAt(0) === '0' && val.length > 1)
  }
  return true
}

function keyboard() {
  let str = ''
  for (let i = 0; i <= 9; i++) {
    let item =
    `<div
      style="width: 30px;height: 30px;line-height: 30px; border: 1px solid #CCC; border-radius: 5px;text-align:center;cursor: pointer;"
      onclick="addNumber(${i})"
    >
      ${i}
    </div>`
    str += item
  }
  str +=
  `<div
    style="width: 30px;height: 30px;line-height: 30px; border: 1px solid #CCC; border-radius: 5px;text-align:center;cursor: pointer;"
    onclick="addNumber('.')"
  >
    .
  </div>
  <div
    style="width: 30px;height: 30px;line-height: 30px; border: 1px solid #CCC; border-radius: 5px;text-align:center;cursor: pointer;"
    onclick="addNumber('-')"
  >
    -
  </div>
  <div
  style="width: 30px;height: 30px;line-height: 30px; border: 1px solid #CCC; border-radius: 5px;text-align:center;cursor: pointer;"
  onclick="addNumber('back')"
>
  ←
</div>`
  return str
}

export function inputNum(msg, title, defaultValue, event) {
  reset(msg)
  let components = keyboard()
  let str = `<div>
      <div style="margin: 0 auto;width: 200px;display: flex;margin-bottom: 5px;">
        <input id="inputnum" value="${msg}" style="width: 180px;padding: 3px;border:1px solid #dcdfe6;box-sizing: border-box;outline: none;" oninput="changeVal()" />
      </div>
      <div style="margin: 0 auto;width: 200px;height:70px;display: flex;flex-wrap:wrap;user-select: none;">${components}<div>
    </div>`
  return new Promise((resolve, reject) => {
    MessageBox.prompt(str, title || '请输入', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: nowNum || defaultValue,
      showInput: false,
      dangerouslyUseHTMLString: true,
      customClass: 'rubik-confirm-box',
      followMouse: true,
      event: event
    }).then(() => {
      // 输入框为空使用传入值
      let val = nowNum || msg
      if (inspectVal(val)) {
        reject('请检查输入值')
        return
      }
      resolve({
        value: val
      })
      reset('')
    }).catch(() => { reset('') })
  })
}

