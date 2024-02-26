<template>
  <el-collapse
    :value="sideActive"
    accordion
    style="padding-left: 4px; background: #c8c2c6;"
    @change="handleCollapseChange"
  >
    <el-collapse-item title="模型" name="1">
      <div class="rubik-collapse-item">
        <page-tree :height="400" />
      </div>
    </el-collapse-item>
    <el-collapse-item title="算法" name="2">
      <div class="rubik-collapse-item">
        <alg-explorer />
      </div>
    </el-collapse-item>
    <el-collapse-item title="界面" name="3">
      <div class="rubik-collapse-item">
        <mmi-explorer />
      </div>
    </el-collapse-item>
    <!-- <el-collapse-item title="快照" name="4">
      <div class="rubik-collapse-item">
        <snapshot />
      </div>
    </el-collapse-item> -->
    <!-- <el-collapse-item title="工况" name="5">
      <div class="rubik-collapse-item">
        <condition-list />
      </div>
    </el-collapse-item> -->
    <el-collapse-item title="故障" name="6">
      <div class="rubik-collapse-item">
        <fault-tree :editable="true" />
      </div>
    </el-collapse-item>
    <el-collapse-item title="案例" name="7">
      <div class="rubik-collapse-item">
        <case-tree />
      </div>
    </el-collapse-item>
    <!-- <el-collapse-item title="操作记录" name="8">
      <div class="rubik-collapse-item">
        <operation-list />
      </div>
    </el-collapse-item> -->
  </el-collapse>
</template>

<script>
import AlgExplorer from '@/rviews/alg/explorer'
import MmiExplorer from '@/rviews/mmi/explorer'
import PageTree from '@/rviews/model/pagetree'
import FaultTree from '@/rviews/fault/tree'
import CaseTree from '@/rviews/case/tree'
// import ConditionList from '@/rviews/condition/list'
// import Snapshot from '@/rviews/condition/Snapshot'
// import OperationList from '@/rviews/case/operationList'

export default {
  name: 'DevSide',
  components: {
    AlgExplorer,
    PageTree,
    MmiExplorer,
    FaultTree,
    CaseTree
    // ConditionList,
    // Snapshot
    // OperationList
  },
  computed: {
    sideActive: function() {
      return this.$store.getters.project.sideActive
    }
  },
  methods: {
    handleCollapseChange(activeName) {
      this.$store.dispatch('setSideActive', activeName)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-container {
    padding: 0;
    margin: 0;
  }
  .rubik-collapse-item {
    display: block;
    height: calc(100vh - 95px - 48px * 6);
    overflow: auto;
    margin-bottom: -25px;
    background: #c8c2c6;
  }
  ::v-deep .el-collapse-item__header {
    background: #c8c2c6;
    color: #000;
  }
</style>
