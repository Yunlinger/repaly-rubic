<template>
  <div class="toolbar">
    <cond-list v-if="show === '工况'" />
    <Snapshot v-show="show === '快照'" />
    <fault v-show="show === '故障'" />
    <cases v-if="show === '案例'" />
    <operation-list v-if="show === '操作记录'" />
  </div>
</template>

<script>
import condList from '@/rviews/condition/list'
import Snapshot from '@/rviews/condition/Snapshot'
import fault from '@/rviews/fault/fault'
import cases from '@/rviews/case/list'
import OperationList from '@/rviews/case/operationList'
export default {
  components: { condList, Snapshot, fault, OperationList, cases },
  data() {
    return {
      show: ''
    }
  },
  methods: {
    cut(data) {
      this.show = data
    }
  }
}
</script>

<style scoped>
.toolbar{
  width: 500px;
  height: calc(100vh - 66px);
  padding: 2px;
  position: fixed;
  top: 36px; right: 0;
  overflow-y: auto;
  z-index: 100;
  background: #485a77;
  box-shadow: -2px -2px 10px 3px rgba(255, 255, 255, .6) ;
}
</style>
