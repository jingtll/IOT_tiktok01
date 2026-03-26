<template>
  <div class="video-player-container" ref="playerContainer" :data-id="videoId">
    <!-- 播放器容器：完全不处理事件，只做渲染 -->
    <div id="xgplayer-container" ref="playerRef"></div>

    <!-- 暂停遮罩：完全不拦截事件 -->
    <div class="pause-mask" v-if="!isPlaying">
      <van-icon name="play-circle" size="60" color="#fff" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, defineExpose } from 'vue'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

const props = defineProps({
  videoUrl: { type: String, required: true },
  coverUrl: { type: String, required: true },
  isInView: { type: Boolean, default: false },
  videoId: { type: [String, Number], required: true },
  disableClickControl: { type: Boolean, default: false }
})

const emit = defineEmits(['play', 'pause', 'register-player'])

const playerRef = ref(null)
const playerContainer = ref(null)
const isPlaying = ref(false)
let player = null

// 初始化播放器
const initPlayer = () => {
  if (!playerRef.value || player) return // 避免重复初始化

  // 确保视频 URL 有效
  let validVideoUrl = props.videoUrl || '/src/assets/VID20260310085246.mp4'

  // 检查是否是Base64编码的视频
  if (validVideoUrl && validVideoUrl.startsWith('data:')) {
    // Base64编码的视频数据，直接使用
    console.log('使用Base64编码的视频数据')
  }

  player = new Player({
    el: playerRef.value,
    url: validVideoUrl,
    poster: props.coverUrl,
    width: '100%',
    height: '100vh',
    playsinline: true,
    autoplay: false,
    muted: true,
    loop: true,
    controls: false,
    clickPause: false, // 禁用点击暂停/播放
    doubleClickPause: false, // 禁用双击暂停/播放
    disableSwipe: true, // 禁用滑动交互
    // 禁用所有非必要的交互插件，只保留核心播放能力
    ignores: [
      'progress', 'time', 'volume', 'fullscreen', 'play', 'pause',
      'poster', 'error', 'loading', 'replay', 'playbackRate'
    ],
    // 禁止播放器拦截任何触摸/点击事件
    touchIgnore: true,
    preventDefault: true,
  })

  // 添加错误处理
  player.on('error', (error) => {
    console.error('播放器错误:', error)
    // 如果视频加载失败，使用默认视频 URL
    if (player.src !== '/src/assets/VID20260310085246.mp4') {
      player.src = '/src/assets/VID20260310085246.mp4'
    }
  })

  // 注册实例给父组件
  emit('register-player', props.videoId, player)
  const videoEl = player.video
  if (videoEl) {
    videoEl.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    videoEl.addEventListener('touchstart', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }

  // 同步播放状态
  player.on('play', () => {
    isPlaying.value = true
    emit('play')
  })

  player.on('pause', () => {
    isPlaying.value = false
    emit('pause')
  })
}

// 对外暴露控制方法
const play = () => {
  if (player) {
    player.muted = true
    return player.play().catch(err => {
      console.warn('play() 调用失败:', err)
      // 如果播放失败，尝试使用默认视频 URL
      if (player.src !== '/src/assets/VID20260310085246.mp4') {
        player.src = '/src/assets/VID20260310085246.mp4'
        return player.play()
      }
    })
  }
}

const pause = () => {
  if (player) player.pause()
}
const playPause = () => {
  if (!player) return
  if (isPlaying.value) {
    player.pause()
  } else {
    play()
  }
}

defineExpose({ play, pause, playPause })

// 视口检测
watch(() => props.isInView, (newVal) => {
  if (!player) return
  if (newVal) {
    play()
  } else {
    player.pause()
  }
}, { immediate: true })

// 监听视频 URL 变化
watch(() => props.videoUrl, (newVal) => {
  if (!player) return
  // 确保视频 URL 有效
  let validVideoUrl = newVal || '/src/assets/VID20260310085246.mp4'

  // 检查是否是Base64编码的视频
  if (validVideoUrl && validVideoUrl.startsWith('data:')) {
    // Base64编码的视频数据，直接使用
    console.log('使用Base64编码的视频数据')
  }

  if (player.src !== validVideoUrl) {
    player.src = validVideoUrl
  }
})

onMounted(() => {
  setTimeout(() => initPlayer(), 100)
})

onUnmounted(() => {
  if (player) {
    player.destroy()
    player = null
  }
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  height: 100%;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  pointer-events: none;
}

.video-player-container :deep(.xgplayer) {
  pointer-events: none;
}

.video-player-container :deep(.xgplayer-video) {
  pointer-events: none;
}

.pause-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 5;
  pointer-events: none;
}
</style>
