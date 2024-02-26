<template>
  <div class="studentSys">
    <div class="menu">
      <div v-for="(item, index) in menuList" :key="item.name" @click="turn(index)">{{ item.name }}</div>
    </div>
    <div class="view"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        { name: '综合数据' },
        { name: '今日动态' },
        { name: '计划考试概述' },
        { name: '已完成考试概述' },
        { name: '理论考试分析' },
        { name: '实操考试分析' },
        { name: '学员分析' },
        { name: '样本分析' },
        { name: '系统' },
        { name: '系统2' }
      ]
    }
  },
  methods: {
    turn(index) {
      console.log(index)
    }
  }
}
</script>

<style lang="scss">
.studentSys {
  display: flex;
  height: 100%;
  .menu {
    width: 170px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    overflow: hidden;
    background: #606266;
    div {
      height: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      user-select: none;
      cursor: pointer;
      border-bottom: 1px solid #FFF;
    }
  }
  .view {
    width: calc(100% - 170px);
    height: 100%;
    overflow: hidden;
  }
}
</style>
