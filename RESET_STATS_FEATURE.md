# Функция "Сбросить статистику" в админ-панели

## Описание

Добавлена новая функция в админ-панель Dashboard для полного сброса всей статистики. Теперь администратор может не только сбрасывать клики по кнопкам, но и полностью очищать все данные аналитики.

## Новая функциональность

### Кнопки управления статистикой

В секции dashboard-actions теперь доступны две кнопки:

1. **"Сбросить клики"** (существующая)
   - Сбрасывает только счетчики кликов по кнопкам WhatsApp и Instagram
   - Цвет: красно-оранжевый градиент

2. **"Сбросить статистику"** (новая)
   - Полностью удаляет все данные аналитики
   - Сбрасывает просмотры страниц, клики по кнопкам, статистику по странам
   - Цвет: темно-красный градиент
   - Иконка: Trash2 (корзина)

### Подтверждение действий

- **Сброс кликов**: стандартное подтверждение
- **Сброс статистики**: усиленное предупреждение с текстом "Это действие необратимо!"

## Технические детали

### Frontend (Dashboard.js)

```javascript
// Новое состояние
const [resetingStats, setResetingStats] = useState(false);

// Обработчик сброса всей статистики
const handleResetAllStats = async () => {
  if (!window.confirm('Вы уверены, что хотите полностью сбросить ВСЮ статистику? Это действие необратимо!')) return;
  
  setResetingStats(true);
  try {
    const response = await fetch('/api/analytics/reset-all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      await fetchStats();
      showToast('Вся статистика успешно сброшена', 'success');
    }
  } catch (error) {
    showToast('Ошибка при сбросе статистики', 'error');
  } finally {
    setResetingStats(false);
  }
};
```

### Новый JSX элемент

```javascript
<motion.button
  onClick={handleResetAllStats}
  className="reset-all-btn"
  disabled={resetingStats}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <Trash2 size={18} />
  {resetingStats ? 'Сброс...' : 'Сбросить статистику'}
</motion.button>
```

### Backend API

**Новый endpoint**: `POST /api/analytics/reset-all`

**Контроллер** (`controllers/analytics.js`):
```javascript
exports.resetAllStats = async (req, res) => {
  try {
    // Удаляем все просмотры страниц
    await PageView.deleteMany({});
    
    // Сбрасываем все клики по кнопкам
    await ButtonClick.updateMany({}, { count: 0, lastClicked: new Date() });
    
    res.json({ 
      success: true, 
      message: 'Вся статистика успешно сброшена',
      deletedPageViews: true,
      resetButtonClicks: true
    });
  } catch (error) {
    console.error('Error resetting all stats:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
```

**Маршрут** (`routes/analytics.js`):
```javascript
router.post('/reset-all', auth, analyticsController.resetAllStats);
```

### Стили CSS

```css
.dashboard-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.reset-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

.reset-all-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.6);
  transform: translateY(-2px);
}

.reset-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .dashboard-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .reset-btn,
  .reset-all-btn {
    width: 100%;
    max-width: 300px;
  }
}
```

## Что сбрасывается

### "Сбросить клики" (существующая функция)
- ✅ Счетчики кликов по кнопкам WhatsApp и Instagram
- ❌ Просмотры страниц остаются
- ❌ Статистика по странам остается
- ❌ Данные по дням остаются

### "Сбросить статистику" (новая функция)
- ✅ **ВСЕ** просмотры страниц (удаляются из БД)
- ✅ **ВСЕ** клики по кнопкам (сбрасываются)
- ✅ **ВСЯ** статистика по странам (очищается)
- ✅ **ВСЕ** данные по дням (очищаются)
- ✅ **ВСЕ** уникальные посетители (очищаются)

## Использование

1. Перейдите в админ-панель: `http://localhost:5000/admin`
2. Войдите с админскими данными
3. В Dashboard найдите секцию с кнопками управления
4. Выберите нужное действие:
   - **"Сбросить клики"** - для сброса только кликов
   - **"Сбросить статистику"** - для полной очистки всех данных

## Безопасность

- ✅ Требуется авторизация администратора
- ✅ JWT токен проверяется middleware `auth`
- ✅ Подтверждение действия через `confirm()`
- ✅ Toast-уведомления об успехе/ошибке
- ✅ Обработка ошибок и исключений

## Сценарии использования

1. **Очистка тестовых данных** после настройки и тестирования
2. **Начало нового периода отчетности** (например, новый месяц/квартал)
3. **Исправление ошибочных данных** в статистике
4. **Демонстрация системы** с чистой статистикой

## Результат

После использования функции "Сбросить статистику":
- Все графики обнуляются
- Счетчики сбрасываются в 0
- Список стран очищается
- График просмотров по дням показывает "Нет данных"
- Система готова к накоплению новой статистики 