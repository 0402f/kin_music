/**
 * Kin Music Proxy — 加载 LX Music 音源插件
 *
 * 支持平台: 酷狗/QQ/酷我/网易云/咪咕
 * 音频格式: 标准→HQ→SQ→无损 逐级尝试
 */

const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3456

app.use(express.json())
app.set('trust proxy', 1)

// 日志
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    if (req.path.startsWith('/api/'))
      console.log(`${res.statusCode} ${req.method} ${req.path} ${Date.now() - start}ms`)
  })
  next()
})

// ==================== 加载所有音源 ====================

/** @type {Array<{ name: string, search: Function, getMediaSource: Function }>} */
const sources = []

const SOURCES_DIR = path.join(__dirname, 'sources')

try {
  const files = fs.readdirSync(SOURCES_DIR).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const mod = require(path.join(SOURCES_DIR, file))
      if (mod.platform && typeof mod.search === 'function' && typeof mod.getMediaSource === 'function') {
        // 用文件名（不含 .js）作为唯一 key，避免中文 URL 编码问题
        mod._key = file.replace(/\.js$/, '')
        sources.push(mod)
        console.log(`  ✅ ${mod.platform} (${mod._key})`)
      } else {
        console.warn(`  ⚠️  跳过 ${file}: 缺少 platform/search/getMediaSource`)
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`)
    }
  }
} catch (err) {
  console.warn('⚠️  sources/ 目录加载失败:', err.message)
}

// ==================== 搜索缓存 ====================
// 播放时需要完整的 song 对象（含 hash、album_id 等），所以缓存搜索结果
const songCache = new Map() // id → { songObj, source }

function cacheSong(id, rawSong, src) {
  songCache.set(String(id), { rawSong, src })
  // 限制缓存大小
  if (songCache.size > 500) {
    const first = songCache.keys().next().value
    songCache.delete(first)
  }
}

// ==================== API ====================

// GET /api/search?keyword=晴天&limit=20
app.get('/api/search', async (req, res) => {
  const { keyword, limit = 20 } = req.query
  if (!keyword?.trim()) return res.json({ code: 0, msg: '请输入关键词', data: [] })
  if (sources.length === 0) return res.json({ code: 0, msg: '无可用音源', data: [] })

  console.log(`🔍 "${keyword}"`)

  const perSource = Math.ceil(Number(limit) / sources.length) + 5
  const promises = sources.map(async (src) => {
    try {
      const raw = await src.search(keyword, 1, 'music')
      // LX Music 音源可能返回 { isEnd, data: [...] } 或直接返回数组
      let songs = Array.isArray(raw) ? raw : (raw?.data || [])
      if (!Array.isArray(songs)) songs = []

      return songs.slice(0, perSource).map(s => {
        const sid = `lx_${src._key}_${s.id || Math.random().toString(36).slice(2)}`
        cacheSong(sid, s, src)
        return {
          id: sid,
          title: s.title || '未知',
          artist: s.artist || '未知',
          album: s.album || '',
          coverUrl: s.artwork || s.cover || '',
          duration: Math.floor((s.duration || 0) / 1000),
          source: src.platform,
          sourceId: String(s.id),
          isExternal: true,
        }
      })
    } catch (e) {
      console.warn(`  ${src.platform}: ${e.message}`)
      return []
    }
  })

  const results = (await Promise.all(promises)).flat().slice(0, Number(limit))
  console.log(`  → ${results.length} 条`)

  // 去掉内部字段再返回
  const cleaned = results.map(({ _raw, _source, ...rest }) => rest)
  res.json({ code: 1, data: cleaned })
})

// GET /api/play?id=lx_小枸音乐_xxx&source=小枸音乐
app.get('/api/play', async (req, res) => {
  const { id } = req.query
  if (!id) return res.json({ code: 0, msg: '缺少ID', data: null })

  const cached = songCache.get(id)
  if (!cached) return res.json({ code: 0, msg: '搜索缓存已过期，请重新搜索', data: null })

  const { rawSong, src } = cached

  // 1. 先试用源自带的 getMediaSource
  const qualities = ['lossless', 'sq', 'hq', 'standard']
  for (const quality of qualities) {
    try {
      const result = await src.getMediaSource(rawSong, quality)
      // 过滤掉外部 API 的错误占位 URL
      if (result?.url && !result.url.includes('panspace.kuwo.cn/77224d83')) {
        console.log(`▶️  ${src.platform} → ${quality}`)
        return res.json({ code: 1, data: { url: result.url, quality, bitrate: result.bitrate, size: result.size } })
      }
    } catch {}
  }

  // 2. 外部 API 挂了 → 酷狗直接用内置解析
  if (src._key === 'xiaogou') {
    const url = await resolveKugouUrl(rawSong)
    if (url) {
      console.log(`▶️  酷狗直解 → ${url.substring(0, 60)}...`)
      return res.json({ code: 1, data: { url, quality: 'standard' } })
    }
  }

  res.json({ code: 0, msg: '暂无播放源（VIP歌曲需付费 / 版权限制）', data: null })
})

// 酷狗直接解析（绕过外部 API）
const axios = require('axios')
async function resolveKugouUrl(song) {
  const hash = song['320hash'] || song.sqhash || song.id
  if (!hash) return null
  try {
    const resp = await axios.get('http://m.kugou.com/app/i/getSongInfo.php', {
      params: { cmd: 'playInfo', hash },
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36' }
    })
    if (resp.data?.url) return resp.data.url
    if (resp.data?.backup_url) {
      for (const key of Object.keys(resp.data.backup_url)) {
        if (resp.data.backup_url[key]) return resp.data.backup_url[key]
      }
    }
  } catch (e) {
    console.warn('  酷狗解析失败:', e.message)
  }
  return null
}

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sources: sources.map(s => s.platform),
    sourceCount: sources.length,
  })
})

// ==================== 启动 ====================

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🎵 Kin Music Proxy → http://127.0.0.1:${PORT}`)
  console.log(`   音源 (${sources.length}): ${sources.map(s => s.platform).join(', ') || '(无)'}`)
  console.log(`   搜索: GET /api/search?keyword=晴天`)
  console.log(`   播放: GET /api/play?id=xxx&source=xxx\n`)
})
