<template>
  <div v-if="props.show" class="fullscreen-player" @click.self="closePlayer">
    <!-- 播放器容器 -->
    <div class="player-container">
      <!-- 关闭按钮 -->
      <div class="close-btn" @click.stop="closePlayer">
        <van-icon name="cross" size="30" color="#fff" />
      </div>

      <!-- 视频卡片组件 -->
      <VideoCard
        v-if="props.video"
        :video-info="props.video"
        :is-in-view="true"
        @like="handleLike"
        @comment-add="handleCommentAdd"
        @share-add="handleShare"
        @register-player="handleRegisterPlayer"
        @in-view="handleInView"
      />
    </div>
  </div>
</template>

<script setup>
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

const emit = defineEmits(['update:show', 'close', 'video-update'])

// 关闭播放器
const closePlayer = () => {
  emit('update:show', false)
  emit('close')
}

// 处理互动事件
const handleLike = (data) => {
  console.log('点赞:', data)
  // 通过emit事件通知父组件更新视频数据
  emit('video-update', data)
  // 这里可以调用API更新数据
}

const handleCommentAdd = (data) => {
  console.log('评论添加:', data)
  // 通过emit事件通知父组件更新视频数据
  emit('video-update', data)
}

const handleShare = (data) => {
  console.log('分享:', data)
  // 通过emit事件通知父组件更新视频数据
  emit('video-update', data)
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

/* 调整右侧操作栏位置，适应全屏模式 */
::v-deep(.video-right-actions) {
  bottom: 180px !important;
}

/* 确保播放器占据整个屏幕 */
::v-deep(.video-card) {
  height: 100% !important;
}

/* 确保底部信息栏在全屏模式下显示 */
::v-deep(.video-bottom-info) {
  z-index: 10 !important;
}

/* 确保作者信息在全屏模式下清晰可见 */
::v-deep(.author-info) {
  z-index: 10 !important;
}

/* 确保视频描述在全屏模式下清晰可见 */
::v-deep(.video-desc) {
  z-index: 10 !important;
}
</style>
