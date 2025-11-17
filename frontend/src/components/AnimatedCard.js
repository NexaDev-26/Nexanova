import React from 'react';
import './AnimatedCard.css';

const AnimatedCard = ({ 
  children, 
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  onClick
}) => {
  const classes = [
    'animated-card',
    hover && 'animated-card-hover',
    glow && 'animated-card-glow',
    gradient && 'animated-card-gradient',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;

