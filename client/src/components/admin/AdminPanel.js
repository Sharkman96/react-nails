import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Image, Package, BarChart3 } from 'lucide-react';
import Login from './Login';
import ServicesManager from './ServicesManager';
import GalleryManager from './GalleryManager';
import Dashboard from './Dashboard';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (token && userData) {
      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-title">
              <h1>Панель управления</h1>
              <p>Управление сайтом nail-мастера</p>
            </div>
            <div className="admin-user">
              <div className="user-info">
                <span className="user-greeting">Добро пожаловать,</span>
                <span className="user-name">{user?.username}</span>
              </div>
              <motion.button
                onClick={logout}
                className="logout-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
                Выйти
              </motion.button>
            </div>
          </div>
        </header>

        <div className="admin-tabs">
          <motion.button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 size={20} />
            Статистика
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Package size={20} />
            Услуги
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image size={20} />
            Галерея
          </motion.button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'services' && <ServicesManager />}
          {activeTab === 'gallery' && <GalleryManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 