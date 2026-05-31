<template>
  <div class="app-container">
    <header class="top-header" v-show="!shouldHideHeader">
      <div class="header-left">
        <!-- 返回按钮 - 始终显示，但在推荐页时置灰 -->
        <button
          class="back-btn"
          @click="goBack"
          :disabled="isRecommendPage"
          :class="{ disabled: isRecommendPage }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        <div class="search-container">
          <input type="text" placeholder="搜索音乐、歌手、专辑" class="search-input" />
          <button class="search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="header-right">
        <div
          class="user-info-container"
          @mouseenter="showUserDropdown"
          @mouseleave="hideUserDropdown"
        >
          <div class="user-info" @click="handleUserClick">
            <img :src="userStore.avatar" alt="用户头像" class="user-avatar" />
            <span class="username">{{ userStore.username }}</span>
            <button class="user-menu-btn">⋮</button>
          </div>

          <!-- 下拉菜单 -->
          <div v-if="userStore.isLoggedIn && showDropdown" class="user-dropdown">
            <div class="dropdown-item" @click.stop="goToProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              个人中心
            </div>
            <div class="dropdown-item" @click.stop="goToSettings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
                />
              </svg>
              设置
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click.stop="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                />
              </svg>
              退出登录
            </div>
          </div>
        </div>
      </div>
    </header>

    <nav class="sidebar">
      <div class="nav-item">
        <RouterLink to="/recommend" class="nav-link">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">推荐</span>
        </RouterLink>
      </div>
      <div class="nav-item">
        <RouterLink to="/selected" class="nav-link">
          <span class="nav-icon">🎵</span>
          <span class="nav-text">曲库</span>
        </RouterLink>

        <RouterLink to="/playlist-square" class="nav-link">
          <span class="nav-icon">🎶</span>
          <span class="nav-text">歌单广场</span>
        </RouterLink>

        <RouterLink to="/Dynamic" class="nav-link">
          <span class="nav-icon">👥</span>
          <span class="nav-text">动态</span>
        </RouterLink>
      </div>
      <div class="nav-item">
        <RouterLink to="/like" class="nav-link">
          <span class="nav-icon">❤️</span>
          <span class="nav-text">我喜欢的音乐</span>
        </RouterLink>
      </div>
      <div class="nav-item">
        <RouterLink to="/collect" class="nav-link">
          <span class="nav-icon">⭐</span>
          <span class="nav-text">我的收藏歌单</span>
        </RouterLink>
      </div>
      <div class="nav-item">
        <RouterLink to="/ai-track" class="nav-link">
          <span class="nav-icon">🤖</span>
          <span class="nav-text">在线AI音轨</span>
        </RouterLink>
      </div>
      <div class="nav-item">
        <RouterLink to="/upload" class="nav-link">
          <span class="nav-icon">📤</span>
          <span class="nav-text">上传歌曲</span>
        </RouterLink>
      </div>
    </nav>
    <main class="main-content">
      <keep-alive include="PlaylistSquare,SelectedView">
        <RouterView />
      </keep-alive>
    </main>
    <!-- 添加过渡动画的AudioPlayer -->
    <Transition name="player-slide">
      <AudioPlayer v-if="!isLyricsFullscreen" class="audio-player-container" />
    </Transition>

    <!-- 登录注册弹窗 -->
    <AuthModal
      :visible="showAuthModal"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />
    <!-- AuthModal组件 -->
    <AuthModal
      :visible="userStore.authModalVisible"
      @close="userStore.closeAuthModal()"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AudioPlayer from './components/AudioPlayer.vue'
import AuthModal from './components/AuthModal.vue'
import { useAudioStore } from './stores/audio'
import { useUserStore } from './stores/user'

// 在script setup中添加
const route = useRoute()
const router = useRouter()

// 判断是否在推荐页
const isRecommendPage = computed(() => {
  return route.path === '/recommend' || route.path === '/'
})

// 返回上一页 - 只有在非推荐页时才执行
const goBack = () => {
  if (isRecommendPage.value) {
    return // 推荐页不执行返回操作
  }

  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // 如果没有历史记录，返回推荐页
    router.push('/recommend')
  }
}
const audioStore = useAudioStore()
const userStore = useUserStore()
const { isLyricsFullscreen } = storeToRefs(audioStore)
const showAuthModal = ref(false)

// 计算是否应该隐藏顶部导航栏
const shouldHideHeader = computed(() => {
  // 在歌词界面或歌词全屏模式下隐藏
  return route.path.startsWith('/lyrics') || isLyricsFullscreen.value
})

// 处理用户信息区域点击
const handleUserClick = () => {
  if (!userStore.isLoggedIn) {
    userStore.openAuthModal()
  }
  // 如果已登录，点击不做任何操作，只通过悬浮显示菜单
}

// 处理登录/注册成功
const handleAuthSuccess = () => {
  console.log('登录/注册成功')
}

// 跳转到个人中心
const goToProfile = () => {
  showDropdown.value = false
  router.push('/profile')
}

// 跳转到设置
const goToSettings = () => {
  showDropdown.value = false
  // TODO: 实现跳转到设置页面
  console.log('跳转到设置')
}

// 处理退出登录
const handleLogout = () => {
  showDropdown.value = false
  userStore.logout()

  // 如果当前在个人中心页面，退出后跳转到推荐页面
  if (route.path === '/profile') {
    router.push('/recommend')
  }

  console.log('已退出登录')
}

// 初始化用户状态
onMounted(() => {
  userStore.initUser()
})

const showDropdown = ref(false)
let hideTimeout = null

// 显示下拉菜单
const showUserDropdown = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  showDropdown.value = true
}

// 延迟隐藏下拉菜单
const hideUserDropdown = () => {
  hideTimeout = setTimeout(() => {
    showDropdown.value = false
  }, 500) // 500ms延迟
}
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: v-bind('shouldHideHeader ? "0px" : "60px"');
  padding-bottom: 80px;
  box-sizing: border-box;
  transition: padding-top 0.3s ease;
  overflow: hidden !important; /* 强制隐藏容器滚动条 */
}

.main-content {
  flex: 1;
  margin-left: 200px;
  margin-top: 0;
  background: #ffffff;
  overflow: hidden; /* 改为hidden，让每个页面组件自己管理滚动 */
  height: v-bind('shouldHideHeader ? "calc(100vh - 80px)" : "calc(100vh - 140px)"');
  box-sizing: border-box;
  max-width: none;
  transition: height 0.3s ease;
}

.top-header {
  position: fixed;
  top: 0;
  left: 200px;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1002;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.header-left {
  flex: 0 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.logo:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.logo-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  max-width: 500px;
  margin: 0 20px 0 40px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 350px;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 40px 0 16px;
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.search-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

/* 用户信息容器 - 包含头像区域和下拉菜单 */
.user-info-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 下拉菜单样式 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 180px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  overflow: hidden;
  z-index: 1000;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.4s ease;
}

.dropdown-item:hover {
  background: rgba(0, 255, 255, 0.15);
  color: #00ffff;
  transform: translateX(4px);
}

.dropdown-item:hover::before {
  left: 100%;
}

.dropdown-item svg {
  transition: all 0.3s ease;
}

.dropdown-item:hover svg {
  color: #00ffff;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
}

.dropdown-item.logout {
  color: #ff6b6b;
}

.dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.15);
  color: #ff4757;
  border-left: 3px solid #ff4757;
}

.dropdown-item.logout:hover svg {
  color: #ff4757;
  filter: drop-shadow(0 0 5px rgba(255, 71, 87, 0.5));
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  margin: 4px 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.user-menu-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  color: white;
  transform: rotate(180deg);
}
.main-content {
  flex: 1;
  margin-left: 200px;
  margin-top: 0;
  background: #ffffff;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: v-bind('shouldHideHeader ? "calc(100vh - 80px)" : "calc(100vh - 140px)"');
  box-sizing: border-box;
  max-width: none;
  /* 移除顶部白线 */
  /* border-top: 1px solid rgba(255, 255, 255, 0.1); */
  transition: min-height 0.3s ease;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  /* 移除右侧青色线 */
  /* border-right: 1px solid rgba(0, 255, 255, 0.1); */
  display: flex;
  flex-direction: column;
  padding: 30px 0;
  z-index: 1000;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
}

.nav-item {
  margin-bottom: 4px;
  padding: 0 15px;
}

.nav-link {
  display: block;
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-link:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  transform: translateX(8px);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #ffffff;
  transform: translateX(8px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* AudioPlayer容器样式 */
.audio-player-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

/* 播放器滑动动画 */
.player-slide-enter-active,
.player-slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.player-slide-enter-from {
  transform: translateY(100%);
}

.player-slide-leave-to {
  transform: translateY(100%);
}

.player-slide-enter-to,
.player-slide-leave-from {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .app-container {
    /* 响应式下也要动态调整内边距 */
    padding-top: v-bind('shouldHideHeader ? "0px" : "60px"');
  }

  .top-header {
    left: 180px;
    padding: 0 15px;
  }

  .header-center {
    margin: 0 15px 0 20px;
  }

  .search-container {
    max-width: 250px;
  }

  .logo-text {
    display: none;
  }

  .username {
    display: none;
  }

  .sidebar {
    width: 180px;
  }

  .main-content {
    margin-left: 180px;
    width: calc(100vw - 180px);
    max-width: calc(100vw - 180px);
    /* 响应式下也要动态调整最小高度 */
    min-height: v-bind('shouldHideHeader ? "calc(100vh - 80px)" : "calc(100vh - 140px)"');
  }
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.back-btn:active:not(.disabled) {
  transform: translateX(-1px);
}

/* 禁用状态样式 */
.back-btn.disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  transform: none;
}

.back-btn:disabled {
  pointer-events: none;
}

.search-container {
  flex: 1;
  max-width: 400px;
}
</style>
