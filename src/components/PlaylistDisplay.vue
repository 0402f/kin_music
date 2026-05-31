<template>
  <div class="playlist-display">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="playlist-content">
      <!-- 歌单头部信息 -->
      <div v-if="showHeader && playlistInfo" class="playlist-header">
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
            <button v-if="showEditButton" class="edit-btn" @click="$emit('edit')">
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
              <span class="stat-item">{{ playlistInfo.songCount || musicList.length }} 首歌曲</span>
              <span v-if="playlistInfo.playCount" class="stat-item">
                播放 {{ playlistInfo.playCount }} 次
              </span>
              <span v-if="playlistInfo.collectCount" class="stat-item">
                收藏 {{ playlistInfo.collectCount }} 次
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
            <button v-if="showCollectButton" class="collect-btn" @click="handleToggleCollect">
              <span class="heart">{{ isCollected ? '❤️' : '🤍' }}</span>
              {{ isCollected ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 音乐列表 -->
      <div class="playlist-tracks">
        <div v-if="musicList.length === 0" class="empty">
          <p>{{ emptyText }}</p>
        </div>
        <MusicList
          v-else
          :music-list="musicList"
          :favorite-ids="favoriteIds"
          @like-toggle="handleLikeToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import MusicList from './MusicList.vue'
import { useAudioStore } from '../stores/audio'
import { useUserStore } from '../stores/user'
import { favoritePlaylist, unfavoritePlaylist } from '@/api/playlist'

const props = defineProps({
  // 基础数据
  musicList: {
    type: Array,
    default: () => [],
  },
  playlistInfo: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },

  // 显示控制
  showHeader: {
    type: Boolean,
    default: true,
  },
  showEditButton: {
    type: Boolean,
    default: false,
  },
  showCollectButton: {
    type: Boolean,
    default: true,
  },
  isCollected: {
    type: Boolean,
    default: false,
  },

  // 文本配置
  emptyText: {
    type: String,
    default: '暂无歌曲',
  },
})

const emit = defineEmits(['like-toggle', 'edit', 'toggle-collect'])

const audioStore = useAudioStore()
const userStore = useUserStore()
const { favoriteIds } = storeToRefs(userStore)
const { playSong, setPlaylist } = audioStore

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
const playAll = () => {
  if (props.musicList.length > 0) {
    setPlaylist(props.musicList)
    playSong(props.musicList[0], props.musicList)
  }
}

// 处理喜欢切换
const handleLikeToggle = (data) => {
  emit('like-toggle', data)
}

// 处理收藏按钮点击
const handleToggleCollect = async () => {
  if (!userStore.isLoggedIn) {
    // 可以显示登录提示
    return
  }

  try {
    if (props.isCollected) {
      // 取消收藏
      await unfavoritePlaylist(props.playlistInfo.id)
      userStore.removePlaylistFromFavorites(props.playlistInfo.id)
    } else {
      // 收藏
      await favoritePlaylist(props.playlistInfo.id)
      userStore.addPlaylistToFavorites(props.playlistInfo.id)
    }
    emit('toggle-collect')
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}
</script>

<style scoped>
.playlist-display {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #ff4757;
}

.playlist-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 12px;
  color: white;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
}

.playlist-cover {
  flex-shrink: 0;
}

.playlist-cover img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.cover-placeholder {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
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
}

.playlist-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.playlist-meta {
  flex: 1;
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
  opacity: 0.9;
}

.create-time {
  margin: 5px 0;
  opacity: 0.8;
  font-size: 14px;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  margin: 10px 0;
  font-size: 14px;
  opacity: 0.9;
}

.description {
  margin: 15px 0;
  line-height: 1.6;
  opacity: 0.9;
}

.playlist-tags {
  margin-top: 10px;
}

.tags-label {
  opacity: 0.8;
  margin-right: 8px;
}

.tag-item {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 4px;
}

.playlist-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.play-all-btn {
  background: #ff6b6b;
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
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.play-all-btn:hover {
  background: #ff5252;
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

.collect-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
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
}
</style>
