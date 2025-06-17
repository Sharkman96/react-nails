const Service = require('../models/Service');

// Функция для генерации ключа услуги на основе названия
const generateServiceKey = (serviceName) => {
  return serviceName
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/g, '') // убираем спецсимволы
    .replace(/\s+/g, '-') // заменяем пробелы на дефисы
    .replace(/[а-я]/g, (match) => { // транслитерация
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return translitMap[match] || match;
    })
    .slice(0, 50); // ограничиваем длину
};

// Получить все услуги
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Ошибка при получении услуг' });
  }
};

// Получить все услуги для админки
const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services admin error:', error);
    res.status(500).json({ message: 'Ошибка при получении услуг' });
  }
};

// Создать новую услугу
const createService = async (req, res) => {
  try {
    const serviceData = { ...req.body };
    
    // Автоматически генерируем ключ если он не указан
    if (!serviceData.key) {
      const baseKey = generateServiceKey(serviceData.name.ru);
      let key = baseKey;
      let counter = 1;
      
      // Проверяем уникальность ключа
      while (await Service.findOne({ key })) {
        key = `${baseKey}-${counter}`;
        counter++;
      }
      
      serviceData.key = key;
    }
    
    const service = new Service(serviceData);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Услуга с таким ключом уже существует' });
    }
    res.status(500).json({ message: 'Ошибка при создании услуги' });
  }
};

// Обновить услугу
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении услуги' });
  }
};

// Удалить услугу
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }
    
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