'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar, { ResultItem } from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileText, Image as ImageIcon, FileType, LayoutGrid, Download, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjs from 'pdfjs-dist';

const PdfSplitter = dynamic(() => import('@/components/PdfSplitter'), { ssr: false });
const HeicBatchConverter = dynamic(() => import('@/components/HeicBatchConverter'), { ssr: false });
const PdfToImageConverter = dynamic(() => import('@/components/PdfToImageConverter'), { ssr: false });
const ImageToPdfConverter = dynamic(() => import('@/components/ImageToPdfConverter'), { ssr: false });
const Calculadora = dynamic(() => import('@/components/Calculadora'), { ssr: false });

// Set worker source to local public folder
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
}

type Tool = 'split-pdf' | 'heic-batch' | 'pdf-to-image' | 'image-to-pdf';
type MainTab = 'conversor' | 'calculadora';

export default function Home() {
  const [mainTab, setMainTab] = useState<MainTab>('conversor');
  const [activeTool, setActiveTool] = useState<Tool>('split-pdf');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [toolKey, setToolKey] = useState(0);

  // Batching state
  const [sourcePdf, setSourcePdf] = useState<File | null>(null);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [currentBatchStart, setCurrentBatchStart] = useState(1);

  const handleResults = useCallback((newResults: ResultItem[]) => {
    setResults(prev => [...newResults, ...prev]);
  }, []);

  const handlePdfReady = useCallback((file: File, pageCount: number) => {
    setSourcePdf(file);
    setTotalPdfPages(pageCount);
    setCurrentBatchStart(1);
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
    // Revoke all URLs to prevent memory leaks
    results.forEach(item => URL.revokeObjectURL(item.url));
    
    // Reset all states
    setResults([]);
    setIsProcessing(false);
    setProgressText('');
    setSourcePdf(null);
    setTotalPdfPages(0);
    setCurrentBatchStart(1);
    
    // Increment key to force re-mount of tool components (resets internal errors/files)
    setToolKey(prev => prev + 1);
  };

  const processBatch = async (file: File, start: number, total: number) => {
    setIsProcessing(true);
    const imageResults: ResultItem[] = [];
    const end = Math.min(start + 19, total);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      for (let i = start; i <= end; i++) {
        setProgressText(`Convertendo página ${i} de ${total} para PNG...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        imageResults.push({
          id: `conv-${Date.now()}-${i}`,
          name: `Pagina_${i}.png`,
          url: dataUrl,
          type: 'image',
          blob
        });
      }

      if (start === 1) {
        // Limpa os arquivos da conversão anterior (ex. o arquivo em PDF dividido) para dar lugar às imagens
        results.forEach(item => URL.revokeObjectURL(item.url));
        setResults(imageResults);
      } else {
        // Adiciona as novas imagens ao lote já existente
        setResults(prev => [...prev, ...imageResults]);
      }
      setCurrentBatchStart(start);
      // pdf.destroy() ajuda a liberar memória
      if (typeof pdf.destroy === 'function') {
        pdf.destroy();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao converter páginas para imagem.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleConvertToPng = async () => {
    if (!sourcePdf) return;
    await processBatch(sourcePdf, 1, totalPdfPages);
  };

  const handleNextBatch = async () => {
    if (!sourcePdf) return;
    const nextStart = currentBatchStart + 20;
    if (nextStart > totalPdfPages) return;
    await processBatch(sourcePdf, nextStart, totalPdfPages);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <Header mainTab={mainTab} setMainTab={setMainTab} />
      
      <div className="flex flex-col lg:flex-row flex-grow lg:h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-background/50">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {mainTab === 'conversor' ? (
                <motion.div
                  key="conversor-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
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
                      <span className="font-semibold text-sm">HEIC para PNG</span>
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
                    <button
                      onClick={() => setActiveTool('image-to-pdf')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                        activeTool === 'image-to-pdf' 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-green-600/20 scale-[1.02]" 
                          : "bg-card border-border hover:bg-secondary/50"
                      }`}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-semibold text-sm text-center">Imagens para PDF</span>
                    </button>
                  </div>

                  {/* Active Tool View */}
                  <div className="mt-8">
                    <AnimatePresence mode="wait">
                      {activeTool === 'split-pdf' && (
                        <motion.div
                          key={`split-pdf-${toolKey}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <PdfSplitter 
                            onResults={handleResults} 
                            setIsProcessing={setIsProcessing} 
                            setProgressText={setProgressText} 
                            onPdfReady={handlePdfReady}
                          />
                        </motion.div>
                      )}
                      {activeTool === 'heic-batch' && (
                        <motion.div
                          key={`heic-batch-${toolKey}`}
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
                          key={`pdf-to-image-${toolKey}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <PdfToImageConverter 
                            onResults={handleResults} 
                            setIsProcessing={setIsProcessing} 
                            setProgressText={setProgressText} 
                            onPdfReady={handlePdfReady}
                          />
                        </motion.div>
                      )}
                      {activeTool === 'image-to-pdf' && (
                        <motion.div
                          key={`image-to-pdf-${toolKey}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <ImageToPdfConverter 
                            onResults={handleResults} 
                            setIsProcessing={setIsProcessing} 
                            setProgressText={setProgressText} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="calculadora-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Calculadora />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Results Sidebar - Only show for Conversor */}
        <AnimatePresence>
          {mainTab === 'conversor' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-96 flex-shrink-0 bg-card border-l border-border h-full flex flex-col overflow-hidden"
            >
              <Sidebar 
                results={results} 
                isProcessing={isProcessing} 
                progressText={progressText}
                onDownloadAll={handleDownloadAll}
                onClear={handleClear}
                onConvertToPng={handleConvertToPng}
                activeTool={activeTool}
                totalPdfPages={totalPdfPages}
                currentBatchStart={currentBatchStart}
                onNextBatch={handleNextBatch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
