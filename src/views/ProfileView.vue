<template>
  <!-- 添加加载状态 -->
  <div v-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>

  <!-- 原有内容用v-else包裹 -->
  <div
    v-else
    class="profile-container"
    :style="{ backgroundImage: `url(${userInfo.backgroundUrl})` }"
  >
    <!-- 半透明遮罩层 -->
    <div class="background-overlay"></div>

    <!-- 背景图区域 -->
    <div class="profile-header">
      <div class="profile-overlay">
        <!-- 头像和用户信息水平布局 -->
        <div class="profile-info-container">
          <!-- 头像 -->
          <div class="avatar-container">
            <div
              class="avatar-wrapper"
              @click="triggerAvatarUpload"
              :class="{ uploading: uploading }"
            >
              <img :src="userInfo.avatarUrl" :alt="userInfo.username" class="avatar" />
              <!-- 移除overlay和文字，保持点击功能 -->
            </div>
            <!-- 隐藏的文件输入框 -->
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              style="display: none"
            />
          </div>

          <!-- 用户信息 -->
          <div class="user-info">
            <h2 class="username">{{ userInfo.username }}</h2>
            <!-- 用户基本信息一行显示 -->
            <div class="user-basic-info">
              <span class="info-item">用户编号: {{ userInfo.userNumber }}</span>
              <span class="info-separator">|</span>
              <span class="info-item">邮箱: {{ userInfo.email }}</span>
              <span class="info-separator">|</span>
              <span class="info-item" v-if="userInfo.lastLoginTime">
                上次登录: {{ formatLoginTime(userInfo.previousLoginTime) }}
              </span>
            </div>
            <div class="follow-info">
              <span class="follow-item" @click="goToFollowList('following')" style="cursor: pointer"
                >关注 {{ followingCount }}</span
              >
              <span class="follow-item" @click="goToFollowList('followers')" style="cursor: pointer"
                >粉丝 {{ followersCount }}</span
              >
            </div>
            <!-- 个人简历区域 -->
            <div class="user-resume">
              <h4 class="resume-title">个人简介</h4>
              <div class="resume-content">
                <p class="resume-text">
                  {{ userInfo.bio || '这个人很懒，什么都没有留下...' }}
                </p>
              </div>
            </div>
            <p class="location">地区：{{ userInfo.location || '湖北省 武汉市' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方Tab区域 -->
    <div class="profile-tabs">
      <div class="tab-container">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'playlist' }"
          @click="activeTab = 'playlist'"
        >
          歌单
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'collect' }"
          @click="activeTab = 'collect'"
        >
          收藏
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'follow' }"
          @click="activeTab = 'follow'"
        >
          关注
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'fans' }" @click="activeTab = 'fans'">
          粉丝
        </div>
      </div>

      <!-- Tab内容区域 -->
      <div class="tab-content">
        <!-- 歌单Tab内容 -->
        <div v-if="activeTab === 'playlist'" class="playlist-content">
          <div class="playlist-grid">
            <!-- 创建歌单按钮 -->
            <div class="create-playlist-card" @click="showCreatePlaylistModal = true">
              <div class="create-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="create-text">创建歌单</div>
            </div>

            <!-- 用户创建的歌单列表 -->
            <div
              v-for="playlist in userPlaylists"
              :key="playlist.id"
              class="playlist-card"
              @click="handlePlaylistClick(playlist)"
              @contextmenu.prevent="showContextMenu($event, playlist)"
            >
              <div class="playlist-cover">
                <img
                  :src="playlist.coverUrl || '/images/default-playlist.png'"
                  :alt="playlist.name"
                  @error="$event.target.src = '/images/default-playlist.png'"
                />
                <div class="playlist-overlay">
                  <div class="overlay-top">
                    <!-- 小的隐私标识保留在右上角 -->
                    <div v-if="!playlist.isPublic" class="privacy-badge hover-only">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path
                          d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10"
                          stroke="white"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                        <rect
                          x="4"
                          y="10"
                          width="16"
                          height="10"
                          rx="2"
                          fill="white"
                          fill-opacity="0.8"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="overlay-bottom">
                    <div class="play-count">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {{ formatPlayCount(playlist.playCount) }}
                    </div>
                  </div>
                </div>

                <!-- 大锁图标遮罩层 - 仅在隐私歌单悬浮时显示 -->
                <div v-if="!playlist.isPublic" class="privacy-overlay">
                  <div class="privacy-mask"></div>
                  <div class="big-lock-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10"
                        stroke="white"
                        stroke-width="2.5"
                        stroke-linecap="round"
                      />
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="10"
                        rx="3"
                        fill="white"
                        fill-opacity="0.95"
                      />
                      <circle cx="12" cy="15" r="1.5" fill="#666" />
                    </svg>
                    <div class="privacy-text">私密歌单</div>
                  </div>
                </div>
              </div>
              <div class="playlist-info">
                <div class="playlist-name" :title="playlist.name">{{ playlist.name }}</div>
                <div class="playlist-bottom">
                  <div class="playlist-count">{{ playlist.songCount }}首</div>
                  <!-- 添加标签显示 -->
                  <div v-if="playlist.tags && playlist.tags.length > 0" class="playlist-tags">
                    <span v-for="tag in playlist.tags" :key="tag" class="tag-item">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="userPlaylists.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18V5L21 12L9 18Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 12H3V18H9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="empty-text">还没有创建歌单</div>
            <div class="empty-desc">点击上方按钮创建你的第一个歌单吧</div>
          </div>
        </div>

        <!-- 其他Tab内容占位 -->
        <div v-else class="tab-placeholder">
          {{
            activeTab === 'collect' ? '收藏内容' : activeTab === 'follow' ? '关注列表' : '粉丝列表'
          }}
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="viewPlaylist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
          />
        </svg>
        <span>查看歌单</span>
      </div>
      <div class="context-menu-item" @click="playPlaylist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>播放</span>
      </div>
      <div class="context-menu-item" @click="playNext">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4l10 8-10 8V4zm12 0v16h2V4h-2z" />
        </svg>
        <span>下一首播放</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="sharePlaylist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
          />
        </svg>
        <span>分享...</span>
      </div>
      <div class="context-menu-item" @click="copyLink">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
          />
        </svg>
        <span>复制链接</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="editPlaylist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
        <span>编辑歌单信息</span>
      </div>
      <div class="context-menu-item delete-item" @click="showDeleteConfirm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
        <span>删除歌单</span>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :visible="showDeleteDialog"
      title="删除歌单"
      :message="`确定要删除歌单「${contextMenu.playlist?.name}」吗？删除后无法恢复。`"
      type="warning"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="showDeleteDialog = false"
    />

    <!-- 创建歌单弹窗 -->
    <div v-if="showCreatePlaylistModal" class="modal-overlay" @click="closeCreatePlaylistModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建歌单</h3>
          <button class="close-btn" @click="closeCreatePlaylistModal">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="playlistName">歌单名称</label>
            <input
              id="playlistName"
              v-model="newPlaylist.name"
              type="text"
              placeholder="输入歌单标题"
              maxlength="40"
              class="form-input"
            />
            <div class="char-count">{{ newPlaylist.name.length }}/40</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label-simple">
              <input v-model="newPlaylist.isPrivate" type="checkbox" class="checkbox-native" />
              设为隐私歌单
            </label>
            <div class="privacy-desc">隐私歌单只有你自己可以看到</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeCreatePlaylistModal">取消</button>
          <button
            class="btn btn-create"
            @click="handleCreatePlaylist"
            :disabled="!newPlaylist.name.trim()"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- Toast组件 -->
    <Toast
      :visible="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserById, updateUserAvatar, getUserFollowers, getUserFollowing } from '@/api/user'
import { useUserStore } from '@/stores/user'
import Toast from '@/components/Toast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { createPlaylist, deletePlaylist as deletePlaylistApi } from '@/api/playlist'
import { useRouter } from 'vue-router'
import { useAudioStore } from '@/stores/audio'

const userStore = useUserStore()
const audioStore = useAudioStore()
const avatarInput = ref(null)
const router = useRouter()

// 跳转到关注列表页面的方法
const goToFollowList = (type) => {
  // 跳转到关注列表页面，可以通过query参数传递类型
  router.push({
    name: 'followList',
    query: { type }, // 'following' 或 'followers'
  })
}

// Toast相关状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error')

// Tab相关状态
const activeTab = ref('playlist')

// 歌单相关状态
const userPlaylists = ref([])
const showCreatePlaylistModal = ref(false)
const newPlaylist = ref({
  name: '',
  isPrivate: false,
})

// 右键菜单状态
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  playlist: null,
})

// 删除确认对话框状态
const showDeleteDialog = ref(false)

// 添加播放记录状态
const playedPlaylists = ref(new Set()) // 记录已播放的歌单ID

// 添加新的响应式变量来存储实际的关注和粉丝数量
const followersCount = ref(0)
const followingCount = ref(0)

const userInfo = ref({
  id: '',
  userNumber: '',
  username: '',
  email: '',
  nickname: '',
  avatarUrl: '',
  backgroundUrl: '',
  bio: '',
  artistProfile: null,
  lastLoginTime: '',
  previousLoginTime: '',
  followingCount: 0,
  followersCount: 0,
  location: '',
  socialAccount: '',
})

// 格式化登录时间
const formatLoginTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取关注和粉丝数量的函数
const fetchFollowCounts = async () => {
  try {
    // 获取粉丝列表并计算数量
    const followersData = await getUserFollowers()
    console.log('粉丝API完整响应:', followersData)
    console.log('粉丝数据类型:', typeof followersData)
    console.log('是否为数组:', Array.isArray(followersData))

    if (Array.isArray(followersData)) {
      followersCount.value = followersData.length
      console.log('粉丝数量:', followersCount.value)
    } else {
      console.log('粉丝数据不是数组，尝试访问data属性')
      // 如果不是数组，可能需要访问data属性
      if (followersData && Array.isArray(followersData.data)) {
        followersCount.value = followersData.data.length
        console.log('从data属性获取粉丝数量:', followersCount.value)
      } else {
        console.log('无法获取粉丝数据')
        followersCount.value = 0
      }
    }

    // 获取关注列表并计算数量
    const followingData = await getUserFollowing()
    console.log('关注API完整响应:', followingData)
    console.log('关注数据类型:', typeof followingData)
    console.log('是否为数组:', Array.isArray(followingData))

    if (Array.isArray(followingData)) {
      followingCount.value = followingData.length
      console.log('关注数量:', followingCount.value)
    } else {
      console.log('关注数据不是数组，尝试访问data属性')
      // 如果不是数组，可能需要访问data属性
      if (followingData && Array.isArray(followingData.data)) {
        followingCount.value = followingData.data.length
        console.log('从data属性获取关注数量:', followingCount.value)
      } else {
        console.log('无法获取关注数据')
        followingCount.value = 0
      }
    }
  } catch (error) {
    console.error('获取关注/粉丝数量失败:', error)
    // 如果API调用失败，使用userInfo中的默认值
    followersCount.value = userInfo.value.followersCount || 0
    followingCount.value = userInfo.value.followingCount || 0
  }
}

const loading = ref(false)
const uploading = ref(false)

// 显示Toast提示
const showToastMessage = (message, type = 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

// 处理头像文件选择
const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showToastMessage('请选择图片文件', 'error')
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    showToastMessage('图片大小不能超过10MB', 'error')
    return
  }

  try {
    uploading.value = true

    // 调用更新头像接口
    const response = await updateUserAvatar(userInfo.value.id, file)

    if (response.code === 1) {
      // 更新成功，刷新当前页面的用户信息
      await fetchUserInfo()
      // 直接更新Stores中的用户头像，避免重新调用可能失败的getUserInfo接口
      if (userStore.userInfo) {
        userStore.userInfo.avatarUrl = userInfo.value.avatarUrl
        // 更新localStorage中的用户信息
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
      }

      showToastMessage('头像更新成功！', 'success')
    } else {
      showToastMessage('头像更新失败：' + response.msg, 'error')
    }
  } catch (error) {
    console.error('头像上传出错:', error)
    showToastMessage('头像上传失败，请重试', 'error')
  } finally {
    uploading.value = false
    // 清空文件输入框
    event.target.value = ''
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 假设从用户store中获取当前用户ID，或者从路由参数获取
    const userId = userStore.userInfo?.id || 1 // 这里需要根据实际情况调整
    const response = await getUserById(userId)

    if (response.code === 1) {
      userInfo.value = response.data
    } else {
      console.error('获取用户信息失败:', response.msg)
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
    throw error // 抛出错误以便上层处理
  }
}

// 格式化播放次数
const formatPlayCount = (count) => {
  if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count || 0
}

// 关闭创建歌单弹窗
const closeCreatePlaylistModal = () => {
  showCreatePlaylistModal.value = false
  newPlaylist.value = {
    name: '',
    isPrivate: false,
  }
}

// 显示右键菜单
const showContextMenu = (event, playlist) => {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    playlist: playlist,
  }
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.show = false
}

// 右键菜单功能
const viewPlaylist = () => {
  if (contextMenu.value.playlist) {
    router.push(`/playlist/${contextMenu.value.playlist.id}`)
  }
  hideContextMenu()
}

const playPlaylist = async () => {
  if (contextMenu.value.playlist) {
    try {
      const playlistId = contextMenu.value.playlist.id

      // 检查是否已经播放过这个歌单，如果没有则增加播放量
      if (!playedPlaylists.value.has(playlistId)) {
        // 先发送全局事件通知播放量更新（立即更新界面显示）
        window.dispatchEvent(
          new CustomEvent('playlist-play-count-updated', {
            detail: { playlistId },
          }),
        )

        // 再异步更新数据库（不阻塞界面更新）
        incrementPlaylistPlayCount(playlistId).catch((error) => {
          console.error('更新播放量失败:', error)
        })

        playedPlaylists.value.add(playlistId)
      }

      // 获取歌单音乐列表
      const response = await getPlaylistMusic(playlistId)

      if (response.data && response.data.length > 0) {
        const musicData = response.data.map((item) => ({
          id: item.music.id,
          title: item.music.title,
          artist: item.music.artist,
          album: item.music.album,
          duration: item.music.duration,
          url: item.music.fileUrl,
          cover: item.music.coverFileUrl,
        }))

        await audioStore.setPlaylist(musicData)

        const firstSong = response.data[0]
        if (firstSong && firstSong.music) {
          await audioStore.playSong({
            id: firstSong.music.id,
            title: firstSong.music.title,
            artist: firstSong.music.artist,
            album: firstSong.music.album,
            duration: firstSong.music.duration,
            url: firstSong.music.fileUrl,
            cover: firstSong.music.coverFileUrl,
          })
        }

        showToastMessage(`开始播放歌单「${contextMenu.value.playlist.name}」`, 'success')
      } else {
        showToastMessage('歌单为空，无法播放', 'warning')
      }
    } catch (error) {
      console.error('播放歌单失败:', error)
      showToastMessage('播放失败，请稍后重试', 'error')
    }
  }
  hideContextMenu()
}

const playNext = () => {
  if (contextMenu.value.playlist) {
    // 实现下一首播放逻辑
    showToastMessage('已添加到播放队列', 'success')
  }
  hideContextMenu()
}

const sharePlaylist = () => {
  if (contextMenu.value.playlist) {
    // 实现分享功能
    showToastMessage('分享功能开发中', 'info')
  }
  hideContextMenu()
}

const copyLink = async () => {
  if (contextMenu.value.playlist) {
    try {
      const link = `${window.location.origin}/playlist/${contextMenu.value.playlist.id}`
      await navigator.clipboard.writeText(link)
      showToastMessage('链接已复制到剪贴板', 'success')
    } catch (error) {
      showToastMessage('复制失败', error)
    }
  }
  hideContextMenu()
}

const editPlaylist = () => {
  if (contextMenu.value.playlist) {
    router.push(`/playlist/${contextMenu.value.playlist.id}/edit`)
  }
  hideContextMenu()
}

// 显示删除确认对话框
const showDeleteConfirm = () => {
  if (contextMenu.value.playlist) {
    showDeleteDialog.value = true
  }
  hideContextMenu()
}

// 确认删除歌单
const confirmDelete = async () => {
  if (contextMenu.value.playlist) {
    try {
      await deletePlaylistApi(contextMenu.value.playlist.id)
      showToastMessage('歌单删除成功', 'success')
      await fetchUserPlaylists() // 刷新歌单列表
    } catch (error) {
      console.error('删除歌单失败:', error)
      showToastMessage('删除失败，请重试', 'error')
    }
  }
  showDeleteDialog.value = false
}

// 取消删除
const cancelDelete = () => {
  showDeleteDialog.value = false
}

// 点击其他地方隐藏右键菜单
const handleClickOutside = (event) => {
  if (contextMenu.value.show && !event.target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
}

// 播放量更新事件处理函数
const handlePlayCountUpdate = (event) => {
  const { playlistId } = event.detail
  // 找到对应的歌单并更新播放量
  const playlist = userPlaylists.value.find((p) => p.id === playlistId)
  if (playlist) {
    playlist.playCount = (playlist.playCount || 0) + 1
  }
}
// 在script setup部分添加fetchUserPlaylists函数
import { getMyPlaylists, getPlaylistMusic, incrementPlaylistPlayCount } from '@/api/playlist'

// 获取用户歌单列表
const fetchUserPlaylists = async () => {
  try {
    const response = await getMyPlaylists()
    console.log('获取歌单列表响应:', response)

    // 根据API返回的数据格式处理
    if (response && response.data) {
      userPlaylists.value = response.data.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        coverUrl: playlist.coverFileUrl,
        playCount: playlist.playCount,
        songCount: playlist.songCount,
        isPublic: playlist.isPublic,
        description: playlist.description,
        createTime: playlist.createTime,
      }))
    }
  } catch (error) {
    console.error('获取歌单列表失败:', error)
    showToast.value = true
    toastMessage.value = '获取歌单列表失败'
    toastType.value = 'error'
  }
}

// 修改handleCreatePlaylist函数，成功后刷新歌单列表
const handleCreatePlaylist = async () => {
  if (!newPlaylist.value.name.trim()) {
    showToast.value = true
    toastMessage.value = '请输入歌单名称'
    toastType.value = 'error'
    return
  }

  try {
    const requestData = {
      name: newPlaylist.value.name.trim(),
      isPublic: newPlaylist.value.isPrivate ? 0 : 1,
    }

    console.log('创建歌单请求数据:', requestData)
    const response = await createPlaylist(requestData)
    console.log('创建歌单响应:', response)

    showToast.value = true
    toastMessage.value = '歌单创建成功'
    toastType.value = 'success'

    // 重置表单
    newPlaylist.value = {
      name: '',
      isPrivate: false,
    }

    // 关闭弹窗
    showCreatePlaylistModal.value = false

    // 刷新歌单列表
    await fetchUserPlaylists()
  } catch (error) {
    console.error('创建歌单失败:', error)
    showToast.value = true
    toastMessage.value = error.message || '创建歌单失败'
    toastType.value = 'error'
  }
}

// 处理歌单点击事件
const handlePlaylistClick = (playlist) => {
  console.log('点击歌单:', playlist)
  router.push(`/playlist/${playlist.id}`)
}

// 组件卸载时移除监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('playlist-play-count-updated', handlePlayCountUpdate)
})

onMounted(async () => {
  loading.value = true

  try {
    // 优先加载用户基本信息，快速显示页面框架
    await fetchUserInfo()
    loading.value = false // 立即显示页面框架

    // 获取关注和粉丝数量
    await fetchFollowCounts()

    // 异步加载歌单列表，不阻塞页面显示
    fetchUserPlaylists().catch((error) => {
      console.error('获取歌单列表失败:', error)
      showToastMessage('歌单加载失败', 'error')
    })
  } catch (error) {
    console.error('加载用户信息失败:', error)
    showToastMessage('加载失败，请刷新重试', 'error')
    loading.value = false
  }

  // 添加事件监听器
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('playlist-play-count-updated', handlePlayCountUpdate)
})
</script>

<style scoped>
.profile-container {
  width: 100%;
  height: 100%;
  padding: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 1;
  pointer-events: none;
}

.profile-header {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
  padding: 0 40px;
}

.profile-overlay {
  background: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  color: white;
  backdrop-filter: none;
}

.profile-info-container {
  display: flex;
  align-items: center;
  gap: 30px;
  width: 100%;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  display: inline-block;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.avatar-wrapper:hover .avatar {
  border-color: rgba(255, 255, 255, 0.6);
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-info {
  flex: 1;
  text-align: left;
}

.username {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 用户基本信息一行显示样式 */
.user-basic-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.info-item {
  white-space: nowrap;
}

.info-separator {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 4px;
}

.follow-info {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.follow-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
}

.follow-item:hover {
  color: #ff6b6b;
  transform: scale(1.05);
}

/* 个人简历区域样式 */
.user-resume {
  margin: 16px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.resume-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 12px 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.resume-content {
  max-height: 80px;
  overflow-y: auto;
}

.resume-text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

/* 简历区域滚动条样式 */
.resume-content::-webkit-scrollbar {
  width: 4px;
}

.resume-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.resume-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.resume-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.location,
.social {
  font-size: 14px;
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.profile-tabs {
  background: transparent;
  min-height: 400px;
  position: relative;
  z-index: 2;
}

/* Tab样式 - 全透明 */
.tab-container {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent; /* 完全透明 */
  backdrop-filter: none; /* 移除毛玻璃效果 */
}

.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #ff6b6b;
  border-bottom-color: #ff6b6b;
}

.tab-item:hover {
  color: #ff6b6b;
}

/* Tab内容样式 - 全透明 */
.tab-content {
  background: transparent; /* 完全透明 */
  backdrop-filter: none; /* 移除毛玻璃效果 */
  min-height: 400px;
  padding: 20px;
}

/* 歌单网格样式 - 方块布局 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 方块网格 */
  gap: 20px;
  margin-bottom: 20px;
}

/* 创建歌单卡片样式 - 毛玻璃效果 */
.create-playlist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px; /* 固定方块宽度 */
  height: 200px; /* 固定方块高度 */
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px; /* 圆角方块 */
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1); /* 毛玻璃背景 */
  backdrop-filter: blur(10px); /* 毛玻璃模糊效果 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* 毛玻璃阴影 */
}

.create-playlist-card:hover {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.2);
}

.create-icon {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.create-playlist-card:hover .create-icon {
  color: #ff6b6b;
  transform: scale(1.1);
}

.create-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

/* 歌单卡片样式 - 方块布局 */
.playlist-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  width: 200px; /* 固定方块宽度 */
  height: 240px; /* 固定方块高度（包含信息区域） */
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.playlist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.1);
}

.playlist-cover {
  position: relative;
  width: 100%;
  height: 160px; /* 方块封面高度 */
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  margin-bottom: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-card:hover .playlist-cover img {
  transform: scale(1.05);
}

.overlay-top {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.overlay-bottom {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
}

.privacy-badge {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.privacy-badge.hover-only {
  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.3s ease;
}

.playlist-card:hover .privacy-badge.hover-only {
  opacity: 1;
  transform: translateY(0);
}

.play-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.playlist-info {
  padding: 15px;
  height: 80px; /* 固定信息区域高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  max-width: 100%;
}

.playlist-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

/* 空状态样式调整 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.7);
  grid-column: 1 / -1; /* 占满整个网格宽度 */
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  font-size: 18px;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.empty-desc {
  font-size: 14px;
  opacity: 0.7;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }

  .create-playlist-card,
  .playlist-card {
    width: 100%;
    min-width: 160px;
  }

  .playlist-card {
    height: 220px;
  }

  .playlist-cover {
    height: 140px;
  }
}

@media (max-width: 480px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .tab-content {
    padding: 15px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.checkbox-label-simple {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  padding: 8px 0;
  user-select: none;
  margin: 0;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  transition: all 0.3s ease;
  background: #fff;
  flex-shrink: 0;
  display: inline-block;
}

.checkbox-custom:hover {
  border-color: #ff6b6b;
}

.checkbox-input:checked + .checkbox-custom {
  background: #ff6b6b;
  border-color: #ff6b6b;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.privacy-desc {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  margin-left: 32px;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-create {
  background: #ff6b6b;
  color: white;
}

.btn-create:hover:not(:disabled) {
  background: #ff5252;
}

.btn-create:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 隐私遮罩层 */
.privacy-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s ease;
  pointer-events: none;
  z-index: 10;
}

.playlist-card:hover .privacy-overlay {
  opacity: 1;
}

/* 半透明遮罩背景 */
.privacy-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 8px 8px 0 0;
}

/* 大锁图标容器 */
.big-lock-icon {
  position: relative;
  z-index: 11;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: transform 0.4s ease;
}

.playlist-card:hover .big-lock-icon {
  transform: scale(1);
}

/* 隐私文字 */
.privacy-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
}

/* 原有的小锁图标样式保持不变 */
.privacy-badge.hover-only {
  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.3s ease;
}

.playlist-card:hover .privacy-badge.hover-only {
  opacity: 1;
  transform: translateY(0);
}

/* 确保原有的overlay层级正确 */
.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 5;
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

/* 添加青色透明滚动条样式 */
.profile-container::-webkit-scrollbar {
  width: 8px;
}

.profile-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.profile-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.profile-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* Tab内容区域滚动条样式 */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 107, 0.4);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 107, 0.6);
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: rgba(20, 20, 30, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  z-index: 9999;
  font-size: 14px;
  animation: contextMenuFadeIn 0.15s ease-out;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.context-menu-item:hover {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 200, 255, 0.1));
  color: #00ffff;
  transform: translateX(2px);
}

.context-menu-item svg {
  flex-shrink: 0;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.context-menu-item:hover svg {
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.5));
}

.context-menu-item span {
  flex: 1;
  font-weight: 500;
}

.context-menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  margin: 6px 12px;
}

.context-menu-item.delete-item {
  color: rgba(255, 100, 100, 0.9);
}

.context-menu-item.delete-item:hover {
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.1), rgba(255, 50, 50, 0.1));
  color: #ff6b6b;
}

.context-menu-item.delete-item:hover svg {
  filter: drop-shadow(0 0 4px rgba(255, 100, 100, 0.5));
}

/* 加载状态样式 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #00ffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading p {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}
</style>
