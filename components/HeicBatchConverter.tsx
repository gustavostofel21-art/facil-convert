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

  const handleFilesSelect = async (files: File | File[]) => {
    const fileList = Array.isArray(files) ? files : [files];
    if (fileList.length === 0) return;

    setIsProcessing(true);
    setError(null);
    const newResults: ResultItem[] = [];

    try {
      const filesToProcess = fileList.slice(0, 20);
      if (fileList.length > 20) {
        setError('Limite de 20 imagens atingido. Apenas as primeiras 20 serão processadas.');
      }

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setProgressText(`Convertendo ${i + 1} de ${filesToProcess.length}...`);

        const result = await heic2any({
          blob: file,
          toType: 'image/png',
          quality: 0.9,
        });

        const blob = Array.isArray(result) ? result[0] : result;
        const url = URL.createObjectURL(blob);
        
        newResults.push({
          id: `${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, "") + `.png`,
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
          Converter HEIC para PNG
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Converta múltiplas fotos do iPhone para PNG de alta qualidade simultaneamente.
        </p>

        <div className="mb-6 p-3 bg-secondary/50 border border-border rounded-xl text-xs flex items-start gap-2">
          <span className="text-primary font-bold">⚡</span>
          <p className="text-muted-foreground">
            Para garantir velocidade e qualidade máxima (PNG), o limite é de 20 páginas/imagens por conversão.
          </p>
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
