const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Конфигурация логирования
const LOGGER_CONFIG = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  colors: {
    error: '\x1b[31m', // красный
    warn: '\x1b[33m',  // желтый
    info: '\x1b[36m',  // голубой
    debug: '\x1b[37m', // белый
    reset: '\x1b[0m'   // сброс
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  logDir: path.join(__dirname, '..', 'logs')
};

class Logger {
  constructor() {
    this.logDir = LOGGER_CONFIG.logDir;
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  async log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    // Консольный вывод
    this.consoleLog(level, logEntry);

    // Файловый вывод
    await this.fileLog(level, logEntry);

    // Мониторинг безопасности
    if (level === 'error' || level === 'warn') {
      await this.securityMonitor(logEntry);
    }
  }

  consoleLog(level, logEntry) {
    const color = LOGGER_CONFIG.colors[level] || LOGGER_CONFIG.colors.info;
    const reset = LOGGER_CONFIG.colors.reset;
    
    console.log(`${color}[${level.toUpperCase()}]${reset} ${logEntry.timestamp} - ${logEntry.message}`);
    
    if (logEntry.data) {
      console.log(`${color}Data:${reset}`, JSON.stringify(logEntry.data, null, 2));
    }
  }

  async fileLog(level, logEntry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `${level}-${date}.log`);
      
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine);

      // Проверяем размер файла и ротируем при необходимости
      await this.rotateLogFile(logFile);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  async rotateLogFile(logFile) {
    try {
      const stats = await fs.stat(logFile);
      
      if (stats.size > LOGGER_CONFIG.maxFileSize) {
        const timestamp = Date.now();
        const newFileName = `${logFile}.${timestamp}`;
        
        await fs.rename(logFile, newFileName);
        
        // Удаляем старые файлы
        await this.cleanOldLogs(path.dirname(logFile), path.basename(logFile, '.log'));
      }
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  async cleanOldLogs(logDir, baseName) {
    try {
      const files = await fs.readdir(logDir);
      const logFiles = files
        .filter(file => file.startsWith(baseName) && file !== baseName)
        .map(file => ({
          name: file,
          path: path.join(logDir, file)
        }));

      // Сортируем по времени создания
      const fileStats = await Promise.all(
        logFiles.map(async (file) => {
          const stats = await fs.stat(file.path);
          return { ...file, mtime: stats.mtime };
        })
      );

      fileStats.sort((a, b) => b.mtime - a.mtime);

      // Удаляем лишние файлы
      if (fileStats.length > LOGGER_CONFIG.maxFiles) {
        const filesToDelete = fileStats.slice(LOGGER_CONFIG.maxFiles);
        
        for (const file of filesToDelete) {
          await fs.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  async securityMonitor(logEntry) {
    try {
      const securityLogFile = path.join(this.logDir, 'security.log');
      const securityEntry = {
        ...logEntry,
        securityLevel: this.getSecurityLevel(logEntry),
        hash: this.generateHash(logEntry)
      };

      const logLine = JSON.stringify(securityEntry) + '\n';
      await fs.appendFile(securityLogFile, logLine);
    } catch (error) {
      console.error('Error writing security log:', error);
    }
  }

  getSecurityLevel(logEntry) {
    if (logEntry.level === 'error' && logEntry.message.includes('CSRF')) {
      return 'HIGH';
    }
    
    if (logEntry.level === 'error' && logEntry.message.includes('validation')) {
      return 'MEDIUM';
    }
    
    if (logEntry.level === 'warn') {
      return 'LOW';
    }
    
    return 'INFO';
  }

  generateHash(logEntry) {
    const data = JSON.stringify(logEntry);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Методы для разных уровней логирования
  error(message, data = {}) {
    return this.log('error', message, data);
  }

  warn(message, data = {}) {
    return this.log('warn', message, data);
  }

  info(message, data = {}) {
    return this.log('info', message, data);
  }

  debug(message, data = {}) {
    return this.log('debug', message, data);
  }

  // Специальные методы для безопасности
  securityEvent(event, data = {}) {
    return this.log('error', `SECURITY EVENT: ${event}`, {
      ...data,
      type: 'security',
      severity: 'high'
    });
  }

  accessLog(req, res, duration) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      return this.log('error', 'Request failed', logData);
    } else if (res.statusCode >= 300) {
      return this.log('warn', 'Request redirected', logData);
    } else {
      return this.log('info', 'Request successful', logData);
    }
  }

  // Метод для логирования файловых операций
  fileOperation(operation, filePath, data = {}) {
    return this.log('info', `File operation: ${operation}`, {
      filePath,
      ...data,
      type: 'file'
    });
  }

  // Метод для логирования валидации
  validationError(field, value, message) {
    return this.log('warn', 'Validation error', {
      field,
      value: typeof value === 'string' ? value.substring(0, 100) : value,
      message,
      type: 'validation'
    });
  }
}

// Создаем экземпляр логгера
const logger = new Logger();

// Middleware для логирования запросов
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.accessLog(req, res, duration);
    originalSend.call(this, data);
  };

  next();
};

// Middleware для логирования ошибок
const errorLogger = (error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  next(error);
};

// Утилиты для логирования
const logUtils = {
  logSecurityEvent: (event, data) => logger.securityEvent(event, data),
  logValidationError: (field, value, message) => logger.validationError(field, value, message),
  logFileOperation: (operation, filePath, data) => logger.fileOperation(operation, filePath, data),
  
  // Метод для получения логов
  async getLogs(level = 'info', limit = 100) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(LOGGER_CONFIG.logDir, `${level}-${date}.log`);
      
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n').reverse().slice(0, limit);
      
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  },

  // Метод для очистки логов
  async clearLogs(level = null) {
    try {
      const files = await fs.readdir(LOGGER_CONFIG.logDir);
      
      for (const file of files) {
        if (!level || file.startsWith(level)) {
          await fs.unlink(path.join(LOGGER_CONFIG.logDir, file));
        }
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  }
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  logUtils,
  LOGGER_CONFIG
}; 