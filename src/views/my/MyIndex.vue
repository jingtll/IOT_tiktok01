<template>
  <div class="my-container no-rem">
    <!-- 未登录状态：显示登录按钮 -->
    <div v-if="!isLoggedIn" class="header not-login">
      <div class="login-btn" @click="$router.push('/login')">
        <img class="mobile-img" src="../../assets/111.webp" alt="" />
        <span class="text">注册 / 登录</span>
      </div>
    </div>

    <!-- 已登录状态：显示用户信息和数据统计 -->
    <div v-else class="user-info-container">
      <div class="header user-info" :style="{ background: userBackgroundImage }">
        <div class="base-info">
          <div class="left">
            <!-- 圆形头像 -->
            <van-image :src="userAvatar" class="avatar" round fit="cover" />
            <!-- 用户名 -->
            <span class="name">{{ userName }}</span>
          </div>
        </div>
      </div>

      <!-- 数据统计区 -->
      <div class="data-stats">
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">获赞</span>
        </div>
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">互关</span>
        </div>
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">关注</span>
        </div>
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">粉丝</span>
        </div>
        <div class="right">
          <!-- 编辑资料按钮 -->
          <van-button size="small" @click="$router.push('/edit')">编辑主页</van-button>
        </div>
      </div>
    </div>

    <!-- 收藏与历史 -->
    <van-grid :column-num="5" clickable>
      <van-grid-item icon="shopping-cart-o" text="我的订单" />
      <van-grid-item icon="sign" text="我的预约" />
      <van-grid-item icon="clock-o" text="观看历史" />
      <van-grid-item icon="paid" text="我的钱包" />
      <van-grid-item icon="list-switching" text="全部功能" />
    </van-grid>
    <!-- tab栏 -->
    <van-tabs v-model:active="active">
      <van-tab title="作品"></van-tab>
      <van-tab title="日常"></van-tab>
      <van-tab title="推荐"></van-tab>
      <van-tab title="收藏"></van-tab>
      <van-tab title="喜欢"></van-tab>
    </van-tabs>

    <!-- 作品内容：只在作品tab显示 -->
    <div v-if="active === 0" class="works-content">
      <div v-if="works.length === 0" class="empty-works">
        <van-icon name="video-o" size="80" color="#ccc" />
        <p class="empty-text">暂无作品</p>
        <p class="empty-desc">上传视频后，作品将显示在这里</p>
        <van-button type="primary" size="large" @click="$router.push('/upload')">
          立即上传
        </van-button>
      </div>
      <div v-else class="works-grid">
        <div
          v-for="video in works"
          :key="video.id"
          class="work-item"
        >
          <div class="work-item-content" @click="openFullscreenPlayer(video)">
            <img :src="video.cover" alt="视频封面" class="work-cover" />
          </div>
          <div class="delete-button" @click.stop="handleDeleteVideo(video.id)">
            <van-icon name="cross" size="20" color="#ff4444" />
          </div>
        </div>
      </div>
    </div>

    <p class="p" v-else>暂时没有更多了</p>
    <van-cell title="退出登录" class="loginout" v-if="isLoggedIn" @click="onLogout()" />

    <!-- 全屏播放器 -->
    <FullscreenVideoPlayer
      v-if="showFullscreenPlayer && selectedVideo"
      v-model:show="showFullscreenPlayer"
      :video="selectedVideo"
      @close="handlePlayerClose"
      @video-update="handleVideoUpdate"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index' // 引入你的 Pinia store
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import FullscreenVideoPlayer from '@/components/FullscreenVideoPlayer.vue'
import { getUserWorks, deleteVideo } from '@/api/mockApi'

const active = ref(0)
const works = ref([])

// 加载用户作品
const loadUserWorks = async () => {
  try {
    // 使用与 UploadIndex.vue 相同的方式获取用户 ID，默认为 1001
    const userId = localStorage.getItem('user_id') || '1001'
    const userWorks = await getUserWorks(userId)
    works.value = userWorks
  } catch (error) {
    console.error('Failed to load user works:', error)
  }
}

// 组件挂载时加载作品数据
onMounted(() => {
  // 无论是否登录，都加载视频列表，方便测试
  loadUserWorks()
})

const selectedVideo = ref(null)
const showFullscreenPlayer = ref(false)

const openFullscreenPlayer = (video) => {
  selectedVideo.value = video
  showFullscreenPlayer.value = true
}

const handlePlayerClose = () => {
  showFullscreenPlayer.value = false
  selectedVideo.value = null
}

// 处理视频更新事件
const handleVideoUpdate = (updateData) => {
  console.log('视频更新:', updateData)
  // 更新works数组中的视频数据
  const videoIndex = works.value.findIndex(video => video.id === updateData.id)
  if (videoIndex !== -1) {
    // 更新视频数据
    works.value[videoIndex] = {
      ...works.value[videoIndex],
      ...updateData
    }
    // 如果更新的是当前选中的视频，也更新selectedVideo
    if (selectedVideo.value && selectedVideo.value.id === updateData.id) {
      selectedVideo.value = {
        ...selectedVideo.value,
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
        // 刷新作品列表
        await loadUserWorks()
        // 如果当前正在播放的视频被删除，关闭播放器
        if (selectedVideo.value && selectedVideo.value.id === videoId) {
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


const userStore = useUserStore()

// 从 Pinia store 中获取登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 从 Pinia store 中获取用户名
const userName = computed(() => {
  return userStore.userInfo?.userName || '用户'
})

// 从 Pinia store 中获取用户头像
const userAvatar = computed(() => {
  return userStore.userInfo?.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'
})

// 从 Pinia store 中获取用户背景图片
const userBackgroundImage = computed(() => {
  const backgroundImage = userStore.userInfo?.background_image
  return backgroundImage ? `url('${backgroundImage}') no-repeat center top` : `url('../../assets/picture1.jpg') no-repeat center top`
})
function useLogout() {
  const router = useRouter()
  const userStore = useUserStore()
  const onLogout = () => {
    //退出登录的逻辑
    showConfirmDialog({
      title: '确认退出吗',
      message: '退出后需重新登录',
    })
      .then(() => {
        // 1. 清空 Pinia store 中的用户信息
        userStore.clearToken() 
        // 2. 跳转到登录页（替换当前路由历史）
        router.replace({ path: '/login' })
      })
      .catch(() => {
        console.log('用户取消退出')
      })
  }
  return { onLogout }
}
const { onLogout } = useLogout()
</script>

<style scoped>
/* ===================== 通用容器样式 ===================== */
.my-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* ===================== 未登录状态：头部横幅 ===================== */
.my-container .header.not-login {
  height: 280px;
  background: url('../../assets/picture1.jpg') no-repeat center top;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 未登录状态：登录按钮布局 */
.my-container .not-login .login-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 未登录状态：图标样式 */
.mobile-img {
  width: 232px;
  height: 232px;
  margin-bottom: 15px;
  border-radius: 50%;
  object-fit: cover;
}

/* 未登录状态：文字样式 */
.text {
  font-size: 38px;
  color: #000;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* ===================== 已登录状态：用户信息区 ===================== */
.user-info-container {
  width: 100%;
}

/* 已登录状态：头部背景 */
.my-container .header.user-info {
  height: 500px;
  background-size: cover;
  padding-top: 20px;
  box-sizing: border-box;
}

/* 已登录状态：基础信息布局 */
.user-info .base-info {
  height: 400px;
  padding: 100px 32px 23px 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧：头像 + 用户名 */
.user-info .left {
  display: flex;
  align-items: center;
}

/* 圆形头像样式 */
.user-info .left .avatar {
  width: 232px;
  height: 232px;
  margin-right: 13px;
  border: 1px solid #fff;
  border-radius: 50%;
  object-fit: cover;
}

/* 用户名文字 */
.user-info .left .name {
  font-size: 50px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 右侧：编辑资料按钮 */
.right .van-button {
  color: black;
  background-color: #f5f5f5;
  border: 0;
}

/* ===================== 数据统计区 ===================== */
.data-stats {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 25px 0;
  margin: -20px 15px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-item .count {
  font-size: 40px;
  font-weight: bold;
  color: #333;
}

.data-item .text {
  font-size: 30px;
  color: #999;
  text-shadow: none;
  /* 覆盖上面的 text-shadow */
}

/* van-grid-item 图标文字变小、去边框 */
::v-deep(.van-grid-item) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

::v-deep(.van-grid-item__icon) {
  justify-content: center !important;
  right: 10px !important;
  font-size: 50px !important;
  width: 24px !important;
  height: 24px !important;
  line-height: 24px !important;
}

::v-deep(.van-grid-item__text) {
  font-size: 25px !important;
  left: 50% !important;
  margin-top: 20px !important;
  color: #333 !important;
}

.loginout {
  text-align: center;
  color: red;
  height: 100px;
  margin-top: 10px;
}

/* Vant tabs active indicator color */
::v-deep(.van-tabs__line) {
  background-color: #000 !important;
  height: 4px !important;
  width: 150px !important;
}

::v-deep(.van-tab--active) {
  color: #000 !important;
}

::v-deep(.van-tabs__nav) {
  background-color: transparent !important;
}

::v-deep(.van-tab) {
  font-size: 30px !important;
  color: #666 !important;
}

.works-content {
  /* padding: 10px; */
  background: #fff;
  /* margin: 8px 10px; */
  /* border-radius: 10px; */
  width: 100%;
  box-sizing: border-box;
}

.works-grid {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.work-item {
  width: calc(33.33% - 8px);
  max-width: 300px;
  height: 350px;
  background: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #eee;
  box-sizing: border-box;
}

.work-cover {
  width: auto;
  height: 100%;
  object-fit: cover;
  display: block;
}

.work-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.work-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.work-item-content {
  width: 100%;
  height: 100%;
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

.work-item:hover .delete-button {
  opacity: 1;
  transform: translateX(0);
}

.delete-button:hover {
  background: rgba(255, 68, 68, 1);
  transform: scale(1.1) translateX(0);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* 空作品提示样式 */
.empty-works {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  background: #fff;
  min-height: 400px;
}

.empty-text {
  font-size: 36px;
  color: #333;
  margin: 20px 0 10px;
  font-weight: 500;
}

.empty-desc {
  font-size: 24px;
  color: #999;
  margin: 0 0 40px;
}

.empty-works .van-button {
  min-width: 200px;
  font-size: 28px;
  padding: 15px 30px;
}
</style>
