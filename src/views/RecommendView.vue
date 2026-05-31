<template>
  <div class="recommend-page">
    <!-- 顶部横幅区域 -->
    <div class="top-banner">
      <!-- 左侧轮播图 -->
      <div class="carousel-container">
        <div class="carousel">
          <div
            v-for="(banner, index) in banners"
            :key="index"
            :class="['carousel-item', { active: currentBannerIndex === index }]"
            @click="handleBannerClick(banner, index)"
          >
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-overlay">
              <h3>{{ banner.title }}</h3>
              <p>{{ banner.subtitle }}</p>
              <span class="banner-tag">{{ banner.tag }}</span>
            </div>
          </div>
        </div>
        <div class="carousel-dots">
          <span
            v-for="(banner, index) in banners"
            :key="index"
            :class="['dot', { active: currentBannerIndex === index }]"
            @click="currentBannerIndex = index"
          ></span>
        </div>
      </div>

      <!-- 右侧推荐卡片 -->
      <div class="recommendation-cards">
        <div class="cards-header">
          <h3>🌙 夜深了，猜你最近喜欢听</h3>
        </div>
        <div class="cards-grid">
          <div
            v-for="(card, index) in recommendCards"
            :key="index"
            class="recommend-card"
            @click="handleCardClick(card)"
          >
            <div class="card-cover">
              <img :src="card.cover" :alt="card.title" />
              <div class="play-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div class="card-info">
              <h4>{{ card.title }}</h4>
              <p>{{ card.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 精选推荐区域 -->
    <div class="featured-section">
      <div class="section-header">
        <h2>🎵 精选推荐</h2>
        <button class="refresh-btn" @click="refreshRecommendations">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M1 4v6h6M23 20v-6h-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          换一批
        </button>
      </div>
      <div class="featured-grid">
        <div
          v-for="(playlist, index) in featuredPlaylists"
          :key="index"
          class="featured-card"
          @click="handlePlaylistClick(playlist)"
        >
          <div class="featured-cover">
            <img :src="playlist.cover" :alt="playlist.title" />
            <div class="featured-overlay">
              <div class="play-count">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M15 12l-6-4v8l6-4z" fill="currentColor" />
                </svg>
                {{ playlist.playCount }}
              </div>
            </div>
          </div>
          <div class="featured-info">
            <h3>{{ playlist.title }}</h3>
            <p>{{ playlist.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐歌单区域 -->
    <div class="playlist-section">
      <div class="section-header">
        <h2>🎶 热门歌单</h2>
        <button class="more-btn" @click="viewMorePlaylists">查看更多 →</button>
      </div>
      <div class="playlist-grid">
        <div
          v-for="(song, index) in recommendedSongs"
          :key="index"
          class="song-card"
          @click="handleSongClick(song)"
        >
          <div class="song-cover">
            <img :src="song.cover" :alt="song.title" />
            <div class="song-overlay">
              <div class="play-count">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M15 12l-6-4v8l6-4z" fill="currentColor" />
                </svg>
                {{ song.playCount }}
              </div>
            </div>
          </div>
          <div class="song-title">{{ song.title }}</div>
          <div class="song-creator">by {{ song.creator }}</div>
        </div>
      </div>
    </div>

    <!-- 新增：最新音乐区域 -->
    <div class="latest-section">
      <div class="section-header">
        <h2>🆕 最新音乐</h2>
        <button class="more-btn" @click="viewMoreLatest">查看更多 →</button>
      </div>
      <div class="latest-list">
        <div
          v-for="(track, index) in latestTracks"
          :key="index"
          class="track-item"
          @click="handleTrackClick(track)"
        >
          <div class="track-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <img :src="track.cover" :alt="track.title" class="track-cover" />
          <div class="track-info">
            <h4>{{ track.title }}</h4>
            <p>{{ track.artist }}</p>
          </div>
          <div class="track-duration">{{ track.duration }}</div>
          <button class="track-play-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentBannerIndex = ref(0)
let bannerTimer = null

// 轮播图数据 - 使用假数据
const banners = ref([
  {
    id: 1,
    title: '周杰伦新专辑',
    subtitle: '《最伟大的作品》全新发布',
    tag: '新专辑',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    title: '邓紫棋演唱会',
    subtitle: '《Queen of Hearts》世界巡回演唱会',
    tag: '演唱会',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    title: '华语金曲榜',
    subtitle: '本周最热华语歌曲排行',
    tag: '排行榜',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop',
  },
])

// 推荐卡片数据
const recommendCards = ref([
  {
    id: 1,
    title: '夜曲',
    artist: '周杰伦',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    title: '光年之外',
    artist: '邓紫棋',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    title: '稻香',
    artist: '周杰伦',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
  },
  {
    id: 4,
    title: '演员',
    artist: '薛之谦',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
  },
])

// 精选推荐数据
const featuredPlaylists = ref([
  {
    id: 1,
    title: '每日推荐',
    description: '根据你的喜好为你推荐',
    playCount: '1.2万',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  },
  {
    id: 2,
    title: '私人雷达',
    description: '发现你可能喜欢的新音乐',
    playCount: '8.5万',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=300&fit=crop',
  },
  {
    id: 3,
    title: '心动模式',
    description: '那些让人心动的旋律',
    playCount: '15.6万',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  },
  {
    id: 4,
    title: '华语经典',
    description: '经典华语歌曲精选',
    playCount: '32.1万',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  },
  {
    id: 5,
    title: '深夜电台',
    description: '适合深夜聆听的音乐',
    playCount: '9.8万',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=300&fit=crop',
  },
])

// 推荐歌单数据
const recommendedSongs = ref([
  {
    id: 1,
    title: '抖音热歌榜',
    playCount: '2458.1万',
    creator: '音乐编辑',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    title: '网易云热评',
    playCount: '1856.3万',
    creator: '热评精选',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    title: '治愈系民谣',
    playCount: '892.7万',
    creator: '民谣小站',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
  },
  {
    id: 4,
    title: '电子音乐精选',
    playCount: '567.2万',
    creator: 'EDM爱好者',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
  },
  {
    id: 5,
    title: '古风音乐集',
    playCount: '423.8万',
    creator: '古风音乐社',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&h=200&fit=crop',
  },
])

// 最新音乐数据
const latestTracks = ref([
  {
    id: 1,
    title: '最伟大的作品',
    artist: '周杰伦',
    duration: '4:32',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop',
  },
  {
    id: 2,
    title: '倒数',
    artist: '邓紫棋',
    duration: '3:45',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=60&h=60&fit=crop',
  },
  {
    id: 3,
    title: '孤勇者',
    artist: '陈奕迅',
    duration: '4:15',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=60&fit=crop',
  },
  {
    id: 4,
    title: '星辰大海',
    artist: '黄霄雲',
    duration: '3:28',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop',
  },
  {
    id: 5,
    title: '白月光与朱砂痣',
    artist: '大籽',
    duration: '4:01',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=60&h=60&fit=crop',
  },
])

// 自动轮播
const startAutoPlay = () => {
  bannerTimer = setInterval(() => {
    currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
  }, 5000)
}

const stopAutoPlay = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

// 事件处理函数
const handleBannerClick = (banner, index) => {
  console.log('点击轮播图:', banner)
  if (index !== currentBannerIndex.value) {
    currentBannerIndex.value = index
  }
}

const handleCardClick = (card) => {
  console.log('播放推荐歌曲:', card)
  // 这里可以调用音频播放器
}

const handlePlaylistClick = (playlist) => {
  console.log('打开歌单:', playlist)
  // 跳转到歌单详情页
}

const handleSongClick = (song) => {
  console.log('打开歌单:', song)
  // 跳转到歌单详情页
}

const handleTrackClick = (track) => {
  console.log('播放音乐:', track)
  // 播放音乐
}

const refreshRecommendations = () => {
  console.log('刷新推荐')
  // 重新获取推荐数据
}

const viewMorePlaylists = () => {
  console.log('查看更多歌单')
  // 跳转到歌单广场
}

const viewMoreLatest = () => {
  console.log('查看更多最新音乐')
  // 跳转到最新音乐页面
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.recommend-page {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 顶部横幅区域 */
.top-banner {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  height: 320px;
  width: 100%;
}

/* 轮播图容器 */
.carousel-container {
  width: 750px;
  height: 320px;
  flex: none;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 255, 255, 0.15);
}

.carousel {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
  cursor: pointer;
  pointer-events: none;
}

.carousel-item.active {
  opacity: 1;
  pointer-events: auto;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 40px 30px 25px;
}

.banner-overlay h3 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-overlay p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.banner-tag {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  right: 30px;
  display: flex;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: #00ffff;
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}

/* 推荐卡片区域 */
.recommendation-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.cards-header {
  margin-bottom: 20px;
}

.cards-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  flex: 1;
}

.recommend-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recommend-card:hover .play-overlay {
  opacity: 1;
}

.card-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.card-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 区域标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 26px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.refresh-btn,
.more-btn {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.refresh-btn:hover,
.more-btn:hover {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 255, 255, 0.3);
}

/* 精选推荐样式 */
.featured-section {
  margin-bottom: 50px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.featured-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 24px rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.featured-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
}

.featured-cover {
  position: relative;
  width: 100%;
  height: 140px;
}

.featured-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(10px);
}

.featured-info {
  padding: 16px;
}

.featured-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
}

.featured-info p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 推荐歌单样式 */
.playlist-section {
  margin-bottom: 50px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.song-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.song-card:hover {
  transform: translateY(-4px);
}

.song-cover {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(10px);
}

.song-title {
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.song-creator {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* 最新音乐样式 */
.latest-section {
  margin-bottom: 40px;
}

.latest-list {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.track-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.track-item:last-child {
  border-bottom: none;
}

.track-item:hover {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.track-number {
  width: 30px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.track-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  margin: 0 15px;
}

.track-info {
  flex: 1;
}

.track-info h4 {
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.track-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.track-duration {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 15px;
}

.track-play-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #000;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
}

.track-item:hover .track-play-btn {
  opacity: 1;
}

.track-play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 255, 255, 0.4);
}

/* 滚动条样式 */
.recommend-page::-webkit-scrollbar {
  width: 8px;
}

.recommend-page::-webkit-scrollbar-track {
  background: transparent;
}

.recommend-page::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.recommend-page::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.recommend-page::-webkit-scrollbar-thumb:active {
  background: rgba(0, 255, 255, 0.7);
}

.recommend-page::-webkit-scrollbar-corner {
  background: transparent;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .featured-grid,
  .playlist-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .featured-grid,
  .playlist-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .carousel-container {
    width: 600px;
  }
}

@media (max-width: 768px) {
  .recommend-page {
    padding: 15px 20px;
  }

  .top-banner {
    flex-direction: column;
    height: auto;
    gap: 20px;
  }

  .carousel-container {
    width: 100%;
    height: 200px;
  }

  .featured-grid,
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .featured-grid,
  .playlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
