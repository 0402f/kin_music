<template>
  <div class="lyrics-page">
    <!-- 普通模式 -->
    <div v-if="!isLyricsFullscreen" class="normal-mode">
      <div class="lyrics-header">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>返回</span>
        </button>
        <div class="song-info">
          <h2>{{ currentSong.title || '未知歌曲' }}</h2>
          <p>{{ currentSong.artist || '未知艺术家' }}</p>
        </div>
        <!-- 全屏按钮 -->
        <button class="fullscreen-btn" @click="toggleFullscreen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="lyrics-content" ref="lyricsContainer">
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载歌词中...</p>
        </div>

        <div v-else-if="lyrics.length === 0" class="no-lyrics">
          <p>暂无歌词</p>
        </div>

        <div
          v-else
          v-for="(lyric, index) in lyrics"
          :key="index"
          :class="[
            'lyric-line-container',
            { active: index === currentLyricIndex, passed: index < currentLyricIndex },
          ]"
          @click="seekToTime(lyric.time)"
          :data-time="lyric.time"
        >
          <div class="lyric-text">
            {{ lyric.text }}
          </div>
          <div class="lyric-time" @click.stop="seekToTime(lyric.time)">
            {{ formatTime(lyric.time) }}
          </div>
        </div>
      </div>

      <!-- 移除这个多余的歌词进度条 -->
      <!-- <div class="lyrics-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div> -->
    </div>

    <!-- 全屏模式 -->
    <div v-else class="fullscreen-mode">
      <!-- 水波背景 -->
      <div class="wave-background">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
        <div class="wave wave4"></div>
      </div>

      <!-- 退出全屏按钮 (悬浮显示) -->
      <div class="fullscreen-controls">
        <button class="exit-fullscreen-btn" @click="toggleFullscreen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 全屏歌词显示 -->
      <div class="fullscreen-lyrics">
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载歌词中...</p>
        </div>

        <div v-else-if="lyrics.length === 0" class="no-lyrics">
          <p>暂无歌词</p>
        </div>

        <div v-else class="current-lyric-display">
          <!-- 当前歌词 -->
          <div class="current-lyric" v-if="currentLyricIndex >= 0">
            {{ lyrics[currentLyricIndex]?.text || '' }}
          </div>
          <!-- 下一句歌词预览 -->
          <div class="next-lyric" v-if="currentLyricIndex + 1 < lyrics.length">
            {{ lyrics[currentLyricIndex + 1]?.text || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAudioStore } from '@/stores/audio'
import { getLyrics } from '@/api/test'

const route = useRoute()
const router = useRouter()
const audioStore = useAudioStore()
const { currentSong, currentTime, isPlaying, isLyricsFullscreen } = storeToRefs(audioStore)

const lyrics = ref([])
const currentLyricIndex = ref(-1)
const lyricsContainer = ref(null)
const isLoading = ref(false)

// 从路由参数获取音乐ID
const musicId = computed(() => {
  return currentSong.value?.id || route.params.id || route.query.id
})

// 修改 fetchLyrics 方法，使用当前播放歌曲的ID
const fetchLyrics = async () => {
  const currentMusicId = currentSong.value?.id || route.params.id || route.query.id
  if (!currentMusicId) return

  isLoading.value = true
  try {
    const response = await getLyrics(currentMusicId)
    console.log('歌词API响应:', response)

    if (Array.isArray(response)) {
      lyrics.value = response
    } else if (response && Array.isArray(response.data)) {
      lyrics.value = response.data
    } else if (response && response.data && Array.isArray(response.data.data)) {
      lyrics.value = response.data.data
    } else {
      console.warn('歌词数据格式不正确:', response)
      lyrics.value = []
    }

    console.log('解析后的歌词:', lyrics.value)
  } catch (error) {
    console.error('获取歌词失败:', error)
    lyrics.value = []
  } finally {
    isLoading.value = false
  }
}

// 根据当前播放时间更新高亮歌词
const updateCurrentLyric = () => {
  if (!lyrics.value.length) return

  let index = -1
  for (let i = 0; i < lyrics.value.length; i++) {
    if (currentTime.value >= lyrics.value[i].time) {
      index = i
    } else {
      break
    }
  }

  if (index !== currentLyricIndex.value) {
    currentLyricIndex.value = index
    scrollToCurrentLyric()
  }
}

// 滚动到当前歌词
const scrollToCurrentLyric = async () => {
  await nextTick()
  if (!lyricsContainer.value || currentLyricIndex.value === -1) return

  const activeLine = lyricsContainer.value.querySelector('.lyric-line-container.active')
  if (activeLine) {
    const containerHeight = lyricsContainer.value.clientHeight
    const totalLyrics = lyrics.value.length
    const currentIndex = currentLyricIndex.value

    // 如果是最后几句歌词，使用不同的滚动策略
    if (currentIndex >= totalLyrics - 3) {
      // 最后3句歌词，滚动到底部但保持一定间距
      lyricsContainer.value.scrollTo({
        top: lyricsContainer.value.scrollHeight - containerHeight + 100,
        behavior: 'smooth',
      })
    } else if (currentIndex <= 2) {
      // 前3句歌词，滚动到顶部但保持一定间距
      lyricsContainer.value.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      // 中间的歌词，正常居中显示
      activeLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }
}

// 点击歌词跳转到指定时间
const seekToTime = (time) => {
  audioStore.setCurrentTime(time)
  if (!isPlaying.value && currentSong.value) {
    audioStore.playSong(currentSong.value)
  }
}

// 切换全屏模式
const toggleFullscreen = () => {
  audioStore.setLyricsFullscreen(!isLyricsFullscreen.value)
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 监听播放时间变化
watch(currentTime, updateCurrentLyric)

// 监听当前播放歌曲变化，重新获取歌词
watch(
  () => currentSong.value?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchLyrics()
    }
  },
  { immediate: true },
)

// 保留对路由参数的监听作为备用
watch(
  musicId,
  (newId, oldId) => {
    if (newId && newId !== oldId && !currentSong.value?.id) {
      fetchLyrics()
    }
  },
  { immediate: true },
)

// 组件卸载时重置全屏状态
onUnmounted(() => {
  audioStore.setLyricsFullscreen(false)
})

onMounted(() => {
  fetchLyrics()
})
</script>

<style scoped>
.lyrics-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
  z-index: 1000;
}

.normal-mode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lyrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

/* 优化后的返回按钮 */
.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 25px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

.song-info {
  flex: 1;
  text-align: center;
  margin: 0 20px;
}

.song-info h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.song-info p {
  margin: 5px 0 0 0;
  font-size: 16px;
  opacity: 0.8;
}

.fullscreen-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

/* 全屏模式样式 */
.fullscreen-mode {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

/* 水波背景效果 */
.wave-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: wave-animation 8s ease-in-out infinite;
}

.wave1 {
  top: -50%;
  left: -100%;
  animation-delay: 0s;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
}

.wave2 {
  top: -50%;
  right: -100%;
  animation-delay: 2s;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%);
}

.wave3 {
  bottom: -50%;
  left: -100%;
  animation-delay: 4s;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.2) 0%, transparent 70%);
}

.wave4 {
  bottom: -50%;
  right: -100%;
  animation-delay: 6s;
  background: radial-gradient(circle, rgba(254, 202, 87, 0.2) 0%, transparent 70%);
}

@keyframes wave-animation {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.6;
  }
}

/* 全屏控制按钮 - 悬浮显示 */
.fullscreen-controls {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fullscreen-mode:hover .fullscreen-controls {
  opacity: 1;
}

.exit-fullscreen-btn {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.exit-fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
}

.exit-fullscreen-btn:active {
  transform: scale(0.95);
}

.fullscreen-lyrics {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  z-index: 10;
  position: relative;
}

.current-lyric-display {
  text-align: center;
  max-width: 80%;
}

.current-lyric {
  font-size: 48px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 30px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  animation: lyric-glow 2s ease-in-out infinite alternate;
}

.next-lyric {
  font-size: 24px;
  opacity: 0.6;
  line-height: 1.3;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

@keyframes lyric-glow {
  0% {
    text-shadow:
      0 4px 20px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(255, 255, 255, 0.3);
  }
  100% {
    text-shadow:
      0 4px 20px rgba(0, 0, 0, 0.6),
      0 0 50px rgba(255, 255, 255, 0.5);
  }
}

.lyrics-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 20px 120px 20px; /* 增加底部内边距到120px */
  text-align: center;
  scroll-behavior: smooth;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 18px;
  opacity: 0.6;
}

.lyric-line-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 15px 0;
  padding: 15px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  transform: scale(0.95);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.lyric-line-container:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.8;
  transform: scale(0.98);
}

.lyric-line-container:hover .lyric-time {
  opacity: 1;
  transform: translateX(0);
}

.lyric-line-container.active {
  font-weight: 600;
  opacity: 1;
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.2);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.lyric-line-container.active .lyric-text {
  font-size: 24px;
}

.lyric-line-container.active .lyric-time {
  opacity: 0;
  transform: translateX(10px);
  pointer-events: none;
}

.lyric-line-container.passed {
  opacity: 0.4;
}

.lyric-text {
  font-size: 18px;
  line-height: 1.5;
  flex: 1;
  text-align: left;
  transition: font-size 0.3s ease;
}

.lyric-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  min-width: 45px;
  text-align: center;
  margin-left: 15px;
}

.lyric-time:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #feca57;
  transform: translateX(0) scale(1.05);
}

.lyric-time:active {
  transform: translateX(0) scale(0.95);
}

.lyrics-progress {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #feca57);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  opacity: 0.8;
}

/* 滚动条样式 */
.lyrics-content::-webkit-scrollbar {
  width: 8px;
}

.lyrics-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.lyrics-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.lyrics-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lyrics-header {
    padding: 15px;
  }

  .song-info h2 {
    font-size: 20px;
  }

  .song-info p {
    font-size: 14px;
  }

  .lyric-line-container {
    padding: 12px 15px;
    margin: 12px 0;
  }

  .lyric-text {
    font-size: 16px;
  }

  .lyric-line-container.active .lyric-text {
    font-size: 20px;
  }

  .lyrics-content {
    padding: 30px 15px;
  }

  .lyric-time {
    font-size: 12px;
    padding: 3px 6px;
    margin-left: 10px;
  }

  .current-lyric {
    font-size: 32px;
  }

  .next-lyric {
    font-size: 18px;
  }

  .fullscreen-controls {
    top: 20px;
    right: 20px;
  }

  .back-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
