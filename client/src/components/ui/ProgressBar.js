import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Upload } from 'lucide-react';
import './ProgressBar.css';

const ProgressBar = ({ 
  progress = 0, 
  status = 'uploading', // uploading, success, error, idle
  fileName = '',
  onCancel,
  className = '',
  variant = 'default' // default, compact, circular
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check size={16} />;
      case 'error':
        return <X size={16} />;
      case 'uploading':
        return <Upload size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'uploading':
        return 'var(--accent-primary)';
      default:
        return 'var(--text-muted)';
    }
  };

  if (variant === 'circular') {
    return (
      <div className={`progress-circular ${className}`}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="4"
          />
          <motion.circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke={getStatusColor()}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ strokeDasharray: 0, strokeDashoffset: 0 }}
            animate={{ 
              strokeDasharray: `${2 * Math.PI * 25}`,
              strokeDashoffset: `${2 * Math.PI * 25 * (1 - progress / 100)}`
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="progress-circular-content">
          <span className="progress-percentage">{Math.round(progress)}%</span>
          {getStatusIcon()}
        </div>
      </div>
    );
  }

  return (
    <div className={`progress-bar progress-${variant} ${className}`}>
      <div className="progress-header">
        <div className="progress-info">
          {fileName && (
            <span className="progress-filename">{fileName}</span>
          )}
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-actions">
          {status === 'uploading' && onCancel && (
            <button 
              className="progress-cancel"
              onClick={onCancel}
              title="Отменить загрузку"
            >
              <X size={16} />
            </button>
          )}
          {getStatusIcon() && (
            <div 
              className="progress-status-icon"
              style={{ color: getStatusColor() }}
            >
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
      
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          style={{ backgroundColor: getStatusColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      
      {variant === 'default' && status === 'uploading' && (
        <div className="progress-status">
          {progress < 100 ? 'Загрузка...' : 'Обработка...'}
        </div>
      )}
    </div>
  );
};

// Компонент для множественных загрузок
export const UploadProgress = ({ uploads = [], onCancelUpload }) => {
  if (uploads.length === 0) return null;

  return (
    <div className="upload-progress">
      <div className="upload-progress-header">
        <h4>Загрузка файлов</h4>
        <span className="upload-count">
          {uploads.filter(u => u.status === 'uploading').length} из {uploads.length}
        </span>
      </div>
      
      <div className="upload-list">
        {uploads.map((upload, index) => (
          <ProgressBar
            key={upload.id || index}
            progress={upload.progress}
            status={upload.status}
            fileName={upload.fileName}
            onCancel={() => onCancelUpload?.(upload.id)}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar; 