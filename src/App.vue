<template>
  <div class="app">
    <!-- Фоновые элементы для атмосферы -->
    <div class="background-elements">
      <div class="moon"></div>
      <div class="stars"></div>
      <div class="totem-1">🐺</div>
      <div class="totem-2">🦅</div>
      <div class="totem-3">🐻</div>
    </div>

    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🌀</span>
          <h1 class="title">Шаманский Гороскоп</h1>
        </div>
        <p class="subtitle">Древняя мудрость животных, стихий и луны</p>
        
        <!-- Информация о текущем годе -->
        <div class="current-year-info" v-if="currentYearInfo">
          <div class="current-year-card">
            <div class="current-year-title">
              Текущий год
            </div>
            <div class="current-year-details">
              <span class="current-year-item">{{ currentYearInfo.animal }}</span>
              <span class="current-year-item">{{ currentYearInfo.element }}</span>
              <span class="current-year-item">{{ currentYearInfo.character }}</span>
              <span class="current-year-item">{{ currentYearInfo.mengi }}</span>
            </div>
            <div class="current-year-end">
              <span class="days-left">Продлится до {{ currentYearInfo.endDate }} (осталось {{ currentYearInfo.daysLeft }} дней)</span>
            </div>
          </div>
        </div>

        <div class="header-decoration">
          <span class="decoration">🌳</span>
          <span class="decoration">🔥</span>
          <span class="decoration">💧</span>
          <span class="decoration">⛰️</span>
          <span class="decoration">⚙️</span>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Левая часть - форма -->
      <div class="form-section">
        <div class="form-card shaman-card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="icon">🌙</span>
              Выбери дату рождения
            </h2>
            <div class="card-subtitle">Пусть духи укажут твой путь</div>
          </div>
          
          <div class="form-content">
            <!-- Поле выбора даты -->
            <div class="input-container">
              <div class="input-label">
                <span class="label-icon">📅</span>
                Дата рождения
              </div>
              <input 
                type="date" 
                v-model="testDate"
                class="shaman-input"
              />
              <div class="input-note">Выбери день, когда ты пришел в этот мир</div>
            </div>
            
            <!-- Кнопка расчета -->
            <button @click="calculate" class="shaman-button">
              <span class="button-icon">🔮</span>
              <span class="button-text">Раскрыть тайны судьбы</span>
              <span class="button-arrow">→</span>
            </button>
            
            <!-- История запросов -->
            <div class="history-section" v-if="history.length > 0">
              <div class="history-header">
                <span class="history-icon">📜</span>
                <h3 class="history-title">История запросов</h3>
                <button 
                  @click="clearHistory" 
                  class="clear-history-btn" 
                  title="Очистить историю"
                >
                  🗑️
                </button>
              </div>
              
              <div class="history-items">
                <div 
                  v-for="item in history" 
                  :key="item.id"
                  class="history-item"
                  @click="loadFromHistory(item.birthDate)"
                >
                  <div class="history-date">{{ item.formattedDate }}</div>
                  <div class="history-details">
                    <span class="history-animal">{{ item.animal }}</span>
                    <span class="history-period">{{ item.period }}</span>
                  </div>
                  <button 
                    @click.stop="removeFromHistory(item.id)"
                    class="history-remove"
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Сообщение если история пуста -->
            <div v-else class="empty-history">
              <div class="empty-history-content">
                <span class="empty-history-icon">📜</span>
                <p class="empty-history-text">Здесь будет появляться история ваших запросов</p>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="footer-text">
              <span class="footer-icon">🕯️</span>
              Мудрость предков говорит через даты
            </div>
          </div>
        </div>
      </div>

      <!-- Правая часть - результаты -->
      <div class="results-section" v-if="result">
        <div class="results-card shaman-card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="icon">✨</span>
              Твои духовные знаки
            </h2>
            <div class="card-subtitle">Дата: {{ result.formattedDate }}</div>
          </div>
          
          <div class="results-content">
            <!-- Блок года -->
            <div class="result-block year-block">
              <div class="block-header">
                <h3 class="block-title">
                  {{ result.guardian }}
                </h3>
                <div class="block-subtitle">
                  Год {{ result.year }} • Начало: {{ result.yearStartDateFormatted }} • Конец: {{ result.yearEndDateFormatted }}
                </div>
              </div>
              <div class="block-content">
                <div class="year-grid">
                  <!-- Животное -->
                  <div 
                    class="year-item animal-item" 
                    @click="toggleDescription('animal')"
                    :class="{ 'expanded': expandedDescription === 'animal' }"
                  >
                    <div class="item-label">Животное-покровитель</div>
                    <div class="item-value">{{ result.animal }}</div>
                    <div class="item-icon">{{ getAnimalIcon(result.animal) }}</div>
                    
                    <!-- Описание животного -->
                    <div v-if="expandedDescription === 'animal'" class="item-description">
                      <div class="description-content">
                        {{ animalDescription?.fullDescription || animalDescription?.description }}
                      </div>
                      <button @click.stop="expandedDescription = null" class="close-description-btn">
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <!-- Стихия -->
                  <div 
                    class="year-item element-item" 
                    @click="toggleDescription('element')"
                    :class="{ 'expanded': expandedDescription === 'element' }"
                  > 
                    <div class="item-label">Стихия</div>
                    <div class="item-value">{{ result.element }}</div>
                    <div class="item-icon">{{ getElementIcon(result.element) }}</div>
                    
                    <!-- Описание стихии -->
                    <div v-if="expandedDescription === 'element'" class="item-description">
                      <div class="description-content">
                        {{ elementDescription?.fullDescription || elementDescription?.description }}
                      </div>
                      <button @click.stop="expandedDescription = null" class="close-description-btn">
                        ✕
                      </button>
                    </div>
                  </div>

                  <!-- Характер года -->
                  <div 
                    class="year-item character-item" 
                    @click="toggleDescription('character')"
                    :class="{ 'expanded': expandedDescription === 'character' }"
                  >
                    <div class="item-label">Характер года</div>
                    <div class="item-value">{{ result.character }}</div>
                    <div class="item-icon">🌀</div>
                    
                    <!-- Описание характера -->
                    <div v-if="expandedDescription === 'character'" class="item-description">
                      <div class="description-content">
                        {{ characterDescription?.fullDescription || characterDescription?.description }}
                      </div>
                      <button @click.stop="expandedDescription = null" class="close-description-btn">
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <!-- Менги -->
                  <div 
                    class="year-item mengi-item" 
                    @click="toggleDescription('mengi')"
                    :class="{ 'expanded': expandedDescription === 'mengi' }"
                  >
                    <div class="item-label">Цвет менги</div>
                    <div class="item-value">{{ result.mengi }}</div>
                    <div class="item-icon">🌈</div>
                    
                    <!-- Описание менги -->
                    <div v-if="expandedDescription === 'mengi'" class="item-description">
                      <div class="description-content">
                        {{ mengiDescription?.fullDescription || mengiDescription?.description }}
                      </div>
                      <button @click.stop="expandedDescription = null" class="close-description-btn">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Блок периода -->
            <div class="result-block period-block">
              <div class="block-header">
                <h3 class="block-title">
                  <span class="block-icon">🌙</span>
                  Лунный период
                </h3>
                <div class="block-subtitle">
                  {{ result.periodStartFormatted }} – {{ result.periodEndFormatted }}
                </div>
              </div>
              <div class="block-content">
                <div class="period-info">
                  <div class="period-name">{{ result.period }}</div>
                  <div class="period-days">
                    День {{ result.periodDay }} из {{ result.periodDuration }}
                  </div>
                  
                  <!-- Прогресс-бар периода -->
                  <div class="period-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill"
                        :style="{ width: getProgressWidth(result.periodDay, result.periodDuration) + '%' }"
                      ></div>
                    </div>
                    <div class="progress-labels">
                      <span>Начало</span>
                      <span>Конец</span>
                    </div>
                  </div>

                  <!-- Особые метки -->
                  <div class="period-special">
                    <div v-if="result.isPeakPeriod" class="special-item peak">
                      <span class="special-icon">⚡</span>
                      <span class="special-text">Пик силы</span>
                    </div>
                    <div v-if="result.isOverlapPeriod" class="special-item overlap">
                      <span class="special-icon">🔄</span>
                      <span class="special-text">
                        Наложение миров 
                        <span v-if="result.nextPeriod">
                          → {{ result.nextPeriod.name }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Информационный блок -->
            <div class="info-block">
              <div class="info-content">
                <div class="info-icon">💫</div>
                <div class="info-text">
                  <p>Духи года и периода влияют на твою судьбу,<br>
                  направляя энергию и открывая возможности.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Сообщение если нет результатов -->
      <div v-else class="empty-results">
        <div class="empty-card shaman-card">
          <div class="empty-content">
            <div class="empty-icon">🔮</div>
            <h3 class="empty-title">Выбери дату рождения</h3>
            <p class="empty-text">Духи ждут, чтобы раскрыть твои тайны</p>
          </div>
        </div>
      </div>
    </main>


    <!-- Подвал -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-text">
          <span class="footer-icon">🌿</span>
          Шаманский гороскоп • Мудрость предков • 2026
        </div>
        <div class="footer-note">
          Сила животных, стихий и луны направляет наш путь
        </div>
      </div>
    </footer>
    <InstallPrompt />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { calculationService } from './services/calculationService.js'
import InstallPrompt from './components/InstallPrompt.vue'

const now = new Date()
const testDate = ref(now.toISOString().split('T')[0])
const result = ref(null)
const error = ref('')
const history = ref([])
const expandedDescription = ref(null)
const currentYearInfo = ref(null)

// Вычисляемые свойства для описаний
const animalDescription = computed(() => {
  if (!result.value) return null
  return calculationService.getAnimalDescription(result.value.animal)
})

const characterDescription = computed(() => {
  if (!result.value) return null
  return calculationService.getCharacterDescription(result.value.character)
})

const elementDescription = computed(() => {
  if (!result.value) return null
  return calculationService.getElementDescription(result.value.element)
})

const mengiDescription = computed(() => {
  if (!result.value) return null
  return calculationService.getMengiDescription(result.value.mengi)
})

// Иконки для стихий
const getElementIcon = (element) => {
  const icons = {
    'дерево': '🌳',
    'огонь': '🔥',
    'земля': '⛰️',
    'железо': '⚙️',
    'вода': '💧'
  }
  return icons[element.toLowerCase()] || '🌀'
}

// Иконки для стихий
const getAnimalIcon = (animal) => {
  const icons = {
    'обезьяна' : '🐒',
    'петух'  : '🐓',
    'собака' : '🐕',
    'кабан' : '🐖',
    'мышь' : '🐀',
    'бык' : '🐂',
    'тигр' : '🐅',
    'заяц' : '🐇',
    'дракон' : '🐲',
    'змея' : '🐍',
    'лошадь' : '🐎',
    'коза' : '🐐'
  }
  return icons[animal.toLowerCase()] || '🐾'
}

// Расчет ширины прогресс-бара
const getProgressWidth = (current, total) => {
  return Math.min(100, (current / total) * 100)
}

// Основной расчет
const calculate = () => {
  try {
    result.value = calculationService.calculateAll(testDate.value)
    error.value = ''
    
    // Сохраняем в историю
    calculationService.saveToHistory(result.value)
    loadHistory()
    
    // Сбрасываем открытое описание
    expandedDescription.value = null
  } catch (err) {
    error.value = err.message
    result.value = null
  }
}

// Переключение описаний
const toggleDescription = (type) => {
  if (expandedDescription.value === type) {
    expandedDescription.value = null
  } else {
    expandedDescription.value = type
  }
}

// Работа с историей
const loadHistory = () => {
  history.value = calculationService.getHistory()
}

const loadFromHistory = (date) => {
  testDate.value = date
  calculate()
}

const removeFromHistory = (id) => {
  calculationService.removeFromHistory(id)
  loadHistory()
}

const clearHistory = () => {
  if (confirm('Очистить всю историю запросов?')) {
    calculationService.clearHistory()
    history.value = []
  }
}

// Инициализация
onMounted(() => {
  calculate()
  loadHistory()
  currentYearInfo.value = calculationService.getCurrentYearInfo()
})
</script>

<style>
/* ===== Базовые стили ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e6e6e6;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ===== Фоновые элементы ===== */
.background-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.15;
}

.moon {
  position: absolute;
  top: 10%;
  right: 10%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #f0e6d2 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(2px);
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(1px 1px at 20% 30%, #fff 1px, transparent 0),
    radial-gradient(1px 1px at 40% 70%, #fff 1px, transparent 0),
    radial-gradient(1.5px 1.5px at 60% 20%, #fff 1px, transparent 0);
  background-size: 200px 200px;
}

.totem-1, .totem-2, .totem-3 {
  position: absolute;
  font-size: 2rem;
  opacity: 0.2;
}

.totem-1 { top: 30%; left: 5%; }
.totem-2 { top: 70%; right: 5%; }
.totem-3 { bottom: 10%; left: 20%; }

/* ===== Основной контейнер ===== */
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* ===== Шапка ===== */
.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: rgba(31, 41, 55, 0.7);
  border-radius: 20px;
  border: 1px solid rgba(75, 85, 99, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.logo-icon {
  font-size: 2.5rem;
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.title {
  font-size: 2.8rem;
  background: linear-gradient(45deg, #c7b198, #f0e6d2, #a27b5c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.subtitle {
  font-size: 1.2rem;
  color: #c7b198;
  margin-bottom: 15px;
  font-style: italic;
}

/* Информация о текущем годе */
.current-year-info {
  margin-top: 20px;
  margin-bottom: 20px;
}

.current-year-card {
  padding: 15px 20px;
  background: linear-gradient(135deg, rgba(167, 123, 92, 0.2), rgba(199, 177, 152, 0.1));
  border-radius: 12px;
  border: 1px solid rgba(167, 123, 92, 0.3);
  max-width: 800px;
  margin: 0 auto;
}

.current-year-title {
  text-align: center;
  gap: 10px;
  color: #f0c674;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.current-year-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  justify-content: center;
}

.current-year-item {
  padding: 5px 12px;
  background: rgba(31, 41, 55, 0.7);
  border-radius: 20px;
  font-size: 0.9rem;
  color: #f0e6d2;
}

.current-year-end {
  color: #9ca3af;
  font-size: 0.85rem;
  text-align: center;
}

.days-left {
  color: #c7b198;
  font-style: italic;
  font-size: 0.8rem;
}

.header-decoration {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.decoration {
  font-size: 1.5rem;
  opacity: 0.7;
  animation: float 4s ease-in-out infinite;
}

.decoration:nth-child(2) { animation-delay: 0.5s; }
.decoration:nth-child(3) { animation-delay: 1s; }
.decoration:nth-child(4) { animation-delay: 1.5s; }
.decoration:nth-child(5) { animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ===== Основной контент ===== */
.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 992px) {
  .main-content {
    grid-template-columns: 1fr 1fr;
  }
}

/* ===== Карточки в шаманском стиле ===== */
.shaman-card {
  background: rgba(31, 41, 55, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(167, 123, 92, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  position: relative;
}

.shaman-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #a27b5c, #c7b198, #a27b5c);
}

.card-header {
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(167, 123, 92, 0.2);
}

.card-title {
  font-size: 1.5rem;
  color: #f0e6d2;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.card-title .icon {
  font-size: 1.8rem;
}

.card-subtitle {
  color: #c7b198;
  font-size: 0.95rem;
}

/* ===== Форма ===== */
.form-content {
  padding: 25px;
}

.input-container {
  margin-bottom: 25px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f0e6d2;
  font-size: 1.1rem;
  margin-bottom: 10px;
  font-weight: 500;
}

.label-icon {
  font-size: 1.3rem;
}

.shaman-input {
  width: 100%;
  padding: 15px;
  background: rgba(42, 52, 65, 0.8);
  border: 2px solid #a27b5c;
  border-radius: 12px;
  color: #f0e6d2;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.shaman-input:focus {
  outline: none;
  border-color: #c7b198;
  box-shadow: 0 0 0 3px rgba(167, 123, 92, 0.3);
}

.input-note {
  margin-top: 8px;
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
}

/* ===== Кнопки ===== */
.shaman-button {
  width: 100%;
  padding: 18px;
  background: linear-gradient(45deg, #a27b5c, #c7b198);
  border: none;
  border-radius: 12px;
  color: #1a1a2e;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 25px;
}

.shaman-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(167, 123, 92, 0.4);
  background: linear-gradient(45deg, #c7b198, #f0e6d2);
}

.button-icon {
  font-size: 1.5rem;
}

.button-arrow {
  font-size: 1.5rem;
  opacity: 0.8;
}

/* ===== История запросов ===== */
.history-section {
  margin-top: 25px;
  padding: 20px;
  background: rgba(42, 52, 65, 0.5);
  border-radius: 15px;
  border: 1px solid rgba(167, 123, 92, 0.2);
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.history-icon {
  font-size: 1.5rem;
}

.history-title {
  font-size: 1.1rem;
  color: #f0e6d2;
  margin: 0;
  flex-grow: 1;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.2s;
}

.clear-history-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.history-items {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
}

.history-items::-webkit-scrollbar {
  width: 6px;
}

.history-items::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
}

.history-items::-webkit-scrollbar-thumb {
  background: #a27b5c;
  border-radius: 3px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: rgba(31, 41, 55, 0.7);
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  position: relative;
}

.history-item:hover {
  background: rgba(42, 52, 65, 0.9);
  border-color: #a27b5c;
  transform: translateX(5px);
}

.history-date {
  font-weight: 500;
  color: #f0e6d2;
  min-width: 100px;
}

.history-details {
  flex-grow: 1;
  display: flex;
  gap: 15px;
}

.history-animal {
  color: #c7b198;
  font-weight: 600;
}

.history-period {
  color: #9ca3af;
  font-size: 0.9rem;
}

.history-remove {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.history-remove:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.empty-history {
  margin-top: 25px;
  padding: 20px;
  background: rgba(42, 52, 65, 0.3);
  border-radius: 15px;
  border: 1px dashed rgba(167, 123, 92, 0.3);
  text-align: center;
}

.empty-history-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.empty-history-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.empty-history-text {
  color: #9ca3af;
  font-size: 0.95rem;
  margin: 0;
}

/* ===== Результаты ===== */
.results-content {
  padding: 20px;
}

.result-block {
  margin-bottom: 25px;
  background: rgba(42, 52, 65, 0.5);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(167, 123, 92, 0.2);
}

.block-header {
  padding: 18px 20px;
  background: rgba(31, 41, 55, 0.7);
  border-bottom: 1px solid rgba(167, 123, 92, 0.2);
}

.block-title {
  font-size: 1.3rem;
  color: #f0e6d2;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.block-subtitle {
  color: #c7b198;
  font-size: 0.9rem;
}

.block-content {
  padding: 20px;
}

/* ===== Сетка характеристик года ===== */
.year-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.year-item {
  padding: 25px 20px;
  border-radius: 15px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.year-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.year-item.expanded {
  z-index: 100;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.animal-item { 
  background: linear-gradient(135deg, 
    rgba(167, 123, 92, 0.25), 
    rgba(199, 177, 152, 0.15));
  border: 1px solid rgba(167, 123, 92, 0.4);
}

.character-item { 
  background: linear-gradient(135deg, 
    rgba(108, 117, 125, 0.25), 
    rgba(173, 181, 189, 0.15));
  border: 1px solid rgba(108, 117, 125, 0.4);
}

.element-item { 
  background: linear-gradient(135deg, 
    rgba(13, 110, 253, 0.2), 
    rgba(25, 135, 84, 0.15));
  border: 1px solid rgba(13, 110, 253, 0.3);
}

.mengi-item { 
  background: linear-gradient(135deg, 
    rgba(111, 66, 193, 0.25), 
    rgba(153, 102, 255, 0.1));
  border: 1px solid rgba(111, 66, 193, 0.4);
}

.item-label {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.item-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0e6d2;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding: 0 10px;
}

.shaman-animal {
  font-size: 1.7rem;
  color: #f0c674;
  text-shadow: 0 2px 8px rgba(240, 198, 116, 0.3);
}

.item-icon {
  font-size: 3.5rem;
  opacity: 0.15;
  position: absolute;
  bottom: -10px;
  right: -10px;
  z-index: 1;
  transform: rotate(15deg);
  transition: all 0.3s ease;
}

.year-item:hover .item-icon {
  opacity: 0.2;
  transform: rotate(0deg) scale(1.1);
}

/* ===== РАСКРЫВАЮЩИЕСЯ ОПИСАНИЯ (анимация из второго файла) =====*/
.item-description {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 15px;
  padding: 20px;
  z-index: 10;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(167, 123, 92, 0.5);
  animation: slideIn 0.3s ease;
  
  /* Стили скроллбара как в истории запросов */
  scrollbar-width: thin; /* Для Firefox */
  scrollbar-color: #a27b5c rgba(31, 41, 55, 0.5); /* Для Firefox */
}

/* Стилизация скроллбара для Webkit браузеров (Chrome, Safari, Edge) */
.item-description::-webkit-scrollbar {
  width: 6px;
}

.item-description::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
  margin: 5px 0;
}

.item-description::-webkit-scrollbar-thumb {
  background: #a27b5c;
  border-radius: 3px;
}

.item-description::-webkit-scrollbar-thumb:hover {
  background: #c7b198;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.description-content {
  flex: 1;
  color: #f0e6d2;
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: left;
  padding-right: 5px; /* Уменьшил отступ для скроллбара */
}

.close-description-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(167, 123, 92, 0.3);
  border: 1px solid rgba(167, 123, 92, 0.5);
  color: #f0e6d2;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s;
  z-index: 11; /* Чтобы кнопка была поверх скроллбара */
}

.close-description-btn:hover {
  background: rgba(167, 123, 92, 0.5);
  transform: scale(1.1);
}

/* ===== Период ===== */
.period-info {
  text-align: center;
}

.period-name {
  font-size: 1.8rem;
  color: #f0e6d2;
  margin-bottom: 10px;
  font-weight: 600;
}

.period-days {
  color: #c7b198;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

/* Прогресс-бар */
.period-progress {
  margin: 25px 0;
}

.progress-bar {
  height: 10px;
  background: rgba(75, 85, 99, 0.5);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a27b5c, #c7b198);
  border-radius: 5px;
  transition: width 1s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Особые метки */
.period-special {
  margin-top: 20px;
}

.special-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-weight: 500;
}

.peak {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.1));
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.overlap {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1));
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.special-icon {
  font-size: 1.3rem;
}

/* ===== Информационный блок ===== */
.info-block {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.7), rgba(42, 52, 65, 0.5));
  border-radius: 15px;
  border: 1px solid rgba(167, 123, 92, 0.2);
}

.info-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.info-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.info-text {
  color: #c7b198;
  font-size: 1rem;
  line-height: 1.5;
}

/* ===== Пустые результаты ===== */
.empty-results {
  grid-column: 1 / -1;
}

.empty-card {
  padding: 60px 40px;
  text-align: center;
}

.empty-content {
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.8rem;
  color: #f0e6d2;
  margin-bottom: 15px;
}

.empty-text {
  color: #c7b198;
  font-size: 1.1rem;
}

/* ===== Подвал ===== */
.footer {
  margin-top: 50px;
  padding: 25px;
  text-align: center;
  background: rgba(31, 41, 55, 0.7);
  border-radius: 15px;
  border-top: 1px solid rgba(167, 123, 92, 0.3);
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #c7b198;
  font-size: 1rem;
  margin-bottom: 10px;
}

.footer-note {
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
}

/* ===== Карточка футера формы ===== */
.card-footer {
  padding: 15px 25px;
  background: rgba(31, 41, 55, 0.5);
  border-top: 1px solid rgba(167, 123, 92, 0.2);
  text-align: center;
}

.footer-text {
  color: #9ca3af;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* ===== Адаптивность ===== */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .logo {
    flex-direction: column;
    gap: 10px;
  }
  
  .year-grid {
    grid-template-columns: 1fr;
  }
  
  .info-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-decoration {
    flex-wrap: wrap;
  }
  
  .current-year-details {
    flex-direction: column;
    align-items: center;
  }
  
  .current-year-item {
    width: 100%;
    text-align: center;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .history-date {
    min-width: auto;
  }
  
  .history-details {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .app {
    padding: 10px;
  }
  
  .header {
    padding: 20px 15px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .card-title {
    font-size: 1.3rem;
  }
  
  .item-value {
    font-size: 1.2rem;
    padding: 0 5px;
  }
  
  .shaman-animal {
    font-size: 1.3rem;
  }
  
  .item-icon {
    font-size: 2.2rem;
    opacity: 0.1;
  }
  
  .year-item {
    min-height: 130px;
    padding: 15px 10px;
  }
  
  .item-description {
    position: fixed;
  }
}
</style>
