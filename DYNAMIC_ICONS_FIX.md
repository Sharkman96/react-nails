# Исправление динамических иконок услуг

## Проблема
На главной странице все услуги отображались с одинаковой иконкой `Sparkles`, несмотря на то, что в базе данных для каждой услуги есть свое поле `icon`.

## Решение

### 1. Обновление компонента Services.js
- Добавлены импорты дополнительных иконок из `lucide-react`:
  - `Scissors` (ножницы)
  - `Palette` (палитра)
  - `Zap` (молния)
- Создана функция `getServiceIcon()` для динамического получения иконки по названию
- Обновлен JSX для использования динамических иконок с индивидуальными цветами

### 2. Функция getServiceIcon()
```javascript
const getServiceIcon = (iconName, size = 32) => {
  const iconProps = { size, color: 'currentColor' };
  
  switch (iconName) {
    case 'scissors':
      return <Scissors {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'palette':
      return <Palette {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />; // Иконка по умолчанию
  }
};
```

### 3. Обновление отображения
Было:
```jsx
<div className="service-icon">
  <Sparkles size={32} />
</div>
```

Стало:
```jsx
<div className="service-icon" style={{ color: service.color }}>
  {getServiceIcon(service.icon)}
</div>
```

### 4. Обновление CSS
- Добавлены стили для цветных иконок с псевдоэлементом `::before`
- Улучшены эффекты при наведении
- Исправлены названия CSS-классов (`service-name` → `service-title`)
- Добавлены стили для рейтинга услуг

## Доступные иконки

В админ-панели доступны следующие иконки:
- `scissors` - Ножницы
- `sparkles` - Блестки  
- `palette` - Палитра
- `zap` - Молния

## Результат
Теперь каждая услуга отображается с индивидуальной иконкой и цветом, заданным в админ-панели. Иконки анимированы и реагируют на наведение мыши. 