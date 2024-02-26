<template>
  <div class="app-container">
    <div v-if="user">
      <el-card>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="账号信息" name="account">
            <account :user="user" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Account from './components/Account'

export default {
  name: 'Profile',
  components: { Account },
  data() {
    return {
      activeTab: 'account'
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created() {
  },
  methods: {
  }
}
</script>
