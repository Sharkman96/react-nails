import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw } from 'lucide-react';
import './PWAPrompt.css';

const PWAPrompt = ({ 
  canInstall, 
  isInstalled, 
  onInstall, 
  onUpdate, 
  isUpdateAvailable 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Показываем промпт только если можно установить и не установлено
  if (!canInstall || isInstalled || isDismissed || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await onInstall();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  const handleUpdate = () => {
    onUpdate();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="pwa-prompt"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pwa-content">
            <div className="pwa-icon">
              <Download size={24} />
            </div>
            
            <div className="pwa-text">
              <h3>Установить приложение</h3>
              <p>Добавьте Nail Master на главный экран для быстрого доступа</p>
            </div>
            
            <div className="pwa-actions">
              {isUpdateAvailable ? (
                <button 
                  className="pwa-update-btn"
                  onClick={handleUpdate}
                >
                  <RefreshCw size={16} />
                  Обновить
                </button>
              ) : (
                <button 
                  className="pwa-install-btn"
                  onClick={handleInstall}
                >
                  <Download size={16} />
                  Установить
                </button>
              )}
              
              <button 
                className="pwa-dismiss-btn"
                onClick={handleDismiss}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAPrompt; 