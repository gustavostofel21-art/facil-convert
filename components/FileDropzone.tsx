'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (files: File | File[]) => void;
  accept: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  multiple?: boolean;
}

export default function FileDropzone({ onFileSelect, accept, label, description, icon, multiple = false }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file: File) => {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    // Simple check for extension or mime type
    const isValid = acceptedTypes.some(type => {
      if (type.startsWith('.')) return fileExtension === type.toLowerCase();
      return file.type === type;
    });

    if (!isValid) {
      setError(`Formato de arquivo inválido. Aceito apenas: ${accept}`);
      return false;
    }
    setError(null);
    return true;
  }, [accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles = files.filter(validateFile);
      if (validFiles.length > 0) {
        onFileSelect(multiple ? validFiles : validFiles[0]);
      }
    }
  }, [onFileSelect, validateFile, multiple]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      const validFiles = files.filter(validateFile);
      if (validFiles.length > 0) {
        onFileSelect(multiple ? validFiles : validFiles[0]);
      }
    }
  }, [onFileSelect, validateFile, multiple]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />
        
        <div className="mb-4 p-4 bg-white dark:bg-muted rounded-full shadow-sm border border-green-100 dark:border-primary/20">
          {icon || <Upload className="w-8 h-8 text-primary/60" />}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-1">{label}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        
        <div className="mt-6">
          <button className="px-4 py-2 bg-white dark:bg-primary border border-green-200 dark:border-primary rounded-lg text-sm font-medium text-primary dark:text-primary-foreground hover:bg-green-50 dark:hover:opacity-90 transition-colors shadow-sm">
            Selecionar Arquivo
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
