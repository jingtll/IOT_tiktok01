//登录认证专用 Store
import { defineStore } from 'pinia'

// 恢复为 useUserStore，ID 为 user
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setToken(token, userInfo = null) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem('token', token)
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
    },
    clearToken() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('user_id')
    },
    initToken() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      if (token) {
        this.token = token
      }
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo)
      }
    },
  },
})
