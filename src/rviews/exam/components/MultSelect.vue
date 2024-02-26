<template>
  <el-checkbox-group v-if="!readonly" v-model="checkList" type="vertical" @change="updateListValue">
    <template v-for="opt of ['A','B','C','D','E','F','G']">
      <div
        v-if="question[`option${opt}`]"
        :key="question[`option${opt}`]"
        style="margin-top: 18px; margin-left: 18px;"
      >
        <el-checkbox :label="opt">
          {{ `${opt}: ${question[`option${opt}`]}` }}
        </el-checkbox>
      </div>
    </template>
  </el-checkbox-group>
  <el-checkbox-group v-else :value="checkList" type="vertical" @change="updateListValue">
    <template v-for="opt of ['A','B','C','D','E','F','G']">
      <div
        v-if="question[`option${opt}`]"
        :key="question[`option${opt}`]"
        style="margin-top: 18px; margin-left: 18px;"
      >
        <el-checkbox :label="opt">
          {{ `${opt}: ${question[`option${opt}`]}` }}
        </el-checkbox>
      </div>
    </template>
  </el-checkbox-group>
</template>

<script>
export default {
  name: 'MultSelect',
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    question: {
      type: Object,
      default: Object.assign({})
    },
    value: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      checkList: this.value.split('')
    }
  },
  watch: {
    value: function(newVal) {
      this.checkList = newVal.split('')
    }
  },
  methods: {
    updateListValue(val) {
      val.sort()
      let v = val.join('')
      this.$emit('update', v)
      this.$emit('change', v)
    }
  }
}
</script>
