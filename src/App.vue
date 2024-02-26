<template>
  <div id="app" @mousedown="mouseEnd">
    <router-view />
    <!-- <quick-tool-bar v-show="showQuick" /> -->
  </div>
</template>

<script>
// import QuickToolBar from '@/components/QuickToolBar'
import { subAllWhenEventCommit } from '@/utils/sub'
import { getCache } from '@/api/res'
import store from '@/store'
export default {
  name: 'App',
  // components: { QuickToolBar },
  data() {
    return {
      tiemer: null,
      timeOut: 1800000
    }
  },
  computed: {
    showQuick() {
      return this.$route.path.startsWith('/engineer') || this.$route.path.startsWith('/framefull')
    }
  },
  mounted() {
    // 当合适的事件来后订阅合适的消息
    subAllWhenEventCommit(this)
    if (!this.$route.path.startsWith('/login')) {
      // this.startTime()
    }
    // 获取远端的配置
    getCache('config').then(conf => {
      conf = conf || {}
      store.dispatch('app/setConfig', conf)
    }).catch(e => {
      console.error('get config error', e)
    })
  },
  methods: {
    mouseEnd() {
      // this.timeOut = 1800000
      // this.startTime()
    },
    startTime() {
      let _this = this
      clearTimeout(this.timer)
      this.timer = setTimeout(function() {
        _this.logout()
      }, this.timeOut)
    },
    async logout() {
      clearTimeout(this.timer)
      this.$store.commit('Set_Index', 0)
      await this.$store.commit('SET_FORBID', true)
      await this.$store.dispatch('clear_cache')
      await this.$store.dispatch('settings/changeView', 'isDev')
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
    }
  }
}
</script>

<style>
.el-popper[x-placement^=bottom] {
  background: #ffffff !important;
}
</style>
