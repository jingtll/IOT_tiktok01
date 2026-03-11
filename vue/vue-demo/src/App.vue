<script>
import Ifdemo from './ifdemo.vue';
import Listdemo from './listdemo.vue';
import listdemo from './listdemo.vue';
import eventdemo from './eventdemo.vue';
export default{
  components: { Ifdemo, Listdemo,eventdemo },
  data(){
    return{
      msg:'active',
      isButtonDisabled:false,
       flag:0,
      Objecta:{
        class:'appclass',
        id:"appid",
       
      }

    }
  }
}
</script>
<template>
  <div v-if="flag">你能看见吗</div>
  <div v-else>看不见</div>
  <div v-bind:class="msg">taste</div>
  <div v-bind="Objecta">测试</div>
  <h1>You did it!</h1>
  <button :disabled="isButtonDisabled">按钮</button>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <Ifdemo />
  <Listdemo/>
  <eventdemo/>
  <
</template>

<style>
.active{
  color: red;
  
}</style>
