<template>
  <div class="ct-page">
    <!-- 分类标签 -->
    <div class="ct-cats">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['ct-cat', { active: activeCatId === cat.id }]"
        @click="selectCat(cat)"
      >
        {{ cat.name }}
        <span class="ct-cat-count">{{ cat.musicCount }}</span>
      </button>
    </div>

    <!-- 当前分类信息 -->
    <div class="ct-header" v-if="currentCat">
      <h2 class="ct-title">{{ currentCat.name }}</h2>
      <span class="ct-desc" v-if="currentCat.description">{{ currentCat.description }}</span>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="ct-grid">
      <div v-for="i in 8" :key="i" class="ct-card ct-skel">
        <div class="ct-card-img skel"></div><div class="ct-card-body"><div class="skel-line w80"></div><div class="skel-line w50"></div></div>
      </div>
    </div>

    <!-- 空 -->
    <div v-else-if="songs.length === 0" class="ct-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      <p>该分类下暂无歌曲</p>
    </div>

    <!-- 歌曲列表 -->
    <div v-else class="ct-grid">
      <div v-for="m in songs" :key="m.id" class="ct-card" @click="playSong(m)">
        <div class="ct-card-img-wrap">
          <img v-if="m.coverFileUrl" :src="cleanUrl(m.coverFileUrl)" class="ct-card-img" />
          <div v-else class="ct-card-img ct-card-img-empty"><svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg></div>
          <div class="ct-card-play"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
        </div>
        <div class="ct-card-body">
          <div class="ct-card-title">{{ m.title }}</div>
          <div class="ct-card-artist">{{ m.artist }}</div>
          <div class="ct-card-dur">{{ fmtDur(m.duration) }}</div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="ct-more">
      <button @click="loadMore" :disabled="loadingMore">{{ loadingMore ? '加载中...' : '加载更多' }}</button>
    </div>

    <!-- 底部更多面板 -->
    <Teleport to="body">
      <Transition name="sheet-slide">
        <div v-if="sheet.visible" class="ct-sheet-overlay" @click="sheet.visible = false">
          <div class="ct-sheet" @click.stop>
            <div class="cts-head">
              <img v-if="sheet.music?.coverFileUrl" :src="cleanUrl(sheet.music.coverFileUrl)" class="cts-cover" />
              <div><b>{{ sheet.music?.title }}</b><span>{{ sheet.music?.artist }}</span></div>
            </div>
            <div class="cts-acts">
              <div @click="sheetAction('play')"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>播放</div>
              <div @click="sheetAction('like')"><svg width="20" height="20" viewBox="0 0 24 24" :fill="isFav(sheet.music?.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>{{ isFav(sheet.music?.id) ? '取消喜欢' : '喜欢' }}</div>
              <div @click="sheetAction('download')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>下载</div>
            </div>
            <div class="cts-cancel" @click="sheet.visible = false">取消</div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Toast :visible="toast.visible" :message="toast.message" :type="toast.type" @close="toast.visible = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { getCategoryList, getCategoryMusic } from '@/api/category'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import { addMusicToFavorites, removeMusicFromFavorites } from '../api/user'
import Toast from '../components/Toast.vue'

const audioStore = useAudioStore()
const userStore = useUserStore()
const { currentSong, isPlaying } = storeToRefs(audioStore)
const { favoriteIds } = storeToRefs(userStore)

const categories = ref([])
const activeCatId = ref(null)
const currentCat = ref(null)
const songs = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const total = ref(0)
const hasMore = ref(false)
const sheet = ref({ visible: false, music: null })
const toast = ref({ visible: false, message: '', type: 'success' })

const playingId = ref(null)
const cleanUrl = (url) => url ? url.replace(/[\r\n\t]/g, '').trim() : ''
const fmtDur = (d) => { if (!d) return ''; const m = Math.floor(d/60); return `${m}:${String(d%60).padStart(2,'0')}` }
const isFav = (id) => favoriteIds.value?.has(id)

const selectCat = async (cat) => {
  activeCatId.value = cat.id; currentCat.value = cat
  page.value = 1; songs.value = []
  await fetchSongs()
}

const fetchSongs = async () => {
  if (!activeCatId.value) return
  loading.value = true
  try {
    const res = await getCategoryMusic(activeCatId.value, page.value, 20)
    if (res.code === 1) {
      songs.value = [...songs.value, ...res.data.list]
      total.value = res.data.total
      hasMore.value = songs.value.length < total.value
    }
  } catch {} finally { loading.value = false }
}

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true; page.value++
  try {
    const res = await getCategoryMusic(activeCatId.value, page.value, 20)
    if (res.code === 1) {
      songs.value = [...songs.value, ...res.data.list]
      hasMore.value = songs.value.length < res.data.total
    }
  } catch {} finally { loadingMore.value = false }
}

const playSong = async (m) => {
  playingId.value = m.id
  await audioStore.playSong({ id: m.id, title: m.title, artist: m.artist, url: m.fileUrl, cover: m.coverFileUrl, duration: m.duration }, songs.value)
}

const openSheet = (m) => { sheet.value = { visible: true, music: m } }

const showToast = (msg, type = 'success') => { toast.value = { visible: true, message: msg, type } }

const sheetAction = async (a) => {
  const m = sheet.value.music; if (!m) return; sheet.value.visible = false
  if (a === 'play') { playSong(m) }
  else if (a === 'like') {
    if (!userStore.isLoggedIn) { showToast('请先登录', 'error'); return }
    try {
      if (isFav(m.id)) { await removeMusicFromFavorites(m.id); userStore.removeFromFavorites(m.id) }
      else { await addMusicToFavorites(m.id); userStore.addToFavorites(m.id); showToast('已喜欢') }
    } catch { showToast('操作失败', 'error') }
  }
  else if (a === 'download') { if (m.fileUrl) window.open(cleanUrl(m.fileUrl), '_blank') }
}

onMounted(async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 1 && res.data?.length) {
      categories.value = res.data.filter(c => c.status === 1)
      if (categories.value.length) await selectCat(categories.value[0])
    }
  } catch {}
})
</script>

<style scoped>
.ct-page { width:100%; height:100%; background:linear-gradient(160deg, #080c18, #0f1428, #0a0e1f); color:#f1f5f9; overflow-y:auto; padding:16px 16px 130px; box-sizing:border-box; }

/* 分类标签 */
.ct-cats { display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; scrollbar-width:none; }
.ct-cats::-webkit-scrollbar { display:none; }
.ct-cat { display:flex; align-items:center; gap:5px; padding:8px 16px; border-radius:20px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.5); font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; flex-shrink:0; }
.ct-cat:hover { border-color:rgba(255,255,255,0.15); }
.ct-cat.active { background:rgba(99,102,241,0.15); border-color:rgba(99,102,241,0.3); color:#818cf8; }
.ct-cat-count { font-size:10px; padding:1px 6px; border-radius:8px; background:rgba(255,255,255,0.06); }
.ct-cat.active .ct-cat-count { background:rgba(99,102,241,0.2); }

/* 头部 */
.ct-header { margin-bottom:14px; }
.ct-title { font-size:18px; font-weight:700; margin:0 0 2px; }
.ct-desc { font-size:12px; color:rgba(255,255,255,0.35); }

/* 骨架 */
.ct-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:14px; }
.ct-card { border-radius:14px; overflow:hidden; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); cursor:pointer; transition:all 0.2s; }
.ct-card:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.1); transform:translateY(-2px); }
.ct-card-img-wrap { position:relative; }
.ct-card-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; }
.ct-card-img-empty { background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; }
.ct-card-play { position:absolute; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; }
.ct-card:hover .ct-card-play { opacity:1; }
.ct-card-body { padding:12px 14px; }
.ct-card-title { font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ct-card-artist { font-size:12px; color:rgba(255,255,255,0.4); margin-top:4px; }
.ct-card-dur { font-size:11px; color:rgba(255,255,255,0.25); margin-top:6px; }
.ct-skel { pointer-events:none; }
.skel { background:rgba(255,255,255,0.04); animation:skPulse 1.5s infinite; }
.skel-line { height:10px; background:rgba(255,255,255,0.04); border-radius:4px; margin-bottom:6px; animation:skPulse 1.5s infinite; }
.w80{width:80%} .w50{width:50%}
@keyframes skPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

/* 底部面板 */
.ct-sheet-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:flex-end; justify-content:center; }
.ct-sheet { width:100%; max-width:500px; max-height:60vh; background:linear-gradient(180deg, #1e1e3a, #14142a); border-radius:20px 20px 0 0; padding:0 0 20px; }
.cts-head { display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.05); }
.cts-head b { font-size:14px; display:block; }
.cts-head span { font-size:11px; color:rgba(255,255,255,0.35); }
.cts-cover { width:44px; height:44px; border-radius:10px; object-fit:cover; }
.cts-acts div { display:flex; align-items:center; gap:14px; padding:15px 24px; font-size:14px; cursor:pointer; }
.cts-acts div:active { background:rgba(255,255,255,0.03); }
.cts-acts svg { color:rgba(255,255,255,0.4); }
.cts-cancel { margin:8px 20px 0; padding:14px; text-align:center; background:rgba(255,255,255,0.04); border-radius:12px; font-size:15px; color:rgba(255,255,255,0.5); cursor:pointer; }
.sheet-slide-enter-active { transition:all 0.3s; }
.sheet-slide-leave-active { transition:all 0.25s; }
.sheet-slide-enter-from .ct-sheet, .sheet-slide-leave-to .ct-sheet { transform:translateY(100%); }
.sheet-slide-enter-from, .sheet-slide-leave-to { opacity:0; }

.ct-empty { text-align:center; padding:60px 20px; color:rgba(255,255,255,0.2); }
.ct-empty p { margin-top:10px; font-size:14px; }
.ct-more { text-align:center; padding:20px 0; }
.ct-more button { padding:10px 32px; border-radius:20px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); font-size:13px; cursor:pointer; }

.ct-page::-webkit-scrollbar { width:3px; }
.ct-page::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.05); border-radius:2px; }

/* 桌面端 */
@media (min-width:769px) {
  .ct-page { padding:28px 48px 40px; width:100%; box-sizing:border-box; }
  .ct-grid { grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:18px; }
  .ct-cat { padding:10px 20px; font-size:14px; }
  .ct-card-title { font-size:15px; }
  .ct-card-body { padding:14px 16px; }
  .ct-header { margin-bottom: 20px; }
  .ct-title { font-size: 22px; }
}

@media (max-width:480px) {
  .ct-page { padding:12px 10px 130px; }
  .ct-grid { grid-template-columns:repeat(2, 1fr); gap:8px; }
  .ct-card-body { padding:8px 10px; }
  .ct-card-title { font-size:13px; }
}
</style>
