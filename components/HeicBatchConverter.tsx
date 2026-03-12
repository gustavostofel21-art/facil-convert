'use client';

import React, { useState } from 'react';
import heic2any from 'heic2any';
import { Image as ImageIcon, RefreshCw, AlertCircle, Layers } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { ResultItem } from './Sidebar';

interface HeicBatchConverterProps {
  onResults: (results: ResultItem[]) => void;
  setIsProcessing: (val: boolean) => void;
  setProgressText: (val: string) => void;
}

type Format = 'image/jpeg' | 'image/png';

export default function HeicBatchConverter({ onResults, setIsProcessing, setProgressText }: HeicBatchConverterProps) {
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>('image/jpeg');

  const handleFilesSelect = async (files: File | File[]) => {
    const fileList = Array.isArray(files) ? files : [files];
    if (fileList.length === 0) return;

    setIsProcessing(true);
    setError(null);
    const newResults: ResultItem[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setProgressText(`Convertendo ${i + 1} de ${fileList.length}...`);

        const result = await heic2any({
          blob: file,
          toType: format,
          quality: 0.8,
        });

        const blob = Array.isArray(result) ? result[0] : result;
        const url = URL.createObjectURL(blob);
        const extension = format === 'image/jpeg' ? 'jpg' : 'png';
        
        newResults.push({
          id: `${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, "") + `.${extension}`,
          url,
          type: 'image',
          blob
        });
      }

      onResults(newResults);
    } catch (err) {
      console.error(err);
      setError('Erro ao converter imagens HEIC. Verifique se os arquivos são válidos.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Converter HEIC em Lote
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Converta múltiplas fotos do iPhone para JPG ou PNG simultaneamente.
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
          onFileSelect={handleFilesSelect}
          accept=".heic"
          label="Arraste suas imagens HEIC"
          description="Você pode selecionar múltiplos arquivos"
          icon={<ImageIcon className="w-10 h-10 text-primary/60" />}
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
