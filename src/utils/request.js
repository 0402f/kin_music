import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 5000,
})

// 不需要token的接口路径
const NO_AUTH_PATHS = [
  '/api/music/list',
  '/api/music/',
  '/api/lyrics/parsed/',
  '/api/lyrics/raw/',
  '/api/lyrics/all/',
  '/api/comments/nested', // 添加获取评论接口
]

// 检查是否为不需要认证的接口
function isNoAuthPath(url) {
  return NO_AUTH_PATHS.some((path) => url.includes(path))
}

// 添加请求拦截器
service.interceptors.request.use(
  function (config) {
    // 检查是否为不需要认证的接口
    if (!isNoAuthPath(config.url)) {
      // 只有需要认证的接口才添加token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      // 修改前端代码
      if (token) {
        config.headers.Authorization = `Bearer ${token}` // 添加 Bearer 前缀
      }
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 添加响应拦截器
service.interceptors.response.use(
  function (response) {
    // 统一处理成功响应
    if (response.data.code === 1) {
      return response.data
    } else if (response.data.code === 0) {
      // 业务失败但HTTP请求成功
      console.warn('业务请求失败:', response.data.msg)
      return Promise.reject(new Error(response.data.msg || '请求失败'))
    }
    // 其他情况返回完整数据
    return response.data
  },
  function (error) {
    // 处理HTTP错误
    if (error.response?.status === 401) {
      // 只有在需要认证的接口返回401时才处理
      if (!isNoAuthPath(error.config?.url)) {
        console.warn('认证失败，请重新登录')
        // 可以选择性清除token或提示用户
        // localStorage.removeItem('token')
        // sessionStorage.removeItem('token')
      }
    }

    // 统一错误处理
    const message = error.response?.data?.message || error.message || '网络请求失败'
    return Promise.reject(new Error(message))
  },
)

export default service
