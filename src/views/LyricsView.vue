<template>
  <div class="lyrics-page" :class="'theme-' + currentTheme" ref="pageRef">
    <!-- 星空/粒子背景 -->
    <canvas class="starfield" ref="canvasRef"></canvas>

    <!-- 律动光晕 -->
    <div class="aura-container" ref="auraRef">
      <div class="aura aura-1" :class="{ pulse: isPlaying }"></div>
      <div class="aura aura-2" :class="{ pulse: isPlaying }"></div>
      <div class="aura aura-3" :class="{ pulse: isPlaying }"></div>
    </div>

    <!-- 装饰环 -->
    <div class="deco-rings" ref="ringsRef">
      <div class="deco-ring r1" :class="{ spin: isPlaying }"></div>
      <div class="deco-ring r2" :class="{ spin: isPlaying, reverse: true }"></div>
    </div>

    <!-- === 普通模式 === -->
    <div v-if="!isLyricsFullscreen" class="normal-mode">
      <header class="lyrics-header" ref="headerRef">
        <button class="hdr-btn back-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>返回</span>
        </button>

        <div class="header-song" ref="headerSongRef">
          <h2 class="hs-title">{{ currentSong?.title || '未知歌曲' }}</h2>
          <p class="hs-artist">{{ currentSong?.artist || '未知艺术家' }}</p>
        </div>

        <div class="header-actions-row">
          <!-- 主题切换 -->
          <div class="theme-switcher" ref="themeSwitcherRef">
            <button class="hdr-btn theme-btn" @click="cycleTheme" :title="'切换主题: ' + themes.find(t => t.key === nextThemeKey)?.name">
              <span class="theme-dot" :class="'dot-' + currentTheme"></span>
              <span class="theme-label">{{ currentThemeName }}</span>
            </button>
          </div>
          <button class="hdr-btn fs-btn" @click="toggleFullscreen" title="全屏歌词">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="lyric-progress-bar" ref="progressBarRef">
        <div class="lpb-track"><div class="lpb-fill" :style="{ width: lyricProgress + '%' }"></div></div>
      </div>

      <div class="lyrics-scroll" ref="scrollRef">
        <div v-if="isLoading" class="state-box">
          <div class="spinner-ring"><div></div></div>
          <p>加载歌词中...</p>
        </div>
        <div v-else-if="lyrics.length === 0" class="empty-lyrics-state" ref="emptyStateRef">
          <!-- 声波可视化条 -->
          <div class="els-wave-container" ref="emptyWaveRef">
            <span v-for="n in 28" :key="n" class="els-wave-bar" :ref="(el) => { if (el) waveBarEls[n-1] = el }"></span>
          </div>

          <!-- 中心视觉区 -->
          <div class="els-visual" ref="emptyVisualRef">
            <!-- 三层轨道环 -->
            <div class="els-orbit-ring els-or-1"></div>
            <div class="els-orbit-ring els-or-2"></div>
            <div class="els-orbit-ring els-or-3"></div>

            <!-- 中心音符图标 -->
            <div class="els-icon-wrap" ref="emptyIconRef">
              <svg class="els-icon" viewBox="0 0 64 64" fill="none">
                <path d="M22 46V14l28-4v28" stroke="var(--accent1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="16" cy="46" r="5" stroke="var(--accent1)" stroke-width="2.5"/>
                <circle cx="44" cy="38" r="5" stroke="var(--accent2)" stroke-width="2.5"/>
              </svg>
              <div class="els-icon-glow"></div>
            </div>

            <!-- 浮动音符 -->
            <div class="els-floating-notes" ref="emptyNotesRef">
              <span v-for="n in 7" :key="n" class="els-fn" :ref="(el) => { if (el) noteEls[n-1] = el }">
                {{ ['♪','♫','♬','♪','♩','♫','♪'][n-1] }}
              </span>
            </div>
          </div>

          <!-- 文字区 -->
          <div class="els-text" ref="emptyTextRef">
            <h3 class="els-title">暂无歌词</h3>
            <p class="els-subtitle">纯器乐演奏 · 请欣赏旋律</p>
          </div>

          <!-- 底部扩散波纹 -->
          <div class="els-bottom-ripple" ref="emptyRippleRef">
            <div class="els-br-line" v-for="n in 3" :key="n"></div>
          </div>
        </div>
        <div v-else class="lyric-list" ref="listRef">
          <div
            v-for="(lyric, index) in lyrics"
            :key="index"
            :ref="(el) => { if (el) lineRefs[index] = el }"
            :class="['lyric-row', { active: index === currentLyricIndex, passed: index < currentLyricIndex, upcoming: index > currentLyricIndex }]"
            @click="seekToTime(lyric.time)"
          >
            <div class="lr-indicator"><div class="lri-dot"></div><div class="lri-line"></div></div>
            <div class="lr-text-wrap">
              <span class="lr-text-single">{{ lyric.text }}</span>
            </div>
            <span class="lr-time" @click.stop="seekToTime(lyric.time)">{{ formatTime(lyric.time) }}</span>
          </div>
          <div class="lyric-list-spacer"></div>
        </div>
      </div>
    </div>

    <!-- === 全屏沉浸模式 === -->
    <div v-else class="fullscreen-mode" ref="fsRef">
      <!-- 唱片圆盘背景装饰 -->
      <div class="fs-vinyl" :class="{ spinning: isPlaying }" ref="vinylRef">
        <div class="fs-vinyl-disc">
          <div class="fs-vinyl-label"></div>
        </div>
      </div>

      <!-- 浮动粒子环 -->
      <div class="fs-particle-ring" ref="particleRingRef">
        <span v-for="n in 12" :key="n" class="fs-pr-dot" :ref="(el) => { if (el) ringDots[n-1] = el }"></span>
      </div>

      <!-- 顶部控制 -->
      <div class="fs-top-bar">
        <button class="hdr-btn back-btn" @click="toggleFullscreen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>退出全屏</span>
        </button>

        <div class="fs-song-meta">
          <p class="fsm-title">{{ currentSong?.title || '' }}</p>
          <p class="fsm-artist">{{ currentSong?.artist || '' }}</p>
        </div>
      </div>

      <!-- 歌词卡片舞台 -->
      <div class="fs-stage" ref="fsStageRef">
        <div v-if="isLoading || lyrics.length === 0" class="fs-empty-state">
          <template v-if="isLoading">
            <div class="state-box">
              <div class="spinner-ring"><div></div></div>
              <p>加载歌词中...</p>
            </div>
          </template>
          <template v-else>
            <!-- 中心唱片（纯音乐主题） -->
            <div class="fse-vinyl-stage" ref="fseVinylRef">
              <div class="fse-vinyl-disc" :class="{ spinning: isPlaying }">
                <div class="fse-vinyl-groove" v-for="g in 6" :key="g" :style="{ '--g': g }"></div>
                <div class="fse-vinyl-label">
                  <span class="fse-vl-line"></span>
                  <span class="fse-vl-text">PURE<br/>MUSIC</span>
                </div>
              </div>
              <!-- 声波扩散环 -->
              <div class="fse-sound-rings">
                <div class="fse-sr" v-for="r in 3" :key="r" :style="{ animationDelay: (r-1)*0.6 + 's' }" :class="{ pulse: isPlaying }"></div>
              </div>
            </div>

            <!-- 轨道粒子 -->
            <div class="fse-orbit" ref="fseOrbitRef">
              <span v-for="n in 10" :key="n" class="fse-orbit-dot" :ref="(el) => { if (el) orbitDotEls[n-1] = el }"></span>
            </div>

            <!-- 玻璃卡片 -->
            <div class="fse-card" ref="fseCardRef">
              <div class="fse-card-bg"></div>
              <div class="fse-card-content">
                <svg class="fse-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
                <p class="fse-card-title">暂无歌词</p>
                <p class="fse-card-sub">此曲无词 · 静听心音</p>
              </div>
            </div>
          </template>
        </div>

        <template v-else>
          <!-- 玻璃卡片 -->
          <div class="fs-card" ref="fsCardRef">
            <!-- 上一句 -->
            <div class="fsc-prev" ref="fsPrevRef" v-if="currentLyricIndex > 0">
              {{ lyrics[currentLyricIndex - 1]?.text }}
            </div>

            <!-- 当前句 -->
            <div class="fsc-current" ref="fsCurrentRef" v-if="currentLyricIndex >= 0">
              <span class="fscc-text">{{ lyrics[currentLyricIndex]?.text }}</span>
              <div class="fscc-underline"></div>
            </div>

            <!-- 下一句 -->
            <div class="fsc-next" ref="fsNextRef" v-if="currentLyricIndex + 1 < lyrics.length">
              {{ lyrics[currentLyricIndex + 1]?.text }}
            </div>
          </div>
        </template>
      </div>

      <!-- 底部信息 -->
      <div class="fs-footer">
        <div class="fsf-progress" @click="seekToPosition">
          <div class="fsfp-track">
            <div class="fsfp-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
        <div class="fsf-info">
          <span class="fsf-time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          <span class="fsf-count">{{ currentLyricIndex + 1 }} / {{ lyrics.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { useAudioStore } from '@/stores/audio'
import { getLyrics } from '@/api/test'

const route = useRoute()
const router = useRouter()
const audioStore = useAudioStore()
const { currentSong, currentTime, duration, isPlaying, isLyricsFullscreen } = storeToRefs(audioStore)

// --- 主题系统 ---
const themes = [
  { key: 'cyberpunk', name: '赛博', dotColor: '#00ffff', starHue: [190, 280], bgGrad: 'radial-gradient(ellipse at 50% 30%, #0d1128 0%, #06060f 70%)', accent1: '#00ffff', accent2: '#d946ef', accent3: 'rgba(0,255,255,0.4)' },
  { key: 'aurora', name: '极光', dotColor: '#22d3ee', starHue: [170, 260], bgGrad: 'radial-gradient(ellipse at 50% 30%, #0a1628 0%, #040a14 70%)', accent1: '#22d3ee', accent2: '#818cf8', accent3: 'rgba(34,211,238,0.4)' },
  { key: 'neon', name: '霓虹', dotColor: '#f472b6', starHue: [320, 50], bgGrad: 'radial-gradient(ellipse at 50% 30%, #1a0a20 0%, #08030e 70%)', accent1: '#f472b6', accent2: '#fbbf24', accent3: 'rgba(244,114,182,0.4)' },
  { key: 'sunset', name: '日暮', dotColor: '#f59e0b', starHue: [30, 15], bgGrad: 'radial-gradient(ellipse at 50% 30%, #1a1008 0%, #0d0804 70%)', accent1: '#f59e0b', accent2: '#ef4444', accent3: 'rgba(245,158,11,0.4)' },
  { key: 'ocean', name: '深海', dotColor: '#06b6d4', starHue: [195, 220], bgGrad: 'radial-gradient(ellipse at 50% 30%, #061220 0%, #020810 70%)', accent1: '#06b6d4', accent2: '#3b82f6', accent3: 'rgba(6,182,212,0.4)' },
]

const currentTheme = ref('cyberpunk')
const currentThemeObj = computed(() => themes.find(t => t.key === currentTheme.value))
const currentThemeName = computed(() => currentThemeObj.value?.name || '')
const nextThemeKey = computed(() => {
  const idx = themes.findIndex(t => t.key === currentTheme.value)
  return themes[(idx + 1) % themes.length].key
})

const cycleTheme = () => {
  const idx = themes.findIndex(t => t.key === currentTheme.value)
  const nextIdx = (idx + 1) % themes.length
  setTheme(themes[nextIdx].key)
}

const setTheme = (key) => {
  if (key === currentTheme.value) return
  currentTheme.value = key
  nextTick(() => {
    animateThemeSwitch()
    updateStarColors()
  })
}

const updateStarColors = () => {
  const theme = currentThemeObj.value
  if (!theme) return
  stars.forEach(s => {
    s.hue = theme.starHue[0] + Math.random() * (theme.starHue[1] - theme.starHue[0])
  })
}

// --- 数据 ---
const lyrics = ref([])
const currentLyricIndex = ref(-1)
const isLoading = ref(false)
const lyricWordProgress = ref(0)
const lyricProgress = ref(0)

const musicId = computed(() => currentSong.value?.id || route.params.id || route.query.id)
const progressPercentage = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

// --- DOM refs ---
const pageRef = ref(null)
const canvasRef = ref(null)
const auraRef = ref(null)
const ringsRef = ref(null)
const headerRef = ref(null)
const headerSongRef = ref(null)
const scrollRef = ref(null)
const progressBarRef = ref(null)
const fsStageRef = ref(null)
const fsCardRef = ref(null)
const fsPrevRef = ref(null)
const fsCurrentRef = ref(null)
const fsNextRef = ref(null)
const vinylRef = ref(null)
const particleRingRef = ref(null)
const ringDots = ref([])
const lineRefs = ref([])
const themeSwitcherRef = ref(null)

// --- 空状态（无歌词）refs ---
const emptyStateRef = ref(null)
const emptyVisualRef = ref(null)
const emptyIconRef = ref(null)
const emptyNotesRef = ref(null)
const emptyTextRef = ref(null)
const emptyWaveRef = ref(null)
const emptyRippleRef = ref(null)
const waveBarEls = ref([])
const noteEls = ref([])
// 全屏空状态 refs
const fseVinylRef = ref(null)
const fseOrbitRef = ref(null)
const fseCardRef = ref(null)
const orbitDotEls = ref([])

// --- 星空背景 ---
let starCtx = null
let starAnimId = null
let stars = []

const initStars = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  starCtx = canvas.getContext('2d')
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)
  const theme = currentThemeObj.value
  stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.2,
    speed: Math.random() * 0.35 + 0.04,
    opacity: Math.random() * 0.7 + 0.1,
    flicker: Math.random() * Math.PI * 2,
    flickerSpeed: Math.random() * 0.025 + 0.004,
    hue: theme ? theme.starHue[0] + Math.random() * (theme.starHue[1] - theme.starHue[0]) : 190,
  }))
}

const drawStars = () => {
  if (!starCtx || !canvasRef.value) return
  const { width, height } = canvasRef.value
  starCtx.clearRect(0, 0, width, height)
  stars.forEach(s => {
    s.y -= s.speed
    if (s.y < -5) { s.y = height + 5; s.x = Math.random() * width }
    s.flicker += s.flickerSpeed
    const alpha = s.opacity * (0.5 + 0.5 * Math.sin(s.flicker))
    starCtx.beginPath()
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    starCtx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${alpha})`
    starCtx.fill()
    if (s.r > 1) {
      starCtx.beginPath()
      starCtx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2)
      starCtx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${alpha * 0.12})`
      starCtx.fill()
    }
  })
  starAnimId = requestAnimationFrame(drawStars)
}

// --- GSAP 动画: 歌词行首次加载交错入场 ---
let lyricsEntranceTl = null
const animateLyricsEntrance = () => {
  if (!lineRefs.value.length) return
  if (lyricsEntranceTl) lyricsEntranceTl.kill()
  gsap.set(lineRefs.value.filter(Boolean), { opacity: 0, y: 20, scale: 0.95 })
  lyricsEntranceTl = gsap.to(lineRefs.value.filter(Boolean), {
    opacity: 1, y: 0, scale: 1,
    duration: 0.5, stagger: { each: 0.04, from: 'start' },
    ease: 'power3.out'
  })
}

// --- GSAP 动画: 歌词行切换 ---
let prevActiveIdx = -1
const animateLyricChange = async (newIdx) => {
  if (newIdx === prevActiveIdx) return
  const oldIdx = prevActiveIdx
  prevActiveIdx = newIdx
  await nextTick()

  if (!isLyricsFullscreen.value) {
    // 当前行弹入 + 光扫
    if (lineRefs.value[newIdx]) {
      const el = lineRefs.value[newIdx]
      gsap.fromTo(el, { backgroundColor: 'rgba(255,255,255,0)' }, { backgroundColor: 'rgba(255,255,255,0.04)', duration: 1.0, ease: 'power2.out' })
      gsap.fromTo(el, { scale: 0.97, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' })
      const dot = el.querySelector('.lri-dot')
      if (dot) gsap.timeline().to(dot, { scale: 3, duration: 0.2, ease: 'power2.out' }).to(dot, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
    }
    // 旧行淡出
    if (oldIdx >= 0 && lineRefs.value[oldIdx]) {
      gsap.to(lineRefs.value[oldIdx], { opacity: 0.3, duration: 0.5, ease: 'power2.out' })
    }
  }

  if (isLyricsFullscreen.value) {
    // 卡片整体微动
    if (fsCardRef.value) {
      gsap.fromTo(fsCardRef.value, { scale: 0.96, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' })
    }
    // 当前句从下方弹入
    if (fsCurrentRef.value) {
      gsap.fromTo(fsCurrentRef.value, { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' })
      // 下划线展开
      const underline = fsCurrentRef.value.querySelector('.fscc-underline')
      if (underline) gsap.fromTo(underline, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out', delay: 0.15 })
    }
    // 粒子环跳动
    if (ringDots.value.length && isPlaying.value) {
      gsap.to(ringDots.value.filter(Boolean), { scale: 1.6, duration: 0.3, stagger: { each: 0.03, from: 'random' }, yoyo: true, repeat: 1, ease: 'power2.out' })
    }
  }
}

// --- GSAP: 主题切换 ---
const animateThemeSwitch = () => {
  if (!pageRef.value) return
  const tl = gsap.timeline()
  tl.to(pageRef.value, { filter: 'brightness(1.25)', duration: 0.12, ease: 'power2.out' })
  tl.to(pageRef.value, { filter: 'brightness(1)', duration: 0.5, ease: 'power2.inOut' })
  if (auraRef.value) tl.fromTo(auraRef.value, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' }, '-=0.3')
  if (ringsRef.value) tl.fromTo(ringsRef.value, { rotation: -20, opacity: 0.3 }, { rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.4')
}

// --- GSAP: 全屏进入 ---
const animateFullscreenEnter = () => {
  const tl = gsap.timeline()
  // 唱片旋转入场
  if (vinylRef.value) tl.from(vinylRef.value, { scale: 0, rotation: -120, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0)
  // 粒子环展开
  if (particleRingRef.value) tl.from(particleRingRef.value, { scale: 0.5, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.2)
  // 玻璃卡片弹出
  if (fsCardRef.value) tl.from(fsCardRef.value, { y: 80, opacity: 0, scale: 0.85, duration: 0.8, ease: 'back.out(1.7)' }, 0.3)
  // 当前句飞入
  if (fsCurrentRef.value) {
    tl.from(fsCurrentRef.value, { y: 40, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.5)
    const ul = fsCurrentRef.value.querySelector('.fscc-underline')
    if (ul) tl.from(ul, { scaleX: 0, duration: 0.5, ease: 'power3.out' }, 0.7)
  }
  // 粒子环旋转
  if (ringDots.value.length) {
    tl.to(ringDots.value.filter(Boolean), { rotation: 360, duration: 20, ease: 'none', repeat: -1 }, 0)
  }
}

// --- GSAP: 行悬停效果 ---
const addLyricHoverEffects = () => {
  lineRefs.value.forEach(el => {
    if (!el || el.dataset.hoverOn) return
    el.dataset.hoverOn = '1'
    el.addEventListener('mouseenter', () => { gsap.to(el, { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.04)', duration: 0.25, ease: 'power2.out' }) })
    el.addEventListener('mouseleave', () => { gsap.to(el, { scale: 1, backgroundColor: 'rgba(255,255,255,0)', duration: 0.3, ease: 'power2.out' }) })
  })
}

// --- GSAP: 新歌加载后行入场 ---
const animateNewSongLyrics = () => {
  nextTick(() => {
    if (lyricsEntranceTl) lyricsEntranceTl.kill()
    const els = lineRefs.value.filter(Boolean)
    if (!els.length) return
    gsap.set(els, { opacity: 0, y: 15, scale: 0.96 })
    lyricsEntranceTl = gsap.to(els, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.45, stagger: { each: 0.03, from: 'start' },
      ease: 'back.out(1.5)',
      onComplete: () => addLyricHoverEffects()
    })
  })
}

// ==================== 空状态（无歌词）动画 ====================

// --- 声波条动画 ---
let waveAnimTimer = null
const animateWaveBars = () => {
  if (!waveBarEls.value.length) return
  const bars = waveBarEls.value.filter(Boolean)
  if (!bars.length) return
  gsap.to(bars, {
    scaleY: () => {
      const base = 0.06
      const amp = isPlaying.value ? 0.88 : 0.25
      // 中心高两边低的弧形分布
      return base + Math.random() * amp
    },
    duration: isPlaying.value ? 0.32 : 0.55,
    ease: 'power2.inOut',
    stagger: { each: 0.012, from: 'center' }
  })
}

const startWaveBars = () => {
  if (waveAnimTimer) return
  animateWaveBars()
  waveAnimTimer = setInterval(animateWaveBars, isPlaying.value ? 340 : 600)
}

const stopWaveBars = () => {
  if (waveAnimTimer) { clearInterval(waveAnimTimer); waveAnimTimer = null }
  if (waveBarEls.value.length) {
    gsap.to(waveBarEls.value.filter(Boolean), { scaleY: 0.04, duration: 0.45, ease: 'power3.out' })
  }
}

// --- 浮动音符动画 ---
let noteTweens = []
const animateFloatingNotes = () => {
  cleanupNoteTweens()
  const notes = noteEls.value.filter(Boolean)
  if (!notes.length) return

  notes.forEach((note, i) => {
    initNotePosition(note, i)
    scheduleNoteFloat(note, i)
  })
}

const initNotePosition = (note) => {
  gsap.set(note, {
    left: 5 + Math.random() * 90 + '%',
    top: 55 + Math.random() * 45 + '%',
    opacity: 0.08 + Math.random() * 0.22,
    scale: 0.45 + Math.random() * 0.5,
    rotation: -20 + Math.random() * 40
  })
}

const scheduleNoteFloat = (note, i) => {
  const duration = 3 + Math.random() * 4
  const t = gsap.to(note, {
    top: -8 + Math.random() * 8 + '%',
    left: () => {
      const cur = parseFloat(note.style.left) || 50
      return Math.max(2, Math.min(95, cur + (-12 + Math.random() * 24))) + '%'
    },
    opacity: 0,
    scale: 0.15,
    rotation: () => (gsap.getProperty(note, 'rotation') || 0) + (-15 + Math.random() * 30),
    duration,
    ease: 'power1.in',
    delay: i * 0.35,
    onComplete: () => {
      initNotePosition(note)
      const nt = scheduleNoteFloat(note, i)
      const idx = noteTweens.findIndex(t => t._ni === i)
      if (idx >= 0) noteTweens[idx] = nt
    }
  })
  t._ni = i
  noteTweens.push(t)
}

const cleanupNoteTweens = () => {
  noteTweens.forEach(t => { try { t.kill() } catch {} })
  noteTweens = []
}

// --- 空状态入场动画 ---
let emptyEntranceTl = null
const animateEmptyStateEnter = () => {
  if (emptyEntranceTl) emptyEntranceTl.kill()
  const tl = gsap.timeline()

  // 轨道环依次展开
  if (emptyVisualRef.value) {
    const rings = emptyVisualRef.value.querySelectorAll('.els-orbit-ring')
    tl.from(rings, { scale: 0, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'elastic.out(1, 0.4)' }, 0)
  }

  // 中心图标弹入
  if (emptyIconRef.value) {
    tl.from(emptyIconRef.value, { scale: 0, rotation: -60, opacity: 0, duration: 0.7, ease: 'back.out(1.7)' }, 0.15)
    // 光晕渐显
    const glow = emptyIconRef.value.querySelector('.els-icon-glow')
    if (glow) tl.from(glow, { opacity: 0, scale: 0.5, duration: 0.6, ease: 'power2.out' }, 0.3)
  }

  // 文字区从下方淡入
  if (emptyTextRef.value) {
    tl.from(emptyTextRef.value, { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.4)
  }

  // 声波条依次升起
  if (emptyWaveRef.value) {
    const bars = waveBarEls.value.filter(Boolean)
    if (bars.length) {
      gsap.set(bars, { scaleY: 0.04 })
      tl.to(bars, { scaleY: 1, duration: 0.5, stagger: { each: 0.02, from: 'center' }, ease: 'power3.out' }, 0.25)
    }
  }

  // 底部波纹
  if (emptyRippleRef.value) {
    const lines = emptyRippleRef.value.querySelectorAll('.els-br-line')
    tl.from(lines, { scaleX: 0, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, 0.45)
  }

  emptyEntranceTl = tl
}

// --- 空状态持续动画（光环旋转 + 图标浮动） ---
let emptyAmbientTl = null
const animateEmptyAmbient = () => {
  if (emptyAmbientTl) emptyAmbientTl.kill()
  if (!emptyVisualRef.value) return
  const tl = gsap.timeline({ repeat: -1 })

  // 轨道环旋转
  const rings = emptyVisualRef.value.querySelectorAll('.els-orbit-ring')
  if (rings.length) {
    tl.to(rings[0], { rotation: 360, duration: 20, ease: 'none' }, 0)
    if (rings[1]) tl.to(rings[1], { rotation: -360, duration: 30, ease: 'none' }, 0)
    if (rings[2]) tl.to(rings[2], { rotation: 360, duration: 25, ease: 'none' }, 0)
  }

  // 图标柔和浮动
  if (emptyIconRef.value) {
    tl.to(emptyIconRef.value, { y: -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
  }

  emptyAmbientTl = tl
}

// --- 全屏空状态入场动画 ---
let fseEntranceTl = null
const animateFullscreenEmptyEnter = () => {
  nextTick(() => {
    if (fseEntranceTl) fseEntranceTl.kill()
    const tl = gsap.timeline()

    // 唱片旋转入场
    if (fseVinylRef.value) {
      tl.from(fseVinylRef.value, { scale: 0, rotation: -150, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0)
    }

    // 轨道粒子展开
    if (fseOrbitRef.value) {
      tl.from(fseOrbitRef.value, { scale: 0.3, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
    }

    // 玻璃卡片弹出
    if (fseCardRef.value) {
      tl.from(fseCardRef.value, { y: 60, opacity: 0, scale: 0.85, duration: 0.7, ease: 'back.out(1.7)' }, 0.35)
    }

    // 轨道粒子持续旋转
    if (orbitDotEls.value.length) {
      orbitDotEls.value.filter(Boolean).forEach((dot, i) => {
        const angle = (i / orbitDotEls.value.length) * Math.PI * 2 - Math.PI / 2
        const r = 200
        dot.style.left = (50 + Math.cos(angle) * r / 4) + '%'
        dot.style.top = (50 + Math.sin(angle) * r / 4) + '%'
      })
      tl.to(orbitDotEls.value.filter(Boolean), {
        rotation: 360,
        duration: 18,
        ease: 'none',
        repeat: -1,
        transformOrigin: '50% 50%'
      }, 0.3)
    }

    fseEntranceTl = tl
  })
}

// --- 监听播放状态切换声波动画节奏 ---
watch(isPlaying, (v) => {
  if (lyrics.value.length > 0) return // 有歌词时不处理
  if (v) {
    // 重启动画以匹配播放节奏
    if (waveAnimTimer) { clearInterval(waveAnimTimer); waveAnimTimer = null }
    startWaveBars()
    // 音符浮动加速
    cleanupNoteTweens()
    nextTick(() => animateFloatingNotes())
  } else {
    if (waveAnimTimer) { clearInterval(waveAnimTimer); waveAnimTimer = null }
    waveAnimTimer = setInterval(animateWaveBars, 600)
  }
})

const updateWordProgress = () => {
  if (!lyrics.value.length || currentLyricIndex.value < 0) { lyricWordProgress.value = 0; return }
  const cur = lyrics.value[currentLyricIndex.value]
  const next = lyrics.value[currentLyricIndex.value + 1]
  if (!next) { lyricWordProgress.value = 100; return }
  const elapsed = currentTime.value - cur.time
  const total = next.time - cur.time
  lyricWordProgress.value = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100
  const firstTime = lyrics.value[0]?.time || 0
  const lastTime = lyrics.value[lyrics.value.length - 1]?.time || duration.value || 1
  lyricProgress.value = lastTime > firstTime ? ((currentTime.value - firstTime) / (lastTime - firstTime)) * 100 : 0
}

const scrollToCurrentLyric = async () => {
  await nextTick()
  if (!scrollRef.value || currentLyricIndex.value < 0) return
  const el = lineRefs.value[currentLyricIndex.value]
  if (!el) return
  const target = el.offsetTop - scrollRef.value.clientHeight / 2 + el.offsetHeight / 2
  gsap.to(scrollRef.value, { scrollTop: target, duration: 0.5, ease: 'power2.inOut' })
}

const updateCurrentLyric = () => {
  if (!lyrics.value.length) return
  let idx = -1
  for (let i = 0; i < lyrics.value.length; i++) { if (currentTime.value >= lyrics.value[i].time) idx = i; else break }
  if (idx !== currentLyricIndex.value) { currentLyricIndex.value = idx; animateLyricChange(idx); scrollToCurrentLyric() }
  updateWordProgress()
}

const seekToTime = (time) => { audioStore.setCurrentTime(time); if (!isPlaying.value && currentSong.value) audioStore.playSong(currentSong.value) }
const seekToPosition = (e) => { if (!duration.value) return; const r = e.currentTarget.getBoundingClientRect(); audioStore.setCurrentTime(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration.value) }
const toggleFullscreen = () => {
  const nv = !isLyricsFullscreen.value
  audioStore.setLyricsFullscreen(nv)
  if (nv) {
    nextTick(() => {
      if (lyrics.value.length === 0 && !isLoading.value) {
        animateFullscreenEmptyEnter()
      } else {
        animateFullscreenEnter()
      }
    })
  }
}
const goBack = () => router.go(-1)
const formatTime = (s) => { if (typeof s !== 'number' || isNaN(s)) return '00:00'; const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}` }

const fetchLyrics = async () => {
  const id = currentSong.value?.id || route.params.id || route.query.id
  if (!id) return
  isLoading.value = true
  try {
    const res = await getLyrics(id)
    if (Array.isArray(res)) lyrics.value = res
    else if (res?.data && Array.isArray(res.data)) lyrics.value = res.data
    else if (res?.data?.data && Array.isArray(res.data.data)) lyrics.value = res.data.data
    else lyrics.value = []
  } catch { lyrics.value = [] }
  finally {
    isLoading.value = false; prevActiveIdx = -1; currentLyricIndex.value = -1
    nextTick(() => {
      if (lyrics.value.length) {
        animateNewSongLyrics()
        stopWaveBars()
        cleanupNoteTweens()
        if (emptyAmbientTl) { emptyAmbientTl.kill(); emptyAmbientTl = null }
      } else {
        initEmptyStateAnimations()
      }
    })
  }
}

// --- 初始化空状态所有动画 ---
const initEmptyStateAnimations = () => {
  nextTick(() => {
    animateEmptyStateEnter()
    animateEmptyAmbient()
    if (!isLyricsFullscreen.value) {
      startWaveBars()
      animateFloatingNotes()
    }
  })
}

const handleKeydown = (e) => { if (e.key === 'Escape' && isLyricsFullscreen.value) audioStore.setLyricsFullscreen(false) }

watch(currentTime, updateCurrentLyric)
watch(() => currentSong.value?.id, (n, o) => { if (n && n !== o) fetchLyrics() }, { immediate: true })
watch(musicId, (n, o) => { if (n && n !== o && !currentSong.value?.id) fetchLyrics() }, { immediate: true })

onMounted(() => {
  fetchLyrics()
  initStars()
  drawStars()
  window.addEventListener('keydown', handleKeydown)
  // 初始化粒子环位置
  nextTick(() => {
    ringDots.value.filter(Boolean).forEach((dot, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const r = 158
      dot.style.left = (160 + Math.cos(angle) * r) + 'px'
      dot.style.top = (160 + Math.sin(angle) * r) + 'px'
    })
  })
  nextTick(() => {
    if (headerRef.value) gsap.from(headerRef.value, { y: -30, opacity: 0, duration: 0.5, ease: 'power3.out' })
    if (auraRef.value) gsap.from(auraRef.value, { opacity: 0, duration: 1, ease: 'power2.out' })
    if (ringsRef.value) {
      gsap.fromTo(ringsRef.value, { rotation: -45, opacity: 0, scale: 0.9 }, { rotation: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' })
    }
    if (lyrics.value.length) {
      animateLyricsEntrance()
      addLyricHoverEffects()
    } else if (!isLoading.value) {
      // 初始化空状态动画
      initEmptyStateAnimations()
    }
  })
})

onUnmounted(() => {
  audioStore.setLyricsFullscreen(false)
  if (starAnimId) cancelAnimationFrame(starAnimId)
  window.removeEventListener('keydown', handleKeydown)
  // 清理空状态动画
  stopWaveBars()
  cleanupNoteTweens()
  if (emptyEntranceTl) emptyEntranceTl.kill()
  if (emptyAmbientTl) emptyAmbientTl.kill()
  if (fseEntranceTl) fseEntranceTl.kill()
})
</script>

<style scoped>
/* ===================== 主题变量 ===================== */
.lyrics-page {
  --accent1: v-bind('currentThemeObj?.accent1 ?? "#00ffff"');
  --accent2: v-bind('currentThemeObj?.accent2 ?? "#d946ef"');
  --accent3: v-bind('currentThemeObj?.accent3 ?? "rgba(0,255,255,0.4)"');
  --bg-grad: v-bind('currentThemeObj?.bgGrad ?? "radial-gradient(ellipse at 50% 30%, #0d1128 0%, #06060f 70%)"');
}

/* ===================== 基础 ===================== */
.lyrics-page {
  position: fixed; inset: 0;
  background: var(--bg-grad);
  color: #e8e8f0;
  display: flex; flex-direction: column;
  overflow: hidden;
  z-index: 1003;
  font-family: 'SF Pro Display', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transition: background 0.6s ease;
}

/* ===================== 主题: 极光 - 特殊背景动画 ===================== */
.theme-aurora .aura-1 { background: radial-gradient(circle, rgba(34,211,238,0.25), transparent); animation: auroraFlow 8s ease-in-out infinite; }
.theme-aurora .aura-2 { background: radial-gradient(circle, rgba(129,140,248,0.2), transparent); animation: auroraFlow 8s ease-in-out infinite 3s; }
.theme-aurora .aura-3 { background: radial-gradient(circle, rgba(52,211,153,0.18), transparent); animation: auroraFlow 8s ease-in-out infinite 6s; }

@keyframes auroraFlow {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
  25% { transform: translate(60px, -30px) scale(1.1); opacity: 0.25; }
  50% { transform: translate(-40px, -60px) scale(1.3); opacity: 0.2; }
  75% { transform: translate(-80px, -20px) scale(1.15); opacity: 0.18; }
}

/* ===================== 主题: 霓虹 ===================== */
.theme-neon .lyric-row.active .lri-dot { box-shadow: 0 0 6px var(--accent1); }
.theme-neon .lyric-row.active { box-shadow: none; }

/* ===================== 主题: 日暮 ===================== */
.theme-sunset .aura-1 { background: radial-gradient(circle, rgba(245,158,11,0.3), transparent); }
.theme-sunset .aura-2 { background: radial-gradient(circle, rgba(239,68,68,0.25), transparent); }

/* ===================== 主题: 深海 ===================== */
.theme-ocean .aura-1 { background: radial-gradient(circle, rgba(6,182,212,0.2), transparent); animation: oceanPulse 6s ease-in-out infinite; }
.theme-ocean .aura-2 { background: radial-gradient(circle, rgba(59,130,246,0.15), transparent); animation: oceanPulse 6s ease-in-out infinite 2s; }
.theme-ocean .aura-3 { background: radial-gradient(circle, rgba(6,182,212,0.1), transparent); animation: oceanPulse 6s ease-in-out infinite 4s; }

@keyframes oceanPulse {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.15); opacity: 0.22; }
}

/* ===================== 星空背景 ===================== */
.starfield { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

/* ===================== 律动光晕 ===================== */
.aura-container { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.aura { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; transition: opacity 0.6s ease; }
.aura.pulse { animation: auraPulse 3s ease-in-out infinite; }

.aura-1 { width: 500px; height: 500px; top: -10%; left: -15%; background: radial-gradient(circle, var(--accent3), transparent); }
.aura-2 { width: 400px; height: 400px; bottom: -10%; right: -10%; background: radial-gradient(circle, var(--accent2), transparent); animation-delay: 1.5s; }
.aura-3 { width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, var(--accent3), transparent); animation-delay: 3s; }

@keyframes auraPulse {
  0%, 100% { transform: scale(1); opacity: 0.12; }
  50% { transform: scale(1.2); opacity: 0.22; }
}

/* ===================== 装饰环 ===================== */
.deco-rings { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.deco-ring { position: absolute; border: 1px solid rgba(255,255,255,0.03); border-radius: 50%; }
.deco-ring.spin { animation: decoSpin 20s linear infinite; }
.deco-ring.spin.reverse { animation-direction: reverse; }
@keyframes decoSpin { to { transform: rotate(360deg); } }
.r1 { width: 700px; height: 700px; top: -200px; left: -150px; border-color: var(--accent3); }
.r2 { width: 500px; height: 500px; bottom: -100px; right: -80px; border-color: rgba(255,255,255,0.03); }

/* ===================== 普通模式 ===================== */
.normal-mode { position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; }

.lyrics-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 28px;
  background: rgba(10,10,30,0.5); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--accent3);
  flex-shrink: 0; z-index: 2; gap: 12px;
}

.hdr-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px; color: rgba(255,255,255,0.8);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.25s ease; backdrop-filter: blur(8px); white-space: nowrap;
}
.hdr-btn:hover { background: rgba(255,255,255,0.08); border-color: var(--accent3); color: #fff; transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent3); }

.header-actions-row { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* 主题切换按钮 */
.theme-dot {
  display: inline-block; width: 10px; height: 10px; border-radius: 50%;
  background: var(--accent1); box-shadow: 0 0 6px var(--accent1);
}
.theme-label { font-size: 11px; color: rgba(255,255,255,0.5); }

.header-song { text-align: center; flex: 1; margin: 0 8px; min-width: 0; }
.hs-title { margin: 0; font-size: 20px; font-weight: 700; background: linear-gradient(135deg, var(--accent1), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hs-artist { margin: 2px 0 0; font-size: 13px; color: rgba(255,255,255,0.45); }

.lyric-progress-bar { flex-shrink: 0; z-index: 2; padding: 0 28px; }
.lpb-track { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; }
.lpb-fill { height: 100%; background: linear-gradient(90deg, var(--accent1), var(--accent2)); border-radius: 2px; transition: width 0.3s ease; }

.lyrics-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px 28px 40px; }
.lyric-list { max-width: 850px; margin: 0 auto; }
.lyric-list-spacer { height: 45vh; }

.lyric-row {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 18px; margin: 4px 0; border-radius: 14px;
  cursor: pointer; transition: all 0.4s ease; position: relative;
}
.lyric-row:hover { background: rgba(255,255,255,0.03); }
.lyric-row.passed { opacity: 0.3; }
.lyric-row.upcoming { opacity: 0.45; }
.lyric-row.active {
  opacity: 1; background: transparent;
  box-shadow: none;
}

.lr-indicator { display: flex; flex-direction: column; align-items: center; width: 8px; flex-shrink: 0; }
.lri-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: all 0.3s ease; }
.lyric-row.active .lri-dot { background: var(--accent1); }
.lri-line { width: 1px; flex: 1; min-height: 30px; background: rgba(255,255,255,0.04); margin-top: 6px; }
.lyric-row:last-child .lri-line { display: none; }
.lyric-row.active .lri-line { background: var(--accent3); }
.lyric-row.passed .lri-line { background: rgba(255,255,255,0.04); }

.lr-text-wrap { flex: 1; position: relative; min-width: 0; }
.lr-text-single { font-size: 17px; line-height: 1.6; white-space: pre-wrap; display: block; color: rgba(255,255,255,0.45); transition: all 0.3s ease; }
.lyric-row.active .lr-text-single { color: #fff; font-weight: 600; font-size: 18px; }

.lr-time { font-size: 11px; font-family: 'SF Mono', 'Cascadia Code', monospace; color: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 12px; background: rgba(255,255,255,0.03); opacity: 0; transform: translateX(8px); transition: all 0.3s ease; flex-shrink: 0; cursor: pointer; }
.lyric-row:hover .lr-time, .lyric-row.active .lr-time { opacity: 1; transform: translateX(0); }
.lr-time:hover { background: rgba(255,255,255,0.06); color: var(--accent1); }

/* 状态占位 */
.state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; color: rgba(255,255,255,0.4); font-size: 14px; }
.spinner-ring { width: 36px; height: 36px; margin-bottom: 16px; }
.spinner-ring div { width: 100%; height: 100%; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--accent1); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { margin-bottom: 12px; color: rgba(255,255,255,0.1); }

/* ===================== 空状态（无歌词）= 普通模式 ===================== */
.empty-lyrics-state {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  padding: 20px 28px 40px;
  gap: 24px;
}

/* --- 声波可视化条 --- */
.els-wave-container {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 60px;
  display: flex; align-items: flex-end; justify-content: center;
  gap: 2px; padding: 0 20px;
  opacity: 0.3; pointer-events: none; z-index: 0;
}

.els-wave-bar {
  flex: 1; max-width: 14px; min-width: 3px;
  height: 100%;
  background: linear-gradient(to top, var(--accent1), var(--accent2));
  border-radius: 2px 2px 0 0;
  transform-origin: bottom; transform: scaleY(0.04);
  opacity: 0.6;
}

/* --- 中心视觉区 --- */
.els-visual {
  position: relative;
  width: 220px; height: 220px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1;
}

/* 三层轨道环 */
.els-orbit-ring {
  position: absolute; inset: 0;
  border: 1px solid var(--accent3);
  border-radius: 50%;
  opacity: 0.25;
  pointer-events: none;
}
.els-or-2 { inset: 25px; opacity: 0.18; border-color: rgba(255,255,255,0.06); }
.els-or-3 { inset: 50px; opacity: 0.12; border-color: var(--accent3); border-style: dashed; }

/* 中心音符图标 */
.els-icon-wrap {
  position: relative; z-index: 2;
  width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
}

.els-icon {
  width: 64px; height: 64px;
  position: relative; z-index: 2;
}

.els-icon-glow {
  position: absolute; inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent3) 0%, transparent 70%);
  opacity: 0.5; z-index: 0;
  animation: iconGlowPulse 3s ease-in-out infinite;
}

@keyframes iconGlowPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.65; transform: scale(1.2); }
}

/* 浮动音符 */
.els-floating-notes {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 3;
}

.els-fn {
  position: absolute;
  font-size: 18px; color: var(--accent1);
  opacity: 0;
  text-shadow: 0 0 8px var(--accent3);
  pointer-events: none;
}

/* --- 文字区 --- */
.els-text {
  text-align: center; z-index: 1;
}

.els-title {
  margin: 0;
  font-size: 24px; font-weight: 700;
  background: linear-gradient(135deg, var(--accent1), #fff 50%, var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.els-subtitle {
  margin: 10px 0 0;
  font-size: 14px; color: rgba(255,255,255,0.3);
  font-weight: 400; letter-spacing: 1px;
}

/* --- 底部扩散波纹 --- */
.els-bottom-ripple {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  z-index: 0; pointer-events: none;
}

.els-br-line {
  width: 200px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent3), transparent);
  border-radius: 1px;
}
.els-br-line:nth-child(2) { width: 140px; opacity: 0.6; }
.els-br-line:nth-child(3) { width: 90px; opacity: 0.3; }

/* ===================== 空状态（无歌词）= 全屏模式 ===================== */
.fs-empty-state {
  position: relative; z-index: 1;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
}

/* 唱片区域 */
.fse-vinyl-stage {
  position: relative;
  width: 280px; height: 280px;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}

.fse-vinyl-disc {
  width: 260px; height: 260px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #1a1a2e 0%, #252545 10%, #1a1a2e 20%, #252545 30%, #1a1a2e 40%, #252545 50%, #1a1a2e 60%, #252545 70%, #1a1a2e 80%, #252545 90%, #1a1a2e 100%);
  position: relative;
  display: flex; align-items: center; justify-content: center;
  box-shadow:
    0 0 60px rgba(0,0,0,0.4),
    0 0 100px var(--accent3);
  transition: box-shadow 0.8s ease;
}

.fse-vinyl-disc.spinning {
  animation: fseVinylSpin 3s linear infinite;
}
.fse-vinyl-disc:not(.spinning) {
  box-shadow: 0 0 40px rgba(0,0,0,0.4), 0 0 40px var(--accent3);
}

@keyframes fseVinylSpin { to { transform: rotate(360deg); } }

/* 唱片沟槽 */
.fse-vinyl-groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.04);
  inset: calc(var(--g) * 10px);
  pointer-events: none;
}

/* 唱片标签 */
.fse-vinyl-label {
  width: 90px; height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #1a1a3a, #0a0a1a);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 2;
  border: 2px solid rgba(255,255,255,0.06);
}

.fse-vl-line {
  width: 30px; height: 1px;
  background: var(--accent1);
  margin-bottom: 8px;
  opacity: 0.6;
}

.fse-vl-text {
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-align: center; line-height: 1.5;
  letter-spacing: 2px;
}

/* 声波扩散环 */
.fse-sound-rings {
  position: absolute; inset: -20px;
  pointer-events: none; z-index: 0;
}

.fse-sr {
  position: absolute; inset: 0;
  border: 1px solid var(--accent3);
  border-radius: 50%; opacity: 0;
}

.fse-sr.pulse {
  animation: fseSoundExpand 2s ease-out infinite;
}

@keyframes fseSoundExpand {
  0% { transform: scale(0.8); opacity: 0.4; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* 轨道粒子 */
.fse-orbit {
  position: absolute;
  width: 320px; height: 320px;
  z-index: 1; pointer-events: none;
}

.fse-orbit-dot {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--accent1);
  box-shadow: 0 0 8px var(--accent1);
}

/* 玻璃卡片 */
.fse-card {
  position: relative; z-index: 5;
  margin-top: -20px;
  padding: 28px 48px;
  border-radius: 20px;
  overflow: hidden;
}

.fse-card-bg {
  position: absolute; inset: 0;
  background: rgba(20,20,50,0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
}

.fse-card-content {
  position: relative; z-index: 1;
  text-align: center;
}

.fse-card-icon {
  width: 32px; height: 32px;
  margin: 0 auto 12px;
  color: rgba(255,255,255,0.2);
}

.fse-card-title {
  margin: 0;
  font-size: 18px; font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 2px;
}

.fse-card-sub {
  margin: 8px 0 0;
  font-size: 13px; color: rgba(255,255,255,0.2);
  font-weight: 400; letter-spacing: 1px;
}

/* ===================== 全屏沉浸模式 ===================== */
.fullscreen-mode {
  position: relative; z-index: 1;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
}

/* 唱片圆盘 */
.fs-vinyl {
  position: absolute;
  right: -80px; bottom: -80px;
  width: 500px; height: 500px;
  pointer-events: none; z-index: 0;
  opacity: 0.2;
}

.fs-vinyl-disc {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #111 0%, #1a1a2e 15%, #111 30%, #1a1a2e 45%, #111 60%, #1a1a2e 75%, #111 90%, #1a1a2e 100%);
  display: flex; align-items: center; justify-content: center;
}

.fs-vinyl.spinning .fs-vinyl-disc { animation: vinylSpin 4s linear infinite; }

@keyframes vinylSpin { to { transform: rotate(360deg); } }

.fs-vinyl-label {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent1) 0%, var(--accent2) 100%);
  opacity: 0.5;
}

/* 浮动粒子环 */
.fs-particle-ring {
  position: absolute; z-index: 0;
  width: 320px; height: 320px;
  border-radius: 50%;
  pointer-events: none;
}

.fs-pr-dot {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: var(--accent1);
}

/* 顶部栏 */
.fs-top-bar {
  position: absolute; top: 20px; left: 28px; right: 28px;
  display: flex; align-items: center; justify-content: space-between;
  z-index: 10; opacity: 0.6; transition: opacity 0.4s ease; gap: 12px;
}
.fs-top-bar:hover { opacity: 1; }

.fs-theme-picker { display: flex; gap: 8px; }
.fs-theme-dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--dot-color); border: 2px solid transparent;
  cursor: pointer; transition: all 0.25s ease; opacity: 0.6;
}
.fs-theme-dot:hover { opacity: 1; transform: scale(1.2); }
.fs-theme-dot.active { opacity: 1; border-color: #fff; box-shadow: 0 0 12px var(--dot-color); transform: scale(1.15); }

.fs-song-meta { text-align: right; }
.fsm-title { margin: 0; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); }
.fsm-artist { margin: 1px 0 0; font-size: 12px; color: rgba(255,255,255,0.3); }

/* 歌词卡片舞台 */
.fs-stage {
  display: flex; align-items: center; justify-content: center;
  z-index: 5; width: 100%; max-width: 700px; padding: 0 32px;
}

/* 歌词卡片 */
.fs-card {
  width: 100%;
  padding: 40px 36px;
  display: flex; flex-direction: column; align-items: center;
  gap: 24px;
}

/* 上一句 */
.fsc-prev {
  font-size: 18px; color: rgba(255,255,255,0.2);
  font-weight: 400; text-align: center;
  max-width: 100%; line-height: 1.4;
}

/* 当前句 */
.fsc-current {
  text-align: center; position: relative;
  padding: 8px 0 16px;
}

.fscc-text {
  font-size: 42px; font-weight: 800; line-height: 1.35; letter-spacing: 1px;
  background: linear-gradient(135deg, var(--accent1) 0%, #fff 40%, var(--accent2) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fscc-underline {
  position: absolute; bottom: 0; left: 10%; right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent1), var(--accent2), transparent);
  border-radius: 1px;
  transform-origin: center;
}

/* 下一句 */
.fsc-next {
  font-size: 18px; color: rgba(255,255,255,0.2);
  font-weight: 400; text-align: center;
  max-width: 100%; line-height: 1.4;
}

/* 底部信息 */
.fs-footer {
  position: absolute; bottom: 40px;
  left: 50%; transform: translateX(-50%);
  width: 60%; max-width: 500px;
  z-index: 10; opacity: 0.5;
  transition: opacity 0.4s ease;
}
.fs-footer:hover { opacity: 1; }

.fsf-progress { margin-bottom: 8px; cursor: pointer; }
.fsfp-track {
  width: 100%; height: 3px;
  background: rgba(255,255,255,0.06); border-radius: 2px;
}
.fsfp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent1), var(--accent2));
  border-radius: 2px; transition: width 0.2s ease;
}

.fsf-info {
  display: flex; justify-content: space-between;
  font-size: 11px; font-family: 'SF Mono', monospace;
  color: rgba(255,255,255,0.25);
}
.fsf-time, .fsf-count { }


/* ===================== 滚动条 ===================== */
.lyrics-scroll::-webkit-scrollbar { width: 4px; }
.lyrics-scroll::-webkit-scrollbar-track { background: transparent; }
.lyrics-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
.lyrics-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }

/* ===================== 响应式 ===================== */
@media (max-width: 768px) {
  .lyrics-header { padding: 12px 14px; gap: 6px; }
  .hs-title { font-size: 16px; }
  .hdr-btn { padding: 7px 10px; font-size: 12px; }
  .hdr-btn span { font-size: 11px; }
  /* 主题按钮：保留文字，缩小间距 */
  .theme-btn { padding: 7px 10px; gap: 5px; }
  .theme-dot { width: 8px; height: 8px; }
  .theme-label { font-size: 11px; display: inline; }
  .lyrics-scroll { padding: 16px; }
  .lyric-row { padding: 10px 12px; gap: 10px; }
  .lr-text-single { font-size: 15px; }
  .lyric-row.active .lr-text-single { font-size: 16px; }
  .fs-current { font-size: 32px; }
  .fsc-prev { font-size: 16px; }
  .fsc-next { font-size: 18px; }
  .fs-lyric-stage { max-width: 90vw; gap: 20px; }
  .fs-progress { width: 80%; bottom: 30px; }
  .fs-top-bar { left: 12px; right: 12px; }
  .fs-theme-picker { gap: 10px; }
  .fs-theme-dot { width: 28px; height: 28px; border-width: 2px; }
  .fs-card { padding: 28px 20px; gap: 16px; }
  .fscc-text { font-size: 32px; }
  .fs-vinyl { width: 320px; height: 320px; right: -100px; bottom: -100px; opacity: 0.15; }
  .fs-particle-ring { width: 240px; height: 240px; }
  .fs-footer { width: 80%; bottom: 24px; }
  /* 空状态响应式 */
  .empty-lyrics-state { gap: 16px; }
  .els-visual { width: 170px; height: 170px; }
  .els-icon-wrap { width: 60px; height: 60px; }
  .els-icon { width: 48px; height: 48px; }
  .els-title { font-size: 20px; }
  .els-subtitle { font-size: 12px; }
  .els-wave-container { height: 40px; }
  .fse-vinyl-stage { width: 220px; height: 220px; }
  .fse-vinyl-disc { width: 200px; height: 200px; }
  .fse-vinyl-label { width: 70px; height: 70px; }
  .fse-vl-text { font-size: 9px; }
  .fse-orbit { width: 260px; height: 260px; }
  .fse-card { padding: 22px 36px; }
  .fse-card-title { font-size: 16px; }
}

@media (max-width: 480px) {
  .lyrics-header { padding: 10px 10px; }
  .header-song { margin: 0 4px; }
  .hs-title { font-size: 14px; }
  .hdr-btn { padding: 6px 8px; font-size: 11px; }
  /* 仅隐藏返回和全屏按钮的文字，主题按钮保留 */
  .back-btn span, .fs-btn span { display: none; }
  .theme-label { display: inline; font-size: 10px; }
  .theme-dot { width: 7px; height: 7px; }
  .header-actions-row { gap: 2px; }
  .lyric-row { padding: 8px 10px; border-radius: 10px; }
  .lr-text-single { font-size: 14px; }
  .lyric-row.active .lr-text-single { font-size: 15px; }
  .fscc-text { font-size: 24px; }
  .fsc-prev { font-size: 14px; }
  .fsc-next { font-size: 15px; }
  .fs-top-bar { left: 8px; right: 8px; top: 12px; }
  .fs-theme-picker { gap: 10px; }
  .fs-theme-dot { width: 26px; height: 26px; }
  .fs-card { padding: 20px 16px; gap: 12px; }
  .fs-vinyl { width: 240px; height: 240px; right: -80px; bottom: -80px; opacity: 0.12; }
  .fs-particle-ring { width: 200px; height: 200px; }
  .fs-footer { width: 85%; bottom: 20px; }
  .aura-1, .aura-2, .deco-rings { display: none; }
  /* 空状态响应式 */
  .empty-lyrics-state { gap: 12px; padding: 16px; }
  .els-visual { width: 140px; height: 140px; }
  .els-or-2 { inset: 18px; }
  .els-or-3 { inset: 36px; }
  .els-icon-wrap { width: 50px; height: 50px; }
  .els-icon { width: 40px; height: 40px; }
  .els-icon-glow { inset: -8px; }
  .els-title { font-size: 18px; }
  .els-subtitle { font-size: 11px; }
  .els-wave-container { height: 32px; gap: 1px; padding: 0 10px; }
  .els-fn { font-size: 14px; }
  .els-br-line { width: 140px; }
  .els-br-line:nth-child(2) { width: 100px; }
  .els-br-line:nth-child(3) { width: 60px; }
  .fse-vinyl-stage { width: 180px; height: 180px; }
  .fse-vinyl-disc { width: 160px; height: 160px; }
  .fse-vinyl-label { width: 56px; height: 56px; }
  .fse-vl-text { font-size: 8px; letter-spacing: 1px; }
  .fse-sound-rings { inset: -12px; }
  .fse-orbit { width: 220px; height: 220px; }
  .fse-orbit-dot { width: 3px; height: 3px; }
  .fse-card { padding: 18px 28px; }
  .fse-card-title { font-size: 14px; }
  .fse-card-sub { font-size: 11px; }
}
</style>
