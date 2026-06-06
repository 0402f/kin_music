<template>
  <div v-if="loading" class="pf-loading"><div class="pf-loader"></div><p>加载中...</p></div>

  <!-- ==================== 未登录状态 ==================== -->
  <div v-else-if="!isLoggedIn" class="pf-guest-page" ref="guestRef">
    <div class="pf-bg">
      <div class="pf-orb pf-orb-1" ref="orb1Ref"></div>
      <div class="pf-orb pf-orb-2" ref="orb2Ref"></div>
      <div class="pf-orb pf-orb-3" ref="orb3Ref"></div>
      <div class="pf-ring pf-ring-1" ref="ringRef"></div>
    </div>

    <div class="pf-guest-card" ref="guestCardRef">
      <div class="pf-guest-icon-wrap" ref="guestIconRef">
        <div class="pf-guest-icon-ring"></div>
        <svg class="pf-guest-icon" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="18" r="12" stroke="currentColor" stroke-width="2.5"/>
          <path d="M8 58c0-13.3 10.7-24 24-24s24 10.7 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="50" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
          <line x1="46" y1="14" x2="54" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          <line x1="50" y1="10" x2="50" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        </svg>
        <div class="pf-guest-glow"></div>
      </div>

      <h2 class="pf-guest-title">登录以解锁个人中心</h2>
      <p class="pf-guest-desc">同步你的歌单、收藏和喜欢的音乐</p>

      <div class="pf-guest-actions" ref="guestActionsRef">
        <button class="pf-guest-btn pf-guest-btn-login" @click="handleGuestLogin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          登 录
        </button>
        <button class="pf-guest-btn pf-guest-btn-register" @click="handleGuestRegister">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          创建账号
        </button>
      </div>
    </div>
  </div>

  <!-- ==================== 已登录状态 ==================== -->
  <div v-else class="pf-page" ref="pageRef">
    <!-- GSAP动画背景 -->
    <div class="pf-bg">
      <div class="pf-orb pf-orb-1" ref="orb1Ref"></div>
      <div class="pf-orb pf-orb-2" ref="orb2Ref"></div>
      <div class="pf-orb pf-orb-3" ref="orb3Ref"></div>
      <div class="pf-ring pf-ring-1" ref="ringRef"></div>
      <div class="pf-particles" ref="particlesRef">
        <span v-for="n in 20" :key="n" class="pfp-dot" :ref="(el) => { if (el) dots[n-1] = el }"></span>
      </div>
    </div>

    <!-- 头部卡片 -->
    <div class="pf-card pf-card-top" ref="topCardRef">
      <div class="pfc-avatar-wrap" ref="avatarWrapRef">
        <div class="pfc-avatar-ring"></div>
        <img :src="userInfo.avatarUrl" class="pfc-avatar" @click="triggerAvatarUpload" />
        <input ref="avatarInput" type="file" accept="image/*" @change="handleAvatarChange" style="display:none" />
      </div>
      <div class="pfc-info">
        <h1 class="pfc-name">{{ userInfo.username }}</h1>

        <!-- 专属ID徽章 -->
        <div class="pfc-id-badge" ref="idBadgeRef" v-if="displayUserNumber">
          <div class="pfc-id-shine"></div>
          <svg class="pfc-id-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor" opacity="0.9"/>
            <path d="M12 2l-1 8-5 2 4 3-1 6 3-4.5V2z" fill="#fff" opacity="0.25"/>
          </svg>
          <span class="pfc-id-prefix">KIN</span>
          <span class="pfc-id-divider">·</span>
          <span class="pfc-id-num">{{ displayUserNumber }}</span>
          <button class="pfc-id-copy" @click.stop="copyUserNumber" title="复制专属ID">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>

        <div class="pfc-tags">
          <span class="pfc-tag" v-if="userInfo.email">{{ userInfo.email }}</span>
          <span class="pfc-tag" v-if="userInfo.location || true">{{ userInfo.location || '湖北省 武汉市' }}</span>
          <span class="pfc-tag pfc-tag-time" v-if="userInfo.lastLoginTime">最近登录 {{ formatLoginTime(userInfo.lastLoginTime) }}</span>
        </div>
        <div class="pfc-follow" ref="followRef">
          <div class="pfc-follow-item" @click="goToFollowList('following')"><b>{{ followingCount }}</b><span>关注</span></div>
          <div class="pfc-follow-item" @click="goToFollowList('followers')"><b>{{ followersCount }}</b><span>粉丝</span></div>
        </div>
        <div class="pfc-bio" v-if="userInfo.bio">{{ userInfo.bio }}</div>
        <div class="pfc-bio pfc-bio-empty" v-else>这个人很懒，什么都没有留下...</div>
      </div>
    </div>

    <!-- Tab 区域 -->
    <div class="pf-card pf-card-tabs" ref="tabsCardRef">
      <div class="pft-tabs">
        <button :class="['pft-tab', { active: activeTab === 'playlist' }]" @click="activeTab = 'playlist'">歌单</button>
        <button :class="['pft-tab', { active: activeTab === 'collect' }]" @click="activeTab = 'collect'">收藏</button>
        <button :class="['pft-tab', { active: activeTab === 'like' }]" @click="activeTab = 'like'">喜欢</button>
        <button :class="['pft-tab', { active: activeTab === 'follow' }]" @click="activeTab = 'follow'">关注</button>
        <button :class="['pft-tab', { active: activeTab === 'fans' }]" @click="activeTab = 'fans'">粉丝</button>
      </div>

      <!-- 歌单 -->
      <div v-if="activeTab === 'playlist'" class="pft-content">
        <div v-if="userPlaylists.length === 0 && !loading" class="pft-empty">还没有创建歌单</div>
        <div v-else class="pft-list">
          <!-- 创建歌单入口 -->
          <div class="pft-list-row pft-list-new" @click="showCreatePlaylistModal = true" ref="newPlRowRef">
            <span class="plr-num plr-num-add">+</span>
            <div class="plr-cover plr-cover-add">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div class="plr-info"><div class="plr-title">创建新歌单</div></div>
            <span class="plr-action-hint">新建</span>
          </div>
          <!-- 歌单列表行 -->
          <div
            v-for="(pl, i) in userPlaylists"
            :key="pl.id"
            class="pft-list-row"
            :ref="(el) => { if (el) plRowRefs[i] = el }"
            @click="handlePlaylistClick(pl)"
            @contextmenu.prevent="showContextMenu($event, pl)"
          >
            <span class="plr-num">{{ String(i+1).padStart(2,'0') }}</span>
            <div class="plr-cover">
              <img v-if="pl.coverUrl" :src="pl.coverUrl" />
              <div v-else class="plr-cover-empty">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M9 18V5L21 12L9 18Z"/></svg>
              </div>
            </div>
            <div class="plr-info">
              <div class="plr-title">{{ pl.name }}</div>
              <div class="plr-artist">{{ pl.isPublic ? '公开歌单' : '私密歌单' }}{{ pl.description ? ' · ' + pl.description : '' }}</div>
            </div>
            <span class="plr-count-badge">{{ pl.songCount }}首</span>
          </div>
        </div>
      </div>

      <!-- 收藏歌单 -->
      <div v-else-if="activeTab === 'collect'" class="pft-content">
        <div v-if="collectLoading" class="pft-empty">加载中...</div>
        <div v-else-if="collectList.length === 0" class="pft-empty">还没有收藏歌单</div>
        <div v-else class="pft-list">
          <div
            v-for="(pl, i) in collectList"
            :key="pl.id"
            class="pft-list-row"
            :ref="(el) => { if (el) collRowRefs[i] = el }"
            @click="handlePlaylistClick(pl)"
          >
            <span class="plr-num">{{ String(i+1).padStart(2,'0') }}</span>
            <div class="plr-cover">
              <img v-if="pl.coverUrl" :src="pl.coverUrl" />
              <div v-else class="plr-cover-empty">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M9 18V5L21 12L9 18Z"/></svg>
              </div>
            </div>
            <div class="plr-info">
              <div class="plr-title">{{ pl.name }}</div>
              <div class="plr-artist">{{ pl.creatorName || '收藏的歌单' }}</div>
            </div>
            <span class="plr-count-badge">{{ pl.songCount || 0 }}首</span>
          </div>
        </div>
      </div>

      <!-- 喜欢 -->
      <div v-else-if="activeTab === 'like'" class="pft-content">
        <div v-if="likeLoading" class="pft-empty">加载中...</div>
        <div v-else-if="likeList.length === 0" class="pft-empty">还没有喜欢的音乐</div>
        <div v-else class="pft-list">
          <div v-for="(m, i) in likeList" :key="m.id" class="pft-list-row" @click="playLikeMusic(m)">
            <span class="plr-num">{{ String(i+1).padStart(2,'0') }}</span>
            <div class="plr-cover">
              <img v-if="m.coverFileUrl" :src="cleanLikeUrl(m.coverFileUrl)" />
              <div v-else class="plr-cover-empty"><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg></div>
            </div>
            <div class="plr-info"><div class="plr-title">{{ m.title }}</div><div class="plr-artist">{{ m.artist }}</div></div>
            <div class="plr-dur">{{ fmtLikeDur(m.duration) }}</div>
          </div>
        </div>
      </div>

      <!-- 关注/粉丝 -->
      <div v-else-if="activeTab === 'follow' || activeTab === 'fans'" class="pft-content">
        <div class="pft-empty">{{ activeTab === 'follow' ? '关注列表' : '粉丝列表' }}</div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.show" class="pf-menu" :style="{ left: contextMenu.x+'px', top: contextMenu.y+'px' }" @click.stop>
      <div class="pfm-item" @click="viewPlaylist"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>查看歌单</div>
      <div class="pfm-item" @click="playPlaylist"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>播放</div>
      <div class="pfm-item" @click="editPlaylist"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>编辑</div>
      <div class="pfm-div"></div>
      <div class="pfm-item pfm-delete" @click="showDeleteConfirm"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>删除</div>
    </div>

    <!-- 创建歌单弹窗 -->
    <div v-if="showCreatePlaylistModal" class="pf-modal-overlay" @click="closeCreatePlaylistModal">
      <div class="pf-modal" @click.stop>
        <h3>创建歌单</h3>
        <input v-model="newPlaylist.name" type="text" placeholder="歌单名称" maxlength="40" class="pf-input" />
        <label class="pf-check"><input v-model="newPlaylist.isPrivate" type="checkbox" />设为隐私歌单</label>
        <div class="pf-modal-actions">
          <button class="pfm-btn" @click="closeCreatePlaylistModal">取消</button>
          <button class="pfm-btn pfm-btn-ok" @click="handleCreatePlaylist" :disabled="!newPlaylist.name.trim()">创建</button>
        </div>
      </div>
    </div>

    <ConfirmDialog :visible="showDeleteDialog" title="删除歌单" :message="`确定删除「${contextMenu.playlist?.name}」？`" type="warning" confirm-text="删除" cancel-text="取消" @confirm="confirmDelete" @cancel="cancelDelete" @close="showDeleteDialog = false" />
    <Toast :visible="showToast" :message="toastMessage" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { getUserById, updateUserAvatar, getUserFollowers, getUserFollowing } from '@/api/user'
import { useUserStore } from '@/stores/user'
import Toast from '@/components/Toast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { createPlaylist, deletePlaylist as deletePlaylistApi } from '@/api/playlist'
import { useRouter } from 'vue-router'
import { useAudioStore } from '@/stores/audio'

const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const audioStore = useAudioStore()
const avatarInput = ref(null)
const router = useRouter()
const pageRef = ref(null)
const topCardRef = ref(null)
const avatarWrapRef = ref(null)
const followRef = ref(null)
const tabsCardRef = ref(null)
const orb1Ref = ref(null), orb2Ref = ref(null), orb3Ref = ref(null)
const ringRef = ref(null), particlesRef = ref(null)
const dots = ref([])
// 列表行 refs
const newPlRowRef = ref(null)
const plRowRefs = ref([])
const collRowRefs = ref([])
const idBadgeRef = ref(null)
// 专属ID：store 数据立即可用，API 数据做补充
const displayUserNumber = computed(() => {
  return userInfo.value.userNumber || userStore.userInfo?.userNumber || ''
})
// 未登录页面 refs
const guestRef = ref(null)
const guestCardRef = ref(null)
const guestIconRef = ref(null)
const guestActionsRef = ref(null)

// GSAP 背景动画
const animateBg = () => {
  // 光球飘动
  [orb1Ref, orb2Ref, orb3Ref].forEach((orb, i) => {
    if (!orb.value) return
    gsap.to(orb.value, {
      x: gsap.utils.random(-60, 60), y: gsap.utils.random(-40, 40),
      scale: gsap.utils.random(0.8, 1.3), duration: gsap.utils.random(6, 10),
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 2
    })
  })
  // 光环旋转
  if (ringRef.value) {
    gsap.to(ringRef.value, { rotation: 360, duration: 30, repeat: -1, ease: 'none' })
    gsap.to(ringRef.value, { scale: 1.08, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }
  // 粒子飘浮
  dots.value.filter(Boolean).forEach((d, i) => {
    gsap.to(d, {
      y: gsap.utils.random(-30, 30), x: gsap.utils.random(-20, 20),
      opacity: gsap.utils.random(0.1, 0.5), duration: gsap.utils.random(2, 5),
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.15
    })
  })
}

// GSAP 入场动画
const animateEntrance = () => {
  const tl = gsap.timeline()
  tl.from(topCardRef.value, { y: 40, opacity: 0, duration: 0.6, ease: 'power3.out' })
  tl.from(avatarWrapRef.value, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.4')
  tl.from('.pfc-name', { y: 10, opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.2')
  // 专属ID徽章：使用CSS动画（避免GSAP from()被中断后残留opacity:0的问题）
  if (idBadgeRef.value) {
    tl.call(() => {
      idBadgeRef.value.classList.add('pfc-id-badge--enter')
    }, null, '-=0.15')
  }
  tl.from('.pfc-tag', { y: 10, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, '-=0.2')
  tl.from(followRef.value, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
  tl.from(tabsCardRef.value, { y: 30, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.1')
}

// ID徽章持续光扫动画
let idShineTl = null
const animateIdBadgeShine = () => {
  if (!idBadgeRef.value) return
  if (idShineTl) idShineTl.kill()
  const shine = idBadgeRef.value.querySelector('.pfc-id-shine')
  if (!shine) return
  idShineTl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 })
  idShineTl.set(shine, { x: -80, opacity: 0 })
  idShineTl.to(shine, { x: 200, opacity: 0.6, duration: 0.7, ease: 'power2.inOut' })
  idShineTl.to(shine, { opacity: 0, duration: 0.2 })
}

// 复制专属ID
const copyUserNumber = async () => {
  try {
    await navigator.clipboard.writeText(displayUserNumber.value)
    showToastMsg('专属ID已复制', 'success')
    // 复制成功反馈动画
    if (idBadgeRef.value) {
      gsap.fromTo(idBadgeRef.value, { scale: 1 }, { scale: 1.05, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' })
    }
  } catch {
    showToastMsg('复制失败')
  }
}

// 未登录页面 - 处理函数
const handleGuestLogin = () => { userStore.openAuthModal() }
const handleGuestRegister = () => { userStore.openAuthModal() }

// 未登录页面 - GSAP动画
const animateGuestEntrance = () => {
  if (!guestCardRef.value) return
  const tl = gsap.timeline()
  tl.from(guestCardRef.value, { y: 50, opacity: 0, duration: 0.6, ease: 'power3.out' })
  if (guestIconRef.value) {
    tl.from(guestIconRef.value, { scale: 0, rotation: -30, opacity: 0, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.3')
  }
  tl.from('.pf-guest-title', { y: 15, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
  tl.from('.pf-guest-desc', { y: 10, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
  if (guestActionsRef.value) {
    const btns = guestActionsRef.value.querySelectorAll('.pf-guest-btn')
    tl.from(btns, { y: 15, opacity: 0, scale: 0.9, duration: 0.4, stagger: 0.1, ease: 'back.out(1.4)' }, '-=0.1')
  }
}

// GSAP 列表行动画
const addListRowHoverEffects = () => {
  const applyToRows = (refsArr) => {
    refsArr.value.filter(Boolean).forEach(el => {
      if (el.dataset.hoverOn) return
      el.dataset.hoverOn = '1'
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { scale: 1.015, backgroundColor: 'rgba(255,255,255,0.03)', duration: 0.2, ease: 'power2.out' })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { scale: 1, backgroundColor: 'rgba(255,255,255,0)', duration: 0.25, ease: 'power2.out' })
      })
    })
  }
  applyToRows(plRowRefs)
  applyToRows(collRowRefs)
}

// 跳转关注列表
const goToFollowList = (type) => router.push({ name: 'followList', query: { type } })

// Toast
const showToast = ref(false), toastMessage = ref(''), toastType = ref('error')
const showToastMsg = (msg, type = 'error') => { toastMessage.value = msg; toastType.value = type; showToast.value = true }

// Tab
const activeTab = ref('playlist')
const userPlaylists = ref([])
const showCreatePlaylistModal = ref(false)
const newPlaylist = ref({ name: '', isPrivate: false })
const contextMenu = ref({ show: false, x: 0, y: 0, playlist: null })
const showDeleteDialog = ref(false)
const followersCount = ref(0), followingCount = ref(0)
const userInfo = ref({ id: '', userNumber: '', username: '', email: '', avatarUrl: '', backgroundUrl:'', bio: '', lastLoginTime:'', previousLoginTime:'', followingCount:0, followersCount:0, location:'', socialAccount:'' })
const loading = ref(true), uploading = ref(false)

const formatLoginTime = (t) => t ? new Date(t).toLocaleString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''
const fetchFollowCounts = async () => {
  try { const fd = await getUserFollowers(); followersCount.value = Array.isArray(fd) ? fd.length : (fd?.data?.length || 0) } catch {}
  try { const fg = await getUserFollowing(); followingCount.value = Array.isArray(fg) ? fg.length : (fg?.data?.length || 0) } catch {}
}

const triggerAvatarUpload = () => avatarInput.value.click()
const handleAvatarChange = async (e) => {
  const file = e.target.files[0]; if (!file) return
  if (!file.type.startsWith('image/')) { showToastMsg('请选择图片文件'); return }
  if (file.size > 10*1024*1024) { showToastMsg('图片不能超过10MB'); return }
  try { uploading.value = true; const res = await updateUserAvatar(userInfo.value.id, file); if (res.code === 1) { await fetchUserInfo(); if (userStore.userInfo) { userStore.userInfo.avatarUrl = userInfo.value.avatarUrl; localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo)) }; showToastMsg('头像更新成功','success') } else showToastMsg('更新失败：'+res.msg) } catch { showToastMsg('上传失败') } finally { uploading.value = false; e.target.value = '' }
}

const fetchUserInfo = async () => {
  // 先用 store 中已有的数据快速填充（登录时已存入）
  if (userStore.userInfo) {
    userInfo.value = { ...userInfo.value, ...userStore.userInfo }
  }
  // 再从 API 获取完整数据
  try {
    const userId = userStore.userInfo?.id || userInfo.value.id || 1
    const res = await getUserById(userId)
    if (res.code === 1 && res.data) {
      userInfo.value = { ...userInfo.value, ...res.data }
    }
  } catch (e) {
    console.warn('获取用户详情失败，使用本地缓存数据:', e)
  }
}
const fetchUserPlaylists = async () => {
  try { const { getMyPlaylists } = await import('@/api/playlist'); const res = await getMyPlaylists(); if (res?.data) userPlaylists.value = res.data.map(p => ({ id: p.id, name: p.name, coverUrl: p.coverFileUrl, playCount: p.playCount, songCount: p.songCount, isPublic: p.isPublic, description: p.description })) } catch {}
}

// 收藏的歌单
const collectList = ref([])
const collectLoading = ref(false)
const fetchCollectList = async () => {
  if (collectList.value.length) return
  collectLoading.value = true
  try { const { getFavoritePlaylistList } = await import('@/api/playlist'); const res = await getFavoritePlaylistList(); if (res?.data) collectList.value = res.data.map(p => ({ id: p.id, name: p.name, coverUrl: p.coverFileUrl, songCount: p.songCount })) } catch {} finally { collectLoading.value = false }
}

// 喜欢的音乐
const likeList = ref([])
const likeLoading = ref(false)
const cleanLikeUrl = (url) => url ? url.replace(/[\r\n\t]/g, '').trim() : ''
const fmtLikeDur = (d) => { if (!d) return ''; const m = Math.floor(d/60); return `${m}:${String(d%60).padStart(2,'0')}` }
const fetchLikeMusic = async () => {
  if (likeList.value.length) return
  likeLoading.value = true
  try {
    const { getMusicByIds } = await import('../api/test')
    const { getUserFavorites } = await import('@/api/user')
    const favRes = await getUserFavorites()
    const ids = favRes.data || []
    if (ids.length) {
      const musicRes = await getMusicByIds(ids)
      const data = Array.isArray(musicRes.data) ? musicRes.data : (musicRes.data ? [musicRes.data] : [])
      likeList.value = data.map(m => ({ id: m.id, title: m.title || '未知', artist: m.artist || '未知', coverFileUrl: m.coverFileUrl, fileUrl: m.fileUrl, duration: m.duration }))
    }
  } catch {} finally { likeLoading.value = false }
}
const playLikeMusic = (m) => {
  audioStore.playSong({ id: m.id, title: m.title, artist: m.artist, url: m.fileUrl, cover: m.coverFileUrl, duration: m.duration }, likeList.value)
}

const closeCreatePlaylistModal = () => { showCreatePlaylistModal.value = false; newPlaylist.value = { name: '', isPrivate: false } }
const handleCreatePlaylist = async () => {
  if (!newPlaylist.value.name.trim()) { showToastMsg('请输入歌单名称'); return }
  try { const data = { name: newPlaylist.value.name.trim(), isPublic: newPlaylist.value.isPrivate ? 0 : 1 }; await createPlaylist(data); showToastMsg('歌单创建成功','success'); closeCreatePlaylistModal(); await fetchUserPlaylists() } catch (e) { showToastMsg(e.message||'创建失败') }
}
const handlePlaylistClick = (pl) => router.push(`/playlist/${pl.id}`)

const showContextMenu = (e, pl) => { e.preventDefault(); contextMenu.value = { show: true, x: e.clientX, y: e.clientY, playlist: pl } }
const hideMenu = () => { contextMenu.value.show = false }
const viewPlaylist = () => { if (contextMenu.value.playlist) router.push(`/playlist/${contextMenu.value.playlist.id}`); hideMenu() }
const playPlaylist = () => {
  if (!contextMenu.value.playlist) return; hideMenu()
  showToastMsg('播放功能开发中','info')
}
const editPlaylist = () => { if (contextMenu.value.playlist) router.push(`/playlist/${contextMenu.value.playlist.id}/edit`); hideMenu() }
const showDeleteConfirm = () => { if (contextMenu.value.playlist) showDeleteDialog.value = true; hideMenu() }
const confirmDelete = async () => {
  if (!contextMenu.value.playlist) return
  try { await deletePlaylistApi(contextMenu.value.playlist.id); showToastMsg('删除成功','success'); fetchUserPlaylists() } catch { showToastMsg('删除失败') }
  showDeleteDialog.value = false
}
const cancelDelete = () => { showDeleteDialog.value = false }
const handleClickOutside = (e) => { if (contextMenu.value.show && !e.target.closest('.pf-menu')) contextMenu.value.show = false }

// 切换Tab时加载数据
watch(activeTab, (tab) => {
  if (tab === 'collect') fetchCollectList()
  else if (tab === 'like') fetchLikeMusic()
  nextTick(() => addListRowHoverEffects())
})

// 监听歌单数据加载完成后附加悬浮效果
watch(userPlaylists, () => nextTick(() => addListRowHoverEffects()))
watch(collectList, () => nextTick(() => addListRowHoverEffects()))

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  // 未登录：显示引导页面
  if (!isLoggedIn.value) {
    loading.value = false
    nextTick(() => { animateBg(); animateGuestEntrance() })
    return
  }

  // 已登录：加载个人数据
  loading.value = true
  try { await fetchUserInfo(); loading.value = false; await fetchFollowCounts(); fetchUserPlaylists().catch(()=>{}); fetchCollectList(); fetchLikeMusic() } catch { showToastMsg('加载失败'); loading.value = false }
  nextTick(() => { animateBg(); animateEntrance(); addListRowHoverEffects(); animateIdBadgeShine() })
})

onUnmounted(() => { document.removeEventListener('click', handleClickOutside); if (idShineTl) idShineTl.kill() })
</script>

<style scoped>
/* ===== 加载 ===== */
.pf-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background:linear-gradient(160deg,#080c18,#0f1428,#0a0e1f); color:#818cf8; }
.pf-loader { width:36px; height:36px; border:2px solid rgba(255,255,255,0.1); border-top-color:#818cf8; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:12px; }
@keyframes spin { to{transform:rotate(360deg)} }

/* ===== 未登录引导页 ===== */
.pf-guest-page {
  width:100%; height:100%;
  background:linear-gradient(160deg,#080c18,#0f1428,#0a0e1f);
  color:#f1f5f9;
  display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden;
  box-sizing:border-box;
}

.pf-guest-card {
  position:relative; z-index:1;
  display:flex; flex-direction:column; align-items:center;
  padding:48px 40px;
  background:rgba(255,255,255,0.025);
  border:1px solid rgba(255,255,255,0.05);
  border-radius:24px;
  backdrop-filter:blur(16px);
  text-align:center;
  max-width:380px; width:90%;
}

/* 头像图标区 */
.pf-guest-icon-wrap {
  position:relative;
  width:88px; height:88px;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:24px;
}

.pf-guest-icon-ring {
  position:absolute; inset:-5px;
  border:2px solid transparent;
  border-top-color:rgba(99,102,241,0.4);
  border-right-color:rgba(139,92,246,0.25);
  border-radius:50%;
  animation:guestRingSpin 4s linear infinite;
}
@keyframes guestRingSpin { to{transform:rotate(360deg)} }

.pf-guest-icon {
  width:52px; height:52px;
  color:rgba(255,255,255,0.25);
  position:relative; z-index:1;
}

.pf-guest-glow {
  position:absolute; inset:-15px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
  animation:guestGlowPulse 3s ease-in-out infinite;
}
@keyframes guestGlowPulse {
  0%,100%{opacity:0.3;transform:scale(1)}
  50%{opacity:0.7;transform:scale(1.15)}
}

.pf-guest-title {
  margin:0 0 10px;
  font-size:20px; font-weight:700;
  background:linear-gradient(135deg,#a5b4fc,#e0e7ff);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text;
}

.pf-guest-desc {
  margin:0 0 32px;
  font-size:14px; color:rgba(255,255,255,0.3);
  line-height:1.6;
}

/* 操作按钮 */
.pf-guest-actions {
  display:flex; gap:12px; width:100%;
}

.pf-guest-btn {
  flex:1;
  display:flex; align-items:center; justify-content:center; gap:8px;
  padding:14px 20px;
  border:none; border-radius:14px;
  font-size:15px; font-weight:600;
  cursor:pointer;
  transition:all 0.25s ease;
  letter-spacing:2px;
}

.pf-guest-btn-login {
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff;
  box-shadow:0 4px 20px rgba(99,102,241,0.3);
}
.pf-guest-btn-login:hover {
  transform:translateY(-2px);
  box-shadow:0 8px 30px rgba(99,102,241,0.45);
  filter:brightness(1.1);
}

.pf-guest-btn-register {
  background:rgba(255,255,255,0.04);
  color:rgba(255,255,255,0.65);
  border:1px solid rgba(255,255,255,0.08);
}
.pf-guest-btn-register:hover {
  background:rgba(255,255,255,0.08);
  border-color:rgba(255,255,255,0.15);
  color:#fff;
  transform:translateY(-2px);
}

/* ===== 页面 ===== */
.pf-page { width:100%; height:100%; background:linear-gradient(160deg,#080c18,#0f1428,#0a0e1f); color:#f1f5f9; overflow-y:auto; padding:20px 16px 130px; position:relative; box-sizing:border-box; }

/* ===== 动画背景 ===== */
.pf-bg { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
.pf-orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.12; }
.pf-orb-1 { width:350px; height:350px; top:5%; right:10%; background:radial-gradient(circle, #6366f1, transparent); }
.pf-orb-2 { width:250px; height:250px; bottom:15%; left:5%; background:radial-gradient(circle, #06b6d4, transparent); }
.pf-orb-3 { width:200px; height:200px; top:40%; left:40%; background:radial-gradient(circle, #8b5cf6, transparent); }
.pf-ring { position:absolute; width:600px; height:600px; top:-20%; left:-15%; border:1px solid rgba(99,102,241,0.06); border-radius:50%; }
.pf-particles { position:absolute; inset:0; }
.pfp-dot { position:absolute; width:3px; height:3px; border-radius:50%; background:#818cf8; opacity:0.2; }
.pfp-dot:nth-child(1){left:10%;top:20%}.pfp-dot:nth-child(2){left:25%;top:15%}
.pfp-dot:nth-child(3){left:40%;top:10%}.pfp-dot:nth-child(4){left:55%;top:25%}
.pfp-dot:nth-child(5){left:70%;top:5%}.pfp-dot:nth-child(6){left:85%;top:30%}
.pfp-dot:nth-child(7){left:15%;top:40%}.pfp-dot:nth-child(8){left:30%;top:35%}
.pfp-dot:nth-child(9){left:50%;top:50%}.pfp-dot:nth-child(10){left:65%;top:45%}
.pfp-dot:nth-child(11){left:80%;top:55%}.pfp-dot:nth-child(12){left:5%;top:60%}
.pfp-dot:nth-child(13){left:20%;top:55%}.pfp-dot:nth-child(14){left:35%;top:70%}
.pfp-dot:nth-child(15){left:55%;top:65%}.pfp-dot:nth-child(16){left:70%;top:80%}
.pfp-dot:nth-child(17){left:10%;top:85%}.pfp-dot:nth-child(18){left:45%;top:85%}
.pfp-dot:nth-child(19){left:60%;top:90%}.pfp-dot:nth-child(20){left:85%;top:75%}

/* ===== 卡片 ===== */
.pf-card { position:relative; z-index:1; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:20px; backdrop-filter:blur(12px); }
.pf-card-top { display:flex; gap:20px; padding:28px; margin-bottom:16px; }
.pf-card-tabs { padding:0 0 16px; overflow:hidden; }

/* 头像 */
.pfc-avatar-wrap { position:relative; flex-shrink:0; }
.pfc-avatar-ring { position:absolute; inset:-4px; border:2px solid transparent; border-top-color:rgba(99,102,241,0.5); border-right-color:rgba(139,92,246,0.3); border-radius:50%; animation:avSpin 4s linear infinite; }
@keyframes avSpin { to{transform:rotate(360deg)} }
.pfc-avatar { width:80px; height:80px; border-radius:50%; object-fit:cover; cursor:pointer; border:2px solid rgba(255,255,255,0.1); }
.pfc-avatar:hover { transform:scale(1.05); }

/* 信息 */
.pfc-info { flex:1; min-width:0; }
.pfc-name { font-size:22px; font-weight:700; margin:0 0 10px; }

/* ===================== 专属ID徽章 ===================== */
.pfc-id-badge {
  position: relative;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(99,102,241,0.12));
  border: 1px solid rgba(99,102,241,0.18);
  border-radius: 14px;
  overflow: hidden;
  cursor: default; user-select: none;
  transition: all 0.3s ease;
}
.pfc-id-badge:hover {
  border-color: rgba(99,102,241,0.35);
  box-shadow: 0 0 20px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.2);
  transform: translateY(-1px);
}

/* CSS入场动画（替代GSAP from，避免中断残留） */
.pfc-id-badge--enter {
  animation: idBadgeEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes idBadgeEnter {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}

/* 光泽扫描 */
.pfc-id-shine {
  position: absolute; top: 0; left: 0;
  width: 60px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  pointer-events: none; z-index: 1;
  transform: skewX(-20deg);
}

/* 星星图标 */
.pfc-id-icon {
  width: 18px; height: 18px;
  color: #a78bfa;
  flex-shrink: 0; z-index: 2;
  filter: drop-shadow(0 0 6px rgba(139,92,246,0.5));
  animation: idStarPulse 3s ease-in-out infinite;
}

@keyframes idStarPulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.15); opacity: 1; }
}

/* 前缀 */
.pfc-id-prefix {
  font-size: 10px; font-weight: 800; letter-spacing: 3px;
  color: rgba(167,139,250,0.7);
  z-index: 2;
}

/* 分隔符 */
.pfc-id-divider {
  font-size: 12px; color: rgba(255,255,255,0.15);
  z-index: 2;
}

/* 数字 */
.pfc-id-num {
  font-size: 17px; font-weight: 700; letter-spacing: 2px;
  font-family: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #a78bfa, #c4b5fd, #e0e7ff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  z-index: 2;
}

/* 复制按钮 */
.pfc-id-copy {
  width: 26px; height: 26px;
  border: none; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.25);
  cursor: pointer; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.pfc-id-copy:hover {
  background: rgba(99,102,241,0.15);
  color: #a78bfa;
}
.pfc-id-copy:active { transform: scale(0.9); }

.pfc-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
.pfc-tag { padding:3px 10px; border-radius:10px; background:rgba(255,255,255,0.04); font-size:11px; color:rgba(255,255,255,0.5); }
.pfc-tag-time { font-family: 'SF Mono', 'Cascadia Code', monospace; font-size: 10px; color: rgba(255,255,255,0.3); }
.pfc-follow { display:flex; gap:24px; margin-bottom:12px; }
.pfc-follow-item { cursor:pointer; transition:all 0.2s; }
.pfc-follow-item:hover { color:#818cf8; }
.pfc-follow-item b { font-size:18px; display:block; }
.pfc-follow-item span { font-size:11px; color:rgba(255,255,255,0.4); }
.pfc-bio { font-size:13px; color:rgba(255,255,255,0.4); line-height:1.5; }
.pfc-bio-empty { color:rgba(255,255,255,0.2); font-style:italic; }

/* Tab */
.pft-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,0.05); padding:0 20px; }
.pft-tab { flex:1; padding:13px 0; background:none; border:none; border-bottom:2px solid transparent; color:rgba(255,255,255,0.35); font-size:14px; font-weight:500; cursor:pointer; transition:all 0.2s; }
.pft-tab.active { color:#818cf8; border-bottom-color:#818cf8; }
.pft-content { padding:16px 20px; }

/* 统一列表样式（歌单 / 收藏 / 喜欢） */
.pft-list { display:flex; flex-direction:column; gap:2px; }
.pft-list-row {
  display:flex; align-items:center; gap:12px;
  padding:10px 10px; border-radius:12px;
  cursor:pointer; transition: background 0.15s;
  background:rgba(255,255,255,0);
}
.pft-list-row:hover { background:rgba(255,255,255,0.025); }
.pft-list-row:active { background:rgba(255,255,255,0.04); }

/* 创建歌单入口（特殊行） */
.pft-list-new {
  border:1px dashed rgba(99,102,241,0.18);
  margin-bottom:8px; padding:12px 12px;
  color: #818cf8; transition: all 0.2s;
}
.pft-list-new:hover { border-color:rgba(99,102,241,0.4); background:rgba(99,102,241,0.04); }
.pft-list-new .plr-title { color:#818cf8; font-weight:600; }

/* 共享列样式 */
.plr-num { width:28px; text-align:center; font-size:12px; color:rgba(255,255,255,0.2); flex-shrink:0; font-variant-numeric:tabular-nums; }
.plr-num-add { font-size:18px; font-weight:300; color:#818cf8; }
.plr-cover { width:40px; height:40px; border-radius:10px; overflow:hidden; object-fit:cover; flex-shrink:0; }
.plr-cover img { width:100%; height:100%; object-fit:cover; }
.plr-cover-empty { width:100%; height:100%; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; }
.plr-cover-add { background:rgba(99,102,241,0.08); display:flex; align-items:center; justify-content:center; color:#818cf8; }
.plr-info { flex:1; min-width:0; }
.plr-title { font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:rgba(255,255,255,0.85); }
.plr-artist { font-size:12px; color:rgba(255,255,255,0.3); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.plr-count-badge { font-size:12px; color:rgba(255,255,255,0.25); flex-shrink:0; padding:3px 10px; background:rgba(255,255,255,0.03); border-radius:20px; }
.plr-dur { font-size:12px; color:rgba(255,255,255,0.25); flex-shrink:0; }
.plr-action-hint { font-size:11px; color:rgba(99,102,241,0.5); flex-shrink:0; }

.pft-empty { text-align:center; padding:40px 20px; color:rgba(255,255,255,0.2); font-size:14px; }


/* 右键菜单 */
.pf-menu { position:fixed; background:rgba(20,20,40,0.96); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:6px 0; min-width:160px; z-index:9999; backdrop-filter:blur(16px); box-shadow:0 8px 32px rgba(0,0,0,0.5); }
.pfm-item { display:flex; align-items:center; gap:10px; padding:10px 16px; font-size:13px; color:rgba(255,255,255,0.8); cursor:pointer; transition:all 0.15s; }
.pfm-item:hover { background:rgba(99,102,241,0.1); color:#818cf8; }
.pfm-delete:hover { background:rgba(239,68,68,0.1); color:#f87171; }
.pfm-div { height:1px; background:rgba(255,255,255,0.06); margin:4px 12px; }

/* 创建弹窗 */
.pf-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center; }
.pf-modal { background:linear-gradient(160deg,#1a1a38,#141430,#1a1a38); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:24px; width:360px; max-width:90vw; display:flex; flex-direction:column; gap:14px; }
.pf-modal h3 { margin:0; font-size:17px; font-weight:700; }
.pf-input { padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#fff; font-size:14px; outline:none; }
.pf-input:focus { border-color:#6366f1; }
.pf-check { display:flex; align-items:center; gap:8px; font-size:13px; color:rgba(255,255,255,0.5); cursor:pointer; }
.pf-modal-actions { display:flex; justify-content:flex-end; gap:10px; }
.pfm-btn { padding:9px 20px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); font-size:13px; cursor:pointer; }
.pfm-btn-ok { background:#6366f1; border-color:#6366f1; color:#fff; }
.pfm-btn-ok:disabled { opacity:0.3; }

.pf-page::-webkit-scrollbar{width:3px}.pf-page::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.05);border-radius:2px}

@media(min-width:769px){.pf-page{padding:28px 48px 40px;width:100%;box-sizing:border-box}.pfc-avatar{width:100px;height:100px}.pfc-name{font-size:26px}.plr-cover{width:48px;height:48px}.plr-title{font-size:15px}.pfc-id-badge{padding:10px 20px}.pfc-id-num{font-size:19px}.pfc-id-prefix{font-size:11px}.pf-guest-card{padding:56px 48px}.pf-guest-title{font-size:24px}.pft-list{max-width:100%}.pf-card-top{max-width:100%}}
@media(max-width:480px){.pf-page{padding:14px 10px 130px}.pf-card-top{padding:20px;gap:14px}.pfc-avatar{width:64px;height:64px}.pfc-name{font-size:18px}.pft-list-row{gap:8px;padding:8px 8px}.plr-cover{width:36px;height:36px}.plr-title{font-size:13px}.plr-num{width:22px;font-size:11px}.plr-count-badge{font-size:10px;padding:2px 8px}.pfc-id-badge{padding:6px 12px;gap:6px}.pfc-id-num{font-size:14px;letter-spacing:1px}.pfc-id-prefix{font-size:9px;letter-spacing:2px}.pfc-id-icon{width:14px;height:14px}.pfc-id-copy{width:22px;height:22px}.pf-guest-card{padding:32px 24px}.pf-guest-title{font-size:18px}.pf-guest-desc{font-size:13px}.pf-guest-actions{flex-direction:column;gap:10px}.pf-guest-btn{padding:13px 16px;font-size:14px}}
</style>
