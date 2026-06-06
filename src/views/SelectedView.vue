<template>
  <div class="selected-view" ref="selectedViewRef">
    <!-- 背景粒子效果 -->
    <div class="bg-particles" ref="particlesRef">
      <div
        v-for="n in 20"
        :key="'p-' + n"
        class="particle"
        :ref="(el) => { if (el) particles[n - 1] = el }"
      ></div>
    </div>

    <!-- 头部区域 -->
    <header class="view-header" ref="headerRef">
      <div class="header-top">
        <h1 class="view-title" ref="titleRef">
          <span class="title-icon" ref="titleIconRef">🎵</span>
          <span class="title-text">曲 库</span>
          <span class="title-glow"></span>
        </h1>
        <div class="header-actions" ref="headerActionsRef">
          <button
            class="view-toggle-btn"
            :class="{ active: viewMode === 'grid' }"
            @click="toggleViewMode"
            ref="viewToggleRef"
          >
            <svg v-if="viewMode === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="3" rx="1.5" fill="currentColor" />
              <rect x="3" y="10" width="18" height="3" rx="1.5" fill="currentColor" />
              <rect x="3" y="17" width="18" height="3" rx="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      <div class="header-divider" ref="dividerRef"></div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section" ref="loadingRef">
      <div class="loading-visualizer">
        <div v-for="n in 6" :key="'lbar-' + n" class="loading-bar" :style="{ animationDelay: `${(n - 1) * 0.12}s` }"></div>
      </div>
      <p class="loading-text">正在加载音乐库...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-section" ref="errorRef">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchMusicList" ref="retryBtnRef">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M20.49 9C19.45 5.5 16.04 3 12 3C7.96 3 4.55 5.5 3.51 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3.51 15C4.55 18.5 7.96 21 12 21C16.04 21 19.45 18.5 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        重新加载
      </button>
    </div>

    <!-- 音乐列表 / 网格 -->
    <div v-else class="music-content" :class="viewMode" ref="contentRef">
      <div
        v-for="(music, index) in musicList"
        :key="music.id"
        class="music-card"
        :class="{
          playing: isCurrentSong(music) && isPlaying,
          'view-list': viewMode === 'list',
          'view-grid': viewMode === 'grid',
        }"
        :ref="(el) => { if (el) cardRefs[index] = el }"
        :data-index="index"
        @click="handleCardClick(music)"
      >
        <!-- 列表视图 -->
        <template v-if="viewMode === 'list'">
          <div class="card-number">
            <div v-if="isCurrentSong(music) && isPlaying" class="playing-indicator">
              <span class="pulse-bar" v-for="b in 4" :key="b"></span>
            </div>
            <span v-else class="track-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <button class="play-overlay-btn" @click.stop="handlePlay(music)">
              <svg v-if="!isCurrentSong(music) || !isPlaying" width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          </div>
          <div class="card-cover" :class="{ 'has-glow': isCurrentSong(music) && isPlaying }">
            <img
              v-if="music.coverFileUrl"
              :src="cleanUrl(music.coverFileUrl)"
              :alt="music.title"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <div v-else class="cover-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,255,255,0.6)">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div class="cover-rings" v-if="isCurrentSong(music) && isPlaying"></div>
          </div>
          <div class="card-info">
            <div class="card-title" :title="music.title">{{ music.title }}</div>
            <div class="card-artist" :title="music.artist">{{ music.artist }}</div>
          </div>
          <div class="card-album" :title="music.album || music.title">{{ music.album || music.title }}</div>
          <div class="card-actions" @click.stop>
            <button class="icon-btn like-btn-card" :class="{ active: isFavorite(music.id) }" @click="toggleLike(music)" title="喜欢">
              <svg width="16" height="16" viewBox="0 0 24 24" :fill="isFavorite(music.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button class="icon-btn" @click="handleAddToPlaylist(music)" title="添加到歌单">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button class="icon-btn" @click="handleComment(music)" title="评论">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button class="icon-btn" @click="handleDownload(music)" title="下载">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
          <div class="card-duration">{{ formatDuration(music.duration) }}</div>
          <!-- 移动端更多按钮 -->
          <div class="card-more-mobile">
            <button class="more-mobile-btn" @click.stop="openMobileSheet(music)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
          </div>
        </template>

        <!-- 网格视图 -->
        <template v-else>
          <div class="grid-cover-wrapper">
            <img
              v-if="music.coverFileUrl"
              :src="cleanUrl(music.coverFileUrl)"
              :alt="music.title"
              class="grid-cover"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <div v-else class="grid-cover-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(0,255,255,0.6)">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div class="grid-overlay">
              <button class="grid-play-btn" @click.stop="handlePlay(music)">
                <svg v-if="!isCurrentSong(music) || !isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
              <div class="grid-actions-row" @click.stop>
                <button class="grid-icon-btn" :class="{ active: isFavorite(music.id) }" @click="toggleLike(music)">
                  <svg width="15" height="15" viewBox="0 0 24 24" :fill="isFavorite(music.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button class="grid-icon-btn" @click="handleAddToPlaylist(music)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="playing-ring" v-if="isCurrentSong(music) && isPlaying"></div>
          </div>
          <div class="grid-info">
            <div class="grid-title" :title="music.title">{{ music.title }}</div>
            <div class="grid-artist" :title="music.artist">{{ music.artist }}</div>
          </div>
        </template>
      </div>

      <!-- 空状态 -->
      <div v-if="musicList.length === 0 && !loading" class="empty-state" ref="emptyRef">
        <div class="empty-icon">🎶</div>
        <p class="empty-title">曲库空空如也</p>
        <p class="empty-desc">还没有任何音乐，快去上传吧</p>
      </div>

      <!-- 歌曲总数 - 列表底部 -->
      <div v-if="musicList.length > 0 && !loading" class="song-count-footer">
        共 {{ musicList.length }} 首歌曲
      </div>
    </div>

    <!-- 歌单弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showPlaylistModal" class="playlist-modal-overlay" @click="closePlaylistModal">
          <div class="playlist-modal" @click.stop ref="playlistModalRef">
            <div class="modal-header">
              <h3>收藏到歌单</h3>
              <button class="close-btn" @click="closePlaylistModal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6L18 18" />
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="playlist-item create-new" @click="createNewPlaylist">
                <div class="playlist-cover-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5V19M5 12H19" />
                  </svg>
                </div>
                <span>创建新歌单</span>
              </div>
              <div
                v-for="playlist in userPlaylists"
                :key="playlist.id"
                class="playlist-item"
                @click="addToPlaylist(playlist)"
              >
                <div class="playlist-cover-icon">
                  <img v-if="playlist.coverUrl" :src="playlist.coverUrl" :alt="playlist.name" @error="(e) => { e.target.style.display = 'none' }" />
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5L21 12L9 18Z" /></svg>
                </div>
                <div class="playlist-meta">
                  <span class="playlist-name">{{ playlist.name }}</span>
                  <span class="playlist-count">{{ playlist.songCount }}首</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 创建歌单弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showCreatePlaylistModal" class="playlist-modal-overlay" @click="closeCreatePlaylistModal">
          <div class="create-playlist-modal" @click.stop>
            <div class="modal-header">
              <h3>创建新歌单</h3>
              <button class="close-btn" @click="closeCreatePlaylistModal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6L18 18" />
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="playlistName">歌单名称</label>
                <input id="playlistName" v-model="newPlaylistName" type="text" placeholder="请输入歌单名称" maxlength="50" @keyup.enter="confirmCreatePlaylist" />
              </div>
              <div class="selected-music-info">
                <span>将添加歌曲：{{ selectedMusic?.title }} - {{ selectedMusic?.artist }}</span>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-cancel" @click="closeCreatePlaylistModal">取消</button>
              <button class="btn btn-primary" @click="confirmCreatePlaylist" :disabled="isCreatingPlaylist || !newPlaylistName.trim()">
                {{ isCreatingPlaylist ? '创建中...' : '创建并添加' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 移动端底部操作面板 -->
    <Teleport to="body">
      <Transition name="sheet-slide">
        <div v-if="mobileSheet.visible" class="mobile-sheet-overlay" @click="closeMobileSheet">
          <div class="mobile-sheet" @click.stop>
            <div class="ms-handle"><div class="ms-handle-bar"></div></div>
            <div class="ms-header">
              <img v-if="mobileSheet.music?.coverFileUrl" :src="cleanUrl(mobileSheet.music.coverFileUrl)" class="ms-cover" />
              <div class="ms-info">
                <div class="ms-title">{{ mobileSheet.music?.title }}</div>
                <div class="ms-artist">{{ mobileSheet.music?.artist }}</div>
              </div>
            </div>
            <div class="ms-actions">
              <div class="msa-item" @click="handleSheetAction('next')">
                <span class="msa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></span>
                <span class="msa-text">下一首播放</span>
              </div>
              <div class="msa-item" @click="handleSheetAction('like')">
                <span class="msa-icon" :class="{ active: isFavorite(mobileSheet.music?.id) }"><svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorite(mobileSheet.music?.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
                <span class="msa-text">{{ isFavorite(mobileSheet.music?.id) ? '取消喜欢' : '喜欢' }}</span>
              </div>
              <div class="msa-item" @click="handleSheetAction('playlist')">
                <span class="msa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
                <span class="msa-text">收藏到歌单</span>
              </div>
              <div class="msa-item" @click="handleSheetAction('download')">
                <span class="msa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
                <span class="msa-text">下载</span>
              </div>
              <div class="msa-item" @click="handleSheetAction('comment')">
                <span class="msa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
                <span class="msa-text">评论</span>
              </div>
              <div class="msa-item" @click="handleSheetAction('share')">
                <span class="msa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></span>
                <span class="msa-text">分享</span>
              </div>
            </div>
            <div class="ms-cancel" @click="closeMobileSheet">取消</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { getMusicList } from '../api/test'
import { useUserStore } from '../stores/user'
import { useAudioStore } from '../stores/audio'
import { getMyPlaylists, addMusicToPlaylist, createPlaylist } from '../api/playlist'
import { addMusicToFavorites, removeMusicFromFavorites } from '../api/user'

// --- 组件名称 ---
defineOptions({ name: 'SelectedView' })

// --- 路由 & Store ---
const router = useRouter()
const userStore = useUserStore()
const audioStore = useAudioStore()
const { favoriteIds } = storeToRefs(userStore)
const { currentSong, isPlaying } = storeToRefs(audioStore)
const { isLoggedIn } = storeToRefs(userStore)
const { playSong, pauseSong } = audioStore

// --- 数据状态 ---
const musicList = ref([])
const loading = ref(true)
const error = ref('')
const viewMode = ref('list') // 'list' | 'grid'

// --- 歌单弹窗状态 ---
const showPlaylistModal = ref(false)
const showCreatePlaylistModal = ref(false)
const selectedMusic = ref(null)
const userPlaylists = ref([])
const newPlaylistName = ref('')
const isCreatingPlaylist = ref(false)

// --- DOM Refs ---
const selectedViewRef = ref(null)
const particlesRef = ref(null)
const headerRef = ref(null)
const titleRef = ref(null)
const titleIconRef = ref(null)
const headerActionsRef = ref(null)
const viewToggleRef = ref(null)
const dividerRef = ref(null)
const loadingRef = ref(null)
const errorRef = ref(null)
const retryBtnRef = ref(null)
const contentRef = ref(null)
const playlistModalRef = ref(null)
const cardRefs = ref([])
const particles = ref([])
const emptyRef = ref(null)

// --- 动画实例 ---
let entranceTl = null
let particlesTl = null

// --- 工具函数 ---
const SCROLL_POSITION_KEY = 'selected-view-scroll-position'

const cleanUrl = (url) => {
  if (!url) return ''
  return url.replace(/[\r\n\t]/g, '').trim()
}

const formatDuration = (duration) => {
  if (!duration) return null
  const min = Math.floor(duration / 60)
  const sec = duration % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const isCurrentSong = (music) => currentSong.value?.id === music.id
const isFavorite = (musicId) => favoriteIds.value && favoriteIds.value.has(musicId)

const saveScrollPosition = () => {
  if (selectedViewRef.value) {
    sessionStorage.setItem(SCROLL_POSITION_KEY, String(selectedViewRef.value.scrollTop))
  }
}

const restoreScrollPosition = () => {
  const saved = sessionStorage.getItem(SCROLL_POSITION_KEY)
  if (saved && selectedViewRef.value) {
    nextTick(() => { selectedViewRef.value.scrollTop = parseInt(saved, 10) })
  }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
  nextTick(() => animateCardsEntrance())
}

// --- 音乐操作 ---
const handlePlay = async (music) => {
  try {
    if (isCurrentSong(music) && isPlaying.value) {
      pauseSong()
    } else {
      await playSong(music, musicList.value)
    }
  } catch (err) {
    console.error('播放失败:', err)
  }
}

const handleCardClick = (music) => {
  // 点击整行/卡片直接播放
  handlePlay(music)
}

const toggleLike = (music) => {
  if (isFavorite(music.id)) {
    removeFromFavorites(music)
  } else {
    addToFavorites(music)
  }
}

const addToFavorites = async (music) => {
  if (!isLoggedIn.value) { showToast('请您先登录'); return }
  try {
    await addMusicToFavorites(music.id)
    userStore.addToFavorites(music.id)
    showToast(`已添加「${music.title}」到喜欢列表`, 'success')
    animateLikeBurst(music.id)
  } catch (err) {
    showToast('添加失败，请稍后重试')
  }
}

const removeFromFavorites = async (music) => {
  if (!isLoggedIn.value) { showToast('请您先登录'); return }
  try {
    await removeMusicFromFavorites(music.id)
    userStore.removeFromFavorites(music.id)
    showToast(`已从喜欢列表移除「${music.title}」`, 'success')
  } catch (err) {
    showToast('移除失败，请稍后重试')
  }
}

const handleAddToPlaylist = async (music) => {
  if (!isLoggedIn.value) { showToast('请您先登录'); return }
  selectedMusic.value = music
  showPlaylistModal.value = true
  await fetchUserPlaylists()
}

const handleComment = (music) => {
  router.push({
    name: 'Comment',
    query: { id: music.id, type: 1 },
    state: { musicInfo: { id: music.id, title: music.title, artist: music.artist, album: music.album || music.title, cover: music.cover || music.coverFileUrl } },
  })
}

// --- 移动端底部操作面板 ---
const mobileSheet = ref({ visible: false, music: null })
const openMobileSheet = (music) => { mobileSheet.value = { visible: true, music } }
const closeMobileSheet = () => { mobileSheet.value = { visible: false, music: null } }
const handleSheetAction = (action) => {
  const music = mobileSheet.value.music
  if (!music) return
  closeMobileSheet()
  switch (action) {
    case 'next': { const list = [...audioStore.playlist]; list.splice(audioStore.currentIndex + 1, 0, { id: music.id, title: music.title, artist: music.artist, album: music.album, duration: music.duration, url: music.fileUrl || music.url, cover: music.coverFileUrl || music.cover }); audioStore.setPlaylist(list); showToast('已添加到下一首', 'success'); break }
    case 'like': toggleLike(music); break
    case 'playlist': handleAddToPlaylist(music); break
    case 'download': handleDownload(music); break
    case 'comment': handleComment(music); break
    case 'share': showToast('分享功能开发中', 'info'); break
  }
}

const handleDownload = (music) => {
  if (music.fileUrl) {
    window.open(cleanUrl(music.fileUrl), '_blank')
  }
}

// --- 歌单操作 ---
const fetchUserPlaylists = async () => {
  try {
    const response = await getMyPlaylists()
    if (response.code === 1 && response.data) {
      userPlaylists.value = response.data.map((p) => ({ id: p.id, name: p.name, songCount: p.songCount, coverUrl: p.coverFileUrl }))
    } else {
      userPlaylists.value = []
    }
  } catch (err) {
    userPlaylists.value = []
  }
}

const closePlaylistModal = () => { showPlaylistModal.value = false; selectedMusic.value = null }
const createNewPlaylist = () => { showPlaylistModal.value = false; showCreatePlaylistModal.value = true; newPlaylistName.value = '' }
const closeCreatePlaylistModal = () => { showCreatePlaylistModal.value = false; newPlaylistName.value = ''; showPlaylistModal.value = true }

const confirmCreatePlaylist = async () => {
  if (!newPlaylistName.value.trim()) { showToast('请输入歌单名称'); return }
  if (!selectedMusic.value) { showToast('请选择歌曲'); return }
  isCreatingPlaylist.value = true
  try {
    const response = await createPlaylist({ name: newPlaylistName.value.trim(), isPublic: 1 })
    await addMusicToPlaylist(response.data.id, selectedMusic.value.id)
    showToast(`成功创建歌单「${newPlaylistName.value}」并添加歌曲`, 'success')
    closeCreatePlaylistModal()
    closePlaylistModal()
  } catch (err) {
    showToast(err.message || '创建歌单失败')
  } finally {
    isCreatingPlaylist.value = false
  }
}

const addToPlaylist = async (playlist) => {
  if (!selectedMusic.value) { showToast('请选择歌曲'); return }
  try {
    await addMusicToPlaylist(playlist.id, selectedMusic.value.id)
    showToast(`成功添加到歌单「${playlist.name}」`, 'success')
    closePlaylistModal()
  } catch (err) {
    if (err.response?.status === 409) showToast('歌曲已存在于该歌单中')
    else if (err.response?.status === 404) showToast('歌单或歌曲不存在')
    else showToast(err.message || '添加失败')
  }
}

// --- 数据加载 ---
const fetchMusicList = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await getMusicList()
    let dataArray = []
    if (response?.data) {
      dataArray = Array.isArray(response.data) ? response.data : [response.data]
    } else {
      error.value = 'API响应格式错误'
      return
    }
    musicList.value = dataArray
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        id: item.id,
        title: item.title || '未知标题',
        artist: item.artist || '未知艺术家',
        album: item.album,
        url: cleanUrl(item.fileUrl),
        fileUrl: item.fileUrl,
        cover: cleanUrl(item.coverFileUrl),
        coverFileUrl: item.coverFileUrl,
        format: item.format,
        duration: item.duration,
        uploadTime: item.uploadTime,
      }))
  } catch (err) {
    console.error('获取音乐列表失败:', err)
    error.value = '获取音乐列表失败，请稍后重试'
    musicList.value = []
  } finally {
    loading.value = false
  }
}

// --- GSAP 动画 ---

// 粒子背景动画
const animateParticles = () => {
  if (!particles.value.length) return
  particlesTl = gsap.timeline({ repeat: -1, yoyo: true })
  particles.value.forEach((el) => {
    if (!el) return
    const dur = gsap.utils.random(2, 5)
    const x = gsap.utils.random(-40, 40)
    const y = gsap.utils.random(-30, 30)
    const opacity = gsap.utils.random(0.1, 0.4)
    gsap.set(el, { x: gsap.utils.random(-60, 60), y: gsap.utils.random(-60, 60), opacity: gsap.utils.random(0.05, 0.2), scale: gsap.utils.random(0.5, 1.5) })
    gsap.to(el, {
      x: x, y: y, opacity: opacity,
      duration: dur, ease: 'sine.inOut',
      repeat: -1, yoyo: true,
      delay: gsap.utils.random(0, 2),
    })
  })
}

// 标题入场动画
const animateHeader = () => {
  if (!titleRef.value) return
  const tl = gsap.timeline()
  tl.from(titleIconRef.value, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)' })
  tl.from(titleRef.value.querySelector('.title-text'), { x: -30, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
  tl.from(dividerRef.value, { scaleX: 0, transformOrigin: 'left center', duration: 0.6, ease: 'power3.inOut' }, '-=0.2')
  tl.from(viewToggleRef.value, { y: -15, opacity: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3')
}

// 卡片交错入场动画
const animateCardsEntrance = () => {
  const els = cardRefs.value.filter(Boolean)
  if (!els.length) return
  if (entranceTl) entranceTl.kill()
  gsap.set(els, { opacity: 0, y: 40, scale: 0.95 })
  entranceTl = gsap.to(els, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.5, stagger: { each: 0.04, from: 'start' },
    ease: 'power3.out',
  })
}

// 点赞动画
const animateLikeBurst = (musicId) => {
  const el = cardRefs.value.find(
    (ref) => ref?.closest('.music-card')?.querySelector(`[data-music-id="${musicId}"]`) || false
  )
  // 简化版：找到对应卡片中的 like 按钮
  const cardIndex = musicList.value.findIndex((m) => m.id === musicId)
  if (cardIndex === -1) return
  const card = cardRefs.value[cardIndex]
  if (!card) return
  const likeBtn = card.querySelector('.like-btn-card')
  if (!likeBtn) return
  gsap.fromTo(likeBtn, { scale: 1 }, { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' })
}

// 鼠标悬浮卡片动画
const addCardHoverEffects = () => {
  cardRefs.value.forEach((el) => {
    if (!el) return
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { scale: 1.01, backgroundColor: 'rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,255,255,0.12), inset 0 1px 0 rgba(0,255,255,0.08)', duration: 0.3, ease: 'power2.out' })
    })
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { scale: 1, backgroundColor: 'rgba(255,255,255,0.02)', boxShadow: '0 1px 0 rgba(255,255,255,0.05)', duration: 0.3, ease: 'power2.out' })
    })
  })
}

// Toast 提示
const showToast = (message, type = 'error') => {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position:fixed;top:20px;right:20px;padding:12px 24px;border-radius:10px;color:#fff;font-size:14px;
    z-index:100000;pointer-events:none;font-family:system-ui,sans-serif;
    background:${type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)'};
    box-shadow:0 8px 32px rgba(0,0,0,0.3);backdrop-filter:blur(10px);
  `
  document.body.appendChild(toast)
  gsap.fromTo(toast, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
  gsap.to(toast, { opacity: 0, x: 100, duration: 0.3, delay: 2.5, ease: 'power2.in', onComplete: () => toast.remove() })
}

// --- 生命周期 ---
onMounted(async () => {
  await fetchMusicList()
  if (userStore.isLoggedIn && favoriteIds.value.size === 0) {
    await userStore.fetchFavoriteList()
  }
  await nextTick()

  // 运行动画
  animateParticles()
  animateHeader()

  if (musicList.value.length > 0) {
    await nextTick()
    animateCardsEntrance()
    addCardHoverEffects()
  }

  // 恢复滚动位置
  restoreScrollPosition()

  // 滚动监听
  if (selectedViewRef.value) {
    selectedViewRef.value.addEventListener('scroll', saveScrollPosition, { passive: true })
  }
})

onBeforeUnmount(() => {
  saveScrollPosition()
  if (selectedViewRef.value) {
    selectedViewRef.value.removeEventListener('scroll', saveScrollPosition)
  }
  if (entranceTl) entranceTl.kill()
  if (particlesTl) particlesTl.kill()
})

// 监听音乐列表变化（重新播放入场动画）
watch(musicList, async () => {
  await nextTick()
  animateCardsEntrance()
  addCardHoverEffects()
})
</script>

<style scoped>
/* ===== 基础容器 ===== */
.selected-view {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #050510 0%, #0a0a20 30%, #0d0d28 60%, #060618 100%);
  color: #e8e8f0;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  padding: 20px 32px 100px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== 背景粒子 ===== */
.bg-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #00ffff;
  box-shadow: 0 0 8px #00ffff, 0 0 16px #00ffff;
}

.particle:nth-child(odd) {
  background: #d946ef;
  box-shadow: 0 0 8px #d946ef, 0 0 16px #d946ef;
}

.particle:nth-child(3n) {
  width: 2px;
  height: 2px;
}

.particle:nth-child(5n) {
  width: 4px;
  height: 4px;
  background: #00ffff;
  box-shadow: 0 0 12px #00ffff, 0 0 24px #00ffff, 0 0 36px rgba(0,255,255,0.3);
}

/* ===== 头部 ===== */
.view-header {
  position: relative;
  z-index: 1;
  margin-bottom: 14px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #00ffff 0%, #d946ef 60%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.title-icon {
  font-size: 34px;
  display: inline-block;
}

.title-text {
  letter-spacing: 8px;
}

.title-glow {
  position: absolute;
  inset: -10px -20px;
  background: radial-gradient(ellipse at center, rgba(0,255,255,0.08) 0%, transparent 70%);
  border-radius: 20px;
  pointer-events: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.view-toggle-btn:hover,
.view-toggle-btn.active {
  background: rgba(0,255,255,0.1);
  border-color: rgba(0,255,255,0.3);
  color: #00ffff;
}

.header-divider {
  margin-top: 14px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,255,255,0.2), rgba(217,70,239,0.3), rgba(0,255,255,0.2), transparent);
}

/* ===== 加载状态 ===== */
.loading-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.loading-visualizer {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.loading-bar {
  width: 4px;
  height: 28px;
  background: linear-gradient(to top, #00ffff, #d946ef);
  border-radius: 2px;
  animation: loadingDance 1s ease-in-out infinite;
}

.loading-text {
  color: rgba(255,255,255,0.5);
  font-size: 14px;
  letter-spacing: 2px;
}

@keyframes loadingDance {
  0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* ===== 错误状态 ===== */
.error-section {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 20px;
  background: rgba(255,107,107,0.05);
  border: 1px solid rgba(255,107,107,0.15);
  border-radius: 16px;
}

.error-icon { font-size: 48px; margin-bottom: 16px; }

.error-text {
  color: rgba(255,107,107,0.9);
  font-size: 15px;
  margin-bottom: 20px;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(255,107,107,0.15);
  border: 1px solid rgba(255,107,107,0.3);
  border-radius: 10px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(255,107,107,0.25);
  box-shadow: 0 4px 20px rgba(255,107,107,0.2);
}

/* ===== 音乐内容容器 ===== */
.music-content {
  position: relative;
  z-index: 1;
}

/* ===== 列表视图卡片 ===== */
.music-card.view-list {
  display: grid;
  grid-template-columns: 48px 52px 1fr 180px 120px 60px;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 2px;
  background: rgba(255,255,255,0.02);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.25s ease;
  position: relative;
}

.music-card.view-list:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.06);
}

.music-card.view-list.playing {
  background: rgba(0,255,255,0.04);
  border-color: rgba(0,255,255,0.15);
}

/* 序号列 */
.card-number {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.track-num {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.3);
  transition: opacity 0.2s;
}

.play-overlay-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.music-card.view-list:hover .play-overlay-btn {
  opacity: 1;
  transform: scale(1);
}

.music-card.view-list:hover .track-num {
  opacity: 0;
}

/* 播放指示器 */
.playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 18px;
}

.pulse-bar {
  width: 3px;
  background: #00ffff;
  border-radius: 1px;
  animation: pulseAnim 0.8s ease-in-out infinite;
}

.pulse-bar:nth-child(1) { height: 10px; }
.pulse-bar:nth-child(2) { height: 16px; animation-delay: 0.15s; }
.pulse-bar:nth-child(3) { height: 12px; animation-delay: 0.3s; }
.pulse-bar:nth-child(4) { height: 8px; animation-delay: 0.45s; }

@keyframes pulseAnim {
  0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* 封面 */
.card-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-cover.has-glow {
  box-shadow: 0 0 16px rgba(0,255,255,0.25), 0 0 32px rgba(0,255,255,0.1);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,255,255,0.08);
  border-radius: 8px;
}

.cover-rings {
  position: absolute;
  inset: -4px;
  border: 1.5px solid rgba(0,255,255,0.3);
  border-radius: 12px;
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 1; }
}

/* 信息 */
.card-info {
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #e8e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.card-artist {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-album {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-duration {
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.25s ease;
}

.music-card.view-list:hover .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.06);
  color: #e8e8f0;
  border-color: rgba(255,255,255,0.15);
  transform: scale(1.1);
}

.like-btn-card.active {
  color: #ff4757 !important;
  border-color: rgba(255,71,87,0.3);
  background: rgba(255,71,87,0.1);
}

.like-btn-card.active:hover {
  color: #ff6b81 !important;
}

/* ===== 网格视图卡片 ===== */
.music-content.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.music-card.view-grid {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.music-card.view-grid:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0,255,255,0.05);
}

.music-card.view-grid.playing {
  border-color: rgba(0,255,255,0.25);
  box-shadow: 0 8px 32px rgba(0,255,255,0.1);
}

.grid-cover-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}

.grid-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.music-card.view-grid:hover .grid-cover {
  transform: scale(1.06);
}

.grid-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0,255,255,0.06), rgba(217,70,239,0.06));
}

.grid-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

.music-card.view-grid:hover .grid-overlay {
  opacity: 1;
}

.grid-play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
}

.grid-play-btn:hover {
  background: rgba(0,255,255,0.2);
  border-color: #00ffff;
  box-shadow: 0 0 24px rgba(0,255,255,0.3);
  transform: scale(1.08);
}

.grid-actions-row {
  display: flex;
  gap: 12px;
}

.grid-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
}

.grid-icon-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
}

.grid-icon-btn.active {
  color: #ff4757;
  border-color: rgba(255,71,87,0.4);
  background: rgba(255,71,87,0.15);
}

.playing-ring {
  position: absolute;
  inset: 4px;
  border: 2px solid rgba(0,255,255,0.35);
  border-radius: 12px;
  animation: ringPulse 2s ease-in-out infinite;
  pointer-events: none;
}

.grid-info {
  padding: 14px 16px;
}

.grid-title {
  font-size: 14px;
  font-weight: 600;
  color: #e8e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.grid-artist {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 列表底部歌曲计数 ===== */
.song-count-footer {
  text-align: center;
  padding: 20px 0 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  margin-top: 8px;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.6; }

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.3);
  margin: 0;
}

/* ===== 歌单弹窗 ===== */
.playlist-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.playlist-modal,
.create-playlist-modal {
  background: linear-gradient(160deg, #141430 0%, #1a1a38 50%, #141430 100%);
  border: 1px solid rgba(0,255,255,0.15);
  border-radius: 20px;
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,255,0.05);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #e8e8f0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.06);
  color: #e8e8f0;
}

.modal-body {
  padding: 16px 24px;
  max-height: 360px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.playlist-item:hover {
  background: rgba(255,255,255,0.04);
}

.playlist-item.create-new {
  border: 1px dashed rgba(0,255,255,0.2);
  color: #00ffff;
  margin-bottom: 12px;
}

.playlist-item.create-new:hover {
  background: rgba(0,255,255,0.06);
  border-color: rgba(0,255,255,0.4);
}

.playlist-cover-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  flex-shrink: 0;
  color: rgba(255,255,255,0.5);
}

.playlist-cover-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: #e8e8f0;
}

.playlist-count {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #e8e8f0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: rgba(0,255,255,0.4);
  box-shadow: 0 0 0 3px rgba(0,255,255,0.08);
}

.selected-music-info {
  padding: 14px 16px;
  background: rgba(0,255,255,0.04);
  border-left: 3px solid #00ffff;
  border-radius: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.2);
}

.btn {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
}

.btn-cancel:hover { background: rgba(255,255,255,0.1); color: #e8e8f0; }

.btn-primary {
  background: linear-gradient(135deg, #00ffff, #d946ef);
  color: #050510;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(0,255,255,0.3);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== 弹窗过渡动画 ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .playlist-modal,
.modal-fade-enter-active .create-playlist-modal {
  animation: modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { transform: translateY(30px) scale(0.92); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* ===== 滚动条 ===== */
.selected-view::-webkit-scrollbar { width: 6px; }
.selected-view::-webkit-scrollbar-track { background: transparent; }
.selected-view::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.15); border-radius: 3px; }
.selected-view::-webkit-scrollbar-thumb:hover { background: rgba(0,255,255,0.3); }

.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-track { background: transparent; }
.modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .selected-view { padding: 16px 14px 90px; }

  .view-title { font-size: 26px; }
  .title-icon { font-size: 24px; }
  .title-text { letter-spacing: 4px; }

  .header-top { gap: 10px; }

  .music-card.view-list {
    grid-template-columns: 36px 42px 1fr 36px;
    gap: 6px;
    padding: 8px 10px;
  }

  .card-album { display: none; }
  .card-duration { display: none; }
  .card-actions { display: none; }

  .music-content.grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .grid-info { padding: 10px 12px; }
  .grid-title { font-size: 13px; }
  .grid-artist { font-size: 11px; }
}

@media (max-width: 480px) {
  .selected-view { padding: 12px 10px 80px; }

  .view-title { font-size: 22px; }
  .title-icon { font-size: 20px; }
  .title-text { letter-spacing: 3px; }

  .music-card.view-list {
    grid-template-columns: 32px 38px 1fr 32px;
    gap: 4px;
    padding: 6px 8px;
    border-radius: 8px;
  }

  .card-cover { width: 34px; height: 34px; border-radius: 6px; }
  .card-title { font-size: 12px; }
  .card-artist { font-size: 10px; }
  .card-actions { display: none; }
  .more-mobile-btn { width: 28px; height: 28px; }
  .icon-btn { width: 28px; height: 28px; }

  .music-content.grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .view-toggle-btn { width: 36px; height: 36px; }

  .playlist-modal,
  .create-playlist-modal {
    width: 95vw;
    border-radius: 16px;
  }

  /* 移动端更多按钮 */
  .card-more-mobile { display: flex; align-items: center; justify-content: center; }
  .more-mobile-btn { width: 32px; height: 32px; border: none; border-radius: 50%; background: transparent; color: rgba(255,255,255,0.35); display: flex; align-items: center; justify-content: center; cursor: pointer; }
}

/* ===================== 移动端底部操作面板 ===================== */
.mobile-sheet-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 10000;
  display: flex; align-items: flex-end; justify-content: center;
}

.mobile-sheet {
  width: 100%; max-width: 500px;
  max-height: 75vh;
  background: linear-gradient(180deg, #1e1e3a 0%, #14142a 100%);
  border-radius: 20px 20px 0 0;
  padding: 0 0 24px;
  display: flex; flex-direction: column;
}

.ms-handle { display: flex; justify-content: center; padding: 12px 0 8px; }
.ms-handle-bar { width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; }

.ms-header { display: flex; align-items: center; gap: 14px; padding: 8px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.ms-cover { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.ms-info { min-width: 0; }
.ms-title { font-size: 15px; font-weight: 600; color: #edf0f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ms-artist { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.ms-actions { padding: 8px 0; }

.msa-item {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 24px; cursor: pointer;
}
.msa-item:active { background: rgba(255,255,255,0.04); }
.msa-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); }
.msa-icon.active { color: #ff4757; }
.msa-text { font-size: 15px; color: #edf0f5; }

.ms-cancel { margin: 8px 20px 0; padding: 14px; text-align: center; background: rgba(255,255,255,0.04); border-radius: 12px; font-size: 15px; color: rgba(255,255,255,0.5); cursor: pointer; }

.sheet-slide-enter-active { transition: all 0.3s ease; }
.sheet-slide-leave-active { transition: all 0.25s ease; }
.sheet-slide-enter-from .mobile-sheet,
.sheet-slide-leave-to .mobile-sheet { transform: translateY(100%); }
.sheet-slide-enter-from { opacity: 0; }
.sheet-slide-enter-to { opacity: 1; }
.sheet-slide-leave-to { opacity: 0; }
.sheet-slide-enter-to .mobile-sheet,
.sheet-slide-leave-from .mobile-sheet { transform: translateY(0); }

/* 桌面端隐藏更多按钮 */
.card-more-mobile { display: none; }
@media (max-width: 768px) {
  .card-more-mobile { display: flex; }
}
</style>
