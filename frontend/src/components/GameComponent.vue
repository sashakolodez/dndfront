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

    <!-- Модальное окно ошибки -->
    <div class="error-modal-overlay" v-if="showErrorModal" @click="closeErrorModal">
      <div class="error-modal" @click.stop>
        <div class="error-modal-border"></div>
        <div class="error-modal-content">
          <div class="error-modal-icon-container">
            <div class="error-modal-icon">⚠️</div>
          </div>
          <div class="error-modal-title">Внимание!</div>
          <div class="error-modal-text">{{ errorMessage }}</div>
          <div class="error-modal-divider"></div>
          <button class="error-close-btn" @click="closeErrorModal">
            <span>ПОНЯТНО</span>
            <span class="error-btn-arrow">➤</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Экран загрузки начала боя -->
    <div class="battle-loading-overlay" v-if="isBattleLoading">
      <div class="battle-loading-content">
        <div class="battle-loading-icon">⚔️</div>
        <div class="battle-loading-title">НАЧАЛО БОЯ</div>
        <div class="battle-loading-text">Ожидаем результаты бросков инициативы...</div>
        <div class="battle-loading-spinner"></div>
      </div>
    </div>

    <!-- Модальное окно инициативы -->
    <div class="initiative-modal-overlay" v-if="showInitiativeModal" @click="closeInitiativeModal">
      <div class="initiative-modal" @click.stop>
        <div class="initiative-modal-header">
          <span>⚔️</span>
          <span>НАЧАЛО БОЯ</span>
          <span>⚔️</span>
        </div>
        <div class="initiative-subtitle">Порядок инициативы</div>
        <div class="initiative-list">
          <div
              v-for="(item, index) in initiativeResults"
              :key="item.id"
              class="initiative-item"
              :class="{ 'initiative-first': index === 0, 'initiative-player': item.unitType === 'gamer', 'initiative-npc': item.unitType === 'nps' }"
          >
            <div class="initiative-position">{{ index + 1 }}</div>
            <div class="initiative-avatar">{{ item.unitType === 'gamer' ? '🧙' : '👹' }}</div>
            <div class="initiative-info">
              <div class="initiative-name">{{ item.name }}</div>
              <div class="initiative-type">{{ item.unitType === 'gamer' ? 'Игрок' : 'Противник' }}</div>
            </div>
            <div class="initiative-roll">
              <div class="initiative-dice">
                <span class="dice-label">Бросок</span>
                <span class="dice-value">{{ item.rollDice }}</span>
              </div>
              <div class="initiative-bonus" v-if="item.bonus">
                <span class="bonus-label">+{{ item.bonus }}</span>
                <span class="bonus-stat">({{ getStatName(item.bonusStat) }})</span>
              </div>
              <div class="initiative-total">{{ item.total }}</div>
            </div>
          </div>
        </div>
        <button class="initiative-close-btn" @click="closeInitiativeModal">
          <span>НАЧАТЬ БОЙ</span>
          <span>➤</span>
        </button>
      </div>
    </div>

    <!-- Модальное окно окончания игры -->
    <div class="game-end-overlay" v-if="showGameEndModal">
      <div class="game-end-modal" :class="{ 'victory': gameEndIsVictory, 'defeat': !gameEndIsVictory }">
        <div class="game-end-glow"></div>
        <div class="game-end-content">
          <div class="game-end-icon">{{ gameEndIsVictory ? '🏆' : '💀' }}</div>
          <div class="game-end-title">{{ gameEndIsVictory ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ' }}</div>
          <div class="game-end-text">{{ gameEndMessage }}</div>
          <div class="game-end-divider"></div>
          <button class="game-end-btn" @click="goToHome">
            <span>НА ГЛАВНУЮ</span>
            <span class="game-end-arrow">➤</span>
          </button>
        </div>
      </div>
    </div>

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

    <!-- Окно скиллов -->
    <div class="spells-modal-overlay" v-if="showSpellsModal" @click="closeSpellsModal">
      <div class="spells-modal" @click.stop>
        <div class="spells-modal-header">
          <span>📜 Скиллы {{ selectedSpellLevel }} уровня ({{ currentLevelSpells.length }})</span>
          <button class="spells-close-btn" @click="closeSpellsModal">✕</button>
        </div>
        <div class="spells-list" v-if="currentLevelSpells.length > 0">
          <div
              v-for="spell in currentLevelSpells"
              :key="spell.id"
              class="spell-card"
              @click="useSpell(spell)"
          >
            <div class="spell-card-header">
              <span class="spell-title">{{ spell.title }}</span>
              <span class="spell-level">Ур. {{ spell.level }}</span>
            </div>
            <div class="spell-description">{{ spell.description }}</div>
          </div>
        </div>
        <div class="spells-empty" v-else>
          <span>🔒 Нет доступных скиллов этого уровня</span>
        </div>
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
      <div class="master-status" :class="{ 'battle-active': isBattleActive }">
        <template v-if="isBattleActive">
          <span class="battle-indicator">⚔️</span>
          <span class="status-text" v-if="isPlayerTurn && waitingForPlayerAction">ХОД: {{ getCurrentTurnName() }}</span>
          <span class="status-text" v-else-if="isNPCTurn">ХОД ПРОТИВНИКА</span>
          <span class="status-text" v-else>БОЙ</span>
        </template>
        <template v-else>
          <span class="pulse-dot"></span>
          <span class="status-text">МАСТЕР · АКТИВЕН</span>
        </template>
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

        <!-- Компактный список игроков -->
        <div class="players-compact-list">
          <div
              v-for="(player, index) in players"
              :key="player.id"
              class="player-compact-item"
              :class="{ 'is-current': player.id === currentPlayerId, 'is-initialized': player.isInit }"
              @click="selectPlayer(player.id)"
          >
            <div class="player-compact-avatar" :style="{ background: player.color || '#666' }">
              {{ player.avatar || '?' }}
            </div>
            <div class="player-compact-info">
              <div class="player-compact-name">{{ player.displayName }}</div>
              <div class="player-compact-bars" v-if="player.isInit && player.maxHealth">
                <div class="mini-hp-bar">
                  <div class="mini-hp-fill" :style="{ width: getPlayerHealthPercent(player) + '%' }" :class="getPlayerHealthStatus(player)"></div>
                </div>
              </div>
            </div>
            <div class="player-compact-stats">
              <span class="compact-hp" v-if="player.isInit">❤️ {{ player.health || 0 }}</span>
            </div>
            <div class="player-indicator" v-if="player.id === currentPlayerId">▼</div>
          </div>
        </div>

        <!-- Детальная информация только для выбранного инициализированного игрока -->
        <div class="player-details" v-if="selectedPlayer && selectedPlayer.isInit">
          <!-- Здоровье и броня -->
          <div class="health-armor-panel" v-if="selectedPlayerMaxHealth > 0">
            <div class="health-main">
              <div class="health-title">❤️ Здоровье</div>
              <div class="health-bar-container">
                <div class="health-bar" :style="{ width: healthPercent + '%' }" :class="healthStatus"></div>
              </div>
              <div class="health-text">{{ selectedPlayerHealth }} / {{ selectedPlayerMaxHealth }}</div>
            </div>
            <div class="armor-mini" v-if="selectedPlayer.armor !== undefined && selectedPlayer.armor !== null">
              <span class="armor-mini-icon">🛡️</span>
              <span class="armor-mini-value">{{ selectedPlayer.armor }}</span>
            </div>
          </div>

          <!-- Слоты заклинаний -->
          <div class="spell-slots-panel" v-if="selectedPlayer.spellSlots">
            <div class="spell-slots-title">✨ Ячейки заклинаний</div>
            <div class="spell-slots-row">
              <div
                  class="spell-slot"
                  :class="{ 'slot-available': isSlotAvailable(1), 'slot-empty': !isSlotAvailable(1) }"
                  @click="openSpellsModal(1)"
                  title="Скиллы 1 уровня"
              >
                <span class="slot-number">I</span>
                <span class="slot-count">{{ getSpellCount(1) }}</span>
              </div>
              <div
                  class="spell-slot"
                  :class="{ 'slot-available': isSlotAvailable(2), 'slot-empty': !isSlotAvailable(2) }"
                  @click="openSpellsModal(2)"
                  title="Скиллы 2 уровня"
              >
                <span class="slot-number">II</span>
                <span class="slot-count">{{ getSpellCount(2) }}</span>
              </div>
              <div
                  class="spell-slot"
                  :class="{ 'slot-available': isSlotAvailable(3), 'slot-empty': !isSlotAvailable(3) }"
                  @click="openSpellsModal(3)"
                  title="Скиллы 3 уровня"
              >
                <span class="slot-number">III</span>
                <span class="slot-count">{{ getSpellCount(3) }}</span>
              </div>
              <div
                  class="spell-slot"
                  :class="{ 'slot-available': isSlotAvailable(4), 'slot-empty': !isSlotAvailable(4) }"
                  @click="openSpellsModal(4)"
                  title="Скиллы 4 уровня"
              >
                <span class="slot-number">IV</span>
                <span class="slot-count">{{ getSpellCount(4) }}</span>
              </div>
            </div>
          </div>

          <!-- Инвентарь -->
          <div class="inventory-panel" v-if="selectedPlayer.inventory && selectedPlayer.inventory.length > 0">
            <div class="inventory-title">🎒 Инвентарь</div>
            <div class="inventory-list">
              <div v-for="item in selectedPlayer.inventory" :key="item.id" class="inventory-item">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-desc">{{ item.description }}</div>
              </div>
            </div>
          </div>

          <!-- Статы -->
          <div class="stats-panel" v-if="selectedPlayer.stats && Object.keys(selectedPlayer.stats).length > 0">
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
        </div>

        <!-- Сообщение для неинициализированного -->
        <div class="player-not-init" v-if="selectedPlayer && !selectedPlayer.isInit">
          <span>Персонаж ещё не создан</span>
        </div>

        <div class="current-player-info">
          <div class="info-label">Вы пишете как:</div>
          <div class="current-player">
            <span class="player-color-dot" :style="{ background: currentPlayer.color || '#666' }"></span>
            <span>{{ currentPlayer.displayName || currentPlayer.id || 'Не выбран' }}</span>
          </div>
        </div>
      </aside>

      <div class="panel-overlay" v-if="isPlayersPanelOpen" @click="closePlayersPanel"></div>

      <!-- Чат -->
      <main class="chat-panel">
        <div class="chat-container">
          <div class="chat-messages" ref="chatContainer">
            <div class="setting-block">
              <div class="setting-header">
                <span>🌠</span>
                <h2>СЕТТИНГ · {{ worldName }}</h2>
                <span>🌠</span>
              </div>
              <p class="setting-text">{{ worldSetting }}</p>
            </div>

            <div class="goal-block">
              <div class="goal-header">
                <span>🎯</span>
                <h3>ГЛАВНАЯ ЦЕЛЬ</h3>
                <span>🎯</span>
              </div>
              <p class="goal-text">{{ mainGoal }}</p>
            </div>

            <div class="chat-divider" v-if="showDivider">
              <span>⚡ НАЧАЛО ИСТОРИИ ⚡</span>
            </div>

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

            <div v-if="isAITyping" class="typing-indicator">
              <span>Виртуальный мастер печатает</span>
              <span class="dots">...</span>
            </div>

            <div v-if="isNPCTyping" class="typing-indicator typing-npc">
              <span>{{ npcTypingName }} делает свой ход</span>
              <span class="dots">...</span>
            </div>
          </div>

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

      <!-- Правая панель: враги -->
      <aside class="enemies-panel" v-if="showEnemiesPanel">
        <div class="enemies-header">
          <div class="enemies-title">
            <span>⚔️</span>
            <span>ВРАГИ</span>
            <span class="enemy-count">{{ enemies.length }}</span>
          </div>
        </div>
        <div class="enemies-list">
          <div v-for="enemy in enemies" :key="enemy.name" class="enemy-card">
            <div class="enemy-avatar">👹</div>
            <div class="enemy-info">
              <div class="enemy-name">{{ enemy.name }}</div>
              <div class="enemy-hp-bar-container">
                <div class="enemy-hp-bar" :style="{ width: getEnemyHealthPercent(enemy) + '%' }" :class="getEnemyHealthStatus(enemy)"></div>
              </div>
              <div class="enemy-stats">
                <span class="enemy-hp">❤️ {{ enemy.health }}/{{ enemy.maxHealth }}</span>
                <span class="enemy-armor" v-if="enemy.armor">🛡️ {{ enemy.armor }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
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

      isNewGame: true,
      currentInitIndex: 0,
      isInitPhase: true,
      isFirstAction: true,
      showDivider: true,

      currentPlayerId: null,
      briefRetellingMessageId: null,

      isHealthChanging: false,
      healthChangeValue: 0,
      healthChangeTimer: null,
      isTakingDamage: false,

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

      showSpellsModal: false,
      selectedSpellLevel: 1,

      showErrorModal: false,
      errorMessage: '',

      showGameEndModal: false,
      gameEndIsVictory: false,
      gameEndMessage: '',

      showEnemiesPanel: false,
      enemies: [],

      isBattleActive: false,
      isBattleLoading: false,
      battleOrder: [],
      currentTurnIndex: 0,
      showInitiativeModal: false,
      initiativeResults: [],
      isPlayerTurn: false,
      isNPCTurn: false,
      waitingForPlayerAction: false,
      isNPCTyping: false,
      npcTypingName: '',

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
    players() {
      const game = this.$store.getters.GAME;
      const gamersCollection = this.$store.getters.GAMERS;
      const colors = ['#5B8CBE', '#6B9E7A', '#B57B5C', '#BE5B8C', '#8CBE5B', '#5BBE8C', '#BE8C5B', '#8C5BBE'];

      if (gamersCollection && gamersCollection.gamers && gamersCollection.gamers.length > 0) {
        return gamersCollection.gamers.map((gamer, index) => ({
          ...gamer,
          avatar: (gamer.name || '?').charAt(0).toUpperCase(),
          color: colors[index % colors.length],
          displayName: gamer.name || `Игрок ${index + 1}`,
          character: gamer.class || gamer.character || null
        }));
      }

      if (game && game.gamerIds && game.gamerIds.length > 0) {
        return game.gamerIds.map((id, index) => ({
          id: id,
          name: '',
          isInit: false,
          avatar: '?',
          color: colors[index % colors.length],
          displayName: `Игрок ${index + 1}`,
          character: null,
          description: '',
          stats: {},
          inventory: [],
          health: 100,
          maxHealth: 100,
          armor: 0,
          spells: [],
          spellSlots: null,
          correction: null
        }));
      }

      return [];
    },

    currentPlayer() {
      const colors = ['#5B8CBE', '#6B9E7A', '#B57B5C', '#BE5B8C', '#8CBE5B', '#5BBE8C', '#BE8C5B', '#8C5BBE'];

      const gamer = this.$store.getters.GAMER;
      if (gamer && gamer.id) {
        const playerIndex = this.players.findIndex(p => p.id === gamer.id);

        return {
          ...gamer,
          avatar: (gamer.name || '?').charAt(0).toUpperCase(),
          color: colors[playerIndex >= 0 ? playerIndex % colors.length : 0],
          displayName: gamer.name || `Игрок ${playerIndex + 1}`,
          character: gamer.class || gamer.character || null
        };
      }

      const player = this.players.find(p => p.id === this.currentPlayerId);
      if (player && player.name) {
        return {
          ...player,
          character: player.class || player.character || null
        };
      }

      if (this.isNewGame && this.isInitPhase) {
        const tempPlayer = this.players.find(p => p.id === this.currentPlayerId);
        return tempPlayer || this.players[0] || this.getDefaultPlayer();
      }

      return this.players[0] || this.getDefaultPlayer();
    },

    currentInitPlayer() {
      return this.players.find(p => !p.isInit) || null;
    },

    selectedPlayer() {
      return this.currentPlayer;
    },

    selectedPlayerHealth() {
      if (!this.currentPlayer || !this.currentPlayer.isInit) return 0;
      return this.currentPlayer.health || 0;
    },

    selectedPlayerMaxHealth() {
      if (!this.currentPlayer || !this.currentPlayer.isInit) return 0;
      return this.currentPlayer.maxHealth || 100;
    },

    healthPercent() {
      if (!this.selectedPlayerMaxHealth || this.selectedPlayerMaxHealth <= 0) return 0;
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

    currentLevelSpells() {
      if (!this.currentPlayer || !this.currentPlayer.spells) return [];
      return this.currentPlayer.spells.filter(s => s.level === this.selectedSpellLevel);
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
    const gameId = this.$route.params.uuid;
    const isNewParam = this.$route.query.is_new;
    this.isNewGame = isNewParam === 'true' || isNewParam === true;

    if (!this.isNewGame) {
      try {
        await this.$store.dispatch('searchGame', gameId);
      } catch (err) {
        console.error('Ошибка при загрузке игры:', err);
        this.showError('Не удалось загрузить игру.');
        return;
      }
    }

    let dataGame = this.$store.getters.GAME;
    this.worldName = dataGame.name;
    this.worldSetting = dataGame.context;
    this.mainGoal = dataGame.goal;

    if (!this.isNewGame) {
      if (dataGame.startMess) {
        const msg = this.addAIMessage(dataGame.startMess, false, true);
        this.briefRetellingMessageId = msg.id;
      }

      const hasUninitializedPlayers = this.players.some(p => !p.isInit);

      if (hasUninitializedPlayers) {
        this.isInitPhase = true;
        this.isFirstAction = true;
        this.showDivider = true;

        const firstNotInit = this.players.find(p => !p.isInit);
        if (firstNotInit) {
          this.$store.commit('setCurrentGamer', firstNotInit.id);
          this.currentPlayerId = firstNotInit.id;
        }

        setTimeout(() => {
          this.addAIMessage('Игрок, опишите своего персонажа!');
        }, 500);
      } else {
        this.isInitPhase = false;
        this.isFirstAction = false;
        this.showDivider = false;

        if (this.players.length > 0) {
          this.$store.commit('setCurrentGamer', this.players[0].id);
          this.currentPlayerId = this.players[0].id;
        }
      }

      if (dataGame.battle && dataGame.battle.isActive) {
        this.updateEnemies(dataGame.battle);
      }
    } else {
      if (this.players.length > 0) {
        this.currentPlayerId = this.players[0].id;
      }

      this.isInitPhase = true;
      this.isFirstAction = true;
      this.showDivider = true;

      setTimeout(() => {
        this.addAIMessage('Игрок, опишите своего персонажа!');
      }, 500);
    }

    window.addEventListener('keydown', this.handleGlobalKeydown);
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
    window.removeEventListener('resize', this.handleResize);
    if (this.healthChangeTimer) clearTimeout(this.healthChangeTimer);
  },

  methods: {
    getDefaultPlayer() {
      return {
        id: 'unknown',
        name: '',
        avatar: '?',
        color: '#666',
        isInit: false,
        displayName: 'Не выбран',
        inventory: [],
        stats: {},
        health: 0,
        maxHealth: 100,
        spells: [],
        spellSlots: null,
        armor: 0,
        character: null,
        description: '',
        correction: null
      };
    },

    handleGlobalKeydown(e) {
      if (e.key === 'Escape') {
        if (this.showErrorModal) {
          this.closeErrorModal();
        } else if (this.showSpellsModal) {
          this.closeSpellsModal();
        } else if (this.newMessage) {
          this.newMessage = '';
          this.$refs.messageInput?.focus();
        }
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
      if (this.isBattleActive && this.isPlayerTurn && this.waitingForPlayerAction) {
        const currentUnit = this.battleOrder[this.currentTurnIndex];
        if (currentUnit && currentUnit.unitType === 'gamer') {
          if (currentUnit.id !== playerId) {
            return;
          }
        }
      }

      this.$store.commit('setCurrentGamer', playerId);
      this.currentPlayerId = playerId;

      if (window.innerWidth <= 768) {
        this.closePlayersPanel();
      }
    },

    getPlayerHealthPercent(player) {
      if (!player || !player.maxHealth || !player.isInit) return 0;
      return Math.round(((player.health || 0) / player.maxHealth) * 100);
    },

    getPlayerHealthStatus(player) {
      const percent = this.getPlayerHealthPercent(player);
      if (percent > 60) return 'health-good';
      if (percent > 25) return 'health-medium';
      return 'health-low';
    },

    getEnemyHealthPercent(enemy) {
      if (!enemy || !enemy.maxHealth) return 0;
      return Math.round((enemy.health / enemy.maxHealth) * 100);
    },

    getEnemyHealthStatus(enemy) {
      const percent = this.getEnemyHealthPercent(enemy);
      if (percent > 60) return 'health-good';
      if (percent > 25) return 'health-medium';
      return 'health-low';
    },

    updateEnemies(battleData) {
      if (!battleData) {
        this.enemies = [];
        this.showEnemiesPanel = false;
        return;
      }

      const wasBattleActive = this.isBattleActive;
      this.isBattleActive = battleData.isActive;

      if (battleData.isActive && battleData.enemies && battleData.enemies.length > 0) {
        this.enemies = battleData.enemies;
        this.showEnemiesPanel = true;

        if (!wasBattleActive && battleData.isActive) {
          this.handleBattleStart();
        }
      } else {
        this.enemies = [];
        this.showEnemiesPanel = false;
      }
    },

    getStatName(stat) {
      const statNames = {
        strength: 'Сила',
        dexterity: 'Ловкость',
        constitution: 'Телосложение',
        intelligence: 'Интеллект',
        wisdom: 'Мудрость',
        charisma: 'Харизма'
      };
      return statNames[stat] || stat;
    },

    getCurrentTurnName() {
      if (this.currentTurnIndex >= this.battleOrder.length) return '';
      const currentUnit = this.battleOrder[this.currentTurnIndex];
      return currentUnit ? currentUnit.name : '';
    },

    async handleBattleStart() {
      const gameData = this.$store.getters.GAME;
      if (!gameData || !gameData.id) return;

      this.isBattleLoading = true;
      this.isInputDisabled = true;

      try {
        await this.$store.dispatch('startBattle', gameData.id);
        const battleInit = this.$store.getters.BATTLE_INIT;

        this.isBattleLoading = false;

        if (battleInit && battleInit.rollDices && battleInit.rollDices.length > 0) {
          const sortedResults = [...battleInit.rollDices]
              .map(item => ({
                id: item.id,
                name: item.name,
                unitType: item.unitType,
                rollDice: item.rollDice,
                bonus: item.bonus || 0,
                bonusStat: item.bonusStat,
                total: item.rollDice + (item.bonus || 0)
              }))
              .sort((a, b) => b.total - a.total);

          this.initiativeResults = sortedResults;
          this.battleOrder = [...sortedResults];

          this.showInitiativeModal = true;
        } else {
          this.isInputDisabled = false;
        }
      } catch (err) {
        this.isBattleLoading = false;
        this.isInputDisabled = false;
        console.error('Ошибка при начале боя:', err);
        this.addErrorMessage('Не удалось начать бой.');
      }
    },

    closeInitiativeModal() {
      this.showInitiativeModal = false;
      this.isInputDisabled = false;

      if (this.battleOrder.length > 0) {
        this.currentTurnIndex = 0;
        this.processTurn();
      }
    },

    processTurn() {
      if (this.currentTurnIndex >= this.battleOrder.length) {
        this.currentTurnIndex = 0;
      }

      const currentUnit = this.battleOrder[this.currentTurnIndex];
      if (!currentUnit) return;

      if (currentUnit.unitType === 'gamer') {
        this.isPlayerTurn = true;
        this.isNPCTurn = false;
        this.waitingForPlayerAction = true;

        this.$store.commit('setCurrentGamer', currentUnit.id);
        this.currentPlayerId = currentUnit.id;
      } else {
        this.isPlayerTurn = false;
        this.isNPCTurn = true;
        this.waitingForPlayerAction = false;

        this.executeNPCTurn();
      }
    },

    async executeNPCTurn() {
      try {
        const currentUnit = this.battleOrder[this.currentTurnIndex];
        if (!currentUnit) {
          this.nextTurn();
          return;
        }

        this.isNPCTyping = true;
        this.npcTypingName = currentUnit.name || 'Противник';

        await this.$store.dispatch('npcAction', {
          gameId: this.$store.getters.GAME.id,
          npcId: currentUnit.id
        });

        const npcData = this.$store.getters.NPC_ACTION;

        this.isNPCTyping = false;

        if (npcData) {
          if (npcData.action) {
            this.addAIMessage(npcData.action, false, true);
          }

          if (npcData.damage > 0 && npcData.gamerId) {
            const player = this.players.find(p => p.id === npcData.gamerId);
            if (player) {
              player.health = Math.max(0, (player.health || 0) - npcData.damage);
              this.showHealthChangeEffect(-npcData.damage);
            }
          }

          this.checkDiceRequirement();

          setTimeout(() => {
            this.nextTurn();
          }, 1000);
        } else {
          this.nextTurn();
        }
      } catch (err) {
        this.isNPCTyping = false;
        console.error('Ошибка при выполнении хода НПС:', err);
        this.addErrorMessage('Ошибка при ходе противника.');
        this.nextTurn();
      }
    },

    nextTurn() {
      this.currentTurnIndex++;
      if (this.currentTurnIndex >= this.battleOrder.length) {
        this.currentTurnIndex = 0;
      }
      this.processTurn();
    },

    isSlotAvailable(level) {
      if (!this.currentPlayer || !this.currentPlayer.isInit || !this.currentPlayer.spellSlots) return false;
      const slots = this.currentPlayer.spellSlots;
      let slotArray;
      switch(level) {
        case 1: slotArray = slots.one; break;
        case 2: slotArray = slots.two; break;
        case 3: slotArray = slots.three; break;
        case 4: slotArray = slots.four; break;
        default: return false;
      }
      if (!slotArray || !Array.isArray(slotArray) || slotArray.length === 0) return false;
      return slotArray.includes(1);
    },

    getSpellCount(level) {
      if (!this.currentPlayer || !this.currentPlayer.isInit || !this.currentPlayer.spells) return 0;
      return this.currentPlayer.spells.filter(s => s.level === level).length;
    },

    openSpellsModal(level) {
      if (!this.isSlotAvailable(level)) return;
      this.selectedSpellLevel = level;
      this.showSpellsModal = true;
    },

    closeSpellsModal() {
      this.showSpellsModal = false;
    },

    useSpell(spell) {
      this.newMessage = `Я использую "${spell.title}"`;
      this.closeSpellsModal();
      this.$nextTick(() => {
        this.$refs.messageInput?.focus();
      });
    },

    showError(message) {
      this.errorMessage = message;
      this.showErrorModal = true;
    },

    closeErrorModal() {
      this.showErrorModal = false;
      this.errorMessage = '';
    },

    showGameEnd(isVictory, message) {
      this.gameEndIsVictory = isVictory;
      this.gameEndMessage = message || (isVictory ? 'Ваше приключение завершилось триумфом!' : 'Тьма поглотила вас...');
      this.showGameEndModal = true;
    },

    goToHome() {
      this.$router.push('/');
    },

    showHealthChangeEffect(modification) {
      if (modification && modification !== 0) {
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
          gamer_id: this.currentPlayerId,
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

      const actionsData = this.$store.getters.ACTIONS;

      if (actionsData && actionsData.reaction) {
        this.addAIMessage(actionsData.reaction, false, true);
      }

      if (actionsData && actionsData.battle) {
        this.updateEnemies(actionsData.battle);
      }

      if (actionsData && actionsData.healthModification !== null && actionsData.healthModification !== undefined && actionsData.healthModification !== 0) {
        this.showHealthChangeEffect(actionsData.healthModification);

        if (this.currentPlayer) {
          const currentHealth = this.currentPlayer.health || 0;
          this.currentPlayer.health = Math.max(0, currentHealth + actionsData.healthModification);
        }
      }

      // Обновляем maxHealth и другие данные из state.gamer
      const gamerData = this.$store.getters.GAMER;
      if (gamerData && this.currentPlayer) {
        if (gamerData.maxHealth !== undefined) {
          this.currentPlayer.maxHealth = gamerData.maxHealth;
        }
        if (gamerData.armor !== undefined) {
          this.currentPlayer.armor = gamerData.armor;
        }
        if (gamerData.stats) {
          this.currentPlayer.stats = gamerData.stats;
        }
        if (gamerData.spells) {
          this.currentPlayer.spells = gamerData.spells;
        }
        if (gamerData.spellSlots) {
          this.currentPlayer.spellSlots = gamerData.spellSlots;
        }
        if (gamerData.inventory) {
          this.currentPlayer.inventory = gamerData.inventory;
        }
      }

      if (actionsData && actionsData.isFinal) {
        const isVictory = actionsData.isVictory || false;
        const message = actionsData.finalMessage || '';
        this.showGameEnd(isVictory, message);
      }

      this.checkDiceRequirement();

      if (this.isBattleActive && this.isPlayerTurn && this.waitingForPlayerAction) {
        const actionsAfterCheck = this.$store.getters.ACTIONS;
        if (!actionsAfterCheck || !actionsAfterCheck.requiredRollOfDice) {
          this.waitingForPlayerAction = false;
          this.isPlayerTurn = false;

          setTimeout(() => {
            this.nextTurn();
          }, 500);
        }
      }
    },

    async sendMessage() {
      const text = this.newMessage.trim();
      if (!text || this.isAITyping || this.isInputDisabled) return;

      if (this.isBattleActive && this.isPlayerTurn && this.waitingForPlayerAction) {
        const currentUnit = this.battleOrder[this.currentTurnIndex];
        if (currentUnit && currentUnit.unitType === 'gamer') {
          if (currentUnit.id !== this.currentPlayerId) {
            this.addErrorMessage('Сейчас ход другого игрока. Дождитесь своей очереди!');
            return;
          }
        }
      }

      this.newMessage = '';

      if (this.isInitPhase) {
        await this.sendInitMessage(text);
      } else {
        await this.sendGameMessage(text);
      }

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

      if (player.isInit) {
        this.addAIMessage('Этот игрок уже инициализирован.');
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

        if (data && data.correction && data.correction !== '') {
          this.isAITyping = false;
          this.addCorrectionMessage(data.correction);
          return;
        }

        this.isAITyping = false;

        if (data && data.name) {
          this.$store.commit('setCurrentGamer', player.id);
          this.currentPlayerId = player.id;

          await this.$nextTick();

          const updatedPlayer = this.currentPlayer;
          if (!updatedPlayer) return;

          let statsText = '';
          if (updatedPlayer.stats && Object.keys(updatedPlayer.stats).length) {
            const statNames = {
              strength: 'Сила', dexterity: 'Ловкость', constitution: 'Телосложение',
              intelligence: 'Интеллект', wisdom: 'Мудрость', charisma: 'Харизма'
            };
            statsText = '<br><br><b>📊 Характеристики:</b><br>' +
                Object.entries(updatedPlayer.stats).map(([k, v]) => `${statNames[k] || k}: ${v}`).join('<br>');
          }

          let inventoryText = '';
          if (updatedPlayer.inventory && updatedPlayer.inventory.length) {
            inventoryText = '<br><br><b>🎒 Инвентарь:</b><br>' +
                updatedPlayer.inventory.map(item => `• <b>${item.title}</b> — ${item.description}`).join('<br>');
          }

          this.addSystemMessage(`
            <b>Персонаж создан!</b><br><br>
            <b>Имя:</b> ${updatedPlayer.name}<br>
            <b>Класс:</b> ${updatedPlayer.character || 'Нет'}<br>
            <b>Здоровье:</b> ${updatedPlayer.health || 100} / ${updatedPlayer.maxHealth || 100}<br>
            <b>Броня:</b> ${updatedPlayer.armor || 0}<br><br>
            <b>Описание:</b><br>${updatedPlayer.description || 'Нет'}
            ${statsText}
            ${inventoryText}
          `);

          const nextNotInit = this.players.find(p => !p.isInit);

          if (nextNotInit) {
            this.$store.commit('setCurrentGamer', nextNotInit.id);
            this.currentPlayerId = nextNotInit.id;

            setTimeout(() => {
              this.addAIMessage('Следующий игрок, опишите своего персонажа!');
            }, 500);
          } else {
            this.isInitPhase = false;

            if (this.players.length > 0) {
              this.$store.commit('setCurrentGamer', this.players[0].id);
              this.currentPlayerId = this.players[0].id;
            }

            if (this.isNewGame) {
              setTimeout(() => this.startGame(), 500);
            } else {
              if (this.briefRetellingMessageId !== null) {
                const index = this.messages.findIndex(m => m.id === this.briefRetellingMessageId);
                if (index !== -1) {
                  this.messages.splice(index, 1);
                }
                this.briefRetellingMessageId = null;
              }

              setTimeout(() => this.startGame(), 500);
            }
          }
        }
      } catch (err) {
        this.isAITyping = false;
        this.showError('Ошибка при создании персонажа. Попробуйте ещё раз.');
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
        this.showError('Ошибка при старте игры.');
        console.error(err);
      }
    },

    async sendGameMessage(text) {
      const player = this.currentPlayer;
      if (!player || !player.name) {
        this.showError('Пожалуйста, выберите игрока слева перед отправкой.');
        return;
      }

      if (this.isFirstAction) {
        this.showDivider = false;
        this.isFirstAction = false;
      }

      this.addPlayerMessage(player, text, true);

      this.isAITyping = true;
      try {
        const form = {
          gamer_id: player.id,
          action: text
        };

        await this.$store.dispatch('action', form);
        const actionsData = this.$store.getters.ACTIONS;

        this.isAITyping = false;

        if (actionsData && actionsData.error && actionsData.error !== null && actionsData.error !== '') {
          this.showError(actionsData.error);
          return;
        }

        if (actionsData && actionsData.reaction) {
          this.addAIMessage(actionsData.reaction, false, true);
        }

        if (actionsData && actionsData.battle) {
          this.updateEnemies(actionsData.battle);
        }

        this.checkDiceRequirement();

        if (this.isBattleActive && this.isPlayerTurn && this.waitingForPlayerAction) {
          const actionsAfterCheck = this.$store.getters.ACTIONS;
          if (!actionsAfterCheck || !actionsAfterCheck.requiredRollOfDice) {
            this.waitingForPlayerAction = false;
            this.isPlayerTurn = false;

            setTimeout(() => {
              this.nextTurn();
            }, 500);
          }
        }

        if (actionsData && actionsData.healthModification !== null && actionsData.healthModification !== undefined && actionsData.healthModification !== 0) {
          const currentHealth = player.health || 0;
          player.health = Math.max(0, currentHealth + actionsData.healthModification);
          this.showHealthChangeEffect(actionsData.healthModification);
        }

        // Обновляем maxHealth и другие данные из state.gamer
        const gamerData = this.$store.getters.GAMER;
        if (gamerData) {
          if (gamerData.maxHealth !== undefined) {
            player.maxHealth = gamerData.maxHealth;
          }
          if (gamerData.armor !== undefined) {
            player.armor = gamerData.armor;
          }
          if (gamerData.stats) {
            player.stats = gamerData.stats;
          }
          if (gamerData.spells) {
            player.spells = gamerData.spells;
          }
          if (gamerData.spellSlots) {
            player.spellSlots = gamerData.spellSlots;
          }
          if (gamerData.inventory) {
            player.inventory = gamerData.inventory;
          }
        }

        if (actionsData && actionsData.isFinal) {
          const isVictory = actionsData.isVictory || false;
          const message = actionsData.finalMessage || '';
          this.showGameEnd(isVictory, message);
        }
      } catch (err) {
        this.isAITyping = false;
        this.showError('Ошибка. Попробуйте ещё раз.');
        console.error(err);
      }
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
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
/* === МОДАЛЬНОЕ ОКНО ОКОНЧАНИЯ ИГРЫ === */
.game-end-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(16px);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease;
}

.game-end-modal {
  position: relative;
  border-radius: 32px;
  padding: 48px 40px 36px;
  text-align: center;
  max-width: 460px;
  width: 90%;
  animation: gameEndPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.game-end-modal.victory {
  background: linear-gradient(160deg, #1A2A15, #0F1A0A);
  border: 2px solid rgba(200, 180, 60, 0.5);
  box-shadow:
      0 0 80px rgba(200, 180, 60, 0.25),
      0 0 160px rgba(255, 215, 0, 0.1),
      0 20px 50px rgba(0, 0, 0, 0.6);
}

.game-end-modal.defeat {
  background: linear-gradient(160deg, #1A1015, #0F0A10);
  border: 2px solid rgba(255, 60, 60, 0.5);
  box-shadow:
      0 0 80px rgba(255, 60, 60, 0.25),
      0 0 160px rgba(255, 30, 30, 0.1),
      0 20px 50px rgba(0, 0, 0, 0.6);
}

.game-end-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
}

.victory .game-end-glow {
  background: radial-gradient(circle at center, rgba(255, 215, 0, 0.08) 0%, transparent 50%);
  animation: victoryGlow 3s ease-in-out infinite;
}

.defeat .game-end-glow {
  background: radial-gradient(circle at center, rgba(255, 40, 40, 0.08) 0%, transparent 50%);
  animation: defeatGlow 3s ease-in-out infinite;
}

@keyframes victoryGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes defeatGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.game-end-content {
  position: relative;
  z-index: 1;
}

.game-end-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: iconBounce 2s infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.game-end-title {
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 4px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.victory .game-end-title {
  color: #FFD700;
  text-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
}

.defeat .game-end-title {
  color: #FF4444;
  text-shadow: 0 0 40px rgba(255, 60, 60, 0.6);
}

.game-end-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 0 10px;
}

.victory .game-end-text {
  color: #C8D8A0;
}

.defeat .game-end-text {
  color: #D0A0A0;
}

.game-end-divider {
  width: 80px;
  height: 2px;
  margin: 0 auto 24px;
}

.victory .game-end-divider {
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent);
}

.defeat .game-end-divider {
  background: linear-gradient(90deg, transparent, rgba(255, 80, 80, 0.5), transparent);
}

.game-end-btn {
  padding: 16px 44px;
  border: none;
  border-radius: 40px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  width: 100%;
}

.victory .game-end-btn {
  background: linear-gradient(145deg, #C8A84B, #A08830);
  color: #1A1A2E;
  box-shadow: 0 4px 20px rgba(200, 168, 75, 0.4);
}

.victory .game-end-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(200, 168, 75, 0.6);
  background: linear-gradient(145deg, #D8B860, #B09840);
}

.defeat .game-end-btn {
  background: linear-gradient(145deg, #8B3030, #5A2020);
  color: #FFB0B0;
  box-shadow: 0 4px 20px rgba(255, 40, 40, 0.25);
}

.defeat .game-end-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 60, 60, 0.4);
  background: linear-gradient(145deg, #A04040, #703030);
}

.game-end-arrow {
  font-size: 20px;
  transition: transform 0.3s;
}

.game-end-btn:hover .game-end-arrow {
  transform: translateX(4px);
}

@keyframes gameEndPop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* === МОДАЛЬНОЕ ОКНО ОШИБКИ === */
.error-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.error-modal {
  position: relative;
  background: linear-gradient(160deg, #1A1015, #0F0A10);
  border-radius: 28px;
  padding: 48px 36px 32px;
  text-align: center;
  box-shadow:
      0 0 80px rgba(255, 60, 60, 0.25),
      0 0 160px rgba(255, 30, 30, 0.12),
      0 20px 50px rgba(0, 0, 0, 0.6);
  max-width: 440px;
  width: 90%;
  animation: errorPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.error-modal-border {
  position: absolute;
  inset: 0;
  border-radius: 28px;
  padding: 2px;
  background: linear-gradient(135deg,
  rgba(255, 80, 80, 0.6),
  rgba(255, 30, 30, 0.3),
  rgba(200, 100, 50, 0.5),
  rgba(255, 60, 60, 0.4)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: borderGlow 2s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.error-modal-content {
  position: relative;
  z-index: 1;
}

.error-modal-icon-container {
  margin-bottom: 20px;
}

.error-modal-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: radial-gradient(circle, rgba(255, 60, 60, 0.25), rgba(255, 30, 30, 0.08));
  border: 2px solid rgba(255, 80, 80, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  animation: errorPulse 2s infinite;
  box-shadow: 0 0 40px rgba(255, 40, 40, 0.3);
}

@keyframes errorPulse {
  0%, 100% {
    box-shadow: 0 0 40px rgba(255, 40, 40, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 60px rgba(255, 60, 60, 0.5);
    transform: scale(1.05);
  }
}

.error-modal-title {
  font-size: 26px;
  font-weight: 800;
  color: #FF5555;
  letter-spacing: 3px;
  margin-bottom: 16px;
  text-shadow: 0 0 30px rgba(255, 60, 60, 0.5);
  text-transform: uppercase;
}

.error-modal-text {
  font-size: 15px;
  color: #D0A0A0;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 0 10px;
}

.error-modal-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 80, 80, 0.5), transparent);
  margin: 0 auto 24px;
}

.error-close-btn {
  padding: 14px 40px;
  background: linear-gradient(145deg, #8B3030, #5A2020);
  border: 1px solid rgba(255, 80, 80, 0.4);
  border-radius: 40px;
  color: #FFB0B0;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 40, 40, 0.25);
  width: 100%;
}

.error-close-btn:hover {
  background: linear-gradient(145deg, #A04040, #703030);
  border-color: rgba(255, 100, 100, 0.6);
  color: #FFD0D0;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 60, 60, 0.4);
}

.error-btn-arrow {
  font-size: 18px;
  transition: transform 0.3s;
}

.error-close-btn:hover .error-btn-arrow {
  transform: translateX(4px);
}

@keyframes errorPop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* === ЭКРАН ЗАГРУЗКИ НАЧАЛА БОЯ === */
.battle-loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(16px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.battle-loading-content {
  text-align: center;
  padding: 48px;
}

.battle-loading-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: battleIconPulse 1.5s ease-in-out infinite;
}

@keyframes battleIconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.battle-loading-title {
  font-size: 32px;
  font-weight: 800;
  color: #FF6060;
  letter-spacing: 4px;
  margin-bottom: 16px;
  text-shadow: 0 0 40px rgba(255, 80, 80, 0.5);
}

.battle-loading-text {
  font-size: 16px;
  color: #A0A8B8;
  margin-bottom: 32px;
}

.battle-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 100, 100, 0.2);
  border-top-color: #FF6060;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === МОДАЛКА ИНИЦИАТИВЫ === */
.initiative-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 350;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s ease;
}

.initiative-modal {
  background: linear-gradient(160deg, #1A1A2E, #0F0F1A);
  border: 2px solid rgba(100, 180, 255, 0.3);
  border-radius: 24px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: initiativePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 0 60px rgba(80, 140, 255, 0.2), 0 20px 50px rgba(0, 0, 0, 0.5);
}

@keyframes initiativePop {
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.initiative-modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 800;
  color: #60B0FF;
  letter-spacing: 3px;
  margin-bottom: 8px;
  text-shadow: 0 0 30px rgba(80, 160, 255, 0.5);
}

.initiative-subtitle {
  text-align: center;
  color: #8090A0;
  font-size: 14px;
  margin-bottom: 24px;
}

.initiative-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.initiative-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s;
}

.initiative-item.initiative-first {
  background: rgba(255, 200, 80, 0.1);
  border-color: rgba(255, 180, 60, 0.4);
  box-shadow: 0 0 20px rgba(255, 180, 60, 0.15);
}

.initiative-item.initiative-player {
  border-left: 3px solid #5B8CBE;
}

.initiative-item.initiative-npc {
  border-left: 3px solid #BE5B5B;
}

.initiative-position {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  color: #A0B0C0;
}

.initiative-first .initiative-position {
  background: linear-gradient(145deg, #FFB040, #FF8000);
  color: #1A1A2E;
}

.initiative-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 24px;
}

.initiative-info {
  flex: 1;
}

.initiative-name {
  font-weight: 700;
  font-size: 15px;
  color: #E0E8F0;
  margin-bottom: 2px;
}

.initiative-type {
  font-size: 12px;
  color: #708090;
}

.initiative-roll {
  display: flex;
  align-items: center;
  gap: 10px;
}

.initiative-dice {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dice-label {
  font-size: 10px;
  color: #607080;
  text-transform: uppercase;
}

.dice-value {
  font-size: 18px;
  font-weight: 700;
  color: #A0B8D8;
}

.initiative-bonus {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bonus-label {
  font-size: 14px;
  font-weight: 600;
  color: #40C080;
}

.bonus-stat {
  font-size: 10px;
  color: #607080;
}

.initiative-total {
  min-width: 40px;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #60B0FF;
  padding: 6px 10px;
  background: rgba(80, 160, 255, 0.1);
  border-radius: 8px;
}

.initiative-first .initiative-total {
  background: rgba(255, 180, 60, 0.2);
  color: #FFB040;
}

.initiative-close-btn {
  padding: 14px 40px;
  background: linear-gradient(145deg, #3060A0, #204080);
  border: 1px solid rgba(80, 140, 255, 0.4);
  border-radius: 40px;
  color: #E0F0FF;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(40, 80, 160, 0.3);
  width: 100%;
}

.initiative-close-btn:hover {
  background: linear-gradient(145deg, #4080D0, #3060A0);
  border-color: rgba(100, 160, 255, 0.6);
  color: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(60, 100, 200, 0.4);
}

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

/* === ОКНО СКИЛЛОВ === */
.spells-modal-overlay {
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

.spells-modal {
  background: linear-gradient(145deg, #1A2535, #0F1925);
  border: 2px solid #7B6FB0;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 0 60px rgba(123, 111, 176, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 90%;
  max-height: 70vh;
  overflow-y: auto;
  animation: modalPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.spells-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #C8B8F0;
  letter-spacing: 2px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #3A4A6A;
}

.spells-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(100, 90, 140, 0.3);
  border: 1px solid #5A4A8A;
  color: #A0B0D0;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.spells-close-btn:hover {
  background: rgba(140, 120, 200, 0.4);
  border-color: #7B6FB0;
  color: #D8D0F0;
}

.spells-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spell-card {
  background: rgba(30, 40, 60, 0.5);
  border: 1px solid #3A4A6A;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.spell-card:hover {
  border-color: #7B6FB0;
  background: rgba(50, 40, 80, 0.5);
  box-shadow: 0 0 20px rgba(123, 111, 176, 0.15);
  transform: translateY(-2px);
}

.spell-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.spell-title {
  color: #D8C8F0;
  font-size: 16px;
  font-weight: 600;
}

.spell-level {
  background: rgba(123, 111, 176, 0.3);
  border: 1px solid #7B6FB0;
  border-radius: 20px;
  padding: 2px 12px;
  color: #B0A0D8;
  font-size: 11px;
  font-weight: 600;
}

.spell-description {
  color: #8090B0;
  font-size: 13px;
  line-height: 1.5;
}

.spells-empty {
  text-align: center;
  padding: 30px;
  color: #607090;
  font-size: 14px;
}

/* === СЛОТЫ ЗАКЛИНАНИЙ === */
.spell-slots-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid #3A4A6A;
  border-radius: 12px;
  padding: 12px;
}

.spell-slots-title {
  color: #A090D0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}

.spell-slots-row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.spell-slot {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #3A4A6A;
}

.spell-slot.slot-available {
  background: rgba(100, 80, 160, 0.3);
  border-color: #7B6FB0;
  box-shadow: 0 0 15px rgba(123, 111, 176, 0.2);
}

.spell-slot.slot-available:hover {
  background: rgba(140, 110, 220, 0.5);
  border-color: #A090D0;
  box-shadow: 0 0 25px rgba(123, 111, 176, 0.4);
  transform: translateY(-2px);
}

.spell-slot.slot-empty {
  background: rgba(30, 30, 40, 0.4);
  border-color: #2A2A3A;
  cursor: not-allowed;
  opacity: 0.5;
}

.slot-number {
  font-size: 18px;
  font-weight: 700;
  color: #D8D0F0;
}

.slot-count {
  font-size: 11px;
  font-weight: 600;
}

.slot-available .slot-count {
  color: #8BFF8B;
}

.slot-empty .slot-count {
  color: #606060;
}

/* === БРОНЯ В БЛОКЕ ЗДОРОВЬЯ === */
.health-armor-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid #3A4A6A;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  position: relative;
}

.health-main {
  flex: 1;
  min-width: 0;
}

.health-title {
  color: #BE5B5B;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.health-bar-container {
  width: 100%;
  height: 14px;
  background: #1A2535;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
}

.health-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.health-good { background: linear-gradient(90deg, #5B9E6B, #7BC87B); }
.health-medium { background: linear-gradient(90deg, #C8A84B, #D8C870); }
.health-low { background: linear-gradient(90deg, #C85B4B, #E0705B); animation: pulse-health 1s infinite; }
@keyframes pulse-health {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.health-text {
  color: #A0B0C0;
  font-size: 11px;
}

.armor-mini {
  position: absolute;
  top: 11px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.armor-mini-icon {
  font-size: 12px;
}

.armor-mini-value {
  color: #C8B060;
  font-size: 13px;
  font-weight: 700;
}

/* Инвентарь */
.inventory-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid #3A4A6A;
  border-radius: 12px;
  padding: 12px;
}
.inventory-title {
  color: #C8B060;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}
.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}
.inventory-item {
  background: rgba(30, 40, 60, 0.5);
  border-radius: 8px;
  padding: 8px 10px;
}
.item-title {
  color: #D8C880;
  font-size: 12px;
  font-weight: 600;
}
.item-desc {
  color: #8090B0;
  font-size: 10px;
  margin-top: 2px;
  line-height: 1.3;
}

/* Статы */
.stats-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid #3A4A6A;
  border-radius: 12px;
  padding: 12px;
}
.stats-title {
  color: #7B8FC0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(30, 40, 60, 0.3);
  border-radius: 6px;
  color: #A0B8D8;
  font-size: 11px;
}
.stat-row span:last-child {
  color: #C8D8F0;
  font-weight: 600;
}

/* === КОМПАКТНЫЙ СПИСОК ИГРОКОВ === */
.players-compact-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.player-compact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(20, 28, 45, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.player-compact-item:hover {
  background: rgba(40, 50, 80, 0.6);
  border-color: #4A5A8A;
}

.player-compact-item.is-current {
  background: rgba(91, 110, 154, 0.25);
  border-color: #5B6E9A;
}

.player-compact-item.is-initialized {
  border-left: 2px solid #6B9E7A;
}

.player-compact-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.player-compact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-compact-name {
  font-weight: 600;
  color: #E0E8FF;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-compact-bars {
  width: 100%;
}

.mini-hp-bar {
  width: 100%;
  height: 4px;
  background: #1A2535;
  border-radius: 2px;
  overflow: hidden;
}

.mini-hp-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.mini-hp-fill.health-good { background: #5B9E6B; }
.mini-hp-fill.health-medium { background: #C8A84B; }
.mini-hp-fill.health-low { background: #C85B4B; }

.player-compact-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 10px;
  flex-shrink: 0;
}

.compact-hp {
  color: #BE5B5B;
  font-weight: 600;
}

.player-indicator {
  color: #7B6FB0;
  font-size: 14px;
  flex-shrink: 0;
  margin-left: 4px;
}

/* Детальная информация */
.player-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid #2A3550;
}

.player-not-init {
  text-align: center;
  padding: 20px;
  color: #607090;
  font-size: 13px;
  font-style: italic;
}

.current-player-info {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #2A3550;
}

.info-label {
  font-size: 11px;
  color: #7080A0;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}

.current-player {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #C8D0E8;
  font-size: 15px;
  font-weight: 500;
}

.player-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
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

.master-status.battle-active {
  background: rgba(180, 60, 60, 0.25);
  border-color: rgba(255, 80, 80, 0.4);
  color: #FFB0B0;
}

.battle-indicator {
  font-size: 14px;
  animation: battlePulse 1s infinite;
}

@keyframes battlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

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
  width: 280px;
  background: rgba(8, 12, 20, 0.85);
  backdrop-filter: blur(12px);
  border-right: 1px solid #2A3550;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: transform 0.3s ease;
  z-index: 20;
  overflow-y: auto;
}

.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.panel-close {
  display: none; background: transparent; border: 1px solid #5A5A7A;
  border-radius: 10px; width: 36px; height: 36px; font-size: 20px;
  color: #A0B0D0; cursor: pointer; align-items: center; justify-content: center;
}

.panel-title {
  display: flex; align-items: center; gap: 10px;
  color: #A0B0D0; font-size: 14px; font-weight: 600;
  letter-spacing: 2px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2A3550;
  margin-bottom: 12px;
}
.player-count { margin-left: auto; background: #1E2840; padding: 2px 10px; border-radius: 20px; font-size: 12px; }

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

.typing-npc {
  background: rgba(80, 40, 40, 0.3);
  border: 1px solid rgba(180, 80, 80, 0.3);
  color: #E08080;
}

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
.message-input:disabled { opacity: 0.5; cursor: not-allowed; }
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

/* === ПРАВАЯ ПАНЕЛЬ: ВРАГИ === */
.enemies-panel {
  width: 240px;
  background: rgba(8, 12, 20, 0.85);
  backdrop-filter: blur(12px);
  border-left: 1px solid #2A3550;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
  overflow-y: auto;
  animation: slideInRight 0.4s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.enemies-header {
  margin-bottom: 4px;
}

.enemies-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #E08060;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3A2020;
}

.enemy-count {
  margin-left: auto;
  background: #2A1010;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #E08060;
}

.enemies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enemy-card {
  background: linear-gradient(145deg, #1A0A0A, #0F0505);
  border: 1px solid #3A1515;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.enemy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(200, 60, 30, 0.08), transparent 50%);
  pointer-events: none;
}

.enemy-card:hover {
  border-color: #5A2020;
  box-shadow: 0 0 20px rgba(200, 60, 30, 0.15);
  transform: translateY(-1px);
}

.enemy-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(200, 60, 30, 0.15);
  border: 1px solid #5A2020;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.enemy-info {
  flex: 1;
  min-width: 0;
}

.enemy-name {
  font-weight: 600;
  color: #E0A080;
  font-size: 14px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.enemy-hp-bar-container {
  width: 100%;
  height: 6px;
  background: #1A0A0A;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.enemy-hp-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.enemy-hp-bar.health-good { background: linear-gradient(90deg, #8B3A3A, #C85B4B); }
.enemy-hp-bar.health-medium { background: linear-gradient(90deg, #C8704B, #E0805B); }
.enemy-hp-bar.health-low { background: linear-gradient(90deg, #C83A2B, #E04030); animation: enemyPulse 1s infinite; }

@keyframes enemyPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.enemy-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
}

.enemy-hp {
  color: #C86050;
  font-weight: 600;
}

.enemy-armor {
  color: #B0A080;
  font-weight: 600;
}

/* Адаптивность для врагов */
@media (max-width: 900px) {
  .enemies-panel {
    width: 200px;
    padding: 14px 10px;
  }
  .enemy-card {
    padding: 10px;
  }
  .enemy-avatar {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
  .enemy-name {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .enemies-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 240px;
    transform: translateX(100%);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    border-left: 1px solid #3A4A6A;
    z-index: 25;
  }
}

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
  .player-compact-avatar { width: 32px; height: 32px; font-size: 14px; }
  .player-compact-name { font-size: 12px; }
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
  .spell-slot { width: 44px; height: 44px; }
  .slot-number { font-size: 16px; }
  .error-modal { padding: 36px 24px 24px; }
  .error-modal-title { font-size: 22px; }
  .error-modal-icon { width: 64px; height: 64px; font-size: 28px; }
  .game-end-modal { padding: 36px 24px 24px; }
  .game-end-title { font-size: 28px; }
  .game-end-icon { font-size: 60px; }
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
