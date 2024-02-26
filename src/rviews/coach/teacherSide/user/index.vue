<template>
  <div class="user">
    <div class="tab">
      <div :class="{ active:index === 0 }" style="border-right: 1px solid #000" @click="index = 0">用户管理</div>
      <div :class="{ active:index === 1 }" @click="index = 1">团队管理</div>
    </div>
    <div v-show="index === 0" class="user_view">
      <user />
    </div>
    <div v-show="index === 1" class="user_view">
      <group />
    </div>
  </div>
</template>

<script>
import user from '@/rviews/admin/user'
import group from '@/rviews/admin/group'
export default {
  name: 'User',
  components: { user, group },
  data() {
    return {
      index: 0
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  height: 100%;
  border-radius: 10px;
  background: #fff;
  // opacity: .6;
  .tab {
    height: 50px;
    .active{
      color: #67C23A;
    }
    div {
      float: left;
      width: 50%;
      line-height: 50px;
      cursor: pointer;
      text-align: center;
      border-bottom: 1px solid #000;
    }
  }
  .user_view {
    height: calc(100% - 50px);
  }
}
</style>
