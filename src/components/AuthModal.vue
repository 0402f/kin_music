<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isLogin ? '欢迎回来' : '加入我们' }}</h3>
        <button class="close-btn" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>

      <div class="auth-tabs">
        <button :class="['tab-btn', { active: isLogin }]" @click="setMode(true)">登录</button>
        <button :class="['tab-btn', { active: !isLogin }]" @click="setMode(false)">注册</button>
      </div>

      <!-- 表单容器 - 固定高度 -->
      <div class="form-container">
        <div class="form-wrapper" :class="{ 'show-register': !isLogin }">
          <!-- 登录表单 -->
          <form @submit.prevent="handleSubmit" class="auth-form login-form">
            <div class="form-group">
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
                <input
                  v-model="formData.username"
                  type="text"
                  required
                  placeholder="用户名"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10 C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1 s3.1,1.39,3.1,3.1V8z"
                  />
                </svg>
                <input
                  v-model="formData.password"
                  type="password"
                  required
                  placeholder="密码"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 占位空间，保持高度一致 -->
            <div class="form-group placeholder-group"></div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>登录</span>
            </button>
          </form>

          <!-- 注册表单 -->
          <form @submit.prevent="handleSubmit" class="auth-form register-form">
            <div class="form-group">
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
                <input
                  v-model="formData.username"
                  type="text"
                  required
                  placeholder="用户名"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  />
                </svg>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="邮箱地址"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10 C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1 s3.1,1.39,3.1,3.1V8z"
                  />
                </svg>
                <input
                  v-model="formData.password"
                  type="password"
                  required
                  placeholder="密码"
                  class="form-input"
                />
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>注册</span>
            </button>
          </form>
        </div>
      </div>

      <div class="divider">
        <span>或者</span>
      </div>

      <div class="social-login">
        <button class="social-btn github">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub
        </button>
        <button class="social-btn google">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
      </div>

      <div class="login-link">
        <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
        <button @click="toggleMode" class="link-btn">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Toast提示 -->
  <Toast
    :visible="showToast"
    :message="toastMessage"
    :type="toastType"
    @close="showToast = false"
  />
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import Toast from './Toast.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'success'])

const userStore = useUserStore()
const isLogin = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error') // 'success' | 'error'

// Remove the misplaced code block from lines 189-220
// This code should be inside the handleSubmit function

const formData = reactive({
  username: '',
  email: '',
  password: '',
})

// 重置表单
const resetForm = () => {
  formData.username = ''
  formData.email = ''
  formData.password = ''
  errorMessage.value = ''
  showToast.value = false
}

// 设置模式
const setMode = (loginMode) => {
  isLogin.value = loginMode
  resetForm()
}

// 切换登录/注册模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

// 关闭弹窗
const closeModal = () => {
  emit('close')
  resetForm()
}

// 处理表单提交
const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  showToast.value = false

  try {
    let result
    if (isLogin.value) {
      result = await userStore.login({
        username: formData.username,
        password: formData.password,
      })
    } else {
      result = await userStore.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    }

    if (result.success) {
      if (isLogin.value) {
        // 登录成功，关闭弹窗
        emit('success')
        closeModal()
      } else {
        // 注册成功，切换到登录界面并保留用户名和密码
        const registeredUsername = formData.username
        const registeredPassword = formData.password

        // 切换到登录模式
        isLogin.value = true

        // 清空表单后重新填充用户名和密码
        formData.username = registeredUsername
        formData.email = ''
        formData.password = registeredPassword

        // 显示成功提示
        toastMessage.value = '注册成功！请点击登录按钮完成登录'
        toastType.value = 'success'
        showToast.value = true

        // 3秒后自动隐藏提示
        setTimeout(() => {
          showToast.value = false
        }, 3000)
      }
    } else {
      toastMessage.value = result.message
      toastType.value = 'error'
      showToast.value = true
    }
  } catch (error) {
    toastMessage.value = error.message || '操作失败'
    toastType.value = 'error'
    showToast.value = true
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示状态，重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetForm()
      isLogin.value = true
    }
  },
)
</script>

<style scoped>
/* 保持原有样式不变 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  animation: slideUp 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #00ffff 0%, #0080ff 50%, #00ffff 100%);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  transform: rotate(90deg);
}

.auth-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.4s ease;
}

.tab-btn:hover {
  color: #00ffff;
}

.tab-btn:hover::before {
  left: 100%;
}

.tab-btn.active {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
  font-weight: 600;
}

/* 表单容器 - 固定高度 */
.form-container {
  height: 280px;
  overflow: hidden;
  position: relative;
  margin-bottom: 24px;
}

.form-wrapper {
  display: flex;
  width: 200%;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-wrapper.show-register {
  transform: translateX(-50%);
}

.auth-form {
  width: 50%;
  flex-shrink: 0;
  padding-right: 20px;
  box-sizing: border-box;
}

.register-form {
  padding-left: 20px;
  padding-right: 0;
}

.form-group {
  margin-bottom: 20px;
}

/* 占位组，保持登录表单高度一致 */
.placeholder-group {
  height: 68px;
  visibility: hidden;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: rgba(0, 255, 255, 0.7);
  z-index: 1;
  transition: all 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  background: rgba(0, 0, 0, 0.3);
  box-shadow:
    0 0 0 3px rgba(0, 255, 255, 0.2),
    0 0 20px rgba(0, 255, 255, 0.1);
}

.form-input:focus + .input-icon,
.input-wrapper:hover .input-icon {
  color: #00ffff;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 0;
  margin-top: 8px;
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
  backdrop-filter: blur(10px);
}

/* 为提交按钮添加上边距 */
.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: -8px;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
  filter: brightness(1.1);
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
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

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
}

.divider span {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 0 16px;
  position: relative;
}

.social-login {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.social-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.4s ease;
}

.social-btn:hover {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);
}

.social-btn:hover::before {
  left: 100%;
}

.social-btn.github {
  color: rgba(255, 255, 255, 0.8);
}

.social-btn.github:hover {
  color: #ffffff;
}

.social-btn.google {
  color: rgba(255, 255, 255, 0.8);
}

.social-btn.google:hover {
  color: #00ffff;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.link-btn {
  background: none;
  border: none;
  color: #00ffff;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-left: 4px;
}

.link-btn:hover {
  color: #ffffff;
  text-decoration: underline;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
}

/* 为登录表单的输入框组设置更大的间距 */
.auth-form:not(.register-form) .form-group {
  margin-bottom: 30px;
}

/* 保持注册表单的原有间距 */
.register-form .form-group {
  margin-bottom: 20px;
}

/* 占位组可以移除或调整高度 */
.placeholder-group {
  height: 20px;
  visibility: hidden;
}
</style>
