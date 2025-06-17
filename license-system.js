const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class LicenseSystem {
  constructor() {
    this.secretKey = process.env.LICENSE_SECRET_KEY || 'your-secret-key';
    this.licenses = new Map();
  }

  // Генерация лицензионного ключа
  generateLicenseKey(licenseData) {
    const license = {
      id: crypto.randomUUID(),
      type: licenseData.type, // 'commercial', 'saas', 'white-label'
      features: licenseData.features,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + licenseData.duration * 24 * 60 * 60 * 1000),
      maxUsers: licenseData.maxUsers || 1000,
      domain: licenseData.domain,
      company: licenseData.company,
      price: licenseData.price
    };

    // Создание JWT токена
    const token = jwt.sign(license, this.secretKey, { expiresIn: '1y' });
    
    this.licenses.set(license.id, { ...license, token });
    return { licenseId: license.id, token };
  }

  // Проверка лицензии
  validateLicense(token) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      const license = this.licenses.get(decoded.id);
      
      if (!license) {
        return { valid: false, error: 'License not found' };
      }

      if (new Date() > new Date(license.validUntil)) {
        return { valid: false, error: 'License expired' };
      }

      return { valid: true, license };
    } catch (error) {
      return { valid: false, error: 'Invalid license' };
    }
  }

  // Проверка функций
  checkFeature(license, feature) {
    if (!license.valid) return false;
    return license.license.features.includes(feature);
  }

  // Обновление лицензии
  renewLicense(licenseId, duration) {
    const license = this.licenses.get(licenseId);
    if (!license) return false;

    license.validUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    license.token = jwt.sign(license, this.secretKey, { expiresIn: '1y' });
    
    this.licenses.set(licenseId, license);
    return true;
  }

  // Получение статистики лицензий
  getLicenseStats() {
    const stats = {
      total: this.licenses.size,
      active: 0,
      expired: 0,
      byType: {}
    };

    for (const [id, license] of this.licenses) {
      const isActive = new Date() < new Date(license.validUntil);
      if (isActive) stats.active++;
      else stats.expired++;

      stats.byType[license.type] = (stats.byType[license.type] || 0) + 1;
    }

    return stats;
  }
}

module.exports = LicenseSystem; 