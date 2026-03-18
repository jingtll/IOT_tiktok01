import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getVideoList } from '@/api/videoApi'

// 定义视频store
export const useVideoStore = defineStore('video', () => {
  // 状态定义
  const videoList = ref([]) // 视频列表数据
  const currentVideoId = ref('') // 当前正在播放的视频ID
  const page = ref(1) // 分页页码
  const hasMore = ref(true) // 是否还有更多数据

  // 方法：获取视频列表
  const fetchVideoList = async (isRefresh = false) => {
    // 刷新时重置分页
    if (isRefresh) {
      page.value = 1
      videoList.value = []
      hasMore.value = true
    }
    if (!hasMore.value) return

    try {
      const res = await getVideoList({
        page: page.value,
        size: 10, // 每页10条数据
      })
      // 拼接数据
      videoList.value = isRefresh ? res.list : [...videoList.value, ...res.list]
      // 判断是否还有更多
      hasMore.value = res.list.length === 10
      // 页码+1
      page.value += 1
    } catch (error) {
      console.error('获取视频列表失败', error)
    }
  }

  // 方法：设置当前播放的视频ID
  const setCurrentVideoId = (id) => {
    currentVideoId.value = id
  }

  // 方法：更新视频点赞状态
  const updateVideoLike = (videoId, isLiked, likeCount) => {
    const video = videoList.value.find((item) => item.id === videoId)
    if (video) {
      video.is_liked = isLiked
      video.like_count = likeCount
    }
  }

  // 方法：更新视频评论数
  const updateVideoCommentCount = (videoId, addCount = 1) => {
    const video = videoList.value.find((item) => item.id === videoId)
    if (video) {
      video.comment_count += addCount
    }
  }

  // 暴露状态和方法
  return {
    videoList,
    currentVideoId,
    hasMore,
    fetchVideoList,
    setCurrentVideoId,
    updateVideoLike,
    updateVideoCommentCount,
  }
})
