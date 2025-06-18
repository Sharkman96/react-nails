// Утилиты для работы с CSRF токенами

class CSRFManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Получение CSRF токена
  async getToken() {
    // Проверяем, есть ли действующий токен
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 часа
        return this.token;
      } else {
        throw new Error('Failed to get CSRF token');
      }
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  }

  // Добавление CSRF токена к запросу
  async addTokenToRequest(options = {}) {
    const token = await this.getToken();
    
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': token
      }
    };
  }

  // Обертка для fetch с CSRF защитой
  async secureFetch(url, options = {}) {
    const secureOptions = await this.addTokenToRequest(options);
    
    try {
      const response = await fetch(url, secureOptions);
      
      // Если получили ошибку CSRF, обновляем токен и повторяем запрос
      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.code === 'CSRF_MISSING' || errorData.code === 'CSRF_INVALID') {
          this.token = null; // Сбрасываем токен
          const retryOptions = await this.addTokenToRequest(options);
          return fetch(url, retryOptions);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Secure fetch error:', error);
      throw error;
    }
  }

  // Очистка токена
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Проверка валидности токена
  isTokenValid() {
    return this.token && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }
}

// Создаем глобальный экземпляр
const csrfManager = new CSRFManager();

// Утилиты для работы с формами
export const csrfUtils = {
  // Добавление CSRF токена к форме
  addTokenToForm: async (formData) => {
    const token = await csrfManager.getToken();
    formData.append('_csrf', token);
    return formData;
  },

  // Создание объекта с CSRF токеном
  addTokenToObject: async (obj) => {
    const token = await csrfManager.getToken();
    return {
      ...obj,
      _csrf: token
    };
  },

  // Валидация ответа на CSRF ошибки
  handleCSRFError: (response) => {
    if (response.status === 403) {
      return response.json().then(data => {
        if (data.code === 'CSRF_MISSING' || data.code === 'CSRF_INVALID') {
          csrfManager.clearToken();
          throw new Error('CSRF token error. Please refresh the page.');
        }
        throw new Error(data.error || 'Forbidden');
      });
    }
    return response;
  }
};

// Хук для использования CSRF в React компонентах
export const useCSRF = () => {
  const getToken = async () => {
    return await csrfManager.getToken();
  };

  const secureFetch = async (url, options = {}) => {
    return await csrfManager.secureFetch(url, options);
  };

  const addTokenToForm = async (formData) => {
    return await csrfUtils.addTokenToForm(formData);
  };

  const addTokenToObject = async (obj) => {
    return await csrfUtils.addTokenToObject(obj);
  };

  return {
    getToken,
    secureFetch,
    addTokenToForm,
    addTokenToObject,
    isTokenValid: csrfManager.isTokenValid()
  };
};

// Экспортируем менеджер для прямого использования
export default csrfManager; 