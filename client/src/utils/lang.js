export const pickLang = (field, lng = 'ru') => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[lng] || field.ru || field.de || Object.values(field)[0] || '';
  }
  return String(field);
}; 