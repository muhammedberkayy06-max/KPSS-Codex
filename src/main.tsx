import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/app.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const cleanupLegacyServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => {
      if (registration.active?.scriptURL.endsWith('/sw.js')) {
        return registration.unregister();
      }
      return Promise.resolve(false);
    })
  );
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('kpss-ultimate'))
        .map((key) => caches.delete(key))
    );
  }
};

cleanupLegacyServiceWorker().finally(() => {
  registerSW({
    immediate: true
  });
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
