import request from '@/utils/request'

// 用户登录
export function login(data) {
  // 将数据转换为URLSearchParams格式
  const params = new URLSearchParams()
  params.append('username', data.username)
  params.append('password', data.password)

  return request({
    url: '/user/login',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

// 用户注册
export function register(data) {
  // 如果注册接口也使用@RequestParam，同样需要转换格式
  const params = new URLSearchParams()
  params.append('username', data.username)
  params.append('email', data.email)
  params.append('password', data.password)

  return request({
    url: '/user/register',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get',
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data,
  })
}

// 更新用户头像
export function updateUserAvatar(userId, avatarFile) {
  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('avatar', avatarFile)

  return request({
    url: '/user/update',
    method: 'put', // 改为PUT方法
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 根据ID获取用户信息
export function getUserById(id) {
  return request({
    url: `/user/${id}`,
    method: 'get',
  })
}

// 获取用户收藏的歌曲列表id
export function getUserFavorites() {
  return request({
    url: '/user/favoritesList',
    method: 'get',
  })
}

// 收藏/取消收藏歌曲
export function toggleFavorite(musicId) {
  return request({
    url: '/user/favorites',
    method: 'post',
    data: { musicId },
  })
}

// 将音乐添加到喜欢列表
export const addMusicToFavorites = (musicId) => {
  // 注意这里使用模板字符串将musicId作为路径参数
  return request.post(`/user/favorite/${musicId}`)
}

// 从喜欢列表中移除音乐
export const removeMusicFromFavorites = (musicId) => {
  return request.delete(`/user/favorite/${musicId}`)
}

// 获取粉丝列表
export function getUserFollowers() {
  return request({
    url: '/user/followers',
    method: 'get',
  })
}

// 获取关注列表
export function getUserFollowing() {
  return request({
    url: '/user/following',
    method: 'get',
  })
}
