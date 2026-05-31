import request from '@/utils/request'

/**
 * 获取嵌套评论列表
 * @param {Object} params - 请求参数
 * @param {number} params.targetType - 目标类型 (1:歌曲, 2:歌单)
 * @param {number} params.targetId - 目标ID
 * @returns {Promise} 评论数据
 */
export function getNestedComments(params) {
  return request({
    url: '/comments/nested',
    method: 'get',
    params
  })
}

/**
 * 发布评论
 * @param {Object} data - 评论数据
 * @param {number} data.targetType - 目标类型
 * @param {number} data.targetId - 目标ID
 * @param {string} data.content - 评论内容
 * @param {number} data.parentId - 父评论ID (可选)
 * @param {number} data.rootId - 根评论ID (可选)
 * @returns {Promise} 发布结果
 */
export function postComment(data) {
  return request({
    url: '/comments',
    method: 'post',
    data
  })
}

/**
 * 点赞/取消点赞评论
 * @param {number} commentId - 评论ID
 * @returns {Promise} 点赞结果
 */
export function toggleCommentLike(commentId) {
  return request({
    url: `/comments/${commentId}/like`,
    method: 'post'
  })
}