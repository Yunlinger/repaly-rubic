<template>
  <div class="teacher">
    <!-- <div class="nav">
      <div class="title">
        <img :src="hollysIcon" />
      </div>
      <div class="exit" @click="logout">注销登录</div>
    </div> -->
    <div class="main">
      <div class="leftBtnBox" :class="{ collapsed: collapsed }">
        <div style="position: relative; width: 150px;height: 70px;">
          <img :src="hollysIcon" style="width: 130px;height: 50px;position: relative;top:10px;left: 10px;">
        </div>

        <div
          v-for="(item, index) in leftSelect"
          :key="index"
          @click="selectItem(item, index)"
        >
          <div style="height: 70px;width: 150px;cursor: pointer;" :style="{'background-color':selectedIndex ==index?'#80b336':'','color':selectedIndex ==index?'#ffffff':''}">
            <div style="height: 50px;width: 130px;position: relative;top:10px;left: 10px;">
              <img style="float: left;position: relative;height: 40px;width: 40px;top: 5px;" :src="item.imgSrc">
              <div style="float: right;line-height: 50px;position: relative;right: 5px;font-size: larger;">{{ item.text }}</div>
            </div>
          </div>
        </div>
        <!-- <div style="width: 65px;height: 40px;position: fixed;bottom: 10px;" @click="SettVisible=!SettVisible">
          <img :src="moreIcon" style="width: 40px;height: 40px;position: relative;left: 10px;cursor: pointer;">
        </div> -->
      </div>
      <!-- <div class="toggleSidebar" :style="{ left: collapsed ? '205px' : '65px' }" @click="toggle">
        <i :class="collapsed ? 'el-icon-caret-left' : 'el-icon-caret-right'" />
      </div> -->
      <div class="hollysys_view">
        <component :is="componentsName" v-if="!loading"></component>
      </div>
    </div>
  </div>
</template>

<script>
import * as rapi from '@/api/res'
import room from './room/index.vue'
import stu from './stu/index.vue'
import paper from './paper/index.vue'
import condition from './condition/index.vue'
import fault from './fault/index.vue'
import exam from './exam/index.vue'
import tendency from './tendency/index'
import setting from './setting/index.vue'
export default {
  components: { room, stu, paper, condition, fault, exam, tendency, setting },
  data() {
    return {
      loading: false,
      SettVisible: false,
      icon: require('@/assets/hollysys/icon.png'),
      hollysIcon: require('@/assets/hollysys/hollySys.png'),
      moreIcon: require('@/assets/hollysys/more.png'),
      collapsed: false,
      componentsName: 'room',
      selectedIndex: 0,
      // leftSelect: [
      //   {
      //     name: 'room',
      //     imgSrc: require('@/assets/hollysys/tv.png'),
      //     text: '我的教室'
      //   },
      //   {
      //     name: 'stu',
      //     imgSrc: require('@/assets/hollysys/user.png'),
      //     text: '学员管理'
      //   },
      //   {
      //     name: 'paper',
      //     imgSrc: require('@/assets/hollysys/shijuan.png'),
      //     text: '试卷管理'
      //   },
      //   {
      //     name: 'condition',
      //     imgSrc: require('@/assets/hollysys/gongcheng.png'),
      //     text: '工程工况'
      //   },
      //   {
      //     name: 'fault',
      //     imgSrc: require('@/assets/hollysys/guzhang.png'),
      //     text: '故障管理'
      //   },
      //   {
      //     name: 'exam',
      //     imgSrc: require('@/assets/hollysys/chengji.png'),
      //     text: '成绩管理'
      //   },
      //   {
      //     name: 'tendency',
      //     imgSrc: require('@/assets/hollysys/qushi.png'),
      //     text: '曲线趋势'
      //   },
      //   {
      //     name: 'setting',
      //     imgSrc: require('@/assets/hollysys/shezhi.png'),
      //     text: '系统设置'
      //   }
      // ]
      leftSelect: [
        {
          name: 'room',
          imgSrc: require('@/assets/hollysys/tv.png'),
          text: '培训教室'
        },
        {
          name: 'stu',
          imgSrc: require('@/assets/hollysys/user.png'),
          text: '学员管理'
        }
        // {
        //   name: 'setting',
        //   imgSrc: require('@/assets/hollysys/shezhi.png'),
        //   text: '系统设置'
        // },
        // {
        //   name: 'tendency',
        //   imgSrc: require('@/assets/hollysys/qushi.png'),
        //   text: '曲线趋势'
        // }

      ]
    }
  },
  created() {
    this.getConfiguration()
  },
  mounted() {
    window.addEventListener('resize', () => {
      if (window.innerWidth < 1440) {
        this.collapsed = false
      }
    })
  },
  methods: {
    getConfiguration() {
      this.loading = true
      rapi.getCache('classRoom').then(async res => {
        const { project, setting } = res
        await this.$store.dispatch('room/setProject', project)
        await this.$store.dispatch('room/setSetting', setting)
        this.loading = false
      }).finally(() => {
        this.loading = false
      })
    },
    toggle() {
      setTimeout(() => {
        this.collapsed = !this.collapsed
      }, 200)
    },
    async logout() {
      window.localStorage.clear()
      window.sessionStorage.clear()
      // await this.$store.dispatch('user/clearAll')
      await this.$store.commit('SET_FORBID', true)
      await this.$store.dispatch('clear_cache')
      this.$store.dispatch('settings/changeView', 'isDev')
      await this.$store.commit('Set_Cache', [])
      await this.$store.commit('Set_Index', 0)
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
      this.$msg.success('成功退出')
    },
    selectItem(item, index) {
      this.selectedIndex = index
      this.componentsName = item.name
    }
  }
}
</script>

<style lang="scss" scoped>
.teacher {
  display: flex;
  flex-direction: column;
  user-select: none;
  overflow: hidden;;
  .nav {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    color: #FFF;
    background-color: #FFF;
    .title {
      width: 280px;
      height: 100%;
      // display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      img {
        height: 40px;
        margin-right: 10px;
        -webkit-user-drag: none;
        position: relative;
        float: left;
        top:7px;
        left: 58px;
      }
    }
    .exit {
      width: 100px;
      height: 100%;
      display: flex;
      align-items: center;
      color: black;
      cursor: pointer;
    }
    .exit:hover {
      color: red;
    }
  }
  .main {
    height: calc(100vh);
    display: flex;
    position: relative;
    .leftBtnBox {
      background-color:  #d7d7d7;;
      width: 150px;
      height: calc(100%);
      // padding-top: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
      transition: width 0.5s ease-in-out;
      .selected {
        background-color: #b9b9b9;
      }

      .sidebar-icon {
        width: 24px;
        height: 24px;
        margin-right: 14px;
        -webkit-user-drag: none; /* Safari/Chrome */
        -moz-user-drag: none; /* Firefox */
        -ms-user-drag: none; /* Internet Explorer/Edge */
      }

      .sidebar-text {
        width: 64px;
        flex-shrink: 0;
        vertical-align: middle;
        color: black;
        position: relative;
        transition: width 0.9s ease-in-out;
      }

      .selectedToggle {
        background-color: #b9b9b9;
      }
    }

    .collapsed {
      width: 205px;
    }
    .toggleSidebar {
      z-index: 999;
      position: absolute;
      left: 285px; top: 50%;
      width:16px;
      height: 80px;
      border-width: 16px 0 16px 16px;
      border-style: solid;
      border-color: transparent transparent transparent #a5a3a3;
      transition: left 0.5s ease-in-out;
      cursor: pointer;
      i {
        position: absolute;
        top: 50%; /* 垂直居中 */
        left: 50%; /* 水平居中 */
        transform: translate(-100%, -50%); /* 使用 transform 来精确居中 */
        color: rgb(251, 251, 251);
      }
    }

    .hollysys_view {
      flex-grow: 1;
      width: calc(100% - 285px);
      height: 100%;
      background-color: rgb(245, 246, 250);
    }
    .bottomInst{
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40px;
      background-color: #35424a;
      .fzServe{
        float: left;
        margin-left: 60px;
        margin-right: 30px;
        line-height: 40px;
      }
    .bottom-navbar {
      width: 70%;
      height: 40px;
      line-height: 60px;
    }
    .nav-item svg{
      width: 23px;
    }

    .bottom-navbar div{
      float: left;
      margin-right: 10px;
    }
  }}
}
</style>
