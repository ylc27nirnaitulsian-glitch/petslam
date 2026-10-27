import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { sound } from '../utils/audio';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    sound.playClick();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer border shadow-sm active:scale-95 ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
          : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-md'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
      aria-label="Toggle Light / Dark Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 animate-spin-slow transition-transform hover:rotate-90 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
      )}
      <span className="sr-only">{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
    </button>
  );
};
