// stores/index.js - 登录认证专用 Store
import { defineStore } from 'pinia'

// 恢复为 useUserStore，ID 为 user
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setToken(token, userInfo = null) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem('token', token)
    },
    clearToken() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    },
    initToken() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
      }
    },
  },
})
