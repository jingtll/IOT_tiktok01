<script>
export default{
  data(){
    return{
      count:0
    }
  },
  methods:{
    addCount(){
      console.log("点击了"),
      this.count++
    }
  }
}
</script>
<template>
<button @click="addCount">Add</button>
<p>{{ count }}</p>
</template>
<style></style>