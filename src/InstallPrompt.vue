<template>
  <div v-if="showPrompt" class="install-prompt">
    <div class="prompt-content">
      <div class="prompt-icon">📱</div>
      <div class="prompt-text">
        <h3>Установить приложение</h3>
        <p>Установите Шаманский Гороскоп на свой телефон для быстрого доступа</p>
      </div>
      <div class="prompt-actions">
        <button @click="installApp" class="install-btn">Установить</button>
        <button @click="dismissPrompt" class="dismiss-btn">Позже</button>
      </div>
      <button @click="dismissPrompt" class="close-btn">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  // Слушаем событие beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Показываем промпт через 5 секунд после загрузки
    setTimeout(() => {
      const hasSeenPrompt = localStorage.getItem('installPromptSeen')
      if (!hasSeenPrompt) {
        showPrompt.value = true
      }
    }, 5000)
  showPrompt.value = true
  })

  // Скрываем промпт если приложение уже установлено
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showPrompt.value = false
  }
  showPrompt.value = true
})

const installApp = async () => {
  if (!deferredPrompt) return
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    console.log('Пользователь установил приложение')
  }
  
  deferredPrompt = null
  dismissPrompt()
}

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('installPromptSeen', 'true')
}
</script>

<style>
.install-prompt {
  position: fixed;
  bottom: 20px;
  right: 20px;
  left: 20px;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.prompt-content {
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  border: 2px solid #a27b5c;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
}

.prompt-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.prompt-text {
  flex-grow: 1;
}

.prompt-text h3 {
  color: #f0e6d2;
  margin-bottom: 5px;
  font-size: 1.2rem;
}

.prompt-text p {
  color: #c7b198;
  font-size: 0.9rem;
  line-height: 1.4;
}

.prompt-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.install-btn {
  padding: 10px 20px;
  background: linear-gradient(45deg, #a27b5c, #c7b198);
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.install-btn:hover {
  transform: translateY(-2px);
}

.dismiss-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: #f0e6d2;
  border: 1px solid #a27b5c;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #c7b198;
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .install-prompt {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
  
  .prompt-content {
    flex-direction: column;
    text-align: center;
    padding: 15px;
  }
  
  .prompt-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .prompt-content {
    padding: 12px 10px; /* Уменьшены внутренние отступы */
  }
  .prompt-icon {
    font-size: 2rem; /* Иконка чуть меньше */
  }
  .prompt-text h3 {
    font-size: 1rem; /* Уменьшен заголовок */
  }
  .prompt-text p {
    font-size: 0.8rem; /* Уменьшен текст */
  }
  .prompt-actions {
    flex-direction: column; /* Кнопки друг под другом */
    gap: 8px; /* Расстояние между кнопками */
  }
  .install-btn,
  .dismiss-btn {
    width: 100%; /* Кнопки на всю ширину */
    padding: 12px 10px; /* Увеличенная область касания */
    font-size: 0.9rem;
  }
  .close-btn {
    font-size: 1.2rem; /* Крестик меньше */
    width: 24px;
    height: 24px;
  }
}
</style>