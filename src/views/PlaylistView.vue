<template>
  <div class="playlist-view">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="playlist-content">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="edit-playlist">
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
              <span class="char-count">{{ editForm.name.length }}/40</span>
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
              <span class="char-count">{{ editForm.description.length }}/1000</span>
            </div>

            <div class="form-group">
              <label>标签：</label>
              <select v-model="editForm.tag" class="form-select">
                <option value="">选择...</option>
                <option value="流行">流行</option>
                <option value="摇滚">摇滚</option>
                <option value="民谣">民谣</option>
                <option value="电子">电子</option>
                <option value="古典">古典</option>
                <option value="爵士">爵士</option>
              </select>
            </div>

            <div class="form-actions">
              <button class="save-btn" @click="saveEdit">保存</button>
              <button class="cancel-btn" @click="cancelEdit">取消</button>
            </div>
          </div>

          <div class="edit-cover">
            <div class="cover-preview">
              <img
                v-if="playlistInfo.coverUrl"
                :src="playlistInfo.coverUrl"
                :alt="playlistInfo.name"
              />
              <div v-else class="cover-placeholder">
                <span class="music-icon">🎵</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 正常显示模式 -->
      <div v-else class="playlist-container">
        <!-- 上半部分：歌单信息 -->
        <div class="playlist-header">
          <div class="playlist-cover">
            <img
              v-if="playlistInfo.coverUrl"
              :src="playlistInfo.coverUrl"
              :alt="playlistInfo.name"
              @error="handleCoverError"
            />
            <div v-else class="cover-placeholder">
              <span class="music-icon">🎵</span>
            </div>
          </div>

          <div class="playlist-info">
            <div class="playlist-name-container">
              <h1 class="playlist-name">{{ playlistInfo.name }}</h1>
              <!-- 只有当前用户是歌单创建者时才显示编辑按钮 -->
              <button v-if="canEdit" class="edit-btn" @click="handleEdit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  />
                </svg>
              </button>
            </div>
            <div class="playlist-meta">
              <div v-if="playlistInfo.creator" class="creator-info">
                <img
                  v-if="playlistInfo.user?.avatarUrl"
                  :src="playlistInfo.user.avatarUrl"
                  :alt="playlistInfo.creator"
                  class="creator-avatar"
                />
                <span class="creator-name">{{ playlistInfo.creator }}</span>
              </div>
              <p v-if="playlistInfo.createTime" class="create-time">
                {{ formatDate(playlistInfo.createTime) }}创建
              </p>
              <div class="playlist-stats">
                <span class="stat-item"
                  >{{ playlistInfo.songCount || musicList.length }} 首歌曲</span
                >
                <span v-if="playlistInfo.playCount" class="stat-item">
                  播放 {{ playlistInfo.playCount }} 次
                </span>
                <span v-if="playlistInfo.collectCount" class="stat-item">
                  收藏 {{ playlistInfo.collectCount }} 次
                </span>
                <!-- 添加公开/私密状态显示 -->
                <span class="stat-item privacy-status" :class="{ private: !playlistInfo.isPublic }">
                  <svg
                    v-if="!playlistInfo.isPublic"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="10"
                      rx="2"
                      fill="currentColor"
                      fill-opacity="0.8"
                    />
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C5.2 5 1 9.2 1 14.6V21H23V14.6C23 11.9 21.1 9.7 18.6 9.2L21 9Z"
                    />
                  </svg>
                  {{ playlistInfo.isPublic ? '公开' : '私密' }}
                </span>
              </div>
              <p v-if="playlistInfo.description" class="description">
                {{ playlistInfo.description }}
              </p>
              <div v-if="playlistInfo.tags && playlistInfo.tags.length > 0" class="playlist-tags">
                <span class="tags-label">标签：</span>
                <span v-for="tag in playlistInfo.tags" :key="tag" class="tag-item">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="playlist-actions">
              <button class="play-all-btn" @click="playAll">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
                播放全部
              </button>
              <button
                class="collect-btn"
                :class="{ collected: isCollected }"
                @click="toggleCollect"
              >
                <span class="heart">{{ isCollected ? '❤️' : '🤍' }}</span>
                {{ isCollected ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 下半部分：Tab切换区域 -->
        <div class="playlist-tabs">
          <div class="tab-header">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="activeTab = tab.key"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-text">{{ tab.label }}</span>
            </button>
          </div>

          <div class="tab-content">
            <!-- 歌曲列表 -->
            <div v-if="activeTab === 'songs'" class="tab-panel">
              <div v-if="musicList.length === 0" class="empty">
                <p>该歌单暂无歌曲</p>
              </div>
              <MusicList
                v-else
                :music-list="musicList"
                :favorite-ids="favoriteIds"
                :on-play="handleSongPlay"
                @like-toggle="handleLikeToggle"
              />
            </div>

            <!-- 评论列表 - 完善版本 -->
            <div v-else-if="activeTab === 'comments'" class="tab-panel">
              <div class="comments-section">
                <!-- 评论统计 -->
                <div class="comment-stats">
                  <h3>
                    全部评论 <span class="comment-count">{{ commentCount }}</span>
                  </h3>
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
                        <button class="emoji-btn" @click="toggleEmojiPicker" title="表情">
                          😊
                        </button>
                        <button class="mention-btn" @click="handleMention" title="@某人">@</button>
                        <button class="hashtag-btn" @click="handleHashtag" title="话题">#</button>
                        <button
                          class="submit-btn"
                          @click="submitComment"
                          :disabled="!commentText.trim()"
                        >
                          发布
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 精彩评论 -->
                <div v-if="hotComments.length > 0" class="hot-comments">
                  <h4 class="section-title">精彩评论</h4>
                  <div class="comment-list">
                    <div
                      v-for="comment in hotComments"
                      :key="comment.id"
                      class="comment-item hot-comment"
                    >
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
                        </div>
                        <div class="comment-text">{{ comment.content }}</div>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 最新评论 -->
                <div class="latest-comments">
                  <h4 class="section-title">最新评论</h4>
                  <div class="comment-list">
                    <div v-for="comment in latestComments" :key="comment.id" class="comment-item">
                      <div class="comment-avatar">
                        <img
                          :src="comment.user.avatarUrl || '/default-avatar.jpg'"
                          :alt="comment.user.username"
                          @error="handleAvatarError"
                        />
                      </div>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="username">{{ comment.user.username }}</span>
                        </div>
                        <div class="comment-text">{{ comment.content }}</div>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div
                  v-if="hotComments.length === 0 && latestComments.length === 0"
                  class="empty-comments"
                >
                  <div class="empty-icon">💬</div>
                  <p>还没有评论，快来抢沙发吧！</p>
                </div>
              </div>
            </div>

            <!-- 收藏者列表 -->
            <div v-else-if="activeTab === 'collectors'" class="tab-panel">
              <div class="collectors-section">
                <div class="collectors-header">
                  <h3>收藏者 ({{ collectors.length }})</h3>
                </div>
                <div v-if="collectors.length === 0" class="empty">
                  <div class="empty-icon">👥</div>
                  <p>暂无收藏者</p>
                </div>
                <div v-else class="collectors-list">
                  <div v-for="collector in collectors" :key="collector.id" class="collector-item">
                    <div class="collector-avatar">
                      <img
                        v-if="collector.avatarUrl"
                        :src="collector.avatarUrl"
                        :alt="collector.username"
                        @error="handleAvatarError"
                      />
                      <div v-else class="avatar-placeholder">
                        {{ collector.username ? collector.username.charAt(0).toUpperCase() : '?' }}
                      </div>
                    </div>
                    <div class="collector-info">
                      <div class="collector-main">
                        <span class="collector-name">{{
                          collector.username || collector.nickname || '匿名用户'
                        }}</span>
                        <span v-if="collector.userNumber" class="collector-number"
                          >#{{ collector.userNumber }}</span
                        >
                      </div>
                      <div class="collector-meta">
                        <span v-if="collector.bio" class="collector-bio">{{ collector.bio }}</span>
                        <span class="collector-time">{{
                          formatCollectorTime(collector.favoriteTime)
                        }}</span>
                      </div>
                    </div>
                    <div class="collector-actions">
                      <button class="follow-btn" @click="handleFollowUser(collector)">关注</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import MusicList from '../components/MusicList.vue'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import {
  getPlaylistDetail,
  getPlaylistMusic,
  incrementPlaylistPlayCount,
  favoritePlaylist,
  unfavoritePlaylist,
  getPlaylistFavoriteUsers, // 添加这行
} from '../api/playlist'
import {
  getNestedComments,
  postComment,
  toggleCommentLike as toggleCommentLikeAPI,
} from '../api/comment'
import Toast from '../components/Toast.vue'

const route = useRoute()
const router = useRouter()
const playlistId = route.params.id

const loading = ref(true)
const error = ref('')
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
  tags: [],
  isPublic: true, // 添加公开/私密状态字段
})
const musicList = ref([])
const isCollected = ref(false)
const isEditing = ref(false)

// Tab相关状态
const activeTab = ref('songs')
const tabs = [
  { key: 'songs', label: '歌曲', icon: '🎵' },
  { key: 'comments', label: '评论', icon: '💬' },
  { key: 'collectors', label: '收藏者', icon: '👥' },
]

// 评论相关状态
const commentText = ref('')
const commentCount = ref(0)
const hotComments = ref([])
const latestComments = ref([])
const collectors = ref([])
const replyingTo = ref(null)

// 添加播放状态管理
const hasPlayedAll = ref(false) // 记录是否已经点击过播放全部
const hasPlayedAny = ref(false) // 记录是否已经播放过任何歌曲

// Toast相关
const toast = ref({
  visible: false,
  message: '',
  type: 'success',
})

const audioStore = useAudioStore()
const userStore = useUserStore()
const { playSong } = audioStore
const { favoriteIds } = storeToRefs(userStore)

// 添加权限判断的计算属性
const canEdit = computed(() => {
  // 检查用户是否登录且是歌单的创建者
  return (
    userStore.isLoggedIn &&
    userStore.userInfo?.id &&
    playlistInfo.value.user?.id === userStore.userInfo.id
  )
})

// 获取歌单详情
const fetchPlaylistDetail = async () => {
  try {
    loading.value = true
    error.value = ''

    // 移除本地获取收藏列表的调用
    // await fetchUserFavorites()

    // 如果用户已登录但收藏列表为空，则获取收藏列表
    if (userStore.isLoggedIn && favoriteIds.value.size === 0) {
      await userStore.fetchFavoriteList()
    }

    const response = await getPlaylistDetail(playlistId)

    if (response.data) {
      const data = response.data
      playlistInfo.value = {
        id: data.id,
        name: data.name,
        creator: data.user?.username || data.user?.nickname || '未知用户',
        createTime: data.createTime,
        coverUrl: data.coverFileUrl,
        description: data.description,
        songCount: data.songCount || 0,
        playCount: data.playCount || 0,
        collectCount: data.collectCount || 0,
        user: data.user,
        tags: data.tags || [],
        isPublic: data.isPublic === 1, // 添加这一行，将1转换为true，0转换为false
      }

      // 获取歌单中的歌曲列表
      await fetchPlaylistMusic()
    } else {
      error.value = response.msg || '获取歌单信息失败'
    }
  } catch (err) {
    console.error('获取歌单详情失败:', err)
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

// 获取歌单音乐列表
const fetchPlaylistMusic = async () => {
  try {
    const response = await getPlaylistMusic(playlistId)

    if (response.data) {
      // 将API返回的数据转换为MusicList组件需要的格式
      musicList.value = response.data.map((item) => ({
        id: item.music.id,
        title: item.music.title,
        artist: item.music.artist,
        album: item.music.album,
        duration: item.music.duration,
        url: item.music.fileUrl,
        coverFileUrl: item.music.coverFileUrl, // MusicList组件使用
        cover: item.music.coverFileUrl, // AudioPlayer组件使用
        // 添加歌单相关信息
        playlistId: item.playlistId,
        sortOrder: item.sortOrder,
        addTime: item.addTime,
      }))

      // 更新歌单信息中的歌曲数量
      playlistInfo.value.songCount = musicList.value.length

      // 自动初始化播放列表（可选）
      if (musicList.value.length > 0) {
        const { setPlaylist } = audioStore
        setPlaylist(musicList.value)
      }

      // 检查并打印用户收藏的歌曲
      musicList.value.forEach((music) => {
        if (favoriteIds.value.has(music.id)) {
          console.log('用户收藏的歌曲:', {
            id: music.id,
            title: music.title,
            artist: music.artist,
            album: music.album,
          })
        }
      })
    } else {
      console.error('获取歌单音乐列表失败:', response.msg)
      musicList.value = []
    }
  } catch (err) {
    console.error('获取歌单音乐列表失败:', err)
    musicList.value = []
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 处理封面加载错误
const handleCoverError = (event) => {
  event.target.src = '/images/default-playlist.png'
}

// 播放全部
const playAll = async () => {
  if (musicList.value.length > 0) {
    try {
      // 如果是首次点击播放全部，增加播放量
      if (!hasPlayedAll.value && !hasPlayedAny.value) {
        await incrementPlaylistPlayCount(playlistId)
        hasPlayedAll.value = true
        hasPlayedAny.value = true
      }

      playSong(musicList.value[0], musicList.value)
    } catch (error) {
      console.error('增加播放量失败:', error)
      // 即使增加播放量失败，也要继续播放
      playSong(musicList.value[0], musicList.value)
    }
  }
}

// 添加检查收藏状态的方法
const checkCollectionStatus = async () => {
  if (!userStore.isLoggedIn) {
    isCollected.value = false
    return
  }

  try {
    const isFavorited = await userStore.checkPlaylistFavoriteStatus(playlistId)
    isCollected.value = isFavorited
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isCollected.value = false
  }
}

// 修改切换收藏状态
const toggleCollect = async () => {
  if (!userStore.isLoggedIn) {
    // 可以显示登录提示
    showToast('请先登录', 'warning')
    return
  }

  try {
    if (isCollected.value) {
      // 取消收藏
      await unfavoritePlaylist(playlistId)
      userStore.removePlaylistFromFavorites(playlistId)
      isCollected.value = false
      showToast('已取消收藏', 'success')
    } else {
      // 收藏
      await favoritePlaylist(playlistId)
      userStore.addPlaylistToFavorites(playlistId)
      isCollected.value = true
      showToast('收藏成功', 'success')
    }

    // 重新获取收藏者列表以更新界面
    await fetchCollectors()
  } catch (error) {
    console.error('收藏操作失败:', error)
    showToast('操作失败，请稍后重试', 'error')
  }
}

// 处理喜欢切换
const handleLikeToggle = ({ music, action, success, error }) => {
  console.log('切换喜欢状态:', { music, action, success })

  if (!success) {
    console.error('喜欢状态切换失败:', error)
  }
}

// 添加处理单曲播放的方法（如果 MusicList 组件支持自定义播放处理）
const handleSongPlay = async (song, playlist) => {
  try {
    // 如果是首次播放任何歌曲，增加播放量
    if (!hasPlayedAny.value) {
      await incrementPlaylistPlayCount(playlistId)
      hasPlayedAny.value = true
    }

    playSong(song, playlist)
  } catch (error) {
    console.error('增加播放量失败:', error)
    // 即使增加播放量失败，也要继续播放
    playSong(song, playlist)
  }
}

// 评论相关方法
const submitComment = async () => {
  if (!commentText.value.trim()) return

  try {
    const commentData = {
      targetType: 2, // 2表示歌单
      targetId: playlistId,
      content: commentText.value.trim(),
      parentId: replyingTo.value?.id || null,
      rootId: replyingTo.value?.rootId || replyingTo.value?.id || null,
    }

    await postComment(commentData)
    commentText.value = ''
    replyingTo.value = null

    // 重新获取评论列表
    await fetchComments()
    showToast('评论发布成功', 'success')
  } catch (error) {
    console.error('发布评论失败:', error)
    showToast('发布评论失败', 'error')
  }
}

const toggleCommentLike = async (comment) => {
  try {
    await toggleCommentLikeAPI(comment.id)
    comment.isLiked = !comment.isLiked
    comment.likeCount += comment.isLiked ? 1 : -1
  } catch (error) {
    console.error('点赞失败:', error)
    showToast('操作失败', 'error')
  }
}

const replyToComment = (comment) => {
  replyingTo.value = comment
  commentText.value = `@${comment.user.username} `
  // 聚焦到输入框
  document.querySelector('.comment-textarea')?.focus()
}

const toggleEmojiPicker = () => {
  // 表情选择器功能
  showToast('表情功能开发中', 'info')
}

const handleMention = () => {
  // @功能
  commentText.value += '@'
}

const handleHashtag = () => {
  // 话题功能
  commentText.value += '#'
}

const handleAvatarError = (event) => {
  event.target.src = '/default-avatar.jpg'
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`

  return formatDate(dateString)
}

const formatCount = (count) => {
  if (!count || count === 0) return ''
  if (count < 1000) return count.toString()
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 10000).toFixed(1)}w`
}

// 获取收藏者列表
const fetchCollectors = async () => {
  try {
    const response = await getPlaylistFavoriteUsers(playlistId)
    collectors.value = response.data || []
  } catch (error) {
    console.error('获取收藏者列表出错:', error)
    collectors.value = []
  }
}

// 格式化收藏者时间
const formatCollectorTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()

  // 判断是否为同一天
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return '今天收藏'
  }

  // 判断是否为昨天
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  if (isYesterday) {
    return '昨天收藏'
  }

  // 计算天数差
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return `${diffDays}天前收藏`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前收藏`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + '收藏'
  }
}

// 处理关注用户
const handleFollowUser = (user) => {
  // 这里可以添加关注用户的逻辑
  console.log('关注用户:', user)
  showToast('关注功能待实现', 'info')
}

const fetchComments = async () => {
  try {
    const response = await getNestedComments({
      targetType: 2, // 2表示歌单
      targetId: playlistId,
    })

    if (response.data) {
      // 正确处理 API 返回的数据结构
      const comments = response.data.comments || []

      // 分离精彩评论和最新评论
      hotComments.value = comments.filter((comment) => comment.isHot) || []
      latestComments.value = comments.filter((comment) => !comment.isHot) || []
      commentCount.value = response.data.total || comments.length
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    showToast('获取评论失败', 'error')
  }
}

// 处理编辑按钮点击
const handleEdit = () => {
  router.push(`/playlist/${playlistId}/edit`)
}

// Toast相关方法
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

onMounted(async () => {
  await fetchPlaylistDetail()
  await fetchComments()
  await fetchCollectors()

  // 检查收藏状态
  await checkCollectionStatus()

  // 监听播放量更新事件
  const handlePlayCountUpdate = (event) => {
    if (event.detail.playlistId === playlistId) {
      // 更新播放量显示
      playlistInfo.value.playCount = (playlistInfo.value.playCount || 0) + 1
    }
  }

  window.addEventListener('playlist-play-count-updated', handlePlayCountUpdate)

  // 在组件卸载时移除监听
  onUnmounted(() => {
    window.removeEventListener('playlist-play-count-updated', handlePlayCountUpdate)
  })
})
</script>

<style scoped>
.playlist-view {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 100px;
}

/* 添加青色透明滚动条样式 */
.playlist-view::-webkit-scrollbar {
  width: 8px;
}

.playlist-view::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.playlist-view::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.playlist-view::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
}

.error {
  color: #ff6b6b;
}

.playlist-container {
  min-height: calc(100vh - 208px);
  display: flex;
  flex-direction: column;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 上半部分：歌单信息 */
.playlist-header {
  display: flex;
  gap: 30px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
}

.cover-placeholder {
  width: 200px;
  height: 200px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.playlist-name-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.playlist-name {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.edit-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px;
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: scale(1.05);
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.creator-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.create-time {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  margin: 10px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.description {
  margin: 15px 0;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.playlist-tags {
  margin-top: 10px;
}

.tags-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
}

.tag-item {
  display: inline-block;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 4px;
  color: #00ffff;
}

.playlist-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.play-all-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.collect-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.collect-btn.collected {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.collect-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.collect-btn.collected:hover {
  background: rgba(255, 107, 107, 0.3);
}

.heart {
  font-size: 16px;
}

/* 下半部分：Tab区域 */
.playlist-tabs {
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 16px 24px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 255, 255, 0.05);
}

.tab-btn.active {
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
}

.tab-icon {
  font-size: 16px;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
}

.tab-panel::-webkit-scrollbar {
  width: 6px;
}

.tab-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.tab-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
}

/* 评论样式 - 完善版本 */
.comments-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 评论统计 */
.comment-stats {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.comment-stats h3 {
  margin: 0;
  font-size: 20px;
  color: #ffffff;
  font-weight: 600;
}

.comment-count {
  color: #00ffff;
  font-size: 18px;
}

/* 评论输入区域 */
.comment-input-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
}

.comment-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emoji-btn,
.mention-btn,
.hashtag-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.emoji-btn:hover,
.mention-btn:hover,
.hashtag-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

.submit-btn {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #000000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

/* 评论区域标题 */
.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #00ffff;
  font-weight: 600;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 255, 255, 0.2);
}

.hot-comment {
  border-color: rgba(255, 215, 0, 0.3);
  background: rgba(255, 215, 0, 0.05);
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  margin-bottom: 8px;
}

.username {
  font-weight: 500;
  color: #00ffff;
  font-size: 14px;
}

.comment-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-bottom: 12px;
  word-wrap: break-word;
  white-space: pre-wrap; /* 添加这行来保持换行符 */
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.like-btn.active {
  color: #ff6b6b;
}

.like-icon {
  fill: currentColor;
  transition: all 0.3s ease;
}

.like-icon.liked {
  fill: #ff6b6b;
}

.reply-icon {
  fill: currentColor;
}

.count {
  font-size: 12px;
}

/* 回复列表 */
.replies {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid rgba(0, 255, 255, 0.1);
}

.reply-item {
  padding: 8px 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

.reply-user {
  color: #00ffff;
  font-weight: 500;
}

.reply-to {
  color: rgba(255, 255, 255, 0.6);
}

.reply-content {
  color: rgba(255, 255, 255, 0.9);
  white-space: pre-wrap; /* 添加这行来保持换行符 */
}

/* 空状态 */
.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-comments p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin: 0;
}

/* 热门评论和最新评论区域 */
.hot-comments,
.latest-comments {
  margin-bottom: 24px;
}

.hot-comments:last-child,
.latest-comments:last-child {
  margin-bottom: 0;
}

.privacy-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a0a0a0;
  font-size: 13px;
}

.privacy-status.private {
  color: #ff6b6b;
}

.privacy-status svg {
  flex-shrink: 0;
}

/* 收藏者样式 */
.collectors-section {
  padding: 20px 0;
}

.collectors-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.collectors-header h3 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.collectors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collector-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.collector-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.collector-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.collector-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.collector-info {
  flex: 1;
  min-width: 0;
}

.collector-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.collector-name {
  color: #fff;
  font-weight: 500;
  font-size: 16px;
}

.collector-number {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.collector-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.collector-bio {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collector-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.collector-actions {
  margin-left: 16px;
}

.follow-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 编辑模式样式 */
.edit-playlist {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  margin: 24px;
}

.edit-title {
  color: #00ffff;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
}

.edit-container {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.save-btn,
.cancel-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #000000;
  border: none;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.cancel-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .playlist-cover img,
  .cover-placeholder {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }

  .playlist-name {
    font-size: 24px;
  }

  .playlist-actions {
    justify-content: center;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: 12px;
  }

  .collectors-list {
    grid-template-columns: 1fr;
  }
}
</style>
