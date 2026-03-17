<template>
  <van-button
    round
    size="small"
    :type="isFollowed ? 'default' : 'danger'"
    @click="handleFollow"
  >
    {{ isFollowed ? '已关注' : '+ 关注' }}
  </van-button>
</template>

<script setup>
import { showSuccessToast, showFailToast } from 'vant'

const props = defineProps({
  isFollowed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const handleFollow = async () => {
  try {
    const newStatus = !props.isFollowed
    // 模拟关注操作
    showSuccessToast(newStatus ? '关注成功' : '已取消关注')
    // 触发change事件
    emit('change', newStatus)
  } catch (error) {
    console.error('关注操作失败', error)
    showFailToast('操作失败')
  }
}
</script>
