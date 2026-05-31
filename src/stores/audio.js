import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 播放模式枚举
const PLAY_MODES = {
  SEQUENCE: 'sequence', // 顺序播放
  LOOP: 'loop', // 单曲循环
  SHUFFLE: 'shuffle', // 随机播放
}

export const useAudioStore = defineStore('audio', () => {
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const audio = ref(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  // 添加播放列表相关状态
  const playlist = ref([])
  const currentIndex = ref(-1)

  // 添加播放模式状态
  const playMode = ref(PLAY_MODES.SEQUENCE)
  const shuffledPlaylist = ref([]) // 随机播放列表
  const shuffledIndex = ref(-1) // 随机播放索引

  // 切换播放模式
  const togglePlayMode = () => {
    const modes = Object.values(PLAY_MODES)
    const currentModeIndex = modes.indexOf(playMode.value)
    const nextModeIndex = (currentModeIndex + 1) % modes.length
    playMode.value = modes[nextModeIndex]

    // 如果切换到随机模式，生成随机播放列表
    if (playMode.value === PLAY_MODES.SHUFFLE) {
      generateShuffledPlaylist()
    }

    console.log('播放模式切换为:', playMode.value)
  }

  // 生成随机播放列表
  const generateShuffledPlaylist = () => {
    if (playlist.value.length === 0) return

    // 创建播放列表的副本
    const shuffled = [...playlist.value]

    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    shuffledPlaylist.value = shuffled

    // 找到当前歌曲在随机列表中的位置
    if (currentSong.value) {
      const currentShuffledIndex = shuffledPlaylist.value.findIndex(
        (song) => song.id === currentSong.value.id,
      )
      shuffledIndex.value = currentShuffledIndex !== -1 ? currentShuffledIndex : 0
    }
  }

  // 修改播放结束处理
  const handleSongEnd = () => {
    isPlaying.value = false

    switch (playMode.value) {
      case PLAY_MODES.LOOP:
        // 单曲循环，重新播放当前歌曲
        if (currentSong.value) {
          playSong(currentSong.value)
        }
        break
      case PLAY_MODES.SEQUENCE:
      case PLAY_MODES.SHUFFLE:
        // 顺序播放或随机播放，播放下一首
        playNext()
        break
    }
  }

  // 初始化音频对象
  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value.currentTime
      })
      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value.duration
      })
      audio.value.addEventListener('ended', handleSongEnd)
    }
  }

  // 清理URL
  const cleanUrl = (url) => {
    if (!url) return ''
    return url.replace(/[\r\n\t]/g, '').trim()
  }

  // 设置播放列表 - 处理歌单数据结构
  const setPlaylist = (playlistData, startMusicId = null) => {
    // 检查是否是歌单数据结构（包含 music 对象）
    if (playlistData && playlistData.length > 0 && playlistData[0].music) {
      // 从歌单数据中提取音乐信息
      const songs = playlistData.map((item) => ({
        id: item.music.id,
        title: item.music.title,
        artist: item.music.artist,
        album: item.music.album,
        duration: item.music.duration,
        url: item.music.fileUrl,
        cover: item.music.coverFileUrl,
        sortOrder: item.sortOrder,
      }))

      // 按 sortOrder 排序
      songs.sort((a, b) => a.sortOrder - b.sortOrder)
      playlist.value = songs
    } else {
      // 直接使用传入的歌曲数组
      playlist.value = playlistData || []
    }

    // 如果指定了开始播放的音乐ID，找到对应的索引
    if (startMusicId) {
      const startIndex = playlist.value.findIndex((song) => song.id === startMusicId)
      currentIndex.value = startIndex !== -1 ? startIndex : 0
    } else {
      currentIndex.value = 0
    }
  }

  // 播放音乐 - 支持播放列表参数
  const playSong = async (song, playlistData = null) => {
    try {
      initAudio()

      // 如果提供了播放列表数据，先设置播放列表
      if (playlistData) {
        setPlaylist(playlistData, song.id)
      }

      if (currentSong.value?.id !== song.id) {
        currentSong.value = song
        // 更新当前索引
        const index = playlist.value.findIndex((s) => s.id === song.id)
        if (index !== -1) {
          currentIndex.value = index
        }
        audio.value.src = cleanUrl(song.url)
        await audio.value.load()
      }

      await audio.value.play()
      isPlaying.value = true
    } catch (error) {
      console.error('播放失败:', error)
      isPlaying.value = false
    }
  }

  // 暂停音乐
  const pauseSong = () => {
    if (audio.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  // 切换播放状态
  const togglePlay = () => {
    if (isPlaying.value) {
      pauseSong()
    } else if (currentSong.value) {
      playSong(currentSong.value)
    }
  }

  // 设置音量
  const setVolume = (vol) => {
    volume.value = vol
    if (audio.value) {
      audio.value.volume = vol
    }
  }

  // 设置播放进度
  const setCurrentTime = (time) => {
    if (audio.value) {
      audio.value.currentTime = time
    }
  }

  // 上一首功能
  const playPrevious = () => {
    if (playlist.value.length === 0) {
      console.warn('播放列表为空')
      return
    }

    let prevSong

    if (playMode.value === PLAY_MODES.SHUFFLE) {
      // 随机模式
      let prevIndex = shuffledIndex.value - 1
      if (prevIndex < 0) {
        prevIndex = shuffledPlaylist.value.length - 1
      }
      shuffledIndex.value = prevIndex
      prevSong = shuffledPlaylist.value[prevIndex]

      // 更新原始列表的索引
      const originalIndex = playlist.value.findIndex((song) => song.id === prevSong.id)
      if (originalIndex !== -1) {
        currentIndex.value = originalIndex
      }
    } else {
      // 顺序播放或单曲循环
      let prevIndex = currentIndex.value - 1
      if (prevIndex < 0) {
        prevIndex = playlist.value.length - 1
      }
      currentIndex.value = prevIndex
      prevSong = playlist.value[prevIndex]
    }

    if (prevSong) {
      playSong(prevSong)
    }
  }

  // 下一首功能
  const playNext = () => {
    if (playlist.value.length === 0) {
      console.warn('播放列表为空')
      return
    }

    let nextSong

    if (playMode.value === PLAY_MODES.SHUFFLE) {
      // 随机模式
      let nextIndex = shuffledIndex.value + 1
      if (nextIndex >= shuffledPlaylist.value.length) {
        // 重新生成随机列表
        generateShuffledPlaylist()
        nextIndex = 0
      }
      shuffledIndex.value = nextIndex
      nextSong = shuffledPlaylist.value[nextIndex]

      // 更新原始列表的索引
      const originalIndex = playlist.value.findIndex((song) => song.id === nextSong.id)
      if (originalIndex !== -1) {
        currentIndex.value = originalIndex
      }
    } else {
      // 顺序播放或单曲循环
      let nextIndex = currentIndex.value + 1
      if (nextIndex >= playlist.value.length) {
        nextIndex = 0
      }
      currentIndex.value = nextIndex
      nextSong = playlist.value[nextIndex]
    }

    if (nextSong) {
      playSong(nextSong)
    }
  }

  // 计算属性
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => {
    return formatTime(currentTime.value)
  })

  const formattedDuration = computed(() => {
    return formatTime(duration.value)
  })

  // 播放模式显示文本
  const playModeText = computed(() => {
    switch (playMode.value) {
      case PLAY_MODES.SEQUENCE:
        return '顺序播放'
      case PLAY_MODES.LOOP:
        return '单曲循环'
      case PLAY_MODES.SHUFFLE:
        return '随机播放'
      default:
        return '顺序播放'
    }
  })

  // 格式化时间
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 添加全屏状态
  const isLyricsFullscreen = ref(false)

  // 设置全屏状态的方法
  const setLyricsFullscreen = (fullscreen) => {
    isLyricsFullscreen.value = fullscreen
  }

  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    progress,
    formattedCurrentTime,
    formattedDuration,
    playlist,
    currentIndex,
    playMode,
    playModeText,
    PLAY_MODES,
    playSong,
    pauseSong,
    togglePlay,
    playPrevious,
    playNext,
    togglePlayMode,
    setPlaylist,
    setVolume,
    setCurrentTime,
    isLyricsFullscreen,
    setLyricsFullscreen,
  }
})
