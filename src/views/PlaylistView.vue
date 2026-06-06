<template>
  <div class="pv-page">
    <div v-if="loading" class="pv-loading">加载中...</div>
    <div v-else-if="error" class="pv-error">{{ error }}</div>

    <div v-else class="pv-main">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="pv-edit">
        <h2 class="pv-edit-title">编辑歌单</h2>
        <div class="pv-edit-form">
          <div class="pv-field"><label>名称</label><input v-model="editForm.name" type="text" maxlength="40" /><span class="pv-count">{{ editForm.name.length }}/40</span></div>
          <div class="pv-field"><label>简介</label><textarea v-model="editForm.description" maxlength="1000" rows="4"></textarea><span class="pv-count">{{ editForm.description.length }}/1000</span></div>
          <div class="pv-field"><label>标签</label><select v-model="editForm.tag"><option value="">选择</option><option value="流行">流行</option><option value="摇滚">摇滚</option><option value="民谣">民谣</option><option value="电子">电子</option><option value="古典">古典</option><option value="爵士">爵士</option></select></div>
          <div class="pv-edit-cover"><img v-if="playlistInfo.coverUrl" :src="playlistInfo.coverUrl" /><div v-else class="pv-cover-empty">🎵</div></div>
          <div class="pv-edit-actions"><button class="pv-btn pv-btn-ok" @click="saveEdit">保存</button><button class="pv-btn" @click="cancelEdit">取消</button></div>
        </div>
      </div>

      <!-- 正常模式 -->
      <template v-else>
        <!-- 头部 -->
        <div class="pv-header">
          <button class="pv-back" @click="router.go(-1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <img v-if="playlistInfo.coverUrl" :src="playlistInfo.coverUrl" class="pv-cover" @error="handleCoverError" />
          <div v-else class="pv-cover pv-cover-empty">🎵</div>
          <div class="pv-header-info">
            <h1 class="pv-title">{{ playlistInfo.name }}<button v-if="canEdit" class="pv-edit-btn" @click="handleEdit"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button></h1>
            <div class="pv-creator" v-if="playlistInfo.creator"><img v-if="playlistInfo.user?.avatarUrl" :src="playlistInfo.user.avatarUrl" class="pv-creator-avatar" />{{ playlistInfo.creator }}</div>
            <div class="pv-meta">
              <span v-if="playlistInfo.playCount">{{ playlistInfo.playCount }} 次播放</span>
              <span v-if="playlistInfo.collectCount">{{ playlistInfo.collectCount }} 收藏</span>
              <span>{{ playlistInfo.isPublic ? '公开' : '私密' }}</span>
              <span v-if="playlistInfo.createTime">{{ formatDate(playlistInfo.createTime) }}创建</span>
            </div>
            <div class="pv-tags" v-if="playlistInfo.tags?.length"><span v-for="t in playlistInfo.tags" :key="t" class="pv-tag">{{ t }}</span></div>
            <p class="pv-desc" v-if="playlistInfo.description">{{ playlistInfo.description }}</p>
            <div class="pv-actions">
              <button class="pv-btn pv-btn-play" @click="playAll"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>播放全部</button>
              <button class="pv-btn pv-btn-collect" :class="{ on: isCollected }" @click="toggleCollect">{{ isCollected ? '已收藏' : '收藏' }}</button>
            </div>
          </div>
        </div>

        <!-- Tab -->
        <div class="pv-tabs">
          <button v-for="tab in tabs" :key="tab.key" :class="['pv-tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>

        <!-- 歌曲列表 -->
        <div v-if="activeTab === 'songs'" class="pv-tab-content">
          <div v-if="musicList.length === 0" class="pv-empty">该歌单暂无歌曲</div>
          <div v-else class="pv-songs">
            <div v-for="(m, i) in musicList" :key="m.id" class="pvs-row" :class="{ playing: currentSong?.id === m.id && isPlaying }" @click="playSongFromList(m)">
              <div class="pvs-num">
                <span v-if="currentSong?.id === m.id && isPlaying" class="pvs-eq"><i v-for="b in 3" :key="b"></i></span>
                <span v-else class="pvs-idx">{{ String(i+1).padStart(2,'0') }}</span>
              </div>
              <div class="pvs-cover"><img v-if="m.coverFileUrl" :src="cleanUrl(m.coverFileUrl)" /><div v-else class="pvs-cover-empty"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg></div></div>
              <div class="pvs-info"><div class="pvs-title">{{ m.title }}</div><div class="pvs-artist">{{ m.artist }}</div></div>
              <div class="pvs-actions">
                <button :class="{ active: favoriteIds?.has(m.id) }" @click.stop="toggleLike(m)"><svg width="16" height="16" viewBox="0 0 24 24" :fill="favoriteIds?.has(m.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                <button @click.stop="showMobileMore(m)"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
              </div>
              <div class="pvs-dur">{{ formatDuration(m.duration) }}</div>
            </div>
            <div class="pv-song-count">共 {{ musicList.length }} 首歌曲</div>
          </div>

          <!-- 移动端更多面板 -->
          <Teleport to="body">
            <Transition name="sheet-slide">
              <div v-if="mobileMore.visible" class="pv-sheet-overlay" @click="mobileMore.visible = false"><div class="pv-sheet" @click.stop>
                <div class="pv-sheet-head"><img v-if="mobileMore.music?.coverFileUrl" :src="cleanUrl(mobileMore.music.coverFileUrl)" class="pv-sheet-cover" /><div><b>{{ mobileMore.music?.title }}</b><span>{{ mobileMore.music?.artist }}</span></div></div>
                <div class="pv-sheet-acts">
                  <div @click="sheetAction('next')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>下一首播放</div>
                  <div @click="sheetAction('like')"><svg width="20" height="20" viewBox="0 0 24 24" :fill="favoriteIds?.has(mobileMore.music?.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>{{ favoriteIds?.has(mobileMore.music?.id) ? '取消喜欢' : '喜欢' }}</div>
                  <div @click="sheetAction('download')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>下载</div>
                  <div @click="sheetAction('comment')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>评论</div>
                </div>
                <div class="pv-sheet-cancel" @click="mobileMore.visible = false">取消</div>
              </div></div>
            </Transition>
          </Teleport>
        </div>

        <!-- 评论 -->
        <div v-else-if="activeTab === 'comments'" class="pv-tab-content">
          <div class="pv-comment-input">
            <textarea v-model="commentText" placeholder="说点什么吧..." :maxlength="1000" rows="2"></textarea>
            <div class="pv-comment-bar"><span>{{ commentText.length }}/1000</span><button class="pv-btn pv-btn-ok" @click="submitComment" :disabled="!commentText.trim()">发布</button></div>
          </div>
          <div v-if="hotComments.length" class="pv-comments">
            <h4>精彩评论</h4>
            <div v-for="c in hotComments" :key="c.id" class="pv-comment">
              <img :src="c.user.avatar || '/default-avatar.jpg'" class="pv-comment-avatar" @error="handleAvatarError" />
              <div class="pv-comment-body">
                <div class="pv-comment-name">{{ c.user.username }}</div>
                <div class="pv-comment-text">{{ c.content }}</div>
                <div class="pv-comment-foot"><span>{{ formatTime(c.createTime) }}</span><button @click="toggleCommentLike(c)">赞 {{ c.likeCount || '' }}</button><button @click="replyToComment(c)">回复</button></div>
                <div v-if="c.replies?.length" class="pv-replies"><div v-for="r in c.replies" :key="r.id" class="pv-reply"><b>{{ r.user.username }}</b><span v-if="r.replyToUsername"> 回复 @{{ r.replyToUsername }}</span>：{{ r.content }}</div></div>
              </div>
            </div>
          </div>
          <div v-if="latestComments.length" class="pv-comments">
            <h4>最新评论</h4>
            <div v-for="c in latestComments" :key="c.id" class="pv-comment">
              <img :src="c.user.avatarUrl || '/default-avatar.jpg'" class="pv-comment-avatar" @error="handleAvatarError" />
              <div class="pv-comment-body">
                <div class="pv-comment-name">{{ c.user.username }}</div>
                <div class="pv-comment-text">{{ c.content }}</div>
                <div class="pv-comment-foot"><span>{{ formatTime(c.createTime) }}</span><button @click="toggleCommentLike(c)">赞 {{ c.likeCount || '' }}</button><button @click="replyToComment(c)">回复</button></div>
                <div v-if="c.replies?.length" class="pv-replies"><div v-for="r in c.replies" :key="r.id" class="pv-reply"><b>{{ r.user.username }}</b>：{{ r.content }}</div></div>
              </div>
            </div>
          </div>
          <div v-if="!hotComments.length && !latestComments.length" class="pv-empty">暂无评论</div>
        </div>

        <!-- 收藏者 -->
        <div v-else-if="activeTab === 'collectors'" class="pv-tab-content">
          <div v-if="collectors.length === 0" class="pv-empty">暂无收藏者</div>
          <div v-else class="pv-collectors">
            <div v-for="c in collectors" :key="c.id" class="pv-collector">
              <img v-if="c.avatarUrl" :src="c.avatarUrl" class="pv-collector-avatar" />
              <div v-else class="pv-collector-avatar pv-avatar-placeholder">{{ c.username?.charAt(0)?.toUpperCase() || '?' }}</div>
              <div class="pv-collector-info"><span class="pv-collector-name">{{ c.username || c.nickname || '匿名' }}</span><span class="pv-collector-time">{{ formatCollectorTime(c.favoriteTime) }}</span></div>
              <button class="pv-btn" @click="handleFollowUser(c)">关注</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <Toast :visible="toast.visible" :message="toast.message" :type="toast.type" @close="closeToast" />
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
import { addMusicToFavorites, removeMusicFromFavorites } from '../api/user'
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
const { setPlaylist } = audioStore

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

// 歌曲列表辅助
const { currentSong, isPlaying } = storeToRefs(audioStore)
const cleanUrl = (url) => url ? url.replace(/[\r\n\t]/g, '').trim() : ''
const formatDuration = (d) => { if (!d) return ''; const m = Math.floor(d/60); const s = d%60; return `${m}:${String(s).padStart(2,'0')}` }
const playSongFromList = (m) => { playSong({ id: m.id, title: m.title, artist: m.artist, url: m.fileUrl || m.url, cover: m.coverFileUrl || m.cover, duration: m.duration || 0 }, musicList.value) }
const toggleLike = (m) => { if (favoriteIds.value?.has(m.id)) { userStore.removeFromFavorites(m.id); removeMusicFromFavorites(m.id).catch(()=>{}) } else { userStore.addToFavorites(m.id); addMusicToFavorites(m.id).catch(()=>{}) } }
const mobileMore = ref({ visible: false, music: null })
const showMobileMore = (m) => { mobileMore.value = { visible: true, music: m } }
const sheetAction = (a) => { const m = mobileMore.value.music; if (!m) return; mobileMore.value.visible = false; if (a === 'next') { const list = [...audioStore.playlist]; list.splice(audioStore.currentIndex+1,0,{id:m.id,title:m.title,artist:m.artist,url:m.fileUrl||m.url,cover:m.coverFileUrl||m.cover,duration:m.duration}); audioStore.setPlaylist(list) } else if (a === 'like') toggleLike(m); else if (a === 'download') { if (m.fileUrl) window.open(cleanUrl(m.fileUrl), '_blank') } else if (a === 'comment') { router.push({ name: 'Comment', query: { id: m.id, type: 1 }, state: { musicInfo: { id: m.id, title: m.title, artist: m.artist, cover: m.coverFileUrl || m.cover } } }) } }

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
.pv-page {
  width: 100%; height: 100%;
  background: linear-gradient(160deg, #080c18, #0f1428, #0a0e1f);
  color: #f1f5f9; overflow-y: auto; overflow-x: hidden;
  padding: 16px 16px 130px; box-sizing: border-box;
}
.pv-loading, .pv-error { display: flex; align-items: center; justify-content: center; height: 60%; font-size: 16px; }
.pv-error { color: #f87171; }
.pv-empty { text-align: center; padding: 48px 20px; color: rgba(255,255,255,0.25); font-size: 14px; }

/* 按钮 */
.pv-btn { padding: 9px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.pv-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.pv-btn-ok { background: #6366f1; border-color: #6366f1; color: #fff; }
.pv-btn-ok:hover { background: #4f46e5; }
.pv-btn-play { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff; display: flex; align-items: center; gap: 6px; }
.pv-btn-collect.on { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #818cf8; }

/* 编辑 */
.pv-edit { padding: 16px; }
.pv-edit-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.pv-edit-form { display: flex; flex-direction: column; gap: 14px; }
.pv-field { display: flex; flex-direction: column; gap: 4px; }
.pv-field label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); }
.pv-field input, .pv-field textarea, .pv-field select { padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; font-size: 14px; outline: none; }
.pv-field input:focus, .pv-field textarea:focus, .pv-field select:focus { border-color: #6366f1; }
.pv-field textarea { resize: vertical; min-height: 80px; }
.pv-count { font-size: 11px; color: rgba(255,255,255,0.3); text-align: right; }
.pv-edit-cover img { width: 120px; height: 120px; border-radius: 12px; object-fit: cover; }
.pv-edit-cover { margin: 8px 0; }
.pv-cover-empty { width: 120px; height: 120px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 36px; }
.pv-edit-actions { display: flex; gap: 10px; margin-top: 8px; }

/* 头部 */
.pv-header { display: flex; gap: 16px; margin-bottom: 20px; position: relative; }
.pv-back { position: absolute; top: 6px; left: 6px; width: 32px; height: 32px; border: none; border-radius: 50%; background: rgba(0,0,0,0.55); backdrop-filter: blur(10px); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; }
.pv-back:hover { background: rgba(0,0,0,0.75); }
.pv-cover { width: 120px; height: 120px; border-radius: 16px; object-fit: cover; flex-shrink: 0; }
.pv-header-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.pv-title { font-size: 20px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px; }
.pv-edit-btn { background: none; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 4px 6px; color: rgba(255,255,255,0.4); cursor: pointer; }
.pv-creator { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.5); }
.pv-creator-avatar { width: 20px; height: 20px; border-radius: 50%; }
.pv-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: rgba(255,255,255,0.3); }
.pv-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.pv-tag { padding: 2px 8px; border-radius: 10px; background: rgba(99,102,241,0.08); color: rgba(129,140,248,0.7); font-size: 10px; }
.pv-desc { font-size: 13px; color: rgba(255,255,255,0.4); margin: 4px 0 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.pv-actions { display: flex; gap: 10px; margin-top: 8px; }

/* Tab */
.pv-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 12px; }
.pv-tab { flex: 1; padding: 10px 0; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.35); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.pv-tab.active { color: #818cf8; border-bottom-color: #818cf8; }

/* Tab 内容 */
.pv-tab-content { padding: 8px 0; }

/* 歌曲计数 */
.pv-song-count { text-align: center; padding: 16px 0; font-size: 12px; color: rgba(255,255,255,0.2); border-top: 1px solid rgba(255,255,255,0.04); margin-top: 8px; }

/* 评论输入 */
.pv-comment-input { margin-bottom: 16px; }
.pv-comment-input textarea { width: 100%; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; color: #fff; font-size: 14px; outline: none; resize: vertical; box-sizing: border-box; }
.pv-comment-input textarea:focus { border-color: #6366f1; }
.pv-comment-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px; color: rgba(255,255,255,0.3); }

/* 评论列表 */
.pv-comments h4 { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); margin: 16px 0 10px; }
.pv-comment { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
.pv-comment-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.pv-comment-body { flex: 1; min-width: 0; }
.pv-comment-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); }
.pv-comment-text { font-size: 14px; color: rgba(255,255,255,0.6); margin: 4px 0; white-space: pre-wrap; word-break: break-word; }
.pv-comment-foot { display: flex; gap: 16px; font-size: 11px; color: rgba(255,255,255,0.3); }
.pv-comment-foot button { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 11px; padding: 2px 4px; }
.pv-replies { margin-top: 6px; padding-left: 12px; border-left: 2px solid rgba(255,255,255,0.04); }
.pv-reply { font-size: 12px; color: rgba(255,255,255,0.5); padding: 3px 0; }
.pv-reply b { color: rgba(255,255,255,0.6); }

/* 收藏者 */
.pv-collectors { display: flex; flex-direction: column; gap: 8px; }
.pv-collector { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 12px; }
.pv-collector-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.pv-avatar-placeholder { background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
.pv-collector-info { flex: 1; min-width: 0; }
.pv-collector-name { font-size: 14px; font-weight: 500; display: block; }
.pv-collector-time { font-size: 11px; color: rgba(255,255,255,0.3); }

/* 歌曲列表行 */
.pvs-row { display: flex; align-items: center; gap: 10px; padding: 10px 10px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
.pvs-row:hover { background: rgba(255,255,255,0.02); }
.pvs-row:active { background: rgba(255,255,255,0.04); }
.pvs-row.playing { background: rgba(99,102,241,0.06); }
.pvs-num { width: 28px; text-align: center; flex-shrink: 0; }
.pvs-idx { font-size: 12px; color: rgba(255,255,255,0.25); font-variant-numeric: tabular-nums; }
.pvs-eq { display: flex; align-items: flex-end; gap: 1.5px; height: 14px; justify-content: center; }
.pvs-eq i { width: 2.5px; background: #818cf8; border-radius: 1px; animation: eqPulse 0.7s ease-in-out infinite; }
.pvs-eq i:nth-child(1) { height: 8px; }
.pvs-eq i:nth-child(2) { height: 14px; animation-delay: 0.12s; }
.pvs-eq i:nth-child(3) { height: 10px; animation-delay: 0.24s; }
@keyframes eqPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
.pvs-cover { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.pvs-cover img { width: 100%; height: 100%; object-fit: cover; }
.pvs-cover-empty { width: 100%; height: 100%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; }
.pvs-info { flex: 1; min-width: 0; }
.pvs-title { font-size: 13px; font-weight: 500; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pvs-artist { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pvs-actions { display: flex; gap: 2px; flex-shrink: 0; opacity: 0; transition: opacity 0.15s; }
.pvs-row:hover .pvs-actions { opacity: 1; }
.pvs-actions button { width: 30px; height: 30px; border: none; border-radius: 50%; background: transparent; color: rgba(255,255,255,0.35); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pvs-actions button:hover { background: rgba(255,255,255,0.06); color: #fff; }
.pvs-actions button.active { color: #f87171; }
.pvs-dur { font-size: 11px; color: rgba(255,255,255,0.25); width: 36px; text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums; }

/* 移动端更多面板 */
.pv-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: flex-end; justify-content: center; }
.pv-sheet { width: 100%; max-width: 500px; max-height: 65vh; background: linear-gradient(180deg, #1e1e3a, #14142a); border-radius: 20px 20px 0 0; padding: 0 0 20px; }
.pv-sheet-head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.pv-sheet-head b { font-size: 14px; display: block; }
.pv-sheet-head span { font-size: 11px; color: rgba(255,255,255,0.35); }
.pv-sheet-cover { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; }
.pv-sheet-acts div { display: flex; align-items: center; gap: 14px; padding: 15px 24px; font-size: 14px; cursor: pointer; color: #e8e8f0; }
.pv-sheet-acts div:active { background: rgba(255,255,255,0.03); }
.pv-sheet-acts svg { color: rgba(255,255,255,0.4); }
.pv-sheet-cancel { margin: 8px 20px 0; padding: 14px; text-align: center; background: rgba(255,255,255,0.04); border-radius: 12px; font-size: 15px; color: rgba(255,255,255,0.5); cursor: pointer; }
.sheet-slide-enter-active { transition: all 0.3s ease; }
.sheet-slide-leave-active { transition: all 0.25s ease; }
.sheet-slide-enter-from .pv-sheet, .sheet-slide-leave-to .pv-sheet { transform: translateY(100%); }
.sheet-slide-enter-from, .sheet-slide-leave-to { opacity: 0; }

.pv-page::-webkit-scrollbar { width: 3px; }
.pv-page::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }

/* 桌面 */
@media (min-width: 769px) {
  .pv-page { padding: 24px 32px 40px; max-width: 900px; margin: 0 auto; }
  .pv-cover { width: 180px; height: 180px; }
  .pv-title { font-size: 28px; }
}

@media (max-width: 480px) {
  .pv-page { padding: 12px 10px 130px; }
  .pv-cover { width: 100px; height: 100px; border-radius: 14px; }
  .pv-title { font-size: 18px; }
  .pv-header { gap: 12px; }
  .pvs-dur { display: none; }
  .pvs-actions { opacity: 1; }
  .pvs-row { padding: 8px 6px; gap: 6px; }
}
</style>
