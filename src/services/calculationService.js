// calculationService.js - исправленная версия с правильной логикой периодов
import yearData from '../data/yearData.json'
import yearPatterns from '../data/yearPatterns.json'
import descriptions from '../data/descriptions.json'

class CalculationService {
  constructor() {
    this.years = yearData.years
    this.patterns = yearPatterns
    this.yearCache = new Map()
    this.descriptions = descriptions
    this.historyKey = 'shaman-horoscope-history'
    this.maxHistoryItems = 10
  }
// ==================== ИСТОРИЯ РАСЧЕТОВ ====================

  saveToHistory(result) {
    try {
      const history = this.getHistory()
      
      // Убираем дубликаты по дате
      const filteredHistory = history.filter(item => item.birthDate !== result.birthDate)
      
      // Добавляем новый результат в начало
      const historyItem = {
        id: Date.now(),
        birthDate: result.birthDate,
        formattedDate: result.formattedDate,
        animal: result.animal,
        character: result.character,
        element: result.element,
        mengi: result.mengi,
        period: result.period,
        year: result.year,
        timestamp: new Date().toISOString()
      }
      
      filteredHistory.unshift(historyItem)
      
      // Ограничиваем количество записей
      const limitedHistory = filteredHistory.slice(0, this.maxHistoryItems)
      
      localStorage.setItem(this.historyKey, JSON.stringify(limitedHistory))
      return true
    } catch (error) {
      console.error('Ошибка сохранения истории:', error)
      return false
    }
  }

  getHistory() {
    try {
      const historyStr = localStorage.getItem(this.historyKey)
      return historyStr ? JSON.parse(historyStr) : []
    } catch (error) {
      console.error('Ошибка чтения истории:', error)
      return []
    }
  }

  clearHistory() {
    localStorage.removeItem(this.historyKey)
  }

  removeFromHistory(id) {
    const history = this.getHistory()
    const filtered = history.filter(item => item.id !== id)
    localStorage.setItem(this.historyKey, JSON.stringify(filtered))
    return filtered
  }

  // ==================== ПОЛУЧЕНИЕ ОПИСАНИЙ ====================

  getAnimalDescription(animal) {
    return this.descriptions.animals[animal] || {
      title: animal,
      description: 'Описание отсутствует',
      symbolism: 'Неизвестно',
      element: 'Неизвестно',
      direction: 'Неизвестно'
    }
  }

  getCharacterDescription(character) {
    return this.descriptions.characters[character] || {
      title: character,
      description: 'Описание отсутствует',
      energy: 'Неизвестно',
      quality: 'Неизвестно'
    }
  }

  getElementDescription(element) {
    const elementLower = element.toLowerCase()
    return this.descriptions.elements[elementLower] || {
      title: element,
      description: 'Описание отсутствует',
      season: 'Неизвестно',
      color: 'Неизвестно',
      direction: 'Неизвестно'
    }
  }

  getMengiDescription(mengi) {
    const mengiLower = mengi.toLowerCase()
    return this.descriptions.mengi[mengiLower] || {
      title: mengi,
      description: 'Описание отсутствует',
      quality: 'Неизвестно'
    }
  }

  // ==================== ТЕКУЩИЙ ГОД ====================

  getCurrentYearInfo() {
    const now = new Date()
    
    try {
      const yearInfo = this.calculateAll(now.toISOString().split('T')[0])
      
      const endDate = new Date(yearInfo.yearEndDate)
    
      
      return {
        animal: yearInfo.animal,
        character: yearInfo.character,
        element: yearInfo.element,
        mengi: yearInfo.mengi,
        year: yearInfo.year,
        endDate: yearInfo.yearEndDateFormatted,
        daysLeft:Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) 
      }
    } catch (error) {
      console.error('Ошибка получения информации о текущем годе:', error)
      return null
    }
  }
  // ==================== ОСНОВНОЙ МЕТОД ====================

  calculateAll(birthDateStr) {
    try {
      const birthDate = new Date(birthDateStr + 'T00:00:00')
      
      if (isNaN(birthDate.getTime())) {
        throw new Error('Некорректная дата')
      }

      // 1. Находим год
      const yearInfo = this.findYearInfo(birthDate)
      
      // 2. Характеристики года
      const yearCharacteristics = this.getYearCharacteristics(yearInfo)
      
      // 3. Определяем период (исправленная логика!)
      const periodInfo = this.findPeriod(birthDate, yearInfo.year)

      // 4. Рассчитываем хранителя
      const guardianInfo = this.calculateGuardian(birthDateStr, yearCharacteristics.mengi)
      
      // 5. Проверяем пик и наложение
      const isPeak = this.isPeak(periodInfo.dayInPeriod, periodInfo.duration)
      const isOverlap = this.isOverlap(periodInfo.dayInPeriod, periodInfo.duration)
      
      // 6. Форматируем результат
      return {
        // Основные данные
        birthDate: birthDateStr,
        formattedDate: this.formatDateDDMMYYYY(birthDate),
        
        // Информация о годе
        year: yearInfo.year,
        yearStartDate: yearInfo.startDate,
        yearEndDate: yearInfo.endDate,
        yearStartDateFormatted: this.formatDateDDMMYYYY(new Date(yearInfo.startDate + 'T00:00:00')),
        yearEndDateFormatted: this.formatDateDDMMYYYY(new Date(yearInfo.endDate + 'T00:00:00')),
        yearDay: this.calculateYearDay(birthDate, yearInfo.startDate),
        
        // Характеристики года
        animal: yearCharacteristics.animal,
        character: yearCharacteristics.character,
        element: yearCharacteristics.element,
        mengi: yearCharacteristics.mengi,
        
        // Хранитель
        guardian: guardianInfo.name,

        // Информация о периоде
        period: periodInfo.name,
        periodDay: periodInfo.dayInPeriod,
        periodDuration: periodInfo.duration,
        periodStart: periodInfo.startDate,
        periodEnd: periodInfo.endDate,
        periodStartFormatted: this.formatDateDDMMYYYY(new Date(periodInfo.startDate)),
        periodEndFormatted: this.formatDateDDMMYYYY(new Date(periodInfo.endDate)),
        
        // Специальные флаги
        isPeakPeriod: isPeak,
        isOverlapPeriod: isOverlap,
        
        // Следующий период (если есть наложение)
        nextPeriod: isOverlap ? this.getNextPeriod(periodInfo.index) : null,
        
        // Индексы
        indices: {
          animalIndex: yearInfo.animalIndex,
          characterIndex: yearInfo.characterIndex,
          elementIndex: yearInfo.elementIndex,
          mengiIndex: yearInfo.mengiIndex,
          periodIndex: periodInfo.index
        }
      }
    } catch (error) {
      console.error('Ошибка расчета:', error)
      throw error
    }
  }
   // ==================== РАСЧЕТ ХРАНИТЕЛЯ ====================

  calculateGuardian(birthDateStr, mengi) {
    // Убираем точки из даты для расчета
    const cleanDate = birthDateStr.replace(/\./g, '')
    
    // Сумма всех цифр даты
    const dateSum = this.sumDigits(cleanDate);
    const finalSum = this.digitalRoot(dateSum); // теперь всегда однозначное
    const guardian = this.getGuardianByMengi(mengi, finalSum);

    return guardian
      }
  

  sumDigits(str) {
    return str.split('').reduce((sum, char) => {
      const num = parseInt(char)
      return isNaN(num) ? sum : sum + num
    }, 0)
  }

  digitalRoot(num) {
    while (num >= 10) {
      num = this.sumDigits(num.toString());
    }
    return num;
  }

  getGuardianByMengi(mengi, starNumber) {
    const mengiLower = mengi.toLowerCase()
    
    // Маппинг менги на хранителей
    const guardians = {
      '9 красных': {
        name: 'Твой хранитель: Дух Гор - Таг-Ээзи'
      },
      '3 синих': {
        name: 'Твой хранитель: Дух Воды - Суг-Ээзи'
      },
      '4 зеленых': {
        name: 'Твой хранитель: Дух леса - Тайга-Ээзи'
      },
      '5 желтых': {
        name: 'Твой хранитель с ' + this.getCasssiopeiaStarNumber(starNumber) + ' звезды созвездия Кассиопея'
      },
      '7 красных': {
        name: 'Твой хранитель с ' + this.getUrsaMajorStarNumber(starNumber) + ' звезды созвездия Большая Медведица'
      },
      '8 белых': {
        name: 'Твой хранитель: Светлая душа с Белых Небес'
      },
      '6 белых': {
        name: 'Твой хранитель: Светлая душа с Белых Небес'
      },
      '1 белых': {
        name: 'Твой хранитель: Светлая душа с Белых Небес'
      },
      '2 черных': {
        name: 'Твой хранитель: Тенгери с Черных Небес'
      }
    }
    
    // Находим хранителя (регистронезависимо)
    for (const [key, value] of Object.entries(guardians)) {
      if (mengiLower.includes(key.toLowerCase())) {
        return {
          name: value.name,
          description: value.description,
          constellation: value.constellation,
          star: value.star,
          fullName: `${value.name} - ${value.description}`
        }
      }
    }
    
    // Если не нашли, возвращаем дефолтного
    return {
      name: 'Дух Предков'
    }
  }

  getCasssiopeiaStarNumber(starNumber) {
    // Для Кассиопеи: 1 и 6 → 1, 2 и 7 → 2, 3 и 8 → 3, 4 и 9 → 4, 5 → 5
    const mapping = {
      1: 1, 6: 1,
      2: 2, 7: 2,
      3: 3, 8: 3,
      4: 4, 9: 4,
      5: 5
    }
    return mapping[starNumber] || 0
  }

  getUrsaMajorStarNumber(starNumber) {
    // Для Большой Медведицы: 1 и 8 → 1, 2 и 9 → 2, 3 → 3, 4 → 4, 5 → 5, 6 → 6, 7 → 7
    const mapping = {
      1: 1, 8: 1,
      2: 2, 9: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7
    }
    return mapping[starNumber] || starNumber
  }

  // ==================== ФОРМАТИРОВАНИЕ ДАТ ====================

  formatDateDDMMYYYY(date) {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  formatDateLong(date) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // ==================== ПОИСК ГОДА ====================

  findYearInfo(date) {
    const cacheKey = date.toISOString().split('T')[0]
    if (this.yearCache.has(cacheKey)) {
      return this.yearCache.get(cacheKey)
    }

    const targetDate = new Date(date)
    
    // Сортируем года по дате начала для корректного поиска
    const sortedYears = [...this.years].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    )
    
    for (let i = 0; i < sortedYears.length; i++) {
      const currentYear = sortedYears[i]
      const nextYear = sortedYears[i + 1]
      
      const currentStart = new Date(currentYear.startDate + 'T00:00:00')
      
      if (!nextYear) {
        // Последний год в базе
        if (targetDate >= currentStart) {
          const result = { ...currentYear, startDateObj: currentStart }
          this.yearCache.set(cacheKey, result)
          return result
        }
      } else {
        const nextStart = new Date(nextYear.startDate + 'T00:00:00')
        
        if (targetDate >= currentStart && targetDate < nextStart) {
          const result = { ...currentYear, startDateObj: currentStart }
          this.yearCache.set(cacheKey, result)
          return result
        }
      }
    }
    
    // Если дата раньше самого раннего года
    const earliestYear = sortedYears[0]
    if (targetDate < new Date(earliestYear.startDate + 'T00:00:00')) {
      throw new Error(`Дата ${targetDate.toISOString().split('T')[0]} раньше самого раннего года в базе: ${earliestYear.startDate}`)
    }
    
    throw new Error(`Не найден год для даты: ${date.toISOString().split('T')[0]}`)
  }

  // ==================== ХАРАКТЕРИСТИКИ ГОДА ====================

  getYearCharacteristics(yearInfo) {
    return {
      animal: this.patterns.animals[yearInfo.animalIndex],
      character: this.patterns.characters[yearInfo.characterIndex],
      element: this.patterns.elements[yearInfo.elementIndex],
      mengi: this.patterns.mengi[yearInfo.mengiIndex]
    }
  }

  // ==================== ИСПРАВЛЕННЫЙ РАСЧЕТ ПЕРИОДОВ ====================

  /**
   * Находит период для указанной даты
   * date - JavaScript Date объект
   * currentYear - числовой год для расчета периодов
   */
  findPeriod(date, currentYear) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    console.log(`Поиск периода для даты: ${day}.${month}.${year}, текущий год в базе: ${currentYear}`)
    
    // Проверяем все периоды
    for (let i = 0; i < this.patterns.periods.length; i++) {
      const period = this.patterns.periods[i]
      
      console.log(`Проверяем период ${period.name}: ${period.startMonth}.${period.startDay} - ${period.endMonth}.${period.endDay}`)
      
      // Вариант 1: Период в пределах одного года
      let startDate, endDate
      
      if (!period.crossYear) {
        // Обычный период (без перехода через год)
        startDate = new Date(year, period.startMonth - 1, period.startDay)
        endDate = new Date(year, period.endMonth - 1, period.endDay)
        
        console.log(`Обычный период: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`)
      } else {
        // Период с переходом через год (например, декабрь-январь)
        // Вариант A: Начало в предыдущем году
        if (month < period.startMonth || (month === period.startMonth && day < period.startDay)) {
          startDate = new Date(year - 1, period.startMonth - 1, period.startDay)
          endDate = new Date(year, period.endMonth - 1, period.endDay)
          console.log(`Период с переходом (вариант A): ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`)
        } 
        // Вариант B: Начало в текущем году
        else {
          startDate = new Date(year, period.startMonth - 1, period.startDay)
          endDate = new Date(year + 1, period.endMonth - 1, period.endDay)
          console.log(`Период с переходом (вариант B): ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`)
        }
      }
      
      // Проверяем, попадает ли дата в период
      if (date >= startDate && date <= endDate) {
        const dayInPeriod = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1
        const duration = period.duration
        
        console.log(`✅ Найден период: ${period.name}, день: ${dayInPeriod}/${duration}`)
        
        return {
          name: period.name,
          dayInPeriod,
          duration,
          startDate: startDate,
          endDate: endDate,
          startDateStr: startDate.toISOString().split('T')[0],
          endDateStr: endDate.toISOString().split('T')[0],
          index: i
        }
      }
    }
    
    // Если не нашли - специальная логика для граничных случаев
    console.log('Период не найден стандартным способом, пробуем граничные случаи...')
    
    // Проверяем периоды с переходом через год более тщательно
    for (let i = 0; i < this.patterns.periods.length; i++) {
      const period = this.patterns.periods[i]
      
      if (period.crossYear) {
        // Период "Хвост года" (декабрь-январь) или другие периоды с переходом
        // Пробуем оба варианта: с начала в предыдущем году и с начала в текущем
        
        // Вариант 1: Начало в предыдущем году
        let startDate1 = new Date(year - 1, period.startMonth - 1, period.startDay)
        let endDate1 = new Date(year, period.endMonth - 1, period.endDay)
        
        // Вариант 2: Начало в текущем году  
        let startDate2 = new Date(year, period.startMonth - 1, period.startDay)
        let endDate2 = new Date(year + 1, period.endMonth - 1, period.endDay)
        
        if (date >= startDate1 && date <= endDate1) {
          const dayInPeriod = Math.floor((date - startDate1) / (1000 * 60 * 60 * 24)) + 1
          console.log(`✅ Найден период (граничный случай 1): ${period.name}`)
          return {
            name: period.name,
            dayInPeriod,
            duration: period.duration,
            startDate: startDate1,
            endDate: endDate1,
            startDateStr: startDate1.toISOString().split('T')[0],
            endDateStr: endDate1.toISOString().split('T')[0],
            index: i
          }
        }
        
        if (date >= startDate2 && date <= endDate2) {
          const dayInPeriod = Math.floor((date - startDate2) / (1000 * 60 * 60 * 24)) + 1
          console.log(`✅ Найден период (граничный случай 2): ${period.name}`)
          return {
            name: period.name,
            dayInPeriod,
            duration: period.duration,
            startDate: startDate2,
            endDate: endDate2,
            startDateStr: startDate2.toISOString().split('T')[0],
            endDateStr: endDate2.toISOString().split('T')[0],
            index: i
          }
        }
      }
    }
    
    // Если всё еще не нашли, возвращаем последний период как fallback
    const lastPeriod = this.patterns.periods[this.patterns.periods.length - 1]
    console.warn(`Период не найден для даты ${date.toISOString().split('T')[0]}, возвращаем fallback: ${lastPeriod.name}`)
    
    const fallbackStart = new Date(year, lastPeriod.startMonth - 1, lastPeriod.startDay)
    const fallbackEnd = lastPeriod.crossYear 
      ? new Date(year + 1, lastPeriod.endMonth - 1, lastPeriod.endDay)
      : new Date(year, lastPeriod.endMonth - 1, lastPeriod.endDay)
    
    const dayInPeriod = Math.floor((date - fallbackStart) / (1000 * 60 * 60 * 24)) + 1
    
    return {
      name: lastPeriod.name,
      dayInPeriod,
      duration: lastPeriod.duration,
      startDate: fallbackStart,
      endDate: fallbackEnd,
      startDateStr: fallbackStart.toISOString().split('T')[0],
      endDateStr: fallbackEnd.toISOString().split('T')[0],
      index: this.patterns.periods.length - 1
    }
  }


  isPeak(dayInPeriod, periodDuration) {
    const middle= Math.trunc((periodDuration + 1)/2 )
    return dayInPeriod >= (middle - 3) && dayInPeriod <= (middle + 3)
  }

  isOverlap(dayInPeriod, periodDuration) {
    const overlapDays = this.patterns.rules.overlapDays
    const daysLeft = periodDuration - dayInPeriod
    return daysLeft <= overlapDays
  }

  getNextPeriod(currentPeriodIndex) {
    const nextIndex = (currentPeriodIndex + 1) % this.patterns.periods.length
    const nextPeriod = this.patterns.periods[nextIndex]
    const year = new Date().getFullYear()
    
    const startDate = new Date(year, nextPeriod.startMonth - 1, nextPeriod.startDay)
    let endDate = new Date(year, nextPeriod.endMonth - 1, nextPeriod.endDay)
    
    if (nextPeriod.crossYear && nextPeriod.endMonth < nextPeriod.startMonth) {
      endDate = new Date(year + 1, nextPeriod.endMonth - 1, nextPeriod.endDay)
    }
    
    return {
      name: nextPeriod.name,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      startDateFormatted: this.formatDateDDMMYYYY(startDate),
      endDateFormatted: this.formatDateDDMMYYYY(endDate),
      index: nextIndex
    }
  }

  calculateYearDay(date, yearStartDateStr) {
    const startDate = new Date(yearStartDateStr + 'T00:00:00')
    const diffMs = date - startDate
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }

}

export const calculationService = new CalculationService()