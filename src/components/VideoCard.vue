<template>
  <!-- 整个卡片的touch事件统一处理，所有交互都走这里 -->
  <div
    class="video-card"
    ref="cardRef"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    style="scroll-snap-align: start"
  >
    <!-- 给VideoPlayer加ref，用于调用暴露的方法 -->
    <VideoPlayer
      ref="playerRef"
      :video-url="videoInfo.video_url"
      :cover-url="videoInfo.cover_url"
      :is-in-view="isInView"
      :video-id="videoInfo.id"
      :disable-click-control="disablePlayerClick"
      @register-player="(id, instance) => emit('register-player', id, instance)"
      @play="handlePlayerPlay"
      @pause="handlePlayerPause"
    />

    <!-- 双击点赞动画 -->
    <LikeAnimation
      :show="showLikeAnim"
      :position="likeAnimPosition"
      @animation-end="showLikeAnim = false"
    />

    <!-- 底部作者信息 -->
    <div class="video-bottom-info">
      <div class="author-info">
        <van-image round width="40" height="40" :src="videoInfo.author.avatar" />
        <span class="author-name">@{{ videoInfo.author.nickname }}</span>
        <FollowButton
          :userId="videoInfo.author.id"
          :isFollowed="videoInfo.is_followed"
          @change="handleFollowChange"
          @touchstart.stop
          @touchend.stop
        />
      </div>
      <p class="video-desc">{{ videoInfo.description }}</p>
    </div>

    <!-- 右侧互动栏 -->
    <div class="video-right-actions">
      <!-- 点赞按钮：加.stop阻止冒泡，不触发父级的touch事件 -->
      <div class="action-item" @touchstart.stop.prevent="handleVideoLike">
        <van-icon
          :name="videoInfo.is_liked ? 'like' : 'like-o'"
          size="40"
          :color="videoInfo.is_liked ? '#ff2442' : '#fff'"
        />
        <span class="action-text">{{ formatCount(videoInfo.like_count) }}</span>
      </div>

      <!-- 评论按钮 -->
      <div class="action-item" @touchstart.stop.prevent="openCommentModal">
        <van-icon name="comment-o" size="40" color="#fff" />
        <span class="action-text">{{ formatCount(videoInfo.comment_count) }}</span>
      </div>

      <!-- 分享按钮 -->
      <div class="action-item" @touchstart.stop.prevent="handleShare">
        <van-icon name="share-o" size="40" color="#fff" />
        <span class="action-text">{{ formatCount(videoInfo.share_count) }}</span>
      </div>
    </div>

    <!-- VideoCard.vue 模板里的评论弹窗 -->
    <CommentModal
      v-model:show="showCommentModal"
      :video-id="videoInfo.id"
      :comment-count="videoInfo.comment_count"
      @comment-add="handleCommentAdd"
      @touchstart.stop
    />

    <!-- 分享面板 -->
    <van-share-sheet
      v-model:show="showShareSheet"
      title="分享到"
      :options="shareOptions"
      @select="onShareSelect"
      @close="onShareClose"
      closeable
      @touchstart.stop
      @touchend.stop
    />

    <!-- 右侧评论按钮（确保点击事件正确） -->
    <div class="action-btn" @touchstart.stop.prevent="openCommentModal">
      <van-icon name="comment-o" size="28" />
      <span class="count">{{ formatCount(videoInfo.comment_count) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onUnmounted, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { formatNumber } from '../utils/format.js'
import { likeVideo } from '../api/videoApi.js'
import { showSuccessToast } from 'vant'
import VideoPlayer from './VideoPlayer.vue'
import LikeAnimation from './LikeAnimation.vue'
import FollowButton from './FollowButton.vue'
import CommentModal from './CommentModal.vue'


// 接收参数
const props = defineProps({
  videoInfo: { type: Object, required: true },
})

// 事件声明
const emit = defineEmits([
  'like',
  'follow-change',
  'comment-add',
  'share-add',
  'register-player',
  'in-view',
])

// 响应式变量
const cardRef = ref(null)
const playerRef = ref(null) // 播放器ref，用于调用播放方法
const showLikeAnim = ref(false)
const showCommentModal = ref(false)
const showShareSheet = ref(false)
const isInView = ref(false)
const disablePlayerClick = ref(false)
const likeAnimPosition = ref({ x: 0, y: 0 })

// 分享选项
const shareOptions = ref([
  {
    name: '微信',
    icon: 'wechat',
  },
  {
    name: '朋友圈',
    icon: 'wechat-moments',
  },
  {
    name: '微博',
    icon: 'weibo',
  },
  {
    name: 'QQ',
    icon: 'qq',
  },
])
// 单双击判定变量
let touchTimer = null
let lastTouchTime = 0
let touchCount = 0
let touchStartX = 0
let touchStartY = 0
let playTimeout = null
let pauseTimeout = null
// 视口检测（控制自动播放/暂停）
useIntersectionObserver(
  cardRef,
  ([{ isIntersecting }]) => {
    console.log('视口状态变化:', isIntersecting, '视频ID:', props.videoInfo.id) // 加调试打印
    isInView.value = isIntersecting
  },
  { threshold: 0.8 }, // 80%进入视口才触发，符合抖音的滑动逻辑
)
// 监听 isInView 变化，通知父组件当前视频在视口
watch(isInView, async (newVal) => {
  if (newVal) {
    emit('in-view', props.videoInfo.id)
    // 先清掉之前的 pause 定时器
    if (pauseTimeout) clearTimeout(pauseTimeout)
    // 延迟 200ms 再播放，避免刚滑入又滑出
    playTimeout = setTimeout(async () => {
      if (playerRef.value && isInView.value) { // 再检查一次是否还在视口
        try {
          playerRef.value.muted = true
          await playerRef.value.play().catch(err => {
            console.error('自动播放失败:', err, '视频ID:', props.videoInfo.id)
          })
        } catch (error) {
          console.error('播放异常:', error)
        }
      }
    }, 200)
  } else {
    // 先清掉之前的 play 定时器
    if (playTimeout) clearTimeout(playTimeout)
    // 延迟 100ms 再暂停，避免短暂滑出误暂停
    pauseTimeout = setTimeout(() => {
      if (playerRef.value && !isInView.value) {
        playerRef.value.pause()
      }
    }, 100)
  }
}, { immediate: true })
// 数字格式化
const formatCount = (num) => {
  return formatNumber(num)
}

// 【核心】统一处理touchstart，区分单双击
// 【核心】touchstart：只记录坐标，不阻止默认行为
const handleTouchStart = (e) => {
  // 记录初始触摸坐标
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY

  const currentTime = new Date().getTime()
  const touchInterval = currentTime - lastTouchTime

  if (touchInterval < 300 && touchInterval > 0) {
    // 先保存双击坐标（如果是双击的话）
    const touch = e.touches[0]
    likeAnimPosition.value = { x: touch.clientX, y: touch.clientY }
    handleDoubleTouch()
    touchCount = 0
    lastTouchTime = 0
    if (touchTimer) {
      clearTimeout(touchTimer)
      touchTimer = null
    }
  } else {
    touchCount++
    lastTouchTime = currentTime
    disablePlayerClick.value = false

    if (touchTimer) clearTimeout(touchTimer)
    touchTimer = setTimeout(() => {
      if (touchCount === 1) {
        handleSingleTouch()
      }
      touchCount = 0
      lastTouchTime = 0
      touchTimer = null
    }, 300)
  }
}
const handleTouchEnd = (e) => {
  const touch = e.changedTouches[0]
  const touchEndX = touch.clientX
  const touchEndY = touch.clientY

  // 计算滑动距离
  const deltaX = Math.abs(touchEndX - touchStartX)
  const deltaY = Math.abs(touchEndY - touchStartY)

  // 🌟 关键：如果滑动距离超过 10px，判定为滑动，不执行点击逻辑
  if (deltaX > 10 || deltaY > 10) {
    // 是滑动：清空单双击定时器，不执行任何点击逻辑
    if (touchTimer) {
      clearTimeout(touchTimer)
      touchTimer = null
    }
    touchCount = 0
    lastTouchTime = 0
    return
  }

  // 是点击：阻止默认行为，避免触发浏览器默认点击
  e.preventDefault()
  e.stopPropagation()
}
// 【单击逻辑】直接调用播放器的播放/暂停切换
const handleSingleTouch = () => {
  console.log('单击：触发播放/暂停')
  playerRef.value?.playPause() // 直接调用播放器暴露的方法
}

// 【双击逻辑】只点赞，不影响播放状态
const handleDoubleTouch = () => {
  console.log('双击：触发点赞')
  disablePlayerClick.value = true
  showLikeAnim.value = true // 显示点赞动画
  // 只在未点赞时执行点赞
  if (!props.videoInfo.is_liked) {
    handleLikeOnly()
  }
  setTimeout(() => {
    disablePlayerClick.value = false
  }, 300)
}

// 点赞核心逻辑
const handleVideoLike = async () => {
  console.log('点击红心：切换点赞状态，当前状态：', props.videoInfo.is_liked)
  try {
    await likeVideo(props.videoInfo.id)
    // 只点赞，不取消
    let newIsLiked, newLikeCount
    // 🌟 关键修复：用清晰的 if-else 替代取反，避免旧值干扰
    if (props.videoInfo.is_liked) {
      // 当前已点赞 → 取消点赞
      newIsLiked = false
      newLikeCount = props.videoInfo.like_count - 1
    } else {
      // 当前未点赞 → 点赞
      newIsLiked = true
      newLikeCount = props.videoInfo.like_count + 1
    }
    const updateData = {
      id: props.videoInfo.id,
      is_liked: newIsLiked,
      like_count: newLikeCount,
    }
    emit('like', updateData)
    console.log('子组件emit数据:', updateData)
    // showSuccessToast(newIsLiked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败', error)
    showSuccessToast('操作失败，请重试')
  }
}
// 【双击专用】只点赞，不取消
const handleLikeOnly = async () => {
  try {
    await likeVideo(props.videoInfo.id)
    // 只设为true，不取消
    const newIsLiked = true
    const newLikeCount = props.videoInfo.like_count + 1

    const updateData = {
      id: props.videoInfo.id,
      is_liked: newIsLiked,
      like_count: newLikeCount,
    }
    emit('like', updateData)
    console.log('子组件emit数据:', updateData)
    // showSuccessToast('点赞成功')
  } catch (error) {
    console.error('点赞失败', error)
    showSuccessToast('操作失败，请重试')
  }
}
// 其他互动逻辑
const handleFollowChange = (newVal) => {
  emit('follow-change', {
    id: props.videoInfo.id,
    is_followed: newVal,
  })
}

// 打开评论弹窗
const openCommentModal = () => {
  showCommentModal.value = true
}

// 评论成功回调
const handleCommentAdd = () => {
  emit('comment-add', {
    id: props.videoInfo.id,
    comment_count: props.videoInfo.comment_count + 1
  })
}

const handleShare = () => {
  // 显示分享面板
  showShareSheet.value = true
}

const onShareSelect = (option) => {
  // 处理分享选择
  console.log('分享到:', option.name)
  // 增加分享计数
  const newShareCount = props.videoInfo.share_count + 1
  emit('share-add', {
    id: props.videoInfo.id,
    share_count: newShareCount,
  })
  showSuccessToast('分享成功')
  // 关闭分享面板
  showShareSheet.value = false
}

const onShareClose = () => {
  // 处理分享面板关闭
  console.log('分享面板已关闭')
  showShareSheet.value = false
}

// 播放器状态同步
const handlePlayerPlay = () => {}
const handlePlayerPause = () => {}

// 组件卸载清理定时器
onUnmounted(() => {
  if (touchTimer) clearTimeout(touchTimer)
  touchCount = 0
  lastTouchTime = 0
})
</script>

<style scoped>
.video-card {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.video-bottom-info {
  position: absolute;
  bottom: 140px;
  left: 16px;
  color: #fff;
  z-index: 10;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 8px;
}

.video-right-actions {
  position: absolute;
  bottom: 180px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  color: #fff;
  z-index: 10;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.action-text {
  margin-top: 14px;
  font-size: 30px;
}
</style>
