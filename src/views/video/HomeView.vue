<template>
  <div class="home-view">

    <!-- 🌟 关键：只有第一个视频时才启用下拉刷新 -->
    <van-pull-refresh
      v-model="loading"
      :disabled="!isFirstVideo"
      @refresh="onRefresh"
    >
      <div class="video-feed-wrapper" ref="feedWrapper">
        <VideoCard
          v-for="video in videoList"
          :key="video.id"
          :video-info="video"
          @like="handleVideoLike"
          @follow-change="handleFollowChange"
          @comment-add="handleCommentAdd"
          @share-add="handleShareAdd"
          @register-player="registerPlayer"
          @in-view="handleVideoInView"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getVideoFeed } from '@/api/videoApi'
import VideoCard from '@/components/VideoCard.vue'
import { showSuccessToast } from 'vant'
import 'vant/es/toast/style'

const feedWrapper = ref(null)
const videoList = ref([])
const playerMap = new Map()
const loading = ref(false)
const currentVideoId = ref(null)

// 🌟 关键：计算属性，判断当前在视口的是不是第一个视频
const isFirstVideo = computed(() => {
  // 兜底：如果还没收到当前视频ID，默认启用刷新（第一个视频刚加载时的场景）
  if (!currentVideoId.value) return true
  if (!videoList.value.length) return false
  // 宽松对比，避免数字/字符串类型不一致导致匹配失败
  return videoList.value[0].id == currentVideoId.value
})

// 注册播放器实例
const registerPlayer = (videoId, playerInstance) => {
  playerMap.set(videoId, playerInstance)
  console.log('注册播放器实例:', videoId)
}

// 处理视频进入视口
const handleVideoInView = (videoId) => {
  currentVideoId.value = videoId
  console.log('当前在视口的视频:', videoId)
}

// 获取视频列表
const fetchVideoList = async () => {
  try {
    const res = await getVideoFeed()
    videoList.value = res.list
  } catch (error) {
    console.error('获取视频列表失败', error)
  }
}

// 下拉刷新处理函数
const onRefresh = async () => {
  console.log('触发下拉刷新')
  try {
    await fetchVideoList()
    playerMap.clear()
    showSuccessToast('刷新成功')
  } catch (error) {
    console.error('刷新失败', error)
  } finally {
    loading.value = false
    setTimeout(() => {
      if (currentVideoId.value && playerMap.has(currentVideoId.value)) {
        const player = playerMap.get(currentVideoId.value)
        player?.play()
        console.log('刷新完成，自动播放视频:', currentVideoId.value)
      }
    }, 500)
  }
}

// 处理点赞状态更新
const handleVideoLike = (updateData) => {
  const index = videoList.value.findIndex(item => item.id === updateData.id)
  if (index === -1) return
  videoList.value[index] = {
    ...videoList.value[index],
    is_liked: updateData.is_liked,
    like_count: updateData.like_count
  }
}

// 处理关注状态更新
const handleFollowChange = (data) => {
  const index = videoList.value.findIndex(item => item.id === data.id)
  if (index !== -1) {
    videoList.value[index] = {
      ...videoList.value[index],
      is_followed: data.is_followed
    }
  }
}

// 处理评论数更新
const handleCommentAdd = (data) => {
  const index = videoList.value.findIndex(item => item.id === data.id)
  if (index !== -1) {
    videoList.value[index] = {
      ...videoList.value[index],
      comment_count: data.comment_count
    }
  }
}

// 处理分享数更新
const handleShareAdd = (data) => {
  const index = videoList.value.findIndex(item => item.id === data.id)
  if (index !== -1) {
    videoList.value[index] = {
      ...videoList.value[index],
      share_count: data.share_count
    }
  }
}

// 挂载时获取数据
onMounted(() => {
  fetchVideoList()
})
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.home-view :deep(.van-pull-refresh) {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.video-feed-wrapper {
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: y mandatory;
}
.video-feed-wrapper::-webkit-scrollbar {
  display: none;
}
</style>
