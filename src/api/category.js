import request from '@/utils/request'

// 获取所有分类列表
export function getCategoryList() {
  return request({ url: '/category/list', method: 'get' })
}

// 获取分类详情
export function getCategoryDetail(id) {
  return request({ url: `/category/${id}`, method: 'get' })
}

// 根据分类查歌曲列表（分页）
export function getCategoryMusic(categoryId, page = 1, pageSize = 20) {
  return request({ url: `/category/${categoryId}/music`, method: 'get', params: { page, pageSize } })
}
