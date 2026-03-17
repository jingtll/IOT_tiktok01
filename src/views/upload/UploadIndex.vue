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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import axios from 'axios'
import request from '../../utils/request'

// 响应式状态声明
// fileInputRef: 文件选择器的 DOM 引用，用于触发点击事件
const fileInputRef = ref(null)
// selectedVideo: 当前选中的视频文件对象
const selectedVideo = ref(null)
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
const description = ref('')
// 触发文件选择 - 点击按钮时激活隐藏的 file input 元素
const triggerFileInput = () => {
  // 使用可选链操作符安全地访问 ref，避免 null 引用错误
  fileInputRef.value?.click()
}

// 导出函数供外部调用（用于从其他页面直接触发文件选择）
onMounted(() => {
  window.triggerVideoUploadFileSelect = triggerFileInput
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

  // 设置选中的视频文件到响应式状态
  selectedVideo.value = file

  // 显示时间轴选择器，让用户自己选择封面时间点
  showTimeline.value = true

  // 重置状态
  coverImage.value = ''
  currentTime.value = 0
  videoDuration.value = 0

  // 异步加载视频元数据
  await loadVideoMetadata(file)
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
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    showToast('请先登录后再上传视频')
    uploading.value = false
    return
  }

  // 设置上传状态：开始上传，显示进度条和加载提示
  uploading.value = true
  uploadProgress.value = 0
  showLoadingToast({ message: '上传中...', forbidClick: true })

  try {
    // 构建 FormData 对象用于 multipart/form-data 上传
    const formData = new FormData()

    // 添加视频文件（主要上传内容）
    formData.append('file', selectedVideo.value)
    formData.append('userId', userId)
    formData.append('title', title.value)

    // 如果有封面和接口支持，可选追加
    if (coverImage.value) {
      const coverBlob = dataURLtoBlob(coverImage.value)
      if (coverBlob) {
        formData.append('cover', coverBlob, 'cover.jpg')
      }
    }

    // 发送 POST 请求到后端 API，支持上传进度跟踪
    const videoUrl = await request.post('/api/video/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    closeToast()
    showToast(`上传成功🎉 视频地址：${videoUrl || '已成功上传'}`)
    resetState()

  } catch (error) {
    closeToast() // 关闭加载提示
    console.error('视频上传错误详情:', error)
    showToast(`上传失败：${error.message || '请稍后重试'}`)
  } finally {
    uploading.value = false
  }
}

// Base64转Blob（用于上传封面）- 将图片数据URL转换为二进制文件
const dataURLtoBlob = (dataurl) => {
  // 输入验证：检查数据URL格式是否有效
  if (!dataurl || !dataurl.includes(',')) {
    console.warn('Invalid data URL format')
    return null
  }

  try {
    // 分割数据URL：第一部分是MIME类型，第二部分是Base64编码的数据
    const arr = dataurl.split(',')

    // 提取MIME类型信息（如 image/jpeg, image/png）
    const mimeMatch = arr[0].match(/:(.*?);/)
    if (!mimeMatch) {
      throw new Error('Invalid MIME type in data URL')
    }

    const mime = mimeMatch[1]

    // Base64解码：将Base64字符串转换为原始字节
    const bstr = atob(arr[1])
    let n = bstr.length

    // 创建Uint8Array来存储二进制数据
    const u8arr = new Uint8Array(n)

    // 逐个字符转换Base64到原始字节
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    // 返回Blob对象，可用于HTTP上传
    return new Blob([u8arr], { type: mime })
  } catch (error) {
    console.error('Error converting dataURL to blob:', error)
    return null // 转换失败时返回null
  }
}

// 重置状态 - 清空所有表单和上传相关状态，准备下一次上传
const resetState = () => {
  // 重置视频文件选择状态
  selectedVideo.value = null
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
</style>