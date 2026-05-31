<template>
  <div class="selected-view" ref="selectedViewRef">
    <h1>曲库</h1>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else>
      <MusicList
        :music-list="musicList"
        :favorite-ids="favoriteIds"
        @like-toggle="handleLikeToggle"
      />
    </div>
  </div>
</template>

<script setup>
// 在 script setup 顶部添加
import { defineOptions } from 'vue'

defineOptions({
  name: 'SelectedView',
})

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { getMusicList } from '../api/test'
import { useUserStore } from '../stores/user'
import MusicList from '../components/MusicList.vue'

const musicList = ref([])
const loading = ref(true)
const error = ref('')
const selectedViewRef = ref(null)

// 使用全局收藏状态
const userStore = useUserStore()
const { favoriteIds } = storeToRefs(userStore)

// 滚动位置保存的key
const SCROLL_POSITION_KEY = 'selected-view-scroll-position'

// 保存滚动位置
const saveScrollPosition = () => {
  if (selectedViewRef.value) {
    const scrollTop = selectedViewRef.value.scrollTop
    sessionStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString())
  }
}

// 恢复滚动位置
const restoreScrollPosition = () => {
  const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY)
  if (savedPosition && selectedViewRef.value) {
    nextTick(() => {
      selectedViewRef.value.scrollTop = parseInt(savedPosition, 10)
    })
  }
}

// 监听滚动事件，实时保存位置
const handleScroll = () => {
  saveScrollPosition()
}

const handleLikeToggle = ({ music, action, success, error }) => {
  console.log('切换喜欢状态:', { music, action, success })

  if (!success) {
    console.error('喜欢状态切换失败:', error)
  }
}

onMounted(async () => {
  await fetchMusicList()

  if (userStore.isLoggedIn && favoriteIds.value.size === 0) {
    await userStore.fetchFavoriteList()
  }

  // 数据加载完成后恢复滚动位置
  await nextTick()
  restoreScrollPosition()

  // 添加滚动监听
  if (selectedViewRef.value) {
    selectedViewRef.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  // 组件销毁前保存滚动位置
  saveScrollPosition()

  // 移除滚动监听
  if (selectedViewRef.value) {
    selectedViewRef.value.removeEventListener('scroll', handleScroll)
  }
})

const fetchMusicList = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await getMusicList()

    console.log('API响应:', response)

    let dataArray = []

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        dataArray = response.data
      } else {
        console.error('API返回的data.data不是数组:', response.data.data)
        error.value = 'API返回数据格式错误'
        return
      }
    } else {
      console.error('API响应格式错误:', response)
      error.value = 'API响应格式错误'
      return
    }

    musicList.value = dataArray
      .map((item) => {
        if (!item || typeof item !== 'object') {
          console.warn('跳过无效数据项:', item)
          return null
        }

        return {
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
        }
      })
      .filter((item) => item !== null)

    console.log('处理后的音乐数据:', musicList.value)
  } catch (err) {
    console.error('获取音乐列表失败:', err)
    error.value = '获取音乐列表失败，请稍后重试'
    musicList.value = []
  } finally {
    loading.value = false
  }
}

const cleanUrl = (url) => {
  if (!url) return ''
  return url.replace(/[\r\n\t]/g, '').trim()
}
</script>

<style scoped>
.selected-view {
  width: 100%;
  height: 100%; /* 改为100%，与推荐页一致 */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  padding: 24px;
  padding-bottom: 100px;
  box-sizing: border-box; /* 添加box-sizing */
  overflow-y: auto; /* 只有这里有滚动条 */
  overflow-x: hidden; /* 添加overflow-x hidden */
}

/* 内容容器限制宽度 */
.selected-view > * {
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 600;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

/* 青色透明滚动条样式 */
.selected-view::-webkit-scrollbar {
  width: 8px;
}

.selected-view::-webkit-scrollbar-track {
  background: transparent;
}

.selected-view::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.selected-view::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.selected-view::-webkit-scrollbar-thumb:active {
  background: rgba(0, 255, 255, 0.7);
}

.selected-view::-webkit-scrollbar-corner {
  background: transparent;
}

@media (max-width: 768px) {
  .selected-view {
    padding: 15px;
    padding-bottom: 120px;
  }

  h1 {
    font-size: 28px;
  }
}
</style>
