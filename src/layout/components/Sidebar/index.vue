<template>
  <div :class="{'has-logo':showLogo}" style="position: relative;">
    <dev-side v-if="isEngineer && !isCollapse" />
    <el-scrollbar v-else wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        :default-openeds="defaultOpeneds"
        mode="vertical"
      >
        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
    <logo v-if="showLogo && isEngineer" :collapse="isCollapse" style="position: absolute; bottom: 0; left: 0;" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import DevSide from '@/layout/components/DevSide'

export default {
  components: { SidebarItem, DevSide, Logo },
  data() {
    return {
      defaultOpeneds: ['/teacher', '/student']
    }
  },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    isEngineer() {
      return this.$route.path.startsWith('/engineer')
    }
  }
}
</script>
