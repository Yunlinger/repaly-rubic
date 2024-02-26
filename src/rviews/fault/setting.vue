<template>
  <div class="content">
    <div v-if="title === '变量类型'" class="typeWidth">
      <el-select v-if="row.edit" v-model="row.ops[0].dataType" placeholder="变量类型">
        <el-option label="模拟量" :value="0"></el-option>
        <el-option label="数字量" :value="1"></el-option>
      </el-select>
      <span v-else>{{ row.ops && row.ops[0].dataType ? '数字量' : '模拟量' }}</span>
    </div>
    <div v-if="title === '名称'">
      <el-input v-if="row.edit" v-model="row.name" />
      <span v-else>{{ row.name }}</span>
    </div>
    <div v-if="title === '变量'">
      <el-input v-if="row.edit" v-model="row.ops[0].var" />
      <span v-else>{{ (row.ops && row.ops[0].var) || '' }}</span>
    </div>
    <div v-if="title === '目标值'">
      <el-input v-if="row.edit" v-model.number="row.ops[0].target" />
      <span v-else>{{ (row.ops && row.ops[0].target) || '' }}</span>
    </div>
    <div v-if="title === '当前值'">
      <div>{{ isFault(row) ? getValue(row) : 0 }}</div>
    </div>
    <div v-if="title === '延时时间'">
      <el-input v-if="row.edit" v-model.number="row.ops[0].start" />
      <span v-else>{{ (row.ops && row.ops[0].start) || 0 }}</span>
    </div>
    <div v-if="title === '渐变时间'">
      <el-input v-if="row.edit" v-model.number="row.ops[0].gradient" />
      <span v-else>{{ (row.ops && row.ops[0].gradient) || 0 }}</span>
    </div>
    <div v-if="title === '保持时间'">
      <el-input v-if="row.edit" v-model.number="row.ops[0].duration" />
      <span v-else>{{ (row.ops && row.ops[0].duration) || 0 }}</span>
    </div>
    <div v-if="title === '操作'">
      <el-button-group>
        <el-button type="danger" icon="el-icon-delete" @click="removeNode(row)">删除</el-button>
        <el-button type="info" icon="el-icon-copy-document" @click="copyFault(row)">复制</el-button>
        <el-popconfirm
          title="确定保存？"
          @onConfirm="saveCurrent(row)"
        >
          <el-button slot="reference" type="success" icon="el-icon-document-checked">报存</el-button>
        </el-popconfirm>
        <el-button
          :type="isFault(row) ? 'primary': 'danger'"
          icon="el-icon-document-delete"
          @click="startOrstop(row)"
        >
          {{ isFault(row) ? '消除故障' : '投入故障' }}
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as rdbapi from '@/api/rtd'
export default {
  props: { // 2规定props，包括List的类型和数据
    row: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: () => ''
    },
    column: {
      type: Object,
      default: () => {}
    },
    rowIndex: {
      type: Number,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters([
      'selectedInst'
    ])
  },
  methods: {
    removeNode(row) {
      this.$emit('removeNode', row)
    },
    copyFault(row) {
      this.$emit('copyFault', row)
    },
    saveCurrent(row) {
      this.$emit('saveCurrent', row)
    },
    startOrstop(row) {
      this.$emit('startOrstop', row)
    },
    isFault(row) {
      return (this.selectedInst.fault && this.selectedInst.fault.includes(row.id)) || false
    },
    getValue(row) {
      return rdbapi.getValue(row.ops[0].var)
    }
  }
}
</script>

<style scoped>
.content {
  user-select: none;
}
.typeWidth ::v-deep .el-select .el-input {
  width: 85px !important;

}
</style>
