<template>
  <div class="upload-page">
    <!-- 返回 + 模式切换 -->
    <div class="up-top">
      <button class="up-back" @click="$router.go(-1)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>返回</span>
      </button>
      <div class="up-tabs">
        <button :class="['up-tab', { active: mode === 'standard' }]" @click="mode = 'standard'">标准上传</button>
        <button :class="['up-tab', { active: mode === 'quick' }]" @click="mode = 'quick'">快速上传</button>
      </div>
    </div>

    <!-- ==================== 标准上传 ==================== -->
    <div v-if="mode === 'standard'" class="up-body">
      <div class="up-card">
        <h3 class="up-card-title">上传文件</h3>

        <div class="up-file-item">
          <label class="up-label">音乐文件 *</label>
          <div class="up-drop" :class="{ active: files.musicFile }" @click="() => triggerFileInput('music')">
            <input ref="musicFileInput" type="file" accept="audio/*" @change="(e) => handleFileSelect(e, 'music')" hidden />
            <template v-if="!files.musicFile">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
              <p>选择音乐文件</p>
              <span>MP3, WAV, FLAC</span>
            </template>
            <template v-else>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,255,136,0.8)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <div class="up-file-info"><span class="up-fn">{{ files.musicFile.name }}</span><span class="up-fs">{{ formatSize(files.musicFile.size) }}</span></div>
              <button class="up-remove" @click.stop="() => removeFile('music')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </template>
          </div>
        </div>

        <div class="up-file-item">
          <label class="up-label">歌曲封面</label>
          <div class="up-drop" :class="{ active: files.coverFile }" @click="() => triggerFileInput('cover')">
            <input ref="coverFileInput" type="file" accept="image/*" @change="(e) => handleFileSelect(e, 'cover')" hidden />
            <template v-if="!files.coverFile">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><path d="M8.5 13.5L11 16.5 14.5 12 19 18H5M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/></svg>
              <p>选择封面图片</p><span>JPG, PNG</span>
            </template>
            <template v-else>
              <img v-if="coverPreview" :src="coverPreview" class="up-thumb" />
              <div class="up-file-info"><span class="up-fn">{{ files.coverFile.name }}</span><span class="up-fs">{{ formatSize(files.coverFile.size) }}</span></div>
              <button class="up-remove" @click.stop="() => removeFile('cover')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </template>
          </div>
        </div>

        <div class="up-file-item">
          <label class="up-label">歌词文件</label>
          <div class="up-drop" :class="{ active: files.lrcFile }" @click="() => triggerFileInput('lrc')">
            <input ref="lrcFileInput" type="file" accept=".lrc,.txt" @change="(e) => handleFileSelect(e, 'lrc')" hidden />
            <template v-if="!files.lrcFile">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/></svg>
              <p>选择歌词文件</p><span>LRC, TXT</span>
            </template>
            <template v-else>
              <div class="up-file-info"><span class="up-fn">{{ files.lrcFile.name }}</span><span class="up-fs">{{ formatSize(files.lrcFile.size) }}</span></div>
              <button class="up-remove" @click.stop="() => removeFile('lrc')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </template>
          </div>
        </div>

        <div v-if="isUploading" class="up-progress">
          <div class="up-bar"><div class="up-bar-fill" :style="{ width: uploadProgress + '%' }"></div></div>
          <span>{{ Math.round(uploadProgress) }}%</span>
        </div>
      </div>

      <div class="up-card">
        <h3 class="up-card-title">歌曲信息</h3>
        <div class="up-form-group"><label class="up-label">标题 *</label><input v-model="songInfo.title" type="text" class="up-input" placeholder="歌曲名称" /></div>
        <div class="up-form-group"><label class="up-label">歌手 *</label><input v-model="songInfo.artist" type="text" class="up-input" placeholder="歌手名称" /></div>
        <div class="up-form-group"><label class="up-label">专辑</label><input v-model="songInfo.album" type="text" class="up-input" placeholder="专辑名称（选填）" /></div>
        <div class="up-actions">
          <button class="up-btn up-btn-ok" :disabled="!canUpload || isUploading" @click="handleUpload">{{ isUploading ? '上传中...' : '开始上传' }}</button>
          <button class="up-btn up-btn-cancel" :disabled="isUploading" @click="resetForm">重置</button>
        </div>
      </div>
    </div>

    <!-- ==================== 快速上传 ==================== -->
    <div v-else class="up-body quick-body">
      <div class="up-card">
        <h3 class="up-card-title">快速上传</h3>
        <p class="quick-desc">输入网易云链接 + 上传文件，自动填充歌曲信息</p>

        <div class="up-form-group"><label class="up-label">网易云音乐链接 *</label><input v-model="quickForm.url" type="url" class="up-input" placeholder="https://music.163.com/song?id=xxx" /></div>

        <div class="up-file-item">
          <label class="up-label">音乐文件 *</label>
          <div class="up-drop" :class="{ active: quickForm.musicFile }" @click="() => quickFileInput?.click()">
            <input ref="quickFileInput" type="file" accept="audio/*" @change="handleQuickFile" hidden />
            <template v-if="!quickForm.musicFile">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
              <p>选择音乐文件</p><span>MP3, WAV, FLAC</span>
            </template>
            <template v-else>
              <div class="up-file-info"><span class="up-fn">{{ quickForm.musicFile.name }}</span><span class="up-fs">{{ formatSize(quickForm.musicFile.size) }}</span></div>
              <button class="up-remove" @click.stop="quickForm.musicFile = null"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </template>
          </div>
        </div>

        <div v-if="quickUploading" class="up-progress">
          <div class="up-bar"><div class="up-bar-fill" :style="{ width: uploadProgress + '%' }"></div></div>
          <span>{{ Math.round(uploadProgress) }}%</span>
        </div>

        <div class="up-actions">
          <button class="up-btn up-btn-ok" :disabled="!canQuickUpload || quickUploading" @click="handleQuickUpload">{{ quickUploading ? '上传中...' : '开始上传' }}</button>
          <button class="up-btn up-btn-cancel" @click="quickForm = { url: '', musicFile: null }">重置</button>
        </div>
      </div>
    </div>

    <Toast :visible="toast.visible" :message="toast.message" :type="toast.type" fixed @close="closeToast" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadMusicToAliOSS, uploadMusicWithNeteaseUrl } from '@/api/music'
import Toast from '@/components/Toast.vue'

const mode = ref('standard')

// 标准上传
const files = ref({ musicFile: null, coverFile: null, lrcFile: null })
const coverPreview = ref('')
const songInfo = ref({ title: '', artist: '', album: '' })
const isUploading = ref(false)
const uploadProgress = ref(0)
const toast = ref({ visible: false, message: '', type: 'success' })
const musicFileInput = ref(null), coverFileInput = ref(null), lrcFileInput = ref(null)

const canUpload = computed(() => files.value.musicFile && songInfo.value.title.trim() && songInfo.value.artist.trim() && !isUploading.value)
const showToast = (msg, t = 'success') => { toast.value = { visible: true, message: msg, type: t } }
const closeToast = () => { toast.value.visible = false }

const triggerFileInput = (type) => {
  const map = { music: musicFileInput, cover: coverFileInput, lrc: lrcFileInput }
  map[type].value?.click()
}
const handleFileSelect = (e, type) => {
  const f = e.target.files[0]; if (!f) return
  const ok = type === 'lrc' ? ['.lrc','.txt'].some(x => f.name.toLowerCase().endsWith(x)) : type === 'cover' ? f.type.startsWith('image/') : f.type.startsWith('audio/')
  if (!ok) return showToast('文件格式不正确', 'error')
  files.value[type + 'File'] = f
  if (type === 'cover') { const r = new FileReader(); r.onload = e => coverPreview.value = e.target.result; r.readAsDataURL(f) }
  if (type === 'music' && !songInfo.value.title) songInfo.value.title = f.name.replace(/\.[^/.]+$/, '')
}
const removeFile = (type) => {
  files.value[type + 'File'] = null
  if (type === 'cover') coverPreview.value = ''
  const map = { music: musicFileInput, cover: coverFileInput, lrc: lrcFileInput }
  if (map[type].value) map[type].value.value = ''
}
const formatSize = (b) => { if (!b) return ''; const i = Math.floor(Math.log(b) / Math.log(1024)); return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i] }

const handleUpload = async () => {
  if (!canUpload.value) return
  isUploading.value = true; uploadProgress.value = 0
  try {
    const fd = new FormData()
    fd.append('musicFile', files.value.musicFile); fd.append('title', songInfo.value.title); fd.append('artist', songInfo.value.artist)
    if (songInfo.value.album) fd.append('album', songInfo.value.album)
    if (files.value.coverFile) fd.append('coverFile', files.value.coverFile)
    if (files.value.lrcFile) fd.append('lrcFile', files.value.lrcFile)
    const res = await uploadMusicToAliOSS(fd)
    if (res.code === 1) { showToast('上传成功！'); setTimeout(() => resetForm(), 1500) }
    else throw new Error(res.msg || '上传失败')
  } catch (e) { showToast(e.message || '上传失败', 'error') }
  finally { isUploading.value = false; setTimeout(() => uploadProgress.value = 0, 1000) }
}

const resetForm = () => {
  files.value = { musicFile: null, coverFile: null, lrcFile: null }
  songInfo.value = { title: '', artist: '', album: '' }; coverPreview.value = ''; uploadProgress.value = 0
  ;[musicFileInput, coverFileInput, lrcFileInput].forEach(r => { if (r.value) r.value.value = '' })
}

// 快速上传
const quickFileInput = ref(null)
const quickUploading = ref(false)
const quickForm = ref({ url: '', musicFile: null })
const canQuickUpload = computed(() => quickForm.value.url.trim() && quickForm.value.musicFile && !quickUploading.value)

const handleQuickFile = (e) => {
  const f = e.target.files[0]; if (f?.type?.startsWith('audio/')) quickForm.value.musicFile = f; else showToast('请选择音频文件', 'error')
}
const handleQuickUpload = async () => {
  if (!canQuickUpload.value) return
  quickUploading.value = true; uploadProgress.value = 0
  try {
    const fd = new FormData(); fd.append('neteaseUrl', quickForm.value.url); fd.append('musicFile', quickForm.value.musicFile)
    const res = await uploadMusicWithNeteaseUrl(fd)
    if (res.code === 1) { showToast('上传成功！'); setTimeout(() => { quickForm.value = { url: '', musicFile: null } }, 1500) }
    else throw new Error(res.msg || '上传失败')
  } catch (e) { showToast(e.message || '上传失败', 'error') }
  finally { quickUploading.value = false; setTimeout(() => uploadProgress.value = 0, 1000) }
}
</script>

<style scoped>
.upload-page {
  position: fixed; inset: 0;
  background: linear-gradient(160deg, #080c18, #0f1428, #0a0e1f);
  color: #edf0f5; box-sizing: border-box;
  overflow-y: auto; padding: 16px 24px 120px;
  z-index: 1001;
}

/* 顶栏 */
.up-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
.up-back { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 14px; padding: 4px 0; flex-shrink: 0; }
.up-back:hover { color: #fff; }

.up-tabs { display: flex; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 3px; }
.up-tab { padding: 8px 18px; border: none; border-radius: 8px; background: none; color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.up-tab.active { background: rgba(0,255,255,0.1); color: #0ff; }

/* 内容区 */
.up-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 100%; margin: 0; align-items: start; }
.quick-body { grid-template-columns: 1fr; }

.up-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; }
.up-card-title { font-size: 16px; font-weight: 700; margin: 0 0 16px; background: linear-gradient(135deg, #0ff, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.up-file-item { margin-bottom: 14px; }
.up-label { display: block; font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
.up-drop { border: 2px dashed rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.up-drop:hover { border-color: rgba(0,255,255,0.2); background: rgba(0,255,255,0.02); }
.up-drop.active { border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.03); flex-direction: row; text-align: left; gap: 10px; padding: 12px 16px; }
.up-drop p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); }
.up-drop span { font-size: 11px; color: rgba(255,255,255,0.2); }
.up-file-info { flex: 1; min-width: 0; }
.up-fn { display: block; font-size: 13px; color: #edf0f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.up-fs { font-size: 11px; color: rgba(255,255,255,0.3); }
.up-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.up-remove { background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; padding: 4px; flex-shrink: 0; }
.up-remove:hover { color: #f87171; }

.up-progress { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
.up-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.up-bar-fill { height: 100%; background: linear-gradient(90deg, #0ff, #818cf8); border-radius: 2px; transition: width 0.3s; }
.up-progress span { font-size: 12px; color: rgba(255,255,255,0.4); font-variant-numeric: tabular-nums; }

.up-form-group { margin-bottom: 14px; }
.up-input { width: 100%; padding: 11px 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; background: rgba(255,255,255,0.03); color: #fff; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
.up-input:focus { border-color: rgba(0,255,255,0.3); }
.up-input::placeholder { color: rgba(255,255,255,0.2); }

.up-actions { display: flex; gap: 10px; margin-top: 18px; }
.up-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.up-btn-ok { background: linear-gradient(135deg, #0ff, #818cf8); color: #050510; }
.up-btn-ok:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,255,255,0.2); }
.up-btn-ok:disabled { opacity: 0.4; cursor: not-allowed; }
.up-btn-cancel { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); }
.up-btn-cancel:hover { background: rgba(255,255,255,0.08); color: #fff; }

.quick-desc { font-size: 12px; color: rgba(255,255,255,0.25); margin: -8px 0 16px; }

/* ==================== 响应式 ==================== */
@media (min-width: 769px) {
  .upload-page { position: relative; padding: 28px 48px 40px; min-height: 100%; width: 100%; box-sizing: border-box; }
  .up-card { padding: 28px; }
  .up-input { font-size: 15px; }
  .up-card-title { font-size: 18px; }
  .up-tab { padding: 9px 22px; font-size: 14px; }
}

@media (max-width: 768px) {
  .upload-page { padding: 12px 16px 110px; }
  .up-body { grid-template-columns: 1fr; }
  .up-top { flex-wrap: wrap; }
  .up-tab { padding: 7px 14px; font-size: 12px; }
}

@media (max-width: 480px) {
  .upload-page { padding: 10px 12px 100px; }
  .up-card { padding: 16px; border-radius: 12px; }
  .up-drop { padding: 16px; }
  .up-input { padding: 10px 12px; font-size: 13px; }
  .up-tabs { width: 100%; }
  .up-tab { flex: 1; text-align: center; }
}
</style>
