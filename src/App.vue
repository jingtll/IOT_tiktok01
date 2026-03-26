<script setup>
import { useUserStore } from '@/stores/index'
import { onMounted } from 'vue'
import { cleanupOldVideoData } from '@/api/mockApi'

const userStore = useUserStore()

onMounted(() => {
  userStore.initToken() // 从 localStorage 恢复 token
  cleanupOldVideoData() // 清理旧的视频数据，释放存储空间
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
