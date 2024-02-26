<template>
  <div class="tendency">
    <div class="select_menu">
      <div>曲线趋势</div>
      <el-select v-model="value" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="content">
      <div class="menu">
        <div class="menu_bth">
          <el-button type="primary" icon="el-icon-plus">添加趋势组</el-button>
          <el-button>删除</el-button>
        </div>
        <div class="menu_group">
          <div v-for="item in group" :key="item">
            <div>{{ item }}</div>
          </div>
        </div>
      </div>
      <div class="chartView"></div>
    </div>
  </div>
</template>

<script>
import * as rapi from '@/api/rtdb'
export default {
  data() {
    return {
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value: '',
      group: []
    }
  },
  mounted() {
    // this.getTrendGroupList()
  },
  methods: {
    getTrendGroupList() {
      rapi.listTrendGroup().then(group => {
        console.log(group)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tendency {
  width: 100%;
  height: 100%;
  padding: 5px;
  .select_menu {
    display: flex;
    height: 40px;
    align-items: center;
    border-radius: 5px;
    background-color: #FFF;
  }

  .content {
    height: calc(100% - 60px);
    display: flex;
    justify-content: space-around;
    .menu {
      width: 260px;
      display: flex;
      flex-direction: column;
      .menu_bth {
        margin-top: 10px;
        display: flex;
        justify-content: space-around;
        background-color: #FFF;
      }
      .menu_group {
        overflow-y: auto;
      }
    }
    .chartView {
      width: calc(100% - 260px);
    }
  }
}
</style>
