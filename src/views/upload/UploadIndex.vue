<template>
  <div class="video-upload-container">
    <!-- 1. 选择视频文件区域 -->
    <div id="selectButton">
      <!-- 主按钮：触发文件选择器，禁用状态由 uploading 控制 -->
      <van-button type="primary" round @click="triggerFileInput" :disabled="uploading">
        选择视频
      </van-button>
    </div>

    <!-- 隐藏的 file input 元素，用于实际的文件选择操作 -->
    <input ref="fileInputRef" type="file" accept="video/*" style="display: none" @change="handleFileChange" />

    <!-- 选中视频信息展示区域 -->
    <div v-if="selectedVideo" class="video-info">
      <p>文件名：{{ selectedVideo.name }}</p>
      <p>大小：{{ formatFileSize(selectedVideo.size) }}</p>

      <!-- 视频时长显示 -->
      <p v-if="videoDuration">时长：{{ formatTime(videoDuration) }}</p>

      <!-- 错误信息显示 -->
      <p v-if="error" style="color: red; margin-top: 8px;">{{ error }}</p>
    </div>

    <!-- 时间轴选择器 - 让用户自己选择封面时间点 -->
    <div v-if="showTimeline && videoDuration > 0" class="timeline-container">
      <div class="timeline-header">
        <span>选择封面时间点</span>
        <span>{{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}</span>
      </div>

      <!-- 进度条作为时间轴 -->
      <van-slider v-model="currentTime" :min="0" :max="videoDuration" @change="updateCoverAtTime"
        active-color="#1989fa">
        <template #button>
          <div class="slider-button"></div>
        </template>
      </van-slider>

      <!-- 预览区域 -->
      <div v-if="coverImage" class="cover-preview">
        <p>当前预览：</p>
        <img :src="coverImage" alt="视频封面预览" style="max-width: 100%; height: auto;" />
      </div>

      <!-- 操作按钮 -->
      <div class="timeline-actions">
        <van-button type="default" size="normal" round @click="showTimeline = false">
          取消
        </van-button>
        <van-button type="primary" size="normal" round @click="confirmCover">
          确认封面
        </van-button>
      </div>
    </div>

    <!-- 3. 视频封面预览区域 -->
    <div v-if="coverImage && !showTimeline" class="cover-preview">
      <p>封面预览：</p>
      <img :src="coverImage" alt="视频封面" style="max-width: 100%; height: auto;" />
    </div>

    <!-- 2. 上传进度显示 -->
    <van-progress v-if="uploading" :percentage="uploadProgress" stroke-width="8" color="#1989fa" />

    <!-- 用户视频列表展示区域 -->
    <div v-if="userVideos.length > 0" class="video-list-section">
      <h3>我的视频</h3>
      <div class="user-videos-grid">
        <div v-for="video in userVideos" :key="video.id" class="user-video-item">
          <div class="video-item-content" @click="openFullscreenPlayer(video)">
            <img :src="video.cover || video.cover_url" alt="视频封面" class="video-thumbnail" />
            <p class="video-title">{{ video.title }}</p>
            <p class="video-stats">点赞: {{ video.like_count }} | 评论: {{ video.comment_count }}</p>
          </div>
          <div class="delete-button" @click.stop="handleDeleteVideo(video.id)">
            <van-icon name="cross" size="20" color="#ff4444" />
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 填写视频信息表单 -->
    <van-form v-if="selectedVideo && !uploading && !showTimeline">
      <van-field v-model="title" label="视频标题" placeholder="请输入视频标题(注：必填)" left-icon="edit"
        style="--van-field-left-icon-color: blue;" />
      <van-field v-model="description" label="  视频描述" type="textarea" placeholder="请输入视频描述" left-icon="records-o"
        rows="3" />
      <div id="upLoadButton">
        <van-button type="primary" block @click="handleUpload" :loading="uploading" :disabled="!title">
          上传视频
        </van-button>
      </div>
    </van-form>

    <!-- 全屏播放器 -->
    <FullscreenVideoPlayer
      v-if="showFullscreenPlayer && selectedPlayVideo"
      v-model:show="showFullscreenPlayer"
      :video="selectedPlayVideo"
      @close="handlePlayerClose"
      @video-update="handleVideoUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { uploadVideo, addVideo, getUserVideos, deleteVideo } from '@/api/mockApi'
import FullscreenVideoPlayer from '@/components/FullscreenVideoPlayer.vue'

// 响应式状态声明
// fileInputRef: 文件选择器的 DOM 引用，用于触发点击事件
const fileInputRef = ref(null)
// selectedVideo: 当前选中的视频文件对象
const selectedVideo = ref(null)
// selectedVideoBase64: 选中视频的 Base64 编码，用于存储
const selectedVideoBase64 = ref('')
// selectedVideoBlobUrl: 选中视频的 Blob URL，用于播放
const selectedVideoBlobUrl = ref('')
// uploadProgress: 上传进度百分比 (0-100)
const uploadProgress = ref(0)
// coverImage: 视频封面图片的 Base64 数据URL
const coverImage = ref('')
// videoDuration: 视频总时长（秒）
const videoDuration = ref(0)
// currentTime: 当前选择的视频播放时间点
const currentTime = ref(0)
// showTimeline: 是否显示时间轴选择器
const showTimeline = ref(false)
// title: 视频标题（必填字段）
const title = ref('')
// description: 视频描述（可选字段）
// uploading: 上传过程中的加载状态
const uploading = ref(false)
// error: 错误信息
const error = ref('')
// userVideos: 用户的所有视频列表
const userVideos = ref([])
const description = ref('')
// 全屏播放器相关状态
const showFullscreenPlayer = ref(false)
const selectedPlayVideo = ref(null)
// 触发文件选择 - 点击按钮时激活隐藏的 file input 元素
const triggerFileInput = () => {
  // 使用可选链操作符安全地访问 ref，避免 null 引用错误
  fileInputRef.value?.click()
}

// 加载用户视频列表
const loadUserVideos = async () => {
  try {
    const userId = localStorage.getItem('user_id') || '1001' // 默认为1001
    const videos = await getUserVideos(userId)
    userVideos.value = videos
  } catch (error) {
    console.error('Failed to load user videos:', error)
  }
}

// 打开全屏播放器
const openFullscreenPlayer = (video) => {
  selectedPlayVideo.value = video
  showFullscreenPlayer.value = true
}

// 关闭播放器
const handlePlayerClose = () => {
  showFullscreenPlayer.value = false
  selectedPlayVideo.value = null
}

// 处理视频更新事件
const handleVideoUpdate = (updateData) => {
  console.log('视频更新:', updateData)
  // 更新userVideos数组中的视频数据
  const videoIndex = userVideos.value.findIndex(video => video.id === updateData.id)
  if (videoIndex !== -1) {
    // 更新视频数据
    userVideos.value[videoIndex] = {
      ...userVideos.value[videoIndex],
      ...updateData
    }
    // 如果更新的是当前选中的视频，也更新selectedPlayVideo
    if (selectedPlayVideo.value && selectedPlayVideo.value.id === updateData.id) {
      selectedPlayVideo.value = {
        ...selectedPlayVideo.value,
        ...updateData
      }
    }
  }
}

// 处理删除视频
const handleDeleteVideo = (videoId) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这个视频吗？',
  })
    .then(async () => {
      // 执行删除操作
      const success = await deleteVideo(videoId)
      if (success) {
        showToast('删除成功')
        // 刷新视频列表
        await loadUserVideos()
        // 如果当前正在播放的视频被删除，关闭播放器
        if (selectedPlayVideo.value && selectedPlayVideo.value.id === videoId) {
          handlePlayerClose()
        }
      } else {
        showToast('删除失败，请重试')
      }
    })
    .catch(() => {
      // 取消删除
      console.log('取消删除')
    })
}

// 导出函数供外部调用（用于从其他页面直接触发文件选择）
onMounted(() => {
  window.triggerVideoUploadFileSelect = triggerFileInput
  // 组件挂载时加载用户视频列表
  loadUserVideos()
})

// 处理文件选择事件 - 异步函数，包含完整验证流程
const handleFileChange = async (event) => {
  // 获取用户选择的第一个文件（兼容多选情况）
  const file = event.target.files?.[0]

  // 如果没有选择文件或选择为空，则直接返回
  if (!file) return

  // 验证文件类型：确保是视频文件（支持所有 video/* MIME 类型）
  if (!file.type.startsWith('video/')) {
    showToast('请选择视频文件')
    return
  }

  // 验证文件大小：限制不超过4MB
  const maxSize = 4 * 1024 * 1024 // 4MB
  if (file.size > maxSize) {
    showToast('视频文件大小不能超过4MB')
    return
  }

  // 读取文件为 Base64 编码，用于存储
  const videoBase64 = await readFileAsBase64(file)
  // 生成视频的 Blob URL，用于播放
  const videoBlobUrl = URL.createObjectURL(file)

  // 设置选中的视频文件到响应式状态
  selectedVideo.value = file
  // 存储视频的 Base64 编码
  selectedVideoBase64.value = videoBase64
  // 存储视频的 Blob URL
  selectedVideoBlobUrl.value = videoBlobUrl

  // 显示时间轴选择器，让用户自己选择封面时间点
  showTimeline.value = true

  // 重置状态
  coverImage.value = ''
  currentTime.value = 0
  videoDuration.value = 0

  // 异步加载视频元数据
  await loadVideoMetadata(file)
}

// 读取文件为 Base64 编码
const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

// 加载视频元数据 - 获取视频时长信息
const loadVideoMetadata = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)

      // 视频元数据加载完成后的回调
      video.onloadedmetadata = () => {
        if (!isNaN(video.duration) && video.duration > 0) {
          videoDuration.value = video.duration
          currentTime.value = Math.min(1, video.duration * 0.1) // 默认第1秒
          // 自动截取默认封面
          captureCoverAtTime(currentTime.value).then(resolve).catch(reject)
        } else {
          reject(new Error('无法获取视频时长'))
        }
      }

      video.onerror = (error) => {
        URL.revokeObjectURL(video.src)
        reject(error)
        showToast('视频加载失败')
      }

      video.ontimeout = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('视频加载超时'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 在指定时间点截取视频封面 - 返回 Promise 的异步函数
const captureCoverAtTime = (time) => {
  return new Promise((resolve, reject) => {
    try {
      const file = selectedVideo.value
      if (!file) {
        reject(new Error('未选择视频文件'))
        return
      }

      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)

      let isResolved = false

      video.onloadedmetadata = () => {
        if (!isNaN(video.duration) && video.duration > time) {
          video.currentTime = time
        } else {
          reject(new Error('时间点超出视频范围'))
        }
      }

      video.onseeked = () => {
        if (isResolved) return

        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth || 320
          canvas.height = video.videoHeight || 240

          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          coverImage.value = canvas.toDataURL('image/jpeg', 0.8)

          URL.revokeObjectURL(video.src)
          isResolved = true
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      video.onerror = (error) => {
        if (!isResolved) {
          URL.revokeObjectURL(video.src)
          reject(error)
          showToast('封面截取失败')
        }
      }

      video.ontimeout = () => {
        if (!isResolved) {
          URL.revokeObjectURL(video.src)
          reject(new Error('视频加载超时'))
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 更新当前时间点封面
const updateCoverAtTime = async (time) => {
  if (time >= 0 && time <= videoDuration.value) {
    currentTime.value = time
    await captureCoverAtTime(time)
  }
}

// 确认选择的封面
const confirmCover = () => {
  showTimeline.value = false
  showToast('已选择封面')
}

// 格式化文件大小 - 将字节数转换为易读的文件大小字符串
const formatFileSize = (bytes) => {
  // 小于1KB：直接显示字节数
  if (bytes < 1024) return `${bytes} B`

  // 小于1MB：转换为KB，保留2位小数
  else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`

  // 大于等于1MB：转换为MB，保留2位小数
  else return `${(bytes / 1048576).toFixed(2)} MB`
}

// 格式化时间 - 将秒数转换为 mm:ss 格式
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 5. 对接后端API上传 - 主要的视频上传处理函数
const handleUpload = async () => {
  // 前置验证：确保已选择视频且填写了必填标题
  if (!selectedVideo.value || !title.value) {
    showToast('请选择视频并填写标题')
    return
  }

  // 获取当前用户ID
  const userId = localStorage.getItem('user_id') || '1001' // 默认为1001

  // 清空之前的错误信息
  error.value = ''

  // 设置上传状态：开始上传，显示进度条和加载提示
  uploading.value = true
  uploadProgress.value = 0
  showLoadingToast({ message: '上传中...', forbidClick: true })

  // 模拟上传进度
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 10
    } else {
      clearInterval(progressInterval)
    }
  }, 200)

  try {
    // 构建 FormData 对象用于 multipart/form-data 上传
    const formData = new FormData()

    // 添加视频文件（主要上传内容）
    formData.append('file', selectedVideo.value)
    formData.append('userId', userId)
    formData.append('title', title.value)

    // 第一步：上传视频文件
    await uploadVideo(formData)

    // 第二步：保存视频元信息到数据库，使用 Base64 编码作为视频 URL
    const videoInfo = {
      userId: parseInt(userId),
      title: title.value,
      description: description.value,
      url: selectedVideoBase64.value, // 使用 Base64 编码
      cover: coverImage.value
    }

    const addVideoResponse = await addVideo(videoInfo)

    clearInterval(progressInterval)
    // 添加视频时长（如果存在），并四舍五入为整数
    if (videoDuration.value) {
      formData.append('duration', Math.round(videoDuration.value))
    }

    // 添加视频时长（如果存在），并四舍五入为整数
    if (videoDuration.value) {
      formData.append('duration', Math.round(videoDuration.value))
    }

    // 如果有封面和接口支持，可选追加
    if (coverImage.value) {
      const coverBlob = dataURLtoBlob(coverImage.value)
      if (coverBlob) {
        formData.append('cover', coverBlob, 'cover.jpg')
      }
    }

    // 使用后端提供的单一接口上传视频和信息
    const response = await request.post('/api/video/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      },
      timeout: 60000 // 60秒超时
    })

    closeToast()
    showToast(`上传成功🎉 视频ID：${response.id || '已成功上传'}`)

    // 刷新用户视频列表
    if (userId) {
      try {
        userVideos.value = await getUserVideos(userId)
      } catch (err) {
        console.error('获取用户视频失败:', err)
      }
    }

    resetState()

  } catch (err) {
    clearInterval(progressInterval)
    closeToast() // 关闭加载提示
    
    // 详细的错误处理和用户提示
    let errorMessage = '上传失败，请稍后重试'
    if (err.message.includes('存储失败')) {
      errorMessage = '存储空间不足，请尝试清理浏览器缓存或使用更小的视频文件'
    } else if (err.message.includes('配额')) {
      errorMessage = '存储空间配额不足，请尝试清理浏览器缓存后重新上传'
    }
    
    error.value = errorMessage
    console.error('视频上传错误详情:', err)
    showToast(errorMessage)
  } finally {
    uploading.value = false
  }
}


// 注：dataURLtoBlob 函数已移除，因为我们现在直接传递 base64 字符串作为封面

// 重置状态 - 清空所有表单和上传相关状态，准备下一次上传
const resetState = () => {
  // 重置视频文件选择状态
  selectedVideo.value = null
  // 清除视频的 Base64 编码
  selectedVideoBase64.value = ''
  // 清除视频的 Blob URL，避免内存泄漏
  if (selectedVideoBlobUrl.value) {
    URL.revokeObjectURL(selectedVideoBlobUrl.value)
    selectedVideoBlobUrl.value = ''
  }
  // 清除封面图片数据
  coverImage.value = ''
  // 清除标题输入
  title.value = ''
  // 清除描述输入
  description.value = ''
  // 重置上传进度
  uploadProgress.value = 0

  // 清空文件input的value，确保可以重新选择同一个文件
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<style scoped>
/* 视频上传容器样式 - 使用渐变色背景，固定位置以增强视觉体验 */
.video-upload-container {
  padding: 16px;
  /* min-height: 100vh; */
  height: 100%;
  /* 确保容器至少占满整个视口高度 */

  /* 背景设置：从上到下的线性渐变，从蓝色过渡到浅蓝再到米白色 */
  background: linear-gradient(to bottom, #66b3ff, #e0f0ff, #f5f0e6);
  background-attachment: fixed;
  /* 背景固定，滚动时保持不动（创建视差效果） */
}

/* 表单字段对齐样式 */
.van-form {
  margin-top: 20px;
}

.van-field {
  margin-bottom: 16px;
}

/* 文件选择按钮容器样式 - 居中布局 */
#selectButton {
  display: flex;
  justify-content: center;
  /* 水平居中子元素 */
}

/* 信息展示和预览区域的通用样式 */
.video-info,
.cover-preview {
  margin: 16px 0;
  /* 上下间距16px，无左右边距 */
  border: 1px solid white;
  /* 白色边框，增强视觉层次 */
  padding: 12px;
  /* 内边距 */
  border-radius: 8px;
  /* 圆角边框 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  /* 轻微阴影效果 */

  /* 半透明渐变背景，创造玻璃质感效果 */
  background: linear-gradient(135deg, rgba(230, 243, 255, 0.6), rgba(240, 248, 255, 0.6));
}

/* 表单字段标签对齐 */
.van-field__label {
  min-width: 80px;
  text-align: left;
  font-weight: 500;
}

/* 时间轴选择器样式 */
.timeline-container {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(230, 243, 255, 0.6), rgba(240, 248, 255, 0.6));
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}

.timeline-actions {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-top: 40px;
  margin-bottom: 80px;
}

.slider-button {
  width: 16px;
  height: 16px;
  background-color: #1989fa;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#upLoadButton {
  margin-bottom: 120px;
}

/* 视频列表样式 */
.user-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.user-video-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.video-item-content {
  width: 100%;
  height: 100%;
}

.video-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  margin: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-stats {
  font-size: 12px;
  color: #666;
  margin: 0 8px 8px;
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 68, 68, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateX(10px);
}

.user-video-item:hover .delete-button {
  opacity: 1;
  transform: translateX(0);
}

.delete-button:hover {
  background: rgba(255, 68, 68, 1);
  transform: scale(1.1) translateX(0);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}
</style>
