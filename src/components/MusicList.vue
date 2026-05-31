<template>
  <div class="music-list-container">
    <div class="music-list">
      <!-- 表头 -->
      <div class="list-header">
        <div class="col-number">#</div>
        <div class="col-title">标题</div>
        <div class="col-album">专辑</div>
        <div class="col-like">喜欢</div>
        <div class="col-duration">时长</div>
      </div>

      <!-- 音乐列表 -->
      <div class="list-body">
        <div
          v-for="(music, index) in musicList"
          :key="music.id"
          class="music-item"
          :class="{ playing: isCurrentSong(music) && isPlaying }"
        >
          <div class="col-number">
            <!-- 正在播放时显示音频可视化效果 -->
            <div v-if="isCurrentSong(music) && isPlaying" class="audio-visualizer">
              <div class="bar bar1"></div>
              <div class="bar bar2"></div>
              <div class="bar bar3"></div>
              <div class="bar bar4"></div>
            </div>
            <!-- 非播放状态显示序号，悬停时显示播放按钮 -->
            <div v-else class="track-number-container">
              <span class="track-number">{{ String(index + 1).padStart(2, '0') }}</span>
              <button class="play-btn-number" @click="handlePlay(music)">
                <img src="/src/components/images/play.svg" alt="播放" class="play-icon" />
              </button>
            </div>
          </div>

          <div class="col-title">
            <div class="title-content">
              <div class="cover-small">
                <img
                  v-if="music.coverFileUrl"
                  :src="cleanUrl(music.coverFileUrl)"
                  :alt="music.title"
                  @error="handleImageError"
                />
                <div v-else class="cover-placeholder-small">
                  <span class="music-icon-small">🎵</span>
                </div>
              </div>
              <div class="title-info">
                <div class="song-title">{{ music.title }}</div>
                <div class="song-artist">{{ music.artist }}</div>
              </div>
            </div>

            <!-- 悬浮时显示的操作按钮 -->
            <div class="action-buttons">
              <button class="action-btn download-btn" @click="handleDownload(music)" title="下载">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16L7 11L8.4 9.6L11 12.2V4H13V12.2L15.6 9.6L17 11L12 16Z"
                    fill="currentColor"
                  />
                  <path d="M5 20V18H19V20H5Z" fill="currentColor" />
                </svg>
              </button>
              <button
                class="action-btn playlist-btn"
                @click="handleAddToPlaylist(music)"
                title="加入歌单"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 10H2V12H14V10Z" fill="currentColor" />
                  <path d="M14 6H2V8H14V6Z" fill="currentColor" />
                  <path d="M2 16H10V14H2V16Z" fill="currentColor" />
                  <path d="M19 13V19L22 16L19 13Z" fill="currentColor" />
                  <path
                    d="M17 6V12C16.4 11.4 15.7 11 15 11C13.3 11 12 12.3 12 14S13.3 17 15 17 18 15.7 18 14V8H21V6H17Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button class="action-btn comment-btn" @click="handleComment(music)" title="评论">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 22C8.4 22 8 21.6 8 21V18H4C2.9 18 2 17.1 2 16V4C2 2.9 2.9 2 4 2H20C21.1 2 22 2.9 22 4V16C22 17.1 21.1 18 20 18H13.9L10.2 21.7C10 21.9 9.8 22 9.5 22H9ZM4 4V16H9V19L12 16H20V4H4Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button class="action-btn more-btn" @click="handleMore(music)" title="更多">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="col-album">
            {{ music.album || music.title }}
          </div>

          <div class="col-like">
            <button class="like-btn" @click="toggleLike(music)">
              <span class="heart" :class="{ favorited: isFavorite(music.id) }">
                {{ isFavorite(music.id) ? '❤️' : '🤍' }}
              </span>
            </button>
          </div>

          <div class="col-duration">
            {{ formatDuration(music.duration) || '03:12' }}
          </div>
        </div>
      </div>
    </div>
    <!-- 加入歌单弹窗 -->
    <Teleport to="body">
      <div v-if="showPlaylistModal" class="playlist-modal-overlay" @click="closePlaylistModal">
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
              <span>将添加歌曲：{{ selectedMusic?.title }} - {{ selectedMusic?.artist }}</span>
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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import { getMyPlaylists, addMusicToPlaylist, createPlaylist } from '../api/playlist'
import { addMusicToFavorites, removeMusicFromFavorites } from '../api/user'

// Props
// Props部分修改
const props = defineProps({
  musicList: {
    type: Array,
    default: () => [],
  },
  favoriteIds: {
    type: Set,
    default: () => new Set(),
  },
})

// 添加isFavorite函数
const isFavorite = (musicId) => {
  return props.favoriteIds && props.favoriteIds.has(musicId)
}

// Emits
const emit = defineEmits(['like-toggle', 'download', 'add-to-playlist', 'comment', 'more'])

const audioStore = useAudioStore()
const userStore = useUserStore()
const router = useRouter()
const { currentSong, isPlaying } = storeToRefs(audioStore)
const { isLoggedIn } = storeToRefs(userStore)
const { playSong, pauseSong } = audioStore

const handlePlay = async (music) => {
  try {
    if (isCurrentSong(music) && isPlaying.value) {
      pauseSong()
    } else {
      // 传递完整的播放列表数据
      await playSong(music, props.musicList)
    }
  } catch (err) {
    console.error('播放失败:', err)
  }
}

const isCurrentSong = (music) => {
  return currentSong.value?.id === music.id
}

const cleanUrl = (url) => {
  if (!url) return ''
  return url.replace(/[\r\n\t]/g, '').trim()
}

const formatDuration = (duration) => {
  if (!duration) return null
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const toggleLike = (music) => {
  // 根据当前喜欢状态决定添加还是移除
  if (isFavorite(music.id)) {
    removeFromFavorites(music)
  } else {
    addToFavorites(music)
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 操作按钮处理函数
const handleDownload = (music) => {
  emit('download', music)
}

// 歌单弹窗相关状态
// 在现有的ref导入后添加Toast相关状态
const showPlaylistModal = ref(false)
const selectedMusic = ref(null)
const userPlaylists = ref([])
const loadingPlaylists = ref(false)

// 添加创建歌单相关的状态
const showCreatePlaylistModal = ref(false)
const newPlaylistName = ref('')
const isCreatingPlaylist = ref(false)

const handleAddToPlaylist = async (music) => {
  // 检查用户是否已登录
  if (!isLoggedIn.value) {
    showToastMessage('请您先登录')
    return
  }

  selectedMusic.value = music
  showPlaylistModal.value = true

  // 调用API获取用户歌单
  await fetchUserPlaylists()
}

// 提取获取歌单列表的逻辑为独立函数
const fetchUserPlaylists = async () => {
  try {
    loadingPlaylists.value = true
    const response = await getMyPlaylists()

    if (response.code === 1 && response.data) {
      // 根据API返回的数据格式处理歌单列表
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

// 关闭弹窗
const closePlaylistModal = () => {
  showPlaylistModal.value = false
  selectedMusic.value = null
}

// 创建新歌单
const createNewPlaylist = () => {
  // 关闭收藏到歌单弹窗，显示创建歌单弹窗
  showPlaylistModal.value = false
  showCreatePlaylistModal.value = true
  newPlaylistName.value = ''
}

// 确认创建新歌单
const confirmCreatePlaylist = async () => {
  if (!newPlaylistName.value.trim()) {
    showToastMessage('请输入歌单名称', 'error')
    return
  }

  if (!selectedMusic.value) {
    showToastMessage('请选择要添加的歌曲', 'error')
    return
  }

  isCreatingPlaylist.value = true

  try {
    // 创建歌单
    const requestData = {
      name: newPlaylistName.value.trim(),
      isPublic: 1, // 默认公开
    }

    console.log('创建歌单请求数据:', requestData)
    const response = await createPlaylist(requestData)
    console.log('创建歌单响应:', response)

    // 获取新创建的歌单ID
    const newPlaylistId = response.data.id

    // 将歌曲添加到新创建的歌单
    await addMusicToPlaylist(newPlaylistId, selectedMusic.value.id)

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
  showPlaylistModal.value = true
}

// 添加到指定歌单
const addToPlaylist = async (playlist) => {
  if (!selectedMusic.value) {
    showToastMessage('请选择要添加的歌曲', 'error')
    return
  }

  try {
    // 直接调用API，request.js已经处理了成功/失败的判断
    await addMusicToPlaylist(playlist.id, selectedMusic.value.id)

    // 如果执行到这里，说明请求成功
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

// 处理歌单封面图片错误
const handlePlaylistImageError = (event) => {
  event.target.style.display = 'none'
}

const handleComment = (music) => {
  // 使用路由 state 传递数据，不暴露在URL中
  router.push({
    name: 'Comment',
    query: {
      id: music.id,
      type: 1,
    },
    state: {
      musicInfo: {
        id: music.id,
        title: music.title,
        artist: music.artist,
        album: music.album || music.title,
        cover: music.cover || music.coverFileUrl,
      },
    },
  })
}

const handleMore = (music) => {
  emit('more', music)
}

// 添加Toast相关函数
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
    // 检查用户是否已登录
    if (!isLoggedIn.value) {
      showToastMessage('请您先登录', 'error')
      return
    }

    // 调用API添加到喜欢列表
    const response = await addMusicToFavorites(music.id)
    console.log('收藏后的响应结果:', response)

    showToastMessage(`已添加「${music.title}」到喜欢列表`, 'success')

    // 更新全局收藏状态
    userStore.addToFavorites(music.id)

    // 触发父组件更新喜欢状态 - 传递操作类型和音乐信息
    emit('like-toggle', { music, action: 'add', success: true })
  } catch (error) {
    console.error('添加到喜欢列表失败:', error)
    showToastMessage('添加失败，请稍后重试', 'error')
    // 即使失败也要通知父组件，以便处理错误状态
    emit('like-toggle', { music, action: 'add', success: false, error })
  }
}

// 从喜欢列表中移除音乐
const removeFromFavorites = async (music) => {
  try {
    // 检查用户是否已登录
    if (!isLoggedIn.value) {
      showToastMessage('请您先登录', 'error')
      return
    }

    // 调用API从喜欢列表中移除
    const response = await removeMusicFromFavorites(music.id)
    console.log('取消收藏后的响应结果:', response)

    showToastMessage(`已从喜欢列表移除「${music.title}」`, 'success')

    // 更新全局收藏状态
    userStore.removeFromFavorites(music.id)

    // 触发父组件事件
    emit('like-toggle', { music, action: 'remove', success: true })
  } catch (error) {
    console.error('从喜欢列表移除失败:', error)
    showToastMessage('移除失败，请稍后重试', 'error')
    emit('like-toggle', { music, action: 'remove', success: false, error })
  }
}
</script>

<style scoped>
.music-list {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.list-header {
  display: grid;
  grid-template-columns: 60px 1fr 200px 80px 80px;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-transform: uppercase;
}

.music-item {
  display: grid;
  grid-template-columns: 60px 1fr 200px 80px 80px;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.2s;
  position: relative;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
}

.music-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.music-item.playing {
  background: rgba(0, 255, 255, 0.1);
}

.col-number {
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-number-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.track-number {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  transition: opacity 0.2s ease;
}

.play-btn-number {
  position: absolute;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.play-btn-number:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

.play-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg)
    brightness(104%) contrast(97%);
}

.music-item:hover .track-number {
  opacity: 0;
}

.music-item:hover .play-btn-number {
  opacity: 1;
}

.music-item.playing .track-number-container .track-number {
  display: block;
  opacity: 1;
}

.music-item.playing .play-btn-number {
  display: none;
}

.audio-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 20px;
}

.bar {
  width: 3px;
  background: #00ffff;
  border-radius: 1px;
  animation: bounce 1.2s ease-in-out infinite;
}

.bar1 {
  height: 8px;
  animation-delay: 0s;
}

.bar2 {
  height: 12px;
  animation-delay: 0.1s;
}

.bar3 {
  height: 16px;
  animation-delay: 0.2s;
}

.bar4 {
  height: 10px;
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.6;
  }
  40% {
    transform: scaleY(1);
    opacity: 1;
  }
  60% {
    transform: scaleY(0.8);
    opacity: 0.8;
  }
}

.col-title {
  display: flex;
  align-items: center;
  position: relative;
  overflow: visible;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.cover-small {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder-small {
  width: 100%;
  height: 100%;
  background: rgba(0, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-icon-small {
  font-size: 16px;
  color: #00ffff;
  opacity: 0.8;
}

.title-info {
  min-width: 0;
  flex: 1;
}

.song-title {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 操作按钮样式 - 定位在标题列的右侧，专辑列的左侧 */
.action-buttons {
  position: absolute;
  right: 180px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
  z-index: 10;
}

.music-item:hover .action-buttons {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.action-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  transform: scale(1.1);
}

.download-btn:hover {
  color: #4caf50;
}

.playlist-btn:hover {
  color: #2196f3;
}

.comment-btn:hover {
  color: #ff9800;
}

.more-btn:hover {
  color: #9c27b0;
}

.col-album {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-like {
  display: flex;
  justify-content: center;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.like-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  transform: scale(1.1);
}

.col-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
}

@media (max-width: 768px) {
  .list-header,
  .music-item {
    grid-template-columns: 50px 1fr 60px;
    gap: 12px;
  }

  .col-album,
  .col-duration {
    display: none;
  }

  .action-buttons {
    right: -5px;
    gap: 2px;
    padding: 2px 4px;
  }

  .action-btn {
    width: 20px;
    height: 20px;
    padding: 2px;
  }
}

/* 歌单弹窗样式 */
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
  /* 确保不受父容器影响 */
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
  /* 确保弹窗本身不受影响 */
  position: relative;
  transform: none !important;
  margin: 0 !important;
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

/* 音乐列表透明滚动条样式 */
.list-body::-webkit-scrollbar {
  width: 8px;
}

.list-body::-webkit-scrollbar-track {
  background: transparent;
}

.list-body::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.list-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.list-body::-webkit-scrollbar-thumb:active {
  background: rgba(0, 0, 0, 0.3);
}

/* 滚动条角落透明 */
.list-body::-webkit-scrollbar-corner {
  background: transparent;
}

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

/* 创建歌单弹窗样式优化 */
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
}

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

/* 响应式设计 */
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

/* 动画效果 */
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

.heart.favorited {
  color: #ff4757;
}

.like-btn:hover .heart {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 确保Toast固定定位 */
:deep(.toast-container.fixed) {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  left: auto !important;
  transform: none !important;
  z-index: 10002 !important;
}
</style>
