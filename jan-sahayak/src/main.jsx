import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service Worker: UNREGISTER in dev to prevent stale cache issues.
// In production, you would register '/sw.js' instead.
if ('serviceWorker' in navigator) {
  // Unregister all existing service workers to clear stale cache
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
      console.log('[SW] Unregistered stale service worker')
    }
  })
  // Also clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
    console.log('[SW] Cleared all caches')
  }
}
