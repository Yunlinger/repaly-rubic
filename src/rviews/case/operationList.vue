<template>
  <div style="width: 100%; height: 100%">
    <div class="view">
      <el-table
        :data="ops"
        border
        stripe
        style="width:100%;"
        height="100%"
        :show-header="true"
        :cell-style="{padding:'0px'}"
      >
        <el-table-column
          label="时间"
          width="55"
        >
          <template slot-scope="{ row }">
            <span>{{ row.ts }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="变量"
        >
          <template slot-scope="{ row }">
            <span>{{ row.pn }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="值"
          width="40"
        >
          <template slot-scope="{ row }">
            <span>{{ row.value }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="源"
          width="40"
        >
          <template slot-scope="{ row }">
            <span>{{ row.origin }}</span>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'OperationList',
  data() {
    return {
      loading: false,
      ops: []
    }
  },
  mounted() {
    this.$on('global:log', msg => {
      if (msg.data.op !== 'setValue' ||
          msg.data.p !== this.$store.getters.project.project ||
          msg.data.i !== this.$store.getters.project.id) {
        return
      }

      this.ops.unshift({
        ts: moment(msg.data.time).format('mm:ss'),
        pn: msg.data.pn || '',
        value: msg.data.value || 0,
        origin: msg.data.origin || ''
      })

      if (this.ops.length > 128) {
        this.ops.pop()
      }
    })
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
	.view{
		height: calc(100% - 2px);
		width: 100%;
  }
</style>
