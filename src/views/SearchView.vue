<template>
  <div class="search-page">
    <div class="sp-header">
      <button class="sp-back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="sp-input-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="keyword" type="text" class="sp-input" :placeholder="searchPlaceholder" ref="inputRef" @keyup.enter="doSearch" />
        <button v-if="keyword" class="sp-clear" @click="keyword = ''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l18 18"/></svg>
        </button>
      </div>
      <button class="sp-search-btn" @click="doSearch">搜索</button>
    </div>

    <!-- 搜索源切换 -->
    <div class="sp-source-tabs">
      <button :class="['sp-source-tab', { active: searchSource === 'local' }]" @click="searchSource = 'local'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        本地乐库
      </button>
      <button :class="['sp-source-tab', { active: searchSource === 'external' }]" @click="searchSource = 'external'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        全网搜索
      </button>
    </div>

    <div class="sp-body">
      <div v-if="!keyword" class="sp-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>{{ searchSource === 'external' ? '输入关键词搜索全网音乐' : '输入关键词搜索本地音乐' }}</p>
        <p class="sp-empty-hint" v-if="searchSource === 'external'">搜索范围：网易云音乐</p>
      </div>

      <div v-else-if="loading" class="sp-loading">
        <div class="sp-spinner"></div>
        <p>{{ searchSource === 'external' ? '正在搜索全网音乐...' : '搜索中...' }}</p>
      </div>

      <div v-else-if="results.length === 0" class="sp-empty">
        <p>未找到相关结果</p>
        <p class="sp-empty-hint" v-if="searchSource === 'external'">换个关键词试试，或切换到"本地乐库"</p>
      </div>

      <div v-else class="sp-results">
        <div v-for="music in results" :key="music.id" class="sp-item" @click="playMusic(music)">
          <div class="sp-cover-wrap">
            <img v-if="music.coverUrl || music.coverFileUrl" :src="cleanUrl(music.coverUrl || music.coverFileUrl)" class="sp-cover" @error="(e) => e.target.style.display='none'" />
            <div v-if="!music.coverUrl && !music.coverFileUrl" class="sp-cover-empty">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
            </div>
            <!-- 外部源标记 -->
            <span v-if="music.isExternal" class="sp-source-badge">{{ music.source === 'netease' ? '网易云' : music.source }}</span>
          </div>
          <div class="sp-info">
            <div class="sp-title">{{ music.title }}</div>
            <div class="sp-artist">{{ music.artist }}</div>
          </div>
          <span class="sp-duration" v-if="music.duration">{{ fmtDuration(music.duration) }}</span>
        </div>
      </div>
    </div>
  </div>
  <Toast :visible="showToast" :message="toastMessage" :type="toastType" @close="showToast = false" />
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
defineOptions({ name: 'SearchView' })
import { useRouter } from 'vue-router'
import { getMusicList } from '../api/music'
import { searchExternalMusic, getPlayUrl } from '../api/musicSource'
import { useAudioStore } from '../stores/audio'
import Toast from '@/components/Toast.vue'

const router = useRouter()
const audioStore = useAudioStore()
const keyword = ref('')
const results = ref([])
const loading = ref(false)
const inputRef = ref(null)
const searchSource = ref('local') // 'local' | 'external'

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error')
const showToastMsg = (msg, type = 'error') => {
  toastMessage.value = msg; toastType.value = type; showToast.value = true
}

const searchPlaceholder = computed(() =>
  searchSource.value === 'external' ? '输入歌名，搜索网易云音乐...' : '搜索本地音乐...'
)

const goBack = () => router.go(-1)

const cleanUrl = (url) => url ? url.replace(/[\r\n\t]/g, '').trim() : ''

const fmtDuration = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const doSearch = async () => {
  const kw = keyword.value.trim()
  if (!kw) return
  loading.value = true
  results.value = []

  try {
    if (searchSource.value === 'external') {
      await doExternalSearch(kw)
    } else {
      await doLocalSearch(kw)
    }
  } finally {
    loading.value = false
  }
}

const doLocalSearch = async (kw) => {
  try {
    const res = await getMusicList({ keyword: kw })
    let data = res.data || res
    if (!Array.isArray(data)) data = []

    // 客户端模糊匹配：同时匹配歌名和歌手
    const lowerKw = kw.toLowerCase()
    const fuzzyMatch = (text) => {
      if (!text) return false
      return text.toLowerCase().includes(lowerKw)
    }

    results.value = data
      .filter(Boolean)
      .filter(m => fuzzyMatch(m.title) || fuzzyMatch(m.artist) || fuzzyMatch(m.album))
      .map(m => ({
        id: m.id,
        title: m.title || '未知',
        artist: m.artist || '未知',
        album: m.album || '',
        coverFileUrl: m.coverFileUrl,
        fileUrl: m.fileUrl,
        duration: m.duration,
      }))
  } catch {
    results.value = []
  }
}

const doExternalSearch = async (kw) => {
  try {
    const res = await searchExternalMusic({ keyword: kw, limit: 30 })
    if (res.code === 1 && Array.isArray(res.data)) {
      results.value = res.data
    } else {
      results.value = []
    }
  } catch {
    results.value = []
  }
}

const playMusic = async (music) => {
  // 外部歌曲：先获取播放地址
  if (music.isExternal && music.sourceId) {
    try {
      const res = await getPlayUrl(music.id)
      if (res.code === 1 && res.data?.url) {
        music.url = res.data.url
      } else {
        showToastMsg('暂无版权')
        return
      }
    } catch {
      showToastMsg('暂无版权')
      return
    }
  }

  audioStore.playSong({
    id: music.id,
    title: music.title,
    artist: music.artist,
    url: music.fileUrl || music.url,
    cover: music.coverUrl || music.coverFileUrl,
    duration: music.duration,
  }, results.value)
}

// 切换源时重新搜索
const switchSource = (source) => {
  searchSource.value = source
  if (keyword.value.trim()) doSearch()
}

onMounted(() => nextTick(() => inputRef.value?.focus()))
</script>

<style scoped>
.search-page {
  position: fixed; inset: 0;
  background: linear-gradient(160deg, #080c18, #0f1428, #0a0e1f);
  display: flex; flex-direction: column;
  z-index: 1002;
}

.sp-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  background: rgba(10,10,30,0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.sp-back {
  background: none; border: none;
  color: rgba(255,255,255,0.6); cursor: pointer;
  padding: 4px;
}

.sp-input-wrap {
  flex: 1; display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 12px;
  position: relative;
}
.sp-input-wrap svg { color: rgba(255,255,255,0.3); flex-shrink: 0; }

.sp-input {
  flex: 1; background: none; border: none;
  color: #fff; font-size: 15px; outline: none;
  padding-right: 24px;
}
.sp-input::placeholder { color: rgba(255,255,255,0.3); }

.sp-clear {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer;
  padding: 4px; border-radius: 50%; line-height: 0;
  display: flex; align-items: center; justify-content: center;
}
.sp-clear:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.06); }

.sp-search-btn {
  background: rgba(0,255,255,0.12); border: 1px solid rgba(0,255,255,0.2);
  border-radius: 10px; padding: 8px 14px;
  color: #00ffff; font-size: 14px; font-weight: 500;
  cursor: pointer;
}

.sp-body { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 110px; }

.sp-empty { text-align: center; padding: 80px 20px; color: rgba(255,255,255,0.25); }
.sp-empty svg { margin-bottom: 12px; }
.sp-empty p { font-size: 14px; }

.sp-loading {
  text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.sp-spinner {
  width: 28px; height: 28px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #00ffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 搜索源切换 */
.sp-source-tabs {
  display: flex; gap: 4px;
  padding: 8px 14px;
  background: rgba(10,10,30,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.03);
  flex-shrink: 0;
}
.sp-source-tab {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 7px 0;
  background: none; border: none; border-radius: 8px;
  font-size: 12px; color: rgba(255,255,255,0.35);
  cursor: pointer; transition: all 0.2s;
}
.sp-source-tab.active {
  background: rgba(0,255,255,0.08);
  color: #00ffff;
}
.sp-source-tab:hover:not(.active) { color: rgba(255,255,255,0.6); }

.sp-empty-hint { font-size: 12px; color: rgba(255,255,255,0.15); margin-top: 6px; }

.sp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 12px;
  cursor: pointer; transition: background 0.15s;
}
.sp-item:hover { background: rgba(255,255,255,0.03); }

.sp-cover-wrap { position: relative; flex-shrink: 0; }

.sp-cover, .sp-cover-empty {
  width: 44px; height: 44px; border-radius: 10px;
  object-fit: cover; display: block;
}
.sp-cover-empty {
  background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center;
}

/* 外部源标记 */
.sp-source-badge {
  position: absolute; bottom: -2px; right: -2px;
  padding: 1px 5px; border-radius: 6px;
  background: rgba(236,72,72,0.85);
  color: #fff; font-size: 9px; font-weight: 600;
  line-height: 1.4; white-space: nowrap;
}

.sp-info { flex: 1; min-width: 0; }
.sp-title { font-size: 14px; font-weight: 500; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sp-artist { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.sp-duration {
  font-size: 12px; color: rgba(255,255,255,0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* ==================== 桌面端适配 ==================== */
@media (min-width: 769px) {
  .search-page {
    /* 桌面端不占满全屏，融入主内容区 */
    position: relative;
    height: 100%;
    max-width: 800px;
    margin: 0 auto;
    background: transparent;
    border-radius: 0;
  }

  .sp-header {
    padding: 12px 0;
    background: transparent;
    backdrop-filter: none;
    border-bottom-color: rgba(255,255,255,0.03);
  }

  .sp-input-wrap {
    max-width: 480px;
  }

  .sp-source-tabs {
    background: transparent;
    padding: 8px 0;
  }

  .sp-body {
    padding: 16px 0;
    padding-bottom: 100px;
  }

  .sp-item {
    border-radius: 12px;
    padding: 12px 16px;
  }

  .sp-title { font-size: 15px; }
  .sp-artist { font-size: 13px; }
}
</style>
