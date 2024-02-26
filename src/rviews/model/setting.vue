<template>
  <div class="app-container">
    <el-form ref="form" :model="setting" label-width="140px">
      <el-form-item label="名称">
        <el-input v-model="setting.name"></el-input>
      </el-form-item>
      <el-form-item label="简介">
        <el-input v-model="setting.desc" type="textarea" :rows="3"></el-input>
      </el-form-item>
      <el-form-item label="驱动配置">
        <el-checkbox v-model="setting.win64driver">使用64位驱动</el-checkbox>
        <el-checkbox v-model="setting.needEleDrv">电网驱动</el-checkbox>
      </el-form-item>
      <el-form-item v-if="project.id == 'dev'" label="自动保存">
        <el-checkbox v-model="setting.autoSave">在18:30自动保存dev实例</el-checkbox>
      </el-form-item>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="画面主页">
            <el-input v-model="setting.index"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="就地主页">
            <el-input v-model="setting.jd"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="NCS主页">
            <el-input v-model="setting.ncs"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="切换设置">
        <!-- 画面设置 -->
        <div style="display: flex; align-items: center; user-select: none; flex-wrap: wrap;">
          <div v-for="item in setting.viewCache" :key="item.name" style="width: 240px;display: flex; align-items: center;">
            <el-checkbox
              :value="!item.disabled"
              :disabled="item.name === '开发'"
              @change="v => item.disabled = !v"
            >
              {{ item.name }}
            </el-checkbox>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="图标设置">
        <!-- 图标设置 -->
        <div style="display: flex; align-items: center; user-select: none;flex-wrap: wrap;">
          <div v-for="item in setting.iconList" :key="item.name" style="width: 240px;display: flex; align-items: center;">
            <el-checkbox
              :value="!item.disabled"
              :disabled="item.name === '开发'"
              @change="v => item.disabled = !v"
            >
              {{ item.name }}
            </el-checkbox>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="其他操作">
        <el-button type="primary" @click="gotoDefineBulk">定义组合变量</el-button>
        <el-button type="primary" @click="gotoLibManager">算法库管理</el-button>
        <!-- <el-button type="primary" @click="gotoImport">水科院模型文本导入</el-button> -->
        <el-button type="primary" @click="gotoSourceEditor">算法源代码</el-button>
        <el-button type="primary" @click="restartDriver">重启驱动</el-button>
        <el-button type="danger" @click="saveData">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as api from '@/api/res'
import * as mapi from '@/api/model'
import * as dapi from '@/api/driver'

export default {
  name: 'ModelSetting',
  data() {
    return {
      loaded: false,
      setting: {
        name: '',
        desc: '',
        win64driver: false,
        needEleDrv: false,
        autoSave: false
      },
      frameOptions: [{
        value: 'default',
        label: '缺省'
      }, {
        value: 'foxboro',
        label: 'foxboro'
      }],
      list: [
        { label: '禁用', value: true },
        { label: '正常', value: false }
      ],
      setCache: {}
    }
  },
  computed: {
    ...mapGetters([
      'project'
    ]),
    ...mapState({
      settings: state => state.settings,
      viewCaches: state => state.settings.viewCache,
      iconLists: state => state.settings.iconList
    })
  },
  created() {
    this.getData()
    this.$on('global:project.open', () => {
      if (!this.loaded) return
      this.getData()
    })
  },
  methods: {
    getData() {
      this.loaded = false
      // let list = []
      api.open('../model/setting.json').then(response => {
        response.viewCache = response.viewCache || this.viewCaches
        response.iconList = response.iconList || this.iconLists
        // let iconList = response.iconList || this.iconLists
        // for (let i in response.viewCache) {
        //   list.push(response.viewCache[i])
        // }
        // this.viewCache = list
        // iconList = iconList || []
        // // 将iconLists中缺少的配置加上
        // for (let item of this.iconLists) {
        //   if (!iconList.some((i) => { return i.name === item.name })) {
        //     iconList.push(item)
        //   }
        // }
        // this.iconList = iconList
        this.setting = { ...this.setting, ...(response || {}) }
      }).catch(() => {
      }).finally(() => {
        this.loaded = true
      })
    },
    saveData() {
      if (!this.loaded) {
        return
      }
      let json = this.setting
      var fd = new FormData()
      var file = new File([JSON.stringify(json, null, '  ')], 'setting.json', {
        type: 'text/plain'
      })
      fd.append('file', file)
      api.write('../model/setting.json', fd).then(async() => {
        this.viewChange()
        this.$msg('设置成功')
      }).catch(err => {
        console.log(err)
      })
    },
    viewChange() {
      const { viewCache, iconList } = this.setting
      let data = { key: 'viewCache', value: JSON.parse(JSON.stringify(viewCache)) }
      let icon = { key: 'iconList', value: JSON.parse(JSON.stringify(iconList)) }
      this.$store.dispatch('settings/changeSetting', data)
      this.$store.dispatch('settings/changeSetting', icon)
    },
    gotoLibManager() {
      this.$router.push('/engineer/alg/lib')
    },
    gotoSourceEditor() {
      this.$router.push('/engineer/alg/source')
    },
    gotoDefineBulk() {
      this.$router.push('/engineer/alg/bulk')
    },
    gotoImport() {
      this.$router.push('/engineer/model/import')
    },
    onSubmit() {
      this.saveData()
    },
    restartDriver() {
      let running = this.project.running
      mapi.modelStart(false).then(() => {
        return dapi.restart()
      }).then(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 2000)
        })
      }).then(() => {
        if (running) {
          return mapi.modelStart(running)
        }
        return Promise.resolve()
      }).then(() => {
        this.$msg('重启成功')
      }).catch(err => {
        this.$msg.error(err, '重启失败')
      })
    },
    judgeSetting(obj, objs) {
      let str = JSON.stringify(obj)
      let strs = JSON.stringify(objs)
      return str === strs
    },
    handleBeforeUnload(event) {
      this.loaded = false
      this.setting = {
        name: '',
        desc: '',
        win64driver: false,
        needEleDrv: false,
        autoSave: false
      }
      event.preventDefault()
      event.returnValue = '暂时停止'
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    padding: 8px;
    margin: 0;
  }
</style>
