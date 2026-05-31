import request from '../utils/request'

// 生成AI音轨
export const generateAITrack = (data) => {
  console.log('AI音轨生成请求数据:', data)
  
  const params = new URLSearchParams()
  
  // 添加参数验证并使用URLSearchParams
  if (data.description !== undefined && data.description !== null) {
    params.append('description', data.description)
  }
  
  if (data.title !== undefined && data.title !== null) {
    params.append('title', data.title)
  }
  
  if (data.tags !== undefined && data.tags !== null) {
    params.append('tags', data.tags)
  }
  
  // 打印最终的参数（调试用）
  console.log('URLSearchParams内容:')
  for (let [key, value] of params.entries()) {
    console.log(`${key}: ${value}`)
  }
  
  return request({
    url: '/beatoven/generate-and-upload',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 300000 // 为AI生成接口单独设置5分钟超时
  })
}

// 获取用户AI音轨历史记录
export const getAITrackHistory = () => {
  return request({
    url: '/beatoven/history',
    method: 'get'
  })
}

// 获取音轨生成状态（如果需要单独查询状态）
export const getTrackStatus = (trackId) => {
  return request({
    url: `/beatoven/status/${trackId}`,
    method: 'get'
  })
}

// 删除AI音轨（如果后端支持）
export const deleteAITrack = (trackId) => {
  return request({
    url: `/beatoven/${trackId}`, // 修改为用户要求的路径
    method: 'delete'
  })
}

// 下载AI音轨
export const downloadAITrack = (trackId) => {
  return request({
    url: `/beatoven/download/${trackId}`,
    method: 'get',
    responseType: 'blob' // 用于文件下载
  })
}
