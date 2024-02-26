<template>
  <div class="popContainer" :style="{ top: isExplorer ? '36px' : '50px' }">
    <div v-if="type === 'mp4'" id="videos"></div>
    <div v-if="type === 'pdf'" style="height: 100%;">
      <iframe :src="url" style="height:100%; width:100%" />
    </div>
    <div v-if="type === 'docx'" style="height: 100%;overflow-y: auto;">
      <div ref="docx" style="height: 100%;"></div>
    </div>
    <div class="close" :style="{color: type === 'pdf' ? '#000' : '#FFF'}" @click="close"><i class="el-icon-circle-close" /></div>
  </div>
</template>

<script>
import axios from 'axios'
import Player from 'xgplayer/dist/simple_player'
import volume from 'xgplayer/dist/controls/volume'
import playbackRate from 'xgplayer/dist/controls/playbackRate'

let docx = require('docx-preview')
export default {
  props: {
    url: {
      type: String,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: 0
    },
    type: {
      type: String,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: 0
    }
  },
  data() {
    return {
      palyer: null
    }
  },
  computed: {
    isExplorer() {
      return this.$route.path.startsWith('/explorer/index')
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if (!this.Player) return
    this.palyer.destroy(true)
    this.palyer = null
  },
  methods: {
    init() {
      if (this.type === 'mp4') {
        this.palyer = new Player({
          id: 'videos',
          url: this.url,
          autoplay: true,
          controlPlugins: [
            volume,
            playbackRate
          ],
          keyShortcut: 'on',
          keyShortcutStep: { // 设置调整步长
            currentTime: 15, // 播放进度调整步长，默认10秒
            volume: 0.2 // 音量调整步长，默认0.1
          },
          playbackRate: [0.5, 0.75, 1, 1.5, 2] // 传入倍速可选数组
        })
      }
      if (this.type === 'docx') {
        axios({
          method: 'get',
          responseType: 'blob',
          url: this.url
        }).then(({ data }) => {
          docx.renderAsync(data, this.$refs.docx)
        })
      }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.popContainer{
  position: fixed;
  left: 0;
  right: 0;
  top: 50px;
  bottom: 0;
  z-index: 100000;
  background: rgba(0, 0, 0, .8);
  .close {
    position: absolute;
    top: 0; right: 0;
    width: 35px;
    height: 35px;
    font-size: 35px;
    color: #FFF;
    cursor: pointer;
  }
  #videos{
    position: absolute;
    left: 0; top: 10%;
    width: 100% !important;
    height: 80% !important;
  }
}
</style>
