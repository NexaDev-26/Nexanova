import React from 'react';
import '../styles/LoadingSpinner.css';

export const SkeletonCard = ({ lines = 3 }) => {
  return (
    <div className="skeleton-card">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`skeleton skeleton-line ${
            idx === lines - 1 ? 'short' : idx === 0 ? 'medium' : ''
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCircle = () => {
  return <div className="skeleton skeleton-circle" />;
};

export const SkeletonRectangle = () => {
  return <div className="skeleton skeleton-rectangle" />;
};

