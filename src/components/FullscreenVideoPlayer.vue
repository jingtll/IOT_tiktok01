<template>
  <div v-if="showPlayer" class="fullscreen-player" @click.self="closePlayer">
    <!-- 播放器容器 -->
    <div class="player-container">
      <!-- 关闭按钮 -->
      <div class="close-btn" @click.stop="closePlayer">
        <van-icon name="cross" size="30" color="#fff" />
      </div>

      <!-- 视频卡片组件 -->
      <VideoCard
        :video-info="currentVideo"
        @like="handleLike"
        @follow-change="handleFollowChange"
        @comment-add="handleCommentAdd"
        @share-add="handleShare"
        @register-player="handleRegisterPlayer"
        @in-view="handleInView"
      />
      <VideoCard :video-info="currentVideo" @like="handleLike" @follow-change="handleFollowChange"
        @comment-add="handleCommentAdd" @share-add="handleShare" @register-player="handleRegisterPlayer"
        @in-view="handleInView" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import VideoCard from './VideoCard.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  video: {
    type: Object,
    required: true
  }
})

<<<<<<< HEAD
const emit = defineEmits(['update:show', 'close', 'video-update'])
=======
>>>>>>> parent of e824fa6 (代码的最后完善)
const emit = defineEmits(['update:show', 'close'])

const router = useRouter()
const currentVideo = ref(props.video)
const showPlayer = ref(false)

// 监听props变化
watch(() => props.show, (newVal) => {
  showPlayer.value = newVal
<<<<<<< HEAD
}, { immediate: true })
=======
})
>>>>>>> parent of e824fa6 (代码的最后完善)

watch(() => props.video, (newVideo) => {
  if (newVideo) {
    currentVideo.value = newVideo
  }
})

// 关闭播放器
const closePlayer = () => {
  showPlayer.value = false
  emit('update:show', false)
  emit('close')
}

// 处理互动事件
const handleLike = (data) => {
  console.log('点赞:', data)
  // 这里可以调用API更新数据
const handleLike = (updateData) => {
  // VideoCard组件已经处理了API调用和动画，这里只需同步状态
  if (currentVideo.value && currentVideo.value.id === updateData.id) {
    currentVideo.value.is_liked = updateData.is_liked
    currentVideo.value.like_count = updateData.like_count
  }
}

const handleFollowChange = (data) => {
  console.log('关注状态改变:', data)
}

const handleCommentAdd = (data) => {
  console.log('评论添加:', data)
}

const handleShare = (data) => {
  console.log('分享:', data)
}

const handleRegisterPlayer = (id, playerInstance) => {
  console.log('播放器注册:', id, playerInstance)
}

const handleInView = (videoId) => {
  console.log('视频进入视口:', videoId)
}
</script>

<style scoped>
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #000;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 50px;
  right: 30px;
  z-index: 10000;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

/* 隐藏VideoCard的底部信息栏，使其看起来像全屏播放器 */
::v-deep(.video-bottom-info) {
  display: none !important;
}

/* 显示右侧操作栏 */
::v-deep(.video-right-actions) {
  bottom: 100px !important;
}

/* 确保播放器占据整个屏幕 */
::v-deep(.video-card) {
  height: 100% !important;
}
</style>