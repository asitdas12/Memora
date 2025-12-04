import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { metrics } from './services/metrics';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Track initial page load
const pageLoadStart = performance.now();

window.addEventListener('load', () => {
  const duration = performance.now() - pageLoadStart;
  metrics.trackPageLoad('initial_load', Math.round(duration));
});

// Track user activity on page load
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (user) {
  metrics.trackUserActivity(user.user_id);
}