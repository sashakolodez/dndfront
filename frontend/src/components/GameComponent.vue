<template>
  <div class="game-container" :class="{ 'damage-shake': isTakingDamage }">
    <!-- Анимация изменения здоровья -->
    <div class="health-change-overlay" v-if="isHealthChanging">
      <div class="health-change-indicator" :class="healthChangeType">
        <div class="health-change-icon">{{ healthChangeType === 'heal' ? '💚' : '💔' }}</div>
        <div class="health-change-value">{{ healthChangeType === 'heal' ? '+' : '' }}{{ healthChangeValue }}</div>
        <div class="health-change-label" v-if="healthChangeType === 'heal'">Восстановление</div>
        <div class="health-change-label" v-else>Получен урон</div>
      </div>
    </div>

    <!-- Затемнение при уроне -->
    <div class="damage-overlay" v-if="isTakingDamage && healthChangeType === 'damage'"></div>

    <!-- Анимация броска кубика -->
    <div class="dice-roll-overlay" v-if="showDiceRoll">
      <div class="dice-roll-container">
        <div class="dice-cube" :class="{ 'dice-rolling': isDiceRolling }">
          <div class="dice-face">{{ diceRollDisplay }}</div>
        </div>
        <div class="dice-roll-text" v-if="isDiceRolling">Бросаем d{{ rollingDiceSize }}...</div>
        <div class="dice-roll-text" v-else>Результат готов!</div>
      </div>
    </div>

    <!-- Окно результата кубика -->
    <div class="dice-modal-overlay" v-if="showDiceResult" @click="closeDiceResult">
      <div class="dice-modal" @click.stop>
        <div class="dice-modal-header">🎲 Результат броска</div>
        <div class="dice-result-main">
          <div class="dice-result-label">Бросок d{{ diceResultData?.cube || '?' }}</div>
          <div class="dice-result-value" :class="{ 'dice-success': diceResultData?.isSuccess, 'dice-fail': !diceResultData?.isSuccess }">
            {{ diceResultData?.diceResult || '?' }}
          </div>
        </div>
        <div class="dice-details" v-if="diceResultData">
          <div class="dice-detail-row">
            <span>🎯 Результат броска:</span>
            <span>{{ diceResultData.diceResult }}</span>
          </div>
          <div class="dice-detail-row" v-if="diceResultData.bonus">
            <span>✨ Бонус ({{ diceResultData.statName }}):</span>
            <span>+{{ diceResultData.bonus }}</span>
          </div>
          <div class="dice-detail-row">
            <span>📊 Итог:</span>
            <span class="dice-total">{{ diceResultData.result }}</span>
          </div>
          <div class="dice-detail-row">
            <span>🎯 Сложность:</span>
            <span>{{ diceResultData.complexity }}</span>
          </div>
          <div class="dice-verdict" :class="{ 'verdict-success': diceResultData.isSuccess, 'verdict-fail': !diceResultData.isSuccess }">
            {{ diceResultData.isSuccess ? '✅ УСПЕХ!' : '❌ ПРОВАЛ!' }}
          </div>
        </div>
        <button class="dice-close-btn" @click="closeDiceResult">
          <span>ПРОДОЛЖИТЬ</span>
          <span>➤</span>
        </button>
      </div>
    </div>

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

        <!-- Здоровье выбранного игрока -->
        <div class="health-panel" v-if="selectedPlayer && selectedPlayerMaxHealth > 0">
          <div class="health-title">❤️ Здоровье</div>
          <div class="health-bar-container">
            <div class="health-bar" :style="{ width: healthPercent + '%' }" :class="healthStatus"></div>
          </div>
          <div class="health-text">{{ selectedPlayerHealth }} / {{ selectedPlayerMaxHealth }}</div>
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
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 4 || requiredDice.cube === 'd4' || requiredDice.cube === '4') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 4 && requiredDice.cube !== 'd4' && requiredDice.cube !== '4')"
                  @click="rollDice(4)"
                  title="Бросить d4"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d4</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 6 || requiredDice.cube === 'd6' || requiredDice.cube === '6') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 6 && requiredDice.cube !== 'd6' && requiredDice.cube !== '6')"
                  @click="rollDice(6)"
                  title="Бросить d6"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d6</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 8 || requiredDice.cube === 'd8' || requiredDice.cube === '8') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 8 && requiredDice.cube !== 'd8' && requiredDice.cube !== '8')"
                  @click="rollDice(8)"
                  title="Бросить d8"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d8</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 10 || requiredDice.cube === 'd10' || requiredDice.cube === '10') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 10 && requiredDice.cube !== 'd10' && requiredDice.cube !== '10')"
                  @click="rollDice(10)"
                  title="Бросить d10"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d10</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 12 || requiredDice.cube === 'd12' || requiredDice.cube === '12') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 12 && requiredDice.cube !== 'd12' && requiredDice.cube !== '12')"
                  @click="rollDice(12)"
                  title="Бросить d12"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d12</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 20 || requiredDice.cube === 'd20' || requiredDice.cube === '20') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 20 && requiredDice.cube !== 'd20' && requiredDice.cube !== '20')"
                  @click="rollDice(20)"
                  title="Бросить d20"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d20</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ 'dice-enabled': canRollDice && requiredDice && (requiredDice.cube === 100 || requiredDice.cube === 'd100' || requiredDice.cube === '100') }"
                  :disabled="!canRollDice || (requiredDice && requiredDice.cube !== 100 && requiredDice.cube !== 'd100' && requiredDice.cube !== '100')"
                  @click="rollDice(100)"
                  title="Бросить d100"
              >
                <span class="action-icon">🎲</span>
                <span class="action-text">d100</span>
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
                    :disabled="isInputDisabled"
                />

                <div v-if="newMessage.length > 0" class="char-counter">
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
                  :class="{ 'has-message': newMessage.trim().length > 0 }"
                  :disabled="!newMessage.trim() || isAITyping || isInputDisabled"
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
      selectedPlayerHealth: 0,
      selectedPlayerMaxHealth: 0,

      // Эффекты здоровья
      isHealthChanging: false,
      healthChangeValue: 0,
      healthChangeTimer: null,
      isTakingDamage: false,

      // Кубики
      requiredDice: null,
      canRollDice: false,
      isInputDisabled: false,
      showDiceRoll: false,
      isDiceRolling: false,
      diceRollDisplay: '?',
      rollingDiceSize: 0,
      showDiceResult: false,
      diceResultData: null,
      lastDiceMessageId: null,

      messages: [],
      nextMessageId: 1,
      lastPlayerMessageId: null,
      lastAIMessageId: null,
      lastErrorMessageId: null,
      lastCorrectionMessageId: null,

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
      return { id: 'unknown', name: 'Неизвестно', avatar: '?', color: '#666', inventory: [], stats: {}, health: 0, maxHealth: 0 };
    },
    currentInitPlayer() {
      if (this.currentInitIndex < 0 || this.currentInitIndex >= this.players.length) return null;
      return this.players[this.currentInitIndex] || null;
    },
    healthPercent() {
      if (this.selectedPlayerMaxHealth <= 0) return 0;
      return Math.round((this.selectedPlayerHealth / this.selectedPlayerMaxHealth) * 100);
    },
    healthStatus() {
      if (this.healthPercent > 60) return 'health-good';
      if (this.healthPercent > 25) return 'health-medium';
      return 'health-low';
    },
    healthChangeType() {
      if (this.healthChangeValue > 0) return 'heal';
      if (this.healthChangeValue < 0) return 'damage';
      return '';
    },
    inputPlaceholder() {
      if (this.isInputDisabled) return 'Бросьте кубик...';
      if (window.innerWidth <= 480) {
        return this.isInitPhase ? 'Опишите персонажа...' : 'Опишите действие...';
      }
      if (this.isInitPhase && this.currentInitPlayer) {
        return 'Игрок, опишите своего персонажа...';
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
      this.addAIMessage('Игрок, опишите своего персонажа!');
    }, 500);

    window.addEventListener('keydown', this.handleGlobalKeydown);
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
    window.removeEventListener('resize', this.handleResize);
    if (this.healthChangeTimer) clearTimeout(this.healthChangeTimer);
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
      this.updateHealthInfo(player);

      if (window.innerWidth <= 768) {
        this.closePlayersPanel();
      }
    },

    updateHealthInfo(player) {
      if (player && player.health !== undefined) {
        this.selectedPlayerHealth = player.health;
      } else {
        this.selectedPlayerHealth = 0;
      }
      if (player && player.maxHealth !== undefined) {
        this.selectedPlayerMaxHealth = player.maxHealth;
      } else {
        this.selectedPlayerMaxHealth = 100;
      }
    },

    showHealthChangeEffect(modification) {
      if (modification !== 0) {
        this.healthChangeValue = modification;
        this.isHealthChanging = true;
        if (modification < 0) {
          this.isTakingDamage = true;
        }

        if (this.healthChangeTimer) clearTimeout(this.healthChangeTimer);
        this.healthChangeTimer = setTimeout(() => {
          this.isHealthChanging = false;
          this.isTakingDamage = false;
          this.healthChangeValue = 0;
        }, 2000);
      }
    },

    removeDiceMessage() {
      if (this.lastDiceMessageId !== null) {
        const index = this.messages.findIndex(m => m.id === this.lastDiceMessageId);
        if (index !== -1) {
          this.messages.splice(index, 1);
        }
        this.lastDiceMessageId = null;
      }
    },

    checkDiceRequirement() {
      const actions = this.$store.getters.ACTIONS;
      if (actions && actions.requiredRollOfDice) {
        const diceReq = actions.requiredRollOfDice;
        if (diceReq.cube) {
          this.requiredDice = diceReq;
          this.canRollDice = true;
          this.isInputDisabled = true;
          const statNames = { strength: 'Сила', dexterity: 'Ловкость', constitution: 'Телосложение', intelligence: 'Интеллект', wisdom: 'Мудрость', charisma: 'Харизма' };
          const statName = statNames[diceReq.stat] || diceReq.stat;
          const msg = this.addSystemMessage(`🎲 Необходимо бросить <b>d${diceReq.cube}</b> (<b>${statName}</b>)\nСложность: <b>${diceReq.complexity}</b>`);
          this.lastDiceMessageId = msg.id;
        }
      } else {
        this.requiredDice = null;
        this.canRollDice = false;
        this.isInputDisabled = false;
      }
    },

    async rollDice(cube) {
      if (!this.canRollDice || !this.requiredDice) return;

      this.canRollDice = false;
      this.rollingDiceSize = cube;
      this.showDiceRoll = true;
      this.isDiceRolling = true;

      const rollInterval = setInterval(() => {
        this.diceRollDisplay = Math.floor(Math.random() * cube) + 1;
      }, 80);

      try {
        const form = {
          gamer_id: this.requiredDice.gamerId,
          cube: cube
        };
        await this.$store.dispatch('dice', form);
        const diceData = this.$store.getters.DICE;

        clearInterval(rollInterval);
        this.isDiceRolling = false;

        if (diceData) {
          this.diceRollDisplay = diceData.diceResult;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.showDiceRoll = false;

        if (diceData) {
          const statNames = { strength: 'Сила', dexterity: 'Ловкость', constitution: 'Телосложение', intelligence: 'Интеллект', wisdom: 'Мудрость', charisma: 'Харизма' };
          const statName = statNames[this.requiredDice.stat] || this.requiredDice.stat;

          this.diceResultData = {
            ...diceData,
            cube: cube,
            statName: statName,
            complexity: this.requiredDice.complexity,
            isSuccess: diceData.result >= this.requiredDice.complexity
          };
          this.showDiceResult = true;
        }
      } catch (err) {
        clearInterval(rollInterval);
        this.showDiceRoll = false;
        this.isDiceRolling = false;
        this.addErrorMessage('Ошибка при броске кубика.');
        console.error(err);
      }
    },

    closeDiceResult() {
      this.showDiceResult = false;
      this.diceResultData = null;
      this.requiredDice = null;
      this.isInputDisabled = false;

      this.removeDiceMessage();

      const actions = this.$store.getters.ACTIONS;
      if (actions && actions.reaction) {
        this.addAIMessage(actions.reaction, false, true);
      }
    },

    async sendMessage() {
      const text = this.newMessage.trim();
      if (!text || this.isAITyping || this.isInputDisabled) return;

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

      this.removeLastCorrectionMessage();

      this.addPlayerMessage({ id: player.id, name: 'Игрок', avatar: '?', color: '#5B8CBE' }, text);

      this.isAITyping = true;
      try {
        const form = {
          gamer_id: player.id,
          action: text
        };
        await this.$store.dispatch('initGamers', form);

        const data = this.$store.getters.GAMER;

        if (data && data.correction && data.correction !== null && data.correction !== '') {
          this.isAITyping = false;
          this.addCorrectionMessage(data.correction);
          return;
        }

        if (data && data.name) {
          const colors = ['#5B8CBE', '#6B9E7A', '#B57B5C', '#BE5B8C', '#8CBE5B', '#5BBE8C', '#BE8C5B', '#8C5BBE'];

          this.players[this.currentInitIndex] = {
            id: player.id,
            name: data.name || 'Неизвестно',
            character: data.class || null,
            avatar: (data.name || '?').charAt(0).toUpperCase(),
            color: colors[this.currentInitIndex % colors.length],
            description: data.description || '',
            stats: data.stats || {},
            inventory: data.inventory || [],
            health: data.health || 100,
            maxHealth: data.maxHealth || 100,
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
          <b>Класс:</b> ${p.character || 'Нет'}<br>
          <b>Здоровье:</b> ${p.health || 100} / ${p.maxHealth || 100}<br><br>
          <b>Описание:</b><br>${p.description || 'Нет'}
          ${statsText}
          ${inventoryText}
        `);

        this.selectedPlayer = p;
        this.updateHealthInfo(p);

        this.currentInitIndex++;
        if (this.currentInitIndex < this.players.length) {
          const next = this.players[this.currentInitIndex];
          this.currentPlayerId = next.id;
          this.selectedPlayer = next;
          this.updateHealthInfo(next);
          setTimeout(() => {
            this.addAIMessage('Следующий игрок, опишите своего персонажа!');
          }, 500);
        } else {
          this.isInitPhase = false;
          this.currentPlayerId = this.players[0]?.id || null;
          this.selectedPlayer = this.players[0] || null;
          this.updateHealthInfo(this.players[0]);
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

      if (this.isFirstAction) {
        this.clearAllMessages();
        this.showDivider = false;
        this.isFirstAction = false;
      } else {
        this.removeLastPlayerMessage();
        this.removeLastAIMessage();
        this.removeLastErrorMessage();
        this.removeLastCorrectionMessage();
        this.removeDiceMessage();
      }

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

        if (data && data.reaction) {
          this.addAIMessage(data.reaction, false, true);
        }

        this.checkDiceRequirement();

        const gamerData = this.$store.getters.GAMER;
        const actionsData = this.$store.getters.ACTIONS;
        const playerIndex = this.players.findIndex(p => p.id === player.id);

        if (playerIndex !== -1) {
          if (gamerData && gamerData.inventory) {
            this.players[playerIndex].inventory = gamerData.inventory;
          }

          // Здоровье из GAMER.health
          if (gamerData && gamerData.health !== undefined) {
            this.players[playerIndex].health = gamerData.health;
          }
          if (gamerData && gamerData.maxHealth !== undefined) {
            this.players[playerIndex].maxHealth = gamerData.maxHealth;
          }

          if (gamerData && gamerData.stats) {
            this.players[playerIndex].stats = gamerData.stats;
          }

          // Модификация здоровья из ACTIONS.healthModification
          if (actionsData && actionsData.healthModification !== undefined && actionsData.healthModification !== null && actionsData.healthModification !== 0) {
            this.showHealthChangeEffect(actionsData.healthModification);
          }

          if (this.selectedPlayer && this.selectedPlayer.id === player.id) {
            this.selectedPlayer = { ...this.players[playerIndex] };
            this.updateHealthInfo(this.players[playerIndex]);
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
      this.lastCorrectionMessageId = null;
      this.lastDiceMessageId = null;
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

    removeLastCorrectionMessage() {
      if (this.lastCorrectionMessageId !== null) {
        const index = this.messages.findIndex(m => m.id === this.lastCorrectionMessageId);
        if (index !== -1) {
          this.messages.splice(index, 1);
        }
        this.lastCorrectionMessageId = null;
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

    addCorrectionMessage(text) {
      const msg = {
        id: this.nextMessageId++,
        type: 'ai',
        author: 'Виртуальный мастер',
        text: '💬 <b>Уточнение:</b><br>' + text,
        color: '#C8A84B',
        timestamp: Date.now()
      };
      this.messages.push(msg);
      this.lastCorrectionMessageId = msg.id;
      this.scrollToBottom();
    },

    addSystemMessage(text) {
      const msg = {
        id: this.nextMessageId++,
        type: 'system',
        author: '',
        text: text,
        color: '#A0B0D0',
        timestamp: Date.now()
      };
      this.messages.push(msg);
      this.scrollToBottom();
      return msg;
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
      if (this.isInputDisabled) return;
      const roll = Math.floor(Math.random() * dice) + 1;
      this.newMessage = `Бросаю d${dice}: ${roll}`;
      this.$refs.messageInput?.focus();
    },

    insertEmoji(emoji) {
      if (this.isInputDisabled) return;
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
/* === АНИМАЦИЯ ЗДОРОВЬЯ === */
.health-change-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 250;
  pointer-events: none;
}

.health-change-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: healthPopup 2s ease-out forwards;
}

.health-change-indicator.heal {
  animation: healPopup 2s ease-out forwards;
}

@keyframes healthPopup {
  0% { transform: scale(0.3); opacity: 0; }
  20% { transform: scale(1.2); opacity: 1; }
  40% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1) translateY(-30px); opacity: 0; }
}

@keyframes healPopup {
  0% { transform: scale(0.3); opacity: 0; }
  20% { transform: scale(1.2); opacity: 1; }
  40% { transform: scale(1); opacity: 1; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1) translateY(-30px); opacity: 0; }
}

.health-change-icon {
  font-size: 56px;
  filter: drop-shadow(0 0 20px rgba(255, 100, 100, 0.6));
}

.health-change-indicator.heal .health-change-icon {
  filter: drop-shadow(0 0 20px rgba(100, 255, 100, 0.6));
}

.health-change-value {
  font-size: 52px;
  font-weight: 900;
  font-family: 'Impact', 'Arial Black', sans-serif;
  text-shadow: 0 0 30px rgba(255, 80, 80, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6);
  color: #FF4444;
}

.health-change-indicator.heal .health-change-value {
  color: #44FF44;
  text-shadow: 0 0 30px rgba(80, 255, 80, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6);
}

.health-change-label {
  font-size: 18px;
  color: #FF8888;
  letter-spacing: 2px;
  font-weight: 600;
}

.health-change-indicator.heal .health-change-label {
  color: #88FF88;
}

/* Затемнение при уроне */
.damage-overlay {
  position: fixed;
  inset: 0;
  background: rgba(200, 30, 30, 0.25);
  z-index: 100;
  pointer-events: none;
  animation: damageFlash 0.8s ease-out;
}

@keyframes damageFlash {
  0% { background: rgba(200, 20, 20, 0.5); }
  100% { background: rgba(200, 30, 30, 0); }
}

.damage-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-6px); }
  20% { transform: translateX(6px); }
  30% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
  70% { transform: translateX(0); }
}

/* === АНИМАЦИЯ БРОСКА === */
.dice-roll-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dice-roll-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.dice-cube {
  width: 150px;
  height: 150px;
  background: linear-gradient(145deg, #2A1A4A, #1A0A2A);
  border: 3px solid #C8B060;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 60px rgba(200, 176, 96, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5);
}

.dice-cube.dice-rolling {
  animation: diceShake 0.1s infinite;
}

@keyframes diceShake {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(10deg) scale(1.05); }
  50% { transform: rotate(-10deg) scale(1.1); }
  75% { transform: rotate(5deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); }
}

.dice-face {
  font-size: 64px;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  font-family: 'Impact', 'Arial Black', sans-serif;
}

.dice-roll-text {
  font-size: 20px;
  color: #C8B060;
  letter-spacing: 2px;
  font-weight: 600;
  animation: pulse-text 1s infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Модальное окно результата */
.dice-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dice-modal {
  background: linear-gradient(145deg, #1A2535, #0F1925);
  border: 2px solid #C8B060;
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 0 60px rgba(200, 176, 96, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 420px;
  width: 90%;
  animation: modalPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.dice-modal-header {
  font-size: 20px;
  font-weight: 700;
  color: #C8B060;
  letter-spacing: 2px;
  margin-bottom: 24px;
}

.dice-result-main {
  margin-bottom: 24px;
}

.dice-result-label {
  font-size: 14px;
  color: #8090B0;
  margin-bottom: 8px;
}

.dice-result-value {
  font-size: 80px;
  font-weight: 900;
  font-family: 'Impact', 'Arial Black', sans-serif;
  text-shadow: 0 0 40px currentColor;
}

.dice-result-value.dice-success {
  color: #5BFF5B;
  text-shadow: 0 0 40px rgba(91, 255, 91, 0.6);
}

.dice-result-value.dice-fail {
  color: #FF5B5B;
  text-shadow: 0 0 40px rgba(255, 91, 91, 0.6);
}

.dice-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.dice-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(30, 40, 60, 0.5);
  border-radius: 8px;
  color: #A0B8D8;
  font-size: 14px;
}

.dice-detail-row span:last-child {
  color: #E0E8FF;
  font-weight: 600;
}

.dice-total {
  color: #FFD700 !important;
  font-size: 18px;
}

.dice-verdict {
  padding: 12px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-top: 4px;
}

.verdict-success {
  background: rgba(91, 255, 91, 0.15);
  color: #5BFF5B;
  border: 1px solid rgba(91, 255, 91, 0.3);
  text-shadow: 0 0 20px rgba(91, 255, 91, 0.3);
}

.verdict-fail {
  background: rgba(255, 91, 91, 0.15);
  color: #FF5B5B;
  border: 1px solid rgba(255, 91, 91, 0.3);
  text-shadow: 0 0 20px rgba(255, 91, 91, 0.3);
}

.dice-close-btn {
  margin-top: 8px;
  padding: 14px 40px;
  background: linear-gradient(145deg, #C8A84B, #A08830);
  border: none;
  border-radius: 40px;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(200, 168, 75, 0.4);
  width: 100%;
}

.dice-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(200, 168, 75, 0.6);
  background: linear-gradient(145deg, #D8B860, #B09840);
}

.dice-close-btn span:last-child {
  font-size: 20px;
  transition: transform 0.3s;
}

.dice-close-btn:hover span:last-child {
  transform: translateX(4px);
}

/* Кнопки кубиков */
.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.dice-enabled {
  background: rgba(200, 168, 75, 0.3);
  border-color: #C8B060;
  color: #FFD700;
  box-shadow: 0 0 15px rgba(200, 168, 75, 0.3);
  animation: pulse-dice 2s infinite;
}

@keyframes pulse-dice {
  0%, 100% { box-shadow: 0 0 15px rgba(200, 168, 75, 0.3); }
  50% { box-shadow: 0 0 30px rgba(200, 168, 75, 0.6); }
}

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

/* Здоровье */
.health-panel {
  background: rgba(20, 30, 50, 0.6); border: 1px solid #3A4A6A;
  border-radius: 12px; padding: 12px;
}
.health-title {
  color: #BE5B5B; font-size: 12px; font-weight: 600;
  letter-spacing: 1.5px; margin-bottom: 10px;
}
.health-bar-container {
  width: 100%; height: 14px; background: #1A2535;
  border-radius: 10px; overflow: hidden; margin-bottom: 8px;
}
.health-bar {
  height: 100%; border-radius: 10px; transition: width 0.5s ease;
}
.health-good { background: linear-gradient(90deg, #5B9E6B, #7BC87B); }
.health-medium { background: linear-gradient(90deg, #C8A84B, #D8C870); }
.health-low { background: linear-gradient(90deg, #C85B4B, #E0705B); animation: pulse-health 1s infinite; }
@keyframes pulse-health {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.health-text {
  color: #A0B0C0; font-size: 11px; text-align: center;
}

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
.input-actions { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
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
.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.message-input::placeholder { color: #607090; font-weight: 300; }
.char-counter { color: #607090; font-size: 10px; padding: 0 6px; }
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