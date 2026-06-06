<template>
  <div class="cl-page">
    <!-- 未登录 -->
    <div v-if="!userStore.isLoggedIn" class="cl-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      <h2>我的收藏歌单</h2>
      <p>登录后可查看和管理你收藏的歌单</p>
      <button class="cl-btn cl-btn-ok" @click="userStore.openAuthModal()">立即登录</button>
    </div>

    <template v-else>
      <div class="cl-header">
        <h1 class="cl-title">我的收藏歌单</h1>
        <span class="cl-count" v-if="playlists.length">{{ playlists.length }} 个歌单</span>
      </div>

      <div v-if="loading" class="cl-grid">
        <div v-for="i in 6" :key="i" class="cl-card cl-skel"><div class="cl-card-img skel"></div><div class="cl-card-body"><div class="skel-line w80"></div><div class="skel-line w50"></div></div></div>
      </div>

      <div v-else-if="playlists.length === 0" class="cl-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <p>还没有收藏任何歌单</p>
        <button class="cl-btn" @click="router.push('/playlist-square')">去发现歌单</button>
      </div>

      <div v-else class="cl-grid">
        <div v-for="pl in playlists" :key="pl.id" class="cl-card" @click="goPlaylist(pl)">
          <img v-if="pl.coverUrl" :src="pl.coverUrl" class="cl-card-img" />
          <div v-else class="cl-card-img cl-img-empty">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
          </div>
          <div class="cl-card-body">
            <div class="cl-card-title">{{ pl.name }}</div>
            <div class="cl-card-meta">{{ pl.songCount || 0 }} 首歌曲</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getMyPlaylists } from '../api/playlist'

const router = useRouter()
const userStore = useUserStore()
const playlists = ref([])
const loading = ref(true)

const goPlaylist = (pl) => router.push(`/playlist/${pl.id}`)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try { loading.value = true; const res = await getMyPlaylists(); if (res.code === 1 && res.data) playlists.value = res.data.map(p => ({ id: p.id, name: p.name, coverUrl: p.coverFileUrl, songCount: p.songCount })) } catch {} finally { loading.value = false }
  } else { loading.value = false }
})
</script>

<style scoped>
.cl-page{width:100%;height:100%;background:linear-gradient(160deg,#080c18,#0f1428,#0a0e1f);color:#f1f5f9;overflow-y:auto;padding:20px 16px 130px;box-sizing:border-box}
.cl-header{display:flex;align-items:baseline;gap:10px;margin-bottom:16px}.cl-title{font-size:20px;font-weight:700;margin:0}.cl-count{font-size:12px;color:rgba(255,255,255,.3)}
.cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.cl-card{border-radius:14px;overflow:hidden;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);cursor:pointer}.cl-card:active{transform:scale(.98)}.cl-card-img{width:100%;aspect-ratio:1;object-fit:cover;display:block}.cl-img-empty{background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center}.cl-card-body{padding:10px 12px}.cl-card-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cl-card-meta{font-size:11px;color:rgba(255,255,255,.3);margin-top:3px}
.cl-btn{padding:10px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);font-size:14px;cursor:pointer}.cl-btn-ok{background:#6366f1;border-color:#6366f1;color:#fff}
.cl-empty{text-align:center;padding:80px 20px;color:rgba(255,255,255,.3)}.cl-empty h2{font-size:18px;margin:12px 0 4px;color:rgba(255,255,255,.5)}.cl-empty p{font-size:13px;margin:0 0 16px}
.cl-skel{pointer-events:none}.skel{background:rgba(255,255,255,.04);animation:skPulse 1.5s infinite}.cl-card-img.skel{aspect-ratio:1}.skel-line{height:10px;background:rgba(255,255,255,.04);border-radius:4px;margin-bottom:6px;animation:skPulse 1.5s infinite}.w80{width:80%}.w50{width:50%}@keyframes skPulse{0%,100%{opacity:.4}50%{opacity:1}}
.cl-page::-webkit-scrollbar{width:3px}.cl-page::-webkit-scrollbar-thumb{background:rgba(255,255,255,.05);border-radius:2px}
@media(max-width:480px){.cl-page{padding:16px 10px 130px}.cl-grid{grid-template-columns:repeat(2,1fr);gap:8px}}
</style>
