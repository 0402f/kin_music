<template>
  <div class="audio-player">
    <!-- 背景动态粒子效果 -->
    <div class="background-particles">
      <div class="particle" v-for="n in 20" :key="n"></div>
    </div>

    <!-- 音频可视化波形 -->
    <div class="audio-visualizer" v-if="isPlaying">
      <div class="visualizer-bar" v-for="n in 32" :key="n"></div>
    </div>

    <div class="player-content">
      <!-- 修改歌曲信息区域，添加点击事件 -->
      <div class="song-info" @click="showLyricsView" v-if="currentSong">
        <div class="cover-container">
          <img
            :src="currentSong.cover || '/default-cover.jpg'"
            :alt="currentSong.title"
            class="cover"
          />
          <!-- 旋转光环效果 -->
          <div class="rotating-ring" v-if="isPlaying"></div>
          <!-- 脉冲效果 -->
          <div class="pulse-effect" v-if="isPlaying"></div>
          <div class="cover-overlay" v-if="isPlaying">
            <div class="sound-wave">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
          </div>
        </div>
        <div class="text-info">
          <h4 class="title animated-text">{{ currentSong.title }}</h4>
          <p class="artist animated-text">{{ currentSong.artist }}</p>
        </div>
      </div>

      <!-- 当没有歌曲时显示的占位内容 -->
      <div class="song-info placeholder" v-else>
        <div class="cover-container">
          <div class="placeholder-cover">
            <div class="music-icon">🎵</div>
          </div>
        </div>
        <div class="text-info">
          <h4 class="title">选择一首歌曲开始播放</h4>
          <p class="artist">暂无播放内容</p>
        </div>
      </div>

      <!-- 修改控制区域，在现有播放按钮左右添加按钮 -->
      <!-- 修改控制区域，统一按钮样式 -->
      <div class="controls">
        <!-- 上一首按钮 -->
        <!-- 在模板中添加点击事件 -->
        <button class="control-btn prev-btn" :disabled="!currentSong" @click="handlePrevious">
          <div class="btn-glow"></div>
          <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <!-- 播放/暂停按钮 - 修改为统一样式但保持功能 -->
        <button @click="togglePlay" class="control-btn play-btn" :disabled="!currentSong">
          <div class="btn-glow"></div>
          <svg v-if="!isPlaying" class="control-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="control-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        <!-- 下一首按钮 -->
        <button class="control-btn next-btn" :disabled="!currentSong" @click="handleNext">
          <div class="btn-glow"></div>
          <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <div class="progress-section">
        <span class="time">{{ currentSong ? formattedCurrentTime : '0:00' }}</span>
        <div class="progress-container">
          <div class="progress-bar" @click="handleProgressClick">
            <!-- 进度条光效 -->
            <div class="progress-glow"></div>
            <div class="progress-fill" :style="{ width: progress + '%' }">
              <div class="progress-thumb"></div>
              <!-- 进度条粒子效果 -->
              <div class="progress-particles" v-if="isPlaying">
                <div class="progress-particle" v-for="n in 5" :key="n"></div>
              </div>
            </div>
          </div>
        </div>
        <span class="time">{{ currentSong ? formattedDuration : '0:00' }}</span>
      </div>

      <!-- 新增功能按钮区域 -->
      <div class="function-buttons">
        <!-- 播放模式按钮 -->
        <button
          class="function-btn"
          :class="{ active: playMode === PLAY_MODES.SHUFFLE }"
          @click="toggleShuffle"
          :title="playModeText"
          :disabled="!currentSong"
        >
          <div v-html="getPlayModeIcon()" class="play-mode-icon"></div>
        </button>

        <!-- 喜欢按钮 -->
        <button
          class="function-btn like-btn"
          :class="{ active: isLiked }"
          @click="toggleLike"
          :disabled="!currentSong"
        >
          <svg class="function-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>

        <!-- 收藏到歌单按钮 -->
        <button
          class="function-btn playlist-btn"
          @click="showPlaylistModal"
          :disabled="!currentSong"
        >
          <svg class="function-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"
            />
          </svg>
        </button>

        <!-- 评论按钮 -->
        <button class="function-btn comment-btn" @click="showComments" :disabled="!currentSong">
          <svg class="function-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
            />
          </svg>
        </button>
      </div>

      <!-- 音量控制按钮 -->
      <div class="volume-section">
        <div
          class="volume-btn-container"
          @mouseenter="showVolumeSlider = true"
          @mouseleave="showVolumeSlider = false"
        >
          <!-- 音量按钮 -->
          <button class="function-btn volume-btn">
            <svg class="function-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                v-if="volume > 0.5"
                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
              />
              <path
                v-else-if="volume > 0"
                d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
              />
              <path
                v-else
                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
              />
            </svg>
          </button>

          <!-- 悬浮显示的音量滑块 -->
          <div class="volume-slider-popup" :class="{ show: showVolumeSlider }">
            <div class="volume-percentage">{{ Math.round(volume * 100) }}%</div>
            <div
              class="vertical-volume-slider"
              @mousedown="startVolumeSlide"
              @wheel.prevent="handleVolumeWheel"
              ref="volumeSliderRef"
            >
              <div class="volume-track">
                <div class="volume-fill" :style="{ height: volume * 100 + '%' }"></div>
                <div class="volume-thumb" :style="{ bottom: volume * 100 + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加入歌单弹窗 -->
    <Teleport to="body">
      <div v-if="showPlaylistModalState" class="playlist-modal-overlay" @click="closePlaylistModal">
        <div class="playlist-modal" @click.stop>
          <div class="modal-header">
            <h3>收藏到歌单</h3>
            <button class="close-btn" @click="closePlaylistModal">
              <svg
                width="20"
                height="20"
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
            <!-- 创建新歌单选项 -->
            <div class="playlist-item create-new" @click="createNewPlaylist">
              <div class="playlist-cover">
                <svg
                  width="24"
                  height="24"
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
              <div class="playlist-info">
                <div class="playlist-name">创建新歌单</div>
              </div>
            </div>

            <!-- 现有歌单列表 -->
            <div
              v-for="playlist in userPlaylists"
              :key="playlist.id"
              class="playlist-item"
              @click="addToPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <img
                  v-if="playlist.coverUrl"
                  :src="playlist.coverUrl"
                  :alt="playlist.name"
                  @error="handlePlaylistImageError"
                />
                <div v-else class="playlist-cover-placeholder">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 18V5L21 12L9 18Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div class="playlist-info">
                <div class="playlist-name">{{ playlist.name }}</div>
                <div class="playlist-count">{{ playlist.songCount }}首音乐</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 创建歌单弹窗 -->
    <Teleport to="body">
      <div
        v-if="showCreatePlaylistModal"
        class="playlist-modal-overlay"
        @click="closeCreatePlaylistModal"
      >
        <div class="create-playlist-modal" @click.stop>
          <div class="modal-header">
            <h3>创建新歌单</h3>
            <button class="close-btn" @click="closeCreatePlaylistModal">
              <svg
                width="20"
                height="20"
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
                v-model="newPlaylistName"
                type="text"
                placeholder="请输入歌单名称"
                maxlength="50"
                @keyup.enter="confirmCreatePlaylist"
              />
            </div>

            <div class="selected-music-info">
              <span>将添加歌曲：{{ currentSong?.title }} - {{ currentSong?.artist }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" @click="closeCreatePlaylistModal">取消</button>
            <button
              class="btn btn-primary"
              @click="confirmCreatePlaylist"
              :disabled="isCreatingPlaylist || !newPlaylistName.trim()"
            >
              {{ isCreatingPlaylist ? '创建中...' : '创建并添加' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { addMusicToFavorites, removeMusicFromFavorites } from '../api/user'
import { getMyPlaylists, addMusicToPlaylist, createPlaylist } from '@/api/playlist'

const audioStore = useAudioStore()
const userStore = useUserStore()
const router = useRouter()

const {
  currentSong,
  isPlaying,
  progress,
  formattedCurrentTime,
  formattedDuration,
  volume,
  playMode,
  playModeText,
} = storeToRefs(audioStore)

// 使用全局收藏状态
const { favoriteIds, isLoggedIn } = storeToRefs(userStore)

// Destructure PLAY_MODES directly from audioStore, not from storeToRefs
const { PLAY_MODES } = audioStore

// 只保留一个解构赋值声明
const { togglePlay, setVolume, setCurrentTime, playPrevious, playNext, togglePlayMode } = audioStore

const handleProgressClick = (event) => {
  const progressBar = event.currentTarget
  const rect = progressBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * audioStore.duration
  setCurrentTime(newTime)
}

// 跳转到歌词页面
const showLyricsView = () => {
  if (currentSong.value && currentSong.value.id) {
    router.push({
      name: 'lyrics',
      params: { id: currentSong.value.id },
    })
  }
}

// 添加按钮处理方法
const handlePrevious = () => {
  playPrevious()
}

const handleNext = () => {
  playNext()
}

const showVolumeSlider = ref(false)
const volumeSliderRef = ref(null)

// 修改喜欢状态的计算属性
const isLiked = computed(() => {
  if (!currentSong.value || !isLoggedIn.value) {
    return false
  }
  return favoriteIds.value.has(currentSong.value.id)
})

// 监听登录状态变化
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    // 用户登录时获取收藏列表
    await userStore.fetchFavoriteList()
  } else {
    // 用户登出时清空收藏状态（已在 store 的 logout 方法中处理）
  }
})

// 组件挂载时的处理
onMounted(async () => {
  // 如果用户已登录但收藏列表为空，则获取收藏列表
  if (isLoggedIn.value && favoriteIds.value.size === 0) {
    await userStore.fetchFavoriteList()
  }
})

// 修改切换随机播放模式方法
const toggleShuffle = () => {
  togglePlayMode()
}

// 获取播放模式图标
const getPlayModeIcon = () => {
  switch (playMode.value) {
    case PLAY_MODES.SEQUENCE:
      return `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4z"/>
          <path d="M4 7h12.17l-5.59-5.59L12 0l8 8-8 8-1.41-1.41L16.17 9H4z" transform="translate(0,4)"/>
        </svg>`
    case PLAY_MODES.LOOP:
      return `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
        </svg>`
    case PLAY_MODES.SHUFFLE:
      return `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>`
    default:
      return `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14l5-5 5 5z"/>
        </svg>`
  }
}

// Toast消息显示函数
const showToastMessage = (message, type = 'error') => {
  // 创建toast元素
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    ${type === 'success' ? 'background-color: #10b981;' : 'background-color: #ef4444;'}
  `

  document.body.appendChild(toast)

  // 显示动画
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  }, 100)

  // 3秒后移除
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// 添加音乐到喜欢列表
const addToFavorites = async (music) => {
  try {
    if (!isLoggedIn.value) {
      showToastMessage('请您先登录', 'error')
      return
    }

    const response = await addMusicToFavorites(music.id)
    console.log('收藏后的响应结果:', response)

    showToastMessage(`已添加「${music.title}」到喜欢列表`, 'success')

    // 更新全局收藏状态
    await userStore.addToFavorites(music.id)
  } catch (error) {
    console.error('添加到喜欢列表失败:', error)
    showToastMessage('添加失败，请稍后重试', 'error')
  }
}

// 从喜欢列表中移除音乐
const removeFromFavorites = async (music) => {
  try {
    if (!isLoggedIn.value) {
      showToastMessage('请您先登录', 'error')
      return
    }

    const response = await removeMusicFromFavorites(music.id)
    console.log('取消收藏后的响应结果:', response)

    showToastMessage(`已从喜欢列表移除「${music.title}」`, 'success')

    // 更新全局收藏状态
    userStore.removeFromFavorites(music.id)
  } catch (error) {
    console.error('从喜欢列表移除失败:', error)
    showToastMessage('移除失败，请稍后重试', 'error')
  }
}

// 修改切换喜欢状态方法
const toggleLike = async () => {
  if (!currentSong.value) return

  if (isLiked.value) {
    await removeFromFavorites(currentSong.value)
  } else {
    await addToFavorites(currentSong.value)
  }
}

// 歌单相关状态
const showPlaylistModalState = ref(false)
const userPlaylists = ref([])
const loadingPlaylists = ref(false)
const showCreatePlaylistModal = ref(false)
const newPlaylistName = ref('')
const isCreatingPlaylist = ref(false)

// 显示收藏到歌单的模态框
const showPlaylistModal = async () => {
  if (!currentSong.value) return

  // 检查用户是否已登录
  if (!isLoggedIn.value) {
    showToastMessage('请您先登录')
    return
  }

  showPlaylistModalState.value = true
  // 调用API获取用户歌单
  await fetchUserPlaylists()
}

// 获取用户歌单列表
const fetchUserPlaylists = async () => {
  try {
    loadingPlaylists.value = true
    const response = await getMyPlaylists()

    if (response.code === 1 && response.data) {
      userPlaylists.value = response.data.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        songCount: playlist.songCount,
        coverUrl: playlist.coverFileUrl,
      }))
    } else {
      console.error('获取歌单失败:', response.msg)
      userPlaylists.value = []
    }
  } catch (error) {
    console.error('获取歌单出错:', error)
    userPlaylists.value = []
  } finally {
    loadingPlaylists.value = false
  }
}

// 关闭加入歌单弹窗
const closePlaylistModal = () => {
  showPlaylistModalState.value = false
}

// 创建新歌单
const createNewPlaylist = () => {
  showPlaylistModalState.value = false
  showCreatePlaylistModal.value = true
  newPlaylistName.value = ''
}

// 确认创建新歌单
const confirmCreatePlaylist = async () => {
  if (!newPlaylistName.value.trim()) {
    showToastMessage('请输入歌单名称', 'error')
    return
  }

  if (!currentSong.value) {
    showToastMessage('当前没有播放歌曲', 'error')
    return
  }

  isCreatingPlaylist.value = true

  try {
    // 创建歌单
    const requestData = {
      name: newPlaylistName.value.trim(),
      isPublic: 1, // 默认公开
    }

    const response = await createPlaylist(requestData)
    const newPlaylistId = response.data.id

    // 将歌曲添加到新创建的歌单
    await addMusicToPlaylist(newPlaylistId, currentSong.value.id)

    showToastMessage(`成功创建歌单「${newPlaylistName.value}」并添加歌曲`, 'success')

    // 关闭弹窗并重置状态
    closeCreatePlaylistModal()
    closePlaylistModal()

    // 刷新歌单列表
    await fetchUserPlaylists()
  } catch (error) {
    console.error('创建歌单失败:', error)
    showToastMessage(error.message || '创建歌单失败', 'error')
  } finally {
    isCreatingPlaylist.value = false
  }
}

// 关闭创建歌单弹窗
const closeCreatePlaylistModal = () => {
  showCreatePlaylistModal.value = false
  newPlaylistName.value = ''
  // 重新显示收藏到歌单弹窗
  showPlaylistModalState.value = true
}

// 添加到指定歌单
const addToPlaylist = async (playlist) => {
  if (!currentSong.value) {
    showToastMessage('当前没有播放歌曲', 'error')
    return
  }

  try {
    await addMusicToPlaylist(playlist.id, currentSong.value.id)
    showToastMessage(`成功添加到歌单「${playlist.name}」`, 'success')
    closePlaylistModal()
  } catch (error) {
    console.error('添加到歌单失败:', error)
    if (error.response?.status === 409) {
      showToastMessage('歌曲已存在于该歌单中', 'error')
    } else if (error.response?.status === 404) {
      showToastMessage('歌单或歌曲不存在', 'error')
    } else {
      showToastMessage(error.message || '添加失败，请稍后重试', 'error')
    }
  }
}

// 处理歌单封面图片加载错误
const handlePlaylistImageError = (event) => {
  event.target.style.display = 'none'
}

// 显示评论
const showComments = () => {
  if (!currentSong.value) return

  // 跳转到评论页面，传递歌曲信息作为查询参数
  router.push({
    name: 'Comment',
    query: {
      id: currentSong.value.id,
      title: currentSong.value.title,
      artist: currentSong.value.artist,
      album: currentSong.value.album || currentSong.value.title,
      cover: currentSong.value.cover || currentSong.value.coverFileUrl,
    },
  })
}

// 音量控制相关
const isDragging = ref(false)

// 开始音量滑动
const startVolumeSlide = (event) => {
  isDragging.value = true
  updateVolumeFromPosition(event)

  const handleMouseMove = (e) => {
    if (isDragging.value) {
      updateVolumeFromPosition(e)
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 根据鼠标位置更新音量
const updateVolumeFromPosition = (event) => {
  if (!volumeSliderRef.value) return

  const rect = volumeSliderRef.value.getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height
  const newVolume = Math.max(0, Math.min(1, 1 - y / height))

  setVolume(newVolume)
}

// 处理滚轮事件
const handleVolumeWheel = (event) => {
  const delta = event.deltaY > 0 ? -0.05 : 0.05
  const newVolume = Math.max(0, Math.min(1, volume.value + delta))
  setVolume(newVolume)
}
</script>

<style scoped>
/* 背景粒子效果 */
.background-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.particle:nth-child(odd) {
  animation-delay: -2s;
}

.particle:nth-child(3n) {
  animation-delay: -4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(100px) translateX(0px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(50px);
    opacity: 0;
  }
}

/* 随机分布粒子 */
.particle:nth-child(1) {
  left: 10%;
  animation-duration: 8s;
}
.particle:nth-child(2) {
  left: 20%;
  animation-duration: 6s;
}
.particle:nth-child(3) {
  left: 30%;
  animation-duration: 7s;
}
.particle:nth-child(4) {
  left: 40%;
  animation-duration: 9s;
}
.particle:nth-child(5) {
  left: 50%;
  animation-duration: 5s;
}
.particle:nth-child(6) {
  left: 60%;
  animation-duration: 8s;
}
.particle:nth-child(7) {
  left: 70%;
  animation-duration: 6s;
}
.particle:nth-child(8) {
  left: 80%;
  animation-duration: 7s;
}
.particle:nth-child(9) {
  left: 90%;
  animation-duration: 9s;
}
.particle:nth-child(10) {
  left: 15%;
  animation-duration: 5s;
}

/* 音频可视化效果 */
.audio-visualizer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  display: flex;
  align-items: end;
  gap: 2px;
  padding: 0 20px;
  pointer-events: none;
}

.visualizer-bar {
  flex: 1;
  background: linear-gradient(to top, #ff6b6b, #feca57);
  border-radius: 2px 2px 0 0;
  animation: visualizer 0.8s ease-in-out infinite;
  opacity: 0.7;
}

.visualizer-bar:nth-child(odd) {
  animation-delay: 0.1s;
}

.visualizer-bar:nth-child(3n) {
  animation-delay: 0.2s;
}

.visualizer-bar:nth-child(4n) {
  animation-delay: 0.3s;
}

@keyframes visualizer {
  0%,
  100% {
    height: 2px;
  }
  50% {
    height: 8px;
  }
}

/* 旋转光环效果 */
.rotating-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid transparent;
  border-top: 2px solid rgba(255, 107, 107, 0.8);
  border-right: 2px solid rgba(254, 202, 87, 0.6);
  border-radius: 50%;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 脉冲效果 */
.pulse-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

/* 文字动画效果 */
.animated-text {
  animation: textGlow 3s ease-in-out infinite alternate;
}

@keyframes textGlow {
  from {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  to {
    text-shadow:
      0 1px 3px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 255, 255, 0.3);
  }
}

/* 按钮内部光效 */
.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  animation: btnGlow 2s ease-in-out infinite;
}

@keyframes btnGlow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* 进度条光效 */
.progress-glow {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  bottom: -2px;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.5), transparent);
  border-radius: 3px;
  animation: progressGlow 2s ease-in-out infinite;
}

@keyframes progressGlow {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* 进度条粒子效果 */
.progress-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.progress-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: progressParticle 1.5s linear infinite;
}

.progress-particle:nth-child(1) {
  animation-delay: 0s;
}
.progress-particle:nth-child(2) {
  animation-delay: 0.3s;
}
.progress-particle:nth-child(3) {
  animation-delay: 0.6s;
}
.progress-particle:nth-child(4) {
  animation-delay: 0.9s;
}
.progress-particle:nth-child(5) {
  animation-delay: 1.2s;
}

@keyframes progressParticle {
  0% {
    left: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

/* 音量图标动画 */
.animated-icon {
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 原有样式保持不变 */
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  padding: 16px 20px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1001;
  overflow: visible;
}

.player-content {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border-radius: 12px;
  padding: 4px;
}

.song-info:hover {
  transform: scale(1.02);
  background: rgba(255, 255, 255, 0.1);
}

.song-info:active {
  transform: scale(0.98);
}

.cover-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.cover {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.cover-container:hover .cover {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sound-wave {
  display: flex;
  gap: 2px;
  align-items: end;
}

.wave-bar {
  width: 3px;
  background: #ffffff;
  border-radius: 2px;
  animation: wave 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}

.wave-bar:nth-child(2) {
  height: 12px;
  animation-delay: 0.2s;
}

.wave-bar:nth-child(3) {
  height: 8px;
  animation-delay: 0.4s;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.text-info {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.artist {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 修改控制区域布局 */
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 统一所有控制按钮样式 */
.control-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.control-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
}

.control-btn:hover:not(:disabled)::before {
  left: 100%;
}

.control-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn:disabled:hover {
  transform: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.control-btn .control-icon {
  width: 20px;
  height: 20px;
  z-index: 1;
}

/* 播放按钮稍微大一点以突出重要性，但使用与其他按钮一致的样式 */
.play-btn {
  width: 50px;
  height: 50px;
  /* 移除橙红色背景，使用与control-btn一致的样式 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* 保持悬浮时的效果 */
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.play-btn .control-icon {
  width: 22px;
  height: 22px;
}

.play-btn:hover {
  /* 悬浮时保持相同效果，避免再次变化 */
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
}

.control-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  z-index: 1;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  max-width: 450px;
}

.time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  min-width: 45px;
  text-align: center;
  font-weight: 500;
}

.progress-container {
  flex: 1;
  padding: 8px 0;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.progress-bar:hover {
  height: 8px;
  margin-top: -1px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #feca57);
  border-radius: 3px;
  transition: width 0.1s;
  position: relative;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.progress-thumb {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

/* 音量控制样式 */
.volume-section {
  display: flex;
  align-items: center;
  position: relative;
  overflow: visible; /* 确保音量滑块弹窗不被裁剪 */
}

.volume-btn-container {
  position: relative;
  overflow: visible; /* 允许弹窗溢出容器 */
}

.volume-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.1);
}

.volume-slider-popup {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 12px 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1002;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center; /* 确保内容居中 */
}

.volume-slider-popup.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-5px);
}

.volume-percentage {
  text-align: center;
  color: white;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  min-width: 35px;
}

.vertical-volume-slider {
  width: 20px;
  height: 100px;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center; /* 添加垂直居中 */
}

.volume-track {
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  margin: 0 auto; /* 确保轨道水平居中 */
}

.volume-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(0deg, #ff6b6b, #feca57);
  border-radius: 2px;
  transition: height 0.1s ease;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
}

.volume-thumb {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: bottom 0.1s ease;
}

.volume-thumb:hover {
  transform: translateX(-50%) translateY(50%) scale(1.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-player {
    padding: 12px 16px;
  }

  .player-content {
    gap: 16px;
  }

  .song-info {
    min-width: 200px;
  }

  .cover-container {
    width: 50px;
    height: 50px;
  }

  .play-btn {
    width: 45px;
    height: 45px;
  }

  .progress-section {
    max-width: 250px;
  }

  .volume-slider-popup {
    bottom: 45px;
  }

  .vertical-volume-slider {
    height: 80px;
  }
}

@media (max-width: 480px) {
  .volume-section {
    display: none;
  }
}

/* 功能按钮区域 */
.function-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 20px;
}

.function-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.function-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.1);
}

.function-btn:active {
  transform: scale(0.95);
}

.function-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.function-icon {
  width: 18px;
  height: 18px;
  transition: all 0.3s ease;
}

/* 特定按钮的样式 */
.like-btn.active {
  color: #ef4444 !important; /* 红色 */
}

.like-btn.active .function-icon {
  fill: #ef4444 !important;
  animation: heartBeat 0.6s ease-in-out;
}

/* Toast样式 */
.toast {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
}

.play-mode-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-mode-icon svg {
  width: 100%;
  height: 100%;
}

/* 不同播放模式的颜色 */
.function-btn.active {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.function-btn.active:hover {
  background: rgba(255, 107, 107, 0.2);
}

/* 播放模式特定样式 */
.function-btn[title='单曲循环'].active {
  color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
}

.function-btn[title='单曲循环'].active:hover {
  background: rgba(78, 205, 196, 0.2);
}

.function-btn[title='随机播放'].active {
  color: #45b7d1;
  background: rgba(69, 183, 209, 0.1);
}

.function-btn[title='随机播放'].active:hover {
  background: rgba(69, 183, 209, 0.2);
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 占位符样式 */
.placeholder-cover {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.music-icon {
  font-size: 24px;
  opacity: 0.6;
}

.song-info.placeholder {
  opacity: 0.7;
}

.song-info.placeholder .title {
  color: rgba(255, 255, 255, 0.8);
}

.song-info.placeholder .artist {
  color: rgba(255, 255, 255, 0.6);
}

.play-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn:disabled:hover {
  transform: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* 歌单模态框样式 */
.playlist-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999 !important;
  transform: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.playlist-modal {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-height: 500px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  transform: none !important;
  margin: 0 !important;
}

.create-playlist-modal {
  background: white;
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px 24px;
  max-height: 400px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: #f8f9fa;
}

.playlist-item.create-new {
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-cover-placeholder {
  color: #999;
}

.create-new .playlist-cover {
  background: #e3f2fd;
  color: #1976d2;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-count {
  font-size: 12px;
  color: #666;
}

/* 创建歌单模态框特定样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #fafbfc;
}

.form-group input:focus {
  outline: none;
  border-color: #1976d2;
  background: white;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-group input::placeholder {
  color: #999;
}

.selected-music-info {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  font-size: 13px;
  color: #495057;
  margin-bottom: 24px;
  border-left: 4px solid #1976d2;
  position: relative;
}

.selected-music-info::before {
  content: '🎵';
  position: absolute;
  left: 16px;
  top: 16px;
  font-size: 16px;
}

.selected-music-info span {
  margin-left: 24px;
  display: block;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-cancel:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .create-playlist-modal {
    width: 95vw;
    margin: 20px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
