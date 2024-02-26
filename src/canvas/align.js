// align Items
import { fabric } from 'fabric'

fabric.Canvas.prototype.alignItems = function(direction) {
  const group = this.getActiveObject()
  if (group.type !== 'activeSelection') {
    return
  }

  let groupWidth = group.getBoundingRect(true).width
  let groupHeight = group.getBoundingRect(true).height

  let left = group.get('left')
  let top = group.get('top')
  let right = left + groupWidth
  let bottom = top + groupHeight

  group.forEachObject(function(item) {
    const itemWidth = item.getBoundingRect().width
    const itemHeight = item.getBoundingRect().height

    if (direction === 'left') {
      item.set({
        left: 0
      })
    } else if (direction === 'top') {
      item.set({
        top: 0
      })
    } else if (direction === 'right') {
      item.set({
        left: groupWidth - itemWidth
      })
    } else if (direction === 'bottom') {
      item.set({
        top: groupHeight - itemHeight
      })
    } else if (direction === 'centerX') {
      item.set({
        left: groupWidth / 2 - itemWidth / 2
      })
    } else if (direction === 'centerY') {
      item.set({
        top: groupHeight / 2 - itemHeight / 2
      })
    }
  })

  group._calcBounds()
  group._updateObjectsCoords()
  group.setCoords()

  let newGroupWidth = group.getBoundingRect(true).width
  let newGroupHeight = group.getBoundingRect(true).height

  switch (direction) {
    case 'left':
    case 'top':
    default:
      group.set({
        left: left,
        top: top
      })
      break
    case 'right':
    case 'bottom':
      group.set({
        left: right - newGroupWidth,
        top: bottom - newGroupHeight
      })
      break
    case 'centerX':
    case 'centerY':
      group.set({
        left: left + groupWidth / 2 - newGroupWidth / 2,
        top: top + groupHeight / 2 - newGroupHeight / 2
      })
      break
  }

  group.setCoords()
  this.requestRenderAll()
}

fabric.Canvas.prototype.alignSize = function(direction) {
  const group = this.getActiveObject()
  if (group.type !== 'activeSelection') {
    return
  }

  let left = group.get('left')
  let top = group.get('top')

  let minWidth, minHeight, maxWidth, maxHeight
  let minLeft, minTop, maxLeft, maxTop

  let bGetSize = false

  let items = []

  group.forEachObject(function(item) {
    let itemWidth = item.width * item.scaleX
    let itemHeight = item.height * item.scaleY
    let itemLeft = item.left
    let itemTop = item.top
    if (!bGetSize) {
      bGetSize = true
      maxWidth = minWidth = itemWidth
      maxHeight = minHeight = itemHeight
      maxLeft = minLeft = itemLeft
      maxTop = minTop = itemTop
    } else {
      maxWidth = Math.max(maxWidth, itemWidth)
      minWidth = Math.min(minWidth, itemWidth)
      maxHeight = Math.max(maxHeight, itemHeight)
      minHeight = Math.min(minHeight, itemHeight)

      maxLeft = Math.max(maxLeft, itemLeft)
      minLeft = Math.min(minLeft, itemLeft)
      maxTop = Math.max(maxTop, itemTop)
      minTop = Math.min(minTop, itemTop)
    }
    items.push(item)
  })

  if (direction === 'spaceX' && items.length >= 3) {
    items = items.sort((a, b) => {
      return a.left - b.left
    })
    for (let i = 1; i < items.length - 1; i++) {
      items[i].set('left', minLeft + (maxLeft - minLeft) / (items.length - 1) * i)
    }
  }

  if (direction === 'spaceY' && items.length >= 3) {
    items = items.sort((a, b) => {
      return a.top - b.top
    })
    for (let i = 1; i < items.length - 1; i++) {
      items[i].set('top', minTop + (maxTop - minTop) / (items.length - 1) * i)
    }
  }

  group.forEachObject(function(item) {
    let itemWidth = item.width
    let itemHeight = item.height
    let scaleX, scaleY

    switch (direction) {
      case 'minw':
        scaleX = (minWidth / itemWidth)
        item.set({
          scaleX
        })
        break
      case 'maxw':
        scaleX = (maxWidth / itemWidth)
        item.set({
          scaleX
        })
        break
      case 'minh':
        scaleY = (minHeight / itemHeight)
        item.set({
          scaleY
        })
        break
      case 'maxh':
        scaleY = (maxHeight / itemHeight)
        item.set({
          scaleY
        })
        break
    }
  })

  group._calcBounds()
  group._updateObjectsCoords()
  group.setCoords()

  group.set({
    left: left,
    top: top
  })

  group.setCoords()
  this.requestRenderAll()
}
