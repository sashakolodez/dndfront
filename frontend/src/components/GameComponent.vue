<template>
  <div class="game-container">
    <!-- Фон -->
    <div class="grid-overlay"></div>
    <div class="glow-orb glow-orb-1"></div>
    <div class="glow-orb glow-orb-2"></div>

    <!-- Верхняя панель -->
    <header class="game-header">
      <div class="logo">
        <span class="logo-icon">◈</span>
        <span class="logo-text">MAUPORIA</span>
      </div>
      <div class="master-status">
        <span class="pulse-dot"></span>
        <span class="status-text">МАСТЕР · АКТИВЕН</span>
      </div>
      <button class="leave-btn" @click="leaveGame">
        <span class="leave-text">ВЫЙТИ</span>
        <span class="leave-icon">🚪</span>
      </button>
      <button class="menu-toggle" @click="togglePlayersPanel">
        <span>☰</span>
      </button>
    </header>

    <!-- Основная область -->
    <div class="game-main">
      <!-- Левая панель: игроки -->
      <aside class="players-panel" :class="{ 'panel-open': isPlayersPanelOpen }">
        <div class="panel-header">
          <div class="panel-title">
            <span>👥</span>
            <span>УЧАСТНИКИ</span>
            <span class="player-count">{{ players.length }}</span>
          </div>
          <button class="panel-close" @click="closePlayersPanel">✕</button>
        </div>

        <div class="players-list">
          <div
              v-for="(player, index) in players"
              :key="player.id"
              class="player-item"
              :class="{
                'is-current': player.id === currentPlayerId,
                'is-initialized': player.name
              }"
              @click="selectPlayer(player.id)"
          >
            <div class="player-avatar" :style="{ background: player.color || '#666' }">
              {{ player.avatar || '?' }}
            </div>
            <div class="player-info">
              <div class="player-name">{{ player.name || 'Игрок ' + (index + 1) }}</div>
              <div class="player-role">
                {{ player.name ? (player.character || 'Без класса') : 'Не создан' }}
              </div>
            </div>
            <div class="player-indicator" v-if="player.id === currentPlayerId">▼</div>
          </div>
        </div>

        <!-- Инвентарь выбранного игрока -->
        <div class="inventory-panel" v-if="selectedPlayer && selectedPlayer.inventory && selectedPlayer.inventory.length > 0">
          <div class="inventory-title">🎒 Инвентарь {{ selectedPlayer.name }}</div>
          <div class="inventory-list">
            <div v-for="item in selectedPlayer.inventory" :key="item.id" class="inventory-item">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>

        <!-- Статы выбранного игрока -->
        <div class="stats-panel" v-if="selectedPlayer && selectedPlayer.stats && Object.keys(selectedPlayer.stats).length > 0">
          <div class="stats-title">📊 Характеристики</div>
          <div class="stats-list">
            <div class="stat-row">
              <span>💪 Сила</span>
              <span>{{ selectedPlayer.stats.strength || 0 }}</span>
            </div>
            <div class="stat-row">
              <span>🏃 Ловкость</span>
              <span>{{ selectedPlayer.stats.dexterity || 0 }}</span>
            </div>
            <div class="stat-row">
              <span>❤️ Телосложение</span>
              <span>{{ selectedPlayer.stats.constitution || 0 }}</span>
            </div>
            <div class="stat-row">
              <span>🧠 Интеллект</span>
              <span>{{ selectedPlayer.stats.intelligence || 0 }}</span>
            </div>
            <div class="stat-row">
              <span>🦉 Мудрость</span>
              <span>{{ selectedPlayer.stats.wisdom || 0 }}</span>
            </div>
            <div class="stat-row">
              <span>👄 Харизма</span>
              <span>{{ selectedPlayer.stats.charisma || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="current-player-info">
          <div class="info-label">Вы пишете как:</div>
          <div class="current-player">
            <span class="player-color-dot" :style="{ background: currentPlayer.color || '#666' }"></span>
            <span>{{ currentPlayer.name || currentPlayer.id || 'Не выбран' }}</span>
          </div>
        </div>
      </aside>

      <div class="panel-overlay" v-if="isPlayersPanelOpen" @click="closePlayersPanel"></div>

      <!-- Чат -->
      <main class="chat-panel">
        <div class="chat-container">
          <div class="chat-messages" ref="chatContainer">
            <!-- Сеттинг -->
            <div class="setting-block">
              <div class="setting-header">
                <span>🌠</span>
                <h2>СЕТТИНГ · {{ worldName }}</h2>
                <span>🌠</span>
              </div>
              <p class="setting-text">{{ worldSetting }}</p>
            </div>

            <!-- Главная цель -->
            <div class="goal-block">
              <div class="goal-header">
                <span>🎯</span>
                <h3>ГЛАВНАЯ ЦЕЛЬ</h3>
                <span>🎯</span>
              </div>
              <p class="goal-text">{{ mainGoal }}</p>
            </div>

            <!-- Разделитель -->
            <div class="chat-divider" v-if="showDivider">
              <span>⚡ НАЧАЛО ИСТОРИИ ⚡</span>
            </div>

            <!-- Сообщения -->
            <div
                v-for="msg in messages"
                :key="msg.id"
                class="message"
                :class="{
                'message-ai': msg.type === 'ai',
                'message-ai-latest': msg.isLatestAI,
                'message-player': msg.type === 'player',
                'message-system': msg.type === 'system',
                'message-error': msg.type === 'error'
              }"
                :style="msg.type === 'player' ? { borderLeftColor: msg.color } : {}"
            >
              <div class="message-header" v-if="msg.type !== 'system' && msg.type !== 'error'">
                <span class="message-author" :style="{ color: msg.color }">
                  {{ msg.author }}
                </span>
                <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
              </div>
              <div class="message-text" v-html="msg.text"></div>
            </div>

            <!-- Индикатор печати ИИ -->
            <div v-if="isAITyping" class="typing-indicator">
              <span>Виртуальный мастер печатает</span>
              <span class="dots">...</span>
            </div>
          </div>

          <!-- Поле ввода -->
          <div class="chat-input-area">
            <div class="input-actions">
              <button class="action-btn" @click="insertDiceRoll(20)" title="Бросить d20">
                <span class="action-icon">🎲</span>
                <span class="action-text">d20</span>
              </button>
              <button class="action-btn" @click="insertDiceRoll(6)" title="Бросить d6">
                <span class="action-icon">🎲</span>
                <span class="action-text">d6</span>
              </button>
              <button class="action-btn" @click="insertEmoji('🎯')" title="Добавить эмодзи">
                <span class="action-icon">😊</span>
                <span class="action-text">Эмодзи</span>
              </button>
            </div>

            <div class="input-container">
              <div class="input-wrapper" :class="{ 'input-focused': isInputFocused }">
                <div class="input-player-badge" :style="{ background: currentPlayer.color || '#666' }">
                  {{ currentPlayer.avatar || '?' }}
                </div>

                <input
                    ref="messageInput"
                    v-model="newMessage"
                    type="text"
                    :placeholder="inputPlaceholder"
                    @keyup.enter="sendMessage"
                    @focus="isInputFocused = true"
                    @blur="isInputFocused = false"
                    class="message-input"
                />

                <div v-if="newMessage.length > 0" class="char-counter" :class="{ 'char-limit': isInitPhase && newMessage.length >= 25 }">
                  {{ newMessage.length }}
                </div>

                <button
                    v-if="newMessage.length > 0"
                    class="clear-btn"
                    @click="newMessage = ''"
                    title="Очистить"
                >
                  ✕
                </button>
              </div>

              <button
                  @click="sendMessage"
                  class="send-btn"
                  :class="{ 'has-message': isInitPhase ? newMessage.trim().length >= 25 : newMessage.trim().length > 0 }"
                  :disabled="(isInitPhase && newMessage.trim().length < 25) || (!isInitPhase && !newMessage.trim()) || isAITyping"
              >
                <span class="send-text">ОТПРАВИТЬ</span>
                <span class="send-icon">➤</span>
                <div class="send-glow"></div>
              </button>
            </div>

            <div class="input-hint">
              <span class="hint-icon">⏎</span>
              <span class="hint-text">Enter</span>
              <span class="hint-separator">•</span>
              <span class="hint-icon">⎋</span>
              <span class="hint-text">Esc</span>
              <span class="hint-separator" v-if="isInitPhase">•</span>
              <span v-if="isInitPhase">Мин. 25 символов</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MauporiaGame',
  data() {
    return {
      worldName: null,
      worldSetting: null,
      mainGoal: null,

      players: [],
      currentInitIndex: 0,
      isInitPhase: true,
      isFirstAction: true,
      showDivider: true,

      currentPlayerId: null,
      selectedPlayer: null,

      messages: [],
      nextMessageId: 1,
      lastPlayerMessageId: null,
      lastAIMessageId: null,
      lastErrorMessageId: null,

      newMessage: '',
      isInputFocused: false,

      isAITyping: false,

      isPlayersPanelOpen: false
    };
  },
  computed: {
    currentPlayer() {
      const found = this.players.find(p => p.id === this.currentPlayerId);
      if (found && found.name) return found;
      if (found) return found;
      if (this.players.length > 0) return this.players[0];
      return { id: 'unknown', name: 'Неизвестно', avatar: '?', color: '#666', inventory: [], stats: {} };
    },
    currentInitPlayer() {
      if (this.currentInitIndex < 0 || this.currentInitIndex >= this.players.length) return null;
      return this.players[this.currentInitIndex] || null;
    },
    inputPlaceholder() {
      if (window.innerWidth <= 480) {
        return this.isInitPhase ? 'Опишите персонажа (мин. 25 символов)...' : 'Опишите действие...';
      }
      if (this.isInitPhase && this.currentInitPlayer) {
        return 'Игрок, опишите своего персонажа (мин. 25 символов)...';
      }
      const player = this.currentPlayer;
      if (!player || !player.name) return 'Выберите игрока слева...';
      return `${player.name}, опишите действие...`;
    }
  },

  async mounted() {
    let dataGame = this.$store.getters.GAME;
    this.worldName = dataGame.name;
    this.worldSetting = dataGame.context;
    this.mainGoal = dataGame.goal;
    for (let i = 0; i < dataGame.countGamer; i++) {
      this.players.push({ id: dataGame.gamerIds[i] });
    }
    this.currentInitIndex = 0;
    if (this.players.length > 0) {
      this.currentPlayerId = this.players[0].id;
      this.selectedPlayer = this.players[0];
    }
    this.isInitPhase = true;
    this.isFirstAction = true;
    this.showDivider = true;

    setTimeout(() => {
      this.addAIMessage('Игрок, опишите своего персонажа! (Минимум 25 символов)');
    }, 500);

    window.addEventListener('keydown', this.handleGlobalKeydown);
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    handleGlobalKeydown(e) {
      if (e.key === 'Escape' && this.newMessage) {
        this.newMessage = '';
        this.$refs.messageInput?.focus();
      }
    },

    handleResize() {
      if (window.innerWidth > 768) {
        this.isPlayersPanelOpen = false;
      }
    },

    togglePlayersPanel() {
      this.isPlayersPanelOpen = !this.isPlayersPanelOpen;
    },

    closePlayersPanel() {
      this.isPlayersPanelOpen = false;
    },

    selectPlayer(playerId) {
      const player = this.players.find(p => p.id === playerId);
      if (!player) return;

      this.currentPlayerId = playerId;
      this.selectedPlayer = player;

      if (window.innerWidth <= 768) {
        this.closePlayersPanel();
      }
    },

    async sendMessage() {
      const text = this.newMessage.trim();
      if (!text || this.isAITyping) return;

      if (this.isInitPhase && text.length < 25) {
        this.addErrorMessage('⚠️ Описание персонажа должно быть не менее 25 символов.');
        return;
      }

      if (this.isInitPhase) {
        await this.sendInitMessage(text);
      } else {
        await this.sendGameMessage(text);
      }

      this.newMessage = '';
      this.$nextTick(() => {
        this.$refs.messageInput?.focus();
      });
    },

    async sendInitMessage(text) {
      const player = this.currentInitPlayer;
      if (!player) {
        this.addAIMessage('Ошибка: игрок не выбран.');
        return;
      }

      this.addPlayerMessage({ id: player.id, name: 'Игрок', avatar: '?', color: '#5B8CBE' }, text);

      this.isAITyping = true;
      try {
        const form = {
          gamer_id: player.id,
          action: text
        };
        await this.$store.dispatch('initGamers', form);

        const data = this.$store.getters.GAMER;
        if (data) {
          const colors = ['#5B8CBE', '#6B9E7A', '#B57B5C', '#BE5B8C', '#8CBE5B', '#5BBE8C', '#BE8C5B', '#8C5BBE'];
          this.players[this.currentInitIndex] = {
            id: player.id,
            name: data.name || 'Неизвестно',
            character: data.class || null,
            avatar: (data.name || '?').charAt(0).toUpperCase(),
            color: colors[this.currentInitIndex % colors.length],
            description: data.description || '',
            stats: data.stats || {},
            inventory: data.inventory || []
          };
        }

        this.isAITyping = false;

        const p = this.players[this.currentInitIndex];

        let statsText = '';
        if (p.stats && Object.keys(p.stats).length) {
          const statNames = {
            strength: 'Сила', dexterity: 'Ловкость', constitution: 'Телосложение',
            intelligence: 'Интеллект', wisdom: 'Мудрость', charisma: 'Харизма'
          };
          statsText = '<br><br><b>📊 Характеристики:</b><br>' +
              Object.entries(p.stats).map(([k, v]) => `${statNames[k] || k}: ${v}`).join('<br>');
        }

        let inventoryText = '';
        if (p.inventory && p.inventory.length) {
          inventoryText = '<br><br><b>🎒 Инвентарь:</b><br>' +
              p.inventory.map(item => `• <b>${item.title}</b> — ${item.description}`).join('<br>');
        }

        this.addSystemMessage(`
          <b>Персонаж создан!</b><br><br>
          <b>Имя:</b> ${p.name}<br>
          <b>Класс:</b> ${p.character || 'Нет'}<br><br>
          <b>Описание:</b><br>${p.description || 'Нет'}
          ${statsText}
          ${inventoryText}
        `);

        this.selectedPlayer = p;

        this.currentInitIndex++;
        if (this.currentInitIndex < this.players.length) {
          const next = this.players[this.currentInitIndex];
          this.currentPlayerId = next.id;
          this.selectedPlayer = next;
          setTimeout(() => {
            this.addAIMessage('Следующий игрок, опишите своего персонажа! (Минимум 25 символов)');
          }, 500);
        } else {
          this.isInitPhase = false;
          this.currentPlayerId = this.players[0]?.id || null;
          this.selectedPlayer = this.players[0] || null;
          setTimeout(() => this.startGame(), 500);
        }
      } catch (err) {
        this.isAITyping = false;
        this.addErrorMessage('Ошибка при создании персонажа. Попробуйте ещё раз.');
        console.error(err);
      }
    },

    async startGame() {
      this.isAITyping = true;
      try {
        const gameData = this.$store.getters.GAME;
        await this.$store.dispatch('startGame', gameData.id);
        this.isAITyping = false;
        if (gameData && gameData.startMess) {
          this.addAIMessage(gameData.startMess, false, true);
        } else {
          this.addAIMessage('Приключение начинается! Что будете делать?', false, true);
        }
      } catch (err) {
        this.isAITyping = false;
        this.addErrorMessage('Ошибка при старте игры.');
        console.error(err);
      }
    },

    async sendGameMessage(text) {
      const player = this.currentPlayer;
      if (!player || !player.name) {
        this.addErrorMessage('Пожалуйста, выберите игрока слева перед отправкой.');
        return;
      }

      // Первое действие — очищаем чат и скрываем разделитель
      if (this.isFirstAction) {
        this.clearAllMessages();
        this.showDivider = false;
        this.isFirstAction = false;
      } else {
        // Удаляем предыдущие сообщения
        this.removeLastPlayerMessage();
        this.removeLastAIMessage();
        this.removeLastErrorMessage();
      }

      // Добавляем сообщение игрока
      this.addPlayerMessage(player, text, true);

      this.isAITyping = true;
      try {
        const form = {
          gamer_id: player.id,
          action: text
        };

        await this.$store.dispatch('action', form);
        const data = this.$store.getters.ACTIONS;
        this.isAITyping = false;

        // Выводим новый ответ ИИ с подсветкой
        if (data && data.reaction) {
          this.addAIMessage(data.reaction, false, true);
        }

        // Обновляем инвентарь из GAMER
        const gamerData = this.$store.getters.GAMER;
        if (gamerData && gamerData.inventory) {
          const playerIndex = this.players.findIndex(p => p.id === player.id);
          if (playerIndex !== -1) {
            this.players[playerIndex].inventory = gamerData.inventory;
            if (this.selectedPlayer && this.selectedPlayer.id === player.id) {
              this.selectedPlayer = { ...this.players[playerIndex] };
            }
          }
        }

        if (data && data.is_final) {
          const msg = data.is_victory ? '🏆 Поздравляю! Вы победили!' : '💀 Игра окончена... Поражение.';
          setTimeout(() => this.addAIMessage(msg), 1000);
        }
      } catch (err) {
        this.isAITyping = false;
        this.addErrorMessage('Ошибка. Попробуйте ещё раз.');
        console.error(err);
      }
    },

    clearAllMessages() {
      this.messages = [];
      this.lastPlayerMessageId = null;
      this.lastAIMessageId = null;
      this.lastErrorMessageId = null;
      this.nextMessageId = 1;
    },

    removeLastPlayerMessage() {
      if (this.lastPlayerMessageId !== null) {
        const index = this.messages.findIndex(m => m.id === this.lastPlayerMessageId);
        if (index !== -1) {
          this.messages.splice(index, 1);
        }
        this.lastPlayerMessageId = null;
      }
    },

    removeLastAIMessage() {
      if (this.lastAIMessageId !== null) {
        const index = this.messages.findIndex(m => m.id === this.lastAIMessageId);
        if (index !== -1) {
          this.messages.splice(index, 1);
        }
        this.lastAIMessageId = null;
      }
    },

    removeLastErrorMessage() {
      if (this.lastErrorMessageId !== null) {
        const index = this.messages.findIndex(m => m.id === this.lastErrorMessageId);
        if (index !== -1) {
          this.messages.splice(index, 1);
        }
        this.lastErrorMessageId = null;
      }
    },

    removeLatestAIFlag() {
      this.messages.forEach(m => {
        if (m.isLatestAI) m.isLatestAI = false;
      });
    },

    addPlayerMessage(player, text, trackAsLast = false) {
      const msg = {
        id: this.nextMessageId++,
        type: 'player',
        author: player.name || 'Игрок',
        text: text,
        color: player.color || '#5B8CBE',
        timestamp: Date.now()
      };
      this.messages.push(msg);
      if (trackAsLast) {
        this.lastPlayerMessageId = msg.id;
      }
      this.scrollToBottom();
      return msg;
    },

    addAIMessage(text, trackAsLast = false, isLatest = false) {
      if (isLatest) {
        this.removeLatestAIFlag();
      }
      const msg = {
        id: this.nextMessageId++,
        type: 'ai',
        author: 'Виртуальный мастер',
        text: text,
        color: '#7B6FB0',
        timestamp: Date.now(),
        isLatestAI: isLatest
      };
      this.messages.push(msg);
      if (trackAsLast || isLatest) {
        this.lastAIMessageId = msg.id;
      }
      this.scrollToBottom();
      return msg;
    },

    addSystemMessage(text) {
      this.messages.push({
        id: this.nextMessageId++,
        type: 'system',
        author: '',
        text: text,
        color: '#A0B0D0',
        timestamp: Date.now()
      });
      this.scrollToBottom();
    },

    addErrorMessage(text) {
      const msg = {
        id: this.nextMessageId++,
        type: 'error',
        author: '',
        text: '⚠️ ' + text,
        color: '#BE5B5B',
        timestamp: Date.now()
      };
      this.messages.push(msg);
      this.lastErrorMessageId = msg.id;
      this.scrollToBottom();
    },

    insertDiceRoll(dice) {
      const roll = Math.floor(Math.random() * dice) + 1;
      this.newMessage = `Бросаю d${dice}: ${roll}. Результат: ${roll}`;
      this.$refs.messageInput?.focus();
    },

    insertEmoji(emoji) {
      this.newMessage += ' ' + emoji;
      this.$refs.messageInput?.focus();
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    leaveGame() {
      if (confirm('Выйти из игры?')) {
        alert('Возвращайтесь скорее!');
      }
    }
  }
};
</script>

<style scoped>
/* === ОСНОВНОЕ === */
.game-container {
  min-height: 100vh;
  max-height: 100vh;
  background: #0B0E17;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'Inter', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(100, 120, 200, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100, 120, 200, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.glow-orb {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(150px);
  opacity: 0.08;
  pointer-events: none;
}

.glow-orb-1 { background: #5B6E9A; top: -200px; right: -100px; }
.glow-orb-2 { background: #7B6FB0; bottom: -200px; left: -100px; }

/* === ВЕРХНЯЯ ПАНЕЛЬ === */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(11, 14, 23, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(91, 110, 154, 0.3);
}

.logo { display: flex; align-items: center; gap: 6px; }
.logo-icon { font-size: 20px; color: #7B6FB0; }
.logo-text {
  font-size: 18px; font-weight: 700; letter-spacing: 3px;
  background: linear-gradient(135deg, #E8EEFF, #A0B0D0);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.master-status {
  display: flex; align-items: center; gap: 8px;
  color: #8A9BC0; font-size: 12px; letter-spacing: 1.5px;
  background: rgba(60, 70, 100, 0.3); padding: 6px 16px;
  border-radius: 40px; border: 1px solid #4A5A8A;
}

.pulse-dot {
  width: 8px; height: 8px; background: #6B9E7A; border-radius: 50%;
  box-shadow: 0 0 12px #6B9E7A; animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.leave-btn {
  display: flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid #5A5A7A;
  border-radius: 30px; padding: 6px 16px;
  color: #A0A8C0; font-size: 13px; font-weight: 600;
  letter-spacing: 1.5px; cursor: pointer; transition: all 0.2s;
}
.leave-btn:hover {
  border-color: #8A6B9E; color: #C8D0E8; background: rgba(120, 100, 160, 0.15);
}
.leave-icon { display: none; }

.menu-toggle {
  display: none; background: rgba(60, 70, 100, 0.3);
  border: 1px solid #4A5A8A; border-radius: 12px;
  width: 44px; height: 44px; font-size: 24px; color: #A0B0D0;
  cursor: pointer; align-items: center; justify-content: center; transition: all 0.2s;
}
.menu-toggle:hover { background: rgba(100, 110, 150, 0.4); border-color: #7B6FB0; }

/* === ОСНОВНАЯ ОБЛАСТЬ === */
.game-main { position: relative; z-index: 5; flex: 1; display: flex; overflow: hidden; }

/* === ЛЕВАЯ ПАНЕЛЬ === */
.players-panel {
  width: 280px; background: rgba(8, 12, 20, 0.85);
  backdrop-filter: blur(12px); border-right: 1px solid #2A3550;
  padding: 20px 16px; display: flex; flex-direction: column; gap: 16px;
  transition: transform 0.3s ease; z-index: 20; overflow-y: auto;
}

.panel-header { display: flex; align-items: center; justify-content: space-between; }
.panel-close {
  display: none; background: transparent; border: 1px solid #5A5A7A;
  border-radius: 10px; width: 36px; height: 36px; font-size: 20px;
  color: #A0B0D0; cursor: pointer; align-items: center; justify-content: center;
}

.panel-title {
  display: flex; align-items: center; gap: 10px;
  color: #A0B0D0; font-size: 14px; font-weight: 600;
  letter-spacing: 2px; padding-bottom: 16px; border-bottom: 1px solid #2A3550;
}
.player-count { margin-left: auto; background: #1E2840; padding: 2px 10px; border-radius: 20px; font-size: 12px; }

.players-list { display: flex; flex-direction: column; gap: 8px; }

.player-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: rgba(20, 28, 45, 0.6); border-radius: 16px;
  cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
}
.player-item:hover { background: rgba(40, 50, 80, 0.6); border-color: #4A5A8A; }
.player-item.is-current { background: rgba(91, 110, 154, 0.25); border-color: #5B6E9A; }
.player-item.is-initialized { border-left: 2px solid #6B9E7A; }

.player-avatar {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: bold; color: white; flex-shrink: 0;
}

.player-info { flex: 1; min-width: 0; }
.player-name { font-weight: 600; color: #E0E8FF; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.player-role { font-size: 12px; color: #8090B0; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.player-indicator { color: #7B6FB0; font-size: 16px; flex-shrink: 0; }

/* Инвентарь */
.inventory-panel {
  background: rgba(20, 30, 50, 0.6); border: 1px solid #3A4A6A;
  border-radius: 12px; padding: 12px;
}
.inventory-title {
  color: #C8B060; font-size: 12px; font-weight: 600;
  letter-spacing: 1.5px; margin-bottom: 10px;
}
.inventory-list { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
.inventory-item {
  background: rgba(30, 40, 60, 0.5); border-radius: 8px; padding: 8px 10px;
}
.item-title { color: #D8C880; font-size: 12px; font-weight: 600; }
.item-desc { color: #8090B0; font-size: 10px; margin-top: 2px; line-height: 1.3; }

/* Статы */
.stats-panel {
  background: rgba(20, 30, 50, 0.6); border: 1px solid #3A4A6A;
  border-radius: 12px; padding: 12px;
}
.stats-title {
  color: #7B8FC0; font-size: 12px; font-weight: 600;
  letter-spacing: 1.5px; margin-bottom: 10px;
}
.stats-list { display: flex; flex-direction: column; gap: 6px; }
.stat-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 8px; background: rgba(30, 40, 60, 0.3); border-radius: 6px;
  color: #A0B8D8; font-size: 11px;
}
.stat-row span:last-child { color: #C8D8F0; font-weight: 600; }

.current-player-info {
  margin-top: auto; padding-top: 16px; border-top: 1px solid #2A3550;
}
.info-label { font-size: 11px; color: #7080A0; letter-spacing: 1.5px; margin-bottom: 10px; }
.current-player { display: flex; align-items: center; gap: 10px; color: #C8D0E8; font-size: 15px; font-weight: 500; }
.player-color-dot { width: 12px; height: 12px; border-radius: 4px; flex-shrink: 0; }

.panel-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 15;
}

/* === ЧАТ === */
.chat-panel { flex: 1; display: flex; flex-direction: column; padding: 12px; overflow: hidden; }
.chat-container {
  flex: 1; display: flex; flex-direction: column;
  background: rgba(11, 16, 28, 0.5); backdrop-filter: blur(8px);
  border-radius: 20px; border: 1px solid #2A3550; overflow: hidden;
}
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: #3A4A6A; border-radius: 10px; }

.setting-block {
  background: linear-gradient(145deg, #182035, #101624);
  border: 1px solid #4A5A8A; border-radius: 16px; padding: 18px; margin-bottom: 8px;
}
.setting-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
.setting-header h2 { margin: 0; color: #B0C0E0; font-size: 15px; letter-spacing: 2px; font-weight: 600; }
.setting-text { color: #C8D4E8; font-size: 13px; line-height: 1.6; text-align: center; margin: 0; }

.goal-block {
  background: linear-gradient(145deg, #201E18, #181A18);
  border: 1px solid #8A7B5A; border-radius: 16px; padding: 16px 18px; margin-bottom: 8px;
}
.goal-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; }
.goal-header h3 { margin: 0; color: #D0C8A0; font-size: 14px; letter-spacing: 2px; }
.goal-text { color: #E0D8B8; font-size: 13px; line-height: 1.5; text-align: center; margin: 0; }

.chat-divider { display: flex; justify-content: center; margin: 12px 0 6px; }
.chat-divider span { color: #7B6FB0; font-size: 11px; letter-spacing: 2px; font-weight: 500; padding: 0 12px; }

.message { padding: 12px 14px; border-radius: 14px; animation: fadeIn 0.3s; }
@keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }

.message-player { background: rgba(30, 38, 58, 0.6); border-left: 3px solid; margin-left: 8px; }
.message-ai { background: rgba(50, 40, 70, 0.4); border-left: 3px solid #7B6FB0; margin-right: 8px; }
.message-ai-latest {
  background: rgba(60, 45, 90, 0.6);
  border-left: 3px solid #C8B060;
  box-shadow: 0 0 20px rgba(200, 176, 96, 0.15);
  margin-right: 8px;
}
.message-system {
  background: linear-gradient(145deg, #1A2535, #121A28);
  border: 1px solid #4A5A8A; border-left: 3px solid #C8B060;
  margin: 4px 0; padding: 14px 16px;
}
.message-error {
  background: rgba(60, 30, 30, 0.5);
  border-left: 3px solid #BE5B5B;
  margin: 4px 8px;
}

.message-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.message-author { font-weight: 600; font-size: 13px; }
.message-time { font-size: 10px; color: #607090; margin-left: auto; }
.message-text { color: #D8E0F0; font-size: 14px; line-height: 1.5; }

.typing-indicator {
  display: flex; align-items: center; gap: 6px; padding: 10px 14px;
  color: #8090B0; font-size: 12px; font-style: italic;
  background: rgba(50, 40, 70, 0.3); border-radius: 16px; width: fit-content;
}
.dots { font-size: 18px; letter-spacing: 2px; animation: blink 1.4s infinite; }
@keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }

/* === ПОЛЕ ВВОДА === */
.chat-input-area {
  padding: 14px 16px 18px;
  background: linear-gradient(to top, rgba(11, 16, 28, 0.95), rgba(11, 16, 28, 0.7));
  border-top: 1px solid #2A3550;
}
.input-actions { display: flex; gap: 6px; margin-bottom: 12px; }
.action-btn {
  display: flex; align-items: center; gap: 4px;
  background: rgba(30, 40, 60, 0.6); border: 1px solid #3A4A6A;
  border-radius: 20px; padding: 6px 12px; color: #A0B0D0;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: rgba(60, 70, 100, 0.6); border-color: #5B6E9A; color: #C8D8F0; }
.action-icon { font-size: 14px; }

.input-container { display: flex; gap: 8px; }
.input-wrapper {
  flex: 1; display: flex; align-items: center;
  background: #151E30; border: 2px solid #2A3550;
  border-radius: 40px; padding: 2px 2px 2px 12px; transition: all 0.25s;
}
.input-wrapper.input-focused { border-color: #7B6FB0; box-shadow: 0 0 16px rgba(123, 111, 176, 0.2); }
.input-player-badge {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 14px; color: white; margin-right: 6px; flex-shrink: 0;
}
.message-input {
  flex: 1; background: transparent; border: none;
  padding: 12px 4px; color: #E8F0FF; font-size: 14px; outline: none; min-width: 0;
}
.message-input::placeholder { color: #607090; font-weight: 300; }
.char-counter { color: #607090; font-size: 10px; padding: 0 6px; }
.char-counter.char-limit { color: #6B9E7A; font-weight: 600; }
.clear-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(100, 100, 140, 0.2); border: none;
  color: #8090B0; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; margin-right: 6px; flex-shrink: 0;
}

.send-btn {
  position: relative; min-width: 100px;
  background: linear-gradient(145deg, #2A3A5A, #1A2845);
  border: 1px solid #4A5A8A; border-radius: 40px;
  padding: 0 20px; color: #A0B0D0; font-weight: 600;
  letter-spacing: 2px; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  gap: 8px; transition: all 0.3s; overflow: hidden; flex-shrink: 0;
}
.send-btn.has-message {
  background: linear-gradient(145deg, #4A5E9A, #2E3E6A);
  border-color: #7B6FB0; color: #E8F0FF; box-shadow: 0 4px 16px rgba(91, 110, 154, 0.3);
}
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-icon { font-size: 18px; transition: transform 0.3s; }
.send-btn.has-message:hover .send-icon { transform: translateX(3px); }
.send-glow {
  position: absolute; top: 50%; left: 50%; width: 100%; height: 100%;
  background: radial-gradient(circle, rgba(123, 111, 176, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%); opacity: 0; pointer-events: none;
}

.input-hint { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; color: #506080; font-size: 10px; }
.hint-icon { font-size: 12px; }
.hint-separator { opacity: 0.3; }

/* === АДАПТИВНОСТЬ === */
@media (max-width: 768px) {
  .game-header { padding: 10px 14px; }
  .logo-text { font-size: 16px; letter-spacing: 2px; }
  .status-text { display: none; }
  .master-status { padding: 6px 12px; }
  .leave-text { display: none; }
  .leave-icon { display: inline; }
  .leave-btn { padding: 8px 12px; }
  .menu-toggle { display: flex; }
  .players-panel { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; transform: translateX(-100%); box-shadow: 4px 0 20px rgba(0,0,0,0.5); border-right: 1px solid #3A4A6A; }
  .players-panel.panel-open { transform: translateX(0); }
  .panel-close { display: flex; }
  .panel-overlay { display: block; }
  .chat-panel { padding: 8px; }
  .chat-messages { padding: 12px; }
  .setting-block { padding: 14px; }
  .setting-header h2 { font-size: 13px; }
  .goal-block { padding: 12px 14px; }
  .goal-header h3 { font-size: 12px; }
  .input-container { flex-direction: column; }
  .send-btn { width: 100%; padding: 12px; }
  .input-hint { justify-content: center; }
}

@media (max-width: 480px) {
  .game-header { padding: 8px 12px; }
  .logo-icon { font-size: 18px; }
  .logo-text { font-size: 14px; }
  .master-status { padding: 4px 8px; }
  .pulse-dot { width: 6px; height: 6px; }
  .menu-toggle { width: 38px; height: 38px; font-size: 20px; }
  .players-panel { width: 260px; padding: 16px 12px; }
  .player-avatar { width: 38px; height: 38px; font-size: 18px; }
  .player-name { font-size: 14px; }
  .player-role { font-size: 11px; }
  .chat-messages { padding: 10px; gap: 10px; }
  .setting-block, .goal-block { padding: 12px; }
  .setting-text, .goal-text { font-size: 12px; }
  .message { padding: 10px 12px; }
  .message-author { font-size: 12px; }
  .message-text { font-size: 13px; }
  .action-text { display: none; }
  .action-btn { padding: 6px 10px; }
  .action-icon { font-size: 16px; }
  .input-wrapper { padding: 2px 2px 2px 8px; }
  .input-player-badge { width: 28px; height: 28px; font-size: 12px; }
  .message-input { padding: 10px 2px; font-size: 13px; }
  .char-counter { display: none; }
  .send-btn { font-size: 12px; letter-spacing: 1.5px; }
  .hint-text { display: none; }
  .input-hint { gap: 4px; }
}

@media (max-width: 360px) {
  .logo-text { display: none; }
  .master-status { display: none; }
  .players-panel { width: 100%; }
  .setting-header span:first-child, .setting-header span:last-child,
  .goal-header span:first-child, .goal-header span:last-child { display: none; }
  .message-time { display: none; }
}

@media (min-height: 800px) {
  .chat-messages { padding: 20px; }
  .setting-block { padding: 24px; }
  .goal-block { padding: 20px 24px; }
}

@media (max-height: 600px) {
  .game-header { padding: 8px 16px; }
  .chat-input-area { padding: 10px 14px 12px; }
  .input-actions { margin-bottom: 8px; }
  .input-hint { display: none; }
}
</style>