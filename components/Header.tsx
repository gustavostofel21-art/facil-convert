'use client';

import React from 'react';
import { Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Fácil Convert</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted transition-colors border border-border"
          aria-label="Alternar tema"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-stone-600" />
          ) : (
            <Sun className="w-5 h-5 text-stone-300" />
          )}
        </button>
      </div>
    </header>
  );
}
