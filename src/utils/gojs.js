import go from 'gojs'
import * as resApi from '@/api/res'
var $ = go.GraphObject.make

function portStyle(input, direction) {
  input = input || false
  var spot = go.Spot.Right
  switch (direction & 0x07) {
    case 0:
      spot = go.Spot.Top
      break
    case 1:
      spot = go.Spot.Right
      break
    case 2:
      spot = go.Spot.Bottom
      break
    case 3:
      spot = go.Spot.Left
      break
    case 4:
      spot = go.Spot.Default
      break
  }
  return {
    desiredSize: new go.Size(6, 6),
    fill: input ? 'blue' : 'green',
    stroke: input ? 'blue' : 'green',
    fromSpot: spot,
    fromLinkable: !input,
    fromLinkableSelfNode: !input,
    fromMaxLinks: (direction & 0x08) ? 1 : 256,
    toSpot: spot,
    toLinkable: input,
    toLinkableSelfNode: false,
    toMaxLinks: (direction & 0x08) ? 16 : 1,
    cursor: 'crosshair'
  }
}

function toLocation(data, node) {
  return new go.Point(data.x, data.y)
}

function fromLocation(loc, data, model) {
  model.setDataProperty(data, 'x', loc.x)
  model.setDataProperty(data, 'y', loc.y)
}

function nodeInfo(data) {
  var str = 'Name: ' + data.name + '\n' +
            'Alg: ' + data.alg + '\n' +
            'ID: ' + data.id
  if (data.desc && data.desc.length > 0) {
    str = str + '\n' + 'Desc: ' + data.desc
  }
  return str
}

export function buildNodeTemplate(alg) {
  const ports = []
  if (alg.in) {
    for (var i = 0; i < alg.in.length; i++) {
      if (alg.in[i].connable) {
        ports.push(
          $(go.Shape, 'Circle', portStyle(true, alg.in[i].dir || 0),
            {
              portId: '' + (0 - (i + 1)),
              alignment: new go.Spot((alg.in[i].x || 0) / alg.width, (alg.in[i].y || 0) / alg.height),
              toolTip: $('ToolTip',
                $(go.TextBlock, {
                  margin: 4,
                  text: `${i + 1}: ${alg.in[i].name || ''} ${alg.in[i].desc || ''}`
                })
              )
            })
        )
      }
    }
  }
  if (alg.out) {
    for (i = 0; i < alg.out.length; i++) {
      if (alg.out[i].connable) {
        ports.push(
          $(go.Shape, 'Circle', portStyle(false, alg.out[i].dir || 0),
            {
              portId: '' + (i + 1),
              alignment: new go.Spot((alg.out[i].x || 0) / alg.width, (alg.out[i].y || 0) / alg.height),
              toolTip: $('ToolTip',
                $(go.TextBlock, {
                  margin: 4,
                  text: `${i + 1}: ${alg.out[i].name || ''} ${alg.out[i].desc || ''}`
                })
              )
            })
        )
      }
    }
  }
  return $(go.Node, 'Vertical',
    { locationObjectName: 'ICON', selectionObjectName: 'ICON' },
    new go.Binding('location', '', toLocation).makeTwoWay(fromLocation),
    { // this tooltip Adornment is shared by all nodes
      toolTip: $('ToolTip',
        $(go.TextBlock, { margin: 4 }, // the tooltip shows the result of calling nodeInfo(data)
          new go.Binding('text', '', nodeInfo))
      )
    },
    $(go.Panel, 'Spot',
      { name: 'ICON' },
      $(go.Panel, 'Auto',
        new go.Binding('angle', 'direction', function(dir) { return (dir % 4) * 90 }),
        $(go.Shape,
          { fill: null, stroke: null }
          // new go.Binding('background', 'running', function(running) { return running ? null : '#FFFF00' })
        ),
        $(go.Picture,
          {
            margin: 1,
            width: alg.width,
            height: alg.height,
            source: resApi.getUrl(`icon/${alg.image}`),
            cursor: 'pointer'
          }
        ),
        ... ports
      ) // , // end Auto Panel
    ), // end Spot Panel
    $(go.TextBlock,
      { name: 'BLOCKNAME' },
      { cursor: 'pointer' },
      { editable: true, isMultiline: false, visible: true },
      new go.Binding('text', 'name').makeTwoWay(),
      new go.Binding('visible', 'hideName', function(hideName) {
        return !hideName
      }),
      new go.Binding('stroke', 'status', function(status) {
        switch (status) {
          case 0:
            return 'black'
          case 1:
            return 'red'
          case 2:
            return '#FF00FF'
          case 3:
            return 'yellow'
        }
        return 'black'
      })
    ),

    // 显示模块描述, 暂时屏蔽
    $(go.TextBlock,
      { name: 'BLOCKDESC' },
      { cursor: 'pointer', stroke: 'green' },
      { isMultiline: false },
      new go.Binding('text', 'desc', function(desc) {
        return desc || ''
      }),
      new go.Binding('visible', '', function(data) {
        return data && (data.desc && data.desc.length && data.desc.length > 0) && (!data.hideName && false)
      })
    )
  )
}
