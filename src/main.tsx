import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Request persistent storage so Chrome/Android does NOT evict
// PWA localStorage between sessions (prevents auto-logout on PWA restart)
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {/* silent */});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
