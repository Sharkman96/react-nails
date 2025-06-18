import React from 'react';
import './Skeleton.css';

const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  variant = 'default' // default, text, avatar, card
}) => {
  const skeletonClass = `skeleton skeleton-${variant} ${className}`;
  
  const style = {
    width,
    height,
    borderRadius
  };

  return (
    <div className={skeletonClass} style={style}>
      <div className="skeleton-shimmer"></div>
    </div>
  );
};

// Специализированные компоненты
export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="16px"
          width={index === lines - 1 ? '60%' : '100%'}
          className="skeleton-line"
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = '40px', className = '' }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      variant="avatar"
      className={className}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton height="200px" borderRadius="8px" className="skeleton-image" />
      <div className="skeleton-content">
        <Skeleton height="24px" width="80%" className="skeleton-title" />
        <SkeletonText lines={3} className="skeleton-description" />
        <Skeleton height="20px" width="40%" className="skeleton-price" />
      </div>
    </div>
  );
};

export const SkeletonGallery = ({ items = 6, className = '' }) => {
  return (
    <div className={`skeleton-gallery ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton
          key={index}
          height="250px"
          borderRadius="12px"
          variant="gallery"
          className="skeleton-gallery-item"
        />
      ))}
    </div>
  );
};

export default Skeleton; 