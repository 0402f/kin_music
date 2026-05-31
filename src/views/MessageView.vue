<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="user-info">
        <div class="avatar-wrapper">
          <img :src="chatUser.avatar" alt="头像" class="avatar" />
          <div class="online-indicator" :class="{ active: chatUser.isOnline }"></div>
        </div>
        <div class="user-details">
          <h3>{{ chatUser.username }}</h3>
          <span class="status" :class="{ online: chatUser.isOnline }">
            {{ chatUser.isOnline ? '在线' : '离线' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef">
      <!-- 加载更多提示 -->
      <div v-if="loadingMore" class="loading-more">
        <div class="loading-spinner"></div>
        <span>加载更多消息...</span>
      </div>

      <div v-if="!hasMoreMessages && messages.length > 0" class="no-more-messages">
        没有更多消息了
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ 'own-message': message.isOwnMessage }"
      >
        <div class="message-avatar">
          <img :src="message.senderAvatar" alt="头像" />
        </div>
        <div class="message-content">
          <div class="message-info">
            <span class="sender-name">{{ message.senderName }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-bubble">
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <div class="message-input-container">
      <div class="input-wrapper">
        <textarea
          v-model="messageInput"
          @keydown="handleKeyDown"
          @input="handleInput"
          placeholder="输入消息..."
          class="message-input"
          ref="messageInputRef"
          :disabled="!isConnected"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!messageInput.trim() || !isConnected || sending"
          class="send-button"
        >
          <svg v-if="!sending" viewBox="0 0 24 24" class="send-icon">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
          </svg>
          <div v-else class="sending-spinner"></div>
        </button>
      </div>
      <div v-if="!isConnected" class="connection-status">
        <span class="status-indicator offline"></span>
        WebSocket未连接
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getOrCreateConversation, getConversationMessages } from '@/api/chat'
import { getUserById } from '@/api/user'
import { useUserStore } from '@/stores/user'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const route = useRoute()
const userStore = useUserStore() // 使用用户store
const WS_URL = import.meta.env.VITE_WS_URL || '/ws'

// 响应式数据
const chatUser = ref({})
const messages = ref([])
const messageListRef = ref(null)
const loading = ref(false)
const loadingMore = ref(false) // 加载更多消息的状态
const conversationId = ref(null)
const currentPage = ref(0) // 当前页码
const pageSize = ref(20) // 每页消息数量
const hasMoreMessages = ref(true) // 是否还有更多消息

// WebSocket相关响应式数据
const messageInput = ref('')
const messageInputRef = ref(null)
const sending = ref(false)
const isConnected = ref(false)
const websocket = ref(null)

// 获取聊天对象信息
const loadChatUserInfo = async (userId) => {
  try {
    const response = await getUserById(userId)
    chatUser.value = {
      id: response.data.id,
      username: response.data.username,
      avatar: response.data.avatarUrl || '/images/bac.png',
      isOnline: false,
    }
  } catch (error) {
    console.error('获取聊天用户信息失败:', error)
    chatUser.value = {
      id: userId,
      username: '用户',
      avatar: '/images/bac.png',
      isOnline: false,
    }
  }
}

// 创建或获取会话
const createOrGetConversation = async (targetUserId) => {
  try {
    const response = await getOrCreateConversation(targetUserId)
    // 修正：使用 response.data.id 而不是 response.data.conversationId
    conversationId.value = response.data.id
    return response.data.id
  } catch (error) {
    console.error('创建或获取会话失败:', error)
    throw error
  }
}

// 加载聊天历史
const loadChatHistory = async (page = 0, append = false) => {
  if (!conversationId.value) return

  try {
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
    }

    const response = await getConversationMessages(conversationId.value, page, pageSize.value)
    const newMessages = response.data || []
    const targetUserId = route.params.userId || route.query.userId

    // 如果返回的消息数量少于pageSize，说明没有更多消息了
    if (newMessages.length < pageSize.value) {
      hasMoreMessages.value = false
    }

    // 转换消息格式
    const formattedMessages = newMessages.map((msg) => {
      const isOwnMessage = msg.senderId.toString() !== targetUserId.toString()

      return {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        senderName: isOwnMessage ? userStore.username : chatUser.value.username || '对方',
        senderAvatar: isOwnMessage ? userStore.avatar : chatUser.value.avatar || '/images/bac.png',
        content: msg.content,
        timestamp: new Date(msg.createTime),
        isOwnMessage: isOwnMessage,
        messageType: msg.messageType,
      }
    })

    // 按时间排序
    const sortedMessages = formattedMessages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    )

    if (append) {
      // 追加到现有消息前面（历史消息）
      messages.value = [...sortedMessages, ...messages.value]

      // 保持滚动位置，避免跳动
      nextTick(() => {
        if (messageListRef.value) {
          const scrollHeight = messageListRef.value.scrollHeight
          const clientHeight = messageListRef.value.clientHeight
          messageListRef.value.scrollTop = scrollHeight - clientHeight - 100
        }
      })
    } else {
      // 初始加载，替换所有消息
      messages.value = sortedMessages

      // 滚动到底部
      nextTick(() => {
        if (messageListRef.value) {
          messageListRef.value.scrollTop = messageListRef.value.scrollHeight
        }
      })
    }

    console.log('处理后的消息:', messages.value)
  } catch (error) {
    console.error('加载聊天历史失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多历史消息
const loadMoreMessages = async () => {
  if (loadingMore.value || !hasMoreMessages.value) return

  currentPage.value += 1
  await loadChatHistory(currentPage.value, true)
}

// 监听滚动事件
const handleScroll = () => {
  if (!messageListRef.value || loadingMore.value || !hasMoreMessages.value) return

  const { scrollTop } = messageListRef.value

  // 当滚动到顶部附近时（距离顶部小于50px），加载更多消息
  if (scrollTop < 50) {
    loadMoreMessages()
  }
}

// 初始化聊天
const initializeChat = async () => {
  const userId = route.params.userId || route.query.userId

  if (!userId) {
    console.error('缺少用户ID参数')
    return
  }

  try {
    console.log('开始初始化聊天，目标用户ID:', userId)

    // 重置状态
    currentPage.value = 0
    hasMoreMessages.value = true
    messages.value = []

    // 1. 获取聊天对象信息
    await loadChatUserInfo(userId)
    console.log('聊天用户信息:', chatUser.value)

    // 2. 创建或获取会话
    const convId = await createOrGetConversation(userId)
    console.log('会话ID:', convId)

    // 3. 加载聊天历史
    await loadChatHistory(0, false)

    // 4. 连接WebSocket
    connectWebSocket()

    // 5. 添加滚动监听
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.addEventListener('scroll', handleScroll)
      }
    })
  } catch (error) {
    console.error('初始化聊天失败:', error)
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }
}

// 组件挂载后初始化
onMounted(() => {
  initializeChat()
})

// WebSocket连接函数
const connectWebSocket = () => {
  try {
    console.log('开始连接WebSocket...')

    // 改为使用环境变量配置 WebSocket URL
    const wsUrl = WS_URL

    // 使用SockJS + STOMP
    const socket = new SockJS(wsUrl)
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${userStore.token}`,
      },
      debug: function (str) {
        console.log('STOMP Debug:', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    // 添加连接超时检测
    const connectionTimeout = setTimeout(() => {
      if (!isConnected.value) {
        console.error('WebSocket连接超时')
        stompClient.deactivate()
      }
    }, 10000) // 10秒超时

    stompClient.onConnect = (frame) => {
      clearTimeout(connectionTimeout)
      console.log('WebSocket连接成功:', frame)
      isConnected.value = true

      // 订阅个人消息队列
      stompClient.subscribe('/user/queue/messages', (message) => {
        try {
          const messageData = JSON.parse(message.body)
          handleReceivedMessage(messageData)
        } catch (error) {
          console.error('解析消息失败:', error)
        }
      })

      // 发送JOIN消息
      stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({
          senderId: userStore.id,
          type: 'JOIN',
        }),
      })
    }

    stompClient.onStompError = (frame) => {
      clearTimeout(connectionTimeout)
      console.error('STOMP错误:', frame)
      isConnected.value = false
    }

    stompClient.onWebSocketClose = (event) => {
      console.log('WebSocket连接关闭:', event)
      isConnected.value = false
    }

    stompClient.activate()
    websocket.value = stompClient
  } catch (error) {
    console.error('WebSocket初始化失败:', error)
  }
}

// 处理接收到的消息
const handleReceivedMessage = (data) => {
  const receivedMessage = data
  const targetUserId = route.params.userId || route.query.userId
  const isOwnMessage = receivedMessage.senderId.toString() === userStore.id.toString()

  const formattedMessage = {
    id: receivedMessage.id || Date.now(),
    senderId: receivedMessage.senderId,
    receiverId: receivedMessage.receiverId,
    senderName: isOwnMessage ? userStore.username : chatUser.value.username || '对方',
    senderAvatar: isOwnMessage ? userStore.avatar : chatUser.value.avatar || '/images/bac.png',
    content: receivedMessage.content,
    timestamp: new Date(receivedMessage.createTime || Date.now()),
    isOwnMessage: isOwnMessage,
    messageType: receivedMessage.messageType,
  }

  // 添加到消息列表
  messages.value.push(formattedMessage)

  // 滚动到底部
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || !isConnected.value || !websocket.value) {
    return
  }

  // 确保用户已登录且有有效的ID
  if (!userStore.id || !userStore.token) {
    console.error('用户未登录或缺少认证信息')
    return
  }

  try {
    sending.value = true

    const targetUserId = route.params.userId || route.query.userId

    if (!targetUserId) {
      console.error('缺少目标用户ID')
      return
    }

    const messageData = {
      senderId: parseInt(userStore.id), // 从Pinia userStore获取用户ID
      receiverId: parseInt(targetUserId),
      content: messageInput.value.trim(),
      messageType: 'TEXT',
      conversationId: conversationId.value,
    }

    console.log('发送消息数据:', messageData)

    websocket.value.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(messageData),
    })

    messageInput.value = ''

    // 重置输入框高度
    if (messageInputRef.value) {
      messageInputRef.value.style.height = 'auto'
    }
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
  }
}

// 处理键盘事件
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 处理输入框自动调整高度
const handleInput = () => {
  if (messageInputRef.value) {
    messageInputRef.value.style.height = 'auto'
    messageInputRef.value.style.height = messageInputRef.value.scrollHeight + 'px'
  }
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (websocket.value) {
    websocket.value.deactivate()
    isConnected.value = false
  }
}

// 组件卸载时移除监听器和断开WebSocket
onUnmounted(() => {
  if (messageListRef.value) {
    messageListRef.value.removeEventListener('scroll', handleScroll)
  }
  disconnectWebSocket()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  width: calc(100vw - 200px);
  margin: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  backdrop-filter: blur(15px);
  border: none;
  position: fixed;
  top: 60px;
  left: 200px;
  right: 0;
  bottom: 80px;
  z-index: 100;
}

.chat-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  backdrop-filter: blur(15px);
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  position: relative;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00ffff, #0080ff);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid #1a1a2e;
  transition: background-color 0.3s ease;
}

.online-indicator.active {
  background: #00ffff;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(0, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
  }
}

.user-details h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.5px;
}

.status {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.status.online {
  color: #00ffff;
}

.message-list {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: linear-gradient(135deg, #0f1419 0%, #1a1a2e 50%, #16213e 100%);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  /* 移除 justify-content: flex-end; */
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.1);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 40px;
  font-weight: 500;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-top: 2px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-item.own-message .message-content {
  align-items: flex-end;
}

.message-item.own-message .message-info {
  flex-direction: row-reverse;
}

.message-item.own-message .message-bubble {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
}

.message-item.own-message .message-bubble::before {
  right: -8px;
  left: auto;
  border-left: 8px solid #00ffff;
  border-right: none;
}

.message-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.message-content {
  flex: 1;
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.sender-name {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.message-bubble {
  position: relative;
  background: linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 255, 255, 0.3);
}

.message-bubble::before {
  content: '';
  position: absolute;
  top: 12px;
  left: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #2a2a3e;
}

.message-text {
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.message-item.own-message .message-text {
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    max-width: 100%;
    height: calc(100vh - 120px);
    border-radius: 12px;
    margin: 10px;
  }

  .chat-header {
    padding: 16px 20px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .user-details h3 {
    font-size: 16px;
  }

  .message-list {
    padding: 16px 20px;
  }

  .message-content {
    max-width: 80%;
  }

  .message-avatar img {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .chat-container {
    margin: 5px;
    height: calc(100vh - 110px);
  }

  .message-content {
    max-width: 85%;
  }

  .message-bubble {
    padding: 10px 14px;
  }

  .message-text {
    font-size: 13px;
  }
}
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 20px;
  font-weight: 500;
  font-size: 14px;
}

.no-more-messages {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
  font-size: 14px;
}

.loading-more .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-top: 2px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 消息输入区域样式 */
.message-input-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  backdrop-filter: blur(15px);
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  position: relative;
  margin-bottom: 18px;
}

.message-input-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00ffff, #0080ff);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.08);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  overflow-y: auto;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  width: 18px;
  height: 18px;
  fill: #1a1a2e;
}

.sending-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #1a1a2e;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4444;
}

.status-indicator.online {
  background: #00ffff;
  animation: pulse 2s infinite;
}

.status-indicator.offline {
  background: #ff4444;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-input-container {
    padding: 16px 20px;
  }

  .input-wrapper {
    padding: 10px 14px;
  }

  .send-button {
    width: 36px;
    height: 36px;
  }

  .send-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .message-input-container {
    padding: 12px 16px;
  }

  .message-input {
    font-size: 13px;
  }
}
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 20px;
  font-weight: 500;
  font-size: 14px;
}

.no-more-messages {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
  font-size: 14px;
}

.loading-more .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-top: 2px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
