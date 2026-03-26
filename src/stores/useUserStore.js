// stores/useUserStore.js - 视频模块专用用户信息 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '@/api/userApi'

// 重命名为 useProfileStore，ID 为 profile
export const useProfileStore = defineStore('profile', () => {
  const currentUser = ref(null)
  const targetUser = ref(null)

  const isFollowed = computed(() => {
    if (!currentUser.value || !targetUser.value) return false
    return targetUser.value.is_followed || false
  })

  const fetchCurrentUser = async () => {
    try {
      const res = await getUserInfo()
      currentUser.value = res
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  const setTargetUser = (user) => {
    targetUser.value = user
  }

  const updateFollowStatus = (status) => {
    if (targetUser.value) {
      targetUser.value.is_followed = status
      targetUser.value.fan_count += status ? 1 : -1
    }
  }

  return {
    currentUser,
    targetUser,
    isFollowed,
    fetchCurrentUser,
    setTargetUser,
    updateFollowStatus
  }
}, {
  persist: true
})
