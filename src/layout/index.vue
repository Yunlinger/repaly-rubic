<template>
  <div :class="classObj" class="app-wrapper">
    <!-- <div v-if="device==='mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" /> -->
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar @showToolbar="showToolbar" />
        <tags-view v-if="isDev" />
      </div>
      <div class="allViews" @click="toolBar = false">
        <div v-if="forbid" class="dcsViews" :style="{top: isShow ? '70px' : '35px'}" style="display: flex;">
          <sidebar v-if="sidebar.opened" class="sidebar-container" style="flex-shrink: 0" />
          <app-main />
        </div>
        <multicomponent v-if="isEng" />
      </div>
    </div>
    <div v-if="isEng">
      <toolbar v-show="toolBar" ref="toolbar" />
    </div>
  </div>
</template>

<script>
// import RightPanel from '@/components/RightPanel'
// import DevSide from '@/layout/components/DevSide'
import multicomponent from './multicomponent'
import { AppMain, Navbar, Sidebar, TagsView } from './components'
import Toolbar from './components/toolbar'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    // RightPanel,
    // Settings,
    Sidebar,
    TagsView,
    Toolbar,
    multicomponent
  },
  mixins: [ResizeMixin],
  data() {
    return {
      toolBar: false,
      active: ''
    }
  },
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      roles: state => state.user.roles,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader,
      cacheViews: state => state.tagsView.cachedViews,
      forbid: state => state.project.forbid,
      showKey: state => state.settings.showKey
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    isEng() {
      return this.$route.path.startsWith('/engineer')
    },
    isShow() {
      return this.viewCache && this.viewCache['isDev'].show || true
    },
    isDev() {
      return this.roles.includes('engineer')
    }
  },
  watch: {
    '$route'(val) {
      if (val.path.startsWith('/engineer/model/edit/')) {
        this.$store.dispatch('settings/changeView', 'isDev')
      }
      if (val.path.startsWith('/dashboard')) {
        this.toolBar = false
        this.$store.dispatch('settings/changeView', 'isDev')
        this.$store.dispatch('clear_cache')
      }
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    },
    showToolbar(data) {
      if (data !== this.active && this.toolBar) {
        this.active = data
        this.$refs.toolbar.cut(data)
        return
      } else {
        if (!this.toolBar) {
          this.active = data
          this.toolBar = true
          this.$refs.toolbar.cut(data)
        } else {
          this.toolBar = false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }

  .main-container {
    position: relative;
  }
  .allViews {
    width: 100%;
    height: calc(100vh - #{$navbarHeight} - #{$tagsviewHeight});
  }
  .max-app-container {
    position: fixed;
    left: 0; top: 70px;
    width: 100%;
    height: calc(100vh - #{$navbarHeight} - #{$tagsviewHeight});
    margin: 0;
    padding: 0;
    background-color: #FFF;
    overflow: auto;
  }
  .dcsViews {
    position: fixed;
    left: 0; top: 35px;
    width: 100%;
    height: calc(100vh - 36px - 34px);
    margin: 0;
    padding: 0;
    background-color: #FFF;
    overflow: auto;
  }

  .sidebar-container {
    width: 300px !important;
    height: calc(100vh - 70px);
    border-right: 1px solid #d8dce5;
  }
  .handle_menu {
    height: 30px;
    display: flex;
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
  }
</style>
