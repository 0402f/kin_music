<template>
  <div class="playlist-edit-view">
    <div class="content-container">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="edit-playlist">
        <h2 class="edit-title">编辑歌单信息</h2>

        <div class="edit-container">
          <div class="edit-form">
            <div class="form-group">
              <label>名称：</label>
              <input
                v-model="editForm.name"
                type="text"
                class="form-input"
                placeholder="请输入歌单名称"
                maxlength="40"
              />
              <span class="char-count">{{ (editForm.name || '').length }}/40</span>
            </div>

            <div class="form-group">
              <label>简介：</label>
              <textarea
                v-model="editForm.description"
                class="form-textarea"
                placeholder="请输入歌单简介"
                maxlength="1000"
                rows="8"
              ></textarea>
              <span class="char-count">{{ (editForm.description || '').length }}/1000</span>
            </div>

            <div class="form-group">
              <label>标签：</label>
              <div class="tag-selector">
                <button
                  v-for="tag in tagOptions"
                  :key="tag"
                  type="button"
                  :class="['tag-option', { active: editForm.tag === tag }]"
                  @click="editForm.tag = tag"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label-simple">
                <input
                  :checked="editForm.isPublic === 1"
                  @change="editForm.isPublic = $event.target.checked ? 1 : 0"
                  type="checkbox"
                  class="checkbox-native"
                />
                设为公开歌单
              </label>
              <div class="privacy-desc">取消勾选后，歌单将变为隐私歌单，只有你自己可以看到</div>
            </div>

            <div class="form-actions">
              <button class="save-btn" @click="saveEdit">保存</button>
              <button class="cancel-btn" @click="cancelEdit">取消</button>
            </div>
          </div>

          <div class="edit-cover">
            <div class="cover-preview" @click="triggerCoverUpload">
              <img
                v-if="coverPreviewUrl || playlistInfo.coverUrl"
                :src="coverPreviewUrl || playlistInfo.coverUrl"
                :alt="playlistInfo.name"
              />
              <div v-else class="cover-placeholder">
                <span class="music-icon">🎵</span>
              </div>
              <div class="cover-overlay">
                <span class="upload-text">点击更换封面</span>
              </div>
            </div>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleCoverChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Toast组件 -->
    <Toast
      :visible="showToast"
      :message="toastMessage"
      :type="toastType"
      :fixed="true"
      @close="closeToast"
    />
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
// 添加Toast相关状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error')

const playlistInfo = ref({
  id: '',
  name: '',
  creator: '',
  createTime: '',
  coverUrl: '',
  description: '',
  songCount: 0,
  playCount: 0,
  collectCount: 0,
  user: null,
})

const editForm = ref({
  name: '',
  description: '',
  tag: '',
  isPublic: 1,
  coverFile: null, // 添加封面文件字段
})

// 添加封面预览URL
const coverPreviewUrl = ref('')

// 处理封面文件选择
const handleCoverChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    editForm.value.coverFile = file
    // 创建预览URL
    coverPreviewUrl.value = URL.createObjectURL(file)
  }
}

// 触发文件选择
const triggerCoverUpload = () => {
  document.getElementById('cover-upload').click()
}

// 在现有的变量定义后添加
const tagOptions = ['流行', '摇滚', '民谣', '电子', '古典', '爵士', '华语', '欧美', '说唱']

// 获取歌单详情
const fetchPlaylistDetail = async () => {
  try {
    loading.value = true
    const response = await getPlaylistDetail(playlistId)

    // 正确提取歌单数据
    const playlistData = response.data
    playlistInfo.value = {
      id: playlistData.id,
      name: playlistData.name,
      creator: playlistData.user?.username || '',
      createTime: playlistData.createTime,
      coverUrl: playlistData.coverFileUrl,
      description: playlistData.description,
      songCount: playlistData.songCount,
      playCount: playlistData.playCount,
      collectCount: playlistData.collectCount,
      user: playlistData.user,
    }

    // 初始化编辑表单
    editForm.value = {
      name: playlistData.name || '',
      description: playlistData.description || '',
      tag: Array.isArray(playlistData.tags) ? playlistData.tags.join(',') : playlistData.tags || '',
      isPublic: playlistData.isPublic !== undefined ? playlistData.isPublic : 1,
    }
  } catch (err) {
    console.error('获取歌单详情失败:', err)
    error.value = '获取歌单详情失败'
  } finally {
    loading.value = false
  }
}

// 保存编辑
const saveEdit = async () => {
  try {
    // 准备更新数据
    const updateData = {
      name: editForm.value.name,
      description: editForm.value.description,
      tags: editForm.value.tag,
      isPublic: editForm.value.isPublic,
    }

    // 如果有新的封面文件，添加到数据中
    if (editForm.value.coverFile) {
      updateData.coverFile = editForm.value.coverFile
    }

    console.log('保存编辑:', updateData)

    // 调用更新歌单的API
    await updatePlaylist(playlistId, updateData)

    console.log('歌单更新成功')

    // 显示成功提示
    toastMessage.value = '保存成功'
    toastType.value = 'success'
    showToast.value = true

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      // 直接返回上一页，避免在路由栈中留下编辑页记录
      router.go(-1)
    }, 1000)
  } catch (err) {
    console.error('保存失败:', err)
    // 使用Toast显示错误信息，而不是设置error状态
    toastMessage.value = '保存失败，请重试'
    toastType.value = 'error'
    showToast.value = true
  }
}

// 添加关闭Toast的方法
const closeToast = () => {
  showToast.value = false
}

// 取消编辑
const cancelEdit = () => {
  // 直接返回上一页
  router.go(-1)
}

onMounted(() => {
  fetchPlaylistDetail()
})
</script>

<style scoped>
.playlist-edit-view {
  /* 固定在导航栏和播放器之间 */
  padding: 0;
  width: 100vw;
  height: calc(100vh - 160px); /* 减去顶部导航栏和底部播放器的高度 */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow: hidden; /* 禁用滚动条 */
  box-sizing: border-box;
}

/* 添加内容包装器来控制内容区域 */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 100%;
  overflow: hidden; /* 确保内容不会溢出 */
  display: flex;
  flex-direction: column;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
  color: #ffffff;
}

.error {
  color: #ff6b6b;
}

.edit-playlist {
  padding: 20px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.edit-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px; /* 减少底部边距以节省空间 */
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex-shrink: 0; /* 防止标题被压缩 */
}

.edit-container {
  display: flex;
  gap: 40px;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  padding: 20px; /* 减少内边距以节省空间 */
  margin: 0 auto;
  flex: 1; /* 占用剩余空间 */
  overflow: hidden;
}

.edit-form {
  flex: 1;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
}

.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.save-btn {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #000000;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.edit-cover {
  flex-shrink: 0;
}

.cover-preview {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.cover-preview:hover {
  transform: scale(1.02);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ffff;
  font-size: 48px;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.upload-text {
  color: #00ffff;
  font-size: 14px;
  text-align: center;
}

.checkbox-label-simple {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.checkbox-native {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #00ffff;
}

.privacy-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  margin-left: 24px;
}

/* 标签选择器样式 */
.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-option {
  padding: 8px 16px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  outline: none;
}

.tag-option:hover {
  border-color: rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.1);
  transform: translateY(-1px);
  color: #00ffff;
}

.tag-option.active {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
  color: #00ffff;
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
}

.tag-option.active:hover {
  background: rgba(0, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 255, 255, 0.4);
}
</style>
