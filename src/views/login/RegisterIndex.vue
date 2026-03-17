<template>
  <div>
    <van-nav-bar title="注册" class="page-nav-bar">
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
      <van-field
        v-model="user.confirmPwd"
        name="confirmPwd"
        type="password"
        placeholder="确认密码"
        left-icon="lock"
        :rules="[
          { required: true, message: '请确认密码' },
          { validator: confirmPassword, message: '两次输入的密码不一致' },
        ]"
      />
      <div style="margin: 16px">
        <van-button block type="primary" native-type="submit" :loading="isLoading">
          注册
        </van-button>
      </div>
      <div style="text-align: center; margin-top: 16px">
        <van-button type="text" @click="toLogin">
          已有账号？立即登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { showLoadingToast, showSuccessToast, showFailToast } from 'vant'
import 'vant/es/toast/style'
import { register } from '@/api/mockUser'
import { useRouter } from 'vue-router'

const router = useRouter()

const useRegister = () => {
  const user = reactive({
    userName: '',
    userPwd: '',
    confirmPwd: ''
  })
  const isLoading = ref(false)

  const confirmPassword = (value) => {
    return value === user.userPwd
  }

  const onSubmit = async () => {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    })
    try {
      isLoading.value = true
      const res = await register(user)
      if (res.code === 0) {
        showSuccessToast('注册成功')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        showFailToast(res.message || '注册失败')
      }
    } catch (error) {
      showFailToast('网络异常，请稍后重试')
      console.error('注册请求失败：', error)
    } finally {
      isLoading.value = false
    }
  }

  const toLogin = () => {
    router.push('/login')
  }

  return { user, isLoading, onSubmit, toLogin, confirmPassword }
}

const { user, isLoading, onSubmit, toLogin, confirmPassword } = useRegister()
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
</style>