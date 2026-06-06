<template>
  <div class="aitrack-page">
    <!-- 装饰光斑 -->
    <div class="at-bg-glow glow-1"></div>
    <div class="at-bg-glow glow-2"></div>

    <!-- === 生成区域 === -->
    <section class="at-hero">
      <div class="at-hero-badge">AI 驱动</div>
      <h1 class="at-hero-title">灵音 · AI 音乐创作</h1>
      <p class="at-hero-desc">描述你想要的音乐风格，灵音为你创作独一无二的音乐</p>

      <div class="at-form-card">
        <div class="atf-row">
          <label class="atf-label">音乐描述</label>
          <textarea v-model="prompt" class="atf-textarea" placeholder="例如：一首舒缓的钢琴曲，带有轻快的节奏，适合在午后放松时聆听..." rows="3"></textarea>
        </div>

        <div class="atf-cols">
          <div class="atf-row">
            <label class="atf-label">音轨标题</label>
            <input v-model="title" class="atf-input" placeholder="为音轨命名" />
          </div>
          <div class="atf-row">
            <label class="atf-label">风格标签</label>
            <input v-model="tags" class="atf-input" placeholder="流行, 电子, 放松" />
          </div>
        </div>

        <div class="atf-actions">
          <button class="at-btn at-btn-primary" :disabled="isGenerating" @click="handleGenerate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
            {{ isGenerating ? '生成中...' : '开始生成' }}
          </button>
          <button class="at-btn at-btn-secondary" :disabled="isGenerating" @click="handleQuickGenerate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3l3 7h7l-5.5 4.5 2 7L13 17l-6.5 4.5 2-7L3 10h7z"/></svg>
            快速生成
          </button>
        </div>
      </div>
    </section>

    <!-- === 进度区 === -->
    <section v-if="isGenerating || currentTask" class="at-progress-section">
      <div class="at-progress-card">
        <div class="atp-header">
          <span class="atp-label">生成进度</span>
          <span class="atp-pct" :class="{ done: !isGenerating }">
            {{ isGenerating ? progress.toFixed(0) + '%' : '✓ 完成' }}
          </span>
        </div>
        <div class="atp-bar">
          <div class="atp-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="atp-text">{{ progressText }}</p>
        <div v-if="currentTask" class="atp-task">
          <span>任务 ID: {{ currentTask.id }}</span>
          <span :class="currentTask.status">{{ getStatusText(currentTask) }}</span>
        </div>
      </div>
    </section>

    <!-- === 历史记录 === -->
    <section class="at-history-section">
      <div class="ath-header">
        <h2 class="ath-title">生成历史</h2>
        <button class="ath-refresh" @click="refreshHistory">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      <div v-if="historyTracks.length === 0" class="ath-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <p>还没有生成记录</p>
        <span>输入描述开始你的第一次 AI 创作</span>
      </div>

      <div v-else class="ath-grid">
        <div v-for="track in historyTracks" :key="track.id" class="ath-card" :class="track.status">
          <div class="athc-top">
            <h4 class="athc-title">{{ track.title }}</h4>
            <span class="athc-status" :class="track.status">{{ getStatusText(track) }}</span>
          </div>
          <p class="athc-prompt">{{ track.prompt }}</p>
          <div class="athc-meta">
            <span>{{ formatTime(track.createdAt) }}</span>
            <span v-if="track.duration">{{ track.duration }}s</span>
          </div>
          <div class="athc-actions">
            <button v-if="track.generationStatus === 1" class="atc-btn play" @click="handlePlay(track)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button v-if="track.generationStatus === 1" class="atc-btn" @click="handleDownload(track)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            </button>
            <button class="atc-btn delete" @click="handleDelete(track)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 弹窗 -->
    <ConfirmDialog :visible="showDeleteModal" title="确认删除" message="确定要删除此音轨吗？此操作不可撤销。" type="warning" confirm-text="删除" cancel-text="取消" @confirm="confirmDelete" @cancel="showDeleteModal = false" @close="showDeleteModal = false" />
    <Toast :visible="toastVisible" :message="toastMessage" :type="toastType" @close="closeToast" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { generateAITrack, getAITrackHistory, deleteAITrack } from '../api/aitrack'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import Toast from '../components/Toast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const audioStore = useAudioStore()
const userStore = useUserStore()
const { playSong } = audioStore

const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('error')
const showDeleteModal = ref(false)
const currentTrack = ref(null)

const prompt = ref('')
const title = ref('')
const tags = ref('')
const isGenerating = ref(false)
const progress = ref(0)
const progressText = ref('准备中...')
const currentTask = ref(null)
const historyTracks = ref([])

let pollInterval = null
let animInterval = null

const showToast = (msg, type = 'error') => { toastMessage.value = msg; toastType.value = type; toastVisible.value = true }
const closeToast = () => { toastVisible.value = false }

const startProgressAnim = () => {
  if (animInterval) clearInterval(animInterval)
  animInterval = setInterval(() => {
    if (!isGenerating.value) { clearInterval(animInterval); return }
    if (progress.value < 85) { progress.value += Math.random() * 5 + 2; progressText.value = `生成中... ${progress.value.toFixed(0)}%` }
    else if (progress.value < 90) { progress.value += 1; progressText.value = `生成中... ${progress.value.toFixed(0)}%` }
  }, 500)
}

const generateTrack = async (quick = false) => {
  if (!prompt.value.trim()) { showToast('请输入音乐描述'); return }
  if (!userStore.isLoggedIn) { showToast('请先登录后再使用 AI 音轨生成功能'); return }
  try {
    isGenerating.value = true; progress.value = 0; progressText.value = '正在提交...'
    startProgressAnim()
    const res = await generateAITrack({ description: prompt.value, title: title.value || (quick ? `灵音_${Date.now()}` : '未命名'), tags: tags.value })
    if (res.data) { currentTask.value = res.data; progressText.value = '生成中，请稍候...'; startPolling(); await loadHistory() }
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      progressText.value = '请求超时，任务可能已开始，稍后查看历史记录'
      setTimeout(() => loadHistory(), 10000)
    } else { progressText.value = '生成失败，请重试' }
    isGenerating.value = false; progress.value = 0
  }
}

const handleGenerate = () => generateTrack(false)
const handleQuickGenerate = () => generateTrack(true)
const clearForm = () => { prompt.value = ''; title.value = ''; tags.value = '' }

const startPolling = () => {
  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(async () => {
    if (!isGenerating.value) { clearInterval(pollInterval); return }
    try {
      const res = await getAITrackHistory()
      if (res.data?.length) {
        const t = res.data[0]
        if (t.generationStatus === 1) { clearInterval(pollInterval); isGenerating.value = false; progress.value = 100; progressText.value = '生成完成！'; currentTask.value = null; clearForm(); await loadHistory() }
        else if (t.generationStatus === 0) { clearInterval(pollInterval); isGenerating.value = false; progress.value = 0; progressText.value = '生成失败'; currentTask.value = null; await loadHistory() }
      }
    } catch {}
  }, 3000)
}

const loadHistory = async () => {
  try {
    const res = await getAITrackHistory()
    if (res.data) historyTracks.value = res.data.map(t => ({ ...t, createdAt: new Date(t.createTime), status: t.generationStatus === 1 ? 'completed' : t.generationStatus === 0 ? 'failed' : 'processing' }))
  } catch {}
}

const getStatusText = (t) => { switch (t.generationStatus ?? t.status) { case 1: case 'completed': return '已完成'; case 0: case 'failed': return '失败'; case 2: case 'processing': return '处理中'; default: return '' } }

const handlePlay = async (track) => {
  const url = track.fileUrl; if (!url) { showToast('暂无可播放文件'); return }
  await playSong({ id: track.id, title: track.title || '灵音', artist: 'AI生成', duration: track.duration || 0, url, cover: track.coverUrl })
}

const handleDownload = (track) => {
  const url = track.fileUrl || track.audioUrl; if (!url) { showToast('暂无可下载文件'); return }
  const a = document.createElement('a'); a.href = url; a.download = `${track.title || '音轨'}.${track.format || 'mp3'}`; a.click()
}

const handleDelete = (t) => { currentTrack.value = t; showDeleteModal.value = true }
const confirmDelete = async () => { if (!currentTrack.value) return; try { await deleteAITrack(currentTrack.value.id); showToast('删除成功', 'success'); await loadHistory() } catch { showToast('删除失败') } finally { showDeleteModal.value = false; currentTrack.value = null } }
const refreshHistory = () => loadHistory()
const formatTime = (d) => new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)

onUnmounted(() => { if (pollInterval) clearInterval(pollInterval); if (animInterval) clearInterval(animInterval) })
onMounted(() => loadHistory())
</script>

<style scoped>
/* ===================== 页面容器 ===================== */
.aitrack-page {
  width: 100%; height: 100%;
  background: linear-gradient(160deg, #080c18 0%, #0f1428 40%, #0a0e1f 100%);
  overflow-y: auto; overflow-x: hidden;
  padding: 32px 32px 120px;
  position: relative;
  box-sizing: border-box;
}

/* 装饰光斑 */
.at-bg-glow {
  position: fixed; border-radius: 50%; filter: blur(120px);
  pointer-events: none; z-index: 0; opacity: 0.12;
}
.glow-1 { width: 500px; height: 500px; top: -100px; right: -100px; background: radial-gradient(circle, #6366f1, transparent); }
.glow-2 { width: 400px; height: 400px; bottom: -50px; left: -80px; background: radial-gradient(circle, #06b6d4, transparent); }

/* ===================== Hero 生成区 ===================== */
.at-hero {
  position: relative; z-index: 1;
  text-align: center;
  max-width: 640px; margin: 0 auto 32px;
}

.at-hero-badge {
  display: inline-block;
  padding: 5px 14px;
  background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
  border-radius: 20px;
  font-size: 12px; font-weight: 600; color: #818cf8;
  letter-spacing: 1px; text-transform: uppercase;
  margin-bottom: 16px;
}

.at-hero-title { font-size: 32px; font-weight: 800; color: #f1f5f9; margin: 0 0 8px; letter-spacing: -0.5px; }
.at-hero-desc { font-size: 14px; color: rgba(255,255,255,0.4); margin: 0 0 28px; }

/* 表单卡片 */
.at-form-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px; padding: 28px;
  text-align: left;
  backdrop-filter: blur(12px);
}

.atf-row { margin-bottom: 18px; }
.atf-label { display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 8px; letter-spacing: 0.3px; }

.atf-textarea, .atf-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; color: #f1f5f9; font-size: 14px; line-height: 1.5;
  outline: none; transition: all 0.25s ease; box-sizing: border-box;
  font-family: inherit; resize: vertical;
}
.atf-textarea:focus, .atf-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.atf-textarea::placeholder, .atf-input::placeholder { color: rgba(255,255,255,0.25); }

.atf-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.atf-actions { display: flex; gap: 12px; margin-top: 4px; }

.at-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 20px; border: none; border-radius: 12px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.25s ease;
}
.at-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.at-btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3);
}
.at-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.4); }

.at-btn-secondary {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
}
.at-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; }

/* ===================== 进度卡片 ===================== */
.at-progress-section { position: relative; z-index: 1; max-width: 640px; margin: 0 auto 32px; }

.at-progress-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(99,102,241,0.12);
  border-radius: 16px; padding: 20px 24px;
}

.atp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.atp-label { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); }
.atp-pct { font-size: 14px; font-weight: 700; color: #818cf8; }
.atp-pct.done { color: #34d399; }

.atp-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
.atp-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4); border-radius: 3px; transition: width 0.3s ease; }

.atp-text { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 8px; }
.atp-task { display: flex; justify-content: space-between; font-size: 12px; color: rgba(255,255,255,0.3); font-family: 'SF Mono', monospace; }

/* ===================== 历史记录 ===================== */
.at-history-section { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; }

.ath-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.ath-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0; }
.ath-refresh { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
.ath-refresh:hover { background: rgba(255,255,255,0.08); color: #fff; }

.ath-empty { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.25); }
.ath-empty p { font-size: 15px; margin: 12px 0 4px; font-weight: 500; }
.ath-empty span { font-size: 13px; }

.ath-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

.ath-card {
  background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; padding: 18px 20px;
  transition: all 0.25s ease;
}
.ath-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }

.athc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.athc-title { font-size: 15px; font-weight: 600; color: #f1f5f9; margin: 0; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.athc-status { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 600; flex-shrink: 0; }
.athc-status.completed { background: rgba(52,211,153,0.12); color: #34d399; }
.athc-status.processing { background: rgba(251,191,36,0.12); color: #fbbf24; }
.athc-status.failed { background: rgba(248,113,113,0.12); color: #f87171; }

.athc-prompt { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }

.athc-meta { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.25); margin-bottom: 12px; }

.athc-actions { display: flex; gap: 6px; }
.atc-btn { width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.atc-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
.atc-btn.play:hover { border-color: #34d399; color: #34d399; background: rgba(52,211,153,0.1); }
.atc-btn.delete:hover { border-color: #f87171; color: #f87171; background: rgba(248,113,113,0.1); }

/* ===================== 滚动条 ===================== */
.aitrack-page::-webkit-scrollbar { width: 4px; }
.aitrack-page::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }

/* ===================== 响应式 ===================== */
@media (max-width: 768px) {
  .aitrack-page { padding: 20px 16px 140px; }
  .at-hero-title { font-size: 26px; }
  .at-hero-desc { font-size: 13px; }
  .at-form-card { padding: 20px; border-radius: 16px; }
  .atf-cols { grid-template-columns: 1fr; gap: 0; }
  .atf-actions { flex-direction: column; }
  .at-btn { width: 100%; }
  .atf-textarea, .atf-input { font-size: 16px; }
  .ath-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .aitrack-page { padding: 16px 10px 130px; }
  .at-hero-title { font-size: 22px; }
  .at-form-card { padding: 16px; border-radius: 14px; }
  .at-btn { padding: 12px 16px; font-size: 13px; }
  .ath-title { font-size: 18px; }
  .ath-card { padding: 14px 16px; }
}
</style>
