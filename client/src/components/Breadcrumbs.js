import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createBreadcrumbSchema } from '../utils/schema';
import SEO from './SEO';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation();
  
  // Автоматически генерируем хлебные крошки на основе текущего пути
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [
      { name: 'Главная', url: '/' }
    ];

    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      // Маппинг путей на читаемые названия
      const pathMap = {
        'services': 'Услуги',
        'gallery': 'Галерея',
        'contact': 'Контакты',
        'about': 'О нас',
        'admin': 'Админ панель'
      };
      
      breadcrumbs.push({
        name: pathMap[name] || name,
        url: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs();
  
  // Создаем Schema.org разметку для хлебных крошек
  const breadcrumbSchema = createBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <SEO schema={breadcrumbSchema} />
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ol className="breadcrumbs-list">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {index === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-current" aria-current="page">
                  {index === 0 ? <Home size={16} /> : null}
                  {item.name}
                </span>
              ) : (
                <Link to={item.url} className="breadcrumb-link">
                  {index === 0 ? <Home size={16} /> : null}
                  {item.name}
                </Link>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight size={16} className="breadcrumb-separator" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs; 