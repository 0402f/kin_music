<template>
  <Teleport to="body">
    <div v-if="visible" class="auth-overlay" ref="overlayRef" @click="closeModal">
      <div class="auth-sheet" ref="sheetRef" @click.stop>
        <!-- 拖拽指示条（移动端） -->
        <div class="auth-handle"></div>

        <!-- 头部 -->
        <div class="auth-head">
          <h2 class="auth-title">{{ isLogin ? '欢迎回来' : '创建账号' }}</h2>
          <p class="auth-sub">{{ isLogin ? '登录你的账号继续听歌' : '加入 Kin Music，发现更多音乐' }}</p>
          <button class="auth-close" @click="closeModal" aria-label="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- 标签切换 -->
        <div class="auth-tabs" ref="tabsRef">
          <button :class="['auth-tab', { on: isLogin }]" @click="switchMode(true)">登录</button>
          <button :class="['auth-tab', { on: !isLogin }]" @click="switchMode(false)">注册</button>
        </div>

        <!-- 表单区 -->
        <div class="auth-form-wrap" ref="formWrapRef">
          <!-- 登录表单 -->
          <form v-show="isLogin" class="auth-form" @submit.prevent="handleSubmit">
            <div class="af-group">
              <div class="af-input-box">
                <svg class="af-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                <input v-model="formData.username" type="text" class="af-input" placeholder="用户名" required />
              </div>
            </div>
            <div class="af-group">
              <div class="af-input-box">
                <svg class="af-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input v-model="formData.password" type="password" class="af-input" placeholder="密码" required />
              </div>
            </div>
            <button type="submit" class="af-submit" :disabled="loading">
              <span v-if="loading" class="af-spinner"></span>
              <span v-else>登 录</span>
            </button>
          </form>

          <!-- 注册表单 -->
          <form v-show="!isLogin" class="auth-form" @submit.prevent="handleSubmit">
            <div class="af-group">
              <div class="af-input-box">
                <svg class="af-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                <input v-model="formData.username" type="text" class="af-input" placeholder="用户名" required />
              </div>
            </div>
            <div class="af-group">
              <div class="af-input-box">
                <svg class="af-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                <input v-model="formData.email" type="email" class="af-input" placeholder="邮箱" required />
              </div>
            </div>
            <div class="af-group">
              <div class="af-input-box">
                <svg class="af-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input v-model="formData.password" type="password" class="af-input" placeholder="密码" required />
              </div>
            </div>
            <button type="submit" class="af-submit" :disabled="loading">
              <span v-if="loading" class="af-spinner"></span>
              <span v-else>注 册</span>
            </button>
          </form>
        </div>

        <!-- 底部切换提示 -->
        <p class="auth-switch">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <button @click="toggleMode">{{ isLogin ? '立即注册' : '立即登录' }}</button>
        </p>
      </div>
    </div>

    <Toast :visible="showToast" :message="toastMessage" :type="toastType" @close="showToast = false" />
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import Toast from './Toast.vue'
import gsap from 'gsap'

const props = defineProps({ visible: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'success'])
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error')

const formData = reactive({ username: '', email: '', password: '' })
const resetForm = () => { formData.username = ''; formData.email = ''; formData.password = '' }

const overlayRef = ref(null)
const sheetRef = ref(null)

// === GSAP 入场 ===
let enterTl = null
const animateIn = () => {
  nextTick(() => {
    if (enterTl) enterTl.kill()
    enterTl = gsap.timeline()
    // 遮罩淡入
    enterTl.fromTo(overlayRef.value, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' })
    // 弹窗从底部滑入（移动端）/ 缩放弹出（桌面）
    const isMobile = window.innerWidth <= 768
    enterTl.fromTo(sheetRef.value,
      isMobile
        ? { y: '100%', autoAlpha: 1 }
        : { scale: 0.92, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.4)' },
      '-=0.15'
    )
  })
}

// === GSAP 退场 ===
const animateOut = (onDone) => {
  if (enterTl) enterTl.kill()
  const isMobile = window.innerWidth <= 768
  const tl = gsap.timeline({ onComplete: onDone })
  tl.to(sheetRef.value,
    isMobile ? { y: '100%', duration: 0.2, ease: 'power3.in' }
      : { scale: 0.9, autoAlpha: 0, duration: 0.15, ease: 'power2.in' }
  )
  tl.to(overlayRef.value, { autoAlpha: 0, duration: 0.15, ease: 'power2.out' }, '-=0.1')
}

// === GSAP 表单切换 ===
const formWrapRef = ref(null)
const switchMode = (login) => {
  if (login === isLogin.value) return
  isLogin.value = login
  nextTick(() => {
    if (formWrapRef.value) {
      gsap.fromTo(formWrapRef.value, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' })
    }
  })
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
  nextTick(() => {
    if (formWrapRef.value) {
      gsap.fromTo(formWrapRef.value, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' })
    }
  })
}

const closeModal = () => {
  animateOut(() => {
    emit('close')
    resetForm()
    isLogin.value = true
  })
}

const handleSubmit = async () => {
  loading.value = true; showToast.value = false
  try {
    let result
    if (isLogin.value) {
      result = await userStore.login({ username: formData.username, password: formData.password })
    } else {
      result = await userStore.register({ username: formData.username, email: formData.email, password: formData.password })
    }
    if (result.success) {
      if (isLogin.value) { emit('success'); closeModal() }
      else {
        const u = formData.username; const p = formData.password; const e = formData.email
        isLogin.value = true; formData.username = u; formData.email = e; formData.password = p
        toastMessage.value = '注册成功！请点击登录'; toastType.value = 'success'; showToast.value = true
        nextTick(() => {
          if (formWrapRef.value) {
            gsap.fromTo(formWrapRef.value, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' })
          }
        })
      }
    } else {
      toastMessage.value = result.message; toastType.value = 'error'; showToast.value = true
    }
  } catch (e) {
    toastMessage.value = e.message || '操作失败'; toastType.value = 'error'; showToast.value = true
  } finally { loading.value = false }
}

watch(() => props.visible, (v) => {
  if (v) { isLogin.value = true; resetForm(); animateIn() }
})
</script>

<style scoped>
/* ==================== 遮罩 ==================== */
.auth-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ==================== 弹窗主体 ==================== */
.auth-sheet {
  width: 100%; max-width: 420px;
  max-height: 85vh; overflow-y: auto;
  background: linear-gradient(180deg, #15162a 0%, #0f1022 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px 20px 0 0;
  padding: 0 28px 34px;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.5);
}

/* 拖拽指示条（仅移动端可见） */
.auth-handle {
  display: none; width: 36px; height: 4px;
  margin: 12px auto 0;
  background: rgba(255,255,255,0.15); border-radius: 2px;
}

/* ==================== 头部 ==================== */
.auth-head { position: relative; text-align: center; padding: 24px 0 0; }
.auth-title { font-size: 22px; font-weight: 700; color: #edf0f5; margin: 0; }
.auth-sub { font-size: 13px; color: rgba(255,255,255,0.35); margin: 6px 0 0; }
.auth-close { position: absolute; right: -8px; top: 24px; width: 36px; height: 36px; border: none; border-radius: 10px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.auth-close:hover { background: rgba(255,255,255,0.08); color: #fff; }

/* ==================== 标签 ==================== */
.auth-tabs {
  display: flex; margin: 20px 0 0;
  background: rgba(255,255,255,0.03); border-radius: 12px; padding: 4px;
}
.auth-tab {
  flex: 1; padding: 10px; border: none; border-radius: 10px;
  background: none; color: rgba(255,255,255,0.35); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s;
}
.auth-tab.on { background: rgba(99,102,241,0.15); color: #a5b4fc; }

/* ==================== 表单 ==================== */
.auth-form-wrap { min-height: 180px; padding-top: 20px; }
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.af-group { /* wrapper */ }

.af-input-box {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  transition: border-color 0.2s, background 0.2s;
}
.af-input-box:focus-within {
  border-color: rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.04);
}

.af-icon { color: rgba(255,255,255,0.2); flex-shrink: 0; }
.af-input {
  flex: 1; border: none; background: none; outline: none;
  color: #edf0f5; font-size: 15px; font-family: inherit;
}
.af-input::placeholder { color: rgba(255,255,255,0.2); }

.af-submit {
  margin-top: 6px; padding: 14px;
  border: none; border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; font-size: 15px; font-weight: 700; letter-spacing: 2px;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  min-height: 48px;
}
.af-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
.af-submit:active:not(:disabled) { transform: scale(0.98); }
.af-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.af-spinner {
  width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ==================== 底部切换 ==================== */
.auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.3); }
.auth-switch button { background: none; border: none; color: #818cf8; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; }
.auth-switch button:hover { color: #a5b4fc; }

/* ==================== 桌面端 ==================== */
@media (min-width: 769px) {
  .auth-overlay { align-items: center; }
  .auth-sheet {
    border-radius: 20px;
    max-width: 400px;
    padding-bottom: 36px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.06);
  }
  .auth-handle { display: none; }
}

/* ==================== 移动端 ==================== */
@media (max-width: 768px) {
  .auth-handle { display: block; }
  .auth-sheet { max-height: 88vh; border-radius: 18px 18px 0 0; padding: 0 22px 30px; }
  .auth-title { font-size: 20px; }
  .af-input-box { padding: 12px 14px; }
  .af-input { font-size: 16px; }
}

@media (max-width: 480px) {
  .auth-sheet { padding: 0 18px 26px; border-radius: 16px 16px 0 0; }
  .auth-title { font-size: 18px; }
  .auth-tab { font-size: 13px; padding: 9px; }
}
</style>
