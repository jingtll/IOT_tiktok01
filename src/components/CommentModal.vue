<template>
  <van-popup
    v-model:show="innerShow"
    position="bottom"
    :style="{ height: '80%', borderRadius: '16px 16px 0 0' }"
    closeable
    close-icon-position="top-right"
    @close="handleClose"
  >
    <!-- 评论头部 -->
    <div class="comment-header">
      <h3 class="comment-title">{{ commentCount }} 条评论</h3>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" ref="commentListRef">
      <div class="comment-item" v-for="(comment, index) in commentList" :key="index">
        <!-- 用户头像 -->
        <img
          class="avatar"
          :src="comment.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
          alt="用户头像"
        />
        <!-- 评论内容 -->
        <div class="comment-content">
          <div class="user-info">
            <span class="nickname">{{ comment.nickname || '匿名用户' }}</span>
          </div>
          <div class="content-wrapper">
            <p class="content">{{ comment.content }}</p>
            <div class="comment-actions">
              <div class="like-btn" @click="handleCommentLike(comment, index)">
                <van-icon :name="comment.is_liked ? 'like' : 'like-o'" :color="comment.is_liked ? '#ff2442' : '#999'" size="24" />
                <span class="like-count">{{ comment.like_count || 0 }}</span>
              </div>
            </div>
          </div>
          <div class="comment-footer">
            <div class="comment-meta">
              <span class="time">{{ formatTime(comment.create_time) }}</span>
              <span class="location">北京</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div class="empty-comment" v-if="commentList.length === 0">
        <van-empty description="暂无评论，快来抢沙发吧~" />
      </div>
    </div>

    <!-- 发布评论输入框 -->
    <div class="comment-input-wrapper">
      <van-field
        v-model="inputContent"
        placeholder="说点什么..."
        rows="2"
        type="textarea"
        :maxlength="200"
        show-word-limit
      />
      <van-button
        class="send-btn"
        type="primary"
        @click="handleSendComment"
        @touchstart.stop.prevent="handleSendComment"
        :disabled="!inputContent.trim() || isLoading"
      >
        {{ isLoading ? '发送中...' : '发送' }}
      </van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { getVideoComments, addVideoComment, likeComment } from '../api/videoApi.js'
import { showSuccessToast, showFailToast, } from 'vant'
import { Icon as VanIcon } from 'vant'

// 接收父组件参数
const props = defineProps({
  show: { type: Boolean, default: false },
  videoId: { type: [Number, String], required: true },
  commentCount: { type: Number, default: 0 },
})
// 向父组件发送事件（包含 v-model 所需的 update:show）
const emit = defineEmits(['update:show', 'comment-add', 'close'])

// 响应式变量
const commentListRef = ref(null)
const commentList = ref([])
const inputContent = ref('')
const isLoading = ref(false)
// 🌟 关键：用内部变量代理 props.show，避免直接修改 props
const innerShow = ref(props.show)

// 格式化时间（简单版）
const formatTime = (timeStr) => {
  if (!timeStr) return '刚刚'
  const now = new Date()
  const commentTime = new Date(timeStr)
  const diff = now - commentTime
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return new Date(commentTime).toLocaleDateString()
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const res = await getVideoComments(props.videoId)
    commentList.value = res.list || []
  } catch (error) {
    console.error('获取评论列表失败', error)
    showFailToast('加载评论失败')
  }
}

// 发布评论
const handleSendComment = async () => {
  console.log('点击发送评论，输入内容：', inputContent.value) // 调试用
  const content = inputContent.value.trim()
  if (!content) {
    showFailToast('请输入评论内容')
    return
  }

  isLoading.value = true
  try {
    // 调用发布评论接口
    await addVideoComment({
      video_id: props.videoId,
      content: content,
    })

    // 发布成功：清空输入框 + 通知父组件更新数量 + 新增评论到列表顶部
    inputContent.value = ''
    emit('comment-add')
    showSuccessToast('评论发布成功')

    // 模拟新增评论（实际接口返回后用真实数据）
    commentList.value.unshift({
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg', // 实际替换为当前用户头像
      nickname: '我', // 实际替换为当前用户昵称
      content: content,
      create_time: new Date().toISOString(),
      is_liked: false,
      like_count: 0
    })

    // 滚动到顶部，显示新评论
    if (commentListRef.value) {
      commentListRef.value.scrollTop = 0
    }
  } catch (error) {
    console.error('发布评论失败', error)
    showFailToast('评论发布失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 🌟 关键：同步 props.show 到 innerShow
watch(
  () => props.show,
  (newVal) => {
    innerShow.value = newVal
  },
)

// 监听弹窗显示状态，打开时加载评论（改为监听 innerShow）
watch(
  innerShow,
  (newVal) => {
    if (newVal) {
      fetchComments()
      inputContent.value = '' // 打开弹窗清空输入框
    } else {
      emit('close') // 通知父组件弹窗关闭
    }
  },
  { immediate: true },
)

// 处理弹窗关闭（触发 v-model 更新）
const handleClose = () => {
  console.log('触发弹窗关闭') // 加打印，看控制台是否输出
  emit('update:show', false)
  innerShow.value = false // 兜底：强制关闭内部状态
}

// 处理评论点赞
const handleCommentLike = async (comment, index) => {
  // 确保 comment 有唯一的 id
  if (!comment.id) {
    comment.id = `temp_${Date.now()}_${index}`
  }
  // 确保 comment 有必要的属性
  if (comment.is_liked === undefined) {
    comment.is_liked = false
  }
  if (comment.like_count === undefined) {
    comment.like_count = 0
  }

  // 保存当前状态，用于错误恢复
  const originalIsLiked = comment.is_liked
  const originalLikeCount = comment.like_count

  // 切换点赞状态
  const newIsLiked = !originalIsLiked
  const newLikeCount = newIsLiked ? originalLikeCount + 1 : originalLikeCount - 1

  try {
    // 使用响应式更新方式
    commentList.value[index] = {
      ...comment,
      is_liked: newIsLiked,
      like_count: newLikeCount
    }

    // 调用点赞API
    await likeComment(comment.id)

    // 保存点赞状态到本地存储
    saveLikeStatus(comment.id, newIsLiked)
  } catch (error) {
    console.error('点赞操作失败', error)
    // 恢复原状态
    commentList.value[index] = {
      ...comment,
      is_liked: originalIsLiked,
      like_count: originalLikeCount
    }
    showFailToast('操作失败，请重试')
  }
}

// 保存点赞状态到本地存储
const saveLikeStatus = (commentId, isLiked) => {
  // 使用 videoId 和 commentId 组合作为键，避免不同视频的评论冲突
  const key = `${props.videoId}_${commentId}`
  const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}')
  likedComments[key] = isLiked
  localStorage.setItem('likedComments', JSON.stringify(likedComments))
}

// 加载本地存储的点赞状态
const loadLikeStatus = () => {
  const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}')
  const updatedComments = [...commentList.value]
  updatedComments.forEach((comment, index) => {
    // 确保 comment 有唯一的 id
    if (!comment.id) {
      comment.id = `temp_${Date.now()}_${index}`
    }
    // 确保 is_liked 有默认值 false
    if (comment.is_liked === undefined) {
      comment.is_liked = false
    }
    // 确保 like_count 有默认值 0
    if (comment.like_count === undefined) {
      comment.like_count = 0
    }
    // 使用 videoId 和 commentId 组合作为键
    const key = `${props.videoId}_${comment.id}`
    // 加载本地存储的状态
    if (likedComments[key] !== undefined) {
      updatedComments[index] = {
        ...comment,
        is_liked: likedComments[key]
      }
    }
  })
  // 一次性更新评论列表，避免递归更新
  commentList.value = updatedComments
}

// 监听评论列表加载完成，加载点赞状态
watch(commentList, () => {
  // 延迟执行，避免递归更新
  setTimeout(() => {
    loadLikeStatus()
  }, 0)
}, { deep: true, immediate: false })
</script>

<style scoped>
.comment-header {
  padding: 10px;
  border-bottom: 1px solid #f5f5f5;
}
.comment-title {
  font-size: 38px;
  font-weight: 600;
  text-align: center;
}
.comment-list {
  height: calc(100% - 160px);
  overflow-y: auto;
  padding: 26px;
  box-sizing: border-box;
}
.comment-item {
  display: flex;
  gap: 22px;
  margin-bottom: 40px;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}
.comment-content {
  flex: 1;
}
.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.nickname {
  font-size: 28px;
  font-weight: 400;
  color: #666;
}
.time {
  font-size: 22px;
  color: #999;
}
.content {
  font-size: 30px;
  font-weight: 540;
  color: #000;
  line-height: 1.4;
  margin: 0;
  flex: 1;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.comment-footer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.comment-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.location {
  font-size: 22px;
  color: #999;
}

.comment-actions {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.like-btn:hover {
  background-color: #f5f5f5;
}

.like-count {
  font-size: 22px;
  color: #999;
}

.like-btn.liked .like-count {
  color: #ff2442;
}
.empty-comment {
  padding: 40px 0;
  text-align: center;
}
.comment-input-wrapper {
  padding: 16px;
  border-top: 1px solid #f5f5f5;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
}
.send-btn {
  width: 100%;
  margin-top: 12px;
  height: 84px;
  border-radius: 22px;
}
</style>
