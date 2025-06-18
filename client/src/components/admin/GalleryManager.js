import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Upload, Image } from 'lucide-react';
import { useToast } from '../ui/Toast';
import './GalleryManager.css';

const GalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    title: { ru: '', de: '' },
    category: 'manicure',
    imageUrl: '',
    color: '#ff6b9d',
    order: 0,
    isActive: true
  });
  const { showToast, ToastContainer } = useToast();

  const fetchGalleryItems = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/gallery/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch('/api/admin/gallery/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return data.filename;
    } else {
      throw new Error('Ошибка загрузки изображения');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Проверяем наличие изображения только при создании нового элемента
      if (!editingItem && !selectedFile && !formData.imageUrl) {
        showToast('Необходимо выбрать изображение для новой работы', 'error');
        setUploading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      let imageUrl = formData.imageUrl;

      // Если выбран новый файл, загружаем его
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const url = editingItem 
        ? `/api/admin/gallery/${editingItem._id}`
        : '/api/admin/gallery';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      // Создаем FormData для отправки файла вместе с данными
      const submitFormData = new FormData();
      submitFormData.append('title[ru]', formData.title.ru);
      submitFormData.append('title[de]', formData.title.de);
      submitFormData.append('category', formData.category);
      submitFormData.append('color', formData.color);
      submitFormData.append('order', formData.order);
      submitFormData.append('isActive', formData.isActive);
      
      if (selectedFile) {
        // Если выбран новый файл
        submitFormData.append('image', selectedFile);
      } else if (editingItem && editingItem.imageUrl) {
        // При редактировании сохраняем существующее изображение
        submitFormData.append('imageUrl', editingItem.imageUrl);
      } else if (imageUrl) {
        // Если указан URL изображения
        submitFormData.append('imageUrl', imageUrl);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      if (response.ok) {
        fetchGalleryItems();
        resetForm();
        showToast(editingItem ? 'Работа успешно обновлена' : 'Работа успешно добавлена', 'success');
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при сохранении: ${errorData.error || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving gallery item:', error);
      showToast('Ошибка при сохранении: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент галереи?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchGalleryItems();
        showToast('Работа успешно удалена', 'success');
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при удалении: ${errorData.error || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      color: item.color,
      order: item.order,
      isActive: item.isActive
    });
    setPreviewUrl(item.imageUrl || '');
    setSelectedFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: { ru: '', de: '' },
      category: 'manicure',
      imageUrl: '',
      color: '#ff6b9d',
      order: 0,
      isActive: true
    });
    setEditingItem(null);
    setShowForm(false);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  if (loading) {
    return <div className="loading">Загрузка галереи...</div>;
  }

  return (
    <div className="gallery-manager">
      <div className="manager-header">
        <h2>Управление галереей</h2>
        <motion.button
          onClick={() => setShowForm(true)}
          className="add-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Добавить работу
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
              <h3>{editingItem ? 'Редактировать работу' : 'Добавить работу'}</h3>
              <button onClick={resetForm} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Название (RU):</label>
                  <input
                    type="text"
                    value={formData.title.ru}
                    onChange={(e) => setFormData({...formData, title: {...formData.title, ru: e.target.value}})}
                    placeholder="Необязательно"
                  />
                </div>
                <div className="form-group">
                  <label>Название (DE):</label>
                  <input
                    type="text"
                    value={formData.title.de}
                    onChange={(e) => setFormData({...formData, title: {...formData.title, de: e.target.value}})}
                    placeholder="Необязательно"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Категория:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="manicure">Маникюр</option>
                    <option value="pedicure">Педикюр</option>
                    <option value="design">Дизайн</option>
                    <option value="extensions">Наращивание</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Порядок:</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Изображение:</label>
                {editingItem && (
                  <p className="form-hint">
                    Оставьте пустым, чтобы сохранить текущее изображение
                  </p>
                )}
                <div className="image-upload-container">
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      id="image-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload" className="upload-btn">
                      <Upload size={20} />
                      {selectedFile ? 'Файл выбран' : (editingItem ? 'Заменить изображение' : 'Выбрать файл')}
                    </label>
                    {selectedFile && (
                      <span className="file-name">{selectedFile.name}</span>
                    )}
                  </div>
                  
                  {!selectedFile && !editingItem && (
                    <div className="url-input">
                      <label>Или введите URL изображения:</label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {previewUrl && (
                <div className="form-group">
                  <label>Предварительный просмотр:</label>
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Цвет фона:</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
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
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={uploading}>
                  <Save size={20} />
                  {uploading ? 'Сохранение...' : (editingItem ? 'Обновить' : 'Сохранить')}
                </button>
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <motion.div
            key={item._id}
            className="gallery-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div 
              className="item-preview"
              style={{ backgroundColor: item.color }}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title?.ru} />
              ) : (
                <div className="placeholder">
                  <Image size={40} />
                  <span>Нет изображения</span>
                </div>
              )}
            </div>
            <div className="item-info">
              <h4>{item.title?.ru}</h4>
              <p>Категория: {item.category}</p>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)} className="edit-btn">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(item._id)} className="delete-btn">
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

export default GalleryManager; 