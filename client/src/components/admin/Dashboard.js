import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  MousePointer, 
  Users, 
  Globe, 
  MapPin,
  RotateCcw,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pageViews: 0,
    clicks: { whatsapp: 0, instagram: 0, phone: 0 },
    uniqueVisitors: 0,
    countries: [],
    dailyViews: [],
    topPages: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetingStats, setResetingStats] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { showToast, ToastContainer } = useToast();
  const isMounted = useRef(true);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    if (!isMounted.current) return false;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        if (isManualRefresh) {
          showToast('Токен авторизации не найден', 'error');
        }
        return false;
      }
      
      const response = await fetch(`/api/analytics/stats?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!isMounted.current) return false;
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
        return true;
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          // Токен недействителен, очищаем localStorage и перенаправляем на логин
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.reload();
          return false;
        }
        if (isManualRefresh) {
          showToast(`Ошибка загрузки данных: ${errorData.message || 'Неизвестная ошибка'}`, 'error');
        }
        return false;
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error fetching stats:', error);
        if (isManualRefresh) {
          showToast('Ошибка при получении статистики', 'error');
        }
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    fetchStats();
    
    const interval = setInterval(() => {
      fetchStats();
    }, 300000); // 5 минут

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchStats]);

  const handleResetClicks = async () => {
    setResetting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Небольшая задержка для обработки на сервере
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = await fetchStats(false);
        if (success) {
          showToast('Статистика кликов сброшена', 'success');
        } else {
          // Принудительно обновляем данные даже если fetchStats вернул false
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при сбросе статистики: ${errorData.message || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Error resetting clicks:', error);
      showToast('Ошибка при сбросе статистики', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      // Проверяем, есть ли токен
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('Сессия истекла. Войдите заново.', 'error');
        window.location.reload();
        return;
      }
      
      const success = await fetchStats(true);
      if (success) {
        showToast('Данные успешно обновлены', 'success');
      } else {
        showToast('Не удалось обновить данные. Попробуйте войти заново.', 'error');
      }
    } catch (error) {
      console.error('Error in manual refresh:', error);
      showToast('Ошибка при обновлении данных', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleResetAllStats = async () => {
    setResetingStats(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/analytics/reset-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Небольшая задержка для обработки на сервере
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = await fetchStats(false);
        if (success) {
          showToast('Вся статистика успешно сброшена', 'success');
        } else {
          // Принудительно обновляем данные даже если fetchStats вернул false
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        showToast(`Ошибка при сбросе статистики: ${errorData.message || 'Неизвестная ошибка'}`, 'error');
      }
    } catch (error) {
      console.error('Error resetting all stats:', error);
      showToast('Ошибка при сбросе статистики', 'error');
    } finally {
      setResetingStats(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value.toLocaleString()}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка статистики...</p>
      </div>
    );
  }

  // Исключаем телефон из подсчета общих кликов
  const totalClicks = (stats.clicks?.whatsapp || 0) + (stats.clicks?.instagram || 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Панель управления</h2>
          <p>Обзор статистики и аналитики сайта</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">
            <span>Обновлено: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <motion.button
            onClick={handleManualRefresh}
            className="refresh-btn"
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Обновить данные"
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          </motion.button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Eye}
          title="Просмотры страниц"
          value={stats.pageViews || 0}
          subtitle="За последние 30 дней"
          color="#ff6b9d"
        />
        <StatCard
          icon={MousePointer}
          title="Клики по кнопкам"
          value={totalClicks}
          subtitle="WhatsApp, Instagram"
          color="#667eea"
        />
        <StatCard
          icon={Users}
          title="Уникальные посетители"
          value={stats.uniqueVisitors || 0}
          subtitle="За последние 30 дней"
          color="#4facfe"
        />
        <StatCard
          icon={Globe}
          title="Страны"
          value={stats.countries?.length || 0}
          subtitle="Активные страны"
          color="#43e97b"
        />
      </div>

      <div className="dashboard-actions">
        <motion.button
          onClick={handleResetClicks}
          className="reset-btn"
          disabled={resetting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={18} />
          {resetting ? 'Сброс...' : 'Сбросить клики'}
        </motion.button>
        
        <motion.button
          onClick={handleResetAllStats}
          className="reset-all-btn"
          disabled={resetingStats}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={18} />
          {resetingStats ? 'Сброс...' : 'Сбросить статистику'}
        </motion.button>
      </div>

      <div className="charts-grid">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="chart-header">
            <h3>Просмотры по дням</h3>
            <span className="chart-subtitle">Последние 7 дней</span>
          </div>
          <div className="chart-content">
            {stats.dailyViews && stats.dailyViews.length > 0 ? (
              <div className="daily-views">
                {stats.dailyViews.slice(-7).map((day, index) => {
                  const maxViews = Math.max(...stats.dailyViews.slice(-7).map(d => d.views));
                  const height = maxViews > 0 ? Math.max((day.views / maxViews) * 100, 5) : 5;
                  
                  return (
                    <div key={index} className="day-bar">
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{ height: `${height}%` }}
                          title={`${day.views} просмотров`}
                        >
                          <span className="bar-value">{day.views}</span>
                        </div>
                      </div>
                      <span className="day-label">
                        {new Date(day.date).toLocaleDateString('ru-RU', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">
                <p>Нет данных за последние 7 дней</p>
                <small>Данные будут отображаться по мере накопления статистики</small>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="chart-header">
            <h3>Клики по кнопкам</h3>
            <span className="chart-subtitle">Всего: {totalClicks}</span>
          </div>
          <div className="chart-content">
            <div className="clicks-breakdown">
              <div className="click-item">
                <span className="click-label">WhatsApp</span>
                <div className="click-bar">
                  <div 
                    className="click-fill whatsapp" 
                    style={{ 
                      width: `${totalClicks > 0 ? ((stats.clicks?.whatsapp || 0) / totalClicks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="click-value">{stats.clicks?.whatsapp || 0}</span>
              </div>
              <div className="click-item">
                <span className="click-label">Instagram</span>
                <div className="click-bar">
                  <div 
                    className="click-fill instagram" 
                    style={{ 
                      width: `${totalClicks > 0 ? ((stats.clicks?.instagram || 0) / totalClicks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="click-value">{stats.clicks?.instagram || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {stats.countries.length > 0 && (
        <motion.div
          className="countries-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>Топ стран</h3>
          <div className="countries-grid">
            {stats.countries.slice(0, 5).map((country, index) => (
              <div key={index} className="country-item">
                <MapPin size={16} />
                <span className="country-name">{country.name}</span>
                <span className="country-count">{country.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default Dashboard; 