const Joi = require('joi');

// Схемы валидации
const validationSchemas = {
  // Валидация пользователя
  user: {
    login: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(6).max(100).required()
    }),
    
    register: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    })
  },

  // Валидация галереи
  gallery: {
    create: Joi.object({
      title: Joi.object({
        ru: Joi.string().min(1).max(100).required(),
        de: Joi.string().min(1).max(100).required()
      }).required(),
      description: Joi.object({
        ru: Joi.string().max(500).optional(),
        de: Joi.string().max(500).optional()
      }).optional(),
      color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
      isActive: Joi.boolean().default(true),
      order: Joi.number().integer().min(0).default(0)
    }),

    update: Joi.object({
      title: Joi.object({
        ru: Joi.string().min(1).max(100).optional(),
        de: Joi.string().min(1).max(100).optional()
      }).optional(),
      description: Joi.object({
        ru: Joi.string().max(500).optional(),
        de: Joi.string().max(500).optional()
      }).optional(),
      color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
      isActive: Joi.boolean().optional(),
      order: Joi.number().integer().min(0).optional()
    })
  },

  // Валидация услуг
  service: {
    create: Joi.object({
      name: Joi.object({
        ru: Joi.string().min(1).max(100).required(),
        de: Joi.string().min(1).max(100).required()
      }).required(),
      description: Joi.object({
        ru: Joi.string().max(1000).optional(),
        de: Joi.string().max(1000).optional()
      }).optional(),
      price: Joi.number().positive().required(),
      duration: Joi.number().integer().positive().optional(),
      category: Joi.string().max(50).optional(),
      isActive: Joi.boolean().default(true)
    }),

    update: Joi.object({
      name: Joi.object({
        ru: Joi.string().min(1).max(100).optional(),
        de: Joi.string().min(1).max(100).optional()
      }).optional(),
      description: Joi.object({
        ru: Joi.string().max(1000).optional(),
        de: Joi.string().max(1000).optional()
      }).optional(),
      price: Joi.number().positive().optional(),
      duration: Joi.number().integer().positive().optional(),
      category: Joi.string().max(50).optional(),
      isActive: Joi.boolean().optional()
    })
  },

  // Валидация контактов
  contact: {
    submit: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/).optional(),
      message: Joi.string().min(10).max(1000).required(),
      preferredContact: Joi.string().valid('email', 'phone').optional()
    })
  },

  // Валидация аналитики
  analytics: {
    click: Joi.object({
      buttonType: Joi.string().valid('whatsapp', 'instagram', 'phone', 'contact').required(),
      page: Joi.string().optional(),
      timestamp: Joi.date().iso().optional()
    })
  }
};

// Middleware для валидации
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    
    if (!data) {
      return res.status(400).json({
        error: 'No data provided',
        code: 'VALIDATION_NO_DATA'
      });
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        details: errors
      });
    }

    // Заменяем данные на валидированные
    req[property] = value;
    next();
  };
};

// Middleware для санитизации данных
const sanitizeData = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Удаляем потенциально опасные символы
      return value
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    
    return value;
  };

  // Санитизируем body, query и params
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);

  next();
};

// Middleware для проверки типов файлов
const validateFileType = (allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: `File type ${file.mimetype} is not allowed`,
          code: 'FILE_TYPE_NOT_ALLOWED',
          allowedTypes
        });
      }
    }

    next();
  };
};

// Middleware для проверки размера файлов
const validateFileSize = (maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          error: `File ${file.originalname} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE',
          maxSize: maxSize / 1024 / 1024
        });
      }
    }

    next();
  };
};

// Middleware для проверки количества файлов
const validateFileCount = (maxCount = 10) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    if (files.length > maxCount) {
      return res.status(400).json({
        error: `Too many files. Maximum allowed is ${maxCount}`,
        code: 'TOO_MANY_FILES',
        maxCount
      });
    }

    next();
  };
};

// Утилиты для валидации
const validationUtils = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  isValidColor: (color) => {
    const colorRegex = /^#[0-9A-F]{6}$/i;
    return colorRegex.test(color);
  },

  sanitizeString: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  validateObject: (obj, schema) => {
    const { error, value } = schema.validate(obj, {
      abortEarly: false,
      stripUnknown: true
    });

    return {
      isValid: !error,
      errors: error ? error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })) : [],
      value
    };
  }
};

module.exports = {
  validationSchemas,
  validate,
  sanitizeData,
  validateFileType,
  validateFileSize,
  validateFileCount,
  validationUtils
}; 