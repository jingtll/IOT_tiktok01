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
import { defineProps, defineEmits } from 'vue'
import { followUser, unfollowUser } from '../api/videoApi.js'
import { showSuccessToast, showFailToast } from 'vant'

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  },
  isFollowed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const handleFollow = async () => {
  try {
    if (props.isFollowed) {
      await unfollowUser(props.userId)
      emit('change', false)
      showSuccessToast('已取消关注')
    } else {
      await followUser(props.userId)
      emit('change', true)
      showSuccessToast('关注成功')
    }
  } catch (error) {
    console.error('关注操作失败', error)
    showFailToast('操作失败')
  }
}
</script>
