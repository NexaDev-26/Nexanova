import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Only log in development
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 NexaNova: Starting app...');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement);
  
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ App rendered successfully');
    }
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Error Loading App</h1>
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `;
  }
}

// Additional service worker cleanup (redundant safety check)
// Note: Service worker is already disabled in index.html before React loads
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
  // Double-check: unregister any remaining service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      // Silent cleanup in development
      registrations.forEach((registration) => {
        registration.unregister();
      });
    }
  });
  
  // Clear any remaining caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      if (cacheNames.length > 0) {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      }
    });
  }
}

