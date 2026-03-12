'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar, { ResultItem } from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileText, Image as ImageIcon, FileType, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PdfSplitter = dynamic(() => import('@/components/PdfSplitter'), { ssr: false });
const HeicBatchConverter = dynamic(() => import('@/components/HeicBatchConverter'), { ssr: false });
const PdfToImageConverter = dynamic(() => import('@/components/PdfToImageConverter'), { ssr: false });

type Tool = 'split-pdf' | 'heic-batch' | 'pdf-to-image';

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>('split-pdf');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');

  const handleResults = useCallback((newResults: ResultItem[]) => {
    setResults(prev => [...newResults, ...prev]);
  }, []);

  const handleDownloadAll = async () => {
    if (results.length === 0) return;
    
    const zip = new JSZip();
    results.forEach(item => {
      zip.file(item.name, item.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `facil_convert_${Date.now()}.zip`);
  };

  const handleClear = () => {
    results.forEach(item => URL.revokeObjectURL(item.url));
    setResults([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="flex flex-col lg:flex-row flex-grow lg:h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-background/50">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Tool Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTool('split-pdf')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  activeTool === 'split-pdf' 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-green-600/20 scale-[1.02]" 
                    : "bg-card border-border hover:bg-secondary/50"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold text-sm">Dividir PDF</span>
              </button>
              <button
                onClick={() => setActiveTool('heic-batch')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  activeTool === 'heic-batch' 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-green-600/20 scale-[1.02]" 
                    : "bg-card border-border hover:bg-secondary/50"
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">HEIC em Lote</span>
              </button>
              <button
                onClick={() => setActiveTool('pdf-to-image')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  activeTool === 'pdf-to-image' 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-green-600/20 scale-[1.02]" 
                    : "bg-card border-border hover:bg-secondary/50"
                }`}
              >
                <FileType className="w-5 h-5" />
                <span className="font-semibold text-sm">PDF para Imagem</span>
              </button>
            </div>

            {/* Active Tool View */}
            <div className="mt-8">
              <AnimatePresence mode="wait">
                {activeTool === 'split-pdf' && (
                  <motion.div
                    key="split-pdf"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <PdfSplitter 
                      onResults={handleResults} 
                      setIsProcessing={setIsProcessing} 
                      setProgressText={setProgressText} 
                    />
                  </motion.div>
                )}
                {activeTool === 'heic-batch' && (
                  <motion.div
                    key="heic-batch"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <HeicBatchConverter 
                      onResults={handleResults} 
                      setIsProcessing={setIsProcessing} 
                      setProgressText={setProgressText} 
                    />
                  </motion.div>
                )}
                {activeTool === 'pdf-to-image' && (
                  <motion.div
                    key="pdf-to-image"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <PdfToImageConverter 
                      onResults={handleResults} 
                      setIsProcessing={setIsProcessing} 
                      setProgressText={setProgressText} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Results Sidebar */}
        <Sidebar 
          results={results} 
          isProcessing={isProcessing} 
          progressText={progressText}
          onDownloadAll={handleDownloadAll}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
