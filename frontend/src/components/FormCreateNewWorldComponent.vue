<template>
  <div class="storyforge-form-container">
    <!-- Декоративный фон с сеткой и свечением (в стиле STORYFORGE) -->
    <div class="grid-overlay"></div>
    <div class="glow-orb glow-orb-1"></div>
    <div class="glow-orb glow-orb-2"></div>

    <!-- Карточка формы -->
    <div class="form-card">
      <!-- Заголовок в стиле киберпанк/космооперы -->
      <div class="form-header">
        <div class="title-line">
          <span class="title-accent">//</span>
          <h2 class="form-title">НОВОЕ ПРИКЛЮЧЕНИЕ</h2>
          <span class="title-accent">//</span>
        </div>
        <div class="subtitle">ВИРТУАЛЬНЫЙ МАСТЕР · ГЕНЕРАЦИЯ СЮЖЕТА</div>
      </div>

      <!-- Сама форма -->
      <form @submit.prevent="handleSubmit" class="adventure-form">
        <!-- Поле: Название приключения -->
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
          />
          <div class="input-hint">Выберите имя, достойное легенд</div>
        </div>

        <!-- Поле: Количество игроков (слайдер + число) -->
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

          <!-- Быстрые пресеты -->
          <div class="player-presets">
            <button
                type="button"
                v-for="preset in [1, 3, 5, 10]"
                :key="preset"
                @click="form.playerCount = preset"
                class="preset-btn"
                :class="{ 'preset-active': form.playerCount === preset }"
            >
              {{ preset }}
            </button>
          </div>
          <div class="input-hint">От 1 до 10 · можно изменить в любой момент</div>
        </div>

        <!-- Динамический блок с текущим статусом (как в "Виртуальный мастер онлайн") -->
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
        <button type="submit" class="submit-btn">
          <span class="btn-text">НАЧАТЬ ИССЛЕДОВАНИЕ</span>
          <span class="btn-icon">→</span>
          <div class="btn-glow"></div>
        </button>
      </form>

      <!-- Декоративная подпись (как в макете) -->
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
        playerCount: 3  // значение по умолчанию
      }
    }
  },
  computed: {
    // Склонение слова "игрок" / "игрока" / "игроков"
    playerWord() {
      const count = this.form.playerCount;
      if (count % 10 === 1 && count % 100 !== 11) return 'игрок';
      if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'игрока';
      return 'игроков';
    }
  },
  methods: {
    handleSubmit() {
      // Здесь можно эмитить событие или отправлять данные
      if (!this.form.adventureName.trim()) {
        alert('Введите название приключения, капитан.');
        return;
      }

      console.log('🎮 Старт приключения:', {
        name: this.form.adventureName,
        players: this.form.playerCount
      });

      // Для демонстрации — показываем уведомление в стиле проекта
      alert(`✨ Виртуальный мастер создаёт мир «${this.form.adventureName}»\n👥 Состав отряда: ${this.form.playerCount} ${this.playerWord}\n🌌 Приготовьтесь к погружению.`);

      // Здесь можно вызвать this.$emit('submit', { ...this.form })
    }
  }
}
</script>

<style scoped>
/* === ОСНОВНОЙ КОНТЕЙНЕР — стиль STORYFORGE (тёмный sci-fi / киберпанк) === */
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

/* Сетка и декоративные элементы (как на скриншоте) */
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

/* Поле ввода */
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

.preset-btn:hover {
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

/* Блок LIVE статуса (ВИРТУАЛЬНЫЙ МАСТЕР) */
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

.submit-btn:hover {
  background: linear-gradient(145deg, #003b66, #002844);
  border-color: #00ffff;
  box-shadow: 0 10px 25px #00000080, 0 0 30px #00aaff;
  transform: scale(1.01);
}

.btn-text {
  z-index: 1;
}

.btn-icon {
  font-size: 28px;
  z-index: 1;
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
}
</style>