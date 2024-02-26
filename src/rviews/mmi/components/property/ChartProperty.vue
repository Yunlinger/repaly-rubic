
<template>
  <property-group
    title="图表属性"
    :show="show"
    :expanded="expanded"
  >
    <template v-if="config">
      <buttons-property label="驱动代码" :buttons="btnTemplate">
      </buttons-property>
      <text-property
        v-model="config.name"
        label="图表名称"
        name="name"
      />
      <buttons-property
        label="量程设定"
        :buttons="buttonsOfyAxis"
      />
      <template v-for="(item, idx) in config.yAxis">
        <template>
          <property-group
            :key="'yAxisset_' + idx"
            :title="'量程: ' + (item.name || (idx + 1))"
            :expanded="false"
            :cusStyle="{ background: '#fff' }"
          >
            <text-property
              v-model="item.name"
              label="名称"
              :name="'name '+idx"
            />
            <number-property
              v-model="item.min"
              label="最小值"
              :name="'min '+idx"
            />
            <number-property
              v-model="item.max"
              label="最大值"
              :name="'max '+idx"
            />
            <number-property
              v-model="item.interval"
              label="刻度"
              :name="'interval '+idx"
            />
            <text-property
              v-model="item.unit"
              label="单位"
              :name="'unit '+idx"
            />
          </property-group>
        </template>
      </template>
      <buttons-property
        label="数据源"
        :buttons="buttons"
      />
      <template v-for="(item, idx) in config.vars">
        <template>
          <property-group
            :key="'varset_' + idx"
            :title="'数据源: ' + (item.desc || item.name || '')"
            :expanded="false"
            :cusStyle="{ background: '#fff' }"
          >
            <text-property
              v-model="item.name"
              label="变量名"
              :name="'name '+idx"
            />
            <text-property
              v-model="item.desc"
              label="描述"
              :name="'desc '+idx"
            />
            <color-property
              v-model="item.color"
              label="颜色"
              :name="'color '+idx"
            />
          </property-group>
        </template>
      </template>
      <number-property
        v-model="config.interval"
        label="刷新周期(s)"
      />
      <text-property
        v-model="config.table"
        label="数据表"
      />
      <checkbox-property
        v-model="config.history"
        label="历史数据"
      />
      <text-property
        v-model="config.start"
        label="开始时间"
      />
      <text-property
        v-model="config.stop"
        label="结束时间"
      />
      <text-property
        v-model="config.groupby"
        label="分组间隔"
      />
      <text-property
        v-model="config.fn"
        label="计算函数"
      />
    </template>
  </property-group>
</template>

<script>
import PropertyGroup from '@/components/property/PropertyGroup'
import ButtonsProperty from '@/components/property/ButtonsProperty'
import ColorProperty from '@/components/property/ColorProperty'
import TextProperty from '@/components/property/TextProperty'
import NumberProperty from '@/components/property/NumberProperty'
import CheckboxProperty from '@/components/property/CheckBoxProperty'
import editChart from '../ChartEditor'

export default {
  name: 'ChartProperty',
  components: {
    PropertyGroup,
    ButtonsProperty,
    ColorProperty,
    TextProperty,
    NumberProperty,
    CheckboxProperty
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
      btnTemplate: [
        {
          caption: '...',
          callback: () => { this.editChart() }
        }
      ],
      buttons: [
        {
          caption: '+',
          callback: () => { this.insertVar() }
        },
        {
          caption: '-',
          callback: () => { this.deleteVar() }
        }
      ],
      buttonsOfyAxis: [
        {
          caption: '+',
          callback: () => { this.insertYAxis() }
        },
        {
          caption: '-',
          callback: () => { this.deleteYAxis() }
        }
      ]
    }
  },
  computed: {
    config() {
      let config = {}
      if (this.page && this.page.activeObj) {
        config = this.page.activeObj.config || {}
      }
      config.vars = config.vars || []
      config.yAxis = config.yAxis || []
      return config
    },
    show() {
      if (this.page && this.page.activeObj && this.page.activeObj.type === 'chart') {
        return true
      }
      return false
    }
  },
  methods: {
    normalSet(v, n, e) {
      if (this.page.activeObj) {
        this.page.activeObj.config = this.activeObj.config || {}
        this.page.activeObj.config[n] = v
        this.page.activeObj.setCoords()
        this.page.activeObj.canvas.requestRenderAll()
      }
    },
    editChart() {
      editChart({
        config: this.config,
        callback: (v) => {
          v = {
            ... this.config,
            ... v
          }
          if (this.page.activeObj) {
            this.page.activeObj.set('config', v)
          }
        }
      })
    },
    onVarColorChange(v, n, e) {
      if (this.activeObj.config) {
        if (n.startsWith('color ')) {
          let idx = parseFloat(n.split(' ')[1])
          this.activeObj.config.vars[idx].color = v
          this.activeObj.dirty = true
          this.activeObj.canvas.requestRenderAll()
        }
      } else {
        this.normalSet(v, n, e)
      }
    },
    onVarNameChange(v, n, e) {
      if (this.activeObj.config) {
        if (n.startsWith('name ')) {
          let idx = parseFloat(n.split(' ')[1])
          this.activeObj.config.vars[idx].name = v
          this.activeObj.dirty = true
          this.activeObj.canvas.requestRenderAll()
        }
      } else {
        this.normalSet(v, n, e)
      }
    },
    onVarDescChange(v, n, e) {
      if (this.activeObj.config) {
        if (n.startsWith('desc ')) {
          let idx = parseFloat(n.split(' ')[1])
          this.activeObj.config.vars[idx].desc = v
          this.activeObj.dirty = true
          this.activeObj.canvas.requestRenderAll()
        }
      } else {
        this.normalSet(v, n, e)
      }
    },
    insertVar() {
      if (this.config) {
        this.config.vars = this.config.vars || []
        this.config.vars.push({ name: '', color: 'red' })
      }
    },
    deleteVar() {
      if (this.config && this.config.vars && this.config.vars.length >= 2) {
        this.config.vars.splice(this.config.vars.length - 1, 1)
      }
    },
    insertYAxis() {
      if (this.config) {
        this.config.yAxis = this.config.yAxis || []
        this.config.yAxis.push({ name: '温度', max: 100, min: 0, interval: 20, unit: '℃' })
      }
    },
    deleteYAxis() {
      if (this.config && this.config.yAxis && this.config.yAxis.length >= 1) {
        this.config.yAxis.splice(this.config.yAxis.length - 1, 1)
      }
    }
  }
}
</script>
