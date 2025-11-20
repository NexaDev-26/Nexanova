import React from 'react';
import '../styles/LoadingSpinner.css';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return <div style={{ padding: 20, textAlign: 'center' }}>{text}</div>;
}


const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

