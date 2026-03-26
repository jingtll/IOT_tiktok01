<template>
  <div class="like-animation-wrapper">
    <div
      v-if="show"
      class="like-animation"
      :style="animStyle"
      @animationend="handleAnimationEnd"
    >
      <van-icon name="like" size="80" color="#ff2442" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  // 新增：接收触摸坐标
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})
const emit = defineEmits(['animation-end'])

// 🌟 关键：根据坐标计算动画元素的样式
const animStyle = computed(() => {
  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`
  }
})

const handleAnimationEnd = () => {
  emit('animation-end')
}
</script>

<style scoped>
.like-animation-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.like-animation {
  position: absolute;
  /* 🌟 关键：让动画元素的中心点正好在触摸位置 */
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
  animation: likeSmoothAnim 0.6s cubic-bezier(0.17, 0.89, 0.32, 1.28) forwards;
}

@keyframes likeSmoothAnim {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  45% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>
