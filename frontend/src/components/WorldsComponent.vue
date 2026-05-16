<template>
  <div class="worlds-page">
    <!-- Фон -->
    <div class="bg-gradient"></div>
    <div class="bg-grid"></div>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>

    <!-- Верхняя панель -->
    <header class="page-header">
      <div class="logo" @click="goHome">
        <span class="logo-icon">◈</span>
        <span class="logo-text">MAUPORIA</span>
      </div>
      <div class="header-actions">
        <div class="limit-selector">
          <span class="limit-label">На странице:</span>
          <div class="limit-options">
            <button
                v-for="l in [5, 10, 20, 50]"
                :key="l"
                class="limit-btn"
                :class="{ 'limit-active': limit === l }"
                @click="changeLimit(l)"
            >{{ l }}</button>
          </div>
        </div>
        <button class="refresh-btn" @click="loadWorlds" :disabled="isLoading">
          <span class="refresh-icon">🔄</span>
          <span class="refresh-text">Обновить</span>
        </button>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="worlds-content">
      <!-- Заголовок -->
      <div class="worlds-header">
        <h1 class="worlds-title">Созданные миры</h1>
        <div class="worlds-subtitle" v-if="!isLoading">
          Найдено миров: <span class="highlight">{{ total }}</span>
        </div>
      </div>

      <!-- Загрузка -->
      <div class="loading-container" v-if="isLoading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring spinner-ring-2"></div>
          <div class="spinner-ring spinner-ring-3"></div>
        </div>
        <div class="loading-text">Поиск миров...</div>
      </div>

      <!-- Список миров -->
      <div class="worlds-grid" v-if="!isLoading && worlds.length > 0">
        <div
            v-for="(world, index) in worlds"
            :key="world.id"
            class="world-card"
            :style="{ animationDelay: index * 0.1 + 's' }"
            @click="goToGame(world.id)"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="card-icon">🌍</div>
              <div class="card-title-group">
                <h2 class="card-title">{{ world.name }}</h2>
                <span class="card-id">ID: {{ world.id?.slice(0, 8) }}...</span>
              </div>
              <div class="card-arrow">➤</div>
            </div>

            <div class="card-divider"></div>

            <div class="card-context">
              <p>{{ truncateText(world.context, 150) }}</p>
            </div>

            <div class="card-divider"></div>

            <div class="card-goal">
              <span class="goal-icon">🎯</span>
              <p>{{ truncateText(world.goal, 120) }}</p>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-value">{{ world.countGamer }}</span>
                <span class="stat-label">игроков</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🆔</span>
                <span class="stat-value">{{ world.gamerIds?.length || 0 }}</span>
                <span class="stat-label">персонажей</span>
              </div>
            </div>
          </div>
          <div class="card-hover-text">Нажмите, чтобы войти в мир</div>
        </div>
      </div>

      <!-- Пусто -->
      <div class="empty-state" v-if="!isLoading && worlds.length === 0">
        <div class="empty-icon">🏜️</div>
        <h2 class="empty-title">Миры не найдены</h2>
        <p class="empty-text">Создайте новый мир, чтобы он появился здесь</p>
        <button class="empty-btn" @click="loadWorlds">
          <span>Обновить</span>
          <span>🔄</span>
        </button>
      </div>

      <!-- Пагинация -->
      <div class="pagination" v-if="!isLoading && total > limit">
        <button
            class="page-btn"
            :disabled="page === 1"
            @click="changePage(page - 1)"
        >
          ← Назад
        </button>

        <div class="page-info">
          <span v-for="p in totalPages" :key="p">
            <button
                class="page-num-btn"
                :class="{ 'page-active': p === page }"
                @click="changePage(p)"
            >{{ p }}</button>
            <span v-if="p < totalPages && p < page + 3 && p > page - 3" class="page-separator">·</span>
          </span>
        </div>

        <button
            class="page-btn"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
        >
          Вперёд →
        </button>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'WorldsPage',
  data() {
    return {
      worlds: [],
      total: 0,
      page: 1,
      limit: 10,
      isLoading: false
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.limit);
    }
  },
  async mounted() {
    await this.loadWorlds();
  },
  methods: {
    async loadWorlds() {
      this.isLoading = true;
      try {
        await this.$store.dispatch('world', {
          page: this.page,
          limit: this.limit
        });

        const data = this.$store.getters.WORLD;
        console.log(data.worlds)
        if (data) {
          this.total = data.total || 0;
          this.worlds = data.worlds || [];
        }
      } catch (err) {
        console.error('Ошибка загрузки миров:', err);
        this.worlds = [];
        this.total = 0;
      } finally {
        this.isLoading = false;
      }
    },

    changeLimit(newLimit) {
      this.limit = newLimit;
      this.page = 1;
      this.loadWorlds();
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.totalPages) return;
      this.page = newPage;
      this.loadWorlds();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async goToGame(id) {
      await this.$store.dispatch('searchGame', id)
      this.$router.push(`/${id}/game`);
    },

    goHome() {
      this.$router.push('/');
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
  }
};
</script>

<style scoped>
/* === ОСНОВНОЕ === */
.worlds-page {
  min-height: 100vh;
  background: #0B0E17;
  font-family: 'Segoe UI', 'Inter', system-ui, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.bg-gradient {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at top, #1A1A3E 0%, #0B0E17 60%);
  pointer-events: none;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
      linear-gradient(rgba(100, 120, 200, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100, 120, 200, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.bg-orb {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(200px);
  opacity: 0.06;
  pointer-events: none;
}

.bg-orb-1 { background: #5B6E9A; top: -300px; right: -200px; }
.bg-orb-2 { background: #7B6FB0; bottom: -300px; left: -200px; }

/* === ВЕРХНЯЯ ПАНЕЛЬ === */
.page-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(11, 14, 23, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(91, 110, 154, 0.3);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover { opacity: 0.8; }

.logo-icon {
  font-size: 24px;
  color: #7B6FB0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #E8EEFF, #A0B0D0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.limit-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.limit-label {
  color: #7080A0;
  font-size: 13px;
}

.limit-options {
  display: flex;
  gap: 4px;
}

.limit-btn {
  padding: 6px 14px;
  background: rgba(30, 40, 60, 0.5);
  border: 1px solid #3A4A6A;
  border-radius: 20px;
  color: #8090B0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.limit-btn:hover {
  background: rgba(60, 70, 100, 0.5);
  border-color: #5B6E9A;
  color: #A0B8D8;
}

.limit-btn.limit-active {
  background: rgba(91, 110, 154, 0.3);
  border-color: #7B6FB0;
  color: #C8D8F0;
  box-shadow: 0 0 15px rgba(123, 111, 176, 0.2);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(145deg, #2A3A5A, #1A2845);
  border: 1px solid #4A5A8A;
  border-radius: 24px;
  color: #A0B0D0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #3A4A6A, #2A3A5A);
  border-color: #7B6FB0;
  color: #C8D8F0;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 16px;
  transition: transform 0.3s;
}

.refresh-btn:hover:not(:disabled) .refresh-icon {
  transform: rotate(180deg);
}

/* === КОНТЕНТ === */
.worlds-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.worlds-header {
  text-align: center;
  margin-bottom: 40px;
}

.worlds-title {
  font-size: 36px;
  font-weight: 800;
  color: #E8EEFF;
  letter-spacing: 2px;
  margin: 0 0 8px;
  text-shadow: 0 0 40px rgba(123, 111, 176, 0.3);
}

.worlds-subtitle {
  font-size: 15px;
  color: #7080A0;
}

.highlight {
  color: #C8B060;
  font-weight: 700;
  font-size: 18px;
}

/* === ЗАГРУЗКА === */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 24px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.spinner-ring {
  border-top-color: #7B6FB0;
  animation: spin 1.2s linear infinite;
}

.spinner-ring-2 {
  inset: 8px;
  border-right-color: #5B6E9A;
  animation: spin 1.8s linear infinite reverse;
}

.spinner-ring-3 {
  inset: 16px;
  border-bottom-color: #C8B060;
  animation: spin 2.4s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #8090B0;
  letter-spacing: 1px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* === СЕТКА МИРОВ === */
.worlds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.world-card {
  position: relative;
  background: linear-gradient(160deg, #121A28, #0A0F18);
  border: 1px solid #2A3550;
  border-radius: 20px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: cardAppear 0.6s ease forwards;
  opacity: 0;
  overflow: hidden;
}

@keyframes cardAppear {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.world-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(123, 111, 176, 0.08), transparent 50%);
  pointer-events: none;
  transition: opacity 0.3s;
}

.world-card:hover {
  transform: translateY(-4px);
  border-color: #7B6FB0;
  box-shadow:
      0 0 40px rgba(123, 111, 176, 0.15),
      0 10px 30px rgba(0, 0, 0, 0.4);
}

.world-card:hover::before {
  opacity: 1.5;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(200, 176, 96, 0.05), transparent 40%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s;
}

.world-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(123, 111, 176, 0.15);
  border: 1px solid rgba(123, 111, 176, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title-group {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #E8EEFF;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-id {
  font-size: 11px;
  color: #506080;
  letter-spacing: 0.5px;
}

.card-arrow {
  font-size: 20px;
  color: #5A6A8A;
  flex-shrink: 0;
  margin-top: 8px;
  transition: all 0.3s;
}

.world-card:hover .card-arrow {
  color: #C8B060;
  transform: translateX(4px);
}

.card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(91, 110, 154, 0.3), transparent);
  margin: 14px 0;
}

.card-context p {
  font-size: 13px;
  color: #8090B0;
  line-height: 1.6;
  margin: 0;
}

.card-goal {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.goal-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.card-goal p {
  font-size: 13px;
  color: #C8B060;
  line-height: 1.6;
  margin: 0;
}

.card-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(42, 53, 80, 0.5);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #C8D8F0;
}

.stat-label {
  font-size: 11px;
  color: #607090;
}

.card-hover-text {
  position: absolute;
  bottom: 12px;
  right: 20px;
  font-size: 11px;
  color: #C8B060;
  letter-spacing: 1px;
  opacity: 0;
  transition: opacity 0.3s;
}

.world-card:hover .card-hover-text {
  opacity: 1;
}

/* === ПУСТО === */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #8090B0;
  margin: 0 0 8px;
}

.empty-text {
  font-size: 15px;
  color: #506080;
  margin: 0 0 24px;
}

.empty-btn {
  padding: 12px 32px;
  background: linear-gradient(145deg, #2A3A5A, #1A2845);
  border: 1px solid #4A5A8A;
  border-radius: 24px;
  color: #A0B0D0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.empty-btn:hover {
  background: linear-gradient(145deg, #3A4A6A, #2A3A5A);
  border-color: #7B6FB0;
  color: #C8D8F0;
}

/* === ПАГИНАЦИЯ === */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(42, 53, 80, 0.3);
}

.page-btn {
  padding: 10px 24px;
  background: rgba(30, 40, 60, 0.5);
  border: 1px solid #3A4A6A;
  border-radius: 20px;
  color: #8090B0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(60, 70, 100, 0.5);
  border-color: #7B6FB0;
  color: #C8D8F0;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 2px;
}

.page-num-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(30, 40, 60, 0.3);
  border: 1px solid transparent;
  color: #7080A0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-num-btn:hover {
  background: rgba(60, 70, 100, 0.4);
  border-color: #4A5A8A;
  color: #A0B8D8;
}

.page-num-btn.page-active {
  background: rgba(91, 110, 154, 0.3);
  border-color: #7B6FB0;
  color: #C8D8F0;
  box-shadow: 0 0 15px rgba(123, 111, 176, 0.2);
}

.page-separator {
  color: #3A4A6A;
  margin: 0 4px;
}

/* === АДАПТИВНОСТЬ === */
@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .logo-text {
    font-size: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .worlds-title {
    font-size: 28px;
  }

  .worlds-grid {
    grid-template-columns: 1fr;
  }

  .world-card {
    padding: 20px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .worlds-content {
    padding: 20px 12px 60px;
  }

  .card-title {
    font-size: 17px;
  }

  .limit-label {
    display: none;
  }
}
</style>