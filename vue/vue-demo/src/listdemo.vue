<template>
<H3>列表渲染</H3>
<p v-for="(item,index) in names">{{ item  }}-{{ index }}</p>
<div>
  <p v-for="
    item in userinfo">{{ item }}</p>
</div>

</template>
<script>
export default{
  data(){
    return{
      names:["genshen","wuwa","kora"],
      userinfo:{
        name:'yuanshen',
        age:7,
        sex:'male'
      }
    }
  }
}

</script>
<style></style>