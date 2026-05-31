<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast-container', { fixed: fixed }]">
      <div :class="['toast-content', type]">
        <!-- 成功图标 -->
        <svg
          v-if="type === 'success'"
          class="toast-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <!-- 错误图标 -->
        <svg
          v-else
          class="toast-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['success', 'error'].includes(value),
  },
  duration: {
    type: Number,
    default: 2000,
  },
  fixed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

let timer = null

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 清除之前的定时器
      if (timer) {
        clearTimeout(timer)
      }
      // 设置新的定时器
      timer = setTimeout(() => {
        emit('close')
      }, props.duration)
    } else {
      // 清除定时器
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }
  },
)
</script>

<style scoped>
.toast-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10001;
  pointer-events: none;
}

.toast-container.fixed {
  position: fixed !important;
  z-index: 10002;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  font-size: 14px;
  font-weight: 500;
  max-width: 400px;
  word-break: break-word;
}

.toast-content.error {
  background: rgba(231, 76, 60, 0.95);
  color: white;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.toast-content.success {
  background: rgba(46, 204, 113, 0.95);
  color: white;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.toast-icon {
  flex-shrink: 0;
}

.toast-message {
  line-height: 1.4;
}

/* 过渡动画 */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
