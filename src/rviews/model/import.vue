<template>
  <div class="app-container">
    <el-form ref="form" label-width="120px" style="max-width: 600px;">
      <el-form-item label="导入组合定义">
        <el-upload
          :show-file-list="false"
          :before-upload="importBulk"
          accept=".txt"
          action=""
        >
          <el-button type="primary" size="small">导入组合变量定义</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="批量上传图片">
        <el-upload
          ref="uploadPng"
          action=""
          :show-file-list="false"
          :auto-upload="false"
          :multiple="true"
          :limit="4096"
          :on-change="onPngUploadChange"
          accept=".png"
        >
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUploadPng">开始上传</el-button>
          <div slot="tip" class="el-upload__tip">
            只能上传png文件，且单个文件不超过4MB
            <el-progress :text-inside="true" :stroke-width="12" :percentage="uploadPngPercent"></el-progress>
            {{ uploadPngStatus }}
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="导入算法">
        <el-upload
          ref="uploadPng"
          action=""
          :show-file-list="false"
          :auto-upload="false"
          :multiple="true"
          :limit="4096"
          :on-change="onAlgUploadChange"
          accept=".txt"
        >
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUploadAlg">开始导入</el-button>
          <div slot="tip" class="el-upload__tip">
            选择定义tab的txt文件
            <el-progress :text-inside="true" :stroke-width="12" :percentage="uploadAlgPercent"></el-progress>
            {{ uploadAlgStatus }}
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="导入模型">
        <el-upload
          :show-file-list="false"
          :before-upload="importModel"
          accept=".txt"
          action=""
        >
          <el-button type="primary" size="small">导入模型</el-button>
          <div slot="tip" class="el-upload__tip">
            <el-progress :text-inside="true" :stroke-width="12" :percentage="uploadModelPercent"></el-progress>
            {{ uploadModelStatus }}
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as aapi from '@/api/alg'
import * as mapi from '@/api/model'
import * as rapi from '@/api/rtd'
import { getUrl } from '@/api/res'

export default {
  name: 'Import',
  data() {
    return {
      category: {
        0: '水机',
        1: '发电机',
        2: '电气',
        3: '控制',
        4: '备用1',
        5: '备用2',
        6: '备用3'
      },

      pngFileList: [],
      uploadPngPercent: 0,
      uploadPngStatus: '',

      algFileList: [],
      uploadAlgPercent: 0,
      uploadAlgStatus: '',

      uploadModelPercent: 0,
      uploadModelStatus: ''
    }
  },
  methods: {
    importBulk(file) {
      let reader = new FileReader()
      reader.onload = (e) => {
        let str = e.target.result
        let lines = str.split(/\r\n|\r|\n/)
        let bulkid = 0
        let bulkname = ''
        let bulkItems = []
        let promiseArray = []

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i]
          if (line.startsWith('#BULK,')) {
            bulkid = parseInt(line.split('=')[0].split(',')[1])
            bulkname = line.split('=')[1]
          } else if (line.startsWith('#ENDBULK')) {
            if (bulkname !== '') {
              let bulk = {
                id: bulkid,
                name: bulkname,
                desc: bulkname,
                items: bulkItems
              }
              if (this.$store.getters.bulks[bulkid]) {
                promiseArray.push(aapi.updateBulk(bulk))
              } else {
                promiseArray.push(aapi.createBulk(bulk))
              }
            }
            bulkname = ''
            bulkItems = []
          } else if (line.startsWith('#SUB,')) {
            let sname = line.split('=')[1].split(',')[0]
            bulkItems.push({ name: sname })
          }
        }

        Promise.all(promiseArray).then(() => {
          this.$store.dispatch('AlgGetAll')
          this.$msg.success('导入组合变量完成')
        }).catch(error => {
          console.error(error)
        })
      }
      reader.readAsText(file)
      // 返回 false 不执行上传动作
      return false
    },
    importAlg(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = async(e) => {
          let promiseArray = []
          let str = e.target.result
          let lines = str.split(/\r\n|\r|\n/)
          let alg = {}
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i]
            if (line.startsWith('#ALG,')) {
              alg.func = line.split('=')[1].split(',')[0]
              alg.desc = line.split('=')[1].split(',')[1]
              alg.name = line.split('=')[1].split(',')[2]
              alg.image = alg.name + '.png'
              let sname = this.category[parseInt(line.split('=')[1].split(',')[3])] || '备用1'
              alg.sort = await this.getAlgSortID(sname)
            } else if (line.startsWith('#ENDALG')) {
              if (alg.name !== '') {
                alg.useBulk = true
                alg.width = 50
                alg.height = 100
                let _alg = alg
                let _this = this
                var image = new Image()
                image.onload = function() {
                  _alg.width = this.width || 50
                  _alg.height = this.height || 70
                  promiseArray.push(aapi.save(_alg.name, _alg))
                }
                image.onerror = function() {
                  _this.uploadAlgStatus = '加载图片' + _alg.image + '失败, 使用默认图元尺寸 50*70'
                  _alg.width = 50
                  _alg.height = 70
                  promiseArray.push(aapi.save(_alg.name, _alg))
                }
                image.src = _this.imageUrl(_alg.image)
              }
              alg = {}
            } else if (line.startsWith('IN,')) {
              let desc = line.split('=')[1].split(',')[0]
              let name = line.split('=')[1].split(',')[1]
              let unit = line.split('=')[1].split(',')[2]
              alg.in = alg.in || []
              alg.in.push({
                name,
                desc,
                unit,
                type: 0
              })
            } else if (line.startsWith('BulkIN,')) {
              let desc = line.split('=')[1].split(',')[0]
              let name = line.split('=')[1].split(',')[1]
              let unit = line.split('=')[1].split(',')[2]
              let dtype = line.split('=')[1].split(',')[3]
              alg.in = alg.in || []
              dtype = this.getBulkTypeID(dtype)
              alg.in.push({
                name,
                desc,
                unit,
                type: dtype
              })
            } else if (line.startsWith('OT,')) {
              let desc = line.split('=')[1].split(',')[0]
              let name = line.split('=')[1].split(',')[1]
              let unit = line.split('=')[1].split(',')[2]
              alg.out = alg.out || []
              alg.out.push({
                name,
                desc,
                unit,
                type: 0
              })
            } else if (line.startsWith('BulkOut,')) {
              let desc = line.split('=')[1].split(',')[0]
              let name = line.split('=')[1].split(',')[1]
              let unit = line.split('=')[1].split(',')[2]
              let dtype = line.split('=')[1].split(',')[3]
              alg.out = alg.out || []
              dtype = this.getBulkTypeID(dtype)
              alg.out.push({
                name,
                desc,
                unit,
                type: dtype
              })
            } else if (line.startsWith('CV,')) {
              let desc = line.split('=')[1].split(',')[0]
              let value = line.split('=')[1].split(',')[1]
              value = parseFloat(value)
              alg.coef = alg.coef || []
              alg.coef.push({
                desc,
                value
              })
            } else if (line.startsWith('PinIN,')) {
              let idx = parseInt(line.split('=')[1].split(',')[0]) - 1
              let x = parseInt(line.split('=')[1].split(',')[1])
              let y = parseInt(line.split('=')[1].split(',')[2])
              if (alg.in && alg.in[idx]) {
                alg.in[idx].connable = true
                alg.in[idx].x = x
                alg.in[idx].y = y
                alg.in[idx].dir = 3
              }
            } else if (line.startsWith('PinOT,')) {
              let idx = parseInt(line.split('=')[1].split(',')[0]) - 1
              let x = parseInt(line.split('=')[1].split(',')[1])
              let y = parseInt(line.split('=')[1].split(',')[2])
              if (alg.out && alg.out[idx]) {
                alg.out[idx].connable = true
                alg.out[idx].x = x
                alg.out[idx].y = y
                alg.out[idx].dir = 1
              }
            }
          }

          Promise.all(promiseArray).then(() => {
            resolve()
          }).catch(error => {
            console.error(error)
            this.$msg.error('导入算法文件失败:' + file.name)
            reject(error)
          })
        }
        reader.readAsText(file)
      })
    },
    importModel(file) {
      let reader = new FileReader()
      reader.onload = async(event) => {
        // 先建立模型分类
        await this.buildModelSort()

        let str = event.target.result
        let lines = str.split(/\r\n|\r|\n/)
        let page = {}
        let block = {}
        let blockIds = {}
        let currentVar = ''
        let lineinfo = {}
        let valueinfo = {}
        // 设置 progress
        this.uploadModelPercent = 0
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i]
          this.uploadModelPercent = parseInt((i + 1) / lines.length * 100)
          this.uploadModelStatus = line
          if (line.startsWith('PAGE=')) {
            page.name = line.split('=')[1].split(',')[1]
            // 先删除图页
            try {
              await mapi.pageDel(page.name)
            } catch (e) {
              console.log(e)
            }
            // 新建图页
            try {
              let sname = this.category[parseInt(line.split('=')[1].split(',')[0])] || '备用1'
              let sortID = await this.getPageSortID(sname)
              await mapi.pageNew(page.name, '', sortID)
              this.$store.dispatch('getPageList', 0)
              // let color = this.int2color(parseInt(line.split('=')[1].split(',')[2]))
              await mapi.pageSetColor(page.name, '#2B857E')
            } catch (e) {
              page = {}
              console.log(e)
            }
          } else if (line.startsWith('BLOCK=')) {
            block.name = line.split('=')[1].split(',')[0]
            block.alg = line.split('=')[1].split(',')[1]
            block.x = parseInt(line.split('=')[1].split(',')[6])
            block.y = parseInt(line.split('=')[1].split(',')[7])
            block.direction = parseInt(line.split('=')[1].split(',')[8])
            // 新建模块
            if (page.name) {
              try {
                // 修正模块位置
                if (block.direction === 1 || block.direction === 3) {
                  let alg = this.$store.getters.algs[block.alg]
                  if (alg) {
                    let x = block.x - (alg.height / 2 - alg.width / 2)
                    let y = block.y + (alg.height / 2 - alg.width / 2)
                    block.x = x
                    block.y = y
                  }
                }
                let res = await mapi.blockNew(block.name, '', block.alg, page.name, block.x, block.y)
                block.id = res.id
                blockIds[block.name] = block.id
                // 设置旋转
                if (block.direction !== 0) {
                  block.direction = [0, 3, 2, 1][block.direction % 4]
                  await mapi.setDirection(block.id, block.direction)
                }
              } catch (e) {
                block = {}
                console.log(e)
              }
            }
          } else if (line.startsWith('IN,')) {
            let idx = parseInt(line.split('=')[0].split(',')[1]) - 1
            currentVar = line.split('=')[1].split(',')[0]
            if (block.name) {
              try {
                await mapi.setInVar(block.id, idx, currentVar)
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('INV,') || line.startsWith('OV,')) {
            let value = parseFloat(line.split('=')[1])
            if (block.name) {
              try {
                await rapi.setValue(currentVar, value, 'import')
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('BULKINV,') || line.startsWith('BULKOUV,')) {
            let idx = parseInt(line.split('=')[0].split(',')[2])
            let value = parseFloat(line.split('=')[1])
            let varName = ''
            if (idx <= 9) {
              varName = `${currentVar}@0${idx}`
            } else {
              varName = `${currentVar}@${idx}`
            }
            if (block.name) {
              try {
                await rapi.setValue(varName, value, 'import')
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('OT,')) {
            let idx = parseInt(line.split('=')[0].split(',')[1]) - 1
            currentVar = line.split('=')[1].split(',')[0]
            if (block.name) {
              try {
                await mapi.setOutVar(block.id, idx, currentVar)
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('CV,')) {
            let idx = parseInt(line.split('=')[0].split(',')[1])
            let value = parseFloat(line.split('=')[1])
            let varName = `${block.name}/C#${idx}`
            if (block.name) {
              try {
                await rapi.setValue(varName, value, 'import')
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('LINEPTS=')) {
            lineinfo.points = []
            let count = parseInt(line.split('=')[1].split(',')[0])
            for (let idx = 0; idx < count; idx++) {
              lineinfo.points.push({
                x: parseInt(line.split('=')[1].split(',')[idx * 2 + 1]),
                y: parseInt(line.split('=')[1].split(',')[idx * 2 + 2])
              })
            }
            lineinfo.points.pop()
          } else if (line.startsWith('LINEINFO=')) {
            // 0,0,5,0,1,EEE01,EEE03
            lineinfo.sb = blockIds[line.split('=')[1].split(',')[5]]
            lineinfo.tb = blockIds[line.split('=')[1].split(',')[6]]
          } else if (line.startsWith('LINE_IO_NUM=')) {
            // 0,0,5,0,1,EEE01,EEE03
            lineinfo.sp = parseInt(line.split('=')[1].split(',')[0])
            lineinfo.tp = parseInt(line.split('=')[1].split(',')[1])
            if (page.name) {
              try {
                await mapi.connectionNew(page.name,
                  lineinfo.sb, lineinfo.sp,
                  lineinfo.tb, lineinfo.tp,
                  lineinfo.points)
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('TEXT=')) {
            // TEXT=526,121,12,8388863,宋体,模型导入测试OK
            let color = this.int2color(parseInt(line.split('=')[1].split(',')[3]))
            let label = {
              text: line.split('=')[1].split(',')[5],
              x: parseInt(line.split('=')[1].split(',')[0]),
              y: parseInt(line.split('=')[1].split(',')[1]),
              fontSize: parseInt(line.split('=')[1].split(',')[2]),
              fontColor: color,
              fontName: line.split('=')[1].split(',')[4]
            }
            if (page.name) {
              try {
                await mapi.labelNew(page.name, label)
              } catch (e) {
                console.log(e)
              }
            }
          } else if (line.startsWith('VALUE=')) {
            valueinfo.x = parseInt(line.split('=')[1].split(',')[0])
            valueinfo.y = parseInt(line.split('=')[1].split(',')[1])
          } else if (line.startsWith('VALUEINFO=')) {
            valueinfo.name = line.split('=')[1].split(',')[0]
            if (page.name && valueinfo.name) {
              await mapi.vbNew(page.name, valueinfo.name, valueinfo.x, valueinfo.y)
            }
          }
        }
        this.uploadModelStatus = '导入模型文件完成'
        this.$msg.success('导入模型文件完成:' + file.name)
      }
      reader.readAsText(file)
      // 返回 false 不执行上传动作
      return false
    },
    getBulkTypeID(bname) {
      let bulks = this.$store.getters.bulks
      for (let id in bulks) {
        if (bulks[id] && bulks[id].name === bname) {
          return parseInt(id)
        }
      }
      return 0
    },
    async buildAlgSort() {
      let tree = this.$store.getters.algTree
      for (let cid in this.category) {
        let sname = this.category[cid]
        let exist = false
        for (let id in tree) {
          if (tree[id] && tree[id].name === sname) {
            exist = true
            break
          }
        }
        if (!exist) {
          await aapi.createSort(sname, 0)
          await this.$store.dispatch('AlgGetAll')
        }
      }
    },
    async buildModelSort() {
      let res = await mapi.pageList(0)
      for (let cid in this.category) {
        let sname = this.category[cid]
        let exist = false
        for (let id in res.nodes || []) {
          if (res.nodes[id] && res.nodes[id].name === sname) {
            exist = true
            break
          }
        }
        if (!exist) {
          await mapi.pageTreeAddItem(0, this.currentPath, sname)
          await this.$store.dispatch('getPageList', 0)
        }
      }
    },
    async getAlgSortID(sname) {
      let tree = this.$store.getters.algTree
      for (let id in tree) {
        if (tree[id] && tree[id].name === sname) {
          return parseInt(id)
        }
      }

      return 0
    },
    async getPageSortID(sname) {
      let res = await mapi.pageList(0)
      for (let id in res.nodes || []) {
        if (res.nodes[id] && res.nodes[id].name === sname) {
          return parseInt(id)
        }
      }

      return 0
    },
    imageUrl(imageName) {
      return getUrl(`icon/${imageName}`)
    },
    async uploadImage(file) {
      const isPNG = file.type === 'image/png'
      const isLt4M = file.size / 1024 / 1024 < 4

      if (!isPNG || !isLt4M) {
        return false
      }

      const fd = new FormData()
      fd.append('file', file)
      try {
        await aapi.uploadIcon(file.name, fd)
      } catch (e) {
        this.$msg.error('图片上传错误, ' + file.name)
      }
    },
    async submitUploadPng() {
      for (let i = 0; i < this.pngFileList.length; i++) {
        let file = this.pngFileList[i].raw
        this.uploadPngStatus = '正在上传 "' + file.name + '" ...'
        await this.uploadImage(file)
        this.uploadPngPercent = parseInt((i + 1) / this.pngFileList.length * 100)
      }
      this.$refs.uploadPng.clearFiles()
      this.uploadPngStatus = '上传完成'
    },
    onPngUploadChange(file, fileList) {
      this.pngFileList = fileList
      this.uploadPngPercent = 0
      this.uploadPngStatus = '选取文件 ' + fileList.length + ' 个'
    },
    async submitUploadAlg() {
      await this.buildAlgSort()
      for (let i = 0; i < this.algFileList.length; i++) {
        let file = this.algFileList[i].raw
        this.uploadAlgStatus = '正在导入算法文件 ' + file.name + '...'
        await this.importAlg(file)
        this.uploadAlgPercent = parseInt((i + 1) / this.algFileList.length * 100)
      }
      this.uploadAlgStatus = '导入算法文件完成'
      this.$refs.uploadAlg.clearFiles()
      this.$store.dispatch('AlgGetAll')
    },
    onAlgUploadChange(file, fileList) {
      this.algFileList = fileList
      this.uploadAlgPercent = 0
      this.uploadAlgStatus = '选取文件 ' + fileList.length + ' 个'
    },
    file2Lines(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = (e) => {
          let str = e.target.result
          let lines = str.split(/\r\n|\r|\n/)
          resolve(lines)
        }
        reader.onerror = (e) => {
          reject(e)
        }
        reader.readAsText(file)
      })
    },
    int2color(icolor) {
      if (typeof icolor !== 'number') {
        return ''
      }
      return (`rgba(${icolor & 0xFF}, ${(icolor & 0xFF00) >> 8}, ${(icolor & 0xFF0000) >> 16}, 1)`)
    }
  }
}
</script>
