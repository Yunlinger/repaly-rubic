<template>
  <div class="guide-container">
    <div class="icons-wrapper">
      <div v-for="item of buttons" :key="item.url">
        <div
          v-show="roles.includes('admin')|| roles.includes(item.role) || item.role == ''"
          class="icon-item"
          @click="click(item, $event)"
        >
          <div class="caption">
            {{ item.text }}
          </div>
        </div>
      </div>
      <div
        class="icon-item pos-right-bottom"
        @click="click(exitButton, $event)"
      >
        <div class="caption">
          {{ exitButton.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Guide',
  data() {
    return {
      buttons: [
        { role: 'admin', text: '用户管理', goto: '/admin/user' },
        { role: 'engineer', text: '项目开发', goto: '/engineer/project/tree' },
        { role: 'student', text: '学习模式', goto: '/student/study' },
        { role: 'student', text: '考试模式', goto: '/student/case' },
        { role: 'teacher', text: '下发任务', goto: '/teacher/dispatch' },
        { role: 'teacher', text: '查看状态', goto: '/teacher/status' },
        { role: 'teacher', text: '操作记录', goto: '/teacher/oplog' },
        { role: 'teacher', text: '培训记录', goto: '/teacher/trainlog' },
        { role: 'teacher', text: '查询成绩', goto: '/teacher/score' },
        { role: '', text: '我的', goto: '/profile/index' }
      ],
      exitButton: { role: '', text: '退出', goto: '/', onClick: this.logout }
    }
  },
  computed: {
    ...mapGetters(['roles'])
  },
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
    },
    click(item, e) {
      if (item.onClick) {
        item.onClick()
        return
      }
      if (item.goto) {
        this.$router.push(item.goto)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.guide-container {
  background-color: #f0f2f5;
  padding: 30px;
  min-height: calc(100vh);
  background-image: url(../../assets/login/bg-2.jpg);

  .icons-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: flex-start;
    align-content: space-around;
    overflow: auto;
    min-height: 600px;
    .icon-item {
      margin: 20px;
      height: 120px;
      width: 218px;
      color: #19d813;
      cursor: pointer;
      overflow: hidden;
      background-color: rgba(0, 0, 255, 0.4);
      border-radius: 6px;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      .caption {
        font-size: 25px;
      }
    }
    .icon-item:hover {
      background-color: rgba(0, 0, 255, 0.8);
      color: #ffffff;
    }
    .pos-right-bottom {
				position: fixed;
        right: 50px;
        bottom: 50px;
        height: 60px;
    }
  }
}
</style>
