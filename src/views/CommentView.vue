<template>
  <div class="comment-view">
    <!-- 歌曲信息区域 -->
    <div class="song-info-section">
      <div class="song-cover">
        <img
          v-if="songInfo.cover"
          :src="songInfo.cover"
          :alt="songInfo.title"
          @error="handleImageError"
        />
        <div v-else class="cover-placeholder">
          <span class="music-icon">🎵</span>
        </div>
      </div>

      <div class="song-details">
        <h1 class="song-title">{{ songInfo.title || '歌曲标题' }}</h1>
        <p class="song-artist">{{ songInfo.artist || '未知歌手' }}</p>
        <p class="song-album">专辑：{{ songInfo.album || songInfo.title || '未知专辑' }}</p>
      </div>
    </div>

    <!-- 评论统计 -->
    <div class="comment-stats">
      <h2>
        全部评论 <span class="comment-count">{{ commentCount }}</span>
      </h2>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-section">
      <div class="input-container">
        <textarea
          v-model="commentText"
          placeholder="说点什么吧"
          class="comment-textarea"
          :maxlength="1000"
          rows="3"
        ></textarea>
        <div class="input-footer">
          <span class="char-count">{{ commentText.length }}/1000</span>
          <div class="input-actions">
            <button class="emoji-btn" @click="toggleEmojiPicker" title="表情">😊</button>
            <button class="mention-btn" @click="handleMention" title="@某人">@</button>
            <button class="hashtag-btn" @click="handleHashtag" title="话题">#</button>
            <button class="submit-btn" @click="submitComment" :disabled="!commentText.trim()">
              发布
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表区域 -->
    <div class="comments-section">
      <!-- 精彩评论 -->
      <div v-if="hotComments.length > 0" class="hot-comments">
        <h3 class="section-title">精彩评论</h3>
        <div class="comment-list">
          <div v-for="comment in hotComments" :key="comment.id" class="comment-item hot-comment">
            <div class="comment-avatar">
              <img
                :src="comment.user.avatar || '/default-avatar.jpg'"
                :alt="comment.user.username"
                @error="handleAvatarError"
              />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="username">{{ comment.user.username }}</span>
                <span class="comment-time"></span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <!-- 更新为新的底部布局 -->
              <div class="comment-footer">
                <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                <div class="comment-actions">
                  <button
                    class="action-btn like-btn"
                    :class="{ active: comment.isLiked }"
                    @click="toggleCommentLike(comment)"
                  >
                    <svg
                      class="like-icon"
                      :class="{ liked: comment.isLiked }"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                    <span class="count">{{ formatCount(comment.likeCount) }}</span>
                  </button>
                  <button class="action-btn reply-btn" @click="replyToComment(comment)">
                    <svg class="reply-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                      />
                    </svg>
                    <span class="count">{{ comment.replyCount || '' }}</span>
                  </button>
                  <button class="action-btn share-btn" @click="shareComment(comment)">
                    <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 回复列表 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <span class="reply-user">{{ reply.user.username }}</span>
                  <span v-if="reply.replyToUsername" class="reply-to">
                    回复 @{{ reply.replyToUsername }}：
                  </span>
                  <span class="reply-content">{{ reply.content }}</span>
                </div>
                <button
                  v-if="comment.replyCount > comment.replies.length"
                  class="load-more-replies"
                >
                  查看更多回复
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新评论 -->
      <div class="latest-comments">
        <h3 class="section-title">最新评论</h3>
        <div class="comment-list">
          <div v-for="comment in latestComments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <img
                :src="comment.user.avatar || '/default-avatar.jpg'"
                :alt="comment.user.username"
                @error="handleAvatarError"
              />
            </div>
            <!-- 在comment-content内部，将comment-actions移到新的comment-footer中 -->
            <div class="comment-content">
              <div class="comment-header">
                <span class="username">{{ comment.user.username }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <!-- 更新为新的底部布局 -->
              <div class="comment-footer">
                <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                <div class="comment-actions">
                  <button
                    class="action-btn like-btn"
                    :class="{ active: comment.isLiked }"
                    @click="toggleCommentLike(comment)"
                  >
                    <svg
                      class="like-icon"
                      :class="{ liked: comment.isLiked }"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                    <span class="count">{{ formatCount(comment.likeCount) }}</span>
                  </button>
                  <button class="action-btn reply-btn" @click="replyToComment(comment)">
                    <svg class="reply-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                      />
                    </svg>
                    <span class="count">{{ comment.replyCount || '' }}</span>
                  </button>
                  <button class="action-btn share-btn" @click="shareComment(comment)">
                    <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 回复列表保持不变 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <span class="reply-user">{{ reply.user.username }}</span>
                  <span v-if="reply.replyToUsername" class="reply-to">
                    回复 @{{ reply.replyToUsername }}：
                  </span>
                  <span class="reply-content">{{ reply.content }}</span>
                </div>
                <button
                  v-if="comment.replyCount > comment.replies.length"
                  class="load-more-replies"
                >
                  查看更多回复
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="hotComments.length === 0 && latestComments.length === 0" class="empty-comments">
        <div class="empty-icon">💬</div>
        <p>还没有评论，快来抢沙发吧！</p>
      </div>
    </div>
    <!-- 添加Toast组件 -->
    <Toast
      :visible="toast.visible"
      :message="toast.message"
      :type="toast.type"
      @close="closeToast"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 修改导入语句，给API函数重命名
import {
  getNestedComments,
  postComment,
  toggleCommentLike as toggleCommentLikeAPI,
} from '@/api/comment'
// 导入Toast组件
import Toast from '@/components/Toast.vue'

const route = useRoute()
// 歌曲信息
const songInfo = ref({
  id: null,
  title: '',
  artist: '',
  album: '',
  cover: '',
})

// 评论相关状态
const commentText = ref('')
const allComments = ref([])
const loading = ref(false)
const total = ref(0)

// Toast相关状态
const toast = ref({
  visible: false,
  message: '',
  type: 'success',
})

// 计算属性：分离热门评论和最新评论
const hotComments = computed(() => {
  // 根据点赞数和回复数判断热门评论，并按点赞数量排序
  return allComments.value
    .filter((comment) => comment.likeCount > 5 || comment.replyCount > 2)
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)) // 按点赞数量从高到低排序
    .slice(0, 3) // 只显示前3条热门评论
})

const latestComments = computed(() => {
  // 显示所有评论，按时间排序
  return allComments.value
    .filter((comment) => !hotComments.value.find((hot) => hot.id === comment.id))
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

const commentCount = computed(() => total.value)

// 获取路由参数中的歌曲信息
onMounted(() => {
  const musicData = route.query
  if (musicData.id) {
    songInfo.value = {
      id: musicData.id,
      title: musicData.title || '',
      artist: musicData.artist || '',
      album: musicData.album || musicData.title || '',
      cover: musicData.cover || musicData.coverFileUrl || '',
    }

    // 加载评论数据
    loadComments()
  }
})

// 加载评论数据
const loadComments = async () => {
  if (!songInfo.value.id) return

  try {
    loading.value = true
    const response = await getNestedComments({
      targetType: 1, // 1表示歌曲
      targetId: songInfo.value.id,
    })

    if (response.code === 1) {
      allComments.value = response.data.comments.map((comment) => ({
        ...comment,
        user: {
          ...comment.user,
          username: comment.user.nickname || comment.user.username,
          avatar: comment.user.avatarUrl,
        },
        replies: comment.replies
          ? comment.replies.map((reply) => ({
              ...reply,
              user: {
                ...reply.user,
                username: reply.user.nickname || reply.user.username,
                avatar: reply.user.avatarUrl,
              },
              replyToUsername:
                reply.parentComment?.user?.nickname || reply.parentComment?.user?.username,
            }))
          : [],
      }))
      total.value = response.data.total
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    // 可以添加错误提示
  } finally {
    loading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim() || !songInfo.value.id) return

  try {
    const response = await postComment({
      targetType: 1, // 1表示歌曲
      targetId: songInfo.value.id,
      content: commentText.value.trim(),
    })

    if (response.code === 1) {
      commentText.value = ''
      // 显示成功提示
      showToast('评论发表成功！', 'success')
      // 重新加载评论列表
      await loadComments()
    } else {
      // 显示失败提示
      showToast(response.message || '评论发表失败，请重试', 'error')
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    // 显示错误提示
    showToast('网络错误，请检查网络连接后重试', 'error')
  }
}

// 在 script setup 部分添加或修改
import { getMusicDetail } from '@/api/music'

// 获取音乐信息的函数
const fetchMusicInfo = async (musicId) => {
  try {
    const response = await getMusicDetail(musicId)
    if (response.code === 1 && response.data) {
      const music = response.data
      songInfo.value = {
        id: music.id,
        title: music.title,
        artist: music.artist,
        album: music.album,
        cover: music.coverFileUrl,
      }
      // 加载评论数据
      loadComments()
    } else {
      showToast('获取音乐信息失败', 'error')
    }
  } catch (error) {
    console.error('获取音乐信息失败:', error)
    showToast('获取音乐信息失败', 'error')
  }
}

// 修改 onMounted 逻辑
onMounted(() => {
  // 优先从路由 state 获取音乐信息
  const routeState = history.state
  if (routeState && routeState.musicInfo) {
    // 直接使用 state 中的音乐信息
    songInfo.value = {
      id: routeState.musicInfo.id,
      title: routeState.musicInfo.title,
      artist: routeState.musicInfo.artist,
      album: routeState.musicInfo.album,
      cover: routeState.musicInfo.cover,
    }
    // 加载评论数据
    loadComments()
  } else {
    // 如果没有 state 数据，根据 ID 请求音乐信息（降级处理）
    const musicId = route.query.id
    if (musicId) {
      fetchMusicInfo(musicId)
    }
  }
})

// 显示Toast提示
const showToast = (message, type = 'success') => {
  toast.value = {
    visible: true,
    message,
    type,
  }
}

// 关闭Toast
const closeToast = () => {
  toast.value.visible = false
}

// 切换评论点赞
const toggleCommentLike = async (comment) => {
  try {
    const response = await toggleCommentLikeAPI(comment.id) // 使用重命名后的API函数

    if (response.code === 1) {
      // 更新本地状态
      comment.isLiked = !comment.isLiked
      comment.likeCount += comment.isLiked ? 1 : -1
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

// 回复评论
const replyToComment = (comment) => {
  // TODO: 实现回复功能
  console.log('回复评论:', comment)
  // 可以设置一个回复状态，显示回复输入框
}

// 表情选择器
const toggleEmojiPicker = () => {
  // TODO: 实现表情选择器
  console.log('打开表情选择器')
}

// @某人
const handleMention = () => {
  // TODO: 实现@功能
  console.log('@某人')
}

// 话题标签
const handleHashtag = () => {
  // TODO: 实现话题功能
  console.log('添加话题')
}

// 格式化时间
const formatTime = (timeString) => {
  const time = new Date(timeString)
  const now = new Date()
  const diff = now - time

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return time.toLocaleDateString()
}

// 格式化数字显示
const formatCount = (count) => {
  if (!count || count === 0) return ''
  if (count < 10000) return count.toString()
  if (count < 100000) {
    const w = (count / 10000).toFixed(1)
    return w.endsWith('.0') ? `${Math.floor(count / 10000)}w` : `${w}w`
  }
  return `${Math.floor(count / 10000)}w`
}

// 图片错误处理
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const handleAvatarError = (event) => {
  event.target.src = '/default-avatar.jpg'
}

// 在现有的函数后添加
const shareComment = (comment) => {
  // 分享评论功能
  if (navigator.share) {
    navigator.share({
      title: '精彩评论分享',
      text: comment.content,
      url: window.location.href,
    })
  } else {
    // 复制到剪贴板作为备选方案
    navigator.clipboard.writeText(`${comment.content} - 来自音乐评论`)
    // 这里可以显示一个提示消息
    console.log('评论已复制到剪贴板')
  }
}
</script>

<style scoped>
.comment-view {
  width: 100%;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: #ffffff;
}

/* 歌曲信息区域 */
.song-info-section {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.song-cover {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.song-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.song-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 8px 0;
}

.song-artist {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 4px 0;
}

.song-album {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 评论统计 */
.comment-stats {
  margin-bottom: 20px;
  padding: 0 4px;
}

.comment-stats h2 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.comment-count {
  color: rgba(0, 255, 255, 0.8);
  font-weight: normal;
}

/* 评论输入区域 */
.comment-input-section {
  margin-bottom: 30px;
}

.input-container {
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-container:focus-within {
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
}

.comment-textarea {
  width: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: vertical;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
}

.comment-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(0, 255, 255, 0.1);
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.emoji-btn,
.mention-btn,
.hashtag-btn {
  background: none;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.emoji-btn:hover,
.mention-btn:hover,
.hashtag-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.8);
}

.submit-btn {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
  background: linear-gradient(135deg, #00e6ff 0%, #00b3e6 100%);
}

/* 评论区域 */
.comments-section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  padding: 0 4px 8px 4px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.5);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 4px;
  width: 40px;
  height: 2px;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  border-radius: 1px;
}

.hot-comments {
  margin-bottom: 30px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  position: relative;
  border: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.comment-item:hover {
  border-color: rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.05);
}

.hot-comment {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  position: relative;
}

.hot-comment::before {
  content: '🔥';
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 16px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(0, 255, 255, 0.2);
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  position: relative;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.username {
  font-weight: 600;
  color: rgba(0, 255, 255, 0.9);
  font-size: 14px;
}

.comment-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 12px;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 重新设计评论底部布局 */
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.comment-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.8);
}

.action-btn.active {
  color: #ff6b6b;
}

.like-icon,
.reply-icon,
.share-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  transition: all 0.2s ease;
}

.like-icon.liked {
  fill: #ff6b6b;
  transform: scale(1.1);
}

.count {
  font-size: 12px;
  color: inherit;
}

/* 回复区域 */
.replies {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid rgba(0, 255, 255, 0.2);
}

.reply-item {
  padding: 8px 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
}

.reply-user {
  font-weight: 500;
  color: rgba(0, 255, 255, 0.8);
}

.reply-to {
  color: rgba(255, 255, 255, 0.4);
}

.reply-content {
  color: rgba(255, 255, 255, 0.8);
}

.load-more-replies {
  background: none;
  border: none;
  color: rgba(0, 255, 255, 0.8);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 0;
  margin-top: 4px;
}

.load-more-replies:hover {
  text-decoration: underline;
  color: rgba(0, 255, 255, 1);
}

/* 空状态 */
.empty-comments {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-comments p {
  font-size: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}
</style>
