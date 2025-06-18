import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import './Tooltip.css';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', // top, bottom, left, right
  type = 'info', // info, warning, error, success
  delay = 200,
  className = '',
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'success':
        return <CheckCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
        y = triggerRect.top - tooltipRect.height - 8 + scrollY;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollX;
        y = triggerRect.bottom + 8 + scrollY;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8 + scrollX;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollY;
        break;
      case 'right':
        x = triggerRect.right + 8 + scrollX;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollY;
        break;
    }

    // Проверяем границы экрана
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
    if (y < 0) y = 8;
    if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (disabled) return;
    setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsVisible(false);
  };

  return (
    <div 
      className={`tooltip-container ${className}`}
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`tooltip tooltip-${type} tooltip-${position}`}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tooltip-icon">
              {getIcon()}
            </div>
            <div className="tooltip-content">
              {content}
            </div>
            <div className={`tooltip-arrow tooltip-arrow-${position}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Специализированные компоненты
export const InfoTooltip = ({ children, content, ...props }) => (
  <Tooltip type="info" content={content} {...props}>
    {children}
  </Tooltip>
);

export const WarningTooltip = ({ children, content, ...props }) => (
  <Tooltip type="warning" content={content} {...props}>
    {children}
  </Tooltip>
);

export const ErrorTooltip = ({ children, content, ...props }) => (
  <Tooltip type="error" content={content} {...props}>
    {children}
  </Tooltip>
);

export const SuccessTooltip = ({ children, content, ...props }) => (
  <Tooltip type="success" content={content} {...props}>
    {children}
  </Tooltip>
);

// Компонент с иконкой вопроса
export const HelpTooltip = ({ content, ...props }) => (
  <Tooltip content={content} {...props}>
    <HelpCircle size={16} className="help-icon" />
  </Tooltip>
);

export default Tooltip; 