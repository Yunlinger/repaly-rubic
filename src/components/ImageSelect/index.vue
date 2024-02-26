<template>
  <rubik-dialog
    ref="dialog"
    title="图片库"
    width="1080px"
    height="620px"
    :center="true"
  >
    <div class="search-container">
      <el-input
        v-model="searchKey"
        placeholder="搜索"
        autofocus
        class="search-input"
        style="width: 480px;"
        size="mini"
        @keyup.native="doSearch"
      >
        <el-button slot="append" size="mini" icon="el-icon-search" @click="doSearch" />
      </el-input>
      <el-slider v-model="size" size="mini" :min="60" :max="240" :step="10" style="width: 128px"></el-slider>
      <el-upload
        slot="append"
        :show-file-list="false"
        :before-upload="beforeUpload"
        accept="image/*"
        action=""
      >
        <el-button type="primary" size="large" icon="el-icon-upload">上传</el-button>
      </el-upload>
      <el-button type="success" size="large" icon="el-icon-check" @click="useImage">选用</el-button>
      <el-button type="warning" size="large" icon="el-icon-close" @click="useEmpty">置空</el-button>
    </div>
    <div ref="iconsContainer" class="icons-container">
      <div class="icons-wrapper">
        <div
          v-for="item of (searchKey ? searchItems : items)"
          :key="'image__' + item.name"
          class="tool-to-pin"
          :style="getItemSizeStyle(item)"
        >
          <div
            :id="item.anchorID"
            :class="(item === selectedItem) ? 'icon-item selected' : 'icon-item'"
            :title="item.name"
            :style="getItemSizeStyle(item)"
            @click.prevent="click(item, $event)"
            @contextmenu="selectItem(item)"
            @dblclick="useImage"
          >
            <template>
              <div :style="getPngIconStyle(item)" />
            </template>
            <span class="caption">{{ item.name }}</span>
          </div>
          <div class="tools" :style="getToolsStyle(item)">
            <i class="el-icon-download tool" title="下载" @click="downloadFile(item.name)" />
            <i class="el-icon-edit tool" title="重命名" @click="renameFile(item.name)" />
            <i class="el-icon-delete tool" title="删除" @click="deleteFile(item.name)" />
          </div>
        </div>
      </div>
    </div>
  </rubik-dialog>
</template>

<script>
import RubikDialog from '@/components/Dialog/Wrapper'
import * as api from '@/api/res'

export default {
  name: 'ImageSelect',
  components: { RubikDialog },
  data() {
    return {
      root: 'image',
      items: [],
      menuVisable: false,
      top: 0,
      left: 0,
      selectedItem: null,
      searchKey: '',
      callback: null,
      searchItems: [],
      oimg: '',
      image: '',
      size: 100
    }
  },
  watch: {
    items: {
      deep: true,
      handler: function(newValue) {
        this.selectItem(null)
      }
    }
  },
  mounted() {
    this.readItems()
  },
  methods: {
    readItems() {
      api.ls(this.root, '.png').then(pngs => {
        pngs = pngs || []
        return new Promise((resolve) => {
          api.ls(this.root, '.gif').then(gifs => {
            pngs = pngs.concat(...gifs)
            resolve(pngs)
          }).catch(() => {
            resolve(pngs)
          })
        })
      }).then(images => {
        images = images || []
        images.sort((i1, i2) => {
          return i1.name.localeCompare(i2.name)
        })

        for (let i = 0; i < images.length; i++) {
          images[i].anchorID = `image_${i + 1}`
        }

        this.items = images

        // 重新搜索
        if (this.searchKey) {
          this.doSearch()
        }

        // 显示 oimg
        if (this.oimg) {
          this.$nextTick(() => {
            this.showImage(this.oimg)
            this.oimg = ''
          })
        }
      }).catch(() => {})
    },
    showImage(name) {
      for (let item of this.items) {
        if (item.name === name) {
          this.selectItem(item)
          this.goAnchor(item.anchorID)
          break
        }
      }
    },
    doSearch() {
      this.searchItems = []
      if (!this.searchKey) {
        return
      }
      let reg = null
      try {
        reg = new RegExp(this.searchKey, 'i')
      } catch (err) {
        this.$msg.error('正则表达式错误: ' + err)
        return
      }

      for (let item of this.items) {
        if (reg.test(item.name)) {
          this.searchItems.push(item)
        }
      }
    },
    click(item, event) {
      this.selectItem(item)
      event.preventDefault()
    },
    selectItem(item) {
      this.selectedItem = item
    },
    useImage() {
      if (this.selectedItem) {
        if (this.callback && typeof this.callback === 'function') {
          this.callback(this.selectedItem.name)
        }
      }
      this.$refs.dialog.close()
    },
    useEmpty() {
      if (this.callback && typeof this.callback === 'function') {
        this.callback('')
      }
      this.$refs.dialog.close()
    },
    getItemSizeStyle(item) {
      return {
        'height': `${this.size + 48}px`,
        'width': `${this.size + 20}px`
      }
    },
    getPngIconStyle(item) {
      var width = this.size <= 100 ? 100 : 200
      const iconUrl = api.getImageUrl(`${this.root}/${item.name}`, width)
      return {
        display: 'inline-block',
        width: `${this.size}px`,
        height: `${this.size}px`,
        'border-radius': '6px',
        'border-style': 'solid',
        'border-width': '1px',
        'border-color': '#E0E0E0',
        background: 'url("' + iconUrl + '") no-repeat center  center',
        'background-size': 'contain'
      }
    },
    getToolsStyle(item) {
      return {
        'width': `${this.size + 8}px`,
        'height': `32px`,
        'margin-top': `-${this.size / 2 + 20}px`, /* 目标元素高度的一半 */
        'margin-left': `-${this.size / 2}px` /* 目标元素宽度的一半 */
      }
    },
    beforeUpload(file) {
      const fd = new FormData()
      fd.append('file', file)
      const path = `${this.root}/${file.name}`
      api.exists(path).then(res => {
        if (res.exists) {
          return this.$confirm(`文件 "${path}" 已经存在, 是否覆盖?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
        return Promise.resolve()
      }).then(() => {
        return api.write(path, fd)
      }).then(() => {
        this.oimg = file.name
        this.readItems()
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    goAnchor(selector) {
      var anchor = this.$el.querySelector(`#${selector}`)
      if (anchor) {
        this.$refs['iconsContainer'].scrollTo(0, anchor.offsetTop - 200)
      }
    },
    downloadFile(name) {
      const path = `${this.root}/${name}`
      api.download(path, name)
    },
    deleteFile(name) {
      const path = `${this.root}/${name}`
      this.$confirm(`删除文件 "${path}" ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return api.rm(path)
      }).then(() => {
        this.$msg('成功删除文件' + path)
        this.readItems()
      }).catch((err) => {
        if (err !== 'cancel') {
          this.$msg.error(err, '删除失败')
        }
      })
    },
    renameFile(name) {
      const src = `${this.root}/${name}`
      var newName = ''
      this.$prompt('请输入新名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: name
      }).then(({ value }) => {
        if (value === name) {
          return Promise.reject('没有修改')
        }
        if (!value) {
          return Promise.reject('新文件名不能为空')
        }
        if (value.includes('/') || value.includes('\\') || value.includes(':')) {
          return Promise.reject('新文件名不可用')
        }
        newName = value
        return api.exists(`${this.root}/${value}`)
      }).then((res) => {
        if (res.exists) {
          return Promise.reject(`文件 ${newName} 已经存在`)
        }
        const dst = `${this.root}/${newName}`
        return api.mv(src, dst)
      }).then(() => {
        this.$msg(`成功重命名文件: ${name} -> ${newName}`)
        this.oimg = newName
        this.readItems()
      }).catch((err) => {
        if (err !== 'cancel') {
          this.$msg.error(err, '重命名失败')
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.icons-container {
  margin: 0px;
  overflow: auto;
  min-height: 320px;
  height: calc(100% - 64px);
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
  border-color: #E0E0E0;
  .icons-wrapper {
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .icon-item {
    margin: 4px;
    text-align: center;
    float: left;
    font-size: 25px;
    color: #24292e;
    border-radius: 4px;
    .caption {
      display: block;
      margin-top: 2px;
      font-size: 11px;
      line-height: 16px;
      font-weight: bold;
      width: 96%;
      word-wrap: break-word;
      white-space: normal;
      user-select: none;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }

  .tool-to-pin .tools {
    visibility: hidden;
    background-color: rgba(192, 192, 192, 0.8);
    border-radius: 6px;
    /* 定位 */
    position: relative;
    top: 50%;
    left: 50%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .tool {
      font-size: 18px;
      color: black;
    }
    .tool:hover {
      font-size: 20px;
      cursor: pointer;
      color: red;
    }
  }
  .tool-to-pin:hover .tools {
    visibility: visible;
  }

  .selected {
    border-style: solid;
    border-width: 4px;
    border-radius: 6px;
    border-color: hotpink;
  }
  // .icon-item:hover{
  //   background-color: #ececec;
  // }
  .disabled{
    pointer-events: none;
  }
}

.search-container {
  padding: 8px;
  overflow: none;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

</style>
