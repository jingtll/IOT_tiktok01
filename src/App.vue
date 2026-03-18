<script setup>
import { useUserStore } from '@/stores/index'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.initToken() // 从 localStorage 恢复 token
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
