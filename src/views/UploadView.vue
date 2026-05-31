<template>
  <div class="upload-container">
    <!-- 原始上传界面 -->
    <div v-if="!showNewUpload" class="main-content">
      <!-- 左侧面板 - 文件上传区域 -->
      <div class="left-panel">
        <div class="upload-section">
          <div class="section-header">
            <h2 class="section-title">上传文件</h2>
            <div class="tech-indicator"></div>
          </div>

          <div class="file-upload-area">
            <!-- 音乐文件上传 -->
            <div class="file-upload-item">
              <label class="file-label">音乐文件 *</label>
              <div
                class="file-drop-zone"
                :class="{ 'drag-over': isDragOver.music, 'has-file': files.musicFile }"
                @drop="(e) => handleDrop(e, 'music')"
                @dragover="(e) => handleDragOver(e, 'music')"
                @dragleave="(e) => handleDragLeave(e, 'music')"
                @click="() => triggerFileInput('music')"
              >
                <input
                  ref="musicFileInput"
                  type="file"
                  accept="audio/*"
                  @change="(e) => handleFileSelect(e, 'music')"
                  style="display: none"
                />

                <div v-if="!files.musicFile" class="drop-zone-content">
                  <svg
                    class="upload-icon"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8.01,12 6,14.01 6,16.5S8.01,21 10.5,21S15,18.99 15,16.5V6H19V3H12Z"
                    />
                  </svg>
                  <p class="drop-text">选择音乐文件</p>
                  <p class="drop-hint">支持 MP3, WAV, FLAC 等格式</p>
                </div>

                <div v-else class="selected-file">
                  <svg
                    class="file-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8.01,12 6,14.01 6,16.5S8.01,21 10.5,21S15,18.99 15,16.5V6H19V3H12Z"
                    />
                  </svg>
                  <div class="file-info">
                    <p class="file-name">{{ files.musicFile.name }}</p>
                    <p class="file-size">{{ formatFileSize(files.musicFile.size) }}</p>
                  </div>
                  <button class="remove-file" @click.stop="() => removeFile('music')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 封面文件上传 -->
            <div class="file-upload-item">
              <label class="file-label">歌曲封面</label>
              <div
                class="file-drop-zone cover-zone"
                :class="{ 'drag-over': isDragOver.cover, 'has-file': files.coverFile }"
                @drop="(e) => handleDrop(e, 'cover')"
                @dragover="(e) => handleDragOver(e, 'cover')"
                @dragleave="(e) => handleDragLeave(e, 'cover')"
                @click="() => triggerFileInput('cover')"
              >
                <input
                  ref="coverFileInput"
                  type="file"
                  accept="image/*"
                  @change="(e) => handleFileSelect(e, 'cover')"
                  style="display: none"
                />

                <div v-if="!files.coverFile" class="drop-zone-content">
                  <svg
                    class="upload-icon"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
                    />
                  </svg>
                  <p class="drop-text">选择封面图片</p>
                  <p class="drop-hint">支持 JPG, PNG 等格式</p>
                </div>

                <div v-else class="selected-file">
                  <img
                    v-if="coverPreview"
                    :src="coverPreview"
                    class="cover-preview"
                    alt="封面预览"
                  />
                  <svg
                    v-else
                    class="file-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
                    />
                  </svg>
                  <div class="file-info">
                    <p class="file-name">{{ files.coverFile.name }}</p>
                    <p class="file-size">{{ formatFileSize(files.coverFile.size) }}</p>
                  </div>
                  <button class="remove-file" @click.stop="() => removeFile('cover')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 歌词文件上传 -->
            <div class="file-upload-item">
              <label class="file-label">歌词文件</label>
              <div
                class="file-drop-zone lrc-zone"
                :class="{ 'drag-over': isDragOver.lrc, 'has-file': files.lrcFile }"
                @drop="(e) => handleDrop(e, 'lrc')"
                @dragover="(e) => handleDragOver(e, 'lrc')"
                @dragleave="(e) => handleDragLeave(e, 'lrc')"
                @click="() => triggerFileInput('lrc')"
              >
                <input
                  ref="lrcFileInput"
                  type="file"
                  accept=".lrc,.txt"
                  @change="(e) => handleFileSelect(e, 'lrc')"
                  style="display: none"
                />

                <div v-if="!files.lrcFile" class="drop-zone-content">
                  <svg
                    class="upload-icon"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    />
                  </svg>
                  <p class="drop-text">选择歌词文件</p>
                  <p class="drop-hint">支持 LRC, TXT 格式</p>
                </div>

                <div v-else class="selected-file">
                  <svg
                    class="file-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    />
                  </svg>
                  <div class="file-info">
                    <p class="file-name">{{ files.lrcFile.name }}</p>
                    <p class="file-size">{{ formatFileSize(files.lrcFile.size) }}</p>
                  </div>
                  <button class="remove-file" @click.stop="() => removeFile('lrc')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 上传进度 -->
            <div v-if="isUploading" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p class="progress-text">上传中... {{ Math.round(uploadProgress) }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 - 歌曲信息表单 -->
      <div class="right-panel">
        <div class="info-section">
          <div class="section-header">
            <h2 class="section-title">歌曲信息</h2>
            <div class="tech-indicator"></div>
          </div>

          <div class="form-container">
            <div class="form-group">
              <label class="form-label">音乐标题 *</label>
              <input
                v-model="songInfo.title"
                type="text"
                class="form-input"
                placeholder="请输入音乐标题"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">艺术家/歌手 *</label>
              <input
                v-model="songInfo.artist"
                type="text"
                class="form-input"
                placeholder="请输入艺术家或歌手名称"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">专辑名称</label>
              <input
                v-model="songInfo.album"
                type="text"
                class="form-input"
                placeholder="请输入专辑名称"
              />
            </div>
          </div>

          <!-- 上传按钮移动到右侧 -->
          <div class="action-buttons">
            <button class="btn-upload" :disabled="!canUpload || isUploading" @click="handleUpload">
              <span class="btn-icon">📤</span>
              {{ isUploading ? '上传中...' : '开始上传' }}
            </button>
            <button class="btn-reset" :disabled="isUploading" @click="resetForm">
              <span class="btn-icon">🔄</span>
              重置
            </button>
            <!-- 修改按钮功能 -->
            <button class="btn-new-upload" @click="toggleUploadMode">
              <span class="btn-icon">✨</span>
              新上传界面
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新的简化上传界面 -->
    <div v-else class="simple-upload-container">
      <div class="simple-upload-header">
        <h2>快速上传</h2>
        <p>请提供网易云音乐链接和上传音乐文件</p>
      </div>

      <div class="simple-form">
        <div class="form-group">
          <label class="form-label">网易云音乐链接 *</label>
          <input
            type="url"
            v-model="simpleForm.neteaseUrl"
            class="form-input"
            placeholder="请输入网易云音乐链接"
            :class="{ error: !simpleForm.neteaseUrl && simpleForm.showErrors }"
          />
        </div>

        <div class="form-group">
          <label class="form-label">音乐文件 *</label>
          <div
            class="simple-file-upload"
            @drop="handleSimpleDrop"
            @dragover.prevent
            @dragenter.prevent
            :class="{ 'drag-over': simpleDragOver, 'has-file': simpleForm.musicFile }"
          >
            <input
              type="file"
              ref="simpleFileInput"
              @change="handleSimpleFileSelect"
              accept="audio/*"
              style="display: none"
            />

            <div
              v-if="!simpleForm.musicFile"
              class="upload-placeholder"
              @click="$refs.simpleFileInput.click()"
            >
              <div class="upload-icon">🎵</div>
              <p>点击选择或拖拽音乐文件到此处</p>
              <p class="upload-hint">支持 MP3, WAV, FLAC 等格式</p>
            </div>

            <div v-else class="file-info">
              <div class="file-details">
                <span class="file-name">{{ simpleForm.musicFile.name }}</span>
                <span class="file-size">({{ formatFileSize(simpleForm.musicFile.size) }})</span>
              </div>
              <button type="button" @click="removeSimpleFile" class="remove-file-btn">×</button>
            </div>
          </div>
        </div>

        <div class="simple-actions">
          <button
            type="button"
            @click="handleSimpleUpload"
            :disabled="!canSimpleUpload || simpleUploading"
            class="upload-btn"
          >
            {{ simpleUploading ? '上传中...' : '开始上传' }}
          </button>

          <button type="button" @click="resetSimpleForm" class="reset-btn">重置</button>

          <button type="button" @click="showNewUpload = false" class="back-btn">
            返回原始上传
          </button>
        </div>
      </div>
    </div>

    <!-- Toast 提示组件 -->
    <Toast
      :visible="toast.visible"
      :message="toast.message"
      :type="toast.type"
      @close="closeToast"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadMusicToAliOSS, uploadMusicWithNeteaseUrl } from '@/api/music'
import Toast from '@/components/Toast.vue'

// 界面切换状态
const showNewUpload = ref(false)

// 新上传界面的数据
const simpleForm = ref({
  neteaseUrl: '',
  musicFile: null,
  showErrors: false,
})

// 简化上传界面状态
const simpleDragOver = ref(false)
const simpleUploading = ref(false)

// 文件相关状态
const files = ref({
  musicFile: null,
  coverFile: null,
  lrcFile: null,
})

const isDragOver = ref({
  music: false,
  cover: false,
  lrc: false,
})

const coverPreview = ref('')

// 表单信息
const songInfo = ref({
  title: '',
  artist: '',
  album: '',
})

// 上传状态
const isUploading = ref(false)
const uploadProgress = ref(0)

// Toast 状态
const toast = ref({
  visible: false,
  message: '',
  type: 'success',
})

// 文件输入引用
const musicFileInput = ref(null)
const coverFileInput = ref(null)
const lrcFileInput = ref(null)
const simpleFileInput = ref(null)

// 计算属性
const canUpload = computed(() => {
  return (
    files.value.musicFile &&
    songInfo.value.title.trim() &&
    songInfo.value.artist.trim() &&
    !isUploading.value
  )
})

// 修改计算属性
const canSimpleUpload = computed(() => {
  return simpleForm.value.neteaseUrl.trim() && simpleForm.value.musicFile && !simpleUploading.value
})

// Toast 方法
const showToast = (message, type = 'success') => {
  toast.value = {
    visible: true,
    message,
    type,
  }
}

const closeToast = () => {
  toast.value.visible = false
}

// 文件处理方法
const triggerFileInput = (type) => {
  const inputMap = {
    music: musicFileInput.value,
    cover: coverFileInput.value,
    lrc: lrcFileInput.value,
  }
  inputMap[type]?.click()
}

const handleDragOver = (e, type) => {
  e.preventDefault()
  isDragOver.value[type] = true
}

const handleDragLeave = (e, type) => {
  e.preventDefault()
  isDragOver.value[type] = false
}

const handleDrop = (e, type) => {
  e.preventDefault()
  isDragOver.value[type] = false

  const droppedFiles = Array.from(e.dataTransfer.files)
  if (droppedFiles.length > 0) {
    processFile(droppedFiles[0], type)
  }
}

const handleFileSelect = (e, type) => {
  const selectedFiles = Array.from(e.target.files)
  if (selectedFiles.length > 0) {
    processFile(selectedFiles[0], type)
  }
}

const processFile = (file, type) => {
  const validTypes = {
    music: ['audio/'],
    cover: ['image/'],
    lrc: ['.lrc', '.txt'],
  }

  let isValid = false

  if (type === 'lrc') {
    isValid = validTypes[type].some((ext) => file.name.toLowerCase().endsWith(ext))
  } else {
    isValid = validTypes[type].some((mimeType) => file.type.startsWith(mimeType))
  }

  if (isValid) {
    files.value[type + 'File'] = file

    // 如果是封面文件，生成预览
    if (type === 'cover') {
      const reader = new FileReader()
      reader.onload = (e) => {
        coverPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    // 自动填充标题（仅当标题为空且上传的是音乐文件时）
    if (type === 'music' && !songInfo.value.title) {
      songInfo.value.title = file.name.replace(/\.[^/.]+$/, '')
    }
  } else {
    const typeNames = {
      music: '音频',
      cover: '图片',
      lrc: '歌词',
    }
    showToast(`请选择有效的${typeNames[type]}文件`, 'error')
  }
}

const removeFile = (type) => {
  files.value[type + 'File'] = null

  if (type === 'cover') {
    coverPreview.value = ''
  }

  const inputMap = {
    music: musicFileInput.value,
    cover: coverFileInput.value,
    lrc: lrcFileInput.value,
  }

  if (inputMap[type]) {
    inputMap[type].value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 上传处理
const handleUpload = async () => {
  if (!canUpload.value) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // 创建 FormData
    const formData = new FormData()

    // 添加必需的文件和信息
    formData.append('musicFile', files.value.musicFile)
    formData.append('title', songInfo.value.title)
    formData.append('artist', songInfo.value.artist)

    // 添加可选的文件和信息
    if (songInfo.value.album) {
      formData.append('album', songInfo.value.album)
    }

    if (files.value.coverFile) {
      formData.append('coverFile', files.value.coverFile)
    }

    if (files.value.lrcFile) {
      formData.append('lrcFile', files.value.lrcFile)
    }

    // 添加进度回调
    formData.onProgress = (progress) => {
      uploadProgress.value = progress
    }

    console.log('开始上传音乐文件...')

    // 调用上传API
    const response = await uploadMusicToAliOSS(formData)

    uploadProgress.value = 100

    if (response.code === 1) {
      showToast('上传成功！', 'success')
      console.log('上传成功:', response.data)

      // 延迟重置表单，让用户看到成功状态
      setTimeout(() => {
        resetForm()
      }, 2000)
    } else {
      throw new Error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)

    let errorMessage = '上传失败，请重试'

    if (error.response) {
      // 服务器返回错误
      errorMessage = error.response.data?.msg || error.response.data?.message || errorMessage
    } else if (error.message) {
      // 网络错误或其他错误
      errorMessage = error.message
    }

    showToast(errorMessage, 'error')
  } finally {
    isUploading.value = false

    // 延迟重置进度条
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
  }
}

// 重置表单
const resetForm = () => {
  files.value = {
    musicFile: null,
    coverFile: null,
    lrcFile: null,
  }

  songInfo.value = {
    title: '',
    artist: '',
    album: '',
  }

  coverPreview.value = ''
  uploadProgress.value = 0

  // 清空文件输入
  if (musicFileInput.value) musicFileInput.value.value = ''
  if (coverFileInput.value) coverFileInput.value.value = ''
  if (lrcFileInput.value) lrcFileInput.value.value = ''
}

// 切换上传界面模式
const toggleUploadMode = () => {
  showNewUpload.value = !showNewUpload.value
  if (!showNewUpload.value) {
    // 返回原界面时重置新上传表单
    resetSimpleForm()
  }
}

// 简化上传界面的文件处理
const handleSimpleDrop = (e) => {
  e.preventDefault()
  simpleDragOver.value = false

  const droppedFiles = Array.from(e.dataTransfer.files)
  if (droppedFiles.length > 0) {
    processSimpleFile(droppedFiles[0])
  }
}

const handleSimpleFileSelect = (e) => {
  const selectedFiles = Array.from(e.target.files)
  if (selectedFiles.length > 0) {
    processSimpleFile(selectedFiles[0])
  }
}

const processSimpleFile = (file) => {
  if (file.type.startsWith('audio/')) {
    simpleForm.value.musicFile = file
  } else {
    showToast('请选择有效的音频文件', 'error')
  }
}

const removeSimpleFile = () => {
  simpleForm.value.musicFile = null
  if (simpleFileInput.value) {
    simpleFileInput.value.value = ''
  }
}

// 简化上传处理
const handleSimpleUpload = async () => {
  // 验证两个必填项
  if (!simpleForm.value.neteaseUrl.trim()) {
    simpleForm.value.showErrors = true
    showToast('请输入网易云音乐链接', 'error')
    return
  }

  if (!simpleForm.value.musicFile) {
    showToast('请选择音乐文件', 'error')
    return
  }

  simpleUploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('neteaseUrl', simpleForm.value.neteaseUrl)
    formData.append('musicFile', simpleForm.value.musicFile)

    // 添加进度回调
    formData.onProgress = (progress) => {
      uploadProgress.value = progress
    }

    console.log('开始上传:', simpleForm.value.neteaseUrl)
    const response = await uploadMusicWithNeteaseUrl(formData)

    uploadProgress.value = 100

    if (response.code === 1) {
      showToast('上传成功！', 'success')
      console.log('上传成功:', response.data)
      setTimeout(() => {
        resetSimpleForm()
      }, 2000)
    } else {
      throw new Error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    let errorMessage = '上传失败，请重试'

    if (error.response) {
      errorMessage = error.response.data?.msg || error.response.data?.message || errorMessage
    } else if (error.message) {
      errorMessage = error.message
    }

    showToast(errorMessage, 'error')
  } finally {
    simpleUploading.value = false
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
  }
}

// 重置简化表单
const resetSimpleForm = () => {
  simpleForm.value = {
    neteaseUrl: '',
    musicFile: null,
    showErrors: false,
  }
  simpleDragOver.value = false
  if (simpleFileInput.value) {
    simpleFileInput.value.value = ''
  }
}
</script>

<style scoped>
.upload-container {
  height: calc(100vh - 160px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow: hidden;
  position: relative;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.upload-section,
.info-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tech-indicator {
  width: 8px;
  height: 8px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.file-upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
}

.file-upload-area::-webkit-scrollbar {
  width: 6px;
}

.file-upload-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.file-upload-area::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.file-upload-item {
  margin-bottom: 16px;
}

.file-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.file-drop-zone {
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-drop-zone:hover,
.file-drop-zone.drag-over {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.05);
  transform: translateY(-2px);
}

.file-drop-zone.has-file {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.cover-zone.has-file {
  min-height: 120px;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  color: rgba(0, 255, 255, 0.6);
  margin-bottom: 4px;
}

.drop-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #ffffff;
}

.drop-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  width: 100%;
}

.file-icon {
  color: #00ff88;
  flex-shrink: 0;
}

.cover-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 2px 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.remove-file {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #ff4444;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-file:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff4444;
}

.upload-progress {
  margin: 16px 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff 0%, #0080ff 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-upload,
.btn-reset {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-upload {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #000000;
}

.btn-upload:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
}

.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-reset {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-reset:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
}

.form-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.form-container::-webkit-scrollbar {
  width: 6px;
}

.form-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00ffff;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-select option {
  background: #1a1a2e;
  color: #ffffff;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 新上传界面样式 */
.simple-upload-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.simple-upload-header {
  text-align: center;
  margin-bottom: 40px;
}

.simple-upload-header h2 {
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.simple-upload-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.simple-form {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
}

.simple-file-upload {
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simple-file-upload:hover,
.simple-file-upload.drag-over {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.05);
  transform: translateY(-4px);
}

.simple-file-upload.has-file {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
  min-height: 120px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-placeholder p {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.upload-hint {
  font-size: 14px !important;
  color: rgba(255, 255, 255, 0.6) !important;
  font-weight: 400 !important;
}

.file-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.file-size {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.remove-file-btn {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff4444;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.remove-file-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff4444;
}

.simple-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  flex-wrap: wrap;
}

.upload-btn,
.reset-btn,
.back-btn {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.upload-btn {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: white;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-2px);
}

.form-input.error {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.05);
}

.btn-new-upload {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-new-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-new-upload:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .upload-container {
    height: auto;
    min-height: calc(100vh - 160px);
  }

  .left-panel,
  .right-panel {
    height: auto;
  }

  .upload-section,
  .info-section {
    height: auto;
  }

  .simple-upload-container {
    padding: 20px 16px;
  }

  .simple-upload-header h2 {
    font-size: 24px;
  }

  .simple-file-upload {
    padding: 30px 20px;
    min-height: 160px;
  }

  .simple-actions {
    flex-direction: column;
    align-items: center;
  }

  .upload-btn,
  .reset-btn,
  .back-btn {
    width: 100%;
    max-width: 280px;
  }
}

/* 输入验证样式 */
.form-input.input-error {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.05);
}

.form-input.input-success {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.validation-message {
  font-size: 12px;
  margin-top: 4px;
  color: #00ff88;
}

.validation-message.error {
  color: #ff4444;
}

.form-input:invalid {
  border-color: rgba(255, 68, 68, 0.5);
}

.form-input:valid {
  border-color: rgba(0, 255, 136, 0.5);
}

@media (max-width: 768px) {
  .simple-upload-container {
    padding: 16px;
  }

  .simple-form {
    padding: 20px;
  }

  .simple-actions {
    flex-direction: column;
    align-items: center;
  }

  .simple-upload-header {
    margin-bottom: 24px;
  }

  .simple-upload-header h2 {
    font-size: 20px;
  }
}
</style>
