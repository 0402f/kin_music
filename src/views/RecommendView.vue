<template>
  <div class="recommend-page">
    <!-- 轮播图区域 -->
    <section class="hero-section">
      <div class="carousel-wrap" ref="carouselRef">
        <div class="carousel-track" :style="{ transform: `translateX(-${currentBanner * 100}%)` }">
          <div
            v-for="banner in banners"
            :key="banner.id"
            class="carousel-slide"
            @click="handleBannerClick(banner)"
          >
            <img :src="banner.imageUrl" :alt="banner.title" @error="onImgError" />
            <div class="slide-gradient"></div>
            <div class="slide-info">
              <h3 class="slide-title">{{ banner.title }}</h3>
              <span class="slide-tag" v-if="linkLabel(banner)">{{ linkLabel(banner) }}</span>
            </div>
          </div>
        </div>
        <!-- 指示器 -->
        <div class="carousel-dots" v-if="banners.length > 1">
          <span
            v-for="(_, i) in banners"
            :key="i"
            :class="['dot', { active: currentBanner === i }]"
            @click.stop="goToBanner(i)"
          ></span>
        </div>
        <!-- 箭头 -->
        <button v-if="banners.length > 1" class="carousel-arrow left" @click.stop="prevBanner">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button v-if="banners.length > 1" class="carousel-arrow right" @click.stop="nextBanner">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-actions">
      <div class="qa-item" @click="$router.push('/selected')">
        <div class="qa-icon qa-icon-hot">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span>每日精选</span>
      </div>
      <div class="qa-item" @click="$router.push('/playlist-square')">
        <div class="qa-icon qa-icon-playlist">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <span>歌单广场</span>
      </div>
      <div class="qa-item" @click="$router.push('/ai-track')">
        <div class="qa-icon qa-icon-ai">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" opacity="0.8"/>
            <circle cx="12" cy="12" r="6" opacity="0.7"/>
            <circle cx="12" cy="12" r="10" opacity="0.35"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" opacity="0.5"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" opacity="0.3"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" opacity="0.5"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" opacity="0.3"/>
          </svg>
        </div>
        <span>灵音</span>
      </div>
      <div class="qa-item" @click="$router.push('/search')">
        <div class="qa-icon qa-icon-search">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <span>搜索</span>
      </div>
    </section>

    <!-- 最新音乐 -->
    <section class="music-section" v-if="latestTracks.length">
      <div class="section-head">
        <h2>
          <svg
            class="head-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="15.5" />
            <polyline points="22 8.5 12 15.5 2 8.5" />
          </svg>
          最新音乐
        </h2>
        <button class="head-more" @click="$router.push('/search')">更多 ›</button>
      </div>
      <div class="music-list">
        <div v-for="(m, i) in latestTracks" :key="m.id" class="music-row" @click="playMusic(m, i)">
          <span class="mr-num" :class="{ playing: currentSong?.id === m.id && isPlaying }">
            <span class="mr-num-txt">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="mr-num-play">
              <svg
                v-if="currentSong?.id === m.id && isPlaying"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 5v14h3V5H3zm4 0v14h3V5H7zm5 0v14h3V5h-3zm4 0v14h3V5h-3z" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <div class="mr-cover">
            <img
              v-if="m.coverFileUrl"
              :src="cleanUrl(m.coverFileUrl)"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <div v-else class="mr-cover-empty">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
            </div>
          </div>
          <div class="mr-info">
            <div class="mr-title">{{ m.title }}</div>
            <div class="mr-artist">{{ m.artist }}</div>
          </div>
          <span class="mr-dur">{{ fmtDur(m.duration) }}</span>
        </div>
      </div>
    </section>

    <!-- 推荐歌单 -->
    <section class="playlist-section" v-if="playlists.length">
      <div class="section-head">
        <h2>
          <svg
            class="head-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="5" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
            <path d="M9 18V5l12-2v13" />
          </svg>
          热门歌单
        </h2>
        <button class="head-more" @click="$router.push('/playlist-square')">更多 ›</button>
      </div>
      <div class="playlist-scroll">
        <div
          v-for="pl in playlists"
          :key="pl.id"
          class="playlist-card"
          @click="$router.push(`/playlist/${pl.id}`)"
        >
          <div class="pl-cover">
            <img
              v-if="pl.coverUrl"
              :src="pl.coverUrl"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <div v-else class="pl-cover-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
                <path d="M9 18V5L21 12L9 18Z" />
              </svg>
            </div>
            <div class="pl-play-count" v-if="pl.playCount">{{ fmtCount(pl.playCount) }}</div>
          </div>
          <div class="pl-name">{{ pl.name }}</div>
          <div class="pl-meta">{{ pl.songCount || 0 }}首</div>
        </div>
      </div>
    </section>

    <!-- 空状态 -->
    <div v-if="!latestTracks.length && !playlists.length && !banners.length" class="empty-state">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getBannerList } from '@/api/banner'
import { getMusicList, getMusicByIds } from '@/api/test'
import { useAudioStore } from '@/stores/audio'

const router = useRouter()
const audioStore = useAudioStore()
const { currentSong, isPlaying } = storeToRefs(audioStore)

// 轮播图
const banners = ref([])
const currentBanner = ref(0)
let bannerTimer = null

// 数据
const latestTracks = ref([])
const playlists = ref([])

// 工具函数
const cleanUrl = (u) => (u ? u.replace(/[\r\n\t]/g, '').trim() : '')
const fmtDur = (d) => {
  if (!d) return ''
  const m = Math.floor(d / 60)
  return `${m}:${String(Math.floor(d % 60)).padStart(2, '0')}`
}
const fmtCount = (n) => {
  if (!n) return ''
  const num = parseInt(n)
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num + ''
}

const linkLabel = (b) => {
  const map = { 1: '歌单', 2: '单曲', 3: '外链' }
  return map[b.linkType] || ''
}
const onImgError = (e) => {
  e.target.src = ''
}

// 轮播控制
const goToBanner = (i) => {
  currentBanner.value = i
  resetTimer()
}
const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.value.length
  resetTimer()
}
const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
  resetTimer()
}
const resetTimer = () => {
  clearInterval(bannerTimer)
  if (banners.value.length > 1) bannerTimer = setInterval(nextBanner, 4000)
}

const handleBannerClick = async (banner) => {
  switch (banner.linkType) {
    case 1:
      router.push(`/playlist/${banner.linkTargetId}`)
      break
    case 2:
      try {
        const res = await getMusicByIds([banner.linkTargetId])
        const data = Array.isArray(res.data) ? res.data[0] : res.data || res
        if (data && data.id) {
          audioStore.playSong({
            id: data.id,
            title: data.title,
            artist: data.artist,
            url: data.fileUrl,
            cover: data.coverFileUrl,
            duration: data.duration,
          })
        }
      } catch {}
      break
    case 3:
      window.open(banner.linkUrl, '_blank')
      break
  }
}

// 播放
const playMusic = (m, i) => {
  audioStore.playSong(
    {
      id: m.id,
      title: m.title,
      artist: m.artist,
      url: m.fileUrl,
      cover: m.coverFileUrl,
      duration: m.duration,
    },
    latestTracks.value,
  )
}

// 数据加载
const fetchBanners = async () => {
  try {
    const res = await getBannerList()
    if (res.code === 1 && Array.isArray(res.data)) {
      banners.value = res.data
      if (banners.value.length > 1) bannerTimer = setInterval(nextBanner, 4000)
    }
  } catch {}
}

const fetchLatestMusic = async () => {
  try {
    const res = await getMusicList()
    let data = res.data || res
    if (!Array.isArray(data)) data = data?.records || []
    latestTracks.value = data
      .slice(0, 10)
      .filter(Boolean)
      .map((m) => ({
        id: m.id,
        title: m.title || '未知',
        artist: m.artist || '未知',
        coverFileUrl: m.coverFileUrl,
        fileUrl: m.fileUrl,
        duration: m.duration,
      }))
  } catch {}
}

const fetchPlaylists = async () => {
  try {
    const { getHotPlaylists } = await import('@/api/playlist')
    const res = await getHotPlaylists(8)
    let data = res.data
    if (!Array.isArray(data)) data = data?.records || []
    playlists.value = data
      .slice(0, 8)
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        name: p.name,
        coverUrl: p.coverFileUrl,
        playCount: p.playCount,
        songCount: p.songCount,
      }))
  } catch {}
}

onMounted(() => {
  fetchBanners()
  fetchLatestMusic()
  fetchPlaylists()
})

onUnmounted(() => {
  clearInterval(bannerTimer)
})
</script>

<style scoped>
.recommend-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #080c18, #0f1428, #0a0e1f);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 16px 24px;
  padding-bottom: 120px;
}

/* ==================== 轮播图 ==================== */
.hero-section {
  margin-bottom: 20px;
}

.carousel-wrap {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  aspect-ratio: 2.5 / 1;
  max-height: 340px;
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.7));
}

.slide-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 28px 24px;
}

.slide-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.slide-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  background: rgba(0, 255, 255, 0.25);
  color: #0ff;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

/* dots */
.carousel-dots {
  position: absolute;
  bottom: 18px;
  right: 24px;
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}
.dot.active {
  background: #0ff;
  transform: scale(1.4);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
}

/* arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.carousel-arrow.left {
  left: 12px;
}
.carousel-arrow.right {
  right: 12px;
}
.carousel-wrap:hover .carousel-arrow {
  opacity: 1;
}

/* ==================== 快捷入口 ==================== */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.qa-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}
.qa-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}
.qa-item span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.qa-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qa-icon svg {
  opacity: 0.7;
}
.qa-icon-hot {
  background: rgba(255, 71, 87, 0.1);
  color: #ff6b6b;
}
.qa-icon-playlist {
  background: rgba(0, 255, 255, 0.08);
  color: #0ff;
}
.qa-icon-ai {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
}
.qa-icon-search {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

/* ==================== Section ==================== */
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-head h2 {
  font-size: 18px;
  font-weight: 700;
  color: #edf0f5;
  margin: 0;
  display: flex;
  align-items: center;
}
.head-icon {
  margin-right: 6px;
  opacity: 0.6;
  flex-shrink: 0;
  vertical-align: middle;
}
.head-more {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  cursor: pointer;
}
.head-more:hover {
  color: #0ff;
}

/* ==================== 最新音乐列表 ==================== */
.music-section {
  margin-bottom: 32px;
}

.music-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.music-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.music-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

.mr-num {
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}
.mr-num-txt {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  font-variant-numeric: tabular-nums;
}
.mr-num-play {
  display: none;
  color: #0ff;
}
.music-row:hover .mr-num-txt {
  display: none;
}
.music-row:hover .mr-num-play {
  display: inline;
}
.mr-num.playing .mr-num-txt {
  display: none;
}
.mr-num.playing .mr-num-play {
  display: inline;
}

.mr-cover {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.mr-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mr-cover-empty {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mr-info {
  flex: 1;
  min-width: 0;
}
.mr-title {
  font-size: 14px;
  font-weight: 500;
  color: #edf0f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mr-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 2px;
}

.mr-dur {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* ==================== 推荐歌单 ==================== */
.playlist-section {
  margin-bottom: 32px;
}

.playlist-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.playlist-card:hover {
  transform: translateY(-3px);
}

.pl-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}
.pl-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pl-cover-empty {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pl-play-count {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.6);
  font-size: 11px;
  color: #fff;
  backdrop-filter: blur(6px);
}

.pl-name {
  font-size: 14px;
  font-weight: 500;
  color: #edf0f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.2);
}

/* ==================== 响应式 ==================== */
@media (min-width: 769px) {
  .recommend-page {
    max-width: 100%;
    margin: 0;
    padding: 28px 48px 40px;
  }
  .carousel-wrap {
    aspect-ratio: 21 / 9;
    max-height: 420px;
  }
  .playlist-scroll {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 18px;
  }
  .section-head h2 { font-size: 20px; }
  .music-row { padding: 12px 14px; }
  .mr-cover { width: 48px; height: 48px; }
  .mr-title { font-size: 15px; }
  .mr-artist { font-size: 13px; }
  .pl-name { font-size: 15px; }
  .hero-section { margin-bottom: 28px; }
  .quick-actions { margin-bottom: 32px; gap: 16px; }
  .qa-item { padding: 20px 12px; }
  .qa-item span { font-size: 13px; }
  .qa-icon { width: 48px; height: 48px; }
  .mr-dur { font-size: 13px; }
}

@media (max-width: 768px) {
  .recommend-page {
    padding: 12px 14px;
    padding-bottom: 100px;
  }
  .carousel-wrap {
    aspect-ratio: 2 / 1;
    max-height: 200px;
    border-radius: 12px;
  }
  .slide-title {
    font-size: 16px;
  }
  .slide-info {
    padding: 24px 16px 16px;
  }
  .playlist-scroll {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .music-row {
    padding: 8px 8px;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .recommend-page {
    padding: 8px 10px;
    padding-bottom: 90px;
  }
  .carousel-wrap {
    aspect-ratio: 16/9;
    max-height: 180px;
  }
  .carousel-dots {
    bottom: 10px;
    right: 12px;
  }
  .carousel-arrow {
    display: none;
  }
  .quick-actions {
    gap: 8px;
  }
  .qa-item {
    padding: 12px 4px;
  }
  .qa-item span {
    font-size: 11px;
  }
  .qa-icon {
    width: 34px;
    height: 34px;
  }
  .playlist-scroll {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .pl-name {
    font-size: 13px;
  }
  .section-head h2 {
    font-size: 16px;
  }
}
</style>
