import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
  };

    const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    
    // Небольшая задержка для закрытия меню
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      
      if (element) {
        // Используем scrollIntoView с отступом для header
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Дополнительная корректировка для учета высоты header
        setTimeout(() => {
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
          const headerOffset = -80;
          window.scrollTo({
            top: currentScroll - headerOffset,
            behavior: 'smooth'
          });
        }, 100);
        
      } else {
        console.error('Element with ID not found:', sectionId);
      }
    }, 100);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>SmartNails Stuttgart</h1>
        </div>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li><button onClick={() => scrollToSection('hero')}>{t('navigation.home')}</button></li>
            <li><button onClick={() => scrollToSection('services')}>{t('navigation.services')}</button></li>
            <li><button onClick={() => scrollToSection('gallery')}>{t('navigation.gallery')}</button></li>
            <li><button onClick={() => scrollToSection('about')}>О нас</button></li>
            <li><button onClick={() => scrollToSection('contact')}>{t('navigation.contact')}</button></li>
          </ul>
        </nav>

        <div className="header-controls">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="language-selector">
            <button className="language-btn" onClick={toggleLanguage}>
              <Globe size={20} />
              <span>{i18n.language.toUpperCase()}</span>
            </button>
            {isLanguageOpen && (
              <div className="language-dropdown">
                <button onClick={() => changeLanguage('ru')}>RU</button>
                <button onClick={() => changeLanguage('de')}>DE</button>
              </div>
            )}
          </div>

          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 