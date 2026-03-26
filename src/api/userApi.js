/**
 * 用户相关接口封装
 * 包含用户信息获取、登录、注册等基础用户操作
 */
// 导入封装好的axios请求实例
import request from '../utils/request'

/**
 * 登录接口
 * @param {Object} data - 登录数据
 * @returns {Promise<Object>} 登录结果
 */
export const login = (data) => {
  return request({
    method:"POST",
    url:"/user/login",
    data,
  })
}

/**
 * 注册接口
 * @param {Object} data - 注册数据
 * @returns {Promise<Object>} 注册结果
 */
export const register = (data) => {
  return request({
    method:"POST",
    url:"/user/register",
    data,
  })
}

/**
 * 获取当前登录用户的个人信息
 * @returns {Promise<Object>} 用户信息对象
 * @example
 * // 返回示例
 * {
 *   id: '123456',
 *   nickname: '短视频用户',
 *   avatar: 'https://xxx.com/avatar.png',
 *   follow_count: 100, // 关注数
 *   fan_count: 200,    // 粉丝数
 *   video_count: 10    // 发布视频数
 * }
 */
export const getUserInfo = async () => {
  try {
    // 调用后端用户信息接口，路径可根据实际后端调整
    const response = await request.get('/user/info')
    return response
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 抛出错误让上层处理（如提示用户）
    throw error
  }
}

/**
 * 获取指定用户的主页信息
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 用户主页信息
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await request.get(`/user/profile/${userId}`)
    return response
  } catch (error) {
    console.error('获取用户主页信息失败:', error)
    throw error
  }
}
