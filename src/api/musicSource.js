/**
 * 音乐源 API（通过 Vite 代理 → music-proxy → 各音乐平台）
 */
import request from '../utils/request'

/** 聚合搜索 */
export const searchExternalMusic = (params) =>
  request.get('/music-source/search', { params })

/** 获取播放地址 */
export const getPlayUrl = (sourceId) =>
  request.get('/music-source/play', { params: { id: sourceId } })
