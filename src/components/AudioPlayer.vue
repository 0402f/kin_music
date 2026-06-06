<template>
  <div class="audio-player" ref="playerRef">

    <!-- ====== 胶囊主体 ====== -->
    <div class="ap-capsule" ref="capsuleRef">
      <!-- 频谱背景层（播放时显示在胶囊内部） -->
      <div class="apc-spectrum-bg" v-show="isPlaying" ref="spectrumRef">
        <span v-for="n in 30" :key="n" class="aps-bar" :ref="(el) => { if (el) bars[n-1] = el }"></span>
      </div>
      <!-- 封面 -->
      <div class="apc-cover" @click.stop="goLyrics">
        <img v-if="currentSong" :src="currentSong.cover || '/default-cover.jpg'" :alt="currentSong.title" ref="coverImgRef" />
        <div v-else class="apc-cover-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
        </div>
        <div class="apc-cover-ring" :class="{ on: isPlaying }"></div>
      </div>

      <!-- 信息 -->
      <div class="apc-info" @click.stop="goLyrics">
        <div class="apci-title" ref="titleRef">{{ currentSong?.title || '未在播放' }}</div>
        <div class="apci-artist" ref="artistRef">{{ currentSong?.artist || '选择歌曲开始播放' }}</div>
      </div>

      <!-- 进度条（桌面端集成在胶囊内） -->
      <div class="apc-progress" ref="progressWrapRef">
        <span class="app-time">{{ formattedCurrentTime || '0:00' }}</span>
        <div class="app-track" @mousedown.stop="onProgressDown" ref="progressTrackRef">
          <div class="app-track-bg"></div>
          <div class="app-track-fill" :style="{ width: progress + '%' }">
            <div class="app-track-glow"></div>
          </div>
          <div class="app-track-thumb" :style="{ left: progress + '%' }" ref="thumbRef"></div>
        </div>
        <span class="app-time">{{ formattedDuration || '0:00' }}</span>
      </div>

      <!-- 移动端进度条（居中，可拖拽） -->
      <div class="apc-progress-mobile mobile-only" @mousedown.stop="onProgressDown" @touchstart.stop="onProgressTouch" ref="mobileProgressRef">
        <span class="app-time">{{ formattedCurrentTime || '0:00' }}</span>
        <div class="app-track">
          <div class="app-track-bg"></div>
          <div class="app-track-fill" :style="{ width: progress + '%' }"></div>
          <div class="app-track-thumb" :style="{ left: progress + '%' }"></div>
        </div>
        <span class="app-time">{{ formattedDuration || '0:00' }}</span>
      </div>

      <!-- 控制按钮组 -->
      <div class="apc-controls">
        <!-- 桌面端完整控制 -->
        <span class="apcc-group desktop-only">
          <button class="apcc-btn" :class="{ on: playMode !== PLAY_MODES.SEQUENCE }" @click.stop="toggleShuffle" :disabled="!currentSong" title="播放模式" ref="modeBtnRef">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          </button>
          <button class="apcc-btn" @click.stop="handlePrevious" :disabled="!currentSong" title="上一首">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
        </span>

        <!-- 移动端：上一首（胶囊内显示，在播放按钮左侧） -->
        <button class="apcc-btn mobile-only" @click.stop="handlePrevious" :disabled="!currentSong">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>

        <!-- 播放/暂停（始终可见，居中） -->
        <button class="apcc-btn apcc-play" @click.stop="togglePlay" :disabled="!currentSong" ref="playBtnRef">
          <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <!-- 移动端：下一首（胶囊内显示，在播放按钮右侧） -->
        <button class="apcc-btn mobile-only" @click.stop="handleNext" :disabled="!currentSong">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>

        <span class="apcc-group desktop-only">
          <button class="apcc-btn" @click.stop="handleNext" :disabled="!currentSong" title="下一首">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </span>
      </div>

      <!-- 桌面端右侧功能按钮 -->
      <div class="apc-actions desktop-only">
        <button class="apca-btn" :class="{ active: isLiked }" @click.stop="toggleLike" :disabled="!currentSong" title="喜欢">
          <svg width="16" height="16" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="apca-btn" @click.stop="showPlaylistModal" :disabled="!currentSong" title="添加到歌单">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div class="apca-vol" @mouseenter="showVol = true" @mouseleave="showVol = false">
          <button class="apca-btn" title="音量">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path v-if="volume > 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path v-else-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <line v-else x1="23" y1="9" x2="17" y2="15"/><line v-else x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          </button>
          <Transition name="vol-fade">
            <div v-if="showVol" class="apca-vol-pop" @click.stop>
              <span class="avp-pct">{{ Math.round(volume * 100) }}</span>
              <div class="avp-slider" @mousedown="onVolumeDown" @wheel.prevent="handleVolumeWheel" ref="volumeSliderRef">
                <div class="avp-track"><div class="avp-fill" :style="{ height: volume * 100 + '%' }"></div></div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>


    <!-- ====== 弹窗 ====== -->
    <Teleport to="body">
      <Transition name="modal-pop">
        <div v-if="showPlaylistModalState" class="modal-overlay" @click="closePlaylistModal">
          <div class="modal-card" @click.stop>
            <div class="modal-head"><h3>收藏到歌单</h3><button class="modal-close" @click="closePlaylistModal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6L18 18"/></svg></button></div>
            <div class="modal-body-custom">
              <div class="pl-item pl-create" @click="createNewPlaylist"><div class="pl-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div><span>创建新歌单</span></div>
              <div v-for="pl in userPlaylists" :key="pl.id" class="pl-item" @click="addToPlaylist(pl)"><div class="pl-icon"><img v-if="pl.coverUrl" :src="pl.coverUrl" @error="(e) => { e.target.style.display = 'none' }" /><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5L21 12L9 18Z"/></svg></div><div class="pl-meta"><span class="pl-name">{{ pl.name }}</span><span class="pl-count">{{ pl.songCount }}首</span></div></div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <Teleport to="body">
      <Transition name="modal-pop">
        <div v-if="showCreatePlaylistModal" class="modal-overlay" @click="closeCreatePlaylistModal">
          <div class="modal-card" @click.stop>
            <div class="modal-head"><h3>创建新歌单</h3><button class="modal-close" @click="closeCreatePlaylistModal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6L18 18"/></svg></button></div>
            <div class="modal-body-custom"><div class="form-row"><label>歌单名称</label><input v-model="newPlaylistName" type="text" placeholder="请输入歌单名称" maxlength="50" @keyup.enter="confirmCreatePlaylist" /></div><div class="selected-info">将添加歌曲：{{ currentSong?.title }} - {{ currentSong?.artist }}</div></div>
            <div class="modal-foot"><button class="mbtn mbtn-cancel" @click="closeCreatePlaylistModal">取消</button><button class="mbtn mbtn-ok" @click="confirmCreatePlaylist" :disabled="isCreatingPlaylist || !newPlaylistName.trim()">{{ isCreatingPlaylist ? '创建中...' : '创建并添加' }}</button></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import { addMusicToFavorites, removeMusicFromFavorites } from '../api/user'
import { getMyPlaylists, addMusicToPlaylist, createPlaylist } from '@/api/playlist'

const audioStore = useAudioStore()
const userStore = useUserStore()
const router = useRouter()

const {
  currentSong, isPlaying, progress, formattedCurrentTime, formattedDuration,
  volume, playMode, playModeText
} = storeToRefs(audioStore)
const { favoriteIds, isLoggedIn } = storeToRefs(userStore)
const { PLAY_MODES } = audioStore
const { togglePlay, setVolume, setCurrentTime, playPrevious, playNext, togglePlayMode } = audioStore

// --- Refs ---
const playerRef = ref(null)
const capsuleRef = ref(null)
const spectrumRef = ref(null)
const bars = ref([])
const coverImgRef = ref(null)
const titleRef = ref(null)
const artistRef = ref(null)
const playBtnRef = ref(null)
const progressTrackRef = ref(null)
const progressWrapRef = ref(null)
const thumbRef = ref(null)
const modeBtnRef = ref(null)
const volumeSliderRef = ref(null)
const mobileProgressRef = ref(null)

// --- State ---
const showVol = ref(false)
const isLiked = computed(() => currentSong.value && isLoggedIn.value ? favoriteIds.value.has(currentSong.value.id) : false)

// --- GSAP: 胶囊入场 ---
const animateCapsuleIn = () => {
  if (!capsuleRef.value) return
  gsap.from(capsuleRef.value, { y: 60, opacity: 0, duration: 0.6, ease: 'power3.out' })
  if (spectrumRef.value) gsap.from(spectrumRef.value, { opacity: 0, duration: 0.4, delay: 0.2 })
}

// --- GSAP: 切歌 ---
let songTl = null
const animateSongSwitch = () => {
  if (songTl) songTl.kill()
  const tl = gsap.timeline()
  if (coverImgRef.value) tl.from(coverImgRef.value, { scale: 0.85, opacity: 0, duration: 0.35, ease: 'back.out(1.7)' }, 0)
  if (titleRef.value) tl.from(titleRef.value, { y: -8, opacity: 0, duration: 0.25, ease: 'power2.out' }, 0.05)
  if (artistRef.value) tl.from(artistRef.value, { y: -4, opacity: 0, duration: 0.25, ease: 'power2.out' }, 0.1)
  songTl = tl
}

// --- GSAP: 播放/暂停反馈 ---
const animatePlayBtn = () => {
  if (!playBtnRef.value) return
  gsap.fromTo(playBtnRef.value, { scale: 1 }, { scale: 0.88, duration: 0.08, ease: 'power2.in', onComplete: () => gsap.to(playBtnRef.value, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.4)' }) })
}

// --- GSAP: 进度条拖拽 ---
const animateThumbGrab = () => {
  if (!thumbRef.value) return
  gsap.to(thumbRef.value, { scale: 1.8, duration: 0.15, ease: 'back.out(1.7)' })
}
const animateThumbRelease = () => {
  if (!thumbRef.value) return
  gsap.to(thumbRef.value, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.3)' })
}

// --- GSAP: 频谱 ---
let spectrumTimer = null
const animateBars = () => {
  if (!bars.value.length) return
  gsap.to(bars.value, {
    scaleY: () => gsap.utils.random(0.06, 1),
    duration: 0.3, ease: 'power2.inOut',
    stagger: { each: 0.012, from: 'random' }
  })
}
const startBars = () => { if (spectrumTimer) return; animateBars(); spectrumTimer = setInterval(animateBars, 320) }
const stopBars = () => { if (spectrumTimer) { clearInterval(spectrumTimer); spectrumTimer = null }; if (bars.value.length) gsap.to(bars.value, { scaleY: 0.03, duration: 0.35, ease: 'power3.out' }) }

// --- GSAP: 模式切换 ---
const animateMode = () => { if (modeBtnRef.value) gsap.fromTo(modeBtnRef.value, { rotation: -45, opacity: 0 }, { rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }) }

// --- GSAP: 点赞 ---
const animateLike = () => {
  // 在桌面端按钮上触发
  const btn = document.querySelector('.apca-btn.active')
  if (!btn) return
  gsap.fromTo(btn, { scale: 1 }, { scale: 1.45, duration: 0.12, ease: 'power2.out', onComplete: () => gsap.to(btn, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' }) })
  // 粒子
  const rect = btn.getBoundingClientRect()
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div')
    p.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:4px;height:4px;border-radius:50%;background:#ff4757;left:${rect.left+rect.width/2}px;top:${rect.top+rect.height/2}px;`
    document.body.appendChild(p)
    const angle = (i / 6) * Math.PI * 2
    gsap.to(p, { x: Math.cos(angle) * 35, y: Math.sin(angle) * 35, opacity: 0, scale: 0, duration: 0.55, ease: 'power3.out', onComplete: () => p.remove() })
  }
}

// --- 监听 ---
watch(isPlaying, (v) => { animatePlayBtn(); v ? startBars() : stopBars() })
watch(currentSong, (s) => { if (s) { nextTick(() => animateSongSwitch()); startBars() } else stopBars() })

// --- 进度条 ---
let dragging = false
const onProgressDown = (e) => {
  dragging = true; updateProgress(e)
  animateThumbGrab()
  const mm = (ev) => { if (dragging) updateProgress(ev) }
  const mu = () => { dragging = false; document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); animateThumbRelease() }
  document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu)
}
const updateProgress = (e) => {
  // 优先用移动端进度条（桌面端被 CSS 隐藏后 ref 仍存在但位置不对）
  const mobileTrack = mobileProgressRef.value?.querySelector('.app-track')
  const el = mobileTrack || progressTrackRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
  if (!x) return
  setCurrentTime(Math.max(0, Math.min(1, (x - r.left) / r.width)) * audioStore.duration)
}

// 移动端触摸拖拽
const onProgressTouch = (e) => {
  e.preventDefault()
  dragging = true
  updateProgress(e)
  const mm = (ev) => { if (dragging) { ev.preventDefault(); updateProgress(ev) } }
  const mu = () => {
    dragging = false
    document.removeEventListener('touchmove', mm)
    document.removeEventListener('touchend', mu)
    animateThumbRelease()
  }
  document.addEventListener('touchmove', mm, { passive: false })
  document.addEventListener('touchend', mu)
  animateThumbGrab()
}

// --- 音量 ---
let volDrag = false
const onVolumeDown = (e) => { volDrag = true; updateVol(e); const mm = (ev) => { if (volDrag) updateVol(ev) }; const mu = () => { volDrag = false; document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu) }; document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu) }
const updateVol = (e) => { if (!volumeSliderRef.value) return; const r = volumeSliderRef.value.getBoundingClientRect(); setVolume(Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height))) }
const handleVolumeWheel = (e) => setVolume(Math.max(0, Math.min(1, volume.value + (e.deltaY > 0 ? -0.05 : 0.05))))

// --- Toast ---
const toast = (msg, type = 'error') => {
  const el = document.createElement('div'); el.textContent = msg
  el.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 24px;border-radius:10px;color:#fff;font-size:14px;z-index:100000;pointer-events:none;font-family:system-ui;background:${type==='success'?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#ef4444,#dc2626)'};box-shadow:0 8px 24px rgba(0,0,0,0.3);`
  document.body.appendChild(el)
  gsap.fromTo(el, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
  gsap.to(el, { opacity: 0, x: 60, duration: 0.3, delay: 2.5, ease: 'power2.in', onComplete: () => el.remove() })
}

// --- 操作 ---
const handlePrevious = () => playPrevious()
const handleNext = () => playNext()
const goLyrics = () => { if (currentSong.value?.id) router.push({ name: 'lyrics', params: { id: currentSong.value.id } }) }
const toggleShuffle = () => { togglePlayMode(); animateMode() }
const toggleLike = async () => {
  if (!currentSong.value) return
  if (!isLoggedIn.value) { toast('请您先登录'); return }
  try {
    if (isLiked.value) { await removeMusicFromFavorites(currentSong.value.id); userStore.removeFromFavorites(currentSong.value.id) }
    else { await addMusicToFavorites(currentSong.value.id); await userStore.addToFavorites(currentSong.value.id); animateLike(); toast(`已喜欢「${currentSong.value.title}」`, 'success') }
  } catch { toast('操作失败') }
}

// --- 歌单弹窗 ---
const showPlaylistModalState = ref(false); const userPlaylists = ref([]); const showCreatePlaylistModal = ref(false); const newPlaylistName = ref(''); const isCreatingPlaylist = ref(false)
const showPlaylistModal = async () => { if (!currentSong.value) return; if (!isLoggedIn.value) { toast('请您先登录'); return }; showPlaylistModalState.value = true; try { const r = await getMyPlaylists(); if (r.code === 1 && r.data) userPlaylists.value = r.data.map(p => ({ id: p.id, name: p.name, songCount: p.songCount, coverUrl: p.coverFileUrl })) } catch { userPlaylists.value = [] } }
const closePlaylistModal = () => { showPlaylistModalState.value = false }
const createNewPlaylist = () => { showPlaylistModalState.value = false; showCreatePlaylistModal.value = true; newPlaylistName.value = '' }
const closeCreatePlaylistModal = () => { showCreatePlaylistModal.value = false; newPlaylistName.value = ''; showPlaylistModalState.value = true }
const confirmCreatePlaylist = async () => { if (!newPlaylistName.value.trim()) return toast('请输入名称'); isCreatingPlaylist.value = true; try { const r = await createPlaylist({ name: newPlaylistName.value.trim(), isPublic: 1 }); await addMusicToPlaylist(r.data.id, currentSong.value.id); toast('创建成功', 'success'); closeCreatePlaylistModal(); closePlaylistModal() } catch (err) { toast(err.message || '创建失败') } finally { isCreatingPlaylist.value = false } }
const addToPlaylist = async (pl) => { try { await addMusicToPlaylist(pl.id, currentSong.value.id); toast(`已添加到「${pl.name}」`, 'success'); closePlaylistModal() } catch (err) { toast(err.message?.includes('已在') || err.message?.includes('已存在') ? '歌曲已在歌单中' : (err.message || '添加失败')) } }

onMounted(() => { animateCapsuleIn(); if (currentSong.value && isPlaying.value) startBars() })
</script>

<style scoped>
/* ===================== 播放器容器 ===================== */
.audio-player {
  position: fixed;
  bottom: 24px; left: 0; right: 0;
  z-index: 1004;
  display: flex; flex-direction: column; align-items: center;
  padding: 0 16px;
  transition: bottom 0.3s ease;
}

/* ===================== 胶囊主体 ===================== */
.ap-capsule {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  width: 100%; max-width: 960px;
  height: 70px; padding: 6px 16px;
  background: rgba(18, 18, 38, 0.92);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 22px;
  box-shadow:
    0 8px 40px rgba(0,0,0,0.5),
    0 0 0 1px rgba(0,255,255,0.04) inset,
    0 1px 0 rgba(255,255,255,0.04) inset;
  box-sizing: border-box;
  overflow: hidden;
}

/* 移动端进度条（胶囊中间，可拖拽） */
.apc-progress-mobile {
  display: none;
  align-items: center; gap: 8px;
  padding: 2px 0;
  z-index: 1;
}
.apc-progress-mobile .app-time {
  font-size: 10px; font-family: 'SF Mono', monospace;
  color: rgba(255,255,255,0.3); min-width: 30px; text-align: center;
}
.apc-progress-mobile .app-track {
  flex: 1; height: 24px; display: flex; align-items: center; cursor: pointer; position: relative;
}
.apc-progress-mobile .app-track-bg {
  width: 100%; height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px;
}
.apc-progress-mobile .app-track-fill {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  height: 5px;
  background: linear-gradient(90deg, #00ffff, #d946ef);
  border-radius: 3px; transition: width 0.1s linear;
}
.apc-progress-mobile .app-track-thumb {
  position: absolute; top: 50%; transform: translate(-50%, -50%);
  width: 14px; height: 14px;
  background: #fff; border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,255,255,0.5);
}

.ap-capsule:hover {
  background: rgba(22, 22, 46, 0.94);
  border-color: rgba(0,255,255,0.12);
  box-shadow:
    0 12px 48px rgba(0,0,0,0.55),
    0 0 0 1px rgba(0,255,255,0.06) inset,
    0 0 24px rgba(0,255,255,0.03);
}

/* ===================== 频谱背景层（胶囊内部） ===================== */
.apc-spectrum-bg {
  position: absolute; inset: 0;
  display: flex; align-items: flex-end; gap: 1px;
  padding: 0 14px;
  pointer-events: none; z-index: 0;
  opacity: 0.25;
}

.aps-bar {
  flex: 1; height: 60%;
  background: linear-gradient(to top, rgba(0,255,255,0.7), rgba(217,70,239,0.4));
  border-radius: 1px 1px 0 0;
  transform-origin: bottom; transform: scaleY(0.03);
}

.ap-capsule:hover {
  background: rgba(22, 22, 46, 0.92);
  border-color: rgba(0,255,255,0.12);
  box-shadow:
    0 12px 48px rgba(0,0,0,0.55),
    0 0 0 1px rgba(0,255,255,0.06) inset,
    0 0 24px rgba(0,255,255,0.03);
}

/* ===================== 封面 ===================== */
.apc-cover {
  position: relative; z-index: 1;
  width: 58px; height: 58px;
  border-radius: 16px; overflow: hidden;
  flex-shrink: 0; cursor: pointer;
}

.apc-cover img {
  width: 100%; height: 100%; object-fit: cover;
}

.apc-cover-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.03);
}

.apc-cover-ring {
  position: absolute; inset: -2px;
  border: 1.5px solid transparent; border-radius: 18px;
  transition: all 0.4s ease;
}
.apc-cover-ring.on {
  border-top-color: rgba(0,255,255,0.45);
  border-right-color: rgba(217,70,239,0.25);
  animation: ring-spin 3s linear infinite;
}
@keyframes ring-spin { to { transform: rotate(360deg); } }

/* ===================== 信息 ===================== */
.apc-info {
  position: relative; z-index: 1;
  flex: 0 1 auto; min-width: 0; max-width: 220px;
  cursor: pointer;
}

.apci-title {
  font-size: 15px; font-weight: 600; color: #edf0f5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.apci-artist {
  font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ===================== 进度条（桌面端集成） ===================== */
.apc-progress {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 10px;
  flex: 1; min-width: 120px;
}

.app-time {
  font-size: 11px; font-family: 'SF Mono', 'Cascadia Code', monospace;
  color: rgba(255,255,255,0.3); font-variant-numeric: tabular-nums;
  min-width: 32px; text-align: center;
}

.app-track {
  flex: 1; height: 20px; display: flex; align-items: center;
  cursor: pointer; position: relative;
}

.app-track-bg {
  width: 100%; height: 4px;
  background: rgba(255,255,255,0.08); border-radius: 2px;
  transition: height 0.15s;
}
.app-track:hover .app-track-bg { height: 6px; }

.app-track-fill {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  height: 4px;
  background: linear-gradient(90deg, #00ffff, #d946ef, #f59e0b);
  border-radius: 2px; transition: height 0.15s;
}
.app-track:hover .app-track-fill { height: 6px; }

.app-track-glow {
  position: absolute; inset: 0;
  background: inherit; filter: blur(5px); opacity: 0.55;
}

.app-track-thumb {
  position: absolute; top: 50%; transform: translate(-50%, -50%);
  width: 12px; height: 12px;
  background: #fff; border-radius: 50%;
  box-shadow: 0 0 14px rgba(0,255,255,0.5), 0 2px 8px rgba(0,0,0,0.3);
  opacity: 0; transition: opacity 0.2s;
}
.app-track:hover .app-track-thumb { opacity: 1; }

/* ===================== 控制按钮 ===================== */
.apc-controls {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 4px;
  flex-shrink: 0;
}

.apcc-group { display: flex; align-items: center; gap: 2px; }

.apcc-btn {
  width: 34px; height: 34px; border: none; border-radius: 50%;
  background: transparent; color: rgba(255,255,255,0.55);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.apcc-btn:hover:not(:disabled) { background: rgba(255,255,255,0.06); color: #fff; transform: scale(1.08); }
.apcc-btn:active:not(:disabled) { transform: scale(0.92); }
.apcc-btn:disabled { opacity: 0.2; cursor: not-allowed; }
.apcc-btn.on { color: #00ffff; }

.apcc-play {
  width: 46px; height: 46px;
  background: linear-gradient(135deg, rgba(0,255,255,0.22), rgba(217,70,239,0.14));
  color: #fff;
  box-shadow: 0 0 20px rgba(0,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3);
}
.apcc-play:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0,255,255,0.32), rgba(217,70,239,0.22));
  box-shadow: 0 0 32px rgba(0,255,255,0.18), 0 6px 18px rgba(0,0,0,0.35);
  transform: scale(1.05);
}

/* ===================== 桌面端功能按钮 ===================== */
.apc-actions {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 2px;
  flex-shrink: 0;
}

.apca-btn {
  width: 32px; height: 32px; border: none; border-radius: 10px;
  background: transparent; color: rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.apca-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: #fff; }
.apca-btn:disabled { opacity: 0.2; cursor: not-allowed; }
.apca-btn.active { color: #ff4757; }

/* 音量 */
.apca-vol { position: relative; }
.vol-fade-enter-active, .vol-fade-leave-active { transition: all 0.12s ease; }
.vol-fade-enter-from, .vol-fade-leave-to { opacity: 0; transform: translateY(6px); }

.apca-vol-pop {
  position: absolute; bottom: 44px; left: 50%; transform: translateX(-50%);
  background: rgba(18,18,40,0.95); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
  padding: 8px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  z-index: 10; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.avp-pct { font-size: 10px; color: rgba(255,255,255,0.35); font-family: 'SF Mono', monospace; }

.avp-slider { width: 14px; height: 56px; cursor: pointer; display: flex; justify-content: center; }
.avp-track { width: 3px; height: 100%; background: rgba(255,255,255,0.08); border-radius: 2px; position: relative; }
.avp-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, #00ffff, #d946ef); border-radius: 2px; transition: height 0.06s; }

/* ===================== 弹窗 ===================== */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-card { background: linear-gradient(160deg, #1a1a38, #141430, #1a1a38); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; width: 400px; max-width: 90vw; max-height: 65vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.modal-head h3 { margin: 0; font-size: 15px; font-weight: 700; color: #edf0f5; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; border-radius: 8px; }
.modal-close:hover { background: rgba(255,255,255,0.05); color: #fff; }
.modal-body-custom { padding: 10px 18px; max-height: 260px; overflow-y: auto; }
.pl-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.pl-item:hover { background: rgba(255,255,255,0.03); }
.pl-create { border: 1px dashed rgba(0,255,255,0.12); color: #00ffff; margin-bottom: 8px; }
.pl-icon { width: 36px; height: 36px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); flex-shrink: 0; color: rgba(255,255,255,0.25); }
.pl-icon img { width: 100%; height: 100%; object-fit: cover; }
.pl-meta { display: flex; flex-direction: column; gap: 1px; }
.pl-name { font-size: 13px; font-weight: 500; color: #edf0f5; }
.pl-count { font-size: 11px; color: rgba(255,255,255,0.3); }
.form-row { margin-bottom: 14px; }
.form-row label { display: block; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); margin-bottom: 6px; }
.form-row input { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; box-sizing: border-box; color: #edf0f5; font-size: 14px; outline: none; }
.form-row input:focus { border-color: rgba(0,255,255,0.25); }
.selected-info { padding: 10px 14px; background: rgba(0,255,255,0.02); border-left: 2px solid #00ffff; border-radius: 6px; font-size: 12px; color: rgba(255,255,255,0.3); }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid rgba(255,255,255,0.05); }
.mbtn { padding: 8px 18px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
.mbtn-cancel { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.35); }
.mbtn-cancel:hover { background: rgba(255,255,255,0.07); }
.mbtn-ok { background: linear-gradient(135deg, #00ffff, #d946ef); color: #050510; font-weight: 600; }
.mbtn-ok:disabled { opacity: 0.3; cursor: not-allowed; }

.modal-pop-enter-active { transition: opacity 0.25s; }
.modal-pop-leave-active { transition: opacity 0.2s; }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; }
.modal-pop-enter-active .modal-card { animation: mp-in 0.3s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes mp-in { from { transform: translateY(24px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

.modal-body-custom::-webkit-scrollbar { width: 3px; }
.modal-body-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }

/* ===================== 响应式 ===================== */
.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .audio-player { bottom: 60px; padding: 0 10px; }

  .ap-capsule {
    height: 58px; padding: 4px 8px; gap: 8px;
    border-radius: 18px;
  }

  .apc-spectrum-bg { padding: 0 8px; opacity: 0.2; }
  .aps-bar { height: 45%; }

  .apc-cover { width: 46px; height: 46px; border-radius: 13px; }
  .apc-cover-ring { border-radius: 15px; }

  .apc-info { max-width: none; flex: 1; }
  .apci-title { font-size: 13px; }
  .apci-artist { font-size: 10px; }

  .apc-progress { display: none; }
  .apc-controls { padding-right: 4px; }
  .apcc-btn { width: 30px; height: 30px; }
  .apcc-play { width: 40px; height: 40px; margin: 0 2px; }
  .apcc-group.desktop-only { display: none; }
  .apc-actions.desktop-only { display: none; }

  .desktop-only { display: none; }
  .mobile-only { display: flex; }

  .apc-progress-mobile { display: flex; }
}

@media (max-width: 480px) {
  .audio-player { bottom: 58px; padding: 0 6px; }
  .ap-capsule { height: 52px; padding: 3px 6px; gap: 6px; border-radius: 16px; }
  .apc-cover { width: 40px; height: 40px; border-radius: 11px; }
  .apci-title { font-size: 12px; }
  .apc-controls { padding-right: 2px; }
  .apcc-btn { width: 28px; height: 28px; }
  .apcc-play { width: 36px; height: 36px; margin: 0 1px; }
  .apc-spectrum-bg { opacity: 0.15; }
  .aps-bar { height: 35%; }
  .apc-progress-mobile .app-track-bg { height: 4px; }
  .apc-progress-mobile .app-track-fill { height: 4px; }
  .apc-progress-mobile .app-track-thumb { width: 12px; height: 12px; }
  .apc-progress-mobile .app-time { font-size: 9px; min-width: 26px; }
}
</style>
