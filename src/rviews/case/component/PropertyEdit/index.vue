
<template>
  <div style="padding: 2px;">
    <property-group title="案例操作" :show="true" :expanded="true">
      <buttons-property
        label="保存"
        :buttons="buttonSave"
      />
      <buttons-property
        label="测试"
        :buttons="buttonTest"
      />
      <buttons-property
        label="录制"
        :buttons="buttonLog"
      />
      <buttons-property
        label="批量"
        :buttons="buttonBat"
      />
    </property-group>
    <property-group title="案例基本设置" :show="true" :expanded="true">
      <text-property label="名称" name="name" :value="cas && cas.name" :onChange="caseSet" />
      <text-property label="描述" name="tip" :multiline="true" :value="cas && cas.tip" :onChange="caseSet" />
      <number-property label="时间(秒)" name="timeLimit" :value="(cas && cas.timeLimit) || 3600" :onChange="caseSet" />
      <select-property label="工况" name="conID" :value="(cas && cas.conID) || 0" :onChange="onCaseSelectChange" :options="condIDTypeOptions" />
      <check-box-property label="忽略逻辑" name="ignoreParentLogic" :value="(cas && cas.ignoreParentLogic) || false" :onChange="caseSet" />
      <select-property label="故障1" name="faultID" :value="((cas && cas.faultID) || 0)" :onChange="onCaseSelectChange" :options="faultIDTypeOptions" />
      <number-property label="延时1(秒)" name="delay" :value="(cas && cas.delay) || 0" :onChange="caseSet" />
      <select-property label="故障2" name="faultID2" :value="((cas && cas.faultID2) || 0)" :onChange="onCaseSelectChange" :options="faultIDTypeOptions" />
      <number-property label="延时2(秒)" name="delay2" :value="(cas && cas.delay2) || 0" :onChange="caseSet" />
      <select-property label="故障3" name="faultID3" :value="((cas && cas.faultID3) || 0)" :onChange="onCaseSelectChange" :options="faultIDTypeOptions" />
      <number-property label="延时3(秒)" name="delay3" :value="(cas && cas.delay3) || 0" :onChange="caseSet" />
      <select-property label="故障4" name="faultID4" :value="((cas && cas.faultID4) || 0)" :onChange="onCaseSelectChange" :options="faultIDTypeOptions" />
      <number-property label="延时4(秒)" name="delay4" :value="(cas && cas.delay4) || 0" :onChange="caseSet" />
    </property-group>
    <property-group title="步骤设置" :show="show > 0" :expanded="expanded">
      <static-property label="ID" name="id" :value="node && node.id" />
      <text-property v-show="show === 1" label="名称" name="name" :value="node && node.name" :onChange="normalSet" />
      <text-property v-show="show === 1" label="描述" name="tip" :multiline="true" :value="node && node.tip" :onChange="normalSet" />
      <number-property v-show="show === 1" label="分值" name="score" :value="((node && node.score) || 0)" :onChange="normalSet" />
      <select-property v-show="show === 1" label="类型" name="type" :value="((node && node.type) || 0)" :onChange="onSelectChange" :options="operTypeOptions" />
      <select-property label="前置逻辑" name="parentLogic" :value="((node && node.parentLogic) || 0)" :onChange="onSelectChange" :options="preLogicOptions" />
    </property-group>
    <property-group title="下令设置" :show="node.type === 1" :expanded="expanded">
      <text-property label="变量" name="opvar" :value="((node && node.opvar) || '')" :onChange="normalSet" />
      <number-property label="值" name="opval" :value="((node && node.opval) || 0)" :onChange="normalSet" />
    </property-group>
    <property-group title="检查设置" :show="node.type === 2" :expanded="expanded">
      <text-property label="检查变量" name="opvar" :value="(node && node.opvar) || ''" :onChange="normalSet" />
      <!-- <number-property label="检查值" name="opval" :value="node && node.opval" :onChange="normalSet" /> -->
    </property-group>
    <property-group title="现地操作设置" :show="node.type === 3" :expanded="expanded">
      <text-property label="变量" name="opvar" :value="(node && node.opvar) || ''" :onChange="normalSet" />
    </property-group>
    <property-group title="状态反馈设置" :show="node.type === 4" :expanded="expanded">
      <check-box-property label="用表达式" name="isExpression" :value="(node && node.isExpression) || false" :onChange="normalSet" />
      <text-property
        :label="(node && node.isExpression) ? '表达式':'变量'"
        name="opvar"
        :value="(node && node.opvar) || ''"
        :onChange="normalSet"
      />
      <select-property
        v-show="node && !node.isExpression"
        label="操作符"
        name="checklogic"
        :value="(node && node.checklogic) || 0"
        :onChange="onSelectChange"
        :options="checkLogicOptions"
      />
      <number-property
        v-show="node && !node.isExpression"
        :label="(node && (node.checklogic === 7 || node.checklogic === 8)) ? '比较值a' : '比较值'"
        name="opval"
        :value="((node && node.opval) || 0)"
        :onChange="normalSet"
      />
      <number-property
        v-show="node && !node.isExpression && (node.checklogic === 7 || node.checklogic === 8)"
        label="比较值b"
        name="opval2"
        :value="((node && node.opval2) || 0)"
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
import CheckBoxProperty from '@/components/property/CheckBoxProperty'

export default {
  name: 'BasicProperty',
  components: {
    PropertyGroup,
    NumberProperty,
    SelectProperty,
    TextProperty,
    StaticProperty,
    ButtonsProperty,
    CheckBoxProperty
  },
  props: {
    diagram: {
      type: Object,
      default: null
    },
    cas: {
      type: Object,
      default: null
    },
    faultItems: {
      type: Object,
      default: null
    },
    conditionItems: {
      type: Object,
      default: null
    }
  },
  events: ['save', 'dispatch'],
  data() {
    return {
      ops: [],
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
      // condIDTypeOptions: [],
      // faultIDTypeOptions: [],
      buttonSave: [
        {
          caption: '保存',
          callback: (e) => { this.$emit('save', e) }
        }
      ],
      buttonTest: [
        {
          caption: '开始',
          callback: (e) => { this.$emit('dispatch', e) }
        },
        {
          caption: '提交',
          callback: (e) => { this.$emit('commit', e) }
        }
      ],
      buttonLog: [
        {
          caption: '▶️',
          callback: (e) => { this.$emit('startLog', e) }
        },
        {
          caption: '⏹',
          callback: (e) => { this.$emit('stopLog', e) }
        }
      ],
      buttonBat: [
        {
          caption: '批量生成',
          callback: (e) => { this.$emit('batch', e) }
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
          return 0
        }
        if (!it.value.data.category) {
          return 1
        }
        if (it.value.data.category === 'End') {
          return 2
        }
      }
      return 0
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
    },
    condIDTypeOptions() {
      let options = [{
        value: 0,
        text: '无'
      }]
      for (let id in this.conditionItems) {
        options.push({
          value: parseInt(id),
          text: `${id}: ${this.conditionItems[id].name || ''}`
        })
      }
      return options
    },
    faultIDTypeOptions() {
      let options = [{
        value: 0,
        text: '无'
      }]
      for (let id in this.faultItems) {
        options.push({
          value: parseInt(id),
          text: `${id}: ${this.faultItems[id].name || ''}`
        })
      }
      return options
    }
  },
  watch: {
    _node: {
      deep: true,
      handler: function(val) {
        this.node = {
          type: 0,
          parentLogic: 0,
          isExpression: false,
          ... val
        }
      }
    }
  },
  mounted() {
    // this.loadSelectOptions()
  },
  methods: {
    normalSet(v, n, e) {
      if (this._node) {
        this.node[n] = v
        let a = this._node
        a[n] = v
        this.diagram.model.updateTargetBindings(a)
      }
    },
    onSelectChange(v, n, e) {
      v = parseInt(v)
      return this.normalSet(v, n, e)
    },
    caseSet(v, n, e) {
      if (this.cas) {
        this.cas[n] = v
      }
    },
    onCaseSelectChange(v, n, e) {
      v = parseInt(v)
      return this.caseSet(v, n, e)
    }
  }
}
</script>
