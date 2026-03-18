<template>
  <div>
    <van-nav-bar title="登录" class="page-nav-bar">
      <template #left>
        <van-icon name="cross" size="18" @click="this.$router.back()"/>
      </template>
    </van-nav-bar>
    <van-form @submit="onSubmit">
      <van-field
        v-model="user.userName"
        name="userName"
        placeholder="用户名"
        left-icon="manager"
        :rules="[{ required: true, message: '请输入用户名' }]"
      />
      <van-field
        v-model="user.userPwd"
        name="userPwd"
        type="password"
        placeholder="密码"
        left-icon="lock"
        :rules="[
          { required: true, message: '请输入密码' },
          { pattern: /^\d{6}$/, message: '密码格式错误' },
        ]"
      />
      <div style="margin: 16px">
        <van-button block type="primary" native-type="submit" :loading="isLoading">
          登录
        </van-button>
      </div>

    </van-form>
    <!-- 注册提示信息 -->
    <div class="register-tip" @click="toRegister">
      <div class="tip-content">
        <van-icon name="info-o" class="tip-icon" />
        <div class="tip-text">
          <p class="tip-title">新用户注册</p>
          <p class="tip-desc">注册后即可享受更多功能</p>
        </div>
        <van-icon name="arrow" class="tip-arrow" />
      </div>
    </div>
  </div>
</template>

<script setup>
// 引入核心依赖：Vue3 响应式API、Vant提示、登录接口
import { reactive, ref } from 'vue'
// import { showToast, showFailToast } from 'vant'
// import { login } from '@/api/user' // 统一使用 @ 别名指向 src
// 临时使用 Mock 接口
import { login } from '@/api/mockUser'
import { showLoadingToast, showSuccessToast, showFailToast } from 'vant'
import 'vant/es/toast/style'
import { useUserStore } from '@/stores/index'
import { useRouter } from 'vue-router'
/**
 * 封装登录业务的 Composables（内聚状态+逻辑）
 * 符合 Vue3 Composables 最佳实践：单一职责、自包含
 */
const router = useRouter()
const userStore = useUserStore() // 实例化 store
const useLogin = () => {
  // 1. 响应式状态：用户信息、加载状态（内聚在函数内，无需外部传参）
  const user = reactive({
    userName: '',
    userPwd: '',
  })
  const isLoading = ref(false) // 登录按钮加载状态

  // 2. 核心提交逻辑：包含校验、加载、请求、错误处理、用户反馈
  const onSubmit = async () => {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    })
    try {
      isLoading.value = true // 发起请求前显示加载
      // 调用登录接口
      const res = await login(user)
      // 业务成功判断（适配后端 code=0 成功的逻辑）
      if (res.code === 0) {
        // showToast('登录成功！')
        showSuccessToast('登录成功')
        // console.log('用户登录成功', res.data)
        // 后续业务：如存储token、跳转到首页
        userStore.setToken(res.data.token, res.data)
        // 同时存储用户ID到localStorage，用于上传功能
        localStorage.setItem('user_id', res.data.userId)

        router.push('/my')
      } else {
        // 业务错误（如账号密码错误）
        showFailToast(res.message || '用户名或密码错误')
      }
    } catch (error) {
      // 网络错误/接口异常处理
      showFailToast('网络异常，请稍后重试')
      console.error('登录请求失败：', error)
    } finally {
      isLoading.value = false // 无论成功/失败，都关闭加载
    }
  }

  const toRegister = () => {
    router.push('/register')
  }
  // 3. 暴露给模板使用的状态和方法
  return { user, isLoading, onSubmit, toRegister }
}
// 调用 Composables，解构使用
const { user, isLoading, onSubmit, toRegister } = useLogin()
</script>

<style scoped>
.page-nav-bar {
  background-color: #3296fa;
}
:deep(.van-nav-bar__title) {
  color: #fff;
}
.page-nav-bar .van-icon{
  color: #fff;
}

/* 注册提示信息样式 */
.register-tip {
  margin: 60px 16px 20px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border-left: 10px solid #3296fa;
  cursor: pointer;
}

.tip-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip-icon {
  font-size: 44px;
  color: #3296fa;
  margin-right: 12px;
}

.tip-text {
  flex: 1;
}

.tip-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
}

.tip-desc {
  font-size: 24px;
  color: #888;
  margin: 0;
}

.tip-arrow {
  font-size: 24px;
  color: #3296fa;
}
</style>
