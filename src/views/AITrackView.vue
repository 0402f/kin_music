<template>
  <div class="ai-track-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 上半部分：提示词输入区域 -->
        <div class="prompt-section">
          <div class="section-header">
            <h2 class="section-title">AI音轨生成</h2>
            <div class="tech-indicator"></div>
          </div>

          <div class="prompt-form">
            <div class="form-group">
              <label class="form-label">音乐描述</label>
              <textarea
                v-model="prompt"
                class="prompt-input"
                placeholder="描述您想要的音乐风格、情感、乐器等..."
                rows="4"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">音轨标题</label>
                <input v-model="title" class="form-input" placeholder="为您的音轨命名" />
              </div>
              <div class="form-group">
                <label class="form-label">标签</label>
                <input v-model="tags" class="form-input" placeholder="流行,电子,放松" />
              </div>
            </div>

            <div class="action-buttons">
              <button class="btn-generate" :disabled="isGenerating" @click="handleGenerate">
                <span class="btn-icon">🎵</span>
                {{ isGenerating ? '生成中...' : '开始生成' }}
              </button>
              <button class="btn-simple" :disabled="isGenerating" @click="handleQuickGenerate">
                <span class="btn-icon">⚡</span>
                快速生成
              </button>
            </div>
          </div>
        </div>

        <!-- 下半部分：生成进度区域 -->
        <div class="progress-section">
          <div class="section-header">
            <h3 class="section-title">生成进度</h3>
            <div class="status-indicator" :class="{ active: isGenerating }"></div>
          </div>

          <div class="progress-content">
            <div v-if="!isGenerating && !currentTask" class="idle-state">
              <div class="idle-icon">🎼</div>
              <p>准备就绪，等待生成指令</p>
            </div>

            <div v-if="isGenerating" class="generating-state">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="progress-info">
                <span class="progress-text">{{ progressText }}</span>
                <span class="progress-percent">{{ progress.toFixed(2) }}%</span>
              </div>
              <div class="tech-lines">
                <div class="tech-line" v-for="i in 3" :key="i"></div>
              </div>
            </div>

            <div v-if="currentTask" class="task-info">
              <div class="task-id">任务ID: {{ currentTask.id }}</div>
              <div class="task-status" :class="currentTask.status">
                状态: {{ getStatusText(currentTask.status) }}
              </div>
              <div class="task-time">创建时间: {{ currentTask.createdAt }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板：历史记录 -->
      <div class="right-panel">
        <div class="history-section">
          <div class="section-header">
            <h3 class="section-title">生成历史</h3>
            <button class="btn-refresh" @click="refreshHistory">
              <svg
                class="refresh-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4V9H4.58152M4.58152 9C5.24618 7.35652 6.43101 5.9604 7.97104 5.05552C9.51107 4.15064 11.3158 3.7893 13.0914 4.02315C14.867 4.25737 16.5209 5.08165 17.7845 6.35872C19.0481 7.6358 19.8414 9.29619 20.0313 11.0748M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.7538 16.6435 17.569 18.0396 16.029 18.9445C14.4889 19.8494 12.6842 20.2107 10.9086 19.9769C9.133 19.7426 7.47913 18.9183 6.21553 17.6413C4.95193 16.3642 4.15866 14.7038 3.96875 12.9252M19.4185 15H15"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="history-grid">
            <div
              v-for="track in historyTracks"
              :key="track.id"
              class="history-card"
              :class="track.status"
            >
              <div class="card-header">
                <h4 class="track-title">{{ track.title }}</h4>
                <div class="status-badge" :class="track.status">
                  {{ getStatusText(track.status) }}
                </div>
              </div>

              <div class="card-content">
                <p class="track-prompt">{{ track.prompt }}</p>
                <div class="track-meta">
                  <span class="track-time">{{ formatTime(track.createdAt) }}</span>
                  <span class="track-duration" v-if="track.duration">{{ track.duration }}s</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  v-if="track.generationStatus === 1"
                  class="action-btn play"
                  @click="handlePlay(track)"
                >
                  <svg
                    class="btn-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button
                  v-if="track.generationStatus === 1"
                  class="action-btn download"
                  @click="handleDownload(track)"
                >
                  <svg
                    class="btn-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                </button>
                <button
                  v-if="track.generationStatus === 2"
                  class="action-btn refresh"
                  @click="refreshHistory"
                  title="刷新"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 4V9H4.58152M4.58152 9C5.24618 7.35652 6.43101 5.9604 7.97104 5.05552C9.51107 4.15064 11.3158 3.7893 13.0914 4.02315C14.867 4.25737 16.5209 5.08165 17.7845 6.35872C19.0481 7.6358 19.8414 9.29619 20.0313 11.0748M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.7538 16.6435 17.569 18.0396 16.029 18.9445C14.4889 19.8494 12.6842 20.2107 10.9086 19.9769C9.133 19.7426 7.47913 18.9183 6.21553 17.6413C4.95193 16.3642 4.15866 14.7038 3.96875 12.9252M19.4185 15H15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button class="action-btn delete" @click="handleDelete(track)">
                  <svg
                    class="btn-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                    />
                  </svg>
                </button>
              </div>

              <!-- 科技风格装饰线条 -->
              <div class="card-tech-lines">
                <div class="tech-corner top-left"></div>
                <div class="tech-corner top-right"></div>
                <div class="tech-corner bottom-left"></div>
                <div class="tech-corner bottom-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      :visible="showDeleteModal"
      title="确认删除"
      :message="`确定要删除音轨吗？此操作不可撤销。`"
      type="warning"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      @close="showDeleteModal = false"
    />

    <!-- Toast提示组件 -->
    <Toast :visible="toastVisible" :message="toastMessage" :type="toastType" @close="closeToast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { generateAITrack, getAITrackHistory, deleteAITrack } from '../api/aitrack'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import Toast from '../components/Toast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// 添加音频播放器store
const audioStore = useAudioStore()
const { playSong } = audioStore

// 添加用户store
const userStore = useUserStore()

// 添加Toast相关状态
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('error')

// 显示Toast的方法
const showToastMessage = (message, type = 'error') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

// 关闭Toast的方法
const closeToast = () => {
  toastVisible.value = false
}

// 删除相关状态
const showDeleteModal = ref(false)
const currentTrack = ref(null)

// 响应式数据
const prompt = ref('') // 这个就是音乐描述，作为description发送
const title = ref('')
const tags = ref('')
const isGenerating = ref(false)
const progress = ref(0)
const progressText = ref('准备中...')
const currentTask = ref(null)
const historyTracks = ref([])

// 在script setup中添加或修改以下内容

// 统一的生成函数
const generateTrack = async (isQuick = false) => {
  if (!prompt.value.trim()) {
    alert('请输入音乐描述')
    return
  }

  try {
    isGenerating.value = true
    progress.value = 0
    progressText.value = '正在提交生成请求...'

    // 构建请求数据
    const requestData = {
      description: prompt.value,
      title: title.value || (isQuick ? `AI音轨_${Date.now()}` : '未命名音轨'),
      tags: tags.value,
    }

    // 立即开始进度条动画
    startProgressAnimation()

    const response = await generateAITrack(requestData)

    // 当API调用成功返回响应时，开始轮询检查状态
    if (response.data) {
      currentTask.value = response.data
      progressText.value = '生成中，请稍候...'

      // 开始轮询检查生成状态
      startPolling()

      // 立即刷新一次历史记录
      await loadHistory()
    }
  } catch (error) {
    console.error('生成失败:', error)

    // 根据错误类型给出不同提示
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      progressText.value = '请求超时，但生成任务可能已经开始，请稍后查看历史记录'
      // 即使超时也尝试刷新历史记录，因为任务可能已经创建
      setTimeout(() => {
        loadHistory()
      }, 10000) // 10秒后刷新一次
    } else {
      progressText.value = '生成失败，请重试'
    }

    isGenerating.value = false
    progress.value = 0
  }
}

// 新增：进度条动画函数
const startProgressAnimation = () => {
  const animationInterval = setInterval(() => {
    if (progress.value < 85) {
      progress.value += Math.random() * 5 + 2 // 随机增长2-7%
      progressText.value = `生成中... ${progress.value.toFixed(2)}%`
    } else if (progress.value < 90) {
      progress.value += 1 // 缓慢增长到90%
      progressText.value = `生成中... ${progress.value.toFixed(2)}%`
    }

    // 如果不在生成状态，停止动画
    if (!isGenerating.value) {
      clearInterval(animationInterval)
    }
  }, 500) // 每500ms更新一次
}

// 开始生成（普通模式）
const handleGenerate = async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    showToastMessage('请先登录后再使用AI音轨生成功能')
    return
  }
  await generateTrack(false)
}

// 快速生成
const handleQuickGenerate = async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    showToastMessage('请先登录后再使用AI音轨生成功能')
    return
  }
  await generateTrack(true)
}

// 清空表单
const clearForm = () => {
  prompt.value = ''
  title.value = ''
  tags.value = ''
}

// 加载历史记录
const loadHistory = async () => {
  try {
    const response = await getAITrackHistory()
    if (response.data) {
      console.log('历史记录原始数据:', response.data)

      const newTracks = response.data.map((track) => ({
        ...track,
        createdAt: new Date(track.createTime),
        status: track.generationStatus || 'pending',
      }))

      console.log('处理后的历史记录:', newTracks)

      // 如果正在生成中，检查最新音轨状态
      if (isGenerating.value) {
        const latestTrack = newTracks[0]
        if (latestTrack) {
          console.log('当前生成状态:', isGenerating.value)
          console.log('最新音轨:', latestTrack)
          console.log('最新音轨状态:', latestTrack.generationStatus, latestTrack.status)

          // 检查生成状态：1表示成功
          const isCompleted = latestTrack.generationStatus === 1
          const isFailed = latestTrack.generationStatus === 0

          if (isCompleted) {
            console.log('检测到任务完成，更新进度条')
            isGenerating.value = false
            progress.value = 100
            progressText.value = '生成完成！'
            currentTask.value = null
            clearForm()
          }

          if (isFailed) {
            console.log('检测到任务失败')
            isGenerating.value = false
            progress.value = 0
            progressText.value = '生成失败'
            currentTask.value = null
          }
        }
      }

      historyTracks.value = newTracks
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 下载音轨
const handleDownload = async (track) => {
  try {
    // 获取音频文件URL（与播放功能使用相同的逻辑）
    const audioUrl = track.fileUrl || track.audioUrl || track.file_url

    if (!audioUrl) {
      alert('该音轨暂无可下载的音频文件')
      return
    }

    // 直接创建下载链接
    const link = document.createElement('a')
    link.href = audioUrl
    link.setAttribute('download', `${track.title || '音轨'}.${track.format || 'mp3'}`)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}

// 轮询变量
let pollInterval = null

// 开始轮询检查生成状态
const startPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }

  pollInterval = setInterval(async () => {
    if (!isGenerating.value) {
      clearInterval(pollInterval)
      return
    }

    try {
      const response = await getAITrackHistory()
      if (response.data && response.data.length > 0) {
        const latestTrack = response.data[0]
        console.log('轮询检查最新音轨状态:', latestTrack.generationStatus)

        // 检查生成状态：1表示成功
        const isCompleted = latestTrack.generationStatus === 1
        const isFailed = latestTrack.generationStatus === 0

        if (isCompleted) {
          clearInterval(pollInterval)
          isGenerating.value = false
          progress.value = 100
          progressText.value = '生成完成！'
          currentTask.value = null
          clearForm()
          await loadHistory()
          return
        }

        if (isFailed) {
          clearInterval(pollInterval)
          isGenerating.value = false
          progress.value = 0
          progressText.value = '生成失败'
          currentTask.value = null
          await loadHistory()
          return
        }
      }
    } catch (error) {
      console.error('轮询检查状态失败:', error)
    }
  }, 3000) // 每3秒检查一次
}

// 添加播放函数
const handlePlay = async (track) => {
  try {
    // 检查音轨是否有音频文件URL
    const audioUrl = track.fileUrl

    if (!audioUrl) {
      console.error('音轨没有可播放的音频文件')
      alert('该音轨暂无可播放的音频文件')
      return
    }

    // 构建歌曲对象，符合全局播放器的数据结构
    const song = {
      id: track.id,
      title: track.title || '未命名音轨',
      artist: track.artist || 'AI生成',
      album: track.album || 'AI音轨',
      duration: track.duration || 0,
      url: audioUrl,
      cover: track.coverUrl,
    }

    // 调用全局播放器播放
    await playSong(song)
    console.log('开始播放音轨:', track.title)
  } catch (error) {
    console.error('播放音轨失败:', error)
    alert('播放失败，请重试')
  }
}

// 删除音轨
const handleDelete = (track) => {
  currentTrack.value = track
  showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentTrack.value) return

  try {
    await deleteAITrack(currentTrack.value.id)
    showToastMessage('删除成功', 'success')
    // 刷新列表
    await loadHistory()
  } catch (error) {
    console.error('删除失败:', error)
    showToastMessage('删除失败，请重试', 'error')
  } finally {
    showDeleteModal.value = false
    currentTrack.value = null
  }
}

// 刷新历史记录
const refreshHistory = async () => {
  await loadHistory()
}

// 获取状态文本 - 根据后端数据结构更新
const getStatusText = (track) => {
  // 根据 generationStatus 字段判断
  switch (track.generationStatus) {
    case 1:
      return '已完成'
    case 0:
      return '失败'
    case 2:
      return '处理中'
    default:
      return ''
  }
}

// 格式化时间
const formatTime = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// 组件卸载时清理轮询
import { onUnmounted } from 'vue'

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.ai-track-container {
  height: calc(100vh - 160px); /* 减去顶部导航栏(60px)和底部播放器(100px) */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow: hidden; /* 防止整体页面滚动 */
  position: relative;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%; /* 占满容器高度 */
  overflow: hidden; /* 防止主内容区滚动 */
}

/* 左侧面板 - 完全固定 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  overflow: hidden; /* 左侧不允许滚动 */
}

/* 提示词输入区域 - 增加高度确保按钮显示 */
.prompt-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  height: auto;
  max-height: 60%; /* 增加到60%，确保有足够空间显示按钮 */
  min-height: 350px; /* 设置最小高度确保按钮可见 */
}

.prompt-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #00ffff;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.tech-indicator {
  width: 12px;
  height: 12px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 20px #00ffff;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.prompt-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.prompt-input,
.form-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  resize: none;
}

.prompt-input:focus,
.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.prompt-input::placeholder,
.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.btn-generate,
.btn-simple {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  color: #000000;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.btn-generate:hover,
.btn-simple:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
}

.btn-generate:disabled,
.btn-simple:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-simple {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
}

.btn-icon {
  font-size: 16px;
}

/* 生成进度区域 - 缩小高度 */
.progress-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  overflow: hidden;
  min-height: 0;
  max-height: 40%; /* 限制最大高度为40% */
}

.status-indicator {
  width: 12px;
  height: 12px;
  background: #666;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #ff6b6b;
  box-shadow: 0 0 20px #ff6b6b;
  animation: pulse 1s ease-in-out infinite;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow: hidden;
  min-height: 0; /* 允许flex子项收缩 */
}

.idle-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.idle-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.generating-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff6b6b);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.progress-text {
  color: #b0b0b0;
}

.progress-percent {
  color: #00ffff;
  font-weight: 600;
}

.tech-lines {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.tech-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: techPulse 2s ease-in-out infinite;
}

.tech-line:nth-child(2) {
  animation-delay: 0.3s;
}

.tech-line:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes techPulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.task-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
}

.task-id {
  color: #00ffff;
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
}

.task-status {
  margin-bottom: 8px;
  font-weight: 500;
}

.task-status.completed {
  color: #4ade80;
}

.task-status.processing {
  color: #fbbf24;
}

.task-status.failed {
  color: #f87171;
}

.task-time {
  color: #9ca3af;
  font-size: 12px;
}

/* 右侧面板 - 固定高度，只允许历史记录滚动 */
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 历史记录区域 */
.history-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(128, 0, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.2);
}

.refresh-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.btn-refresh:hover .refresh-icon {
  transform: rotate(180deg);
}

/* action-btn 中的 SVG 图标样式 */
.action-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.action-btn.refresh:hover svg {
  transform: rotate(180deg);
}

/* 历史记录网格 - 只有这里可以滚动 */
.history-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 20px; /* 底部留白 */
  min-height: 0; /* 允许flex子项收缩 */
}

/* 自定义滚动条样式 */
.history-grid::-webkit-scrollbar {
  width: 6px;
}

.history-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.history-grid::-webkit-scrollbar-thumb {
  background: rgba(128, 0, 255, 0.5);
  border-radius: 3px;
}

.history-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 0, 255, 0.7);
}

/* 确保历史卡片不会被压缩 */
.history-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(128, 0, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  flex-shrink: 0; /* 防止卡片被压缩 */
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 255, 255, 0.5);
}

.history-card.completed {
  border-left: 4px solid #4ade80;
}

.history-card.processing {
  border-left: 4px solid #fbbf24;
}

.history-card.failed {
  border-left: 4px solid #f87171;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.track-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  flex: 1;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.completed {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.status-badge.processing {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-badge.failed {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.card-content {
  margin-bottom: 16px;
}

.track-prompt {
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.track-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
}

.track-duration {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 14px;
  height: 14px;
  transition: all 0.3s ease;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-btn.play:hover {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
  color: #4ade80;
}

.action-btn.download:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-btn.refresh:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  color: #fbbf24;
}

.action-btn.delete:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: #f87171;
  color: #f87171;
}

.card-tech-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.tech-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.tech-corner.top-left {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
}

.tech-corner.top-right {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
}

.tech-corner.bottom-left {
  bottom: 8px;
  left: 8px;
  border-right: none;
  border-top: none;
}

.tech-corner.bottom-right {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 18px;
  }

  .prompt-section,
  .progress-section,
  .history-section {
    padding: 16px;
  }
}
</style>
