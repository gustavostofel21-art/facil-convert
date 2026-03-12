'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Car, 
  Bike, 
  CloudRain, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  X,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Screen = 'MENU' | 'COTA_MENU' | 'COTA_CARRO' | 'COTA_MOTO' | 'COTA_ALAGAMENTO' | 'CARRO_RESERVA' | 'CONTADOR_DIAS';
type VehicleCategory = 'LEVE' | 'GRANDE' | 'ESPECIAL';

export default function Calculadora() {
  const [screen, setScreen] = useState<Screen>('MENU');
  const [fipeValue, setFipeValue] = useState<string>('');
  const [numericFipe, setNumericFipe] = useState<number>(0);
  const [category, setCategory] = useState<VehicleCategory>('LEVE');
  const [dateInput, setDateInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const numberValue = parseInt(cleanValue || '0') / 100;
    setNumericFipe(numberValue);
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleFipeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setFipeValue(formatted);
  };

  const clearFipe = () => {
    setFipeValue('');
    setNumericFipe(0);
  };

  const clearDate = () => setDateInput('');
  const clearStartDate = () => setStartDate('');
  const clearEndDate = () => setEndDate('');

  const resetAll = () => {
    clearFipe();
    clearDate();
    clearStartDate();
    clearEndDate();
    setCategory('LEVE');
  };

  const calculateCota = (percent: number, min: number) => {
    return Math.max(numericFipe * percent, min);
  };

  const renderMenu = () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Calculadora Facility</h1>
      <MenuButton 
        icon={<Calculator className="w-6 h-6" />} 
        title="Cota de Participação" 
        onClick={() => setScreen('COTA_MENU')}
      />
      <MenuButton 
        icon={<Car className="w-6 h-6" />} 
        title="Carro Reserva" 
        onClick={() => setScreen('CARRO_RESERVA')}
      />
      <MenuButton 
        icon={<Clock className="w-6 h-6" />} 
        title="Contador de Dias" 
        onClick={() => setScreen('CONTADOR_DIAS')}
      />
    </div>
  );

  const renderCotaMenu = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Cota de Participação</h2>
      <MenuButton 
        icon={<Car className="w-6 h-6" />} 
        title="Carro" 
        onClick={() => setScreen('COTA_CARRO')}
      />
      <MenuButton 
        icon={<Bike className="w-6 h-6" />} 
        title="Moto" 
        onClick={() => setScreen('COTA_MOTO')}
      />
      <MenuButton 
        icon={<CloudRain className="w-6 h-6" />} 
        title="Alagamento" 
        onClick={() => setScreen('COTA_ALAGAMENTO')}
      />
      <BackButton onClick={() => setScreen('MENU')} />
    </div>
  );

  const renderCotaCarro = () => {
    let percent = 0.04;
    let min = 1500;
    if (category === 'GRANDE') { percent = 0.05; min = 2000; }
    if (category === 'ESPECIAL') { percent = 0.10; min = 3000; }

    const result = calculateCota(percent, min);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800">Cota Carro</h2>
        
        <div className="flex gap-2">
          <CategoryTab active={category === 'LEVE'} onClick={() => setCategory('LEVE')} label="Leve" />
          <CategoryTab active={category === 'GRANDE'} onClick={() => setCategory('GRANDE')} label="Grande" />
          <CategoryTab active={category === 'ESPECIAL'} onClick={() => setCategory('ESPECIAL')} label="Especial" />
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor FIPE</label>
          <div className="relative">
            <input 
              type="text" 
              value={fipeValue} 
              onChange={handleFipeChange}
              placeholder="R$ 0,00"
              className="w-full p-4 pr-12 text-lg font-bold bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#388E3C] outline-none transition-all text-gray-800"
            />
            {fipeValue && (
              <button onClick={clearFipe} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {numericFipe > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <ResultBox label={`Cota ${percent * 100}%`} value={result} />
            <ResultBox label="Cota em Dobro" value={result * 2} />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={resetAll} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Limpar
          </button>
          <button onClick={() => setScreen('COTA_MENU')} className="flex-1 py-4 bg-[#388E3C] hover:bg-[#1E8838] text-white font-bold rounded-2xl transition-all">
            VOLTAR
          </button>
        </div>
      </div>
    );
  };

  const renderCotaMoto = () => {
    const result = calculateCota(0.10, 2000);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800">Cota Moto</h2>
        
        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor FIPE</label>
          <div className="relative">
            <input 
              type="text" 
              value={fipeValue} 
              onChange={handleFipeChange}
              placeholder="R$ 0,00"
              className="w-full p-4 pr-12 text-lg font-bold bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#388E3C] outline-none transition-all text-gray-800"
            />
            {fipeValue && (
              <button onClick={clearFipe} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {numericFipe > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <ResultBox label="Cota 10%" value={result} />
            <ResultBox label="Cota em Dobro" value={result * 2} />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={resetAll} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Limpar
          </button>
          <button onClick={() => setScreen('COTA_MENU')} className="flex-1 py-4 bg-[#388E3C] hover:bg-[#1E8838] text-white font-bold rounded-2xl transition-all">
            VOLTAR
          </button>
        </div>
      </div>
    );
  };

  const renderCotaAlagamento = () => {
    let min = 1500;
    if (category === 'GRANDE') min = 2000;
    if (category === 'ESPECIAL') min = 3000;

    const result = calculateCota(0.15, min);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800">Cota Alagamento</h2>
        
        <div className="flex gap-2">
          <CategoryTab active={category === 'LEVE'} onClick={() => setCategory('LEVE')} label="Leve" />
          <CategoryTab active={category === 'GRANDE'} onClick={() => setCategory('GRANDE')} label="Grande" />
          <CategoryTab active={category === 'ESPECIAL'} onClick={() => setCategory('ESPECIAL')} label="Especial" />
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor FIPE</label>
          <div className="relative">
            <input 
              type="text" 
              value={fipeValue} 
              onChange={handleFipeChange}
              placeholder="R$ 0,00"
              className="w-full p-4 pr-12 text-lg font-bold bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#388E3C] outline-none transition-all text-gray-800"
            />
            {fipeValue && (
              <button onClick={clearFipe} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {numericFipe > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <ResultBox label="Cota 15%" value={result} />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={resetAll} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Limpar
          </button>
          <button onClick={() => setScreen('COTA_MENU')} className="flex-1 py-4 bg-[#388E3C] hover:bg-[#1E8838] text-white font-bold rounded-2xl transition-all">
            VOLTAR
          </button>
        </div>
      </div>
    );
  };

  const renderCarroReserva = () => {
    let resultDate = '';
    if (dateInput) {
      const date = new Date(dateInput + 'T00:00:00Z');
      date.setUTCDate(date.getUTCDate() + 30);
      resultDate = date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800">Carro Reserva</h2>
        
        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Início</label>
          <div className="relative">
            <input 
              type="date" 
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full p-4 pr-12 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#388E3C] outline-none transition-all text-gray-800"
            />
            {dateInput && (
              <button onClick={clearDate} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {dateInput && (
          <div className="p-6 bg-[#388E3C] text-white rounded-2xl shadow-lg animate-in zoom-in-95">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Data de Devolução (30 dias)</p>
            <p className="text-3xl font-bold">{resultDate}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={resetAll} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Limpar
          </button>
          <button onClick={() => setScreen('MENU')} className="flex-1 py-4 bg-[#388E3C] hover:bg-[#1E8838] text-white font-bold rounded-2xl transition-all">
            VOLTAR
          </button>
        </div>
      </div>
    );
  };

  const renderContadorDias = () => {
    let diffDays = 0;
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const diffMs = end.getTime() - start.getTime();
      diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800">Contador de Dias</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Inicial</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-4 pr-12 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#388E3C] outline-none transition-all text-gray-800"
              />
              {startDate && (
                <button onClick={clearStartDate} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Final</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-4 pr-12 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#388E3C] outline-none transition-all text-gray-800"
              />
              {endDate && (
                <button onClick={clearEndDate} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {startDate && endDate && (
          <div className={`p-6 rounded-2xl shadow-lg animate-in zoom-in-95 ${diffDays >= 0 ? 'bg-[#388E3C] text-white' : 'bg-red-500 text-white'}`}>
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Total de Dias (Inclusivo)</p>
            <p className="text-3xl font-bold">{diffDays} {Math.abs(diffDays) === 1 ? 'dia' : 'dias'}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={resetAll} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Limpar
          </button>
          <button onClick={() => setScreen('MENU')} className="flex-1 py-4 bg-[#388E3C] hover:bg-[#1E8838] text-white font-bold rounded-2xl transition-all">
            VOLTAR
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full mx-auto border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {screen === 'MENU' && renderMenu()}
            {screen === 'COTA_MENU' && renderCotaMenu()}
            {screen === 'COTA_CARRO' && renderCotaCarro()}
            {screen === 'COTA_MOTO' && renderCotaMoto()}
            {screen === 'COTA_ALAGAMENTO' && renderCotaAlagamento()}
            {screen === 'CARRO_RESERVA' && renderCarroReserva()}
            {screen === 'CONTADOR_DIAS' && renderContadorDias()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MenuButton({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-5 bg-[#388E3C] hover:bg-[#1E8838] text-white rounded-2xl transition-all shadow-md active:scale-95"
    >
      <div className="p-2 bg-white/20 rounded-xl">
        {icon}
      </div>
      <span className="font-bold text-lg">{title}</span>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all mt-4"
    >
      VOLTAR
    </button>
  );
}

function CategoryTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
        active 
          ? 'bg-[#388E3C] text-white shadow-md' 
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function ResultBox({ label, value }: { label: string, value: number }) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-2xl font-black text-[#388E3C]">
        {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
    </div>
  );
}
