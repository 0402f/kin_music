<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
        <div class="dialog-container" @click.stop>
          <!-- 内容区域 -->
          <div class="dialog-content">
            <!-- 图标 -->
            <div class="dialog-icon">
              <svg v-if="type === 'warning'" class="icon-warning" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <svg v-else-if="type === 'info'" class="icon-info" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            
            <!-- 消息内容 -->
            <div class="dialog-message">
              <h4 class="dialog-title">{{ title }}</h4>
              <p class="dialog-text">{{ message }}</p>
            </div>
          </div>
          
          <!-- 按钮区域 -->
          <div class="dialog-actions">
            <button class="dialog-btn btn-cancel" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button class="dialog-btn btn-confirm" @click="handleConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'warning', // 'warning' | 'info'
    validator: (value) => ['warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleCancel()
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
  z-index: 10000;
}

.dialog-container {
  background: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #404040;
  width: 360px;
  max-width: 90vw;
  overflow: hidden;
}

.dialog-content {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.dialog-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.icon-warning {
  color: #f39c12;
}

.icon-info {
  color: #3498db;
}

.dialog-message {
  flex: 1;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.dialog-text {
  font-size: 14px;
  line-height: 1.4;
  color: #ccc;
  margin: 0;
}

.dialog-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 70px;
}

.btn-cancel {
  background: #404040;
  color: #ccc;
  border: 1px solid #555;
}

.btn-cancel:hover {
  background: #4a4a4a;
  color: #fff;
  border-color: #666;
}

.btn-confirm {
  background: #e74c3c;
  color: white;
  border: 1px solid #c0392b;
}

.btn-confirm:hover {
  background: #c0392b;
  border-color: #a93226;
}

/* 过渡动画 */
.dialog-enter-active {
  transition: all 0.25s ease-out;
}

.dialog-leave-active {
  transition: all 0.2s ease-in;
}

.dialog-enter-from {
  opacity: 0;
}

.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container {
  transform: translateY(-30px) scale(0.95);
}

.dialog-leave-to .dialog-container {
  transform: translateY(-20px) scale(0.98);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .dialog-overlay {
    padding-top: 80px;
  }
  
  .dialog-container {
    width: calc(100vw - 40px);
  }
  
  .dialog-actions {
    flex-direction: column;
  }
  
  .dialog-btn {
    width: 100%;
  }
}
</style>