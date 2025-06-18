import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholderSrc = null,
  threshold = 100,
  effect = 'blur',
  width = '100%',
  height = 'auto',
  style = {},
  onClick = null,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Если изображение не загрузилось, показываем placeholder
  if (imageError) {
    return (
      <div 
        className={`lazy-image-placeholder ${className}`}
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        onClick={onClick}
      >
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>
    );
  }

  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={`lazy-image ${className} ${imageLoaded ? 'loaded' : ''}`}
      effect={effect}
      threshold={threshold}
      width={width}
      height={height}
      style={style}
      onClick={onClick}
      placeholderSrc={placeholderSrc}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
};

export default LazyImage; 