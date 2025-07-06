
import './index.css'


import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
createRoot(document.getElementById("root")!).render(<App />);
const root = createRoot(document.getElementById('root')!);
root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <App />
  </GoogleOAuthProvider>
);