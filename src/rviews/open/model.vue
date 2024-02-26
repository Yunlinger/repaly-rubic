<script>

export default {
  created() {
    const { query } = this.$route
    const { project } = query

    const loginData = {
      username: 'demo',
      password: 'demo'
    }
    this.$store.dispatch('user/login', loginData).then(() => {
      this.$store.dispatch('openProject', {
        project: project,
        model: 'model',
        id: '0'
      })
      this.$router.push({ path: '/engineer/model/explorer' })
    }).catch(() => {})
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
