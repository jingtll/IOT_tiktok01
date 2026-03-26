<template>
  <div>
    <router-view></router-view>
    <van-tabbar v-model="active" route>
      <van-tabbar-item icon="home-o" to="/video">主页</van-tabbar-item>
      <van-tabbar-item icon="friends-o" @click="handlePublishClick">发布</van-tabbar-item>
      <van-tabbar-item icon="setting-o" to="/my">{{ isLoggedIn ? "我的" : "未登录" }}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/index'
import { useRouter } from 'vue-router'; // 获取路由实例   
const active = ref(0)
const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const handlePublishClick = () => {
  // 跳转到上传页面
  router.push('/upload')

  // 等待路由切换完成后再触发文件选择
  setTimeout(() => {
    // 调用上传页面的函数来触发文件选择器
    if (window.triggerVideoUploadFileSelect) {
      window.triggerVideoUploadFileSelect()
    }
  }, 100)
}
</script>
