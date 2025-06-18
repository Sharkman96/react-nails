import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import './ServicesManager.css';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: { ru: '', de: '' },
    price: { ru: '', de: '' },
    description: { ru: '', de: '' },
    icon: 'scissors',
    color: '#ff6b9d',
    order: 0,
    isActive: true
  });
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/services/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error('Failed to fetch services:', response.status);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      const url = editingService 
        ? `/api/admin/services/${editingService._id}`
        : '/api/admin/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      // Подготавливаем данные для отправки
      const submitData = { ...formData };
      
      // Для новых услуг не отправляем пустой ключ - он сгенерируется автоматически
      if (!editingService && !submitData.key) {
        delete submitData.key;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        fetchServices();
        resetForm();
        showToast(editingService ? 'Услуга успешно обновлена' : 'Услуга успешно создана', 'success');
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при сохранении: ${errorData.message || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      showToast('Ошибка при сохранении услуги', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту услугу?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchServices();
        showToast('Услуга успешно удалена', 'success');
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при удалении: ${errorData.message || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      showToast('Ошибка при удалении услуги', 'error');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      key: service.key,
      name: service.name,
      price: service.price,
      description: service.description,
      icon: service.icon,
      color: service.color,
      order: service.order,
      isActive: service.isActive
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      key: '', // Ключ будет генерироваться автоматически
      name: { ru: '', de: '' },
      price: { ru: '', de: '' },
      description: { ru: '', de: '' }, // Теперь необязательно
      icon: 'scissors',
      color: '#ff6b9d',
      order: 0,
      isActive: true
    });
    setEditingService(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Загрузка услуг...</div>;
  }

  return (
    <div className="services-manager">
      <div className="manager-header">
        <h2>Управление услугами</h2>
        <motion.button
          onClick={() => setShowForm(true)}
          className="add-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Добавить услугу
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-overlay"
        >
          <div className="form-container">
            <div className="form-header">
              <h3>{editingService ? 'Редактировать услугу' : 'Добавить услугу'}</h3>
              <button onClick={resetForm} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                {editingService && (
                  <div className="form-group">
                    <label>Ключ услуги:</label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({...formData, key: e.target.value})}
                      required
                      disabled={!!editingService}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Порядок:</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Название (RU):</label>
                  <input
                    type="text"
                    value={formData.name.ru}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, ru: e.target.value}})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Название (DE):</label>
                  <input
                    type="text"
                    value={formData.name.de}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, de: e.target.value}})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Цена (RU):</label>
                  <input
                    type="text"
                    value={formData.price.ru}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, ru: e.target.value}})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Цена (DE):</label>
                  <input
                    type="text"
                    value={formData.price.de}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, de: e.target.value}})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Описание (RU) <span className="optional">(необязательно)</span>:</label>
                  <textarea
                    value={formData.description.ru}
                    onChange={(e) => setFormData({...formData, description: {...formData.description, ru: e.target.value}})}
                    placeholder="Описание услуги на русском языке"
                  />
                </div>
                <div className="form-group">
                  <label>Описание (DE) <span className="optional">(необязательно)</span>:</label>
                  <textarea
                    value={formData.description.de}
                    onChange={(e) => setFormData({...formData, description: {...formData.description, de: e.target.value}})}
                    placeholder="Beschreibung der Dienstleistung auf Deutsch"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Иконка:</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  >
                    <option value="scissors">Ножницы</option>
                    <option value="sparkles">Блестки</option>
                    <option value="palette">Палитра</option>
                    <option value="zap">Молния</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Цвет:</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Активна
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  <Save size={20} />
                  {editingService ? 'Обновить' : 'Сохранить'}
                </button>
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="services-list">
        {services.map((service) => (
          <motion.div
            key={service._id}
            className="service-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="service-info">
              <h4>{service.name?.ru}</h4>
              <p>{service.description?.ru}</p>
              <span className="service-price">{service.price?.ru}</span>
            </div>
            <div className="service-actions">
              <button onClick={() => handleEdit(service)} className="edit-btn">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(service._id)} className="delete-btn">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default ServicesManager; 