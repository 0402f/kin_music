<template>
  <div class="app-container" :class="{ 'sidebar-open': sidebarVisible }">
    <!-- 移动端侧边栏遮罩 -->
    <div
      v-if="sidebarVisible"
      class="sidebar-overlay"
      @click="closeSidebar"
      ref="overlayRef"
    ></div>

    <!-- 顶部导航栏 -->
    <header class="top-header" v-show="!shouldHideHeader">
      <div class="header-left">
        <!-- 汉堡菜单按钮 -->
        <button v-show="!shouldHideSidebar" class="hamburger-btn" @click="toggleSidebar" aria-label="菜单">
          <span class="hamburger-line" :class="{ open: sidebarVisible }"></span>
        </button>

        <!-- 桌面端：返回+搜索 -->
        <template v-if="!shouldHideSidebar" class="desktop-header-content">
          <button class="back-btn desktop-only" @click="goBack" :disabled="isRecommendPage" :class="{ disabled: isRecommendPage }" aria-label="返回">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div class="search-container desktop-only">
            <input type="text" placeholder="搜索音乐、歌手、专辑" class="search-input" />
            <button class="search-btn" aria-label="搜索">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </button>
          </div>
        </template>

        <!-- 手机端：顶部导航Tab + 搜索 -->
        <nav v-if="!shouldHideSidebar" class="mobile-tabs">
          <RouterLink to="/recommend" class="mtab" :class="{ active: route.path === '/recommend' || route.path === '/' }">推荐</RouterLink>
          <RouterLink to="/selected" class="mtab" :class="{ active: route.path === '/selected' }">曲库</RouterLink>
          <RouterLink to="/playlist-square" class="mtab" :class="{ active: route.path === '/playlist-square' }">歌单</RouterLink>
          <RouterLink to="/ai-track" class="mtab" :class="{ active: route.path === '/ai-track' }">灵音</RouterLink>
          <RouterLink to="/category" class="mtab" :class="{ active: route.path === '/category' }">分类</RouterLink>
        </nav>

        <!-- 手机端搜索图标 -->
        <RouterLink v-if="!shouldHideSidebar" to="/search" class="mobile-search-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </RouterLink>
      </div>

      <!-- 桌面端用户区 -->
      <div class="header-right desktop-only">
        <div class="user-info-container" @mouseenter="showUserDropdown" @mouseleave="hideUserDropdown">
          <div class="user-info" @click="handleUserClick">
            <img :src="userStore.avatar" alt="用户头像" class="user-avatar" />
            <span class="username-text">{{ userStore.username }}</span>
            <button class="user-menu-btn" aria-label="用户菜单">⋮</button>
          </div>
          <Transition name="dropdown">
            <div v-if="userStore.isLoggedIn && showDropdown" class="user-dropdown">
              <div class="dropdown-item" @click.stop="goToProfile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>个人中心
              </div>
              <div class="dropdown-item" @click.stop="goToSettings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>设置
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout" @click.stop="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>退出登录
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- 侧边栏导航 (歌词页/全屏时隐藏) -->
    <nav v-show="!shouldHideSidebar" class="sidebar" :class="{ visible: sidebarVisible }" ref="sidebarRef">
      <!-- 侧边栏头部（移动端显示） -->
      <div class="sidebar-header">
        <span class="sidebar-logo">🎵 kin_music</span>
        <button class="sidebar-close-btn" @click="closeSidebar" aria-label="关闭菜单">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
        </button>
      </div>

      <div class="sidebar-nav">
        <div class="nav-group">
          <RouterLink to="/recommend" class="nav-link" @click="onNavClick">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </span>
            <span class="nav-text">推荐</span>
          </RouterLink>
        </div>
        <div class="nav-group">
          <RouterLink to="/selected" class="nav-link" @click="onNavClick">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </span>
            <span class="nav-text">曲库</span>
          </RouterLink>
          <RouterLink to="/playlist-square" class="nav-link" @click="onNavClick">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.5V5h4v2zm-7 10H4V6h2v13h5v-2z"/></svg>
            </span>
            <span class="nav-text">歌单广场</span>
          </RouterLink>
          <RouterLink to="/category" class="nav-link" @click="onNavClick">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>
            </span>
            <span class="nav-text">歌曲分类</span>
          </RouterLink>
        </div>
        <div class="nav-group">
          <RouterLink to="/ai-track" class="nav-link" @click="onNavClick">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </span>
            <span class="nav-text">灵音</span>
          </RouterLink>
          <RouterLink to="/upload" class="nav-link" @click="onNavClick">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
            </span>
            <span class="nav-text">上传歌曲</span>
          </RouterLink>
        </div>
        <div class="nav-divider"></div>
        <div class="nav-group">
          <a v-if="userStore.isLoggedIn" class="nav-link nav-logout" @click="handleLogout">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span class="nav-text">退出登录</span>
          </a>
        </div>
      </div>

      <!-- 移动端底部用户信息 -->
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <keep-alive include="PlaylistSquare,SelectedView">
        <RouterView v-slot="{ Component }">
          <keep-alive include="SearchView">
            <component :is="Component" />
          </keep-alive>
        </RouterView>
      </keep-alive>
    </main>

    <!-- 手机端底部导航栏 -->
    <nav v-show="!shouldHideSidebar" class="mobile-bottom-nav">
      <RouterLink to="/recommend" class="mbn-item" :class="{ active: route.path === '/recommend' || route.path === '/' }">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>首页</span>
      </RouterLink>
      <RouterLink to="/search" class="mbn-item" :class="{ active: route.path === '/search' }">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>搜索</span>
      </RouterLink>
      <RouterLink to="/profile" class="mbn-item" :class="{ active: route.path === '/profile' }">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>我的</span>
      </RouterLink>
    </nav>

    <!-- 底部播放器 -->
    <Transition name="player-slide">
      <AudioPlayer v-if="!isLyricsFullscreen && !route.path.includes('/edit')" class="audio-player-container" />
    </Transition>

    <!-- 登录弹窗（全局统一入口） -->
    <AuthModal :visible="userStore.authModalVisible" @close="userStore.closeAuthModal()" @success="handleAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AudioPlayer from './components/AudioPlayer.vue'
import AuthModal from './components/AuthModal.vue'
import { useAudioStore } from './stores/audio'
import { useUserStore } from './stores/user'

const route = useRoute()
const router = useRouter()
const audioStore = useAudioStore()
const userStore = useUserStore()
const { isLyricsFullscreen } = storeToRefs(audioStore)
const sidebarVisible = ref(false)
const sidebarRef = ref(null)
const overlayRef = ref(null)

// --- 路由 / 导航 ---
const isRecommendPage = computed(() => route.path === '/recommend' || route.path === '/')

const goBack = () => {
  if (isRecommendPage.value) return
  if (window.history.length > 1) router.go(-1)
  else router.push('/recommend')
}

const shouldHideHeader = computed(() => {
  return route.path.startsWith('/lyrics') || route.path.startsWith('/playlist/') || isLyricsFullscreen.value
})

// 歌词页面/全屏歌词/歌单详情时隐藏侧边栏
const shouldHideSidebar = computed(() => {
  return route.path.startsWith('/lyrics') || route.path.startsWith('/playlist/') || isLyricsFullscreen.value
})

// --- 侧边栏控制 ---
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const closeSidebar = () => {
  sidebarVisible.value = false
}

const onNavClick = () => {
  // 移动端点击导航后自动关闭侧边栏
  if (window.innerWidth <= 768) {
    sidebarVisible.value = false
  }
}

// 路由变化时关闭侧边栏
watch(() => route.path, () => {
  if (window.innerWidth <= 768) {
    sidebarVisible.value = false
  }
})

// ESC 关闭侧边栏
const handleKeydown = (e) => {
  if (e.key === 'Escape' && sidebarVisible.value) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  userStore.initUser()
  document.addEventListener('keydown', handleKeydown)
})

// --- 用户下拉菜单 ---
const showDropdown = ref(false)
let hideTimeout = null

const handleUserClick = () => {
  if (!userStore.isLoggedIn) userStore.openAuthModal()
}

const handleAuthSuccess = () => { console.log('登录/注册成功') }

const goToProfile = () => {
  showDropdown.value = false
  router.push('/profile')
}

const goToSettings = () => {
  showDropdown.value = false
  console.log('跳转到设置')
}

const handleLogout = () => {
  showDropdown.value = false
  sidebarVisible.value = false
  userStore.logout()
  if (route.path === '/profile') router.push('/recommend')
}

const showUserDropdown = () => {
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
  showDropdown.value = true
}

const hideUserDropdown = () => {
  hideTimeout = setTimeout(() => { showDropdown.value = false }, 500)
}
</script>

<style scoped>
/* ===================== 全局布局 ===================== */
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: v-bind('shouldHideHeader ? "0px" : "60px"');
  padding-bottom: 0;
  box-sizing: border-box;
  transition: padding-top 0.3s ease;
  overflow: hidden !important;
  background: #050510;
}

/* ===================== 工具类 ===================== */
.desktop-only { display: flex; }
.mobile-tabs { display: none; }

/* ===================== 顶部导航栏 ===================== */
.top-header {
  position: fixed;
  top: 0;
  left: v-bind('shouldHideSidebar ? "0px" : "200px"');
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
  transition: left 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

/* 汉堡菜单按钮 */
.hamburger-btn {
  display: none;  /* 桌面端隐藏 */
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.hamburger-btn:hover {
  background: rgba(255,255,255,0.14);
}

.hamburger-line,
.hamburger-line::before,
.hamburger-line::after {
  display: block;
  width: 18px;
  height: 2px;
  background: rgba(255,255,255,0.8);
  border-radius: 1px;
  transition: all 0.3s ease;
}

.hamburger-line {
  position: relative;
}

.hamburger-line::before,
.hamburger-line::after {
  content: '';
  position: absolute;
  left: 0;
}

.hamburger-line::before { top: -6px; }
.hamburger-line::after { top: 6px; }

.hamburger-line.open { background: transparent; }
.hamburger-line.open::before { top: 0; transform: rotate(45deg); }
.hamburger-line.open::after { top: 0; transform: rotate(-45deg); }

/* 返回按钮 */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-btn:hover:not(.disabled) {
  background: rgba(255,255,255,0.2);
  transform: translateX(-2px);
}

.back-btn.disabled {
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.25);
  cursor: not-allowed;
}

.back-btn:disabled { pointer-events: none; }

/* 搜索框 */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 350px;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 40px 0 14px;
  border: none;
  border-radius: 18px;
  background: rgba(255,255,255,0.12);
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input::placeholder { color: rgba(255,255,255,0.5); }

.search-input:focus {
  background: rgba(255,255,255,0.2);
  box-shadow: 0 0 0 2px rgba(0,255,255,0.25);
}

.search-btn {
  position: absolute;
  right: 6px;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.search-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

/* 右侧用户区 */
.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.user-info-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255,255,255,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-info:hover { background: rgba(255,255,255,0.15); }

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.25);
  flex-shrink: 0;
}

.username-text {
  color: white;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.user-menu-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.user-menu-btn:hover { color: white; transform: rotate(180deg); }

/* 下拉菜单 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 180px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,255,0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0,255,255,0.2);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-enter-active { animation: dropdownIn 0.2s ease-out; }
.dropdown-leave-active { animation: dropdownIn 0.15s ease-in reverse; }

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover { background: rgba(0,255,255,0.12); color: #00ffff; transform: translateX(3px); }

.dropdown-item.logout { color: #ff6b6b; }
.dropdown-item.logout:hover { background: rgba(255,107,107,0.12); color: #ff4757; }

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,255,255,0.25), transparent);
  margin: 4px 0;
}

/* ===================== 侧边栏 ===================== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background: linear-gradient(160deg, #0a0a1a 0%, #10102e 50%, #0d1a30 100%);
  display: flex;
  flex-direction: column;
  z-index: 1005;
  box-shadow: 4px 0 20px rgba(0,0,0,0.4);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.sidebar-header {
  display: none; /* 桌面端隐藏 */
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.sidebar-logo {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ffff, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-close-btn {
  display: none;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-close-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-group { padding: 4px 12px; }

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
  margin: 8px 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  margin-bottom: 2px;
}

.nav-link:hover {
  background: rgba(0,255,255,0.08);
  color: #00ffff;
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0,255,255,0.1);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(217,70,239,0.15) 100%);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,255,255,0.15);
  border: 1px solid rgba(0,255,255,0.2);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0,255,255,0.6);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.8;
}

.nav-link.router-link-active .nav-icon { opacity: 1; }

.nav-text { white-space: nowrap; }

.nav-logout { color: rgba(255,255,255,0.4) !important; cursor: pointer; }
.nav-logout:hover { color: #f87171 !important; background: rgba(239,68,68,0.08) !important; }

/* 侧边栏底部 */
.sidebar-footer {
  display: none; /* 桌面端隐藏 */
  padding: 14px 18px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-user:hover { background: rgba(255,255,255,0.05); }

.sidebar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,255,255,0.3);
}

.sidebar-username {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
}

/* ===================== 侧边栏遮罩 ===================== */
.sidebar-overlay {
  display: none; /* 桌面端隐藏 */
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

/* ===================== 主内容区 ===================== */
.main-content {
  flex: 1;
  margin-left: v-bind('shouldHideSidebar ? "0px" : "200px"');
  background: #050510;
  overflow: hidden;
  height: v-bind('shouldHideHeader ? "100vh" : "calc(100vh - 60px)"');
  box-sizing: border-box;
  transition: margin-left 0.3s ease, height 0.3s ease;
}

/* ===================== 手机端底部导航 ===================== */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 56px;
  background: rgba(14, 14, 32, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.06);
  z-index: 1000;
  justify-content: space-around;
  align-items: center;
}

.mbn-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 4px 0; min-width: 60px;
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  font-size: 10px; font-weight: 500;
  transition: all 0.2s ease;
}

.mbn-item svg { transition: all 0.2s ease; }

.mbn-item.active {
  color: #00ffff;
}

.mbn-item.active svg {
  filter: drop-shadow(0 0 6px rgba(0,255,255,0.4));
}

/* ===================== 播放器 ===================== */
.audio-player-container {
  /* AudioPlayer 组件自身管理定位，此处仅保留容器占位 */
}

.player-slide-enter-active,
.player-slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.player-slide-enter-from,
.player-slide-leave-to { transform: translateY(100%); }
.player-slide-enter-to,
.player-slide-leave-from { transform: translateY(0); }

/* ===================== 平板端 (768px - 1024px) ===================== */
@media (max-width: 1024px) {
  .top-header { left: v-bind('shouldHideSidebar ? "0px" : "180px"'); padding: 0 14px; }
  .sidebar { width: 180px; }
  .main-content { margin-left: v-bind('shouldHideSidebar ? "0px" : "180px"'); }
  .search-container { max-width: 220px; }
  .username-text { display: none; }
}

/* ===================== 手机端 (≤768px) ===================== */
@media (max-width: 768px) {
  .app-container {
    padding-top: v-bind('shouldHideHeader ? "0px" : "56px"');
    padding-bottom: 56px; /* 给底部导航留空间 */
  }

  /* 底部导航可见 */
  .mobile-bottom-nav { display: flex; }

  /* 隐藏桌面端元素 */
  .desktop-only { display: none !important; }

  /* 手机端顶部Tab切换 */
  .mobile-tabs {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: space-evenly;
    padding: 0 2px;
  }

  .mtab {
    flex: 1;
    text-align: center;
    padding: 6px 4px;
    border-radius: 14px;
    font-size: 12px; font-weight: 500;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .mtab.active {
    background: rgba(0,255,255,0.12);
    color: #00ffff;
    font-weight: 600;
  }

  /* 手机端搜索按钮 */
  .mobile-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    border: none; border-radius: 10px;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .mobile-search-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

  /* 顶部导航 - 全宽 */
  .top-header {
    left: 0 !important;
    height: 56px;
    padding: 0 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .header-left {
    gap: 6px;
    max-width: none;
    flex: 1;
  }

  /* 显示汉堡菜单 */
  .hamburger-btn { display: flex; flex-shrink: 0; }

  /* 隐藏返回按钮、搜索框、用户区（手机端用Tab替代） */
  .back-btn, .search-container, .user-info-container { display: none; }

  /* 隐藏桌面端用户名 */
  .username-text { display: none; }

  .user-info {
    padding: 4px 6px;
    gap: 0;
    background: none;
  }
  .user-info:hover { background: rgba(255,255,255,0.1); }
  .user-avatar { width: 30px; height: 30px; }
  .user-menu-btn { display: none; }

  /* 侧边栏 - 抽屉模式 */
  .sidebar {
    width: 66.66vw;
    max-width: 320px;
    transform: translateX(-100%);
    z-index: 1005;
    box-shadow: 8px 0 32px rgba(0,0,0,0.5);
  }

  .sidebar.visible { transform: translateX(0); }

  .sidebar-header,
  .sidebar-footer { display: flex; }

  .sidebar-close-btn { display: flex; }

  .sidebar-nav { padding: 8px 0; }

  .nav-link {
    padding: 14px 18px;
    font-size: 15px;
    border-radius: 0;
    margin-bottom: 0;
  }

  .nav-link.router-link-active { border: none; border-right: 3px solid #00ffff; }

  /* 遮罩 */
  .sidebar-overlay { display: block; }

  /* 主内容区 - 全宽 */
  .main-content {
    margin-left: 0 !important;
    height: v-bind('shouldHideHeader ? "calc(100vh - 56px)" : "calc(100vh - 112px)"');
  }

  /* 用户下拉菜单适配 */
  .user-dropdown {
    position: fixed;
    top: 56px;
    right: 8px;
    left: auto;
    min-width: 160px;
  }
}

/* ===================== 小屏手机 (≤480px) ===================== */
@media (max-width: 480px) {
  .top-header {
    height: 50px;
    padding: 0 8px;
  }

  .app-container {
    padding-top: v-bind('shouldHideHeader ? "0px" : "50px"');
    padding-bottom: 0;
  }

  .hamburger-btn { width: 32px; height: 32px; }
  .back-btn { width: 28px; height: 28px; }
  .search-input { height: 30px; font-size: 12px; }

  .sidebar { width: 75vw; max-width: 300px; }

  .mtab { font-size: 11px; }
  .mobile-search-btn { width: 28px; height: 28px; border-radius: 8px; }

  .main-content {
    height: v-bind('shouldHideHeader ? "calc(100vh - 56px)" : "calc(100vh - 106px)"');
  }
}
</style>
