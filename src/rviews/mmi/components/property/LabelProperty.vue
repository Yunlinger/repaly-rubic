
<template>
  <property-group
    title="文本属性"
    :show="show"
    :expanded="expanded"
  >
    <text-property
      label="文本"
      name="text"
      :multiline="true"
      :value="activeObj && activeObj.text"
      :onChange="normalSet"
    />
    <color-property
      label="颜色"
      name="fill"
      :value="activeObj && activeObj.fill"
      :onChange="normalSet"
    />
    <color-property
      label="背景"
      name="backgroundColor"
      :value="activeObj && activeObj.backgroundColor"
      :onChange="normalSet"
    />
    <color-property
      label="文字背景"
      name="textBackgroundColor"
      :value="activeObj && activeObj.textBackgroundColor"
      :onChange="normalSet"
    />
    <number-property
      label="字号"
      name="fontSize"
      :value="activeObj && activeObj.fontSize"
      :onChange="normalSet"
    />
    <select-property
      label="粗细"
      name="fontWeight"
      :value="activeObj && activeObj.fontWeight"
      :onChange="normalSet"
      :options="fontWeightOptions"
    />
    <select-property
      label="样式"
      name="fontStyle"
      :value="activeObj && activeObj.fontStyle"
      :onChange="normalSet"
      :options="fontStyleOptions"
    />
    <select-property
      label="字体"
      name="fontFamily"
      :value="activeObj && activeObj.fontFamily"
      :onChange="normalSet"
      :options="fontFamilyOptions"
    />
    <select-property
      label="对齐"
      name="textAlign"
      :value="activeObj && activeObj.textAlign"
      :onChange="normalSet"
      :options="textAlignOptions"
    />
    <check-box-property
      label="底线"
      name="underline"
      :value="activeObj && activeObj.underline"
      :onChange="normalSet"
    />
    <check-box-property
      label="上线"
      name="overline"
      :value="activeObj && activeObj.overline"
      :onChange="normalSet"
    />
    <check-box-property
      label="删除线"
      name="linethrough"
      :value="activeObj && activeObj.linethrough"
      :onChange="normalSet"
    />
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import TextProperty from '@/components/property/TextProperty'
import ColorProperty from '@/components/property/ColorProperty'
import NumberProperty from '@/components/property/NumberProperty'
import SelectProperty from '@/components/property/SelectProperty'
import CheckBoxProperty from '@/components/property/CheckBoxProperty'

export default {
  name: 'LabelProperty',
  components: {
    PropertyGroup,
    TextProperty,
    ColorProperty,
    NumberProperty,
    SelectProperty,
    CheckBoxProperty
  },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expanded: true,
      fontWeightOptions: ['normal', 'bold', 400, 600, 800],
      fontStyleOptions: ['', 'normal', 'italic', 'oblique'],
      textAlignOptions: ['left', 'center', 'right', 'justify', 'justify-left', 'justify-center', 'justify-right'],
      fontFamilyOptions: [
        '',
        'Times New Roman',
        'arial',
        'times',
        'courier',
        'serif',
        'sans-serif',
        'cursive',
        'fantasy',
        'monospace',
        { text: '宋体', value: 'SimSun' },
        { text: '黑体', value: 'SimHei' },
        { text: '微软雅黑', value: 'Microsoft YaHei' },
        { text: '微软正黑体', value: 'Microsoft JhengHei' },
        { text: '新宋体', value: 'NSimSun' },
        { text: '新细明体', value: 'PMingLiU' },
        { text: '细明体', value: 'MingLiU' },
        { text: '标楷体', value: 'DFKai-SB' },
        { text: '仿宋', value: 'FangSong' },
        { text: '楷体', value: 'KaiTi' },
        { text: '仿宋_GB2312', value: 'FangSong_GB2312' },
        { text: '楷体_GB2312', value: 'KaiTi_GB2312' },
        { text: '华文细黑', value: 'STXihei' },
        { text: '华文黑体', value: 'STHeiti' },
        { text: '华文楷体', value: 'STKaiti' },
        { text: '华文宋体', value: 'STSong' },
        { text: '华文仿宋', value: 'STFangsong' }
      ]
    }
  },
  computed: {
    activeObj() {
      return this.page.activeObj
    },
    show() {
      if (this.page &&
          this.page.activeObj &&
          this.page.activeObj.isText()) {
        return true
      }
      return false
    }
  },
  methods: {
    normalSet(v, n, e) {
      if (this.activeObj) {
        this.activeObj.set(n, v)
        this.activeObj.setCoords()
        this.activeObj.canvas.requestRenderAll()
      }
    }
  }
}
</script>
