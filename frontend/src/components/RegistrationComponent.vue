<template>
  <div class="auth-container">
    <!-- Декоративный фон -->
    <div class="grid-overlay"></div>
    <div class="glow-orb glow-orb-1"></div>
    <div class="glow-orb glow-orb-2"></div>
    <div class="glow-orb glow-orb-3"></div>

    <!-- Карточка авторизации -->
    <div class="auth-card">
      <!-- Логотип и заголовок -->
      <div class="auth-header">
        <div class="logo-wrapper">
          <span class="logo-icon">◈</span>
          <h1 class="logo-text">MAUPORIA</h1>
          <span class="logo-icon">◈</span>
        </div>
        <div class="welcome-text">Добро пожаловать!</div>
        <div class="auth-title">РЕГИСТРАЦИЯ</div>
        <div class="auth-subtitle">СОЗДАЙТЕ АККАУНТ ДЛЯ ПОГРУЖЕНИЯ</div>
      </div>

      <!-- Форма регистрации -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Имя пользователя -->
        <div class="input-group">
          <label for="username" class="input-label">
            <span class="label-icon">👤</span>
            ИМЯ ПОЛЬЗОВАТЕЛЯ
          </label>
          <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Как вас называть в мирах?"
              class="input-field"
              :class="{ 'input-filled': form.username }"
          />
        </div>

        <!-- Email -->
        <div class="input-group">
          <label for="email" class="input-label">
            <span class="label-icon">✉</span>
            EMAIL
          </label>
          <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="ваша@почта.ком"
              class="input-field"
              :class="{ 'input-filled': form.email }"
          />
        </div>

        <!-- Пароль -->
        <div class="input-group">
          <label for="password" class="input-label">
            <span class="label-icon">🔒</span>
            ПАРОЛЬ
          </label>
          <div class="password-wrapper">
            <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="input-field password-field"
                :class="{ 'input-filled': form.password }"
            />
            <button
                type="button"
                @click="showPassword = !showPassword"
                class="toggle-password"
                tabindex="-1"
            >
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <!-- Подтверждение пароля -->
        <div class="input-group">
          <label for="confirmPassword" class="input-label">
            <span class="label-icon">✓</span>
            ПОДТВЕРДИТЕ ПАРОЛЬ
          </label>
          <div class="password-wrapper">
            <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="input-field password-field"
                :class="{ 'input-filled': form.confirmPassword }"
            />
            <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="toggle-password"
                tabindex="-1"
            >
              {{ showConfirmPassword ? '🙈' : '👁' }}
            </button>
          </div>
          <!-- Индикатор совпадения паролей -->
          <div v-if="form.password || form.confirmPassword" class="password-match-indicator">
            <span v-if="passwordsMatch" class="match-success">✓ Пароли совпадают</span>
            <span v-else class="match-error">✗ Пароли не совпадают</span>
          </div>
        </div>

        <!-- Согласие с условиями -->
        <div class="terms-group">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="form.agreeToTerms"
                class="cyber-checkbox"
            />
            <span class="checkmark"></span>
            <span class="terms-text">
              Я принимаю условия <a href="#" @click.prevent="showTerms">Пользовательского соглашения</a>
              и соглашаюсь на обработку данных нейросетью Mauporia
            </span>
          </label>
        </div>

        <!-- Блок с OAuth (Яндекс) -->
        <div class="oauth-section">
          <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-text">ИЛИ</span>
            <span class="divider-line"></span>
          </div>

          <button type="button" class="oauth-btn yandex-btn" @click="registerWithYandex">
            <span class="oauth-icon">Я</span>
            <span>Зарегистрироваться через Яндекс</span>
          </button>
        </div>

        <!-- Кнопка регистрации -->
        <button type="submit" class="submit-btn" :disabled="!isFormValid">
          <span class="btn-text">СОЗДАТЬ АККАУНТ</span>
          <span class="btn-icon">→</span>
          <div class="btn-glow"></div>
        </button>
      </form>

      <!-- Ссылка на вход -->
      <div class="auth-footer">
        <p class="footer-text">
          Уже есть аккаунт?
          <a href="#" @click.prevent="switchToLogin" class="footer-link">ВОЙТИ</a>
        </p>
        <div class="footer-features">
          <span>⚡ НЕЙРОСЕТИ</span>
          <span class="separator">•</span>
          <span>🌌 MAUPORIA</span>
          <span class="separator">•</span>
          <span>🎮 ПОКОРЯЙ МИРЫ</span>
        </div>
      </div>
    </div>

    <!-- Модальное окно с условиями -->
    <div v-if="showTermsModal" class="modal-overlay" @click="showTermsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</h3>
          <button class="modal-close" @click="showTermsModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Добро пожаловать в MAUPORIA — вселенную, создаваемую нейросетями и вашей фантазией.</p>
          <p>Регистрируясь, вы соглашаетесь на обработку данных для генерации персонализированных приключений, сохранения прогресса и улучшения виртуального мастера.</p>
          <p>Мы не передаём ваши данные третьим лицам. Вся магия остаётся внутри Mauporia.</p>
        </div>
        <button class="modal-btn" @click="showTermsModal = false">ПОНЯТНО</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MauporiaRegister',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      },
      showPassword: false,
      showConfirmPassword: false,
      showTermsModal: false
    }
  },
  computed: {
    passwordsMatch() {
      if (!this.form.password && !this.form.confirmPassword) return true;
      return this.form.password === this.form.confirmPassword;
    },
    isFormValid() {
      return this.form.username.trim() !== '' &&
          this.form.email.trim() !== '' &&
          this.form.password.length >= 6 &&
          this.passwordsMatch &&
          this.form.agreeToTerms;
    }
  },
  methods: {
    async handleRegister() {
      if (!this.isFormValid) {
        this.showNotification('⚠️ Заполните все поля корректно', 'error');
        return;
      }

      // Имитация отправки данных
      console.log('🌌 Регистрация в Mauporia:', {
        username: this.form.username,
        email: this.form.email
      });

      this.showNotification('✨ Аккаунт создан! Добро пожаловать в Mauporia', 'success');

      // Здесь можно отправить данные на сервер или эмитить событие
      // this.$emit('register', { ...this.form })
    },

    registerWithYandex() {
      console.log('🔑 Авторизация через Яндекс ID');
      this.showNotification('🔄 Перенаправление на Яндекс ID...', 'info');
      // Здесь логика OAuth
    },

    switchToLogin() {
      console.log('↩️ Переход на страницу входа');
      this.showNotification('↩️ Переход к входу в аккаунт', 'info');
      // this.$emit('switch-to-login')
    },

    showTerms() {
      this.showTermsModal = true;
    },

    showNotification(message, type = 'info') {
      // Простая имитация уведомления (можно заменить на свою систему)
      alert(message);
    }
  }
}
</script>

<style scoped>
/* === ОБЩИЕ СТИЛИ В СТИЛЕ STORYFORGE/MAUPORIA === */
.auth-container {
  min-height: 100vh;
  background: radial-gradient(circle at 30% 20%, #0a0e1c, #020408);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  font-family: 'Segoe UI', 'Exo 2', 'Roboto', system-ui, sans-serif;
  overflow: hidden;
}

/* Декоративные элементы */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(100, 0, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100, 0, 255, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.glow-orb {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}

.glow-orb-1 {
  background: #7000ff;
  top: -100px;
  left: -100px;
}

.glow-orb-2 {
  background: #00ccff;
  bottom: -100px;
  right: -50px;
}

.glow-orb-3 {
  background: #ff00aa;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.1;
}

/* Карточка */
.auth-card {
  position: relative;
  z-index: 2;
  max-width: 480px;
  width: 100%;
  background: rgba(8, 12, 24, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(120, 0, 255, 0.3);
  border-radius: 36px;
  padding: 36px 32px;
  box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(150, 0, 255, 0.15) inset,
      0 0 40px rgba(120, 0, 255, 0.2);
  transition: box-shadow 0.3s;
}

.auth-card:hover {
  box-shadow:
      0 25px 60px rgba(0, 0, 0, 0.9),
      0 0 0 1px rgba(150, 0, 255, 0.3) inset,
      0 0 50px rgba(150, 0, 255, 0.3);
}

/* Заголовок */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 24px;
  color: #b000ff;
  text-shadow: 0 0 15px #b000ff;
}

.logo-text {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 6px;
  background: linear-gradient(135deg, #ffffff 0%, #d4a0ff 60%, #a0d0ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  text-shadow: 0 0 20px #8000ff80;
}

.welcome-text {
  font-size: 18px;
  color: #c0d0ff;
  letter-spacing: 2px;
  margin-bottom: 12px;
  text-transform: uppercase;
  opacity: 0.9;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 5px;
  color: #e0e8ff;
  text-shadow: 0 0 10px #6080ff;
  margin-bottom: 6px;
}

.auth-subtitle {
  font-size: 11px;
  color: #8899cc;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-bottom: 1px dashed #4050a0;
  padding-bottom: 16px;
}

/* Форма */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #b0c0ff;
  text-transform: uppercase;
}

.label-icon {
  font-size: 16px;
}

.input-field {
  background: rgba(10, 15, 30, 0.7);
  border: 1.5px solid #3040a0;
  border-radius: 14px;
  padding: 14px 18px;
  font-size: 15px;
  color: #e8f0ff;
  outline: none;
  transition: all 0.25s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4) inset;
  backdrop-filter: blur(4px);
}

.input-field::placeholder {
  color: #6070a0;
  font-weight: 300;
}

.input-field:focus {
  border-color: #a060ff;
  box-shadow: 0 0 20px #8040ff55, 0 4px 10px rgba(0, 0, 0, 0.5) inset;
  background: rgba(15, 20, 40, 0.8);
}

.input-filled {
  border-color: #6080d0;
}

/* Поле пароля с глазиком */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field {
  width: 100%;
  padding-right: 50px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 5px;
}

.toggle-password:hover {
  opacity: 1;
}

/* Индикатор совпадения паролей */
.password-match-indicator {
  font-size: 12px;
  margin-top: 4px;
  padding-left: 8px;
}

.match-success {
  color: #40ffaa;
}

.match-error {
  color: #ff6080;
}

/* Чекбокс с условиями */
.terms-group {
  margin: 8px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #b0c8e0;
  position: relative;
  padding-left: 30px;
}

.cyber-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  top: 2px;
  height: 20px;
  width: 20px;
  background: rgba(20, 30, 50, 0.8);
  border: 2px solid #4060b0;
  border-radius: 6px;
  transition: all 0.2s;
}

.checkbox-label:hover .checkmark {
  border-color: #a060ff;
  box-shadow: 0 0 8px #8040ff;
}

.cyber-checkbox:checked ~ .checkmark {
  background: #6040c0;
  border-color: #a080ff;
}

.cyber-checkbox:checked ~ .checkmark:after {
  content: "✓";
  position: absolute;
  left: 4px;
  top: -2px;
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.terms-text {
  line-height: 1.4;
}

.terms-text a {
  color: #a0c0ff;
  text-decoration: none;
  border-bottom: 1px dashed #6080c0;
}

.terms-text a:hover {
  color: #c0e0ff;
  border-bottom-color: #c0e0ff;
}

/* OAuth секция */
.oauth-section {
  margin: 8px 0 16px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #4060b0, transparent);
}

.divider-text {
  color: #6080b0;
  font-size: 12px;
  letter-spacing: 2px;
}

.oauth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(30, 40, 70, 0.6);
  border: 1.5px solid #ff3333;
  border-radius: 40px;
  padding: 14px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.yandex-btn {
  border-color: #ff3333;
  box-shadow: 0 0 15px #ff333330;
}

.yandex-btn:hover {
  background: rgba(50, 30, 30, 0.7);
  border-color: #ff5555;
  box-shadow: 0 0 20px #ff333360;
}

.oauth-icon {
  font-size: 20px;
  font-weight: bold;
  color: #ff3333;
}

/* Кнопка регистрации */
.submit-btn {
  position: relative;
  background: linear-gradient(145deg, #301060, #1a0840);
  border: 1.5px solid #a060ff;
  border-radius: 60px;
  padding: 18px 28px;
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-shadow: 0 10px 25px #00000070, 0 0 30px #8040ff40;
  transition: all 0.2s;
  overflow: hidden;
  margin-top: 8px;
}

.submit-btn:not(:disabled):hover {
  background: linear-gradient(145deg, #4020a0, #281060);
  border-color: #c080ff;
  box-shadow: 0 10px 30px #00000090, 0 0 40px #a060ff;
  transform: scale(1.02);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-text {
  z-index: 1;
}

.btn-icon {
  font-size: 24px;
  z-index: 1;
}

.btn-glow {
  position: absolute;
  top: -30px;
  left: -30px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #a060ff60, transparent 70%);
  opacity: 0.6;
  pointer-events: none;
}

/* Футер */
.auth-footer {
  margin-top: 28px;
  text-align: center;
}

.footer-text {
  color: #8090c0;
  font-size: 15px;
  margin-bottom: 16px;
}

.footer-link {
  color: #a0c0ff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid #6080c0;
  padding-bottom: 2px;
  transition: all 0.2s;
}

.footer-link:hover {
  color: #d0e0ff;
  border-bottom-color: #a0c0ff;
  text-shadow: 0 0 8px #6080ff;
}

.footer-features {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5060a0;
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.separator {
  color: #8060c0;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  max-width: 450px;
  background: #0a1020;
  border: 2px solid #6040c0;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px #000000, 0 0 40px #8040ff60;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #d0d8ff;
  margin: 0;
  font-size: 20px;
  letter-spacing: 2px;
}

.modal-close {
  background: transparent;
  border: 1px solid #4060b0;
  color: #a0b0ff;
  font-size: 24px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #203060;
  border-color: #a060ff;
}

.modal-body {
  color: #b0c0e0;
  line-height: 1.6;
  margin-bottom: 24px;
}

.modal-btn {
  width: 100%;
  background: #3020a0;
  border: none;
  border-radius: 40px;
  padding: 14px;
  color: white;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  border: 1px solid #8060ff;
  transition: 0.2s;
}

.modal-btn:hover {
  background: #4830c0;
  box-shadow: 0 0 20px #8060ff;
}

/* Адаптив */
@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
  }
  .logo-text {
    font-size: 24px;
    letter-spacing: 4px;
  }
  .submit-btn {
    font-size: 16px;
    padding: 14px 18px;
  }
}
</style>