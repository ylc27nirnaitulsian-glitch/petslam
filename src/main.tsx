import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClarity } from './utils/clarity.ts';
import { initDiscordSdk } from './utils/discordSdk.ts';

// Initialize Microsoft Clarity Analytics if configured
initClarity();

// Initialize Discord Embedded App SDK if running inside Discord Activity
initDiscordSdk();

// Register PWA Service Worker for offline play & instant boot
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[PET SLAM] SW registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
