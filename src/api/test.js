import request from '../utils/request'

// 获取音乐列表
export const getMusicList = () => {
  return request.get('/music/list')
}

// 根据ID数组获取音乐详情
export const getMusicByIds = (ids) => {
  // 将ID数组转换为逗号分隔的字符串
  const idsString = Array.isArray(ids) ? ids.join(',') : ids
  return request.get(`/music/${idsString}`)
}

// 获取新歌横幅
export const getNewReleaseBanner = () => {
  return request.get('/music/new-release-banner')
}

// 获取歌词
export const getLyrics = (musicId) => {
  return request
    .get(`/lyrics/parsed/${musicId}`, {
      params: {
        language: 'zh',
      },
    })
    .then((response) => {
      console.log('歌词API原始响应:', response)

      // 根据图片显示的格式，API直接返回歌词数组
      if (response && response.data) {
        return response.data // 直接返回歌词数组
      }

      return []
    })
    .catch((error) => {
      console.error('获取歌词失败:', error)
      return []
    })
}
