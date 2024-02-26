
<template>
  <div>
    <property-group
      title="基本动态"
      :show="show"
      :expanded="expanded"
    >
      <expr-property
        v-show="isBasic || isGroup"
        :label="config.fcolor.label"
        name="fcolor"
        :config="config.fcolor"
        :value="dyn && dyn.fcolor"
        :onChange="normalSet"
      />
      <expr-property
        v-show="isBasic || isGroup"
        :label="config.ecolor.label"
        name="ecolor"
        :config="config.ecolor"
        :value="dyn && dyn.ecolor"
        :onChange="normalSet"
      />
      <expr-property
        v-show="isText"
        :label="config.tcolor.label"
        name="tcolor"
        :config="config.tcolor"
        :value="dyn && dyn.tcolor"
        :onChange="normalSet"
      />
      <expr-property
        v-show="isBasic || isGroup || isText"
        :label="config.bcolor.label"
        name="bcolor"
        :config="config.bcolor"
        :value="dyn && dyn.bcolor"
        :onChange="normalSet"
      />
      <expr-property
        :label="config.angle.label"
        name="angle"
        :config="config.angle"
        :value="dyn && dyn.angle"
        :onChange="normalSet"
      />
      <expr-property
        v-show="isText"
        :label="config.text.label"
        name="text"
        :config="config.text"
        :value="dyn && dyn.text"
        :onChange="normalSet"
      />
      <expr-property
        v-if="isImage"
        :label="config.rsrc.label"
        name="rsrc"
        :config="config.rsrc"
        :value="dyn && dyn.rsrc"
        :onChange="normalSet"
      />
      <expr-property
        :label="config.visible.label"
        name="visible"
        :config="config.visible"
        :value="dyn && dyn.visible"
        :onChange="normalSet"
      />
      <expr-property
        :label="config.rotate.label"
        name="rotate"
        :config="config.rotate"
        :value="dyn && dyn.rotate"
        :onChange="normalSet"
      />
      <expr-property
        v-show="isBasic"
        :label="config.flow.label"
        name="flow"
        :config="config.flow"
        :value="dyn && dyn.flow"
        :onChange="normalSet"
      />
      <expr-property
        :label="config.opacity.label"
        name="opacity"
        :config="config.opacity"
        :value="dyn && dyn.opacity"
        :onChange="normalSet"
      />
      <expr-property
        :label="config.disabled.label"
        name="disabled"
        :config="config.disabled"
        :value="dyn && dyn.disabled"
        :onChange="normalSet"
      />
    </property-group>
    <property-group
      title="填充动态"
      :show="showDynBar"
      :expanded="true"
    >
      <text-property
        label="变量名"
        name="name"
        :value="(dyn && dyn.fpct && dyn.fpct.name) || ''"
        :onChange="(v, n, e) => setBar(n, v)"
      />
      <text-property
        label="表达式"
        name="expr"
        :value="(dyn && dyn.fpct && dyn.fpct.expr) || ''"
        :onChange="(v, n, e) => setBar(n, v)"
      />
      <number-property
        label="最大值"
        name="max"
        :value="dyn && dyn.fpct && dyn.fpct.max"
        :onChange="(v, n, e) => setBar(n, v)"
      />
      <number-property
        label="最小值"
        name="min"
        :value="dyn && dyn.fpct && dyn.fpct.min"
        :onChange="(v, n, e) => setBar(n, v)"
      />
    </property-group>
    <property-group
      title="显示表达式"
      :show="showDynValue"
      :expanded="true"
    >
      <text-property
        label="表达式"
        name="expr"
        :value="(dyn && dyn.value && dyn.value.expr) || ''"
        :onChange="(v, n, e) => setShowValue(n, v)"
      />
      <text-property
        label="格式"
        name="format"
        :value="(dyn && dyn.value && dyn.value.format) || ''"
        :onChange="(v, n, e) => setShowValue(n, v)"
      />
    </property-group>
    <property-group
      title="显示数据点"
      :show="showDynValue"
      :expanded="true"
    >
      <text-property
        label="点名"
        name="name"
        :value="(dyn && dyn.point && dyn.point.name) || ''"
        :onChange="(v, n, e) => setShowPoint(n, v)"
      />
      <text-property
        label="属性名"
        name="attr"
        :value="(dyn && dyn.point && dyn.point.attr) || ''"
        :onChange="(v, n, e) => setShowPoint(n, v)"
      />
      <text-property
        label="数值格式"
        name="format"
        :value="(dyn && dyn.point && dyn.point.format) || ''"
        :onChange="(v, n, e) => setShowPoint(n, v)"
      />
      <check-box-property
        label="显示单位"
        name="showUnit"
        :value="(dyn && dyn.point && dyn.point.showUnit) || false"
        :onChange="(v, n, e) => setShowPoint(n, v)"
      />
    </property-group>
    <property-group
      title="检查"
      :show="showDynCheck"
      :expanded="false"
    >
      <text-property
        label="变量"
        name="name"
        :value="(dyn && dyn.check && dyn.check.name) || ''"
        :onChange="(v, n, e) => setDynCheck(n, v)"
      />
    </property-group>
    <property-group
      title="计算角度"
      :show="show"
      :expanded="false"
    >
      <text-property
        label="表达式"
        name="expr"
        :value="(dyn && dyn.calcAngle && dyn.calcAngle.expr) || ''"
        :onChange="(v, n, e) => setCalcAngle(n, v)"
      />
      <number-property
        label="起始值"
        name="min"
        :value="dyn && dyn.calcAngle && dyn.calcAngle.min"
        :onChange="(v, n, e) => setCalcAngle(n, v)"
      />
      <number-property
        label="起始角度"
        name="minAngle"
        :value="dyn && dyn.calcAngle && dyn.calcAngle.minAngle"
        :onChange="(v, n, e) => setCalcAngle(n, v)"
      />
      <number-property
        label="终止值"
        name="max"
        :value="dyn && dyn.calcAngle && dyn.calcAngle.max"
        :onChange="(v, n, e) => setCalcAngle(n, v)"
      />
      <number-property
        label="终止角度"
        name="maxAngle"
        :value="dyn && dyn.calcAngle && dyn.calcAngle.maxAngle"
        :onChange="(v, n, e) => setCalcAngle(n, v)"
      />
    </property-group>
    <property-group
      title="X移动"
      :show="show"
      :expanded="false"
    >
      <text-property
        label="表达式"
        name="expr"
        :value="(dyn && dyn.moveX && dyn.moveX.expr) || ''"
        :onChange="(v, n, e) => setMoveX(n, v)"
      />
      <number-property
        label="最大距离"
        name="maxDistance"
        :value="(dyn && dyn.moveX && dyn.moveX.maxDistance) || (!(dyn && dyn.moveX) && 0)"
        :onChange="(v, n, e) => setMoveX(n, v)"
      />
      <number-property
        label="最小取值"
        name="min"
        :value="dyn && dyn.moveX && dyn.moveX.min"
        :onChange="(v, n, e) => setMoveX(n, v)"
      />
      <number-property
        label="最大取值"
        name="max"
        :value="(dyn && dyn.moveX && dyn.moveX.max) || (!(dyn && dyn.moveX) && 100)"
        :onChange="(v, n, e) => setMoveX(n, v)"
      />
      <number-property
        label="动画时长(ms)"
        name="duration"
        :value="dyn && dyn.moveX && dyn.moveX.duration"
        :onChange="(v, n, e) => setMoveX(n, v)"
      />
    </property-group>
    <property-group
      title="Y移动"
      :show="show"
      :expanded="false"
    >
      <text-property
        label="表达式"
        name="expr"
        :value="(dyn && dyn.moveY && dyn.moveY.expr) || ''"
        :onChange="(v, n, e) => setMoveY(n, v)"
      />
      <number-property
        label="最大距离"
        name="maxDistance"
        :value="(dyn && dyn.moveY && dyn.moveY.maxDistance) || (!(dyn && dyn.moveY) && 0)"
        :onChange="(v, n, e) => setMoveY(n, v)"
      />
      <number-property
        label="最小取值"
        name="min"
        :value="dyn && dyn.moveY && dyn.moveY.min"
        :onChange="(v, n, e) => setMoveY(n, v)"
      />
      <number-property
        label="最大取值"
        name="max"
        :value="(dyn && dyn.moveY && dyn.moveY.max) || (!(dyn && dyn.moveY) && 100)"
        :onChange="(v, n, e) => setMoveY(n, v)"
      />
      <number-property
        label="动画时长(ms)"
        name="duration"
        :value="dyn && dyn.moveY && dyn.moveY.duration"
        :onChange="(v, n, e) => setMoveY(n, v)"
      />
    </property-group>
  </div>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import ExprProperty from '@/components/property/ExprProperty'
import TextProperty from '@/components/property/TextProperty'
import NumberProperty from '@/components/property/NumberProperty'
import CheckBoxProperty from '@/components/property/CheckBoxProperty'

export default {
  name: 'DynProperty',
  components: { PropertyGroup, ExprProperty, TextProperty, NumberProperty, CheckBoxProperty },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: true,
      config: {
        fcolor: { name: 'fcolor', label: '颜色', type: 'expr', valueType: 'color', defaultValue: '#AAAAAAFF' },
        ecolor: { name: 'ecolor', label: '线条颜色', type: 'expr', valueType: 'color', defaultValue: '#AAAAAAFF' },
        tcolor: { name: 'tcolor', label: '颜色', type: 'expr', valueType: 'color', defaultValue: '#AAAAAAFF' },
        bcolor: { name: 'bcolor', label: '背景色', type: 'expr', valueType: 'color', defaultValue: '#AAAAAAFF' },
        angle: { name: 'angle', label: '角度', type: 'expr', valueType: 'number', defaultValue: 0 },
        text: { name: 'text', label: '文本', type: 'expr', valueType: 'textarea', defaultValue: 'text' },
        rsrc: { name: 'rsrc', label: '图片', type: 'expr', valueType: 'image', defaultValue: 'default.png' },
        visible: { name: 'visible', label: '可见性', type: 'expr', valueType: 'bool', defaultValue: true },
        disabled: { name: 'disabled', label: '失效', type: 'expr', valueType: 'bool', defaultValue: true },
        rotate: { name: 'rotate', label: '旋转', type: 'expr', valueType: 'number', defaultValue: 1 },
        flow: { name: 'flow', label: '流动', type: 'expr', valueType: 'number', defaultValue: 1 },
        opacity: { name: 'opacity', label: '透明', type: 'expr', valueType: 'number', defaultValue: 1 }
      }
    }
  },
  computed: {
    dyn() {
      return (this.page.activeObj && this.page.activeObj.dyn) || {}
    },
    show() {
      if (this.page && this.page.activeObj) {
        return true
      }
      return false
    },
    showDynBar() {
      if (this.page && this.page.activeObj && this.page.activeObj.type === 'bar') {
        return true
      }
      return false
    },
    showDynValue() {
      if (this.page && this.page.activeObj && this.page.activeObj.isText()) {
        return true
      }
      return false
    },
    showDynCheck() {
      if (this.page && this.page.activeObj) {
        return true
      }
      return false
    },
    isBasic() {
      if (this.page && this.page.activeObj &&
        ['rect', 'circle', 'ellipse', 'path', 'triangle', 'polyline', 'polygon', 'bar'].indexOf(this.page.activeObj.type) > -1) {
        return true
      }
      return false
    },
    isText() {
      if (this.page && this.page.activeObj && this.page.activeObj.isText()) {
        return true
      }
      return false
    },
    isGroup() {
      if (this.page && this.page.activeObj && this.page.activeObj.type === 'group') {
        return true
      }
      return false
    },
    isImage() {
      if (this.page && this.page.activeObj &&
        (this.page.activeObj.type === 'rubik-image' || this.page.activeObj.type === 'rubik-gif')
      ) {
        return true
      }
      return false
    }
  },
  methods: {
    normalSet(v, n, e) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      this.page.activeObj.dyn[n] = v
      if (!v) {
        delete this.page.activeObj.dyn[n]
      }
    },
    setBar(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'expr' && v === '') {
        delete this.page.activeObj.dyn['fpct']
        return
      }
      this.page.activeObj.dyn['fpct'] = this.page.activeObj.dyn['fpct'] || { max: 100, min: 0 }
      this.page.activeObj.dyn['fpct'][n] = v
    },
    setShowValue(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'expr' && v === '') {
        delete this.page.activeObj.dyn['value']
        return
      }
      this.page.activeObj.dyn['value'] = this.page.activeObj.dyn['value'] || { format: '' }
      this.page.activeObj.dyn['value'][n] = v
    },
    setShowPoint(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'name' && v === '') {
        delete this.page.activeObj.dyn['point']
        return
      }
      this.page.activeObj.dyn['point'] = this.page.activeObj.dyn['point'] || { name: '', attr: '' }
      this.page.activeObj.dyn['point'][n] = v
    },
    setDynCheck(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'name' && v === '') {
        delete this.page.activeObj.dyn['check']
        return
      }
      this.page.activeObj.dyn['check'] = this.page.activeObj.dyn['check'] || { name: '' }
      this.page.activeObj.dyn['check'][n] = v
    },
    setCalcAngle(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'expr' && v === '') {
        delete this.page.activeObj.dyn['calcAngle']
        return
      }
      this.page.activeObj.dyn['calcAngle'] = this.page.activeObj.dyn['calcAngle'] || { max: 100, min: 0, maxAngle: 360, minAngle: 0 }
      this.page.activeObj.dyn['calcAngle'][n] = v
    },
    setMoveX(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'expr' && v === '') {
        delete this.page.activeObj.dyn['moveX']
        return
      }
      this.page.activeObj.dyn['moveX'] = this.page.activeObj.dyn['moveX'] || { max: 100, min: 0, maxDistance: 0 }
      this.page.activeObj.dyn['moveX'][n] = v
    },
    setMoveY(n, v) {
      if (!(this.page && this.page.activeObj)) {
        return
      }
      this.page.activeObj.dyn = this.page.activeObj.dyn || {}
      if (n === 'expr' && v === '') {
        delete this.page.activeObj.dyn['moveY']
        return
      }
      this.page.activeObj.dyn['moveY'] = this.page.activeObj.dyn['moveY'] || { max: 100, min: 0, maxDistance: 0 }
      this.page.activeObj.dyn['moveY'][n] = v
    }
  }
}
</script>
