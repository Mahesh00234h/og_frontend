import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

// Initialize Vercel Web Analytics
inject()

const root = createRoot(document.getElementById('root')!)

root.render(
  <GoogleOAuthProvider clientId="712725841074-oqj0hsr6jqjq3efrklr30l848o8fsk6h.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)
 

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => console.log("✅ Service Worker registered:", reg))
      .catch(err => console.error("❌ Service Worker failed:", err));
  });
}
