import axios from 'axios'
import { showToast } from 'vant'
import 'vant/es/toast/style'
const request = axios.create({
  baseURL: '/api',
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})
request.interceptors.request.use(
  (config) => {
    // 从本地存储获取用户token，添加到请求头
    const token = localStorage.getItem('user_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    showToast({
      message: '请求发送失败，请检查网络',
      type: 'fail',
    })
    return Promise.reject(error)
  },
)

// 响应拦截器：统一处理接口返回和错误
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端统一响应格式判断，可根据后端实际格式调整
    if (res.code !== 200) {
      showToast({
        message: res.message || '请求失败',
        type: 'fail',
      })
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    showToast({
      message: error.message || '请求失败',
      type: 'fail',
    })
    return Promise.reject(error)
  },
)

export default request
