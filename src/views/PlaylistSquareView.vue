<template>
  <div class="ps-page">
    <div class="ps-cats">
      <button v-for="cat in categories" :key="cat.id" :class="['ps-cat', { active: activeCat === cat.id }]" @click="activeCat = cat.id">{{ cat.name }}</button>
    </div>

    <div class="ps-bar">
      <div class="ps-sorts">
        <button v-for="s in sorts" :key="s.id" :class="['ps-sort', { active: activeSort === s.id }]" @click="switchSort(s.id)">{{ s.name }}</button>
      </div>
      <span class="ps-total" v-if="!loading">{{ filteredList.length }} 个歌单</span>
    </div>

    <div v-if="loading" class="ps-grid">
      <div v-for="i in 8" :key="i" class="ps-card ps-skel"><div class="ps-card-img skel"></div><div class="ps-card-body"><div class="skel-line w80"></div><div class="skel-line w50"></div></div></div>
    </div>

    <div v-else-if="filteredList.length === 0" class="ps-empty">暂无歌单</div>

    <div v-else class="ps-grid">
      <div v-for="pl in filteredList" :key="pl.id" class="ps-card" @click="goPlaylist(pl)">
        <img :src="pl.cover" class="ps-card-img" />
        <div class="ps-card-body">
          <div class="ps-card-title">{{ pl.title }}</div>
          <div class="ps-card-meta">{{ pl.trackCount }}首 · {{ fmt(pl.collectCount) }}收藏</div>
        </div>
      </div>
    </div>

    <div v-if="hasMore && !loading" class="ps-more"><button @click="loadMore" :disabled="loadingMore">{{ loadingMore ? '加载中...' : '加载更多' }}</button></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHotPlaylists, getPlaylistsByCollectCount, getLatestPlaylists } from '@/api/playlist'

const router = useRouter()
const categories = [{ id: 'all', name: '全部' },{ id: 'rock', name: '摇滚' },{ id: 'jazz', name: '爵士' },{ id: 'classical', name: '古典' },{ id: 'electronic', name: '电子' },{ id: 'folk', name: '民谣' },{ id: 'hiphop', name: '说唱' }]
const sorts = [{ id: 'hot', name: '最热' },{ id: 'new', name: '最新' },{ id: 'collect', name: '收藏量' }]
const activeCat = ref('all'); const activeSort = ref('hot')
const hotData = ref([]); const collectData = ref([]); const latestData = ref([])
const loading = ref(true); const loadingMore = ref(false)
const limit = ref(10); const hasMore = ref(true)

const goPlaylist = (pl) => router.push(`/playlist/${pl.id}`)
const fmt = (n) => { if (n >= 1e8) return Math.floor(n/1e8)+'亿'; if (n >= 1e4) return Math.floor(n/1e4)+'万'; return String(n||0) }
const mapData = (arr) => arr.map(p => ({ id: p.id, title: p.name, creator: p.user?.username || '未知', cover: p.coverFileUrl || '', playCount: p.playCount||0, collectCount: p.collectCount||0, trackCount: p.songCount||0, category: p.tags?.length ? p.tags[0].toLowerCase() : 'all' }))

const filteredList = computed(() => {
  let data = activeSort.value === 'hot' ? hotData.value : activeSort.value === 'collect' ? collectData.value : latestData.value
  if (activeCat.value !== 'all') data = data.filter(p => p.category === activeCat.value)
  return data
})

const fetchHot = async (l = 10) => { try { const r = await getHotPlaylists(l); hotData.value = mapData(r.data) } catch { hotData.value = [] } }
const fetchCollect = async () => { try { const r = await getPlaylistsByCollectCount(limit.value); collectData.value = mapData(r.data); hasMore.value = r.data.length === limit.value } catch { collectData.value = [] } }
const fetchLatest = async () => { try { const r = await getLatestPlaylists(limit.value); latestData.value = mapData(r.data); hasMore.value = r.data.length === limit.value } catch { latestData.value = [] } }

const switchSort = async (id) => { if (activeSort.value === id) return; activeSort.value = id; limit.value = 10; hasMore.value = true; loading.value = true; if (id === 'hot') await fetchHot(10); else if (id === 'collect') await fetchCollect(); else await fetchLatest(); loading.value = false }
const loadMore = async () => { if (!hasMore.value || loadingMore.value) return; loadingMore.value = true; limit.value += 10; if (activeSort.value === 'collect') await fetchCollect(); else if (activeSort.value === 'new') await fetchLatest(); else hasMore.value = false; loadingMore.value = false }
onMounted(async () => { loading.value = true; await fetchHot(); loading.value = false })
</script>

<style scoped>
.ps-page { width:100%; height:100%; background:linear-gradient(160deg,#080c18,#0f1428,#0a0e1f); color:#f1f5f9; overflow-y:auto; padding:16px 16px 130px; box-sizing:border-box; }
.ps-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none}.ps-cats::-webkit-scrollbar{display:none}
.ps-cat{padding:6px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(255,255,255,.5);font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;flex-shrink:0}.ps-cat.active{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.3);color:#818cf8}
.ps-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.ps-sorts{display:flex;gap:4px}.ps-sort{padding:5px 12px;border-radius:14px;border:none;background:0 0;color:rgba(255,255,255,.4);font-size:12px;font-weight:500;cursor:pointer}.ps-sort.active{background:rgba(255,255,255,.06);color:#fff}.ps-total{font-size:11px;color:rgba(255,255,255,.25)}
.ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.ps-card{border-radius:14px;overflow:hidden;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);cursor:pointer}.ps-card:active{transform:scale(.98)}.ps-card-img{width:100%;aspect-ratio:1;object-fit:cover;display:block}.ps-card-body{padding:10px 12px}.ps-card-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ps-card-meta{font-size:10px;color:rgba(255,255,255,.3);margin-top:3px}
.ps-empty{text-align:center;padding:60px 20px;color:rgba(255,255,255,.2);font-size:14px}.ps-more{text-align:center;padding:20px 0}.ps-more button{padding:10px 32px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-size:13px;cursor:pointer}
.ps-skel{pointer-events:none}.skel{background:rgba(255,255,255,.04);animation:skPulse 1.5s infinite}.ps-card-img.skel{aspect-ratio:1}.skel-line{height:10px;background:rgba(255,255,255,.04);border-radius:4px;margin-bottom:6px;animation:skPulse 1.5s infinite}.w80{width:80%}.w50{width:50%}@keyframes skPulse{0%,100%{opacity:.4}50%{opacity:1}}
.ps-page::-webkit-scrollbar{width:3px}.ps-page::-webkit-scrollbar-thumb{background:rgba(255,255,255,.05);border-radius:2px}
@media(min-width:769px){.ps-page{padding:28px 48px 40px;width:100%;box-sizing:border-box}.ps-grid{grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px}.ps-cat{padding:9px 18px;font-size:13px}.ps-sort{padding:8px 16px;font-size:13px}.ps-card-title{font-size:15px}.ps-card-meta{font-size:12px}}
@media(max-width:480px){.ps-page{padding:12px 10px 130px}.ps-grid{grid-template-columns:repeat(2,1fr);gap:8px}}
</style>
