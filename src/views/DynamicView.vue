<template>
  <div class="dynamic-view">
    <!-- 页面头部 -->
    <div class="dynamic-header">
      <h1 class="page-title">
        <span class="title-icon">🌟</span>
        动态广场
        <span class="dynamic-count">{{ filteredDynamics.length }}</span>
      </h1>
      <div class="header-actions">
        <div class="filter-tabs">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: activeFilter === filter.value }"
            @click="setFilter(filter.value)"
          >
            <span class="filter-icon">{{ filter.icon }}</span>
            {{ filter.label }}
          </button>
        </div>
        <button class="refresh-btn" @click="refreshDynamics" :disabled="loading">
          <span class="refresh-icon" :class="{ spinning: loading }">🔄</span>
          刷新
        </button>
      </div>
    </div>

    <!-- 动态列表 -->
    <div class="dynamic-content">
      <div v-if="filteredDynamics.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>暂无动态</h3>
        <p>当前筛选条件下没有找到相关动态</p>
        <button class="reset-filter-btn" @click="setFilter('all')">查看全部</button>
      </div>

      <div v-else class="dynamic-list">
        <div
          v-for="dynamic in filteredDynamics"
          :key="dynamic.id"
          class="dynamic-item"
          :class="`dynamic-type-${dynamic.type.toLowerCase().replace(/\s+/g, '-')}`"
        >
          <!-- 用户信息 -->
          <div class="user-info">
            <div class="avatar-container">
              <img :src="dynamic.avatar" :alt="dynamic.name" class="user-avatar" />
              <div class="online-status" :class="{ online: dynamic.isOnline }"></div>
              <div class="user-badge" v-if="dynamic.badge">
                <span class="badge-icon">{{ dynamic.badge.icon }}</span>
              </div>
            </div>
            <div class="user-details">
              <h3 class="user-name">
                {{ dynamic.name }}
                <span v-if="dynamic.verified" class="verified-icon">✓</span>
              </h3>
              <p class="user-type">{{ dynamic.userType }}</p>
              <p class="publish-time">{{ dynamic.publishTime }}</p>
            </div>
            <div class="dynamic-actions">
              <button class="follow-btn" :class="{ following: dynamic.isFollowing }" @click="toggleFollow(dynamic.id)">
                {{ dynamic.isFollowing ? '已关注' : '关注' }}
              </button>
            </div>
          </div>

          <!-- 动态内容 -->
          <div class="dynamic-content-main">
            <div class="dynamic-header-info">
              <span class="dynamic-type" :style="{ background: dynamic.typeColor }">{{ dynamic.type }}</span>
              <span class="dynamic-location" v-if="dynamic.location">
                <span class="location-icon">📍</span>
                {{ dynamic.location }}
              </span>
            </div>

            <div class="dynamic-body">
              <h4 class="dynamic-title">{{ dynamic.title }}</h4>
              <p class="dynamic-description">{{ dynamic.description }}</p>

              <!-- 标签 -->
              <div class="dynamic-tags" v-if="dynamic.tags && dynamic.tags.length > 0">
                <span v-for="tag in dynamic.tags" :key="tag" class="tag">#{{ tag }}</span>
              </div>

              <!-- 媒体内容 -->
              <div v-if="dynamic.media" class="dynamic-media">
                <!-- 图片 -->
                <div v-if="dynamic.media.type === 'image'" class="media-images">
                  <img
                    v-for="(image, index) in dynamic.media.content"
                    :key="index"
                    :src="image"
                    :alt="dynamic.title"
                    class="media-image"
                    :class="{ 'single-image': dynamic.media.content.length === 1 }"
                  />
                </div>

                <!-- 视频 -->
                <div v-else-if="dynamic.media.type === 'video'" class="media-video">
                  <div class="video-placeholder">
                    <img :src="dynamic.media.cover" :alt="dynamic.title" class="video-cover" />
                    <div class="play-button">
                      <span class="play-icon">▶️</span>
                    </div>
                    <div class="video-duration">{{ dynamic.media.duration }}</div>
                  </div>
                </div>

                <!-- 音频 -->
                <div v-else-if="dynamic.media.type === 'audio'" class="media-audio">
                  <div class="audio-player">
                    <img :src="dynamic.media.cover" :alt="dynamic.title" class="audio-cover" />
                    <div class="audio-info">
                      <h5 class="audio-title">{{ dynamic.media.title }}</h5>
                      <p class="audio-artist">{{ dynamic.media.artist }}</p>
                      <div class="audio-controls">
                        <button class="play-btn">▶️</button>
                        <div class="audio-progress">
                          <div class="progress-bar"></div>
                        </div>
                        <span class="audio-duration">{{ dynamic.media.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 互动统计 -->
            <div class="dynamic-stats">
              <button class="stat-item" :class="{ active: dynamic.isLiked }" @click="toggleLike(dynamic.id)">
                <span class="stat-icon">{{ dynamic.isLiked ? '❤️' : '🤍' }}</span>
                <span class="stat-count">{{ formatCount(dynamic.likes) }}</span>
              </button>
              <button class="stat-item" @click="showComments(dynamic.id)">
                <span class="stat-icon">💬</span>
                <span class="stat-count">{{ formatCount(dynamic.comments) }}</span>
              </button>
              <button class="stat-item" @click="shareDynamic(dynamic.id)">
                <span class="stat-icon">🔄</span>
                <span class="stat-count">{{ formatCount(dynamic.shares) }}</span>
              </button>
              <button class="stat-item" @click="collectDynamic(dynamic.id)">
                <span class="stat-icon">{{ dynamic.isCollected ? '⭐' : '☆' }}</span>
                <span class="stat-count">{{ formatCount(dynamic.collects) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 筛选选项
const filterOptions = ref([
  { value: 'all', label: '全部', icon: '🌟' },
  { value: '发布新歌', label: '新歌', icon: '🎵' },
  { value: '演唱会', label: '演出', icon: '🎤' },
  { value: '直播', label: '直播', icon: '📺' },
  { value: '动态', label: '动态', icon: '📝' },
  { value: '合作', label: '合作', icon: '🤝' }
])

const activeFilter = ref('all')
const loading = ref(false)

// 丰富的假数据
const dynamicList = ref([
  {
    id: 1,
    name: '周杰伦',
    userType: '华语流行天王',
    avatar: 'https://picsum.photos/60/60?random=1',
    isOnline: true,
    verified: true,
    isFollowing: true,
    badge: { icon: '👑' },
    publishTime: '2小时前',
    type: '发布新歌',
    typeColor: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    title: '《稻香》20周年纪念版',
    description: '时光荏苒，《稻香》陪伴了我们20年。这次重新编曲，加入了更多现代元素，希望能唤起大家心中最美好的回忆。感谢一路支持的朋友们！',
    location: '台北录音室',
    tags: ['怀旧', '经典重现', '20周年'],
    media: {
      type: 'audio',
      cover: 'https://picsum.photos/300/300?random=101',
      title: '稻香 (20周年纪念版)',
      artist: '周杰伦',
      duration: '3:45'
    },
    likes: 125800,
    comments: 8560,
    shares: 2340,
    collects: 15600,
    isLiked: true,
    isCollected: false
  },
  {
    id: 2,
    name: '邓紫棋',
    userType: '创作型歌手',
    avatar: 'https://picsum.photos/60/60?random=2',
    isOnline: false,
    verified: true,
    isFollowing: false,
    badge: { icon: '🎤' },
    publishTime: '5小时前',
    type: '演唱会',
    typeColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    title: '2024「启示录」世界巡回演唱会',
    description: '经过两年的精心筹备，我的全新世界巡演即将启程！这次演唱会将融合最新的舞台科技，为大家带来前所未有的视听盛宴。首站香港，我们不见不散！',
    location: '香港红磡体育馆',
    tags: ['世界巡演', '启示录', '香港首站'],
    media: {
      type: 'video',
      cover: 'https://picsum.photos/400/225?random=102',
      duration: '2:30'
    },
    likes: 89600,
    comments: 4320,
    shares: 1560,
    collects: 8900,
    isLiked: false,
    isCollected: true
  },
  {
    id: 3,
    name: '林俊杰',
    userType: '创作歌手',
    avatar: 'https://picsum.photos/60/60?random=3',
    isOnline: true,
    verified: true,
    isFollowing: true,
    badge: { icon: '🎹' },
    publishTime: '8小时前',
    type: '直播',
    typeColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    title: '深夜音乐分享会',
    description: '今晚11点，我会在直播间和大家分享一些最近创作的小样，还有一些音乐制作的心得。准备了几首即兴演奏，希望能给失眠的朋友们一些温暖。',
    location: '新加坡工作室',
    tags: ['深夜直播', '音乐分享', '即兴演奏'],
    media: {
      type: 'image',
      content: ['https://picsum.photos/400/300?random=103']
    },
    likes: 65400,
    comments: 2980,
    shares: 890,
    collects: 5600,
    isLiked: true,
    isCollected: false
  },
  {
    id: 4,
    name: '陈奕迅',
    userType: '实力派歌手',
    avatar: 'https://picsum.photos/60/60?random=4',
    isOnline: false,
    verified: true,
    isFollowing: true,
    badge: { icon: '🎭' },
    publishTime: '1天前',
    type: '动态',
    typeColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    title: '音乐路上的感悟',
    description: '最近在整理以前的录音，发现了很多有趣的片段。每一首歌背后都有故事，每一次录音都是成长。音乐这条路走了这么多年，感谢还有你们陪伴。',
    location: '香港',
    tags: ['音乐感悟', '成长', '感谢'],
    media: {
      type: 'image',
      content: [
        'https://picsum.photos/300/300?random=104',
        'https://picsum.photos/300/300?random=105',
        'https://picsum.photos/300/300?random=106'
      ]
    },
    likes: 43200,
    comments: 1670,
    shares: 780,
    collects: 3200,
    isLiked: false,
    isCollected: true
  },
  {
    id: 5,
    name: '薛之谦',
    userType: '创作歌手',
    avatar: 'https://picsum.photos/60/60?random=5',
    isOnline: true,
    verified: true,
    isFollowing: false,
    badge: { icon: '😄' },
    publishTime: '1天前',
    type: '合作',
    typeColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    title: '与新人歌手小雨的合作单曲',
    description: '很高兴能和才华横溢的小雨合作这首《时光倒流》。她的声音很有特色，这次合作让我学到了很多。希望大家会喜欢我们的作品！',
    location: '北京录音棚',
    tags: ['合作', '新人扶持', '时光倒流'],
    media: {
      type: 'audio',
      cover: 'https://picsum.photos/300/300?random=107',
      title: '时光倒流 (feat. 小雨)',
      artist: '薛之谦 & 小雨',
      duration: '4:12'
    },
    likes: 78900,
    comments: 5430,
    shares: 1230,
    collects: 6700,
    isLiked: true,
    isCollected: false
  },
  {
    id: 6,
    name: '张学友',
    userType: '歌神',
    avatar: 'https://picsum.photos/60/60?random=6',
    isOnline: false,
    verified: true,
    isFollowing: true,
    badge: { icon: '👑' },
    publishTime: '2天前',
    type: '演唱会',
    typeColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    title: '"经典咏流传"告别演唱会',
    description: '经过深思熟虑，我决定举办最后一场大型演唱会。这不是结束，而是另一个开始。感谢40年来大家的支持，让我们一起重温那些经典时光。',
    location: '香港体育馆',
    tags: ['告别演唱会', '经典咏流传', '40年'],
    media: {
      type: 'video',
      cover: 'https://picsum.photos/400/225?random=108',
      duration: '5:20'
    },
    likes: 234500,
    comments: 15600,
    shares: 8900,
    collects: 45600,
    isLiked: true,
    isCollected: true
  },
  {
    id: 7,
    name: '李荣浩',
    userType: '创作才子',
    avatar: 'https://picsum.photos/60/60?random=7',
    isOnline: true,
    verified: true,
    isFollowing: false,
    badge: { icon: '🎸' },
    publishTime: '3天前',
    type: '发布新歌',
    typeColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    title: '新专辑《简单》首支单曲',
    description: '用最简单的旋律，唱最真实的故事。这首《简单》是我对生活的理解，希望在这个复杂的世界里，我们都能保持内心的简单和纯真。',
    location: '上海录音室',
    tags: ['新专辑', '简单', '真实'],
    media: {
      type: 'audio',
      cover: 'https://picsum.photos/300/300?random=109',
      title: '简单',
      artist: '李荣浩',
      duration: '3:28'
    },
    likes: 92300,
    comments: 6780,
    shares: 2100,
    collects: 12400,
    isLiked: false,
    isCollected: false
  },
  {
    id: 8,
    name: '毛不易',
    userType: '民谣歌手',
    avatar: 'https://picsum.photos/60/60?random=8',
    isOnline: false,
    verified: true,
    isFollowing: true,
    badge: { icon: '🍃' },
    publishTime: '3天前',
    type: '动态',
    typeColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    title: '深秋的思考',
    description: '走在满是落叶的小径上，突然想起很多往事。音乐就像这些落叶，每一片都有它的故事。最近在写一些关于时间的歌，希望能记录下这个季节的美好。',
    location: '杭州西湖',
    tags: ['深秋', '思考', '时间'],
    media: {
      type: 'image',
      content: [
        'https://picsum.photos/400/300?random=110',
        'https://picsum.photos/400/300?random=111'
      ]
    },
    likes: 56700,
    comments: 3450,
    shares: 890,
    collects: 7800,
    isLiked: true,
    isCollected: true
  },
  {
    id: 9,
    name: '华晨宇',
    userType: '火星音乐人',
    avatar: 'https://picsum.photos/60/60?random=9',
    isOnline: true,
    verified: true,
    isFollowing: false,
    badge: { icon: '🚀' },
    publishTime: '4天前',
    type: '直播',
    typeColor: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    title: '火星音乐实验室',
    description: '今晚的直播会尝试一些全新的音乐风格，融合电子、摇滚和古典元素。这是一次音乐实验，不知道会碰撞出什么样的火花，和我一起探索音乐的无限可能！',
    location: '北京工作室',
    tags: ['音乐实验', '火星', '创新'],
    media: {
      type: 'video',
      cover: 'https://picsum.photos/400/225?random=112',
      duration: '1:45'
    },
    likes: 87600,
    comments: 9870,
    shares: 3450,
    collects: 15600,
    isLiked: false,
    isCollected: false
  },
  {
    id: 10,
    name: '周深',
    userType: '治愈系歌手',
    avatar: 'https://picsum.photos/60/60?random=10',
    isOnline: false,
    verified: true,
    isFollowing: true,
    badge: { icon: '🌙' },
    publishTime: '5天前',
    type: '合作',
    typeColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    title: '与交响乐团的跨界合作',
    description: '很荣幸能与国家交响乐团合作，将流行音乐与古典音乐完美融合。这次合作让我对音乐有了更深的理解，期待在音乐会上与大家分享这份美好。',
    location: '国家大剧院',
    tags: ['跨界合作', '交响乐', '古典融合'],
    media: {
      type: 'image',
      content: ['https://picsum.photos/500/300?random=113']
    },
    likes: 76500,
    comments: 4560,
    shares: 1890,
    collects: 9800,
    isLiked: true,
    isCollected: true
  }
])

// 计算筛选后的动态
const filteredDynamics = computed(() => {
  if (activeFilter.value === 'all') {
    return dynamicList.value
  }
  return dynamicList.value.filter(dynamic => dynamic.type === activeFilter.value)
})

// 设置筛选
const setFilter = (filter) => {
  activeFilter.value = filter
}

// 刷新动态
const refreshDynamics = () => {
  loading.value = true
  setTimeout(() => {
    console.log('刷新动态列表')
    loading.value = false
  }, 1500)
}

// 切换关注状态
const toggleFollow = (dynamicId) => {
  const dynamic = dynamicList.value.find(d => d.id === dynamicId)
  if (dynamic) {
    dynamic.isFollowing = !dynamic.isFollowing
    console.log(`${dynamic.isFollowing ? '关注' : '取消关注'} ${dynamic.name}`)
  }
}

// 切换点赞
const toggleLike = (dynamicId) => {
  const dynamic = dynamicList.value.find(d => d.id === dynamicId)
  if (dynamic) {
    dynamic.isLiked = !dynamic.isLiked
    dynamic.likes += dynamic.isLiked ? 1 : -1
  }
}

// 显示评论
const showComments = (dynamicId) => {
  console.log('显示评论', dynamicId)
}

// 分享动态
const shareDynamic = (dynamicId) => {
  const dynamic = dynamicList.value.find(d => d.id === dynamicId)
  if (dynamic) {
    dynamic.shares += 1
    console.log('分享动态', dynamic.title)
  }
}

// 收藏动态
const collectDynamic = (dynamicId) => {
  const dynamic = dynamicList.value.find(d => d.id === dynamicId)
  if (dynamic) {
    dynamic.isCollected = !dynamic.isCollected
    dynamic.collects += dynamic.isCollected ? 1 : -1
  }
}

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

onMounted(() => {
  console.log('动态广场已加载')
})
</script>

<style scoped>
.dynamic-view {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 24px;
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 页面头部 */
.dynamic-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 32px;
}

.dynamic-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.filter-icon {
  font-size: 16px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #ffffff;
}

.empty-state p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

.reset-filter-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* 动态列表 */
.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dynamic-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dynamic-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--type-color, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
}

.dynamic-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #666;
  border: 2px solid #0a0a0a;
}

.online-status.online {
  background: #4caf50;
}

.user-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid #0a0a0a;
}

.user-details {
  flex: 1;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
}

.verified-icon {
  color: #1da1f2;
  background: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.user-type {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 4px 0;
}

.publish-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.dynamic-actions {
  display: flex;
  gap: 12px;
}

.follow-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.follow-btn.following {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.follow-btn.following:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.5);
  color: #f44336;
}

/* 动态内容 */
.dynamic-content-main {
  margin-left: 76px;
}

.dynamic-header-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.dynamic-type {
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.dynamic-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.location-icon {
  font-size: 14px;
}

.dynamic-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
  line-height: 1.4;
}

.dynamic-description {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.dynamic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 媒体内容 */
.dynamic-media {
  margin-bottom: 20px;
}

.media-images {
  display: grid;
  gap: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.media-images:has(.media-image:nth-child(1):nth-last-child(1)) {
  grid-template-columns: 1fr;
}

.media-images:has(.media-image:nth-child(2)) {
  grid-template-columns: 1fr 1fr;
}

.media-images:has(.media-image:nth-child(3)) {
  grid-template-columns: 1fr 1fr 1fr;
}

.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
}

.media-image.single-image {
  height: 300px;
  max-width: 500px;
}

.media-image:hover {
  transform: scale(1.02);
}

.media-video {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.video-placeholder {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.video-cover {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.play-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  font-size: 24px;
  margin-left: 4px;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.media-audio {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.audio-player {
  display: flex;
  gap: 16px;
  align-items: center;
}

.audio-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.audio-info {
  flex: 1;
}

.audio-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: white;
}

.audio-artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px 0;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.1);
}

.audio-progress {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  width: 30%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.audio-duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* 互动统计 */
.dynamic-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 20px;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.stat-item.active {
  color: #ff6b6b;
}

.stat-icon {
  font-size: 16px;
}

.stat-count {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dynamic-view {
    padding: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-tabs {
    justify-content: center;
  }

  .page-title {
    font-size: 24px;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dynamic-content-main {
    margin-left: 0;
  }

  .dynamic-stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .media-images:has(.media-image:nth-child(3)) {
    grid-template-columns: 1fr 1fr;
  }

  .audio-player {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .filter-tabs {
    gap: 4px;
  }

  .filter-tab {
    padding: 6px 12px;
    font-size: 12px;
  }

  .dynamic-item {
    padding: 16px;
  }

  .media-images:has(.media-image:nth-child(2)) {
    grid-template-columns: 1fr;
  }
}
</style>
