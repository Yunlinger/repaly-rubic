<template>
  <div>
    <div style="display: flex;justify-content: space-evenly;font-size: 10px;text-align: center;position: relative;top: 3px;">
      <div style="cursor:not-allowed">
        <img :src="todeskImg" style="filter: grayscale(100%);height:30px;width:30px">
        <br>
        <span>桌面监控</span>
      </div>
      <div style="cursor: not-allowed">
        <img :src="teacherdeskImg" style="filter: grayscale(100%);height:30px;width:30px">
        <br>
        <span>广播演示</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'rightSidebar',
      props: {
        info: {
          type: Object,
          default: () => ({
            id: '-',
            project: '-',
            condition: '-',
            group: '-',
            ip: ''
          })
        }
      },
      todeskImg: require('@/assets/hollysys/todesk.png'),
      gradeImg: require('@/assets/hollysys/grade.png'),
      dataclearImg: require('@/assets/hollysys/dataclear.png'),
      roleImg: require('@/assets/hollysys/role.png'),
      teacherdeskImg: require('@/assets/hollysys/teacherdesk.png'),
      datadowmImg: require('@/assets/hollysys/datadowm.png'),
      addstudentImg: require('@/assets/hollysys/addstudent.png'),
      msgImg: require('@/assets/hollysys/msg.png')
    }
  }
}
</script>

<style scoped>
.optionBox {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  justify-items: center;
  align-content: start;
}

.optionBox div {
  width: 90%;
  height: 8vh;
  border-radius: 6px;
  background-color: #697c9e;
  box-shadow: 0px 10px 0px 0px #50607d;
  transition: all .5s;
}

.opbox {
  /* display: flex; */
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  margin-bottom: 10px;
}

.opbox img{
   height: 20px;
   width: 20px;
   margin-top: 20%;
   filter: grayscale(100%);
}

.opbox span{
  font-size:10px;
  color: white;
}

</style>

