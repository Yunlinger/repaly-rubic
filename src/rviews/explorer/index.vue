<template>
  <div class="app-container" style="padding: 8px;position: relative;">
    <!--工具栏-->
    <el-container height="100%">
      <el-aside width="200px" default-active="1">
        <el-menu @select="menuSelected">
          <el-menu-item index="1">
            <i class="el-icon-share"></i>
            <span slot="title">{{ $t('共享文档') }}</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-folder"></i>
            <span slot="title">{{ $t('我的文档') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <div>
          <div>
            <el-button size="mini" type="primary" icon="el-icon-s-home" @click="goRoot" />
            <el-button size="mini" type="primary" icon="el-icon-top" @click="goUp" />
            <el-button size="mini" type="warning" icon="el-icon-back" :disabled="!canGoBack" @click="goBack" />
            <el-button size="mini" type="warning" icon="el-icon-right" :disabled="!canGoAhead" @click="goAhead" />
            <div style="float: right">
              <el-button size="mini" type="primary" icon="el-icon-folder-add" @click="addFolder">{{ $t('新建文件夹') }}</el-button>
              <el-button size="mini" type="primary" icon="el-icon-upload" @click="uploading = true">{{ $t('上传') }}</el-button>
              <el-button size="mini" type="primary" icon="el-icon-refresh" @click="ls(false)">{{ $t('刷新') }}</el-button>
            </div>
          </div>
        </div>
        <!--表单组件-->
        <el-dialog
          append-to-body
          :close-on-click-modal="false"
          :visible.sync="uploading"
          :title="$t('文件上传')"
          width="800px"
        >
          <el-form ref="form" size="small" label-width="80px">
            <!--   上传文件   -->
            <el-form-item :label="$t('上传')">
              <el-upload
                ref="upload"
                accept=""
                multiple
                drag
                :limit="uploadFileMax"
                action=""
                :on-change="handleChange"
                :on-remove="handleRemove"
                :on-exceed="handleExceed"
                :file-list="fileList"
                :http-request="uploadFile"
                :auto-upload="false"
              >
                <div class="el-upload__text">{{ $t('将文件拖到此处，或点击上传') }}</div>
                <div slot="tip" class="el-upload__tip">{{ $t('可上传任意格式文件，且不超过 512 M') }}</div>
              </el-upload>
            </el-form-item>
          </el-form>
          <el-progress :percentage="percentage"></el-progress>
          <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="uploading = false">{{ $t('取消') }}</el-button>
            <el-button type="success" @click="upload">{{ $t('上传到服务器') }}</el-button>
          </div>
        </el-dialog>
        <!--表格渲染-->
        <el-table ref="table" v-loading="loading" :data="items" style="width: 100%;">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="path" label="" width="40">
            <template slot-scope="{row}">
              <el-image
                :src="getIconSrc(row)"
                fit="contain"
                lazy
                style="width: 30px; height: 30px; cursor: pointer;"
              >
                <!-- @click="clickItem(row)" -->
                <div slot="error">
                  <i class="el-icon-document" />
                </div>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="name" :label="$t('文件名')">
            <template slot-scope="{row}">
              <p style="cursor: pointer;" @click="clickItem(row)">{{ row.name }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="suffix" :label="$t('文件类型')" width="80">
            <template slot-scope="{row}">
              {{ getFileType(row) }}
            </template>
          </el-table-column>
          <el-table-column prop="size" :label="$t('大小')" width="80">
            <template slot-scope="{row}">
              {{ getFileSize(row) }}
            </template>
          </el-table-column>
          <el-table-column prop="lastmodified" :label="$t('修改时间')" width="200" />
          <el-table-column prop="operate" :label="$t('操作')" width="100">
            <template slot-scope="{row}">
              <el-button type="danger" icon="el-icon-delete" circle @click="del(row)"></el-button>
              <!-- <el-button v-if="!row.dir" type="primary" icon="el-icon-download" circle @click="download(row)"></el-button> -->
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <msk v-if="fileShow" :url="fileUrl" :type="fileType" @close="close" />
  </div>
</template>

<script>

import * as api from '@/api/minio'
// import { videoPlayer } from 'vue-video-player'
// import 'video.js/dist/video-js.css'
import msk from './msk.vue'
export default {
  name: 'Explorer',
  components: {
    msk
  },
  data() {
    return {
      loading: false,
      uploading: false,
      fileShow: false,
      fileUrl: '',
      fileType: '',
      items: [],
      bucket: 'documents',
      path: '',
      pathArray: [],
      pathCurrentIndex: -1,
      uploadFileMax: 128,
      fileData: null, // 文件上传数据（多文件合一）
      percentage: 0,
      fileList: [], // upload多文件数组
      playerOptions: {
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false, // 如果为true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 是否视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: 'video/mp4', // 类型
          src: '' // url地址
        }],
        poster: '', // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true // 是否显示全屏按钮
        }
      }
    }
  },
  computed: {
    canGoBack() {
      return this.pathCurrentIndex > 0
    },
    canGoAhead() {
      return this.pathCurrentIndex < this.pathArray.length - 1
    }
  },
  mounted() {
    this.checkUserBucket()
    this.goRoot()
  },
  methods: {
    menuSelected(index) {
      if (index === '1') {
        this.bucket = 'documents'
      } else {
        this.bucket = this.$store.getters.name
      }
      this.path = ''
      this.pathArray = []
      this.pathCurrentIndex = -1
      this.goRoot()
    },
    checkUserBucket() {
      api.bucketexists(this.$store.getters.name).then(({ exist }) => {
        if (exist) {
          return Promise.resolve()
        } else {
          return api.newbucket(this.$store.getters.name)
        }
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    pushPath(path) {
      this.pathArray = this.pathArray.slice(0, this.pathCurrentIndex + 1)
      if (this.pathArray[this.pathArray.length - 1] === path) {
        return
      }
      this.pathArray.push(path)
      this.pathCurrentIndex = this.pathArray.length - 1
    },
    goUp() {
      let dirs = this.path.split('/')
      dirs = dirs.slice(0, dirs.length - 1)
      this.path = dirs.join('/')
      this.ls(true)
    },
    goBack() {
      this.pathCurrentIndex = this.pathCurrentIndex - 1
      if (this.pathCurrentIndex < 0) {
        this.pathCurrentIndex = 0
      }
      this.path = this.pathArray[this.pathCurrentIndex]
      this.ls(false)
    },
    goAhead() {
      this.pathCurrentIndex = this.pathCurrentIndex + 1
      if (this.pathCurrentIndex >= this.pathArray.length) {
        this.pathCurrentIndex = this.pathArray.length - 1
      }
      this.path = this.pathArray[this.pathCurrentIndex]
      this.ls(false)
    },
    ls(needPush) {
      api.ls(this.bucket, this.path).then((res) => {
        res = res || []
        this.items = res
        if (needPush) {
          this.pushPath(this.path)
        }
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    del(row) {
      let fullPath = this.getFullPath(row.name)
      if (row.dir) {
        fullPath = fullPath + '/'
      }
      this.$confirm(fullPath, this.$t('请确认是否删除?'), {
        confirmButtonText: this.$t('删除'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        return api.rm(this.bucket, fullPath)
      }).then(() => {
        this.$msg(fullPath, this.$t('删除成功'))
        this.ls(false)
      }).catch(err => {
        this.$msg.error(err)
      })
    },
    download(row) {
      let url = api.getUrlWithName(this.bucket, this.getFullPath(row.name), row.name)
      window.open(url)
    },
    multiDel() {

    },
    goRoot() {
      this.path = ''
      this.ls(true)
    },
    // 上传文件
    uploadFile(file) {
      this.fileData.append('files', file.file) // append增加数据
    },
    // 上传文件
    upload() {
      // this.$$refs.upload.submit()
      if (this.fileList.length === 0) {
        this.$msg.warning(this.$t('请先选择文件'))
      } else {
        const isLt512M = this.fileList.every(file => file.size / 1024 / 1024 < 512)
        if (!isLt512M) {
          this.$message.error(this.$t('请检查，上传文件大小不能超过 512 MB!'))
        } else {
          this.fileData = new FormData() // new formData对象
          this.$refs.upload.submit() // 提交调用uploadFile函数, 构建 files 参数
          this.fileData.append('bucket', this.bucket)
          this.fileData.append('path', this.path)
          this.percentage = 0
          api.write(this.fileData, progressEvent => {
            this.percentage = (progressEvent.loaded / progressEvent.total * 100 | 0)
          }).then((response) => {
            this.$msg(this.$t('上传成功'))
            this.fileList = []
            this.uploading = false
            this.ls(false)
          }).catch(err => {
            this.$msg.error(err)
          })
        }
      }
    },
    // 移除
    handleRemove(file, fileList) {
      this.fileList = fileList
    },

    // 选取文件超过数量提示
    handleExceed(files, fileList) {
      this.$message.warning(this.$t('选取文件数超过数量限制'))
    },

    // 监控上传文件列表
    handleChange(file, fileList) {
      let existFile = fileList.slice(0, fileList.length - 1).find(f => f.name === file.name)
      if (existFile) {
        this.$message.error(this.$t('当前文件已经存在!'))
        fileList.pop()
      }
      this.fileList = fileList
    },

    // 获取文件扩展名
    getFileExtension(filename) {
      var ext = /^.+\.([^.]+)$/.exec(filename)
      return ext == null ? '' : ext[1]
    },

    // 获取文件类型
    getFileType(row) {
      if (row.dir) {
        return this.$t('文件夹')
      } else {
        return this.getFileExtension(row.name)
      }
    },

    // 获取文件大小，取合适的单位
    getFileSize(row) {
      if (row.dir) {
        return ''
      } else {
        if (row.size > 1024 * 1024 * 1024) {
          return (row.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
        } else if (row.size > 1024 * 1024) {
          return (row.size / (1024 * 1024)).toFixed(2) + ' MB'
        } else if (row.size > 1024) {
          return (row.size / 1024).toFixed(2) + ' KB'
        } else {
          return row.size + 'B'
        }
      }
    },

    // 获取文件类型图标
    getIconSrc(row) {
      if (row.dir) {
        return require('@/assets/fileicon/directory.png')
      } else {
        let fileExtension = this.getFileExtension(row.name)
        let src
        try {
          src = require(`@/assets/fileicon/${fileExtension}.png`)
        } catch (error) {
          src = require(`@/assets/fileicon/file.png`)
        }
        return src
      }
    },

    getFullPath(name) {
      if (!this.path) {
        return name
      }

      return `${this.path}/${name}`
    },

    // 点击文件图标
    clickItem(row) {
      if (row.dir) {
        this.path = this.getFullPath(row.name)
        this.ls(true)
      } else {
        this.viewShow(row)
      }
    },
    viewShow(row) {
      // 改成join方法 取数组最后一段
      let type = row.name.split('.').pop()
      if (type === 'pdf') {
        let pdfUrl = api.getUrlWithName(this.bucket, this.getFullPath(row.name), row.name)
        const url = '/static/pdf/web/viewer.html?file=' + encodeURIComponent(pdfUrl)
        this.fileShow = true
        this.fileType = type
        this.fileUrl = url
      } else if (type === 'mp4') {
        this.fileShow = true
        this.fileType = type
        this.fileUrl = api.getUrlWithName(this.bucket, this.getFullPath(row.name), row.name)
      } else if (type === 'docx') {
        this.fileShow = true
        this.fileType = type
        this.fileUrl = api.getUrlWithName(this.bucket, this.getFullPath(row.name), row.name)
      } else if (type === 'jpg' || type === 'png' || type === 'jpeg') {
        this.$viewerApi({
          images: [api.getUrlWithName(this.bucket, this.getFullPath(row.name), row.name)],
          options: {
            initialViewIndex: 0
          }
        })
      }
    },
    close() {
      this.fileShow = false
      this.fileType = ''
      this.fileUrl = ''
    },
    // 新建文件夹
    addFolder() {
      this.$prompt(this.$t('请输入新文件夹的名称'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        inputValue: this.$t('新建文件夹')
      }).then(({ value }) => {
        return api.mkdir(this.bucket, this.getFullPath(value))
      }).then((response) => {
        this.$msg(this.$t('创建成功'))
        this.ls(false)
      }).catch(err => {
        this.$msg.error(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";
  .app-container {
    width: 100%;
    height: calc(100vh - #{$navbarHeight} - #{$tagsviewHeight});
  }
  .el-aside {
    background: white;
  }
  ::v-deep .el-dialog__header {
    padding: 20px;
    padding-bottom: 10px;
  }
</style>
