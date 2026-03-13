'use client';

import React, { useState } from 'react';
import { Download, File as FileIcon, Loader2, Archive, Trash2, RefreshCw, X, Maximize2 } from 'lucide-react';
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
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
      <aside className="w-full h-full flex flex-col bg-card">
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
              key="processing-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center text-center gap-3"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium">{progressText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={isImageResults ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
          <AnimatePresence mode="popLayout">
            {results.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${isImageResults ? "flex flex-col" : "flex items-center p-2 gap-3"}`}
              >
                {item.type === 'image' ? (
                  <div 
                    className="relative aspect-square w-full bg-muted overflow-hidden border-b border-border cursor-pointer group-hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage(item.url)}
                  >
                    <Image 
                      src={item.url} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-muted shrink-0 rounded-lg flex flex-col items-center justify-center gap-1 border border-border/50">
                    <FileIcon className="w-6 h-6 text-primary/40" />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">PDF</span>
                  </div>
                )}
                
                <div className={`flex items-center justify-between ${isImageResults ? "p-2" : "flex-grow min-w-0 pr-1"}`}>
                  <span className="text-[11px] font-semibold truncate mr-2">{item.name}</span>
                  <a 
                    href={item.url} 
                    download={item.name}
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                    title="Baixar Tabela/Imagem"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isProcessing && results.length === 0 && (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground/60"
            >
              <Archive className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-sm">Nenhum resultado ainda. Processe um arquivo para começar.</p>
            </motion.div>
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

      {/* Full Screen Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-md"
          >
            <div className="flex items-center justify-end p-4 shrink-0">
               <button 
                 className="p-2 bg-white/10 hover:bg-destructive/80 text-white rounded-full transition-all"
                 onClick={() => setPreviewImage(null)}
               >
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div 
              className="flex-grow flex items-center justify-center p-4 overflow-hidden relative cursor-zoom-out"
              onClick={() => setPreviewImage(null)}
            >
              <img 
                src={previewImage} 
                alt="Preview Expandido" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
