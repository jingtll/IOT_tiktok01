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
      <div class="header user-info">
        <div class="base-info">
          <div class="left">
            <!-- 圆形头像 -->
            <van-image src="https://img.yzcdn.cn/vant/cat.jpeg" class="avatar" round fit="cover" />
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
          <van-button size="small">编辑主页</van-button>
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
      <div class="works-grid">
        <div v-for="video in works" :key="video.id" class="work-item" @click="openFullscreenPlayer(video)">
          <img :src="video.cover" alt="视频封面" class="work-cover" />
        </div>
      </div>
    </div>

    <p class="p" v-else>暂时没有更多了</p>
    <van-cell title="退出登录" class="loginout" v-if="isLoggedIn" @click="onLogout()" />

    <!-- 全屏播放器 -->
    <FullscreenVideoPlayer v-if="showFullscreenPlayer && selectedVideo" v-model:show="showFullscreenPlayer" :video="selectedVideo" @close="handlePlayerClose" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index' // 引入你的 Pinia store
import { showConfirmDialog } from 'vant'
import 'vant/es/dialog/style'
import FullscreenVideoPlayer from '@/components/FullscreenVideoPlayer.vue'

const active = ref(0)
const works = ref([
  {
    id: 1,
    cover: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=500&q=80',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    cover_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=500&q=80',
    description: '测试视频1 - 垂直滑动播放效果',
    is_liked: false,
    like_count: 128,
    comment_count: 23,
    share_count: 15,
    is_followed: false,
    author: {
      id: 1001,
      nickname: '测试作者1',
      avatar: 'https://p3-passport.byteacctimg.com/img/user-avatar/899d539d8098911151e89575e998060d~300x300.image'
    }
  },
  {
    id: 2,
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    cover_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80',
    description: '测试视频2 - 双击点赞+评论功能',
    is_liked: false,
    like_count: 89,
    comment_count: 11,
    share_count: 8,
    is_followed: false,
    author: {
      id: 1002,
      nickname: '测试作者2',
      avatar: 'https://p9-passport.byteacctimg.com/img/user-avatar/7a079f50178009935900a05095008c63~300x300.image'
    }
  },
  {
    id: 3,
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80',
    description: '测试视频3 - 全屏播放体验',
    is_liked: false,
    like_count: 256,
    comment_count: 45,
    share_count: 23,
    is_followed: false,
    author: {
      id: 1003,
      nickname: '测试作者3',
      avatar: 'https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/11/16ef5b3f5b5c5c5c~tplv-t2oaga2asx-image.image'
    }
  }
])

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

// const router = useRouter()
const userStore = useUserStore()

// 从 Pinia store 中获取登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 从 Pinia store 中获取用户名
const userName = computed(() => {
  return userStore.userInfo?.userName || '用户'
})
function useLogout() {
  const router = useRouter()
  const userStore = useUserStore()
  const onLogout = () => {
    // 这里写退出登录的逻辑
    // 例如：清空 store、清除 token、跳转到登录页等
    showConfirmDialog({
      title: '确认退出吗',
      message: '退出后需重新登录',
    })
      .then(() => {
        // 1. 清空 Pinia store 中的用户信息
        userStore.clearToken() // 推荐调用 store 中封装好的 action

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
  background: url('../../assets/picture1.jpg') no-repeat center top;
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
  justify-content: center;
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
</style>