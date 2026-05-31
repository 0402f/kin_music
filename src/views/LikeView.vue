<template>
  <div class="like-view">
    <!-- 未登录状态的丰富界面 -->
    <div v-if="!userStore.isLoggedIn" class="not-logged-in-state">
      <!-- 动态背景装饰 -->
      <div class="background-decoration">
        <div class="floating-note note-1">♪</div>
        <div class="floating-note note-2">♫</div>
        <div class="floating-note note-3">♪</div>
        <div class="floating-note note-4">♫</div>
        <div class="floating-note note-5">♪</div>
      </div>

      <div class="playlist-header">
        <div class="playlist-cover">
          <div class="cover-placeholder">
            <div class="cover-animation">
              <div class="vinyl-record">
                <div class="vinyl-center"></div>
                <div class="vinyl-groove"></div>
                <div class="vinyl-groove"></div>
                <div class="vinyl-groove"></div>
              </div>
            </div>
          </div>
          <div class="cover-glow"></div>
        </div>

        <div class="playlist-info">
          <div class="playlist-name-container">
            <h1 class="playlist-name">
              <span class="heart-icon">💖</span>
              我喜欢的音乐
              <span class="sparkle">✨</span>
            </h1>
          </div>
          <div class="playlist-meta">
            <div class="creator-info">
              <div class="creator-avatar-placeholder">
                <span class="user-icon">👤</span>
              </div>
              <span class="creator-name">等待您的加入</span>
              <div class="status-badge">新用户</div>
            </div>
            <div class="playlist-stats">
              <div class="stat-item">
                <span class="stat-icon">🎵</span>
                <span>0 首歌曲</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">⏱️</span>
                <span>0 分钟</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>等待开始</span>
              </div>
            </div>
            <p class="description">
              🎶 这里将成为您的专属音乐宝库！登录后，您可以收藏无限首喜爱的歌曲，
              打造独一无二的个人音乐收藏，随时随地享受您的音乐时光。
            </p>
            <div class="playlist-tags">
              <span class="tags-label">🏷️ 标签：</span>
              <span class="tag-item">个人收藏</span>
              <span class="tag-item">精选好歌</span>
              <span class="tag-item">我的最爱</span>
            </div>
          </div>

          <div class="playlist-actions">
            <button class="login-btn" @click="showLoginModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z"
                />
              </svg>
              立即登录
              <span class="btn-shine"></span>
            </button>
            <button class="discover-btn" @click="goToRecommend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
              发现音乐
            </button>
          </div>
        </div>
      </div>

      <!-- 功能预览区域 -->
      <div class="features-preview">
        <h2 class="section-title">
          <span class="title-icon">🌟</span>
          登录后解锁的精彩功能
        </h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">❤️</div>
            <h3>无限收藏</h3>
            <p>收藏您喜爱的所有歌曲，建立专属音乐库</p>
            <div class="feature-demo">
              <div class="demo-heart">💖</div>
              <div class="demo-text">点击即可收藏</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>听歌统计</h3>
            <p>查看您的音乐偏好和播放历史统计</p>
            <div class="feature-demo">
              <div class="demo-chart">
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar" style="height: 40%"></div>
              </div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>智能推荐</h3>
            <p>基于您的喜好，推荐更多好听的音乐</p>
            <div class="feature-demo">
              <div class="demo-recommendation"><span>🎵</span><span>🎶</span><span>🎼</span></div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>跨设备同步</h3>
            <p>在任何设备上都能访问您的音乐收藏</p>
            <div class="feature-demo">
              <div class="demo-devices"><span>📱</span><span>💻</span><span>🖥️</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 音乐类型展示 -->
      <div class="music-genres">
        <h2 class="section-title">
          <span class="title-icon">🎭</span>
          探索各种音乐风格
        </h2>
        <div class="genres-grid">
          <div class="genre-card" @click="goToRecommend">
            <div class="genre-bg pop"></div>
            <div class="genre-content">
              <div class="genre-icon">🎤</div>
              <h3>流行音乐</h3>
              <p>最新最热的流行歌曲</p>
            </div>
          </div>
          <div class="genre-card" @click="goToRecommend">
            <div class="genre-bg rock"></div>
            <div class="genre-content">
              <div class="genre-icon">🎸</div>
              <h3>摇滚音乐</h3>
              <p>激情澎湃的摇滚乐章</p>
            </div>
          </div>
          <div class="genre-card" @click="goToRecommend">
            <div class="genre-bg classical"></div>
            <div class="genre-content">
              <div class="genre-icon">🎻</div>
              <h3>古典音乐</h3>
              <p>优雅动人的古典名曲</p>
            </div>
          </div>
          <div class="genre-card" @click="goToRecommend">
            <div class="genre-bg jazz"></div>
            <div class="genre-content">
              <div class="genre-icon">🎺</div>
              <h3>爵士音乐</h3>
              <p>自由随性的爵士风情</p>
            </div>
          </div>
          <div class="genre-card" @click="goToRecommend">
            <div class="genre-bg electronic"></div>
            <div class="genre-content">
              <div class="genre-icon">🎛️</div>
              <h3>电子音乐</h3>
              <p>前卫时尚的电子节拍</p>
            </div>
          </div>
          <div class="genre-card" @click="goToRecommend">
            <div class="genre-bg folk"></div>
            <div class="genre-content">
              <div class="genre-icon">🪕</div>
              <h3>民谣音乐</h3>
              <p>温暖治愈的民谣故事</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速导航区域 -->
      <div class="quick-navigation">
        <h2 class="section-title">
          <span class="title-icon">🚀</span>
          开始您的音乐之旅
        </h2>
        <div class="nav-cards">
          <div class="nav-card" @click="goToRecommend">
            <div class="nav-icon">🎯</div>
            <div class="nav-content">
              <h3>个性推荐</h3>
              <p>发现符合您口味的音乐</p>
              <div class="nav-arrow">→</div>
            </div>
          </div>
          <div class="nav-card" @click="goToPlaylistSquare">
            <div class="nav-icon">🎵</div>
            <div class="nav-content">
              <h3>歌单广场</h3>
              <p>浏览热门精选歌单</p>
              <div class="nav-arrow">→</div>
            </div>
          </div>
          <div class="nav-card" @click="goToAITrack">
            <div class="nav-icon">🤖</div>
            <div class="nav-content">
              <h3>AI音乐</h3>
              <p>体验AI生成的音乐</p>
              <div class="nav-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部激励区域 -->
      <div class="motivation-section">
        <div class="motivation-content">
          <h2>🎵 音乐，让生活更美好</h2>
          <p>"音乐是心灵的语言，每一首歌都是一个故事，每一个旋律都是一份情感。"</p>
          <div class="motivation-stats">
            <div class="stat">
              <div class="stat-number">10万+</div>
              <div class="stat-label">精选歌曲</div>
            </div>
            <div class="stat">
              <div class="stat-number">5000+</div>
              <div class="stat-label">优质歌单</div>
            </div>
            <div class="stat">
              <div class="stat-number">100+</div>
              <div class="stat-label">音乐风格</div>
            </div>
          </div>
          <button class="cta-button" @click="showLoginModal">
            <span class="cta-text">立即开始音乐之旅</span>
            <span class="cta-icon">🎶</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 已登录状态的丰富界面 -->
    <div v-else class="logged-in-state">
      <!-- 动态背景装饰 -->
      <div class="background-decoration">
        <div class="floating-note note-1">♪</div>
        <div class="floating-note note-2">♫</div>
        <div class="floating-note note-3">♪</div>
        <div class="floating-note note-4">♫</div>
        <div class="floating-note note-5">♪</div>
      </div>

      <!-- 增强的歌单头部 -->
      <div class="enhanced-playlist-header">
        <div class="playlist-cover-enhanced">
          <div class="cover-container">
            <img
              v-if="playlistInfo.coverUrl"
              :src="playlistInfo.coverUrl"
              :alt="playlistInfo.name"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <div class="cover-animation">
                <div class="vinyl-record">
                  <div class="vinyl-center"></div>
                  <div class="vinyl-groove"></div>
                  <div class="vinyl-groove"></div>
                  <div class="vinyl-groove"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="cover-glow"></div>
        </div>

        <div class="playlist-info-enhanced">
          <div class="playlist-name-container">
            <h1 class="playlist-name">
              <span class="heart-icon animated-heart">💖</span>
              {{ playlistInfo.name }}
              <span class="sparkle">✨</span>
            </h1>
          </div>
          <div class="playlist-meta">
            <div class="creator-info">
              <div class="creator-avatar">
                <img
                  v-if="userStore.userInfo?.avatar"
                  :src="userStore.userInfo.avatar"
                  :alt="playlistInfo.creator"
                />
                <span v-else class="user-icon">👤</span>
              </div>
              <span class="creator-name">{{ playlistInfo.creator }}</span>
              <div class="status-badge premium">音乐达人</div>
            </div>
            <div class="playlist-stats">
              <div class="stat-item">
                <span class="stat-icon">🎵</span>
                <span>{{ playlistInfo.songCount }} 首歌曲</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">⏱️</span>
                <span>{{ formatDuration(getTotalDuration()) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>{{ formatDate(new Date()) }}</span>
              </div>
            </div>
            <p class="description">
              🎶 您的专属音乐宝库！这里收藏了您所有喜爱的歌曲，
              每一首都承载着美好的回忆和情感。继续发现更多好音乐吧！
            </p>
            <div class="playlist-tags">
              <span class="tags-label">🏷️ 标签：</span>
              <span class="tag-item">个人收藏</span>
              <span class="tag-item">精选好歌</span>
              <span class="tag-item">我的最爱</span>
            </div>
          </div>

          <div class="playlist-actions">
            <button class="play-all-btn" @click="playAll" :disabled="favoriteList.length === 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
              播放全部
              <span class="btn-shine"></span>
            </button>
            <button class="shuffle-btn" @click="shufflePlay" :disabled="favoriteList.length === 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
                />
              </svg>
              随机播放
            </button>
          </div>
        </div>
      </div>

      <!-- 音乐统计仪表板 -->
      <div class="music-dashboard" v-if="favoriteList.length > 0">
        <h2 class="section-title">
          <span class="title-icon">📊</span>
          我的音乐统计
        </h2>
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <div class="card-icon">🎵</div>
            <div class="card-content">
              <div class="card-number">{{ favoriteList.length }}</div>
              <div class="card-label">收藏歌曲</div>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="card-icon">⏰</div>
            <div class="card-content">
              <div class="card-number">{{ formatDuration(getTotalDuration()) }}</div>
              <div class="card-label">总时长</div>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="card-icon">🎭</div>
            <div class="card-content">
              <div class="card-number">{{ getUniqueArtists() }}</div>
              <div class="card-label">艺术家</div>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <div class="card-number">{{ getRecentlyAdded() }}</div>
              <div class="card-label">本周新增</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 音乐类型分析 -->
      <div class="music-analysis" v-if="favoriteList.length > 0">
        <h2 class="section-title">
          <span class="title-icon">🎭</span>
          我的音乐风格
        </h2>
        <div class="analysis-grid">
          <div class="analysis-card" v-for="genre in getMusicGenres()" :key="genre.name">
            <div class="genre-bg" :class="genre.class"></div>
            <div class="genre-content">
              <div class="genre-icon">{{ genre.icon }}</div>
              <h3>{{ genre.name }}</h3>
              <p>{{ genre.count }} 首歌曲</p>
              <div class="genre-percentage">{{ genre.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作区域 -->
      <div class="quick-actions">
        <h2 class="section-title">
          <span class="title-icon">⚡</span>
          快速操作
        </h2>
        <div class="actions-grid">
          <div class="action-card" @click="goToRecommend">
            <div class="action-icon">🎯</div>
            <div class="action-content">
              <h3>发现更多</h3>
              <p>基于您的喜好推荐新音乐</p>
              <div class="action-arrow">→</div>
            </div>
          </div>
          <div class="action-card" @click="goToPlaylistSquare">
            <div class="action-icon">🎵</div>
            <div class="action-content">
              <h3>歌单广场</h3>
              <p>浏览热门精选歌单</p>
              <div class="action-arrow">→</div>
            </div>
          </div>
          <div class="action-card" @click="exportPlaylist">
            <div class="action-icon">📤</div>
            <div class="action-content">
              <h3>导出歌单</h3>
              <p>分享您的音乐收藏</p>
              <div class="action-arrow">→</div>
            </div>
          </div>
          <div class="action-card" @click="createMix">
            <div class="action-icon">🎛️</div>
            <div class="action-content">
              <h3>智能混音</h3>
              <p>创建个性化播放列表</p>
              <div class="action-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 音乐列表区域 -->
      <div class="music-list-section">
        <h2 class="section-title">
          <span class="title-icon">🎼</span>
          我的音乐收藏
        </h2>
        <PlaylistDisplay
          :music-list="favoriteList"
          :playlist-info="playlistInfo"
          :loading="loading"
          :error="error"
          :show-header="false"
          :show-edit-button="false"
          :show-collect-button="false"
          empty-text="您还没有喜欢的音乐，去发现一些好音乐吧！"
          @like-toggle="handleLikeToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import PlaylistDisplay from '../components/PlaylistDisplay.vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const { favoriteList } = storeToRefs(userStore)

const loading = ref(true)
const error = ref('')

// 构造歌单信息
const playlistInfo = computed(() => ({
  name: '我喜欢的音乐',
  creator: userStore.userInfo?.username || userStore.userInfo?.nickname || '我',
  createTime: null,
  coverUrl:
    favoriteList.value.length > 0
      ? favoriteList.value[0].cover || favoriteList.value[0].coverFileUrl
      : null,
  description: '收集你喜欢的所有音乐',
  songCount: favoriteList.value.length,
  playCount: null,
  collectCount: null,
  user: userStore.userInfo,
  tags: ['个人收藏'],
}))

// 获取用户喜欢的音乐列表
const fetchFavoriteList = async () => {
  try {
    loading.value = true
    error.value = ''

    // 如果用户已登录，获取收藏列表
    if (userStore.isLoggedIn) {
      await userStore.fetchFavoriteList()
    }
    // 未登录时不设置错误，让界面显示美观的空状态
  } catch (err) {
    console.error('获取喜欢列表失败:', err)
    error.value = '获取喜欢列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 处理喜欢切换
const handleLikeToggle = ({ music, action, success, error: toggleError }) => {
  console.log('切换喜欢状态:', { music, action, success })

  // 全局状态已经在 MusicList 组件中更新，这里只需要处理错误
  if (!success) {
    console.error('喜欢状态切换失败:', toggleError)
  }
}

// 显示登录弹窗
const showLoginModal = () => {
  userStore.openAuthModal()
}

// 导航到推荐页面
const goToRecommend = () => {
  router.push('/recommend')
}

// 导航到歌单广场
const goToPlaylistSquare = () => {
  router.push('/playlist-square')
}

// 导航到AI音乐页面
const goToAITrack = () => {
  router.push('/ai-track')
}

// 新增方法
const getTotalDuration = () => {
  return favoriteList.value.reduce((total, music) => {
    return total + (music.duration || 0)
  }, 0)
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getUniqueArtists = () => {
  const artists = new Set()
  favoriteList.value.forEach((music) => {
    if (music.artist) artists.add(music.artist)
  })
  return artists.size
}

const getRecentlyAdded = () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return favoriteList.value.filter((music) => {
    return music.addedAt && new Date(music.addedAt) > oneWeekAgo
  }).length
}

const getMusicGenres = () => {
  // 模拟音乐类型分析
  const genres = [
    {
      name: '流行音乐',
      icon: '🎤',
      class: 'pop',
      count: Math.floor(favoriteList.value.length * 0.4),
    },
    {
      name: '摇滚音乐',
      icon: '🎸',
      class: 'rock',
      count: Math.floor(favoriteList.value.length * 0.25),
    },
    {
      name: '电子音乐',
      icon: '🎛️',
      class: 'electronic',
      count: Math.floor(favoriteList.value.length * 0.2),
    },
    {
      name: '民谣音乐',
      icon: '🪕',
      class: 'folk',
      count: Math.floor(favoriteList.value.length * 0.15),
    },
  ]

  return genres
    .map((genre) => ({
      ...genre,
      percentage: Math.round((genre.count / favoriteList.value.length) * 100),
    }))
    .filter((genre) => genre.count > 0)
}

const playAll = () => {
  if (favoriteList.value.length > 0) {
    // 播放第一首歌曲的逻辑
    console.log('播放全部音乐')
  }
}

const shufflePlay = () => {
  if (favoriteList.value.length > 0) {
    // 随机播放逻辑
    console.log('随机播放音乐')
  }
}

const exportPlaylist = () => {
  console.log('导出歌单')
}

const createMix = () => {
  console.log('创建智能混音')
}

onMounted(() => {
  fetchFavoriteList()
})
</script>

<style scoped>
.like-view {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  padding: 24px;
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

/* 青色透明滚动条样式 */
.like-view::-webkit-scrollbar {
  width: 8px;
}

.like-view::-webkit-scrollbar-track {
  background: transparent;
}

.like-view::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.like-view::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.like-view::-webkit-scrollbar-thumb:active {
  background: rgba(0, 255, 255, 0.7);
}

.like-view::-webkit-scrollbar-corner {
  background: transparent;
}

/* 动态背景装饰 */
.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-note {
  position: absolute;
  font-size: 24px;
  color: rgba(0, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.note-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.note-2 {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.note-3 {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
}

.note-4 {
  bottom: 30%;
  right: 10%;
  animation-delay: 3s;
}

.note-5 {
  bottom: 10%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.3;
  }
}

/* 未登录状态样式 */
.not-logged-in-state {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.playlist-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.9) 0%,
    rgba(26, 26, 46, 0.9) 50%,
    rgba(22, 33, 62, 0.9) 100%
  );
  border-radius: 16px;
  color: white;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 12px 40px rgba(0, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.playlist-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent);
}

.playlist-cover {
  flex-shrink: 0;
  position: relative;
}

.cover-placeholder {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.cover-animation {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-record {
  width: 120px;
  height: 120px;
  background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
  border-radius: 50%;
  position: relative;
  animation: spin 8s linear infinite;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.vinyl-groove {
  position: absolute;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vinyl-groove:nth-child(2) {
  width: 80px;
  height: 80px;
}

.vinyl-groove:nth-child(3) {
  width: 100px;
  height: 100px;
}

.vinyl-groove:nth-child(4) {
  width: 60px;
  height: 60px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.cover-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
  border-radius: 16px;
  filter: blur(20px);
  z-index: -1;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 0.6;
  }
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.playlist-name-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.playlist-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.heart-icon {
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.playlist-meta {
  flex: 1;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.creator-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
  border: 2px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.creator-name {
  font-weight: 500;
  opacity: 0.9;
}

.status-badge {
  background: linear-gradient(135deg, #00ffff, #ff00ff);
  color: #000;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  margin: 10px 0;
  font-size: 14px;
  opacity: 0.9;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 12px;
}

.description {
  margin: 15px 0;
  line-height: 1.6;
  opacity: 0.9;
  font-size: 15px;
}

.playlist-tags {
  margin-top: 10px;
}

.tags-label {
  opacity: 0.8;
  margin-right: 8px;
}

.tag-item {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.playlist-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.login-btn {
  background: linear-gradient(135deg, #00ffff, #00cccc);
  color: #0a0a0a;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  background: linear-gradient(135deg, #00e6e6, #00b3b3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.discover-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.discover-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 功能预览区域 */
.features-preview {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.title-icon {
  font-size: 28px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.feature-card:hover::before {
  transform: translateX(100%);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(0, 255, 255, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.feature-card p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 16px;
}

.feature-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 12px;
}

.demo-heart {
  animation: heartbeat 1.5s ease-in-out infinite;
}

.demo-chart {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 30px;
}

.chart-bar {
  width: 8px;
  background: linear-gradient(to top, #00ffff, #ff00ff);
  border-radius: 2px;
  animation: chartGrow 2s ease-in-out infinite alternate;
}

@keyframes chartGrow {
  from {
    transform: scaleY(0.5);
  }
  to {
    transform: scaleY(1);
  }
}

.demo-recommendation {
  display: flex;
  gap: 8px;
}

.demo-recommendation span {
  animation: bounce 1s ease-in-out infinite;
}

.demo-recommendation span:nth-child(2) {
  animation-delay: 0.2s;
}

.demo-recommendation span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.demo-devices {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.demo-devices span {
  animation: devicePulse 2s ease-in-out infinite;
}

.demo-devices span:nth-child(2) {
  animation-delay: 0.3s;
}

.demo-devices span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes devicePulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 音乐类型展示 */
.music-genres {
  margin-bottom: 40px;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.genre-card {
  height: 120px;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.genre-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.genre-bg.pop {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
}

.genre-bg.rock {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.genre-bg.classical {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.genre-bg.jazz {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.genre-bg.electronic {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.genre-bg.folk {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.genre-content {
  position: relative;
  z-index: 1;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.genre-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.genre-card:hover .genre-bg {
  opacity: 1;
  transform: scale(1.05);
}

.genre-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.genre-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.genre-content p {
  font-size: 12px;
  opacity: 0.9;
}

/* 快速导航区域 */
.quick-navigation {
  margin-bottom: 40px;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.nav-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
}

.nav-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(0, 255, 255, 0.4);
  transform: translateX(8px);
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);
}

.nav-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.nav-content {
  flex: 1;
}

.nav-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

.nav-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.nav-arrow {
  font-size: 20px;
  color: #00ffff;
  transition: transform 0.3s ease;
}

.nav-card:hover .nav-arrow {
  transform: translateX(4px);
}

/* 底部激励区域 */
.motivation-section {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.motivation-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.05), transparent);
  animation: motivationGlow 4s ease-in-out infinite;
}

@keyframes motivationGlow {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.motivation-content {
  position: relative;
  z-index: 1;
}

.motivation-content h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.motivation-content p {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
  font-style: italic;
}

.motivation-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.cta-button {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
}

.cta-button:hover {
  background: linear-gradient(135deg, #ff5252, #ff7979);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.cta-text {
  font-size: 16px;
}

.cta-icon {
  font-size: 18px;
  animation: bounce 2s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .cover-placeholder {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }

  .playlist-name {
    font-size: 24px;
  }

  .playlist-actions {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .genres-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .nav-cards {
    grid-template-columns: 1fr;
  }

  .motivation-stats {
    flex-direction: column;
    gap: 20px;
  }

  .section-title {
    font-size: 20px;
  }

  .motivation-content h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .like-view {
    padding: 16px;
  }

  .playlist-header {
    padding: 20px;
  }

  .genres-grid {
    grid-template-columns: 1fr;
  }

  .motivation-section {
    padding: 24px;
  }
}

/* 已登录状态样式 */
.logged-in-state {
  position: relative;
  z-index: 1;
}

/* 增强的歌单头部 */
.enhanced-playlist-header {
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
  padding: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.playlist-cover-enhanced {
  position: relative;
  flex-shrink: 0;
}

.cover-container {
  width: 200px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info-enhanced {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.animated-heart {
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.status-badge.premium {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  font-weight: 600;
}

.play-all-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.play-all-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
}

.play-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shuffle-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  color: #00ffff;
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.shuffle-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 音乐统计仪表板 */
.music-dashboard {
  margin-bottom: 48px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.dashboard-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0, 255, 255, 0.2);
}

.card-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00ffff, #0099cc);
  border-radius: 12px;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 24px;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 音乐类型分析 */
.music-analysis {
  margin-bottom: 48px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.analysis-card {
  position: relative;
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.analysis-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.genre-percentage {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

/* 快速操作区域 */
.quick-actions {
  margin-bottom: 48px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.action-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 100%);
  border-color: rgba(0, 255, 255, 0.3);
}

.action-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00ffff, #0099cc);
  border-radius: 12px;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  position: relative;
}

.action-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.action-content p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.action-arrow {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  font-size: 18px;
  color: #00ffff;
  transition: transform 0.3s ease;
}

.action-card:hover .action-arrow {
  transform: translateY(-50%) translateX(4px);
}

/* 音乐列表区域 */
.music-list-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .enhanced-playlist-header {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .cover-container {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }

  .dashboard-grid,
  .analysis-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
