
const fill = { name: 'fill', label: '填充', type: 'color', alpha: true }
const backgroundColor = { name: 'backgroundColor', label: '背景', type: 'color', alpha: true }
const textColor = { name: 'fill', label: '颜色', type: 'color', alpha: true }
const stroke = { name: 'stroke', label: '边线', type: 'color', alpha: true }
const text = { name: 'text', label: '文本', type: 'text' }
const src = { name: 'rsrc', label: '图片', type: 'file' }
const strokeWidth = { name: 'strokeWidth', label: '线宽', type: 'number', step: 1, min: 0, max: 32 }
const opacity = { name: 'opacity', label: '透明', type: 'number', step: 0.1, max: 1, min: 0 }
const scaleX = { name: 'scaleX', label: 'X缩放', type: 'number', step: 0.1, max: 10, min: 0.1 }
const scaleY = { name: 'scaleY', label: 'Y缩放', type: 'number', step: 0.1, max: 10, min: 0.1 }
const flipX = { name: 'flipX', label: 'X翻转', type: 'bool' }
const flipY = { name: 'flipY', label: 'Y翻转', type: 'bool' }
const angle = { name: 'angle', label: '旋转', type: 'number', step: 5 }
const fpct = { name: 'fpct', label: '填充位', type: 'number', step: 0.1, max: 1, min: 0 }

const desc = { name: 'rdesc', label: '描述', type: 'text' }
const width = { name: 'rwidth', label: '宽度', type: 'number', step: 5 }
const height = { name: 'rheight', label: '高度', type: 'number', step: 5 }
const bgImage = { name: 'bgImage', label: '背景图', type: 'file' }

const dynBColor = { name: 'fcolor', label: '填充', type: 'expr', valueType: 'color', defaultValue: '#aaaaaa' }
const dynPColor = { name: 'ecolor', label: '线色', type: 'expr', valueType: 'color', defaultValue: '#aaaaaa' }
const dynTColor = { name: 'tcolor', label: '字色', type: 'expr', valueType: 'color', defaultValue: '#aaaaaa' }
const dynAngle = { name: 'angle', label: '角度', type: 'expr', valueType: 'number', defaultValue: 0 }
const dynText = { name: 'text', label: '文本', type: 'expr', valueType: 'text', defaultValue: 'text' }
const dynImage = { name: 'rsrc', label: '图片', type: 'expr', valueType: 'text', defaultValue: 'default.png' }
const dynVis = { name: 'visible', label: '可见', type: 'expr', valueType: 'bool', defaultValue: true }
const dynValue = { name: 'value', label: '数值', type: 'value' }
const dynClick = { name: 'click', label: '点击', type: 'event' }

const baseAttrs = [flipX, flipY, opacity, angle, scaleX, scaleY]

export default {
  empty: [],
  base: baseAttrs,
  image: [...baseAttrs, src],
  text: [...baseAttrs, textColor, backgroundColor, text],
  rect: [...baseAttrs, fill, stroke, backgroundColor, strokeWidth],
  bar: [...baseAttrs, fill, stroke, backgroundColor, strokeWidth, fpct],
  page: [desc, width, height, bgImage, backgroundColor],
  dyn: [dynBColor, dynPColor, dynTColor, dynAngle, dynText, dynVis, dynImage, dynValue, dynClick]
}
