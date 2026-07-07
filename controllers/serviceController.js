const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'services.json');

// Чтение данных из JSON файла
const readServices = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading services file:', error);
    return [];
  }
};

// Запись данных в JSON файл
const writeServices = async (services) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(services, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing services file:', error);
    return false;
  }
};

// Генерация уникального ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Функция для генерации ключа услуги на основе названия
const generateServiceKey = (serviceName) => {
  return serviceName
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[а-я]/g, (match) => {
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return translitMap[match] || match;
    })
    .slice(0, 50);
};

// Получить все услуги (публичный API)
const getAllServices = async (req, res) => {
  try {
    const services = await readServices();
    const activeServices = services
      .filter(service => service.isActive)
      .sort((a, b) => a.order - b.order);
    res.json(activeServices);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Ошибка при получении услуг' });
  }
};

// Получить все услуги для админки
const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await readServices();
    const sortedServices = services.sort((a, b) => a.order - b.order);
    res.json(sortedServices);
  } catch (error) {
    console.error('Get services admin error:', error);
    res.status(500).json({ message: 'Ошибка при получении услуг' });
  }
};

// Создать новую услугу
const createService = async (req, res) => {
  try {
    const services = await readServices();
    const serviceData = { ...req.body };
    
    // Генерируем ID
    serviceData.id = generateId();
    serviceData._id = serviceData.id; // Для совместимости с фронтендом
    
    // Автоматически генерируем ключ если он не указан
    if (!serviceData.key) {
      const baseKey = generateServiceKey(serviceData.name.ru);
      let key = baseKey;
      let counter = 1;
      
      while (services.find(s => s.key === key)) {
        key = `${baseKey}-${counter}`;
        counter++;
      }
      
      serviceData.key = key;
    }
    
    // Устанавливаем порядок
    if (!serviceData.order) {
      const maxOrder = services.reduce((max, s) => Math.max(max, s.order || 0), 0);
      serviceData.order = maxOrder + 1;
    }
    
    // Устанавливаем isActive по умолчанию
    if (serviceData.isActive === undefined) {
      serviceData.isActive = true;
    }
    
    services.push(serviceData);
    await writeServices(services);
    
    res.status(201).json(serviceData);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Ошибка при создании услуги' });
  }
};

// Обновить услугу
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const services = await readServices();
    
    const index = services.findIndex(s => s.id === id || s._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }
    
    services[index] = { ...services[index], ...req.body };
    await writeServices(services);
    
    res.json(services[index]);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении услуги' });
  }
};

// Удалить услугу
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const services = await readServices();
    
    const index = services.findIndex(s => s.id === id || s._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }
    
    services.splice(index, 1);
    await writeServices(services);
    
    res.json({ message: 'Услуга успешно удалена' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Ошибка при удалении услуги' });
  }
};

module.exports = {
  getAllServices,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService
};
