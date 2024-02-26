<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import engineerDashboard from './engineer'
import studentDashboard from '../student/study'
import teacherDashboard from '../teacher/dispatchs'
import * as rapi from '@/api/res'

export default {
  name: 'Dashboard',
  components: { adminDashboard, engineerDashboard, studentDashboard, teacherDashboard },
  data() {
    return {
      currentRole: ''
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  mounted() {
    this._redirect()
  },
  activated() {
    this.redirect()
  },
  methods: {
    redirect() {
      if (this.roles.length === 1 && this.roles[0] === 'student') {
        rapi.getCache('config').then(config => {
          config = config || {}
          console.log('scada: ', config.scada)
          if (config.scada && (config.scada.project && config.scada.id)) {
            this.$store.dispatch('openProject', {
              project: config.scada.project,
              model: 'model',
              id: config.scada.id
            }).then(() => {
              this.$router.push({ path: '/engineer/model/setting' })
            }).catch(() => {
              this._redirect()
            })
          } else {
            this._redirect()
          }
        }).catch(() => {
          this._redirect()
        })
      } else {
        this._redirect()
      }
    },
    _redirect() {
      if (this.roles.includes('engineer')) {
        this.currentRole = 'engineerDashboard'
        return
      } else if (this.roles.includes('admin')) {
        this.currentRole = 'adminDashboard'
        return
      } else if (this.roles.includes('teacher')) {
        this.$router.push({ path: '/hls/teacher' })
        return
      } else if (this.roles.includes('student')) {
        this.$router.push({ path: '/hls/student' })
        return
      }
    }
  }
}
</script>
