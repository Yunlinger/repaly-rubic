<template>
  <rubik-dialog
    title="搜索"
    width="980px"
    height="652px"
    :center="true"
  >
    <find :stype="stype" :skey="skey" />
  </rubik-dialog>
</template>

<script type="text/babel">
import RubikDialog from '@/components/Dialog/Wrapper'
import Find from './find'
export default {
  name: 'SearchDialog',
  components: { RubikDialog, Find },
  data() {
    return {
      stype: '',
      skey: ''
    }
  },

  methods: {
  }
}
</script>

<style scopped>

</style>
