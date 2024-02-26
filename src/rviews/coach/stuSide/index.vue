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
      <!-- <div class="ctl_right">
        <div class="exit" @click="logout">退出登录<img :src="exiticon" /></div>
      </div> -->
    </div>
    <div class="main_views" :style="'background-image:url('+bg_Url+')'">
      <div class="ctl_menu">
        <el-divider></el-divider>
        <div v-for="(item, idx) in menuList" :key="item.name" class="menu_item" :style="{background: activeName === idx ? '#409EFF' : ''}" @click="activeName = idx, drawer = false">
          <div class="menu_item_bth">
            <svg-icon :icon-class="item.icon"></svg-icon>
            {{ item.name }}
          </div>
          <el-divider></el-divider>
        </div>
      </div>
      <div v-show="activeName === 0" class="views_item">
        <system />
      </div>
      <div v-if="activeName === 1" class="views_item">
        <exam />
      </div>
      <div v-if="activeName === 2" class="views_item">
        <file />
      </div>
      <div v-if="activeName === 3" class="views_item">
        <my-score-list @show="detail" />
      </div>
      <div v-if="activeName === 4" class="views_item" style="background-color: #FFF;">
        <exam-detail :id="detailId" ref="detail" :marking="false" @back="back" />
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
import exam from '../teacherSide/exam/activities.vue'
import file from './file/index.vue'
import myScoreList from '@/rviews/exam/myScoreList'
import examDetail from '@/rviews/exam/examDetail.vue'
// import user from './user/index.vue'
export default {
  name: 'Dashboard',
  components: { Profile, system, exam, file, myScoreList, examDetail },
  data() {
    return {
      loading: false,
      activeName: 0,
      bg_Url: require('@/assets/index/bg.jpg'),
      // 头像
      avatar: require('@/assets/image/user.gif'),
      // 退出
      exiticon: require('@/assets/index/exit.png'),
      // 滚动消息
      menuList: [
        { name: '模拟实操', icon: 'handle' },
        { name: '参加考试', icon: 'exam' },
        { name: '资料查阅', icon: 'file' },
        { name: '我的成绩', icon: 'myscore' }
      ],
      dialogVisible: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      roles: state => state.user.roles,
      forbid: state => state.project.forbid
    })
  },
  methods: {
    refresh() {
      location.reload()
    },
    async goIndex() {
      if (this.forbid) {
        this.$router.push({ path: '/' })
      } else {
        this.$router.push({ path: '/index/student' })
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
      // window.localStorage.clear()
      // window.sessionStorage.clear()
      // await this.$store.dispatch('user/clearAll')
      await this.$store.commit('SET_FORBID', true)
      await this.$store.commit('Set_Index', 0)
      this.$store.dispatch('settings/changeView', 'isDev')
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
    },
    detail(data) {
      this.detailId = data
      this.activeName = 4
    },
    back() {
      this.activeName = 3
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
    .ctl_left {
      float: left;
      height: 100%;
      line-height: 50px;
      margin-left: 10px;
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
  }
  .main_views {
    height: calc(100vh - 50px);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // background-color: #1a1f2b;
    .ctl_menu {
      float: left;
      width: 200px;
      height: 100%;
      background: #606266;
      .menu_item{
        display: flex;
        height: 148px;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        color: #FFF;
        cursor: pointer;
        .menu_item_bth {
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
        }
        .svg-icon {
          font-size: 50px;
          margin-bottom: 10px;
        }
      }
    }
    .views_item {
      float: left;
      width: calc(100% - 200px);
      height: 100%;
      overflow-y: auto;
      padding: 10px;
    }
  }
  ::v-deep .el-drawer__body {
    background: #909399 !important;
  }
  ::v-deep .el-divider--horizontal {
    margin: 0;
  }
}

</style>
