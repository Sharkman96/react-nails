const Service = require('../models/Service');

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
    const service = new Service(req.body);
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