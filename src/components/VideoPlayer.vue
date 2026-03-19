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
  videoId: { type: [String, Number], required: true }
})

const emit = defineEmits(['play', 'pause', 'register-player'])

const playerRef = ref(null)
const playerContainer = ref(null)
const isPlaying = ref(false)
let player = null

// 初始化播放器
const initPlayer = () => {
  if (!playerRef.value || player) return // 避免重复初始化

  player = new Player({
    el: playerRef.value,
    url: props.videoUrl,
    poster: props.coverUrl,
    width: '100%',
    height: '100vh',
    playsinline: true,
    autoplay: true,
    muted: true,
    preload: 'metadata',
    loop: true,
    controls: false,
    clickPause: false,
    doubleClickPause: false,
    disableSwipe: true,
    ignores: [
      'progress', 'time', 'volume', 'fullscreen', 'play', 'pause',
      'poster', 'error', 'loading', 'replay', 'playbackRate'
    ],
    touchIgnore: true,
    preventDefault: true,
  })

  // 注册实例给父组件
  emit('register-player', props.videoId, player)

  // 【关键修复2：禁用播放器内部video元素的所有点击事件】
  const videoEl = player.video
  if (videoEl) {
    // Avoid potential cache operation errors by setting safe attributes
    videoEl.crossOrigin = 'anonymous'
    videoEl.preload = 'metadata'
    videoEl.setAttribute('playsinline', '')
    videoEl.setAttribute('webkit-playsinline', '')

    videoEl.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    videoEl.addEventListener('touchstart', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }

  player.on('error', (err) => {
    console.error('xgplayer playback error', err)
  })

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
// 对外暴露控制方法
const play = () => {
  if (player) {
    player.muted = true // 强制静音
    return player.play().catch(err => {
      console.warn('play() 调用失败:', err)
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
    player.play()
  }
}

defineExpose({ play, pause, playPause })

// 视口检测
watch(() => props.isInView, (newVal) => {
  if (!player) return
  if (newVal) {
    player.play()
  } else {
    player.pause()
  }
}, { immediate: true })

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
  /* 关键：让容器不拦截事件，完全交给父级VideoCard处理 */
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
