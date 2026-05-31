<template>
  <div class="collect-view-container">
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
              我的收藏
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
                <span class="stat-icon">📚</span>
                <span>0 个歌单</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🎵</span>
                <span>0 首歌曲</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📅</span>
                <span>等待开始</span>
              </div>
            </div>
            <p class="description">
              🎶 这里将成为您的专属歌单收藏库！登录后，您可以收藏无限个精彩歌单，
              打造独一无二的个人音乐收藏，随时随地享受您的音乐时光。
            </p>
            <div class="playlist-tags">
              <span class="tags-label">🏷️ 标签：</span>
              <span class="tag-item">个人收藏</span>
              <span class="tag-item">精选歌单</span>
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
            <button class="discover-btn" @click="goToPlaylistSquare">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
              发现歌单
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
            <div class="feature-icon">📚</div>
            <h3>无限收藏</h3>
            <p>收藏您喜爱的所有歌单，建立专属音乐库</p>
            <div class="feature-demo">
              <div class="demo-heart">💖</div>
              <div class="demo-text">点击即可收藏</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>智能搜索</h3>
            <p>快速找到您收藏的任何歌单</p>
            <div class="feature-demo">
              <div class="demo-search">🔍</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>收藏统计</h3>
            <p>查看您的收藏数据和音乐偏好</p>
            <div class="feature-demo">
              <div class="demo-chart">
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar" style="height: 40%"></div>
              </div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>跨设备同步</h3>
            <p>在任何设备上都能访问您的收藏</p>
            <div class="feature-demo">
              <div class="demo-devices"><span>📱</span><span>💻</span><span>🖥️</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 歌单类型展示 -->
      <div class="music-genres">
        <h2 class="section-title">
          <span class="title-icon">🎭</span>
          探索各种歌单类型
        </h2>
        <div class="genres-grid">
          <div class="genre-card" @click="goToPlaylistSquare">
            <div class="genre-bg pop"></div>
            <div class="genre-content">
              <div class="genre-icon">🎤</div>
              <h3>流行歌单</h3>
              <p>最新最热的流行音乐合集</p>
            </div>
          </div>
          <div class="genre-card" @click="goToPlaylistSquare">
            <div class="genre-bg rock"></div>
            <div class="genre-content">
              <div class="genre-icon">🎸</div>
              <h3>摇滚歌单</h3>
              <p>激情澎湃的摇滚音乐</p>
            </div>
          </div>
          <div class="genre-card" @click="goToPlaylistSquare">
            <div class="genre-bg jazz"></div>
            <div class="genre-content">
              <div class="genre-icon">🎷</div>
              <h3>爵士歌单</h3>
              <p>优雅迷人的爵士乐</p>
            </div>
          </div>
          <div class="genre-card" @click="goToPlaylistSquare">
            <div class="genre-bg classical"></div>
            <div class="genre-content">
              <div class="genre-icon">🎼</div>
              <h3>古典歌单</h3>
              <p>永恒经典的古典音乐</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部激励区域 -->
      <div class="motivation-section">
        <div class="motivation-content">
          <h2>🎵 收藏，让音乐更有意义</h2>
          <p>"每一个收藏都是一份心情的记录，每一个歌单都是一段时光的见证。"</p>
          <div class="motivation-stats">
            <div class="stat">
              <div class="stat-number">10万+</div>
              <div class="stat-label">精选歌单</div>
            </div>
            <div class="stat">
              <div class="stat-number">5000+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat">
              <div class="stat-number">100万+</div>
              <div class="stat-label">收藏次数</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已登录状态的原有界面 -->
    <div v-else>
      <!-- 添加动态背景装饰 -->
      <div class="background-decoration logged-in">
        <div class="floating-note note-1">♪</div>
        <div class="floating-note note-2">♫</div>
        <div class="floating-note note-3">♪</div>
      </div>

      <!-- 页面头部 -->
      <div class="collect-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="heart-icon">💖</span>
            我的收藏
            <span class="sparkle">✨</span>
          </h1>
          <p class="page-subtitle">{{ (collectedPlaylists || []).length }} 个收藏的歌单</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索收藏的歌单..."
              class="search-input"
              @input="handleSearch"
            />
          </div>
          <div class="view-toggle">
            <button
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm-6 4v8h8v-8h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
                />
              </svg>
            </button>
            <button
              :class="['view-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 在搜索框下方添加分类筛选 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <button
            v-for="category in categories"
            :key="category.key"
            :class="['filter-tab', { active: activeCategory === category.key }]"
            @click="activeCategory = category.key"
          >
            <span class="tab-icon">{{ category.icon }}</span>
            {{ category.label }}
            <span class="tab-count">{{ getCategoryCount(category.key) }}</span>
          </button>
        </div>

        <div class="sort-options">
          <!-- 自定义下拉框 -->
          <div class="custom-select" :class="{ 'is-open': isDropdownOpen }" @click="toggleDropdown">
            <div class="select-trigger">
              <span class="select-label">{{ getSortLabel(sortBy) }}</span>
              <svg
                class="select-arrow"
                :class="{ rotate: isDropdownOpen }"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div class="select-dropdown" v-show="isDropdownOpen">
              <div
                class="select-option"
                :class="{ selected: sortBy === option.value }"
                v-for="option in sortOptions"
                :key="option.value"
                @click.stop="selectOption(option.value)"
              >
                <span class="option-icon">{{ option.icon }}</span>
                <span class="option-text">{{ option.label }}</span>
                <svg
                  v-if="sortBy === option.value"
                  class="option-check"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
            </div>
          </div>

          <button :class="['sort-order', { desc: sortOrder === 'desc' }]" @click="toggleSortOrder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14l5-5 5 5z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 收藏统计 -->
      <div class="collect-stats">
        <div class="stat-card">
          <div class="stat-icon">❤️</div>
          <div class="stat-info">
            <div class="stat-number">{{ (collectedPlaylists || []).length }}</div>
            <div class="stat-label">收藏歌单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-info">
            <div class="stat-number">{{ totalSongs }}</div>
            <div class="stat-label">总歌曲数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <div class="stat-number">{{ totalDuration }}</div>
            <div class="stat-label">总时长</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredPlaylists.length === 0" class="empty-state">
        <div class="empty-icon">💔</div>
        <h3 class="empty-title">{{ searchQuery ? '没有找到相关歌单' : '还没有收藏任何歌单' }}</h3>
        <p class="empty-description">
          {{ searchQuery ? '试试其他关键词' : '去歌单广场发现更多精彩歌单吧！' }}
        </p>
        <button v-if="!searchQuery" class="discover-btn" @click="goToPlaylistSquare">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          发现歌单
        </button>
      </div>

      <!-- 歌单列表 -->
      <div v-else class="playlists-section">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="playlists-grid">
          <div
            v-for="playlist in filteredPlaylists"
            :key="playlist.id"
            class="playlist-card"
            @click="handlePlaylistClick(playlist)"
          >
            <div class="card-cover">
              <img
                :src="playlist.coverFileUrl || '/images/default-playlist.jpg'"
                :alt="playlist.name"
              />
              <div class="cover-overlay">
                <button class="play-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button class="uncollect-btn" @click.stop="handleUncollect(playlist)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6b6b">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                </button>
              </div>
              <div class="collect-date">{{ formatCollectDate(playlist.favoriteTime) }}</div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ playlist.name }}</h3>
              <p class="card-creator">{{ playlist.user?.username || '未知创建者' }}</p>
              <div class="card-stats">
                <span class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {{ formatPlayCount(playlist.playCount) }}
                </span>
                <span class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                  {{ formatPlayCount(playlist.collectCount) }}
                </span>
                <span class="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                    />
                  </svg>
                  {{ playlist.songCount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="playlists-list">
          <div
            v-for="playlist in filteredPlaylists"
            :key="playlist.id"
            class="playlist-list-item"
            @click="handlePlaylistClick(playlist)"
          >
            <div class="list-cover">
              <img
                :src="playlist.coverFileUrl || '/images/default-playlist.jpg'"
                :alt="playlist.name"
              />
              <button class="list-play-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <div class="list-info">
              <h3 class="list-title">{{ playlist.name }}</h3>
              <p class="list-creator">{{ playlist.user?.username || '未知创建者' }}</p>
              <p class="list-description">{{ playlist.description }}</p>
              <div class="list-meta">
                <span class="collect-time"
                  >收藏于 {{ formatCollectDate(playlist.favoriteTime) }}</span
                >
              </div>
            </div>
            <div class="list-stats">
              <span class="list-play-count">{{ formatPlayCount(playlist.playCount) }} 播放</span>
              <span class="list-collect-count"
                >{{ formatPlayCount(playlist.collectCount) }} 收藏</span
              >
              <span class="list-track-count">{{ playlist.songCount }} 首</span>
            </div>
            <button class="list-uncollect-btn" @click.stop="handleUncollect(playlist)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff6b6b">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getFavoritePlaylistList, unfavoritePlaylist } from '@/api/playlist'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const searchQuery = ref('')
const viewMode = ref('grid')
const loading = ref(false)
const collectedPlaylists = ref([])
const activeCategory = ref('all')
const sortBy = ref('favoriteTime')
const sortOrder = ref('desc')
const isDropdownOpen = ref(false)

// 排序选项
const sortOptions = ref([
  { value: 'favoriteTime', label: '收藏时间', icon: '🕒' },
  { value: 'playCount', label: '播放量', icon: '▶️' },
  { value: 'collectCount', label: '收藏量', icon: '❤️' },
  { value: 'name', label: '歌单名称', icon: '📝' },
])

// 分类选项
const categories = ref([
  { key: 'all', label: '全部', icon: '📚' },
  { key: 'recent', label: '最近收藏', icon: '🕒' },
  { key: 'popular', label: '热门', icon: '🔥' },
  { key: 'personal', label: '个人创建', icon: '👤' },
])

// 显示登录模态框
const showLoginModal = () => {
  userStore.openAuthModal()
}

// 获取收藏的歌单列表
const fetchFavoritePlaylists = async () => {
  // 只有登录用户才获取收藏列表
  if (!userStore.isLoggedIn) {
    return
  }

  try {
    loading.value = true
    const response = await getFavoritePlaylistList()
    collectedPlaylists.value = response.data || []
  } catch (error) {
    console.error('获取收藏歌单出错:', error)
    collectedPlaylists.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handlePlaylistClick = (playlist) => {
  router.push(`/playlist/${playlist.id}`)
}

const handleUncollect = async (playlist) => {
  try {
    // 调用取消收藏API
    await unfavoritePlaylist(playlist.id)

    // 从本地列表中移除
    const index = collectedPlaylists.value.findIndex((p) => p.id === playlist.id)
    if (index > -1) {
      collectedPlaylists.value.splice(index, 1)
    }

    // 同步更新userStore
    userStore.removePlaylistFromFavorites(playlist.id)

    console.log('取消收藏成功:', playlist.name)
  } catch (error) {
    console.error('取消收藏失败:', error)
    // 这里可以添加错误提示
  }
}

const goToPlaylistSquare = () => {
  router.push('/playlist-square')
}

// 获取分类歌单数量
const getCategoryCount = (categoryKey) => {
  if (categoryKey === 'all') {
    return collectedPlaylists.value.length
  }
  return collectedPlaylists.value.filter((playlist) => {
    switch (categoryKey) {
      case 'recent': {
        const daysDiff = (new Date() - new Date(playlist.favoriteTime)) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7
      }
      case 'popular':
        return playlist.playCount > 10000
      case 'personal':
        return playlist.user?.id === userStore.user?.id
      default:
        return true
    }
  }).length
}

// 切换排序顺序
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

// 下拉框相关方法
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectOption = (value) => {
  sortBy.value = value
  isDropdownOpen.value = false
}

const getSortLabel = (value) => {
  const option = sortOptions.value.find((opt) => opt.value === value)
  return option ? option.label : '收藏时间'
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const selectElement = document.querySelector('.custom-select')
  if (selectElement && !selectElement.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

const formatPlayCount = (count) => {
  if (count >= 100000000) {
    return Math.floor(count / 100000000) + '亿'
  } else if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const formatCollectDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()

  // 获取日期部分，忽略具体时间
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = nowOnly - dateOnly
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 修正：使用每个歌单的 songCount 计算总歌曲数
const totalSongs = computed(() => {
  if (!collectedPlaylists.value) return 0
  return collectedPlaylists.value.reduce((total, playlist) => total + (playlist.songCount || 0), 0)
})

// 修正：使用每个歌单的 totalDuration 计算总时长
const totalDuration = computed(() => {
  if (!collectedPlaylists.value) return '0m'

  const totalSeconds = collectedPlaylists.value.reduce(
    (total, playlist) => total + (playlist.totalDuration || 0),
    0,
  )

  const totalMinutes = Math.floor(totalSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
})

// 增强的筛选计算属性
const filteredPlaylists = computed(() => {
  if (!collectedPlaylists.value) return []

  let filtered = [...collectedPlaylists.value]

  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((playlist) => {
      return (
        playlist.name?.toLowerCase().includes(query) ||
        playlist.description?.toLowerCase().includes(query) ||
        playlist.user?.username?.toLowerCase().includes(query)
      )
    })
  }

  // 分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter((playlist) => {
      switch (activeCategory.value) {
        case 'recent': {
          const daysDiff = (new Date() - new Date(playlist.favoriteTime)) / (1000 * 60 * 60 * 24)
          return daysDiff <= 7
        }
        case 'popular':
          return playlist.playCount > 10000
        case 'personal':
          return playlist.user?.id === userStore.user?.id
        default:
          return true
      }
    })
  }

  // 排序
  filtered.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]

    if (sortBy.value === 'name') {
      aValue = aValue?.toLowerCase() || ''
      bValue = bValue?.toLowerCase() || ''
    }

    if (sortOrder.value === 'desc') {
      return bValue > aValue ? 1 : -1
    } else {
      return aValue > bValue ? 1 : -1
    }
  })

  return filtered
})

onMounted(() => {
  // 组件挂载时获取收藏歌单
  fetchFavoritePlaylists()
  // 添加点击外部关闭下拉框的事件监听
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.collect-view-container {
  height: calc(100vh - 160px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow-y: auto;
  padding: 24px;
}

/* 页面头部 */
.collect-header {
  margin-bottom: 32px;
}

.header-content {
  margin-bottom: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title .heart-icon,
.page-title .sparkle {
  font-size: 28px;
  animation: pulse 2s ease-in-out infinite;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 24px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #00ffff;
  background: rgba(255, 255, 255, 0.15);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.view-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
}

.view-btn.active {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
  color: #00ffff;
}

/* 收藏统计 */
.collect-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
}

.discover-btn {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.discover-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

/* 歌单网格 */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: #00ffff;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-card:hover .cover-overlay {
  opacity: 1;
}

.play-btn,
.uncollect-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.play-btn {
  background: rgba(0, 255, 255, 0.9);
}

.play-btn:hover {
  background: #00ffff;
  transform: scale(1.1);
}

.uncollect-btn {
  background: rgba(255, 255, 255, 0.9);
}

.uncollect-btn:hover {
  background: #ffffff;
  transform: scale(1.1);
}

.collect-date {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-creator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 歌单列表 */
.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.playlist-list-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-list-item:hover {
  border-color: #00ffff;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
}

.list-cover {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.list-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: rgba(0, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.playlist-list-item:hover .list-play-btn {
  opacity: 1;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-creator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 4px 0;
}

.list-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.list-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 16px;
}

.list-play-count,
.list-track-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.list-uncollect-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.list-uncollect-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
  transform: scale(1.1);
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
}

.filter-tab.active {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
  color: #00ffff;
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

.filter-tab.active .tab-count {
  background: rgba(0, 255, 255, 0.3);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 自定义下拉框样式 */
.custom-select {
  position: relative;
  min-width: 160px;
  user-select: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(16, 16, 32, 0.95) 100%);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 255, 255, 0.2);
}

.select-trigger:hover {
  border-color: rgba(0, 255, 255, 0.6);
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(26, 26, 46, 0.95) 100%);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 3px 12px rgba(0, 255, 255, 0.3);
  transform: translateY(-1px);
}

.custom-select.is-open .select-trigger {
  border-color: #00ffff;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(26, 26, 46, 0.95) 100%);
  box-shadow:
    0 0 0 3px rgba(0, 255, 255, 0.3),
    0 6px 20px rgba(0, 0, 0, 0.4);
}

.select-label {
  flex: 1;
  text-align: left;
}

.select-arrow {
  margin-left: 8px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(0, 255, 255, 0.8);
}

.select-arrow.rotate {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(16, 16, 32, 0.98) 100%);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 4px 20px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlide {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.select-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.select-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.select-option:hover {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 128, 255, 0.1) 100%);
  color: #00ffff;
  transform: translateX(4px);
}

.select-option:hover::before {
  left: 100%;
}

.select-option.selected {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 128, 255, 0.15) 100%);
  color: #00ffff;
  font-weight: 600;
}

.option-icon {
  margin-right: 8px;
  font-size: 16px;
}

.option-text {
  flex: 1;
}

.option-check {
  margin-left: 8px;
  color: #00ffff;
  animation: checkmark 0.3s ease;
}

@keyframes checkmark {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-select {
    min-width: 140px;
  }

  .select-trigger {
    padding: 10px 14px;
    font-size: 13px;
  }

  .select-option {
    padding: 10px 14px;
    font-size: 13px;
  }
}

.sort-order {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sort-order:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
}

.sort-order.desc {
  transform: rotate(180deg);
}

/* 已登录状态的背景装饰 */
.background-decoration.logged-in {
  opacity: 0.3;
}

.background-decoration.logged-in .floating-note {
  animation-duration: 8s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .collect-view-container {
    padding: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-tabs {
    justify-content: center;
  }

  .sort-options {
    justify-content: center;
  }

  .collect-stats {
    grid-template-columns: 1fr;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .playlist-list-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .list-stats {
    align-self: stretch;
    flex-direction: row;
    justify-content: space-between;
    margin-right: 0;
  }
}

/* 滚动条样式 */
.collect-view-container::-webkit-scrollbar {
  width: 8px;
}

.collect-view-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.collect-view-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.collect-view-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* 未登录状态样式 */
.not-logged-in-state {
  position: relative;
  min-height: calc(100vh - 160px);
  padding: 40px 20px;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.background-decoration.logged-in {
  z-index: 0;
}

.floating-note {
  position: absolute;
  font-size: 24px;
  color: rgba(0, 255, 255, 0.3);
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
  left: 20%;
  animation-delay: 2s;
}
.note-4 {
  bottom: 30%;
  right: 10%;
  animation-delay: 3s;
}
.note-5 {
  bottom: 10%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
    opacity: 0.6;
  }
}

.playlist-header {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 40px;
  margin-bottom: 60px;
  align-items: flex-start;
}

.playlist-cover {
  position: relative;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-animation {
  width: 200px;
  height: 200px;
  position: relative;
}

.vinyl-record {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #1a1a1a 30%, #333 31%, #1a1a1a 32%, #333 33%);
  border-radius: 50%;
  position: relative;
  animation: spin 8s linear infinite;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: #ff6b6b;
  border-radius: 50%;
}

.vinyl-groove {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vinyl-groove:nth-child(2) {
  width: 120px;
  height: 120px;
}
.vinyl-groove:nth-child(3) {
  width: 160px;
  height: 160px;
}
.vinyl-groove:nth-child(4) {
  width: 200px;
  height: 200px;
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
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 30px;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    opacity: 0.5;
    transform: scale(1);
  }
  to {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.playlist-info {
  flex: 1;
  padding-top: 20px;
}

.playlist-name-container {
  margin-bottom: 20px;
}

.playlist-name {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #00ffff, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 12px;
}

.heart-icon,
.sparkle {
  font-size: 40px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.playlist-meta {
  margin-bottom: 30px;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.creator-avatar-placeholder {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.creator-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.status-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.not-logged-in-state .playlist-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.not-logged-in-state .stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.not-logged-in-state .stat-icon {
  font-size: 16px;
}

.description {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 16px;
}

.playlist-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.tags-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.tag-item {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.playlist-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.login-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.not-logged-in-state .discover-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.not-logged-in-state .discover-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
}

.features-preview {
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  border-color: #00ffff;
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 20px;
}

.feature-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.demo-heart {
  font-size: 24px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.demo-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.demo-search {
  font-size: 24px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.demo-chart {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 40px;
}

.chart-bar {
  width: 8px;
  background: linear-gradient(to top, #ff6b6b, #00ffff);
  border-radius: 4px;
  animation: chartGrow 2s ease-in-out infinite;
}

@keyframes chartGrow {
  0%,
  100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.demo-devices {
  display: flex;
  gap: 8px;
}

.demo-devices span {
  font-size: 20px;
  animation: deviceSync 3s ease-in-out infinite;
}

.demo-devices span:nth-child(2) {
  animation-delay: 0.5s;
}
.demo-devices span:nth-child(3) {
  animation-delay: 1s;
}

@keyframes deviceSync {
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

.music-genres {
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.genre-card {
  position: relative;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.genre-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.genre-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.genre-bg.pop {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}
.genre-bg.rock {
  background: linear-gradient(135deg, #5f27cd, #341f97);
}
.genre-bg.jazz {
  background: linear-gradient(135deg, #00d2d3, #54a0ff);
}
.genre-bg.classical {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
}

.genre-card:hover .genre-bg {
  opacity: 1;
}

.genre-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.genre-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.genre-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.genre-content p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
}

.motivation-section {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 30px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.motivation-content h2 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ffff, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

.motivation-content p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 40px;
  font-style: italic;
}

.motivation-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.motivation-section .stat {
  text-align: center;
}

.motivation-section .stat-number {
  font-size: 36px;
  font-weight: 800;
  color: #00ffff;
  margin-bottom: 8px;
}

.motivation-section .stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-logged-in-state {
    padding: 20px 16px;
  }

  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 30px;
  }

  .playlist-cover {
    width: 200px;
    height: 200px;
  }

  .playlist-name {
    font-size: 36px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .genres-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .motivation-stats {
    gap: 30px;
  }

  .filter-tabs {
    gap: 4px;
  }

  .filter-tab {
    padding: 6px 12px;
    font-size: 12px;
  }

  .tab-icon {
    font-size: 14px;
  }
}
</style>
