# AGENTS.md — Документация для AI-агентов

## Обзор проекта

**MAUPORIA** — это веб-приложение для текстовых ролевых игр с использованием нейросетей. Проект представляет собой виртуального мастера подземелий, который генерирует уникальные сюжеты, диалоги и игровые ситуации в реальном времени.

### Ключевые возможности

- Создание игровых миров с помощью нейросетей
- Генерация уникальных сюжетов в реальном времени
- Система бросков кубиков (d4, d6, d8, d10, d12, d20, d100)
- Управление персонажами (статы, здоровье, заклинания, инвентарь)
- Боевая система с врагами
- Асинхронный чат с виртуальным мастером

---

## Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| Vue.js | ^3.5.32 | Фреймворк для построения UI |
| Vuex | ^4.1.0 | Менеджмент состояния |
| Vue Router | ^5.0.4 | Маршрутизация |
| Axios | ^1.15.1 | HTTP-клиент для API |
| Vite | ^8.0.8 | Сборщик и dev-сервер |

### Требования

- Node.js: ^20.19.0 || >=22.12.0

---

## Структура проекта

```
frontend/
├── src/
│   ├── components/          # Vue-компоненты
│   │   ├── MainComponent.vue
│   │   ├── GameComponent.vue
│   │   ├── FormCreateNewWorldComponent.vue
│   │   ├── RegistrationComponent.vue
│   │   └── WorldsComponent.vue
│   ├── router/
│   │   └── index.js          # Конфигурация маршрутов
│   ├── store/
│   │   ├── index.js          # Главный store
│   │   ├── modules/
│   │   │   └── game/
│   │   │       └── game.state.js
│   │   └── models/           # Модели данных
│   │       ├── Action.js
│   │       ├── Dice.js
│   │       ├── Game.js
│   │       ├── Gamers.js
│   │       └── Worlds.js
│   ├── assets/
│   │   └── img/
│   │       └── logo.png
│   ├── App.vue               # Корневой компонент
│   └── main.js               # Точка входа
├── index.html
├── package.json
├── vite.config.js
└── AGENTS.md
```

---

## Маршрутизация

Файл: [`src/router/index.js`](frontend/src/router/index.js:1)

| Маршрут | Компонент | Описание |
|---------|-----------|----------|
| `/` | MainComponent | Главная страница с выбором мира |
| `/form` | FormCreateNewWorldComponent | Форма создания новой игры |
| `/registration` | RegistrationComponent | Регистрация пользователя |
| `/:uuid/game` | GameComponent | Игровой процесс |
| `/worlds` | WorldsComponent | Список миров |

---

## Компоненты

### MainComponent.vue

Главная страница приложения. Отображает:
- Логотип и бренд MAUPORIA
- Карточки с доступными мирами (Эхо Андромеды, Древний Лес, Кибер-Нексус, Проклятые Земли)
- Динамические примеры сюжетов от нейромастера
- Кнопки навигации

**Ключевые методы:**
- `newGame()` — переход к созданию игры (`/form`)
- `clickWorlds()` — переход к списку миров (`/worlds`)
- `refreshStory()` — обновление примера сюжета
- `playDemo()` — запуск демо-приключения

---

### GameComponent.vue

Основной игровой компонент (3036 строк). Включает:

**Левая панель — Участники:**
- Список игроков с аватарами
- Индикатор здоровья (HP)
- Броня
- Слоты заклинаний (I-IV уровни)
- Инвентарь
- Характеристики (Сила, Ловкость, Телосложение, Интеллект, Мудрость, Харизма)

**Центральная часть — Чат:**
- Сеттинг и главная цель
- Сообщения от ИИ и игроков
- Индикатор "печати" нейромастера

**Правая панель — Враги:**
- Список врагов с HP и броней

**Модальные окна:**
- Результат броска кубика
- Ошибки
- Окончание игры (победа/поражение)
- Список заклинаний

**Кнопки кубиков:** d4, d6, d8, d10, d12, d20, d100

---

### FormCreateNewWorldComponent.vue

Форма создания нового приключения:
- Название экспедиции
- Количество игроков (1-10)
- Анимация загрузки при создании
- Интеграция с Vuex store (`createGame` action)

---

### RegistrationComponent.vue

Форма регистрации:
- Имя пользователя
- Email
- Пароль + подтверждение
- Чекбокс согласия
- OAuth через Яндекс ID
- Валидация формы

---

### WorldsComponent.vue

Заглушка (пустой компонент) — для списка созданных миров.

---

## Store (Vuex)

### Главный файл

[`src/store/index.js`](frontend/src/store/index.js:1)

```javascript
import { createStore } from 'vuex';
import GameState from "@/store/modules/game/game.state.js";

const store = createStore({
    modules: {
        GameState
    }
})
```

### Game State

[`src/store/modules/game/game.state.js`](frontend/src/store/modules/game/game.state.js:1)

**State:**
```javascript
{
    game: null,      // Текущая игра
    gamer: null,     // Текущий игрок
    actions: null,   // Действия/ответы
    dice: null       // Результаты бросков
}
```

**Getters:**
- `GAME` — получить текущую игру
- `GAMER` — получить текущего игрока
- `ACTIONS` — получить действия
- `DICE` — получить результаты кубиков

**Mutations:**
- `setGame` — установить игру
- `setGamer` — установить игрока
- `setStart` — установить стартовое сообщение
- `setAction` — установить действие (ответ ИИ)
- `setDice` — установить результат броска

**Actions:**
- `createGame(data)` — создать новую игру
- `startGame(id)` — начать игру
- `initGamers(data)` — инициализировать игроков
- `action(data)` — отправить действие игрока
- `dice(data)` — бросить кубик

---

## Модели данных

### Game.js

[`src/store/models/Game.js`](frontend/src/store/models/Game.js:1)

```javascript
class Game {
    id              // ID игры
    name            // Название
    countGamer      // Количество игроков
    context         // Сеттинг/контекст
    gamerIds        // ID игроков
    goal            // Главная цель
    startMess       // Стартовое сообщение
}
```

### Gamers.js

[`src/store/models/Gamers.js`](frontend/src/store/models/Gamers.js:1)

```javascript
class Gamers {
    id              // ID игрока
    name            // Имя персонажа
    class           // Класс
    description     // Описание
    stats           // Статы (сила, ловкость и т.д.)
    health          // Текущее здоровье
    maxHealth       // Максимальное здоровье
    armor           // Броня
    spellSlots      // Слоты заклинаний
    spells          // Список заклинаний
    inventory       // Инвентарь
}
```

### Action.js

[`src/store/models/Action.js`](frontend/src/store/models/Action.js:1)

```javascript
class Action {
    reaction                // Ответ ИИ
    healthModification      // Изменение здоровья
    requiredRollOfDice      // Требуемый бросок
    isFinal                 // Финал игры
    isVictory               // Победа?
    error                   // Ошибка
    battle                  // Боевая система
}
```

### Dice.js

[`src/store/models/Dice.js`](frontend/src/store/models/Dice.js:1)

```javascript
class Dice {
    diceResult   // Результат броска
    bonus        // Бонус к броску
    result       // Итоговый результат
}
```

### Worlds.js

[`src/store/models/Worlds.js`](frontend/src/store/models/Worlds.js:1)

```javascript
class World {
    id
    name
    context
    goal
    countGamer
    gamerIds
}
```

---

## API-интеграция

Базовый URL: `http://localhost:7777`

Настройка в [`src/main.js`](frontend/src/main.js:1):
```javascript
axios.defaults.baseURL = 'http://localhost:7777';
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/v1/games` | Создание игры |
| POST | `/api/v1/games/:id/start` | Запуск игры |
| PUT | `/api/v1/gamers` | Инициализация игрока |
| POST | `/api/v1/actions` | Отправка действия |
| POST | `/api/v1/actions/roll-dice` | Бросок кубика |

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для продакшена |
| `npm run preview` | Превью продакшн-сборки |

---

## Конфигурация Vite

[`vite.config.js`](frontend/vite.config.js:1)

```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

---

## Рекомендации для AI-агентов

### При добавлении новых компонентов

1. Создайте компонент в [`src/components/`](frontend/src/components/)
2. Добавьте маршрут в [`src/router/index.js`](frontend/src/router/index.js:1)
3. При необходимости добавьте state в Vuex store

### При работе с API

1. Используйте axios из `@/store/modules/game/game.state.js` как пример
2. Все API-запросы должны быть асинхронными (async/await)
3. Обрабатывайте ошибки в блоках try/catch

### При работе со стилями

- Используйте scoped-стили в компонентах
- Следуйте существующему дизайн-систему (космическая тема, неоновые цвета)
- Используйте CSS-переменные для цветов

### Тестирование

- Проверяйте совместимость с Vue 3 Composition API
- Убедитесь, что все маршруты работают
- Проверяйте интеграцию с API (требуется запущенный backend на порту 7777)

---

## Запуск проекта

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173` (по умолчанию для Vite)
