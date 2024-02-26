
<template>
  <div>
    <property-group title="案例操作" :show="true" :expanded="true">
      <buttons-property
        label="下发"
        :buttons="buttonDispatch"
      />
      <buttons-property
        label="开始"
        :buttons="buttonStart"
      />
      <buttons-property
        label="放弃"
        :buttons="buttonGiveup"
      />
      <buttons-property
        label="提交"
        :buttons="buttonCommit"
      />
    </property-group>
    <property-group title="案例基本设置" :show="true" :expanded="true">
      <text-property label="名称" name="name" :value="data && data.name" :onChange="dataSet" />
      <text-property label="提示" name="tip" :multiline="true" :value="data && data.tip" :onChange="dataSet" />
      <select-property label="工况" name="conID" :value="data && data.conID" :onChange="onDataSelectChange" :options="condIDTypeOptions" />
      <select-property label="故障" name="faultID" :value="data && data.faultID" :onChange="onDataSelectChange" :options="faultIDTypeOptions" />
    </property-group>
    <property-group title="步骤设置" :show="show" :expanded="expanded">
      <static-property label="ID" name="id" :value="node && node.id" />
      <text-property label="名称" name="name" :value="node && node.name" :onChange="normalSet" />
      <number-property label="分值" name="score" :value="node && node.score" :onChange="normalSet" />
      <select-property label="类型" name="type" :value="node && node.type" :onChange="onSelectChange" :options="operTypeOptions" />
      <select-property label="前置逻辑" name="parentLogic" :value="node && node.parentLogic" :onChange="onSelectChange" :options="preLogicOptions" />
      <text-property label="提示" name="tip" :multiline="true" :value="node && node.tip" :onChange="normalSet" />
    </property-group>
    <property-group title="下令设置" :show="node.type === 1" :expanded="expanded">
      <text-property label="操作变量" name="opvar" :value="node && node.opvar" :onChange="normalSet" />
      <number-property label="变量值" name="opval" :value="node && node.opval" :onChange="normalSet" />
    </property-group>
    <property-group title="检查设置" :show="node.type === 2" :expanded="expanded">
      <text-property label="检查变量" name="opvar" :value="node && node.opvar" :onChange="normalSet" />
      <number-property label="检查值" name="opval" :value="node && node.opval" :onChange="normalSet" />
    </property-group>
    <property-group title="现地操作设置" :show="node.type === 3" :expanded="expanded">
      <text-property label="变量" name="opvar" :value="node && node.opvar" :onChange="normalSet" />
    </property-group>
    <property-group title="状态反馈设置" :show="node.type === 4" :expanded="expanded">
      <text-property label="变量" name="opvar" :value="node && node.opvar" :onChange="normalSet" />
      <select-property label="操作符" name="checklogic" :value="node && node.checklogic" :onChange="onSelectChange" :options="checkLogicOptions" />
      <number-property label="比较值" name="opval" :value="node && node.opval" :onChange="normalSet" />
      <number-property
        v-show="node && (node.checklogic === 7 || node.checklogic === 8)"
        label="比较值2"
        name="opval2"
        :value="node && node.opval2"
        :onChange="normalSet"
      />
    </property-group>
  </div>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import TextProperty from '@/components/property/TextProperty'
import NumberProperty from '@/components/property/NumberProperty'
import SelectProperty from '@/components/property/SelectProperty'
import StaticProperty from '@/components/property/StaticProperty'
import ButtonsProperty from '@/components/property/ButtonsProperty'

import * as condApi from '@/api/condition'
import * as faultApi from '@/api/fault'

export default {
  name: 'BasicProperty',
  components: {
    PropertyGroup,
    NumberProperty,
    SelectProperty,
    TextProperty,
    StaticProperty,
    ButtonsProperty
  },
  props: {
    diagram: {
      type: Object,
      default: null
    },
    data: {
      type: Object,
      default: null
    }
  },
  events: ['save', 'dispatch'],
  data() {
    return {
      node: {
        type: 0
      },
      expanded: true,
      operTypeOptions: [
        { value: 0, text: '空' },
        { value: 1, text: '下令' },
        { value: 2, text: '检查' },
        { value: 3, text: '现地操作' },
        { value: 4, text: '状态反馈' }
      ],
      preLogicOptions: [
        { value: -1, text: '无' },
        { value: 0, text: '与' },
        { value: 1, text: '或' },
        { value: 2, text: '选 2' },
        { value: 3, text: '选 3' },
        { value: 4, text: '选 4' },
        { value: 5, text: '选 5' },
        { value: 6, text: '选 6' },
        { value: 7, text: '选 7' },
        { value: 8, text: '选 8' }
      ],
      checkLogicOptions: [
        { value: 0, text: '' },
        { value: 1, text: '==' },
        { value: 2, text: '>' },
        { value: 3, text: '>=' },
        { value: 4, text: '<' },
        { value: 5, text: '<=' },
        { value: 6, text: '!=' },
        { value: 7, text: '[a,b)' },
        { value: 8, text: '![a,b)' }
      ],
      condIDTypeOptions: [],
      faultIDTypeOptions: [],
      buttonDispatch: [
        {
          caption: '下发试卷',
          callback: (e) => { this.$emit('dispatch', e) }
        }
      ],
      buttonStart: [
        {
          caption: '开始考试',
          callback: (e) => { this.$emit('start', e) }
        }
      ],
      buttonGiveup: [
        {
          caption: '放弃考试',
          callback: (e) => { this.$emit('giveup', e) }
        }
      ],
      buttonCommit: [
        {
          caption: '提交试卷',
          callback: (e) => { this.$emit('commit', e) }
        }
      ]
    }
  },
  computed: {
    show() {
      if (this.diagram && this.diagram.selection.size === 1) {
        let it = this.diagram.selection.iterator
        it.next()
        if (it.value.data.fromPort) {
          // 有连线
          return false
        }
        if (!it.value.data.category) {
          return true
        }
      }
      return false
    },
    _node() {
      if (this.diagram && this.diagram.selection.size === 1) {
        let it = this.diagram.selection.iterator
        it.next()
        if (!it.value.data.fromPort) {
          // 不是连线
          return it.value.data
        }
      }
      return {
        type: 0
      }
    }
  },
  watch: {
    _node: {
      deep: true,
      handler: function(val) {
        this.node = {
          type: 0,
          parentLogic: 0,
          ... val
        }
      }
    }
  },
  mounted() {
    this.loadSelectOptions()
  },
  methods: {
    loadSelectOptions() {
      condApi.listCond().then(resp => {
        resp.items = resp.items || {}
        this.condIDTypeOptions.push({
          value: 0,
          text: '无'
        })
        for (let id in resp.items) {
          this.condIDTypeOptions.push({
            value: id,
            text: resp.items[id].name || ''
          })
        }
      }).catch(() => {
      })
      faultApi.list().then(resp => {
        resp.items = resp.items || {}
        this.faultIDTypeOptions.push({
          value: 0,
          text: '无'
        })
        for (let id in resp.items) {
          this.faultIDTypeOptions.push({
            value: id,
            text: resp.items[id].name || ''
          })
        }
      }).catch(() => {
      })
    },
    normalSet(v, n, e) {
      // if (this._node) {
      //   this.node[n] = v
      //   let a = this._node
      //   a[n] = v
      //   this.diagram.model.updateTargetBindings(a)
      // }
    },
    onSelectChange(v, n, e) {
      v = parseInt(v)
      return this.normalSet(v, n, e)
    },
    dataSet(v, n, e) {
      // if (this.data) {
      //   this.data[n] = v
      // }
    },
    onDataSelectChange(v, n, e) {
      v = parseInt(v)
      return this.dataSet(v, n, e)
    }
  }
}
</script>
