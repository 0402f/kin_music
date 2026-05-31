import request from '../utils/request'

// 创建歌单
export const createPlaylist = (data) => {
  console.log('API接收到的原始数据:', data) // 添加调试日志

  const params = new URLSearchParams()

  // 添加参数验证
  if (data.name !== undefined && data.name !== null) {
    params.append('name', data.name)
  }

  if (data.isPublic !== undefined && data.isPublic !== null) {
    params.append('isPublic', data.isPublic)
  }

  // 打印最终的参数
  console.log('URLSearchParams内容:')
  for (let [key, value] of params.entries()) {
    console.log(`${key}: ${value}`)
  }

  return request({
    url: '/playlist/create',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

// 获取当前用户的歌单列表
export const getMyPlaylists = () => {
  return request({
    url: '/playlist/my',
    method: 'get',
  })
}

// 获取用户歌单列表
export function getUserPlaylists(userId) {
  return request({
    url: `/playlist/user/${userId}`,
    method: 'get',
  })
}

// 获取歌单详情
export function getPlaylistDetail(playlistId) {
  return request({
    url: `/playlist/details/${playlistId}`,
    method: 'get',
  })
}

// 获取歌单音乐列表
export function getPlaylistMusic(playlistId) {
  return request({
    url: `/playlist/${playlistId}/music`,
    method: 'get',
  })
}

// 删除歌单
export function deletePlaylist(playlistId) {
  return request({
    url: `/playlist/${playlistId}`,
    method: 'delete',
  })
}

// 更新歌单信息
export function updatePlaylist(playlistId, data) {
  const formData = new FormData()

  formData.append('name', data.name)
  formData.append('description', data.description || '')
  formData.append('tags', data.tags || '')
  formData.append('isPublic', data.isPublic)

  if (data.coverFile) {
    formData.append('coverFile', data.coverFile)
  }

  return request({
    url: `/playlist/${playlistId}`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 添加歌曲到歌单
export function addMusicToPlaylist(playlistId, musicId) {
  return request({
    url: `/playlist/${playlistId}/music/${musicId}`,
    method: 'post',
  })
}

// 增加歌单播放量
export function incrementPlaylistPlayCount(playlistId) {
  return request({
    url: `/playlist/play/${playlistId}`,
    method: 'post',
  })
}

// 获取热门歌单
export function getHotPlaylists(limit = 5) {
  return request({
    url: '/playlist/hot',
    method: 'get',
    params: {
      limit,
    },
  })
}

// 获取最新歌单
export function getLatestPlaylists(limit = 5) {
  return request({
    url: '/playlist/latest',
    method: 'get',
    params: {
      limit,
    },
  })
}

// 获取按收藏量排序的歌单
export function getPlaylistsByCollectCount(limit = 5) {
  return request({
    url: '/playlist/public/by-collect-count',
    method: 'get',
    params: {
      limit,
    },
  })
}

// 收藏歌单
export function favoritePlaylist(playlistId) {
  return request({
    url: `/playlist/favorite/${playlistId}`,
    method: 'post',
  })
}

// 取消收藏歌单
export function unfavoritePlaylist(playlistId) {
  return request({
    url: `/playlist/favorite/${playlistId}`,
    method: 'delete',
  })
}

// 检查歌单收藏状态
export function checkPlaylistFavoriteStatus(playlistId) {
  return request({
    url: `/playlist/favorite/check/${playlistId}`,
    method: 'get',
  })
}

// 获取用户收藏的歌单列表
export function getFavoritePlaylistList() {
  return request({
    url: '/playlist/favorites',
    method: 'get',
  })
}

// 获取歌单收藏者列表
export function getPlaylistFavoriteUsers(playlistId) {
  return request({
    url: `/playlist/${playlistId}/favorite-users`,
    method: 'get',
  })
}
