<template>
  <div class="playlist-edit-view">
    <!-- 返回按钮 -->
    <button class="pe-back" @click="cancelEdit">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>返回</span>
    </button>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="edit-body">
      <h2 class="edit-title">编辑歌单信息</h2>

      <div class="edit-container">
        <!-- 封面 -->
        <div class="edit-cover">
          <div class="cover-preview" @click="triggerCoverUpload">
            <img v-if="coverPreviewUrl || playlistInfo.coverUrl" :src="coverPreviewUrl || playlistInfo.coverUrl" :alt="playlistInfo.name" />
            <div v-else class="cover-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M9 18V5L21 12L9 18Z"/></svg>
            </div>
            <div class="cover-overlay"><span>更换封面</span></div>
          </div>
          <input id="cover-upload" type="file" accept="image/*" style="display:none" @change="handleCoverChange" />
        </div>

        <!-- 表单 -->
        <div class="edit-form">
          <div class="form-group">
            <label>名称</label>
            <input v-model="editForm.name" type="text" class="form-input" placeholder="歌单名称" maxlength="40" />
            <span class="char-count">{{ (editForm.name || '').length }}/40</span>
          </div>

          <div class="form-group">
            <label>简介</label>
            <textarea v-model="editForm.description" class="form-textarea" placeholder="歌单简介" maxlength="1000" rows="4"></textarea>
            <span class="char-count">{{ (editForm.description || '').length }}/1000</span>
          </div>

          <div class="form-group">
            <label>标签</label>
            <div class="tag-selector">
              <button v-for="tag in tagOptions" :key="tag" type="button" :class="['tag-option', { active: editForm.tag === tag }]" @click="editForm.tag = tag">{{ tag }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input :checked="editForm.isPublic === 1" @change="editForm.isPublic = $event.target.checked ? 1 : 0" type="checkbox" />
              设为公开歌单
            </label>
            <p class="privacy-desc">取消后仅自己可见</p>
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="saveEdit">保存</button>
            <button class="cancel-btn" @click="cancelEdit">取消</button>
          </div>
        </div>
      </div>
    </div>

    <Toast :visible="showToast" :message="toastMessage" :type="toastType" @close="closeToast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlaylistDetail, updatePlaylist } from '../api/playlist'
import Toast from '../components/Toast.vue'

const route = useRoute()
const router = useRouter()
const playlistId = route.params.id

const loading = ref(true)
const error = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error')

const playlistInfo = ref({ id: '', name: '', creator: '', createTime: '', coverUrl: '', description: '', songCount: 0, playCount: 0, collectCount: 0, user: null })

const editForm = ref({ name: '', description: '', tag: '', isPublic: 1, coverFile: null })
const coverPreviewUrl = ref('')
const tagOptions = ['流行', '摇滚', '民谣', '电子', '古典', '爵士', '华语', '欧美', '说唱']

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) { editForm.value.coverFile = file; coverPreviewUrl.value = URL.createObjectURL(file) }
}
const triggerCoverUpload = () => document.getElementById('cover-upload').click()

const fetchPlaylistDetail = async () => {
  try {
    loading.value = true
    const response = await getPlaylistDetail(playlistId)
    const d = response.data
    playlistInfo.value = {
      id: d.id, name: d.name, creator: d.user?.username || '', createTime: d.createTime,
      coverUrl: d.coverFileUrl, description: d.description, songCount: d.songCount,
      playCount: d.playCount, collectCount: d.collectCount, user: d.user,
    }
    editForm.value = {
      name: d.name || '', description: d.description || '',
      tag: Array.isArray(d.tags) ? d.tags.join(',') : d.tags || '',
      isPublic: d.isPublic !== undefined ? d.isPublic : 1,
    }
  } catch (err) { error.value = '获取歌单详情失败' }
  finally { loading.value = false }
}

const saveEdit = async () => {
  try {
    const updateData = {
      name: editForm.value.name, description: editForm.value.description,
      tags: editForm.value.tag, isPublic: editForm.value.isPublic,
    }
    if (editForm.value.coverFile) updateData.coverFile = editForm.value.coverFile
    await updatePlaylist(playlistId, updateData)
    toastMessage.value = '保存成功'; toastType.value = 'success'; showToast.value = true
    setTimeout(() => router.go(-1), 1000)
  } catch {
    toastMessage.value = '保存失败，请重试'; toastType.value = 'error'; showToast.value = true
  }
}

const closeToast = () => { showToast.value = false }
const cancelEdit = () => router.go(-1)

onMounted(() => fetchPlaylistDetail())
</script>

<style scoped>
.playlist-edit-view {
  width: 100%; min-height: 100vh;
  background: linear-gradient(160deg, #080c18, #0f1428, #0a0e1f);
  color: #f1f5f9;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 16px 24px 120px;
}

/* 返回 */
.pe-back {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none;
  color: rgba(255,255,255,0.5); cursor: pointer;
  font-size: 14px; padding: 4px 0; margin-bottom: 16px;
}
.pe-back:hover { color: #fff; }

/* 加载/错误 */
.loading, .error { display: flex; align-items: center; justify-content: center; height: 60vh; font-size: 16px; }
.error { color: #f87171; }

.edit-body { max-width: 720px; margin: 0 auto; }

.edit-title {
  font-size: 22px; font-weight: 700; margin: 0 0 20px;
  background: linear-gradient(135deg, #00ffff, #818cf8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.edit-container {
  display: flex; gap: 32px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
}

/* 封面 */
.edit-cover { flex-shrink: 0; }
.cover-preview {
  width: 180px; height: 180px; border-radius: 14px;
  overflow: hidden; position: relative; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
}
.cover-preview img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder {
  width: 100%; height: 100%; background: rgba(255,255,255,0.03);
  display: flex; align-items: center; justify-content: center;
}
.cover-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s; font-size: 13px; color: #0ff;
}
.cover-preview:hover .cover-overlay { opacity: 1; }

/* 表单 */
.edit-form { flex: 1; min-width: 0; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; color: rgba(255,255,255,0.5); }

.form-input, .form-textarea {
  width: 100%; padding: 12px 14px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; font-size: 14px;
  background: rgba(255,255,255,0.04); color: #fff;
  box-sizing: border-box; outline: none;
  transition: border-color 0.2s;
}
.form-input:focus, .form-textarea:focus {
  border-color: rgba(0,255,255,0.3);
  box-shadow: 0 0 0 3px rgba(0,255,255,0.06);
}
.form-textarea { resize: vertical; min-height: 80px; }

.char-count { display: block; text-align: right; font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 4px; }

/* 标签 */
.tag-selector { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-option {
  padding: 7px 14px; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.tag-option:hover { border-color: rgba(0,255,255,0.3); color: #0ff; }
.tag-option.active {
  background: rgba(0,255,255,0.12); border-color: rgba(0,255,255,0.5);
  color: #0ff; font-weight: 600;
}

/* 公开/隐私 */
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: rgba(255,255,255,0.7); cursor: pointer;
}
.checkbox-label input { width: 16px; height: 16px; accent-color: #0ff; }
.privacy-desc { font-size: 12px; color: rgba(255,255,255,0.3); margin: 4px 0 0 24px; }

/* 按钮 */
.form-actions { display: flex; gap: 10px; margin-top: 24px; }
.save-btn, .cancel-btn {
  flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
}
.save-btn {
  background: linear-gradient(135deg, #00ffff, #818cf8); color: #050510;
}
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,255,255,0.25); }
.cancel-btn {
  background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.08);
}
.cancel-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

/* ==================== 响应式 ==================== */
@media (min-width: 769px) {
  .playlist-edit-view { padding: 24px 40px 40px; max-width: 900px; margin: 0 auto; min-height: auto; }
  .cover-preview { width: 220px; height: 220px; }
}

@media (max-width: 768px) {
  .playlist-edit-view { padding: 12px 16px 110px; }
  .edit-container { flex-direction: column; align-items: center; gap: 20px; padding: 20px; }
  .cover-preview { width: 160px; height: 160px; border-radius: 12px; }
  .edit-title { font-size: 20px; }
}

@media (max-width: 480px) {
  .playlist-edit-view { padding: 10px 12px 100px; }
  .edit-container { padding: 16px; border-radius: 12px; }
  .cover-preview { width: 140px; height: 140px; }
  .edit-title { font-size: 18px; }
  .tag-option { padding: 6px 12px; font-size: 12px; }
  .form-input, .form-textarea { padding: 10px 12px; font-size: 13px; }
}
</style>
