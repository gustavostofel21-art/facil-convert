'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Car, 
  Bike, 
  CloudRain, 
  Clock, 
  X
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
    setFipeValue(formatCurrency(e.target.value));
  };

  const clearFipe = () => {
    setFipeValue('');
    setNumericFipe(0);
  };

  const calculateCota = (percent: number, min: number) => {
    return Math.max(numericFipe * percent, min);
  };

  const renderFipeInput = () => (
    <div className="relative text-center">
      <label className="block text-sm font-medium text-muted-foreground mb-3">Valor FIPE:</label>
      <div className="relative">
        <input 
          type="text" 
          value={fipeValue} 
          onChange={handleFipeChange}
          placeholder="R$ 0,00"
          className="w-full py-4 px-5 text-center text-2xl font-bold bg-muted/60 border border-border/50 rounded-2xl focus:ring-2 focus:ring-[#37973d] outline-none transition-all text-foreground"
        />
        {fipeValue && (
          <button onClick={clearFipe} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-muted-foreground/20 rounded-xl text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  const renderCategorySelect = () => (
    <div className="pt-2 text-center">
      <label className="block text-sm font-medium text-muted-foreground mb-4">Selecione o tipo de veículo:</label>
      <div className="flex flex-col gap-3">
        <CategoryTab active={category === 'LEVE'} onClick={() => setCategory('LEVE')} label="Leve, pequeno" />
        <CategoryTab active={category === 'GRANDE'} onClick={() => setCategory('GRANDE')} label="Grande, pesado, Suv" />
        <CategoryTab active={category === 'ESPECIAL'} onClick={() => setCategory('ESPECIAL')} label="Gp Especial/ Blindado" />
      </div>
    </div>
  );

  const VoltarBtn = ({ to }: { to: Screen }) => (
    <div className="text-center pt-2">
      <button onClick={() => setScreen(to)} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase">
        VOLTAR
      </button>
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-5 pt-2">
      <h1 className="text-3xl font-extrabold text-center mb-10 text-foreground">Calculadora Facility</h1>
      <MenuButton 
        icon={<Calculator className="w-6 h-6 text-white" />} 
        title="Cota de Participação" 
        onClick={() => setScreen('COTA_MENU')}
      />
      <MenuButton 
        icon={<Car className="w-6 h-6 text-white" />} 
        title="Carro Reserva" 
        onClick={() => setScreen('CARRO_RESERVA')}
      />
      <MenuButton 
        icon={<Clock className="w-6 h-6 text-white" />} 
        title="Contador de Dias" 
        onClick={() => setScreen('CONTADOR_DIAS')}
      />
    </div>
  );

  const renderCotaMenu = () => (
    <div className="space-y-5 pt-2">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-foreground">Cota de Participação</h2>
      <MenuButton 
        icon={<Car className="w-6 h-6 text-white" />} 
        title="Carro" 
        onClick={() => { setCategory('LEVE'); setScreen('COTA_CARRO'); }}
      />
      <MenuButton 
        icon={<Bike className="w-6 h-6 text-white" />} 
        title="Moto" 
        onClick={() => { setCategory('LEVE'); setScreen('COTA_MOTO'); }}
      />
      <MenuButton 
        icon={<CloudRain className="w-6 h-6 text-white" />} 
        title="Alagamento" 
        onClick={() => { setCategory('LEVE'); setScreen('COTA_ALAGAMENTO'); }}
      />
      <VoltarBtn to="MENU" />
    </div>
  );

  const renderCotaCarro = () => {
    let percent = 0.04;
    let min = 1500;
    if (category === 'GRANDE') { percent = 0.05; min = 2000; }
    if (category === 'ESPECIAL') { percent = 0.10; min = 3000; }
    const result = calculateCota(percent, min);

    return (
      <div className="space-y-6 pt-2">
        <h2 className="text-3xl font-extrabold text-center text-foreground">Cálculo para Carro</h2>
        {renderFipeInput()}
        {renderCategorySelect()}

        {numericFipe > 0 && (
          <div className="mt-8 flex flex-row items-center justify-between border border-[#37973d]/40 bg-[#37973d]/5 dark:bg-[#37973d]/10 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-1 text-center border-r border-[#37973d]/20 pr-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Cota {percent * 100}%</p>
              <p className="text-2xl font-black text-[#37973d] dark:text-[#4ade80]">
                {result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="flex-1 text-center pl-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Cota em dobro</p>
              <p className="text-2xl font-black text-[#37973d] dark:text-[#4ade80]">
                {(result * 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-5">
          <VoltarBtn to="COTA_MENU" />
        </div>
      </div>
    );
  };

  const renderCotaMoto = () => {
    const result = calculateCota(0.10, 2000);
    return (
      <div className="space-y-6 pt-2">
        <h2 className="text-3xl font-extrabold text-center text-foreground">Cálculo para Moto</h2>
        {renderFipeInput()}

        {numericFipe > 0 && (
          <div className="mt-8 flex flex-row items-center justify-between border border-[#37973d]/40 bg-[#37973d]/5 dark:bg-[#37973d]/10 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-1 text-center border-r border-[#37973d]/20 pr-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Cota 10%</p>
              <p className="text-2xl font-black text-[#37973d] dark:text-[#4ade80]">
                {result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="flex-1 text-center pl-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Cota em dobro</p>
              <p className="text-2xl font-black text-[#37973d] dark:text-[#4ade80]">
                {(result * 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-5">
          <VoltarBtn to="COTA_MENU" />
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
      <div className="space-y-6 pt-2">
        <h2 className="text-3xl font-extrabold text-center text-foreground">Cálculo Alagamento</h2>
        {renderFipeInput()}
        {renderCategorySelect()}

        {numericFipe > 0 && (
          <div className="mt-8 flex flex-row items-center justify-center border border-[#37973d]/40 bg-[#37973d]/5 dark:bg-[#37973d]/10 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Cota 15%</p>
              <p className="text-3xl font-black text-[#37973d] dark:text-[#4ade80]">
                {result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-5">
          <VoltarBtn to="COTA_MENU" />
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
      <div className="space-y-6 pt-2">
        <h2 className="text-3xl font-extrabold text-center text-foreground">Carro Reserva</h2>
        
        <div className="relative text-center">
          <label className="block text-sm font-medium text-muted-foreground mb-4">Selecione a data do evento:</label>
          <div className="relative">
            <input 
              type="date" 
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full py-3 px-2 sm:py-4 sm:px-5 text-center text-base sm:text-2xl font-bold bg-muted/60 border border-border/50 rounded-2xl focus:ring-2 focus:ring-[#37973d] outline-none transition-all text-foreground m-0 appearance-none max-w-full"
            />
            {dateInput && (
              <button onClick={() => setDateInput('')} className="absolute right-12 top-1/2 -translate-y-1/2 p-2 hover:bg-muted-foreground/20 rounded-xl text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {dateInput && (
          <div className="mt-8 text-center border border-[#37973d]/40 bg-[#37973d]/5 dark:bg-[#37973d]/10 rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-muted-foreground font-semibold mb-2">Pode solicitar até:</p>
            <p className="text-3xl font-black text-[#37973d] dark:text-[#4ade80]">{resultDate}</p>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-5">
          <VoltarBtn to="MENU" />
        </div>
      </div>
    );
  };

  const renderContadorDias = () => {
    let diffDays = 0;
    let isValid = false;
    
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const diffMs = end.getTime() - start.getTime();
      diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      isValid = true;
    }

    return (
      <div className="space-y-6 pt-2">
        <h2 className="text-3xl font-extrabold text-center text-foreground">Controle de Datas</h2>
        
        <div className="space-y-5">
          <div className="relative text-center">
            <label className="block text-sm font-medium text-muted-foreground mb-3">Data Inicial:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-3 px-2 sm:py-4 sm:px-5 text-center text-base sm:text-2xl font-bold bg-muted/60 border border-border/50 rounded-2xl focus:ring-2 focus:ring-[#37973d] outline-none transition-all text-foreground m-0 appearance-none max-w-full"
            />
          </div>
          <div className="relative text-center">
            <label className="block text-sm font-medium text-muted-foreground mb-3">Data Final:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-3 px-2 sm:py-4 sm:px-5 text-center text-base sm:text-2xl font-bold bg-muted/60 border border-border/50 rounded-2xl focus:ring-2 focus:ring-[#37973d] outline-none transition-all text-foreground m-0 appearance-none max-w-full"
            />
          </div>
        </div>

        {isValid && (
          <div className={`mt-8 text-center border rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${diffDays >= 0 ? 'border-[#37973d]/40 bg-[#37973d]/5 dark:bg-[#37973d]/10' : 'border-destructive/40 bg-destructive/5'}`}>
            <p className="text-sm text-muted-foreground font-semibold mb-2">Total de Dias (Inclusivo):</p>
            <p className={`text-4xl font-black ${diffDays >= 0 ? 'text-[#37973d] dark:text-[#4ade80]' : 'text-destructive dark:text-red-400'}`}>
              {diffDays} {Math.abs(diffDays) === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-5">
          <VoltarBtn to="MENU" />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg lg:max-w-xl mx-auto flex items-center justify-center py-4 sm:py-8 px-4">
      <div className="bg-card text-card-foreground rounded-[2.5rem] shadow-2xl p-6 sm:p-10 w-full border border-border/40 transition-all dark:shadow-none dark:border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
      className="w-full flex flex-row items-center gap-5 py-5 px-6 bg-[#37973d] hover:bg-[#2f8234] text-white rounded-2xl transition-all shadow-md hover:shadow-lg shadow-[#37973d]/20 active:scale-[0.98]"
    >
      <div className="p-2 bg-white/20 rounded-xl shrink-0 backdrop-blur-sm">
        {icon}
      </div>
      <span className="font-extrabold text-lg tracking-wide">{title}</span>
    </button>
  );
}

function CategoryTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 px-5 rounded-2xl font-bold text-base transition-all ${
        active 
          ? 'bg-[#37973d] text-white shadow-md shadow-[#37973d]/20 scale-[1.02]' 
          : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}
