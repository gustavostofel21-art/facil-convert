'use client';

import React from 'react';
import { Sun, Moon, Zap, FileType, Calculator, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header({ mainTab, setMainTab }: { mainTab?: 'conversor'|'calculadora', setMainTab?: (t: 'conversor'|'calculadora') => void }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Fácil Convert</span>
        </div>
        
        {/* Desktop Tabs */}
        {mainTab && setMainTab && (
          <div className="hidden md:flex bg-secondary/50 rounded-lg p-1">
            <button
              onClick={() => setMainTab('conversor')}
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                mainTab === 'conversor' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileType className="w-4 h-4" />
              Conversor
            </button>
            <button
              onClick={() => setMainTab('calculadora')}
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                mainTab === 'calculadora' 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calculadora
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
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
          
          {/* Mobile Menu Button */}
          {mainTab && (
            <button 
              className="md:hidden p-2 rounded-lg border border-border hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mainTab && setMainTab && mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2 shadow-lg absolute w-full top-16 left-0">
            <button
              onClick={() => { setMainTab('conversor'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                mainTab === 'conversor' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <FileType className="w-4 h-4" />
              Conversor
            </button>
            <button
              onClick={() => { setMainTab('calculadora'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                mainTab === 'calculadora' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calculadora
            </button>
        </div>
      )}
    </header>
  );
}
