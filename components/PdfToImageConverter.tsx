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
}

type Format = 'image/jpeg' | 'image/png';

export default function PdfToImageConverter({ onResults, setIsProcessing, setProgressText }: PdfToImageConverterProps) {
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>('image/jpeg');

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
      for (let fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
        const file = fileList[fileIdx];
        const filePrefix = fileList.length > 1 ? `[${fileIdx + 1}/${fileList.length}] ` : '';
        
        setProgressText(`${filePrefix}Carregando PDF...`);
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        const baseFileName = file.name.replace(/\.[^/.]+$/, "");

        for (let i = 1; i <= numPages; i++) {
          setProgressText(`${filePrefix}Renderizando página ${i} de ${numPages}...`);
          
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
          
          const dataUrl = canvas.toDataURL(format);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          const extension = format === 'image/jpeg' ? 'jpg' : 'png';
          
          allResults.push({
            id: `${Date.now()}-${fileIdx}-${i}`,
            name: `${baseFileName}_p${i}.${extension}`,
            url: dataUrl,
            type: 'image',
            blob
          });
        }
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
        <p className="text-sm text-muted-foreground mb-6">
          Transforme cada página dos seus PDFs em imagens JPG ou PNG de alta resolução.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Formato de Saída</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('image/jpeg')}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                format === 'image/jpeg' 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              JPEG
            </button>
            <button
              onClick={() => setFormat('image/png')}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                format === 'image/png' 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              PNG
            </button>
          </div>
        </div>
        
        <FileDropzone
          onFileSelect={handleFileSelect}
          accept=".pdf"
          label="Arraste seus PDFs aqui"
          description="As páginas serão convertidas em imagens individuais. Você pode selecionar múltiplos arquivos."
          icon={<FileImage className="w-10 h-10 text-primary/60" />}
          multiple
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
