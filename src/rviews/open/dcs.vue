<script>
import screenfull from 'screenfull'
import * as papi from '@/api/project'
import * as rapi from '@/api/res'

export default {
  mounted() {
    const { query } = this.$route
    const { project } = query
    let id = '1'
    let modelOpened = false

    this.loading = this.$loading({
      lock: true,
      text: '正在进入操作画面 ... ',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.8)'
    })

    const loginData = {
      username: 'demo',
      password: 'demo'
    }
    this.$store.dispatch('user/login', loginData).then(() => {
      return papi.getServerList('Model')
    }).then(response => {
      // 处理接收数据
      response.items = response.items || {}
      for (const name in response.items) {
        const node = response.items[name]
        if (node.project === project) {
          id = node.id
          modelOpened = true
          break
        }
      }
      if (modelOpened) {
        return Promise.resolve()
      }
      this.loading.text = '正在启动实例 ...'
      return papi.startInstance(project, 'model', '自动创建')
    }).then(() => {
      // 延时 4s, 等待模型创建完成
      return new Promise((resolve, reject) => setTimeout(() => {
        this.$store.dispatch('openProject', {
          project: project,
          model: 'model',
          id: id,
          forced: true
        }).then(() => {
          return resolve()
        }).catch(() => {
          return reject()
        })
      }, modelOpened ? 10 : 4000))
    }).then(() => {
      return this.$confirm('请点击“确定”切换到全屏显示！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
    }).then(() => {
      screenfull.request()
      this.showDCS()
    }).catch((e) => {
      this.$store.dispatch('user/resetToken')
      this.$router.replace({ path: '/401' })
    }).finally(() => {
      this.loading && this.loading.close()
    })
  },
  methods: {
    showDCS() {
      rapi.open('../model/setting.json').then(config => {
        switch (config.frame) {
          case 'foxboro':
            this.$router.push({ path: '/framefull/foxboro' })
            break
          case 'default':
          case '':
          default : this.$router.push({ path: '/framefull/default' })
        }
      }).catch(() => {
        this.$router.push({ path: '/framefull/default' })
      })
    }
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
