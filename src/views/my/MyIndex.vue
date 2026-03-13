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
            <span class="name">lwx</span>
          </div>
          <div class="right">
            <!-- 编辑资料按钮 -->
            <van-button size="mini" round>编辑资料</van-button>
          </div>
        </div>
      </div>

      <!-- 数据统计区 -->
      <div class="data-stats">
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">头条</span>
        </div>
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">关注</span>
        </div>
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">粉丝</span>
        </div>
        <div class="data-item">
          <span class="count">10</span>
          <span class="text">获赞</span>
        </div>
      </div>
    </div>
    <!-- 收藏与历史 -->
    <van-grid :column-num="2" clickable>
      <van-grid-item icon="star-o" text="收藏" />
      <van-grid-item icon="clock-o" text="历史" />
    </van-grid>
    <!-- 消息通知 -->
    <van-cell title="消息通知" is-link />
    <van-cell title="关于我们" is-link />
    <van-cell title="退出登录" class="loginout" v-if="isLoggedIn" @click="onLogout()" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index' // 引入你的 Pinia store
import { showConfirmDialog } from 'vant'
import 'vant/es/dialog/style'
// const router = useRouter()
const userStore = useUserStore()

// 从 Pinia store 中获取登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
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
.user-info .right .van-button {
  /* color: #fff; */
  border-color: #fff;
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
  margin-bottom: 5px;
}

.data-item .text {
  font-size: 40px;
  color: #999;
  text-shadow: none; /* 覆盖上面的 text-shadow */
}
.van-grid-item__icon {
  color: red;
  font-size: 30px;
}
.loginout {
  text-align: center;
  color: red;
  height: 100px;
  margin-top: 10px;
}
</style>
