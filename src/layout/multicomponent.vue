<template>
  <div class="containers">
    <div v-if="isDisabled('isDcs')" class="dcsViews" :style="{zIndex: isShow('isDcs') ? '99' : '-99' }" style="display: flex;flex-direction: column;">
      <views ref="dcs" :setting="'dcs'" style="height: calc(100% - 30px);" />
      <div class="handle_menu">
        <div style="display: flex;">
          <div class="bthGroup">
            <div @click="goHome"><svg-icon icon-class="home" /></div>
            <div @click="goToPath(false)"><svg-icon icon-class="retreat" /></div>
            <div @click="goToPath(true)"><svg-icon icon-class="advance" /></div>
          </div>
          <div style="margin-left: 20px;cursor: pointer;" @dblclick="openJdPath(openPath)">打开画面： {{ openPath }}</div>
        </div>
        <div style="display: flex; align-items: center; margin-right: 20px;">
          <div class="logo"><img :src="defaultLogo" onerror="this.style.display='none'"></div>
          <span>{{ serverTime }}</span>
        </div>
      </div>
    </div>
    <div v-if="isDisabled('isJd')" class="dcsViews" :style="{zIndex: isShow('isJd') ? '99' : '-99' }">
      <views ref="jd" :setting="'jd'" style="height: calc(100% - 30px);" />
      <div class="handle_menu">
        <div style="display: flex;">
          <div class="bthGroup">
            <div @click="goHome"><svg-icon icon-class="home" /></div>
            <div @click="goToPaths(false)"><svg-icon icon-class="retreat" /></div>
            <div @click="goToPaths(true)"><svg-icon icon-class="advance" /></div>
          </div>
          <div style="margin-left: 20px;cursor: pointer;" @dblclick="openJdPath(openPaths)">打开画面： {{ replaces(openPaths) }}</div>
        </div>
        <div style="display: flex; align-items: center; margin-right: 20px;">
          <div class="logo"><img :src="defaultLogo" onerror="this.style.display='none'"></div>
          <span>{{ serverTime }}</span>
        </div>
      </div>
    </div>
    <div v-if="isDisabled('isNcs')" class="dcsViews" :style="{zIndex: isShow('isNcs') ? '99' : '-99' }">
      <views ref="ncs" :setting="'ncs'" style="height: 100%;" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as rapi from '@/api/res'
import moment from 'moment'
import Views from '@/rviews/mmi/runFullscreen.vue'
export default {
  name: 'Multicomponent',
  components: { Views },
  data() {
    return {
      serverTime: this.formatTime(new Date()),
      // require('@/assets/index/logo.jpg')
      defaultLogo: rapi.getStaticUrl('login_logo2.jpg')
    }
  },
  computed: {
    ...mapState({
      roles: state => state.user.roles,
      showKey: state => state.settings.showKey,
      viewCache: state => state.settings.viewCache,
      openCache: state => state.project.dcsOpenCache,
      openPath: state => state.project.dcsOpenPath,
      openIndex: state => state.project.dcsOpenIndex,
      openCaches: state => state.project.jdOpenCache,
      openPaths: state => state.project.jdOpenPath,
      openIndexs: state => state.project.jdOpenIndex,
      forbid: state => state.project.forbid
    }),
    isShow() {
      return (name) => { return this.showKey === name }
    },
    isDisabled() {
      return (name) => { return !this.viewCache[name].disabled }
    }
  },
  mounted() {
    this.$on('global:ticker', (msg) => {
      this.formatTime(msg.data.time)
    })
  },
  methods: {
    goHome() {
      if (this.showKey === 'isDcs') {
        this.$refs.dcs.goHome()
      } else if (this.showKey === 'isJd') {
        this.$refs.jd.goHome()
      }
    },
    goToPath(key) {
      let cache = this.openCache
      let openIndex = this.openIndex
      if (key) {
        if (openIndex + 1 === cache.length) {
          return
        } else {
          let name = cache[openIndex + 1]
          this.$refs.dcs.toPath(name.path, 'go')
        }
      } else {
        if (!(openIndex)) return
        let name = cache[openIndex - 1]
        this.$refs.dcs.toPath(name.path, 'back')
      }
    },
    goToPaths(key) {
      let cache = this.openCaches
      let openIndex = this.openIndexs
      if (key) {
        if (openIndex + 1 === cache.length) {
          return
        } else {
          let name = cache[openIndex + 1]
          this.$refs.jd.toPath(name.path, 'go')
        }
      } else {
        if (!(openIndex)) return
        let name = cache[openIndex - 1]
        this.$refs.jd.toPath(name.path, 'back')
      }
    },
    replaces(paths) {
      return paths.split('/').pop()
    },
    openJdPath(path) {
      if (!this.roles.includes('engineer')) return
      this.$store.dispatch('settings/changeView', 'isDev')
      this.$router.push({ path: '/engineer/mmi/edit/' + encodeURIComponent(path) })
    },
    formatTime(time) {
      this.serverTime = moment(time).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style lang="scss" scoped>
.containers {
  .dcsViews {
    position: fixed;
    left: 0; top: 35px;
    width: 100%;
    height: calc(100vh - 35px);
    margin: 0;
    padding: 0;
    background-color: #FFF;
    overflow: hidden;
  }
  .handle_menu {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
    user-select: none;
    line-height: 30px;
    color: #fff;
    background-color: #262E40;
    .bthGroup {
      width: 150px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      cursor: pointer;
      div {
        font-size: 30px;
        width: 50px;
        text-align: center;
      }
    }
    .logo {
      img {
        display: block;
        height: 30px;
      }
    }
  }
}
</style>
