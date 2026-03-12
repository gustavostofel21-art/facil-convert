'use client';

import React, { useState, useEffect } from 'react';
import { FileImage, RefreshCw, AlertCircle, FileType } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { ResultItem } from './Sidebar';

// pdfjs-dist setup
import * as pdfjs from 'pdfjs-dist';

interface PdfToImageConverterProps {
  onResults: (results: ResultItem[]) => void;
  setIsProcessing: (val: boolean) => void;
  setProgressText: (val: string) => void;
  onPdfReady?: (file: File, pageCount: number) => void;
}

type Format = 'image/jpeg' | 'image/png';

export default function PdfToImageConverter({ onResults, setIsProcessing, setProgressText, onPdfReady }: PdfToImageConverterProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set worker source for v3
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }, []);

  const handleFileSelect = async (files: File | File[]) => {
    const fileList = Array.isArray(files) ? files : [files];
    if (fileList.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    const allResults: ResultItem[] = [];

    try {
      // For PDF to Image, we only support one file at a time for batching logic
      const file = fileList[0];
      
      setProgressText(`Carregando PDF...`);
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      if (onPdfReady) {
        onPdfReady(file, numPages);
      }

      const limit = Math.min(numPages, 20);

      for (let i = 1; i <= limit; i++) {
        setProgressText(`Renderizando página ${i} de ${numPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Falha ao criar contexto canvas');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        allResults.push({
          id: `${Date.now()}-0-${i}`,
          name: `Pagina_${i}.png`,
          url: dataUrl,
          type: 'image',
          blob
        });
      }

      onResults(allResults);
    } catch (err) {
      console.error(err);
      setError('Erro ao converter PDF em imagem. Verifique se os arquivos são válidos.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileType className="w-5 h-5 text-primary" />
          Converter PDF para Imagem
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Transforme cada página dos seus PDFs em imagens PNG de alta resolução.
        </p>
        
        <div className="mb-6 p-3 bg-secondary/50 border border-border rounded-xl text-xs flex items-start gap-2">
          <span className="text-primary font-bold">⚡</span>
          <p className="text-muted-foreground">
            Para garantir velocidade e qualidade máxima (PNG), o processamento é feito em lotes de 20 páginas.
          </p>
        </div>
        
        <FileDropzone
          onFileSelect={handleFileSelect}
          accept=".pdf"
          label="Arraste seu PDF aqui"
          description="As páginas serão convertidas em imagens individuais. Lotes de 20 páginas por vez."
          icon={<FileImage className="w-10 h-10 text-primary/60" />}
        />

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
