<template>
  <div class="follow-list-view">
    <!-- 头部 -->
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="title">我的关注</h1>
      </div>
      <div class="header-right">
        <span class="count">{{ followList.length }}人</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-box">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索关注的用户"
          class="search-input"
        />
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.key"
        :class="['tab-btn', { active: activeCategory === category.key }]"
        @click="setCategory(category.key)"
      >
        {{ category.label }}
        <span class="tab-count">{{ getCategoryCount(category.key) }}</span>
      </button>
    </div>

    <!-- 关注列表 -->
    <div class="follow-list" v-if="filteredFollowList.length > 0">
      <div
        v-for="user in filteredFollowList"
        :key="user.id"
        class="follow-item"
        @click="goToProfile(user.id)"
      >
        <div class="user-info">
          <div class="avatar-container">
            <img
              :src="user.avatarUrl || '/images/default-avatar.png'"
              :alt="user.username"
              class="avatar"
            />
            <div v-if="isUserOnline(user)" class="online-indicator"></div>
            <div v-if="user.artistProfile" class="verified-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="12" r="10" fill="#00ffff" />
              </svg>
            </div>
          </div>

          <div class="user-details">
            <div class="user-name-row">
              <h3 class="user-name">{{ user.nickname || user.username }}</h3>
              <span v-if="user.artistProfile" class="user-type">歌手</span>
              <span v-else class="user-type">普通用户</span>
            </div>
            <p class="user-bio">{{ user.bio || '这个人很懒，什么都没有留下' }}</p>
            <div class="user-stats">
              <span class="stat-item">{{ formatUserType(user) }}</span>
              <span class="follow-time">{{ formatFollowTime(user.createTime) }}加入</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="message-btn" @click.stop="sendMessage(user)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            私信
          </button>
          <button class="more-btn" @click.stop="showMoreOptions(user)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" />
          <path
            d="M23 21V19C23 16.7909 21.2091 15 19 15C18.0832 15 17.2331 15.2706 16.5288 15.7324"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="19" cy="7" r="4" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>
      <h3 class="empty-title">{{ getEmptyTitle() }}</h3>
      <p class="empty-desc">{{ getEmptyDesc() }}</p>
      <button class="discover-btn" @click="goToDiscover">去发现更多用户</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && filteredFollowList.length > 0" class="load-more">
      <button class="load-more-btn" @click="loadMore" :disabled="loading">
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserFollowing } from '@/api/user'

const router = useRouter()
const route = useRoute()

// 根据路由参数设置初始状态
const initializeFromRoute = () => {
  const type = route.query.type
  if (type === 'followers') {
    // 如果是从粉丝数字点击进来的，可以设置特定的初始状态
  } else if (type === 'following') {
    // 如果是从关注数字点击进来的
    fetchFollowingList()
  } else {
    // 默认加载关注列表
    fetchFollowingList()
  }
}

// 响应式数据
const searchQuery = ref('')
const activeCategory = ref('all')
const loading = ref(false)
const hasMore = ref(false)

// 分类选项
const categories = ref([
  { key: 'all', label: '全部' },
  { key: 'artist', label: '歌手' },
  { key: 'user', label: '普通用户' },
])

// 关注列表数据
const followList = ref([])

// 获取关注列表
const fetchFollowingList = async () => {
  try {
    loading.value = true
    const response = await getUserFollowing()
    // 由于request.js已经处理了code判断，这里直接使用data
    followList.value = response.data || []
  } catch (error) {
    console.error('获取关注列表失败:', error)
    // 可以添加错误提示
  } finally {
    loading.value = false
  }
}

// 计算属性
const filteredFollowList = computed(() => {
  let filtered = followList.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    if (activeCategory.value === 'artist') {
      filtered = filtered.filter((user) => user.artistProfile !== null)
    } else if (activeCategory.value === 'user') {
      filtered = filtered.filter((user) => user.artistProfile === null)
    }
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        (user.nickname || user.username).toLowerCase().includes(query) ||
        (user.bio && user.bio.toLowerCase().includes(query)),
    )
  }

  return filtered
})

// 方法
const setCategory = (category) => {
  activeCategory.value = category
}

const getCategoryCount = (category) => {
  if (category === 'all') return followList.value.length
  if (category === 'artist') {
    return followList.value.filter((user) => user.artistProfile !== null).length
  }
  if (category === 'user') {
    return followList.value.filter((user) => user.artistProfile === null).length
  }
  return 0
}

// 判断用户是否在线（根据最后登录时间）
const isUserOnline = (user) => {
  if (!user.lastLoginTime) return false
  const lastLogin = new Date(user.lastLoginTime)
  const now = new Date()
  const diffMinutes = (now - lastLogin) / (1000 * 60)
  // 如果最后登录时间在30分钟内，认为在线
  return diffMinutes <= 30
}

const sendMessage = (user) => {
  // 跳转到私信页面
  router.push(`/message/${user.id}`)
}

const showMoreOptions = (user) => {
  // 显示更多操作选项（举报、拉黑等）
  console.log('显示更多选项', user)
}

const goToProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

const goToDiscover = () => {
  router.push('/discover')
}

const loadMore = () => {
  // 如果后端支持分页，可以在这里实现加载更多
  console.log('加载更多数据')
}

const formatUserType = (user) => {
  if (user.artistProfile) {
    return `歌手 · ${user.artistProfile.genre || '未知风格'}`
  }
  return '普通用户'
}

const formatFollowTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 30) {
    return `${days}天前`
  } else if (days < 365) {
    return `${Math.floor(days / 30)}个月前`
  } else {
    return `${Math.floor(days / 365)}年前`
  }
}

const getEmptyTitle = () => {
  if (searchQuery.value.trim()) {
    return '没有找到相关用户'
  }
  if (activeCategory.value === 'artist') {
    return '还没有关注歌手'
  }
  if (activeCategory.value === 'user') {
    return '还没有关注普通用户'
  }
  return '还没有关注任何人'
}

const getEmptyDesc = () => {
  if (searchQuery.value.trim()) {
    return '试试其他关键词或浏览推荐用户'
  }
  return '去发现页面找找感兴趣的用户吧'
}

onMounted(() => {
  console.log('关注列表页面加载完成')
  initializeFromRoute()
})
</script>

<style scoped>
.follow-list-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  padding-bottom: 80px;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.4);
  transform: translateX(-2px);
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

/* 搜索栏样式 */
.search-section {
  padding: 20px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 15px 15px 15px 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

/* 分类标签样式 */
.category-tabs {
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.3);
  color: white;
}

.tab-btn.active {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
}

/* 关注列表样式 */
.follow-list {
  padding: 0 20px;
}

.follow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.follow-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
  border: 2px solid #0a0a0a;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.verified-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.user-details {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.user-type {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.user-bio {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 5px 0;
  line-height: 1.4;
}

.user-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-item {
  color: rgba(0, 255, 255, 0.8);
}

.follow-time {
  color: rgba(255, 255, 255, 0.5);
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.message-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.message-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
  background: linear-gradient(135deg, #00cccc 0%, #0066cc 100%);
}

.more-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.3);
  color: white;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.2);
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: white;
}

.empty-desc {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
  line-height: 1.5;
}

.discover-btn {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  border: none;
  color: white;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.discover-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

/* 加载更多样式 */
.load-more {
  text-align: center;
  padding: 30px 20px;
}

.load-more-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: white;
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.load-more-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.4);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .follow-item {
    padding: 15px;
  }

  .user-info {
    gap: 12px;
  }

  .avatar {
    width: 50px;
    height: 50px;
  }

  .user-name {
    font-size: 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .message-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
