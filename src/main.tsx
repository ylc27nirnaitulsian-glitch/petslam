import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClarity } from './utils/clarity.ts';

// Initialize Microsoft Clarity Analytics if configured
initClarity();

createRoot(document.getElementById('root')!).render(<App />);
