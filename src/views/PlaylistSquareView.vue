<template>
  <div class="playlist-square-view">
    <div class="playlist-square-container">
      <!-- 页面头部 -->
      <div class="square-header">
        <div class="header-content">
          <h1 class="page-title">歌单广场</h1>
          <p class="page-subtitle">发现更多精彩歌单</p>
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
              placeholder="搜索歌单..."
              class="search-input"
              @input="handleSearch"
            />
          </div>
          <div class="filter-tabs">
            <button
              v-for="category in categories"
              :key="category.id"
              :class="['filter-tab', { active: activeCategory === category.id }]"
              @click="setActiveCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 热门歌单轮播 -->
      <div class="hot-playlists-section">
        <div class="section-title">
          <h2>热门歌单</h2>
          <div class="carousel-controls">
            <button class="carousel-btn" @click="prevHotPlaylist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button class="carousel-btn" @click="nextHotPlaylist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 添加加载状态 -->
        <div v-if="isInitialLoading" class="hot-playlists-skeleton">
          <div class="skeleton-carousel">
            <div v-for="i in 4" :key="i" class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-info">
                <div class="skeleton-title"></div>
                <div class="skeleton-creator"></div>
                <div class="skeleton-stats"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 原有轮播内容 -->
        <div v-else class="hot-playlists-carousel">
          <div class="carousel-track" :style="{ transform: `translateX(-${hotPlaylistOffset}px)` }">
            <div
              v-for="playlist in hotPlaylists"
              :key="playlist.id"
              class="hot-playlist-card"
              @click="handlePlaylistClick(playlist)"
            >
              <div class="card-image">
                <img :src="playlist.cover" :alt="playlist.title" />
                <div class="play-overlay">
                  <svg class="play-icon" width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <h3 class="playlist-title">{{ playlist.title }}</h3>
                <p class="playlist-creator">by {{ playlist.creator }}</p>
                <div class="playlist-stats">
                  <span class="play-count">{{ formatPlayCount(playlist.playCount) }} 播放</span>
                  <span class="track-count">{{ playlist.trackCount }} 首</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 歌单网格 -->
      <div class="playlists-grid-section">
        <div class="grid-header">
          <div class="sort-options">
            <button
              v-for="sort in sortOptions"
              :key="sort.id"
              :class="['sort-btn', { active: activeSort === sort.id }]"
              @click="setActiveSort(sort.id)"
            >
              {{ sort.name }}
            </button>
          </div>
          <div class="view-toggle">
            <button
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
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

        <!-- 添加网格加载状态 -->
        <div v-if="isInitialLoading" class="playlists-skeleton">
          <div class="skeleton-grid">
            <div v-for="i in 12" :key="i" class="skeleton-playlist-card">
              <div class="skeleton-cover"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-creator"></div>
                <div class="skeleton-stats"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 网格视图 -->
        <div v-else-if="viewMode === 'grid'" class="playlists-grid">
          <!-- loading状态时显示骨架屏 -->
          <template v-if="loading && filteredPlaylists.length === 0">
            <div v-for="n in 12" :key="'skeleton-' + n" class="skeleton-card">
              <div class="skeleton-cover"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-creator"></div>
                <div class="skeleton-stats"></div>
              </div>
            </div>
          </template>

          <!-- 正常状态显示歌单卡片 -->
          <template v-else>
            <div
              v-for="playlist in filteredPlaylists"
              :key="playlist.id"
              class="playlist-card"
              @click="handlePlaylistClick(playlist)"
            >
              <div class="card-cover">
                <img :src="playlist.cover" :alt="playlist.title" />
                <div class="cover-overlay">
                  <button class="play-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ playlist.title }}</h3>
                <p class="card-creator">{{ playlist.creator }}</p>
                <div class="card-stats">
                  <span class="stat-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
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
                    {{ playlist.trackCount }} 首
                  </span>
                </div>
              </div>
            </div>
          </template>
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
              <img :src="playlist.cover" :alt="playlist.title" />
              <button class="list-play-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <div class="list-info">
              <h3 class="list-title">{{ playlist.title }}</h3>
              <p class="list-creator">{{ playlist.creator }}</p>
              <p class="list-description">{{ playlist.description }}</p>
            </div>
            <div class="list-stats">
              <span class="list-play-count">{{ formatPlayCount(playlist.playCount) }} 播放</span>
              <span class="list-collect-count"
                >{{ formatPlayCount(playlist.collectCount) }} 收藏</span
              >
              <span class="list-track-count">{{ playlist.trackCount }} 首</span>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" @click="loadMore" :disabled="loading">
            <span v-if="!loading">加载更多</span>
            <span v-else class="loading-text">
              <svg class="loading-icon" width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                  opacity=".25"
                />
                <path
                  fill="currentColor"
                  d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                >
                  <animateTransform
                    attributeName="transform"
                    dur="0.75s"
                    repeatCount="indefinite"
                    type="rotate"
                    values="0 12 12;360 12 12"
                  />
                </path>
              </svg>
              加载中...
            </span>
          </button>
        </div>
      </div>
    </div>
    <!-- 添加这个结束标签来关闭 playlist-square-container -->
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onActivated,
  onDeactivated,
  nextTick,
  watch,
  onBeforeUnmount,
  defineOptions,
} from 'vue'
import { useRouter } from 'vue-router'
import { getHotPlaylists, getPlaylistsByCollectCount, getLatestPlaylists } from '@/api/playlist'

// 定义组件名称（用于keep-alive）
defineOptions({
  name: 'PlaylistSquare',
})

const router = useRouter()

// 状态保存的keys
const ACTIVE_SORT_KEY = 'playlist-square-active-sort'
const ACTIVE_CATEGORY_KEY = 'playlist-square-active-category'
const SCROLL_POSITION_KEY = 'playlist-square-scroll-position'
const SEARCH_QUERY_KEY = 'playlist-square-search-query'
const VIEW_MODE_KEY = 'playlist-square-view-mode'

// 添加首次挂载标记
const isFirstMount = ref(true)

// 添加滚动恢复状态标记
const isScrollRestoring = ref(false)

// 添加初始加载状态
const isInitialLoading = ref(true)

// 添加缓存机制
const dataCache = ref(new Map())
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

const getCacheKey = (type, limit) => `${type}_${limit}`

// 从sessionStorage恢复状态，如果没有则使用默认值
const activeSort = ref(sessionStorage.getItem(ACTIVE_SORT_KEY) || 'hot')
const activeCategory = ref(sessionStorage.getItem(ACTIVE_CATEGORY_KEY) || 'all')
const searchQuery = ref(sessionStorage.getItem(SEARCH_QUERY_KEY) || '')
const viewMode = ref(sessionStorage.getItem(VIEW_MODE_KEY) || 'grid')
const scrollPosition = ref(parseInt(sessionStorage.getItem(SCROLL_POSITION_KEY) || '0', 10))
const loading = ref(false)
const hasMore = ref(true)
const hotPlaylistOffset = ref(0)
const hotPlaylistsData = ref([]) // 存储从API获取的最热歌单数据
const collectPlaylistsData = ref([]) // 存储按收藏量排序的歌单数据
const latestPlaylistsData = ref([]) // 存储最新歌单数据
const currentLimit = ref(10) // 当前加载的数量
const limitIncrement = ref(10) // 每次加载更多时增加的数量

// 分类选项
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'pop', name: '流行' },
  { id: 'rock', name: '摇滚' },
  { id: 'jazz', name: '爵士' },
  { id: 'classical', name: '古典' },
  { id: 'electronic', name: '电子' },
  { id: 'folk', name: '民谣' },
  { id: 'hiphop', name: '说唱' },
])

// 排序选项
const sortOptions = ref([
  { id: 'hot', name: '最热' },
  { id: 'new', name: '最新' },
  { id: 'collect', name: '收藏量' },
])

// 热门歌单数据 - 修改为从API获取
const hotPlaylists = ref([])

// 歌单数据
const playlists = ref([])

// 计算属性
const filteredPlaylists = computed(() => {
  let filtered

  // 根据排序方式选择数据源
  if (activeSort.value === 'hot') {
    filtered = hotPlaylistsData.value
  } else if (activeSort.value === 'collect') {
    filtered = collectPlaylistsData.value
  } else if (activeSort.value === 'new') {
    filtered = latestPlaylistsData.value
  } else {
    filtered = playlists.value
  }

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter((playlist) => playlist.category === activeCategory.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (playlist) =>
        playlist.title.toLowerCase().includes(query) ||
        playlist.creator.toLowerCase().includes(query),
    )
  }

  // 对于非API数据的排序
  if (activeSort.value !== 'hot' && activeSort.value !== 'collect') {
    switch (activeSort.value) {
      case 'new':
        filtered.sort((a, b) => b.id - a.id)
        break
    }
  }

  return filtered
})

// 方法
const setActiveCategory = (categoryId) => {
  if (activeCategory.value === categoryId) return

  activeCategory.value = categoryId
  // 状态会通过watch自动保存
  resetLoadMore()
}

const setActiveSort = async (sortId) => {
  if (activeSort.value === sortId) return

  activeSort.value = sortId
  // 状态会通过watch自动保存
  resetLoadMore()

  // 显示加载状态
  loading.value = true

  try {
    if (sortId === 'hot') {
      await fetchHotPlaylistsData(currentLimit.value)
      // 判断是否还有更多数据
      hasMore.value = hotPlaylistsData.value.length === currentLimit.value
    } else if (sortId === 'collect') {
      await fetchPlaylistsByCollectCount()
    } else if (sortId === 'new') {
      await fetchLatestPlaylists()
    } else {
      hotPlaylistsData.value = []
      collectPlaylistsData.value = []
      latestPlaylistsData.value = []
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑
}

const handlePlaylistClick = (playlist) => {
  router.push(`/playlist/${playlist.id}`)
}

const formatPlayCount = (count) => {
  if (count >= 100000000) {
    return Math.floor(count / 100000000) + '亿'
  } else if (count >= 10000) {
    return Math.floor(count / 10000) + '万'
  }
  return count.toString()
}

const prevHotPlaylist = () => {
  if (hotPlaylistOffset.value > 0) {
    hotPlaylistOffset.value -= 300
  }
}

const nextHotPlaylist = () => {
  const maxOffset = (hotPlaylists.value.length - 3) * 300
  if (hotPlaylistOffset.value < maxOffset) {
    hotPlaylistOffset.value += 300
  }
}

// 获取热门歌单数据 - 合并轮播和网格数据获取
const fetchHotPlaylistsData = async (limit = 10) => {
  const cacheKey = getCacheKey('hot', limit)
  const cached = dataCache.value.get(cacheKey)

  // 检查缓存是否有效
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    hotPlaylists.value = cached.data.slice(0, 4)
    hotPlaylistsData.value = cached.data
    return cached.data
  }

  try {
    const response = await getHotPlaylists(limit)
    const formattedData = response.data.map((playlist) => ({
      id: playlist.id,
      title: playlist.name,
      creator: playlist.user.username || playlist.user.nickname || '未知用户',
      cover: playlist.coverFileUrl || '/images/default-playlist.jpg',
      playCount: playlist.playCount,
      collectCount: playlist.collectCount,
      trackCount: playlist.songCount,
      category: playlist.tags && playlist.tags.length > 0 ? playlist.tags[0].toLowerCase() : 'all',
      description: playlist.description || '',
    }))

    // 缓存数据
    dataCache.value.set(cacheKey, {
      data: formattedData,
      timestamp: Date.now(),
    })

    // 同时更新两个数据源
    hotPlaylists.value = formattedData.slice(0, 4) // 轮播区域只需要前4个
    hotPlaylistsData.value = formattedData // 网格区域使用全部数据

    return formattedData
  } catch (error) {
    console.error('获取热门歌单失败:', error)
    // 设置默认数据
    const defaultData = [{}]
    hotPlaylists.value = defaultData.slice(0, 4)
    hotPlaylistsData.value = defaultData
    return defaultData
  }
}

// 获取按收藏量排序的歌单
const fetchPlaylistsByCollectCount = async () => {
  try {
    loading.value = true
    const response = await getPlaylistsByCollectCount(currentLimit.value)

    collectPlaylistsData.value = response.data.map((playlist) => ({
      id: playlist.id,
      title: playlist.name,
      creator: playlist.user.username || playlist.user.nickname || '未知用户',
      cover: playlist.coverFileUrl || '/images/default-playlist.jpg',
      playCount: playlist.playCount,
      collectCount: playlist.collectCount,
      trackCount: playlist.songCount,
      category: playlist.tags && playlist.tags.length > 0 ? playlist.tags[0].toLowerCase() : 'all',
      description: playlist.description || '',
    }))

    // 判断是否还有更多数据
    hasMore.value = response.data.length === currentLimit.value
  } catch (error) {
    console.error('获取收藏量排序歌单失败:', error)
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 获取最新歌单
const fetchLatestPlaylists = async () => {
  try {
    loading.value = true
    const response = await getLatestPlaylists(currentLimit.value)

    latestPlaylistsData.value = response.data.map((playlist) => ({
      id: playlist.id,
      title: playlist.name,
      creator: playlist.user?.username || '未知用户',
      cover: playlist.coverFileUrl || '/images/default-playlist.jpg',
      playCount: playlist.playCount || 0,
      collectCount: playlist.collectCount || 0,
      trackCount: playlist.songCount || 0,
      category: 'all',
      isLiked: false,
      description: playlist.description || '',
      createTime: playlist.createTime,
      updateTime: playlist.updateTime,
      tags: playlist.tags || [],
    }))

    // 判断是否还有更多数据
    hasMore.value = response.data.length === currentLimit.value
  } catch (error) {
    console.error('获取最新歌单失败:', error)
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return

  try {
    loading.value = true
    currentLimit.value += limitIncrement.value

    if (activeSort.value === 'hot') {
      await fetchHotPlaylistsData(currentLimit.value)
      hasMore.value = hotPlaylistsData.value.length === currentLimit.value
    } else if (activeSort.value === 'collect') {
      const response = await getPlaylistsByCollectCount(currentLimit.value)
      collectPlaylistsData.value = response.data.map((playlist) => ({
        id: playlist.id,
        title: playlist.name,
        creator: playlist.user.username || playlist.user.nickname || '未知用户',
        cover: playlist.coverFileUrl || '/images/default-playlist.jpg',
        playCount: playlist.playCount,
        collectCount: playlist.collectCount,
        trackCount: playlist.songCount,
        category:
          playlist.tags && playlist.tags.length > 0 ? playlist.tags[0].toLowerCase() : 'all',
        description: playlist.description || '',
      }))

      hasMore.value = response.data.length === currentLimit.value
    } else if (activeSort.value === 'new') {
      const response = await getLatestPlaylists(currentLimit.value)
      latestPlaylistsData.value = response.data.map((playlist) => ({
        id: playlist.id,
        title: playlist.name,
        creator: playlist.user?.name || '未知用户',
        cover: playlist.coverFileUrl || '/images/default-playlist.jpg',
        playCount: playlist.playCount || 0,
        collectCount: playlist.collectCount || 0,
        trackCount: playlist.songCount || 0,
        category: 'all',
        isLiked: false,
        description: playlist.description || '',
        createTime: playlist.createTime,
        updateTime: playlist.updateTime,
        tags: playlist.tags || [],
      }))

      hasMore.value = response.data.length === currentLimit.value
    } else {
      setTimeout(() => {
        hasMore.value = false
      }, 1000)
    }
  } catch (error) {
    console.error('加载更多歌单失败:', error)
    currentLimit.value -= limitIncrement.value
  } finally {
    loading.value = false
  }
}

// 重置加载状态的方法
const resetLoadMore = () => {
  currentLimit.value = 10
  hasMore.value = true
}

// 保存状态到sessionStorage的方法
const saveState = () => {
  sessionStorage.setItem(ACTIVE_SORT_KEY, activeSort.value)
  sessionStorage.setItem(ACTIVE_CATEGORY_KEY, activeCategory.value)
  sessionStorage.setItem(SEARCH_QUERY_KEY, searchQuery.value)
  sessionStorage.setItem(VIEW_MODE_KEY, viewMode.value)

  // 保存滚动位置
  const container = document.querySelector('.playlist-square-container')
  if (container) {
    sessionStorage.setItem(SCROLL_POSITION_KEY, container.scrollTop.toString())
  }
}

// 监听状态变化，自动保存
watch([activeSort, activeCategory, searchQuery, viewMode], () => {
  saveState()
})

// 添加滚动监听
const handleScroll = () => {
  const container = document.querySelector('.playlist-square-container')
  if (container) {
    sessionStorage.setItem(SCROLL_POSITION_KEY, container.scrollTop.toString())
  }
}

// 优化初始加载逻辑
onMounted(async () => {
  console.log('PlaylistSquare组件挂载')

  if (isFirstMount.value) {
    isInitialLoading.value = true

    try {
      // 优先加载热门歌单（最常用的数据）
      await fetchHotPlaylistsData(currentLimit.value)

      // 立即显示热门数据，减少感知延迟
      isInitialLoading.value = false

      // 异步加载其他数据
      if (activeSort.value === 'collect') {
        fetchPlaylistsByCollectCount()
      } else if (activeSort.value === 'new') {
        fetchLatestPlaylists()
      }
    } catch (error) {
      console.error('初始化数据加载失败:', error)
      isInitialLoading.value = false
    }

    isFirstMount.value = false

    // 立即处理滚动位置恢复
    if (scrollPosition.value > 0) {
      nextTick(() => {
        const container = document.querySelector('.playlist-square-container')
        if (container) {
          container.scrollTop = scrollPosition.value
        }
      })
    }
  }

  // 添加滚动监听
  const container = document.querySelector('.playlist-square-container')
  if (container) {
    container.addEventListener('scroll', handleScroll, { passive: true })
  }
})

// 添加组件激活时的处理
onActivated(() => {
  console.log('PlaylistSquare组件被激活')

  const savedScrollPosition = parseInt(sessionStorage.getItem(SCROLL_POSITION_KEY) || '0', 10)
  if (savedScrollPosition > 0) {
    isScrollRestoring.value = true

    const container = document.querySelector('.playlist-square-container')
    if (container) {
      // 立即设置滚动位置
      container.scrollTop = savedScrollPosition

      // 使用 requestAnimationFrame 确保在下一帧执行
      requestAnimationFrame(() => {
        container.scrollTop = savedScrollPosition

        // 恢复完成后重置状态
        setTimeout(() => {
          isScrollRestoring.value = false
        }, 100)
      })
    }
  }

  // 重新添加滚动监听
  const container = document.querySelector('.playlist-square-container')
  if (container) {
    container.addEventListener('scroll', handleScroll, { passive: true })
  }
})

// 添加组件缓存时的处理
onDeactivated(() => {
  console.log('PlaylistSquare组件被缓存')

  // 保存所有状态
  saveState()

  // 移除滚动监听
  const container = document.querySelector('.playlist-square-container')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})

// 在组件销毁前保存状态
onBeforeUnmount(() => {
  saveState()

  // 移除滚动监听
  const container = document.querySelector('.playlist-square-container')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.playlist-square-view {
  height: calc(100vh - 160px);
  overflow: hidden;
}

.playlist-square-container {
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
.square-header {
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

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
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

/* 热门歌单轮播 */
.hot-playlists-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.carousel-controls {
  display: flex;
  gap: 8px;
}

.carousel-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.carousel-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.hot-playlists-carousel {
  overflow: hidden;
  position: relative;
}

.carousel-track {
  display: flex;
  gap: 20px;
  transition: transform 0.3s ease;
}

.hot-playlist-card {
  min-width: 280px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-playlist-card:hover {
  transform: translateY(-4px);
  border-color: #00ffff;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
}

.card-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hot-playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  background: rgba(0, 255, 255, 0.9);
  border-radius: 50%;
  padding: 8px;
}

.card-info {
  padding: 16px;
}

.playlist-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-creator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px 0;
}

.playlist-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 歌单网格区域 */
.playlists-grid-section {
  margin-bottom: 40px;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
}

.sort-btn.active {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
  color: #00ffff;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  color: #ffffff;
}

.view-btn.active {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}

/* 网格视图 */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

/* Loading skeleton styles */
.skeleton-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  animation: skeleton-loading 1.5s ease-in-out infinite alternate;
}

.skeleton-cover {
  width: 100%;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-content {
  padding: 16px;
}

.skeleton-title {
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-creator {
  height: 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-stats {
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  width: 80%;
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 180px;
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
.like-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background: rgba(0, 255, 255, 0.8);
}

.like-btn:hover {
  background: rgba(255, 0, 100, 0.8);
}

.like-btn.liked {
  background: rgba(255, 0, 100, 0.8);
  color: #ff0064;
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

/* 列表视图 */
.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.playlist-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-list-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.5);
}

.list-cover {
  position: relative;
  width: 60px;
  height: 60px;
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
  background: rgba(0, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
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
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.list-like-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.list-like-btn:hover {
  background: rgba(255, 0, 100, 0.2);
  border-color: #ff0064;
}

.list-like-btn.liked {
  background: rgba(255, 0, 100, 0.2);
  border-color: #ff0064;
  color: #ff0064;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.load-more-btn {
  padding: 12px 32px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 24px;
  color: #00ffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 骨架屏样式 */
.hot-playlists-skeleton,
.playlists-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-carousel {
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.skeleton-card {
  flex: 0 0 280px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-info {
  padding: 16px;
}

.skeleton-title {
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-creator {
  height: 16px;
  width: 60%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-stats {
  height: 14px;
  width: 80%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.skeleton-playlist-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-cover {
  width: 100%;
  height: 200px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-content {
  padding: 16px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 加载状态优化 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #00d4aa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-square-view {
    height: calc(100vh - 160px);
    overflow: hidden;
  }

  .playlist-square-container {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-tabs {
    justify-content: center;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .carousel-track {
    gap: 16px;
  }

  .hot-playlist-card {
    min-width: 240px;
  }
}

@media (max-width: 480px) {
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .hot-playlist-card {
    min-width: 200px;
  }

  .playlist-list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .list-stats {
    align-items: flex-start;
    flex-direction: row;
    gap: 16px;
  }
}
</style>
