import request from '@/utils/request'

// 上传音乐到阿里云OSS
export function uploadMusicToAliOSS(formData) {
  return request({
    url: '/music/upload-to-alioss',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 增加到5分钟 (300秒)
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      if (formData.onProgress) {
        formData.onProgress(percentCompleted)
      }
    },
  })
}

// 新增：通过网易云链接上传音乐
export function uploadMusicWithNeteaseUrl(formData) {
  return request({
    url: '/music/upload-with-netease-url',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 增加到5分钟 (300秒)
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      if (formData.onProgress) {
        formData.onProgress(percentCompleted)
      }
    },
  })
}

// 获取音乐列表
export function getMusicList(params = {}) {
  return request({
    url: '/music/list',
    method: 'get',
    params,
  })
}

// 获取音乐详情
export function getMusicDetail(id) {
  return request({
    url: `/music/${id}`,
    method: 'get',
  })
}

// 删除音乐
export function deleteMusic(id) {
  return request({
    url: `/music/${id}`,
    method: 'delete',
  })
}
