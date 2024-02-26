<template>
  <div
    v-loading="loading"
    class="view"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="operation_panel">
      <div class="ctl_left">
        <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img alt="avatar" :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
            <em class="el-icon-caret-bottom" />
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="dialogVisible = true">
              {{ $t('我的') }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="goIndex">
              {{ $t('首页') }}
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">
              <span style="display:block;">
                {{ $t('退出') }}
              </span>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="refresh">
              <span style="display:block;">
                {{ $t('刷新') }}
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="ctl_tab">
        <div :class="{ active: activeName === 0 }" @click="activeName = 0">
          仿真实训系统
        </div>
        <div :class="{ active: activeName === 1 }" @click="activeName = 1">
          理论考试系统
        </div>
        <div :class="{ active: activeName === 2 }" @click="activeName = 2">
          文档管理
        </div>
        <!-- <div :class="{ active: activeName === 3 }" @click="activeName = 3">
          学员管理
        </div> -->
        <!-- <div :class="{ active: activeName === 3 }" @click="activeName = 3">
          用户管理
        </div> -->
        <!-- <div :class="{ active: activeName === 4 }" @click="activeName = 4">
          学员界面
        </div> -->
      </div>
      <div class="ctl_right">
        <div class="online">
          <el-popover
            placement="bottom"
            width="400"
            trigger="hover"
          >
            <div style="width:376px;height: 100px;overflow-y: auto;display: flex;justify-content:space-between;flex-wrap:wrap;">
              <div v-for="item in connects" :key="item.id" style="user-select: none;font-size: 25px;width: 125px;text-align:center;">
                {{ item.uname }}
              </div>
            </div>
            <i slot="reference" class="el-icon-user" />
            <span class="iconfont icon-xxx"></span>
          </el-popover>
          <div style="color: #01a7f0">{{ Object.keys(connects).length }}</div>
          人在线
        </div>
        <!-- <div class="exit" @click="logout">退出登录<img :src="exiticon" /></div> -->
      </div>
    </div>
    <div class="main_views" :style="'background-image:url('+bg_Url+')'">
      <div v-if="user.token" class="views_item">
        <!-- <keep-alive :max="4">
          <component :is="showWhat"></component>
        </keep-alive> -->
        <component :is="showWhat"></component>
      </div>
    </div>
    <el-dialog
      title="我的"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <profile v-if="dialogVisible" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Profile from '@/rviews/profile/index'
import system from './system/index.vue'
// import stu from '../stuSide/system/index'
import exam from './exam/index.vue'
import file from './file/index.vue'
// ./trainee/analyze' 学员上机时间管理
// import trainee from './trainee'
export default {
  name: 'Dashboard',
  components: { Profile, system, file, exam },
  data() {
    return {
      loading: false,
      show: true,
      name: this.cname,
      activeName: this.$store.state.project.activeName || 0,
      showWhat: '',
      bg_Url: require('@/assets/index/bg.jpg'),
      // 头像
      avatar: require('@/assets/image/user.gif'),
      // 退出
      exiticon: require('@/assets/index/exit.png'),
      dialogVisible: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      roles: state => state.user.roles,
      connects: state => state.user.connects,
      forbid: state => state.project.forbid
    })
  },
  watch: {
    activeName(val) {
      switch (val) {
        case 0:
          this.showWhat = 'system'
          break
        case 1:
          this.showWhat = 'exam'
          break
        case 2:
          this.showWhat = 'file'
          break
        case 3:
          this.showWhat = 'trainee'
          break
        default:
          break
      }
      this.$store.commit('Set_Index_NUM', val)
    }
  },
  destroyed() {
    this.show = false
  },
  created() {
    // [system, exam, file, trainee]
    let list = [system, exam, file]
    if (this.activeName !== 0) {
      this.showWhat = list[this.activeName]
    } else {
      this.showWhat = 'system'
    }
  },
  methods: {
    refresh() {
      location.reload()
    },
    async goIndex() {
      if (this.forbid) {
        this.$router.push({ path: '/' })
      } else {
        this.$router.push({ path: '/index/teacher' })
        // if (this.roles.includes('teacher') && this.roles.length < 3) {
        //   this.$router.push({ path: '/index/teacher' })
        //   return
        // } else if (this.roles.includes('student') && this.roles.length < 3) {
        //   this.$router.push({ path: '/index/student' })
        // }
      }
      await this.$store.commit('SET_FORBID', true)
    },
    async logout() {
      window.localStorage.clear()
      window.sessionStorage.clear()
      // await this.$store.dispatch('user/clearAll')
      await this.$store.commit('SET_FORBID', true)
      await this.$store.dispatch('clear_cache')
      this.$store.dispatch('settings/changeView', 'isDev')
      await this.$store.commit('Set_Index', 0)
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
      this.$msg.success('成功退出')
    },
    judgeRole(item) {
      let name = item.find(ite => ite === 'teacher')
      if (name) {
        return '教练员'
      } else {
        return item[0]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.view {
  min-width: 1340px;
  overflow: hidden;
  .operation_panel {
    width: 100%;
    height: 50px;
    user-select: none;
    background-color: #283142;
    .operation_panel:hover {
      display: block;
    }
    .ctl_left {
      float: left;
      height: 100%;
      line-height: 50px;
      .avatar-container {
        margin-right: 10px;
        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 24px;
            height: 24px;
            border-radius: 6px;
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -10px;
            top: 12px;
            font-size: 12px;
          }
        }
      }
      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: text-bottom;

        &.hover-effect {
          cursor: pointer;
          transition: background .3s;

          &:hover {
            background: rgba(0, 0, 0, .025)
          }
        }
      }
    }
    .ctl_tab {
      float: left;
      display: flex;
      justify-content: space-around;
      width: 500px;
      margin-left: 30px;
      line-height: 50px;
      color: #aaa;
      cursor: pointer;
      user-select:none;
      .active {
        color: #02bfbf;
      }
    }
    .ctl_right {
      float: right;
      width: 570px;
      display: flex;
      justify-content: flex-end;
      color: #fff;
      cursor: pointer;
      line-height: 50px;
      .online {
        margin-right: 20px;
        display: flex;
        justify-content: space-around;
        i {
          font-size: 35px;
          line-height: 50px;
        }
      }
    }
  }

  .main_views {
    height: calc(100vh - 50px);
    background-size: 100% 100%;
    background-repeat: no-repeat;

    .views_item {
      height: calc(100% - 10px);
      padding: 10px;
    }
  }
}
</style>
