<template>
  <div :class="{'show':show}" class="header-search">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
    <el-input
      v-if="show"
      ref="headerSearchInput"
      v-model="search"
      placeholder="请输入内容"
      class="header-search-input"
      size="mini"
      @change="change"
    >
      <el-select slot="prepend" placeholder="类型" :popper-append-to-body="true" size="mini">
        <el-option label="变量" value="var" />
        <el-option label="变量ID" value="varid" />
      </el-select>
    </el-input>
  </div>
</template>

<script>

export default {
  name: 'RubikSearch',
  data() {
    return {
      search: '',
      options: [],
      searchPool: [],
      show: false
    }
  },
  methods: {
    click() {
      this.show = !this.show
      if (this.show) {
        this.$refs.headerSearchInput && this.$refs.headerSearchInput.focus()
      }
    },
    close() {
      this.$refs.headerSearchInput && this.$refs.headerSearchInput.blur()
      this.options = []
      this.show = false
    },
    change(val) {
      this.search = ''
      this.options = []
      this.$nextTick(() => {
        this.show = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-search-input {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    vertical-align: middle;

    ::v-deep .el-input__inner {
      border-radius: 0;
      border: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-input {
      width: 320px;
      margin-left: 10px;
    }
  }
}
</style>
