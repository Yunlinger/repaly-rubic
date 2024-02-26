
<template>
  <div
    style="
      height: 100%;
      width: 100%;
      overflow: hidden;
      margin: 0px;
      background-color: rgb(82, 86, 89);
    "
  >
    <embed
      style="position: absolute; left: 0; top: 0"
      width="100%"
      height="100%"
      :src="url"
      type="application/pdf"
    />
  </div>
</template>

<script>
import * as ioapi from '@/api/minio'
export default {
  name: 'DocView',
  data() {
    return {
      url: ioapi.getUrl('documents', 'doc/Ovation-Graphics-Language-Manual-R3_1120.pdf')
    }
  }
}
</script>

<style type="text/css">

</style>
