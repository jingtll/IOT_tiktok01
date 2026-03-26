<template>
  <div class="edit-profile-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="编辑资料" class="page-nav-bar">
      <template #left>
        <van-icon name="cross" size="18" @click="$router.back()" />
      </template>
      <template #right>
        <van-button size="small" type="primary" @click="handleSubmit">
          保存
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 编辑表单 -->
    <div class="edit-form">
      <!-- 头像编辑 -->
      <van-cell-group>
        <van-cell title="头像" is-link @click="showAvatarPreview = true">
          <template #default>
            <div class="cell-avatar-container">
              <van-image
                :src="formData.avatar"
                class="cell-avatar"
                round
                fit="cover"
              />
            </div>
          </template>
        </van-cell>

        <!-- 主页背景编辑 -->
        <van-cell title="主页背景" is-link @click="showBackgroundPreview = true">
          <template #default>
            <div class="cell-background">
              <van-image
                v-if="formData.backgroundImage"
                :src="formData.backgroundImage"
                class="background-thumbnail"
                fit="cover"
              />
              <div v-else class="background-placeholder-small">
                <van-icon name="photograph" size="20" color="#ccc" />
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 表单字段 -->
      <van-form @submit="handleSubmit">
        <van-field
          v-model="formData.userName"
          name="userName"
          label="用户名"
          placeholder="请输入用户名"
          left-icon="manager"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="formData.bio"
          name="bio"
          label="个人简介"
          type="textarea"
          placeholder="请输入个人简介"
          left-icon="info-o"
          rows="3"
        />
      </van-form>
    </div>

    <!-- 头像预览弹窗 -->
    <van-popup v-model:show="showAvatarPreview" position="center" round>
      <div class="preview-popup">
        <h3>头像预览</h3>
        <div class="preview-content">
          <van-image
            :src="formData.avatar"
            class="preview-avatar"
            round
            fit="cover"
          />
        </div>
        <div class="preview-actions">
          <van-button type="default" @click="triggerFileInput">更换头像</van-button>
          <van-button type="primary" @click="showAvatarPreview = false">保存头像</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 背景预览弹窗 -->
    <van-popup v-model:show="showBackgroundPreview" position="center" round>
      <div class="preview-popup">
        <h3>背景预览</h3>
        <div class="preview-content">
          <van-image
            v-if="formData.backgroundImage"
            :src="formData.backgroundImage"
            class="preview-background"
            fit="cover"
          />
          <div v-else class="preview-background-placeholder">
            <van-icon name="photograph" size="60" color="#ccc" />
            <p>暂无背景图片</p>
          </div>
        </div>
        <div class="preview-actions">
          <van-button type="default" @click="triggerBackgroundInput">更换背景</van-button>
          <van-button type="primary" @click="showBackgroundPreview = false">保存背景</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 文件输入 -->
    <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleAvatarChange" />
    <input ref="backgroundInputRef" type="file" accept="image/*" style="display: none" @change="handleBackgroundChange" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/index'
import { updateUserInfo } from '@/api/mockApi'

const userStore = useUserStore()
const fileInputRef = ref(null)
const backgroundInputRef = ref(null)

// 预览弹窗状态
const showAvatarPreview = ref(false)
const showBackgroundPreview = ref(false)

// 表单数据
const formData = reactive({
  userName: '',
  avatar: '',
  bio: '',
  backgroundImage: ''
})

// 触发文件选择器
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 压缩图片函数
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算压缩后的尺寸
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)

      // 将 canvas 转换为 Base64
      canvas.toBlob(
        (blob) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            resolve(e.target.result)
          }
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// 处理头像上传
const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 检查文件大小（限制为 2MB）
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    showToast('图片大小不能超过 2MB')
    return
  }

  try {
    // 压缩图片
    const compressedImage = await compressImage(file, 400, 0.8)
    formData.avatar = compressedImage
  } catch (error) {
    console.error('图片压缩失败:', error)
    showToast('图片处理失败，请重试')
  }
}

// 触发背景图片选择器
const triggerBackgroundInput = () => {
  backgroundInputRef.value?.click()
}

// 处理背景图片上传
const handleBackgroundChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 检查文件大小（限制为 3MB）
  const maxSize = 3 * 1024 * 1024 // 3MB
  if (file.size > maxSize) {
    showToast('背景图片大小不能超过 3MB')
    return
  }

  try {
    // 压缩图片
    const compressedImage = await compressImage(file, 1200, 0.7)
    formData.backgroundImage = compressedImage
  } catch (error) {
    console.error('图片压缩失败:', error)
    showToast('图片处理失败，请重试')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })

    // 准备更新数据
    const updateData = {
      userName: formData.userName,
      avatar: formData.avatar,
      bio: formData.bio,
      background_image: formData.backgroundImage
    }

    // 更新用户信息
    const userId = userStore.userInfo?.userId || localStorage.getItem('user_id') || '1001'
    await updateUserInfo(userId, updateData)

    // 更新 Pinia store
    userStore.setToken(userStore.token, {
      ...userStore.userInfo,
      ...updateData
    })

    closeToast()
    showToast('保存成功')

    // 跳转回个人中心
    setTimeout(() => {
      window.history.back()
    }, 1000)
  } catch (error) {
    closeToast()
    // 处理存储空间不足的错误
    if (error.message.includes('quota') || error.message.includes('storage')) {
      showToast('存储空间不足，请尝试上传更小的图片')
    } else {
      showToast('保存失败，请重试')
    }
    console.error('保存用户信息失败:', error)
  }
}

// 组件挂载时初始化表单数据
onMounted(() => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    formData.userName = userInfo.userName || ''
    formData.avatar = userInfo.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'
    formData.bio = userInfo.bio || ''
    formData.backgroundImage = userInfo.background_image || ''
  }
})
</script>

<style scoped>
.edit-profile-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-nav-bar {
  background-color: #3296fa;
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

.page-nav-bar .van-icon {
  color: #fff;
}

.edit-form {
  padding: 20px;
  background-color: #fff;
  margin-top: 10px;
}

/* 单元格样式 */
.van-cell-group {
  margin-bottom: 20px;
}

.cell-avatar-container {
  margin-left: auto;
}

.cell-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.cell-background {
  width: 80px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  margin-left: auto;
}

.background-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

/* 预览弹窗样式 */
.preview-popup {
  width: 90%;
  max-width: 400px;
  padding: 20px 100px;
}

.preview-popup h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 36px;
  font-weight: 500;
  color: #333;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  min-height: 200px;
}

.preview-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #3296fa;
}

.preview-background {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-background-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.preview-background-placeholder p {
  margin-top: 10px;
  font-size: 14px;
  color: #999;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-actions .van-button {
  flex: 1;
}

.van-form {
  margin-top: 20px;
}

.van-field {
  margin-bottom: 16px;
}

.van-field__label {
  min-width: 80px;
  text-align: left;
  font-weight: 500;
}
</style>