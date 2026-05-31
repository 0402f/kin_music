import request from '@/utils/request'

/**
 * 聊天相关API
 */

// 获取或创建会话
export function getOrCreateConversation(targetUserId) {
  return request({
    url: `/chat/conversations?targetUserId=${targetUserId}`,
    method: 'post'
  })
}

// 获取会话列表
export function getConversationList(page = 0, size = 20) {
  return request({
    url: '/chat/conversations',
    method: 'get',
    params: {
      page,
      size
    }
  })
}

// 获取会话详情
export function getConversationDetail(conversationId) {
  return request({
    url: `/chat/conversations/${conversationId}`,
    method: 'get'
  })
}

// 获取会话消息历史
export function getConversationMessages(conversationId, page = 0, size = 20) {
  return request({
    url: `/chat/conversations/${conversationId}/messages`,
    method: 'get',
    params: {
      page,
      size
    }
  })
}

// 发送消息 (REST API备用方案)
export function sendMessage(messageData) {
  return request({
    url: '/chat/messages',
    method: 'post',
    data: messageData
  })
}

// 标记消息为已读
export function markMessageAsRead(messageId) {
  return request({
    url: `/chat/messages/${messageId}/read`,
    method: 'post'
  })
}

// 标记会话所有消息为已读
export function markConversationAsRead(conversationId) {
  return request({
    url: `/chat/conversations/${conversationId}/read`,
    method: 'post'
  })
}

// 删除会话
export function deleteConversation(conversationId) {
  return request({
    url: `/chat/conversations/${conversationId}`,
    method: 'delete'
  })
}

// 获取用户在线状态
export function getUserOnlineStatus(userId) {
  return request({
    url: `/chat/users/${userId}/status`,
    method: 'get'
  })
}

// 获取未读消息数量
export function getUnreadMessageCount() {
  return request({
    url: '/chat/messages/unread/count',
    method: 'get'
  })
}

// 搜索会话
export function searchConversations(keyword) {
  return request({
    url: '/chat/conversations/search',
    method: 'get',
    params: {
      keyword
    }
  })
}