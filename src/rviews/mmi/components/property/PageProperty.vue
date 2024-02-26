
<template>
  <div>
    <property-group title="页面属性" :show="show" :expanded="true">
      <number-property
        label="宽度"
        name="width"
        :value="canvas.header && canvas.header.width"
        :onChange="handleChangeWidth"
      />
      <number-property
        label="高度"
        name="height"
        :value="canvas.header && canvas.header.height"
        :onChange="handleChangeHeight"
      />
      <color-property
        label="颜色背景"
        name="backgroundColor"
        :value="canvas.backgroundColor"
        :onChange="handleChangeBackgroundColor"
      />
      <file-property
        label="图片背景"
        name="backgroundImage"
        :value="canvas.header && canvas.header.backgroundImage"
        :onChange="handleChangeBackgroundImage"
        @more="selectImage(canvas.header && canvas.header.backgroundImage)"
      />
      <text-property
        label="备注"
        name="desc"
        :value="canvas.header && canvas.header.desc"
        :onChange="handleChangeDesc"
      />
    </property-group>
    <property-group title="初始化脚本" :show="show" :expanded="true">
      <text-property
        v-model="header.initScript"
        label="脚本"
        name="initScript"
        :multiline="true"
        :showLabel="false"
      />
    </property-group>
    <property-group title="页面参数设置" :show="show" :expanded="true">
      <buttons-property label="操作" :buttons="buttons">
      </buttons-property>
      <template v-for="(value, key) in param">
        <template>
          <text-property
            :key="key"
            :label="key"
            :name="key"
            :value="value"
            :onChange="paramSet"
          />
        </template>
      </template>
    </property-group>
  </div>
</template>

<script>
import fabric from '@/canvas'
import { getUrl } from '@/api/res'

import PropertyGroup from '@/components/property/PropertyGroup'
import TextProperty from '@/components/property/TextProperty'
import NumberProperty from '@/components/property/NumberProperty'
import ColorProperty from '@/components/property/ColorProperty'
import FileProperty from '@/components/property/ImageProperty'
import ButtonsProperty from '@/components/property/ButtonsProperty'
import ImageSelect from '@/components/ImageSelect'

export default {
  name: 'PageProperty',
  components: {
    PropertyGroup,
    TextProperty,
    NumberProperty,
    ColorProperty,
    FileProperty,
    ButtonsProperty
  },
  props: {
    page: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      ts: new Date(), // 用着计算属性的刷新判断
      buttons: [
        {
          caption: '+',
          callback: () => { this.insertParam() }
        },
        {
          caption: '-',
          callback: () => { this.deleteParam() }
        }
      ]
    }
  },
  computed: {
    canvas() {
      if (this.ts) {
        return this.page.canvas || {}
      }
      return {}
    },
    header() {
      if (this.ts) {
        return (this.page.canvas && this.page.canvas.header) || {}
      }
      return {}
    },
    param() {
      if (this.ts) {
        return this.page.canvas && this.page.canvas.param
      }
      return {}
    },
    show() {
      if (this.page.activeObj) {
        return false
      }
      return true
    }
  },
  methods: {
    normalSet(v, n) {
      this.canvas && this.canvas.set(n, v)
      this.canvas.requestRenderAll()
      this.update()
    },
    paramSet(v, n) {
      this.canvas.param = this.canvas.param || {}
      this.canvas.param[n] = v
      this.update()
    },
    headerSet(v, n) {
      this.canvas.header = this.canvas.header || {}
      this.canvas.header[n] = v
      this.canvas.requestRenderAll()
      this.update()
    },
    handleChangeDesc(v, n, e) {
      this.headerSet(v, n)
    },
    handleChangeWidth(v, n, e) {
      this.headerSet(v, n)
    },
    handleChangeHeight(v, n, e) {
      this.headerSet(v, n)
    },
    handleChangeBackgroundColor(v, n, e) {
      this.normalSet(v, n)
    },
    handleChangeBackgroundImage(v, n, e) {
      this.headerSet(v, n)
      if (v === '') {
        this.canvas.backgroundImage = null
      } else {
        var _this = this
        const imageUrl = getUrl(`image/${v}`)
        fabric.Image.fromURL(imageUrl, function(img) {
          img.set({
            scaleX: _this.canvas.header.width / img.get('width'),
            scaleY: _this.canvas.header.height / img.get('height'),
            originX: 'left',
            originY: 'top'
          })
          _this.canvas.setBackgroundImage(img, _this.canvas.requestRenderAll.bind(_this.canvas))
        })
      }
    },
    insertParam() {
      this.$prompt('请输入参数名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (this.param && this.param[value]) {
          this.$msg.warning(`${value} 已经存在！`)
        } else {
          this.page.canvas.param = this.page.canvas.param || {}
          this.page.canvas.param[value] = '参数' + value + '的缺省值'
          this.update()
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    deleteParam() {
      this.$prompt('请输入需要删除的参数名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        delete this.page.canvas.param[value]
        this.update()
      }).catch((err) => {
        console.error(err)
      })
    },
    update() {
      this.ts = new Date()
    },
    selectImage(oimg) {
      this.$rdialog(ImageSelect, {
        oimg: oimg,
        callback: (imageName) => {
          this.handleChangeBackgroundImage(imageName, 'backgroundImage')
        }
      })
    }
  }
}
</script>
