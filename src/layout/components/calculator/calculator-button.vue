<template>
  <div class="button-container">
    <button v-for="(item,index) in buttonArr" :key="index" :class="index < 5 ? 'special' : 'normal'" :value="item" @click="$emit('assign',$event,item)">{{ item }}</button>
  </div>
</template>

<script>
export default {
  name: 'CalculatorButton',
  // eslint-disable-next-line vue/require-prop-types
  props: ['buttonArr']
}
</script>

<style scoped>
  .special {
		margin: 0;
    width: 20%;
    height: 37px;
    background-color: #f9f9f9;
    color: #f60;
    border: 1px solid #ebebeb;
    cursor: pointer;
  }

  .normal {
    margin: 0;
    width: 25%;
    height: 37px;
    background-color: #fff;
    border: 1px solid #ebebeb;
    color: #333;
    cursor: pointer;
  }
  .button-container {
    width: 500px;
  }
</style>
