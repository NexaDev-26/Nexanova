import React from 'react';
import './GradientBackground.css';

const GradientBackground = ({ 
  gradient = 'primary', 
  children, 
  className = '',
  style = {} 
}) => {
  const gradientClass = `gradient-${gradient}`;
  
  return (
    <div 
      className={`gradient-background ${gradientClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default GradientBackground;

