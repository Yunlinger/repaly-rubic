
<template>
  <div v-if="show">
    <template v-for="e in events">
      <template>
        <property-group
          :key="e.event"
          :title="e.label"
          :expanded="expanded"
        >
          <select-property
            label="操作类型"
            name="act"
            :page="page"
            :value="action[e.event] && action[e.event].act"
            :onChange="(v, n) => { setAction(e.event, n, v) }"
            :options="actionTypeOptions"
          />
          <template v-if="action[e.event] && action[e.event].act === 'openWindow'">
            <text-property
              label="画面"
              name="pic"
              :value="action[e.event] && action[e.event].pic"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'openPad'">
            <text-property
              label="操作端"
              name="pic"
              :value="action[e.event] && action[e.event].pic"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <template v-for="(p, key) in action[e.event].param">
              <template>
                <text-property
                  :key="key"
                  :label="key"
                  :name="key"
                  :value="p"
                  :onChange="(v, n) => { setActionParam(e.event, n, v) }"
                />
              </template>
            </template>
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'pulse'">
            <text-property
              label="变量"
              name="name"
              :value="action[e.event] && action[e.event].name"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <number-property
              label="宽度"
              name="width"
              :value="(action[e.event] && action[e.event].width) || 1000"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <text-property
              label="确认"
              name="confirm"
              :value="action[e.event] && action[e.event].confirm"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'setv'">
            <text-property
              label="变量"
              name="name"
              :value="action[e.event] && action[e.event].name"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <bool-property
              label="本地"
              name="local"
              :value="action[e.event] && action[e.event].local"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <number-property
              label="值"
              name="value"
              :value="action[e.event] && action[e.event].value"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <text-property
              label="确认"
              name="confirm"
              :value="action[e.event] && action[e.event].confirm"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'setdelta'">
            <text-property
              label="变量"
              name="name"
              :value="action[e.event] && action[e.event].name"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <number-property
              label="变化值"
              name="value"
              :value="action[e.event] && action[e.event].value"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <text-property
              label="确认"
              name="confirm"
              :value="action[e.event] && action[e.event].confirm"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'switch'">
            <text-property
              label="变量"
              name="name"
              :value="action[e.event] && action[e.event].name"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <bool-property
              label="本地"
              name="local"
              :value="action[e.event] && action[e.event].local"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <text-property
              label="确认"
              name="confirm"
              :value="action[e.event] && action[e.event].confirm"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'input'">
            <text-property
              label="变量"
              name="name"
              :value="action[e.event] && action[e.event].name"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <bool-property
              label="用输入框"
              name="inputBox"
              :value="action[e.event] && action[e.event].inputBox"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <bool-property
              label="本地变量"
              name="local"
              :value="action[e.event] && action[e.event].local"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <bool-property
              v-if="action[e.event] && action[e.event].local"
              label="字符串"
              name="isString"
              :value="action[e.event] && action[e.event].isString"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
            <bool-property
              v-if="action[e.event] && action[e.event].local"
              label="立即生效"
              name="syncValue"
              :value="action[e.event] && action[e.event].syncValue"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
          <template v-if="action[e.event] && action[e.event].act === 'script'">
            <text-property
              label="脚本"
              name="name"
              :multiline="true"
              :showLabel="false"
              :value="action[e.event] && action[e.event].name"
              :onChange="(v, n) => { setAction(e.event, n, v) }"
            />
          </template>
        </property-group>
      </template>
    </template>
  </div>
</template>

<script>
import { open } from '@/api/res'

import PropertyGroup from '@/components/property/PropertyGroup'
import TextProperty from '@/components/property/TextProperty'
import SelectProperty from '@/components/property/SelectProperty'
import NumberProperty from '@/components/property/NumberProperty'
import BoolProperty from '@/components/property/CheckBoxProperty'

export default {
  name: 'ActionProperty',
  components: { PropertyGroup, TextProperty, SelectProperty, NumberProperty, BoolProperty },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      ts: new Date(),
      expanded: true,
      events: [{
        event: 'mousedown',
        label: '鼠标按下'
      }, {
        event: 'mouseup',
        label: '鼠标抬起'
      }, {
        event: 'mouseover',
        label: '鼠标移入'
      }, {
        event: 'mouseout',
        label: '鼠标移出'
      }, {
        event: 'mousedblclick',
        label: '鼠标双击'
      }],
      actionTypeOptions: [
        '',
        { text: '切换画面', value: 'openWindow' },
        { text: '打开操作端', value: 'openPad' },
        { text: '关闭操作端', value: 'closePad' },
        { text: '发送脉冲', value: 'pulse' },
        { text: '设固定值', value: 'setv' },
        { text: '数值变化', value: 'setdelta' },
        { text: '取反', value: 'switch' },
        { text: '手动输入', value: 'input' },
        { text: '脚本', value: 'script' }
      ]
    }
  },
  computed: {
    action() {
      if (this.ts) {
        return (this.page.activeObj && this.page.activeObj.action) || {}
      }
      return (this.page.activeObj && this.page.activeObj.action) || {}
    },
    show() {
      if (this.page && this.page.activeObj) {
        return true
      }
      return false
    }
  },
  methods: {
    refreshTs() {
      this.ts = new Date()
    },
    setAction(e, n, v) {
      this.refreshTs()
      if (this.page.activeObj) {
        if (n === 'act' && v === '') {
          delete this.page.activeObj.action[e]
        } else {
          this.page.activeObj.action = this.page.activeObj.action || {}
          this.page.activeObj.action[e] = this.page.activeObj.action[e] || {}
          this.page.activeObj.action[e][n] = v

          // openPad 改变 pic 时读取面板参数
          if (this.page.activeObj.action[e].act === 'openPad' && n === 'pic') {
            if (v === '') {
              delete this.page.activeObj.action[e].param
            } else {
              open('mmi/' + v + '.json', true).then(res => {
                let oldParam = this.page.activeObj.action[e].param
                this.page.activeObj.action[e].param = res.param
                for (let k in this.page.activeObj.action[e].param) {
                  // 同名参数使用原来的值
                  this.page.activeObj.action[e].param[k] = oldParam[k] || this.page.activeObj.action[e].param[k]
                }
                this.refreshTs()
              }).catch(e => {
              })
            }
          }
        }
        return
      }
    },
    setActionParam(e, n, v) {
      this.refreshTs()
      if (this.page.activeObj) {
        if (n === 'act' && v === '') {
          delete this.page.activeObj.action[e]
        } else {
          this.page.activeObj.action = this.page.activeObj.action || {}
          this.page.activeObj.action[e] = this.page.activeObj.action[e] || {}
          this.page.activeObj.action[e].param = this.page.activeObj.action[e].param || {}
          this.page.activeObj.action[e].param[n] = v
        }
        return
      }
    }
  }
}
</script>
