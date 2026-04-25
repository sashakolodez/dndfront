<template>
  <div class="storyforge-main">
    <!-- Декоративный космический фон -->
    <div class="cosmic-bg">
      <div class="grid-overlay"></div>
      <div class="glow-orb"></div>
      <div class="glow-orb second"></div>
    </div>

    <div class="content">
      <!-- Шапка с навигацией -->
      <header class="header">
        <div class="logo-area">
          <div id="logImg" class="brand-icon">
          </div>
          <span class="brand-text">MAUPORIA</span>
        </div>
        <div class="nav-links">
          <span><i class="fas fa-globe"></i> Миры</span>
          <span><i class="fas fa-robot"></i> Нейромастер</span>
          <span><i class="fas fa-scroll"></i> Сюжеты</span>
          <span><i class="fas fa-users"></i> Гильдия</span>
        </div>
        <div class="auth-buttons">
          <button class="btn-outline"><i class="far fa-user-circle"></i> Вход</button>
          <router-link to='/registration' id="router" class="btn-primary">✨ Начать</router-link>
        </div>
      </header>

      <!-- Главный экран: призыв и карточки -->
      <div class="hero-section">
        <div class="hero-left">
          <div class="hero-badge">
            <i class="fas fa-bolt" style="margin-right: 8px"></i> НЕЙРОСЕТИ + ТВОЯ ФАНТАЗИЯ
          </div>
          <h1>
            <span class="gradient-text">ПОКОРЯЙ МИРЫ</span><br />
            С НЕЙРОСЕТЯМИ<br />
            В MAUPORIA
          </h1>
          <div class="description">
            Создавайте уникальные приключения с виртуальным мастером, который понимает вас, гибко реагирует на любые
            действия, генерирует уникальные сюжеты и помогает даже новичкам наслаждаться миром приключений.
          </div>
          <div class="cta-group">
            <button @click="newGame()" id='router' class="btn-primary btn-huge">
              <i class="fas fa-meteor" style="margin-right: 12px" ></i>начать приключения
            </button>
            <span class="demo-link" @click="playDemo">
              <i class="fas fa-play-circle"></i> Демо-приключение
            </span>
          </div>
        </div>

        <!-- Карточки с мирами (прикольные картинки через иконки) -->
        <div class="hero-right">
          <div class="world-card" v-for="world in worlds" :key="world.id">
            <div class="card-icon">
              <i :class="world.icon"></i>
            </div>
            <h3>{{ world.title }}</h3>
            <p>{{ world.desc }}</p>
            <div style="margin-top: 12px; display: flex; gap: 5px">
              <i class="fas fa-brain" style="color: #b794ff"></i>
              <i class="fas fa-dragon" style="color: #ffb86b"></i>
              <i class="fas fa-map" style="color: #6dc3ff"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Полоска с фичами -->
      <div class="feature-strip">
        <div class="feature-item">
          <i class="fas fa-microchip"></i>
          <span>Нейромастер понимает контекст</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-dice"></i>
          <span>Генерация сюжетов в реальном времени</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-child"></i>
          <span>Идеально для новичков</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-infinity"></i>
          <span>Бесконечные варианты</span>
        </div>
      </div>

      <!-- Блок "Виртуальный мастер" с динамическим сообщением -->
      <div class="story-showcase">
        <div class="live-tag">
          <span class="pulse"></span>
          <span style="font-weight: 600; letter-spacing: 1px">ВИРТУАЛЬНЫЙ МАСТЕР ОНЛАЙН</span>
        </div>
        <p>
          <i class="fas fa-hat-wizard"></i>
          {{ activeStoryMessage }}
        </p>
        <button class="btn-small" @click="refreshStory">
          <i class="fas fa-sync-alt"></i> Сгенерировать новую идею
        </button>
      </div>

      <!-- Футер -->
      <div class="footer-note">
        <i class="far fa-star"></i> Гибкая реакция на любые действия · Уникальные миры каждый раз · Присоединяйся к
        тысячам игроков <i class="far fa-star"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StoryforgeMain",
  data() {
    return {
      worlds: [
        {
          id: 1,
          icon: "fas fa-planet-ringed",
          title: "Эхо Андромеды",
          desc: "Космическая опера, где нейросеть создаёт инопланетные расы и дипломатию на лету.",
        },
        {
          id: 2,
          icon: "fas fa-tree",
          title: "Древний Лес",
          desc: "Фэнтези с живыми богами и магией, отзывающейся на твои решения.",
        },
        {
          id: 3,
          icon: "fas fa-city",
          title: "Кибер-Нексус",
          desc: "Киберпанк с искинами, заговорами корпораций. Мастер ведёт двойную игру.",
        },
        {
          id: 4,
          icon: "fas fa-skull",
          title: "Проклятые Земли",
          desc: "Тёмное фэнтези с уникальной системой проклятий и нейросетевыми квестами.",
        },
      ],
      storyIdeas: [
        "Только что: игрок обнаружил древний портал в пещере, нейромастер создаёт карту подземного города...",
        "Сейчас: экипаж звездолёта столкнулся с неизвестной аномалией. ИИ предлагает три пути спасения.",
        "Нейромастер генерирует: в лесу пробудился забытый дух. Он реагирует на каждое слово игрока.",
        "Приключение: детектив в стиле нуар, где подозреваемые меняют показания благодаря нейросети.",
      ],
      activeStoryMessage: "",
      storyInterval: null,
    };
  },
  methods: {
    newGame() {
      // if (blablabla) {
      //   this.$router.push('/registration')
      // }

      this.$router.push('/form')
    },

    refreshStory() {
      const randomIndex = Math.floor(Math.random() * this.storyIdeas.length);
      this.activeStoryMessage = this.storyIdeas[randomIndex];
    },
    playDemo() {
      alert("🧙 Демо-приключение запущено! Виртуальный мастер приветствует тебя. (Это демонстрация)");
    },
  },
  mounted() {
    // Устанавливаем начальное сообщение
    this.refreshStory();
    // Автоматическое обновление каждые 7 секунд
    this.storyInterval = setInterval(() => {
      this.refreshStory();
    }, 7000);
  },
  beforeUnmount() {
    if (this.storyInterval) {
      clearInterval(this.storyInterval);
    }
  },
};
</script>

<style scoped>
/* Полная копия стилей из предыдущего ответа — всё в одном компоненте */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#router {
  text-decoration: none
}
#logImg {
  background-image: url("../assets/img/logo.png");
  background-size: contain;
}

.storyforge-main {
  font-family: "Plus Jakarta Sans", sans-serif;
  background: radial-gradient(circle at 20% 30%, #0b0e1e, #03050b);
  min-height: 100vh;
  color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.cosmic-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.grid-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(98, 0, 255, 0.08) 1px, transparent 1px),
  linear-gradient(90deg, rgba(98, 0, 255, 0.08) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 90%);
}

.glow-orb {
  position: absolute;
  width: 70vw;
  height: 70vw;
  background: radial-gradient(circle, rgba(130, 60, 255, 0.25) 0%, transparent 70%);
  top: 10%;
  left: 15%;
  filter: blur(90px);
  animation: floatOrb 18s infinite alternate ease-in-out;
}

.glow-orb.second {
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(0, 180, 255, 0.2) 0%, transparent 70%);
  top: 50%;
  left: 60%;
  filter: blur(100px);
  animation: floatOrb 22s infinite alternate-reverse;
}

@keyframes floatOrb {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(5%, 8%) scale(1.2);
  }
}

.content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 5% 3rem;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0 2rem;
  flex-wrap: wrap;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(145deg, #a55cff, #4a2cd6);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.8);
  transform: rotate(5deg);
  transition: transform 0.2s;
}

.brand-icon i {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.brand-text {
  font-family: "Raleway", sans-serif;
  font-weight: 900;
  font-size: 2.2rem;
  letter-spacing: -0.02em;
  background: linear-gradient(to right, #ffffff, #d9c9ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px #7e4aff;
}

.nav-links {
  display: flex;
  gap: 2.2rem;
  font-weight: 500;
  color: #cdd0e6;
}

.nav-links span {
  cursor: default;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-links span i {
  color: #b084ff;
  font-size: 0.9rem;
}

.nav-links span:hover {
  color: white;
  text-shadow: 0 0 8px #b27aff;
}

.auth-buttons {
  display: flex;
  gap: 15px;
}

.btn-outline {
  background: transparent;
  border: 1.5px solid rgba(180, 130, 255, 0.6);
  color: white;
  padding: 10px 22px;
  border-radius: 40px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  transition: 0.25s;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-outline:hover {
  background: rgba(180, 130, 255, 0.15);
  border-color: #c69cff;
  box-shadow: 0 0 18px #8a5cff66;
}

.btn-primary {
  background: linear-gradient(135deg, #7f3fff, #501fc0);
  border: none;
  color: white;
  padding: 10px 26px;
  border-radius: 40px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(99, 26, 230, 0.5);
  cursor: pointer;
  transition: 0.25s;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #9462ff, #642bd8);
  box-shadow: 0 8px 28px #8f5eff;
  transform: scale(1.02);
}

.hero-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0 3rem;
  gap: 30px;
}

.hero-left {
  flex: 1.1 1 350px;
}

.hero-badge {
  display: inline-block;
  background: rgba(100, 50, 220, 0.25);
  backdrop-filter: blur(10px);
  padding: 8px 18px;
  border-radius: 40px;
  border: 1px solid rgba(200, 160, 255, 0.4);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 25px;
  color: #e4d5ff;
}

h1 {
  font-family: "Raleway", sans-serif;
  font-weight: 900;
  font-size: 4.2rem;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff, #c3adff, #a781ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline;
}

.description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #c6c1e0;
  margin-bottom: 2.2rem;
  max-width: 550px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.cta-group {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-huge {
  padding: 16px 38px;
  font-size: 1.2rem;
  border-radius: 60px;
  font-weight: 700;
}

.demo-link {
  color: #cfc1ff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  cursor: pointer;
}

.demo-link i {
  font-size: 1.1rem;
}

.demo-link:hover {
  color: white;
  text-shadow: 0 0 10px #b595ff;
}

.hero-right {
  flex: 1 1 380px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.world-card {
  background: rgba(20, 18, 40, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 1.5rem 1.2rem;
  border: 1px solid rgba(190, 150, 255, 0.25);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
  transition: all 0.25s;
  cursor: default;
}

.world-card:hover {
  border-color: #a37eff;
  transform: translateY(-6px);
  box-shadow: 0 25px 35px -8px #3a1e9e;
  background: rgba(35, 25, 70, 0.6);
}

.card-icon {
  font-size: 2.8rem;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px #aa7dff);
}

.world-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(to right, #fff, #e2d1ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.world-card p {
  color: #b7b0d9;
  font-size: 0.9rem;
  line-height: 1.4;
}

.feature-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 50px 0 30px;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 12, 30, 0.5);
  backdrop-filter: blur(5px);
  padding: 12px 24px;
  border-radius: 60px;
  border: 1px solid #352a60;
}

.feature-item i {
  color: #b78aff;
  font-size: 1.5rem;
}

.feature-item span {
  font-weight: 500;
  color: #dfd7ff;
}

.story-showcase {
  display: flex;
  align-items: center;
  background: rgba(20, 10, 45, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 48px;
  padding: 1.5rem 2.5rem;
  margin-top: 30px;
  border: 1px solid #4a2d9e;
  flex-wrap: wrap;
  gap: 30px;
}

.live-tag {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pulse {
  width: 14px;
  height: 14px;
  background: #3eff9e;
  border-radius: 50%;
  box-shadow: 0 0 18px #00ffa2;
  animation: pulse-green 1.8s infinite;
}

@keyframes pulse-green {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.story-showcase p {
  font-size: 1.2rem;
  font-weight: 500;
  color: #efebff;
}

.story-showcase i {
  margin-right: 8px;
  color: #bda0ff;
}

.btn-small {
  background: #2b1a5e;
  border: 1px solid #8f7ac0;
  padding: 10px 24px;
  border-radius: 40px;
  color: white;
  font-weight: 600;
  margin-left: auto;
  cursor: pointer;
  transition: 0.2s;
}

.btn-small:hover {
  background: #402d7a;
  border-color: #c2aaff;
}

.footer-note {
  margin-top: 50px;
  text-align: center;
  color: #7f77a8;
  font-size: 0.9rem;
}

@media (max-width: 800px) {
  h1 {
    font-size: 3rem;
  }
  .header {
    flex-direction: column;
    align-items: start;
    gap: 15px;
  }
  .nav-links {
    flex-wrap: wrap;
    gap: 20px;
  }
  .hero-right {
    grid-template-columns: 1fr;
  }
}
</style>