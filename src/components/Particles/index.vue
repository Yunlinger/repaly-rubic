<template>
  <vue-particles
    color="#6495ED"
    shapeType="star"
    linesColor="#6495ED"
    hoverMode="grab"
    clickMode="push"
    :particleOpacity="0.8"
    :particlesNumber="70"
    :particleSize="4"
    :linesWidth="1"
    :lineLinked="true"
    :lineOpacity="0.6"
    :linesDistance="150"
    :moveSpeed="3"
    :hoverEffect="true"
    :clickEffect="true"
  />
</template>

<script>
import Vue from 'vue'
import VueParticles from 'vue-particles'
Vue.use(VueParticles)
export default {
  name: 'Particles'
}
</script>

<style>
#particles-js {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
}
</style>
