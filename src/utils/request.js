import axios from 'axios'
import { showToast } from 'vant'
import 'vant/es/toast/style'
const request = axios.create({
  baseURL: 'http://10.23.196.30:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
request.interceptors.request.use(
  (config) => {
    // 从本地存储获取用户token添加到请求头
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
    // 适配不同的后端响应格式
    // 对于视频上传接口 (/api/video/upload)：code !== 0 表示错误
    const isUploadEndpoint = response.config.url.includes('/api/video/')
    if (!isUploadEndpoint && res.code !== 200) {
      showToast({
        message: res.message || '请求失败',
        type: 'fail',
      })
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    if (isUploadEndpoint && res.code !== 0) {
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
