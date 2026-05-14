<template>
  <div class="storyforge-form-container">
    <!-- Декоративный фон с сеткой и свечением -->
    <div class="grid-overlay"></div>
    <div class="glow-orb glow-orb-1"></div>
    <div class="glow-orb glow-orb-2"></div>

    <!-- Оверлей загрузки -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <!-- Крутилка -->
        <div class="spinner-container">
          <div class="spinner-ring"></div>
          <div class="spinner-ring spinner-ring-2"></div>
          <div class="spinner-ring spinner-ring-3"></div>
          <div class="spinner-core">
            <span class="core-icon">◈</span>
          </div>
        </div>

        <!-- Текст загрузки -->
        <div class="loading-text">
          <h3 class="loading-title">СОЗДАНИЕ МИРА</h3>
          <p class="loading-subtitle">Нейросеть генерирует вселенную...</p>
        </div>

        <!-- Прогресс-бар -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <!-- Шаги создания -->
        <div class="loading-steps">
          <div class="step" :class="{ 'step-active': currentStep >= 1, 'step-done': currentStep > 1 }">
            <span class="step-icon">{{ currentStep > 1 ? '✓' : '🌌' }}</span>
            <span class="step-text">Генерация галактики</span>
          </div>
          <div class="step" :class="{ 'step-active': currentStep >= 2, 'step-done': currentStep > 2 }">
            <span class="step-icon">{{ currentStep > 2 ? '✓' : '👥' }}</span>
            <span class="step-text">Создание NPC</span>
          </div>
          <div class="step" :class="{ 'step-active': currentStep >= 3, 'step-done': currentStep > 3 }">
            <span class="step-icon">{{ currentStep > 3 ? '✓' : '📜' }}</span>
            <span class="step-text">Написание сюжета</span>
          </div>
          <div class="step" :class="{ 'step-active': currentStep >= 4 }">
            <span class="step-icon">🎮</span>
            <span class="step-text">Запуск игры</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Карточка формы -->
    <div class="form-card">
      <!-- Заголовок -->
      <div class="form-header">
        <div class="title-line">
          <span class="title-accent">//</span>
          <h2 class="form-title">НОВОЕ ПРИКЛЮЧЕНИЕ</h2>
          <span class="title-accent">//</span>
        </div>
        <div class="subtitle">ВИРТУАЛЬНЫЙ МАСТЕР · ГЕНЕРАЦИЯ СЮЖЕТА</div>
      </div>

      <!-- Форма -->
      <form class="adventure-form" @submit.prevent>
        <!-- Название приключения -->
        <div class="input-group">
          <label for="adventure-name" class="input-label">
            <span class="label-icon">⟡</span>
            НАЗВАНИЕ ЭКСПЕДИЦИИ
          </label>
          <input
              id="adventure-name"
              v-model="form.adventureName"
              type="text"
              placeholder="например: Эхо Андромеды"
              class="input-field"
              :class="{ 'input-filled': form.adventureName }"
              :disabled="isLoading"
          />
          <div class="input-hint">Выберите имя, достойное легенд</div>
        </div>

        <!-- Количество игроков -->
        <div class="input-group">
          <label class="input-label">
            <span class="label-icon">⚔</span>
            СОСТАВ ЭКИПАЖА / ОТРЯДА
          </label>

          <div class="players-control">
            <div class="slider-wrapper">
              <input
                  type="range"
                  v-model.number="form.playerCount"
                  min="1"
                  max="10"
                  step="1"
                  class="player-slider"
                  :disabled="isLoading"
              />
              <div class="slider-ticks">
                <span v-for="n in 10" :key="n"
                      class="tick"
                      :class="{ 'active-tick': n <= form.playerCount }">
                  |
                </span>
              </div>
            </div>

            <div class="player-count-display">
              <span class="count-number">{{ form.playerCount }}</span>
              <span class="count-label">{{ playerWord }}</span>
            </div>
          </div>

          <div class="player-presets">
            <button
                type="button"
                v-for="preset in [1, 3, 5, 10]"
                :key="preset"
                @click="form.playerCount = preset"
                class="preset-btn"
                :class="{ 'preset-active': form.playerCount === preset }"
                :disabled="isLoading"
            >
              {{ preset }}
            </button>
          </div>
          <div class="input-hint">От 1 до 10 · можно изменить в любой момент</div>
        </div>

        <!-- Статус -->
        <div class="live-status">
          <div class="status-indicator">
            <span class="pulse-dot"></span>
            ВИРТУАЛЬНЫЙ МАСТЕР ОНЛАЙН
          </div>
          <div class="status-message">
            <span v-if="form.adventureName && form.playerCount">
              Сейчас: готовится «{{ form.adventureName }}» для отряда из {{ form.playerCount }} {{ playerWord }}. Нейросеть создаёт уникальную завязку.
            </span>
            <span v-else-if="form.adventureName">
              Сейчас: экспедиция «{{ form.adventureName }}» ожидает уточнения состава. Мастер предлагает три пути начала.
            </span>
            <span v-else>
              Сейчас: экипаж звездолёта столкнулся с неизвестной аномалией и предлагает три пути спасения.
            </span>
          </div>
        </div>

        <!-- Кнопка отправки -->
        <button
            type="button"
            @click="handleSubmit()"
            class="submit-btn"
            :class="{ 'btn-loading': isLoading }"
            :disabled="isLoading"
        >
          <span v-if="!isLoading" class="btn-text">НАЧАТЬ ИССЛЕДОВАНИЕ</span>
          <span v-else class="btn-text">СОЗДАЁМ МИР...</span>
          <span v-if="!isLoading" class="btn-icon">→</span>
          <span v-else class="btn-icon btn-spinner"></span>
          <div class="btn-glow"></div>
        </button>
      </form>

      <!-- Футер -->
      <div class="form-footer">
        <div class="footer-features">
          <span>⚡ НЕЙРОСЕТИ</span>
          <span class="separator">•</span>
          <span>🎲 ГЕНЕРАЦИЯ В РЕАЛЬНОМ ВРЕМЕНИ</span>
          <span class="separator">•</span>
          <span>🛡️ ИДЕАЛЬНО ДЛЯ НОВИЧКОВ</span>
        </div>
        <div class="footer-copyright">#MAUPORIA · ПОКОРЯЙ МИРЫ</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoryForgeForm',
  data() {
    return {
      form: {
        adventureName: '',
        playerCount: 3
      },
      isLoading: false,
      currentStep: 0,
      loadingStepsInterval: null
    }
  },
  computed: {
    playerWord() {
      const count = this.form.playerCount;
      if (count % 10 === 1 && count % 100 !== 11) return 'игрок';
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'игрока';
      return 'игроков';
    }
  },
  methods: {
    // Имитация шагов загрузки
    startLoadingAnimation() {
      this.currentStep = 0
      const steps = [1, 2, 3, 4]
      let index = 0

      this.loadingStepsInterval = setInterval(() => {
        if (index < steps.length) {
          this.currentStep = steps[index]
          index++
        } else {
          clearInterval(this.loadingStepsInterval)
        }
      }, 800)
    },

    async handleSubmit() {
      if (!this.form.adventureName.trim()) {
        alert('Введите название приключения, капитан.');
        return;
      }

      // Включаем загрузку
      this.isLoading = true
      this.startLoadingAnimation()

      try {
        // Отправляем запрос
        await this.$store.dispatch('createGame', this.form)

        // Небольшая задержка чтоб пользователь увидел финальный шаг
        await new Promise(resolve => setTimeout(resolve, 500))

        // Очищаем анимацию
        clearInterval(this.loadingStepsInterval)
        this.currentStep = 4

        // Ещё маленькая пауза
        await new Promise(resolve => setTimeout(resolve, 300))

        // Переходим на страницу игры
        this.$router.push(`${this.$store.getters.GAME.id}/game`)

      } catch (error) {
        console.error('Ошибка создания игры:', error)
        clearInterval(this.loadingStepsInterval)

        // Показываем ошибку пользователю
        alert('Произошла ошибка при создании игры. Попробуйте ещё раз.')

      } finally {
        this.isLoading = false
      }
    }
  },
  beforeUnmount() {
    // Очищаем интервал при разрушении компонента
    if (this.loadingStepsInterval) {
      clearInterval(this.loadingStepsInterval)
    }
  }
}
</script>

<style scoped>
/* === ОСНОВНОЙ КОНТЕЙНЕР === */
.storyforge-form-container {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 30%, #0b0e1e, #03050c);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  font-family: 'Segoe UI', 'Exo 2', 'Roboto', system-ui, sans-serif;
  overflow: hidden;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.glow-orb {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}

.glow-orb-1 {
  background: #00ffff;
  top: -150px;
  right: -100px;
}

.glow-orb-2 {
  background: #b000ff;
  bottom: -150px;
  left: -100px;
}

/* === ОВЕРЛЕЙ ЗАГРУЗКИ === */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 12, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  max-width: 500px;
  width: 100%;
}

/* Спиннер */
.spinner-container {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spin 1.5s linear infinite;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border-top-color: #00ffff;
  border-right-color: #00ffff;
}

.spinner-ring-2 {
  width: 80%;
  height: 80%;
  border-bottom-color: #b000ff;
  border-left-color: #b000ff;
  animation-duration: 2s;
  animation-direction: reverse;
}

.spinner-ring-3 {
  width: 60%;
  height: 60%;
  border-top-color: #00ffaa;
  border-right-color: #00ffaa;
  animation-duration: 1s;
}

.spinner-core {
  width: 40%;
  height: 40%;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.core-icon {
  font-size: 28px;
  color: #00ffff;
  animation: pulse-core 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-core {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Текст загрузки */
.loading-text {
  text-align: center;
}

.loading-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 6px;
  color: #fff;
  margin: 0 0 8px 0;
  text-shadow: 0 0 20px #00aaff80;
}

.loading-subtitle {
  color: #8ab3ff;
  font-size: 16px;
  letter-spacing: 2px;
  margin: 0;
  opacity: 0.8;
}

/* Прогресс-бар */
.progress-container {
  width: 100%;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #b000ff, #00ffaa);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: progress-move 2s linear infinite;
  width: 100%;
}

@keyframes progress-move {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

/* Шаги */
.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 350px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.4s ease;
  opacity: 0.4;
}

.step-active {
  opacity: 1;
  border-color: rgba(0, 255, 255, 0.4);
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
}

.step-done {
  opacity: 0.6;
  border-color: rgba(0, 255, 170, 0.4);
  background: rgba(0, 255, 170, 0.05);
}

.step-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.step-done .step-icon {
  color: #00ffaa;
}

.step-text {
  color: #b0e0ff;
  font-size: 14px;
  letter-spacing: 1px;
}

.step-active .step-text {
  color: #e0f0ff;
}

/* Карточка формы */
.form-card {
  position: relative;
  z-index: 2;
  max-width: 680px;
  width: 100%;
  background: rgba(5, 10, 20, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 255, 255, 0.25);
  border-radius: 32px;
  padding: 32px 36px;
  box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(0, 255, 255, 0.1) inset,
      0 0 30px rgba(0, 180, 255, 0.2);
  transition: box-shadow 0.3s;
}

.form-card:hover {
  box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(0, 255, 255, 0.3) inset,
      0 0 40px rgba(0, 200, 255, 0.3);
}

/* Заголовок */
.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.title-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-accent {
  color: #00ffff;
  font-size: 28px;
  font-weight: 300;
  text-shadow: 0 0 10px #00ffffaa;
}

.form-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 6px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #ffffff 0%, #a0f0ff 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  text-shadow: 0 0 15px #00aaff80;
}

.subtitle {
  color: #8ab3ff;
  font-size: 14px;
  letter-spacing: 3px;
  margin-top: 8px;
  opacity: 0.9;
  text-transform: uppercase;
  border-bottom: 1px dashed #2f6f9f;
  padding-bottom: 12px;
}

/* Форма */
.adventure-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #b0e0ff;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.label-icon {
  font-size: 20px;
  color: #00ffff;
  filter: drop-shadow(0 0 6px cyan);
}

.input-field {
  background: rgba(0, 20, 40, 0.6);
  border: 1.5px solid #1e4f6b;
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 18px;
  color: #e2f0ff;
  font-weight: 500;
  outline: none;
  transition: all 0.25s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) inset;
  backdrop-filter: blur(4px);
  letter-spacing: 0.5px;
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-field::placeholder {
  color: #5e7e9f;
  font-weight: 300;
  font-style: italic;
}

.input-field:focus {
  border-color: #00ffff;
  box-shadow: 0 0 18px #00aaff55, 0 4px 8px rgba(0,0,0,0.5) inset;
  background: rgba(0, 30, 60, 0.7);
}

.input-filled {
  border-color: #3fa2d0;
  background: rgba(10, 35, 55, 0.7);
}

.input-hint {
  font-size: 12px;
  color: #6d93b5;
  margin-top: 6px;
  letter-spacing: 0.8px;
  padding-left: 8px;
}

/* Блок с количеством игроков */
.players-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0, 15, 30, 0.5);
  border-radius: 20px;
  padding: 18px 16px;
  border: 1px solid #1f5170;
}

.slider-wrapper {
  position: relative;
  padding: 8px 0;
}

.player-slider {
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #0a2a44, #1f7ca5);
  border-radius: 10px;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.player-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.player-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #e0f0ff;
  border: 3px solid #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 20px #00ffff, 0 0 5px #000;
  cursor: pointer;
  transition: 0.1s;
}

.player-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #e0f0ff;
  border: 3px solid #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 20px #00ffff;
  cursor: pointer;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: -4px;
}

.tick {
  color: #3a6580;
  font-weight: bold;
  font-size: 16px;
  transition: 0.2s;
}

.active-tick {
  color: #00ffff;
  text-shadow: 0 0 6px cyan;
}

.player-count-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  background: #02121e;
  padding: 10px 18px;
  border-radius: 40px;
  border: 1px solid #2a6a8a;
  width: fit-content;
  margin: 0 auto;
}

.count-number {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(to right, #fff, #b0f0ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.count-label {
  font-size: 18px;
  color: #9bc7f0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.player-presets {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 4px;
}

.preset-btn {
  background: transparent;
  border: 1.5px solid #1e4f6b;
  color: #aac8e8;
  font-size: 18px;
  font-weight: bold;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px #00000040;
}

.preset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.preset-btn:hover:not(:disabled) {
  border-color: #00c8ff;
  color: #e0f3ff;
  background: #0a2940;
}

.preset-active {
  background: #00a6ff22;
  border-color: #00ffff;
  color: white;
  box-shadow: 0 0 15px #00aaff;
}

/* Блок LIVE статуса */
.live-status {
  background: #04131fcc;
  border-left: 6px solid #00ffff;
  border-radius: 14px;
  padding: 18px 20px;
  backdrop-filter: blur(8px);
  margin-top: 8px;
  box-shadow: 0 0 20px #00000060 inset;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7fc9ff;
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 14px;
  margin-bottom: 8px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #00ffaa;
  border-radius: 50%;
  box-shadow: 0 0 15px #00ffaa;
  animation: pulse-green 1.8s infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.status-message {
  color: #c2dcff;
  font-size: 15px;
  line-height: 1.5;
  font-style: italic;
  text-shadow: 0 1px 3px black;
}

/* Кнопка отправки */
.submit-btn {
  position: relative;
  background: linear-gradient(145deg, #002a4a, #001a2e);
  border: 1.5px solid #00b8ff;
  border-radius: 60px;
  padding: 18px 28px;
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-shadow: 0 10px 20px #00000060, 0 0 20px #0077ff33;
  transition: 0.2s;
  overflow: hidden;
  margin-top: 16px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #003b66, #002844);
  border-color: #00ffff;
  box-shadow: 0 10px 25px #00000080, 0 0 30px #00aaff;
  transform: scale(1.01);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.submit-btn.btn-loading {
  background: linear-gradient(145deg, #003b66, #002844);
  border-color: #00ffff;
}

.btn-text {
  z-index: 1;
}

.btn-icon {
  font-size: 28px;
  z-index: 1;
}

/* Маленькая крутилка в кнопке */
.btn-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #00ffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #00ffff40, transparent 70%);
  opacity: 0.6;
  pointer-events: none;
}

/* Футер формы */
.form-footer {
  margin-top: 30px;
  text-align: center;
}

.footer-features {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 12px;
  color: #6396c0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.separator {
  color: #00b8ff;
  font-size: 16px;
}

.footer-copyright {
  color: #2e6188;
  font-size: 13px;
  letter-spacing: 2px;
  border-top: 1px dashed #1a4868;
  padding-top: 16px;
}

/* Адаптив */
@media (max-width: 560px) {
  .form-card {
    padding: 24px 18px;
  }
  .form-title {
    font-size: 24px;
    letter-spacing: 3px;
  }
  .submit-btn {
    font-size: 16px;
    padding: 14px 18px;
  }

  .loading-title {
    font-size: 22px;
  }

  .spinner-container {
    width: 100px;
    height: 100px;
  }
}
</style>