import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, register, getUserInfo, getUserFavorites } from '@/api/user'
import { checkPlaylistFavoriteStatus } from '@/api/playlist'
import { getMusicByIds } from '@/api/test'

// 创建全局的AuthModal控制状态
const showAuthModal = ref(false)

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    isLoggedIn: !!localStorage.getItem('token'),
    // 添加全局收藏状态
    favoriteIds: new Set(),
    // 添加收藏音乐详情列表
    favoriteList: [],
    // 添加收藏的歌单ID集合
    favoritePlaylistIds: new Set(),
  }),

  getters: {
    // 获取用户ID
    id: (state) => {
      return state.userInfo?.id || null
    },
    // 获取用户头像，如果没有则返回默认头像
    avatar: (state) => {
      return state.userInfo?.avatarUrl || '/images/avc.png'
    },
    // 获取用户名
    username: (state) => {
      return state.userInfo?.username || '未登录'
    },
    // 获取用户昵称，如果没有则使用用户名
    nickname: (state) => {
      return state.userInfo?.nickname || state.userInfo?.username || '未登录'
    },
    // 获取AuthModal显示状态
    authModalVisible: () => {
      return showAuthModal.value
    },
  },

  actions: {
    // 登录
    async login(loginData) {
      try {
        const response = await login(loginData)

        this.token = response.data.token
        this.userInfo = response.data.user
        this.isLoggedIn = true

        // 持久化存储
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userInfo', JSON.stringify(response.data.user))

        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    // 注册
    async register(registerData) {
      try {
        // 直接传递注册数据，不添加默认头像和背景图
        const response = await register(registerData)
        console.log('注册成功:', response)
        // 注册成功，但不自动登录，让用户手动登录
        return { success: true, message: '注册成功' }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await getUserInfo()
        this.userInfo = response.data.user || response.data
        this.isLoggedIn = true

        // 更新本地存储的用户信息
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.logout()
      }
    },

    // 获取用户收藏列表
    async fetchFavoriteList() {
      if (!this.isLoggedIn) {
        this.favoriteIds = new Set()
        this.favoriteList = []
        return
      }

      try {
        // 1. 先获取收藏的音乐ID列表
        const favoriteResponse = await getUserFavorites()
        const favoriteIdsArray = favoriteResponse.data || []
        this.favoriteIds = new Set(favoriteIdsArray)
        console.log('收藏ID列表:', favoriteIdsArray)

        if (favoriteIdsArray.length > 0) {
          // 2. 根据ID列表获取音乐详情
          // 在第107行后添加
          const musicResponse = await getMusicByIds(favoriteIdsArray)
          console.log('音乐详情:', musicResponse)
          console.log('musicResponse.data:', musicResponse.data)
          console.log('是否为数组:', Array.isArray(musicResponse.data))

          if (musicResponse.data) {
            // 处理单个对象或数组的情况
            const musicData = Array.isArray(musicResponse.data)
              ? musicResponse.data
              : [musicResponse.data]

            this.favoriteList = musicData.map((music) => ({
              id: music.id,
              title: music.title,
              artist: music.artist,
              album: music.album,
              duration: music.duration,
              coverFileUrl: music.coverFileUrl,
              cover: music.coverFileUrl,
              url: music.fileUrl,
              fileUrl: music.fileUrl,
              fileName: music.fileName,
              format: music.format,
              fileSize: music.fileSize,
              uploadTime: music.uploadTime,
              updateTime: music.updateTime,
              status: music.status,
              isNewRelease: music.isNewRelease,
              releaseDate: music.releaseDate,
            }))
          } else {
            this.favoriteList = []
          }
        } else {
          // 没有收藏的音乐
          this.favoriteList = []
        }

        console.log('全局收藏列表已更新:', this.favoriteIds, this.favoriteList)
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        this.favoriteIds = new Set()
        this.favoriteList = []
      }
    },

    // 添加到收藏
    async addToFavorites(musicId) {
      this.favoriteIds.add(musicId)
      // 重新获取完整的收藏列表以更新favoriteList
      await this.fetchFavoriteList()
    },

    // 从收藏中移除
    removeFromFavorites(musicId) {
      this.favoriteIds.delete(musicId)
      // 从favoriteList中移除对应的音乐
      this.favoriteList = this.favoriteList.filter((music) => music.id !== musicId)
    },

    // 检查歌单收藏状态
    async checkPlaylistFavoriteStatus(playlistId) {
      try {
        const response = await checkPlaylistFavoriteStatus(playlistId)
        const isFavorited = response.data
        if (isFavorited) {
          this.favoritePlaylistIds.add(playlistId)
        } else {
          this.favoritePlaylistIds.delete(playlistId)
        }
        return isFavorited
      } catch (error) {
        console.error('检查歌单收藏状态失败:', error)
        return false
      }
    },

    // 添加歌单到收藏
    addPlaylistToFavorites(playlistId) {
      this.favoritePlaylistIds.add(playlistId)
    },

    // 从收藏中移除歌单
    removePlaylistFromFavorites(playlistId) {
      this.favoritePlaylistIds.delete(playlistId)
    },

    // 登出时清空收藏状态
    logout() {
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
      this.favoriteIds = new Set() // 清空收藏状态
      this.favoriteList = [] // 清空收藏列表
      this.favoritePlaylistIds = new Set() // 清空歌单收藏状态
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      sessionStorage.removeItem('token')
    },

    // 打开AuthModal
    openAuthModal() {
      showAuthModal.value = true
    },

    // 关闭AuthModal
    closeAuthModal() {
      showAuthModal.value = false
    },

    // 初始化用户状态
    async initUser() {
      if (this.token && !this.userInfo) {
        await this.fetchUserInfo()
      } else if (this.token && this.userInfo) {
        // 如果本地有完整信息，直接设置登录状态
        this.isLoggedIn = true
      }

      // 如果已登录，获取收藏列表
      if (this.isLoggedIn) {
        await this.fetchFavoriteList()
      }
    },
  },
})

// 导出AuthModal控制状态供App.vue使用
export { showAuthModal }
