const LicenseSystem = require('./license-system');

const licenseSystem = new LicenseSystem();

// Middleware для проверки лицензии
const licenseMiddleware = (requiredFeatures = []) => {
  return (req, res, next) => {
    const licenseToken = req.headers['x-license-token'] || req.query.license;
    
    if (!licenseToken) {
      return res.status(403).json({
        error: 'License token required',
        message: 'Please provide a valid license token'
      });
    }

    const validation = licenseSystem.validateLicense(licenseToken);
    
    if (!validation.valid) {
      return res.status(403).json({
        error: 'Invalid license',
        message: validation.error
      });
    }

    // Проверка требуемых функций
    for (const feature of requiredFeatures) {
      if (!licenseSystem.checkFeature(validation, feature)) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `Feature '${feature}' is not included in your license`
        });
      }
    }

    // Добавляем информацию о лицензии в запрос
    req.license = validation.license;
    next();
  };
};

// Middleware для ограничения пользователей
const userLimitMiddleware = (req, res, next) => {
  const license = req.license;
  
  if (!license) {
    return res.status(403).json({ error: 'License not found' });
  }

  // Здесь можно добавить логику подсчета пользователей
  // const currentUsers = await getUserCount(license.id);
  
  // if (currentUsers >= license.maxUsers) {
  //   return res.status(403).json({
  //     error: 'User limit exceeded',
  //     message: `Maximum ${license.maxUsers} users allowed`
  //   });
  // }

  next();
};

// API для управления лицензиями
const licenseRoutes = (app) => {
  // Генерация новой лицензии
  app.post('/api/license/generate', (req, res) => {
    const { type, features, duration, maxUsers, domain, company, price } = req.body;
    
    const licenseData = {
      type,
      features,
      duration,
      maxUsers,
      domain,
      company,
      price
    };

    const license = licenseSystem.generateLicenseKey(licenseData);
    
    res.json({
      success: true,
      license: {
        id: license.licenseId,
        token: license.token,
        ...licenseData
      }
    });
  });

  // Проверка лицензии
  app.post('/api/license/validate', (req, res) => {
    const { token } = req.body;
    const validation = licenseSystem.validateLicense(token);
    
    res.json({
      valid: validation.valid,
      license: validation.valid ? validation.license : null,
      error: validation.error
    });
  });

  // Обновление лицензии
  app.post('/api/license/renew', (req, res) => {
    const { licenseId, duration } = req.body;
    const success = licenseSystem.renewLicense(licenseId, duration);
    
    res.json({
      success,
      message: success ? 'License renewed successfully' : 'Failed to renew license'
    });
  });

  // Статистика лицензий
  app.get('/api/license/stats', (req, res) => {
    const stats = licenseSystem.getLicenseStats();
    res.json(stats);
  });
};

module.exports = {
  licenseMiddleware,
  userLimitMiddleware,
  licenseRoutes
}; 