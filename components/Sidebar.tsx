'use client';

import React from 'react';
import { Download, File as FileIcon, Loader2, Archive, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export interface ResultItem {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image';
  blob: Blob;
}

interface SidebarProps {
  results: ResultItem[];
  isProcessing: boolean;
  progressText: string;
  onDownloadAll: () => void;
  onClear: () => void;
  onConvertToPng?: () => void;
  activeTool: string;
  totalPdfPages?: number;
  currentBatchStart?: number;
  onNextBatch?: () => void;
}

export default function Sidebar({ 
  results, 
  isProcessing, 
  progressText, 
  onDownloadAll, 
  onClear, 
  onConvertToPng, 
  activeTool,
  totalPdfPages = 0,
  currentBatchStart = 1,
  onNextBatch
}: SidebarProps) {
  const hasPdfs = results.length > 0 && results.some(r => r.type === 'pdf');
  const isImageResults = results.length > 0 && results.every(r => r.type === 'image');
  
  const hasMorePages = totalPdfPages > 0 && (currentBatchStart + 19) < totalPdfPages;
  const nextBatchRange = {
    start: currentBatchStart + 20,
    end: Math.min(currentBatchStart + 39, totalPdfPages)
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 border-l border-border bg-card h-full lg:h-[calc(100vh-64px)] flex flex-col sticky top-16">
      {/* Fixed Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50 shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
          Resultados {results.length > 0 && `(${results.length} itens)`}
        </h3>
        {results.length > 0 && !isProcessing && (
          <button 
            onClick={onClear}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
            title="Limpar tudo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center text-center gap-3"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium">{progressText}</p>
            </motion.div>
          )}

          {results.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {item.type === 'image' ? (
                <div className="relative aspect-square w-full bg-muted">
                  <Image 
                    src={item.url} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-muted flex flex-col items-center justify-center gap-2 p-4">
                  <FileIcon className="w-12 h-12 text-primary/40" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">PDF Page</span>
                </div>
              )}
              
              <div className="p-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium truncate flex-grow">{item.name}</span>
                <a 
                  href={item.url} 
                  download={item.name}
                  className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}

          {!isProcessing && results.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground/60">
              <Archive className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-sm">Nenhum resultado ainda. Processe um arquivo para começar.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Footer */}
      <div className="p-4 border-t border-border bg-secondary/50 shrink-0 space-y-3">
        {hasMorePages && !isProcessing && onNextBatch && (
          <button
            onClick={onNextBatch}
            className="w-full py-3 bg-secondary text-secondary-foreground border border-border rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all mb-2"
          >
            <RefreshCw className="w-4 h-4" />
            Converter próximas páginas ({nextBatchRange.start} a {nextBatchRange.end})
          </button>
        )}

        <button
          onClick={onDownloadAll}
          disabled={results.length === 0 || isProcessing}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          <Archive className="w-5 h-5" />
          {isImageResults ? 'Baixar Imagens (.ZIP)' : 'Baixar Tudo (.ZIP)'}
        </button>

        {activeTool === 'split-pdf' && hasPdfs && !isProcessing && onConvertToPng && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3"
          >
            <p className="text-xs font-semibold text-center text-primary">
              Deseja converter estas páginas para imagem (PNG) também?
            </p>
            <button
              onClick={onConvertToPng}
              className="w-full py-2 bg-white dark:bg-primary border border-primary rounded-lg text-xs font-bold text-primary dark:text-primary-foreground hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Sim, converter para PNG
            </button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
