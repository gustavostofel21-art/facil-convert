'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileText, Scissors, AlertCircle } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { ResultItem } from './Sidebar';

interface PdfSplitterProps {
  onResults: (results: ResultItem[]) => void;
  setIsProcessing: (val: boolean) => void;
  setProgressText: (val: string) => void;
}

export default function PdfSplitter({ onResults, setIsProcessing, setProgressText }: PdfSplitterProps) {
  const [error, setError] = useState<string | null>(null);

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
        
        setProgressText(`${filePrefix}Lendo PDF...`);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        if (pageCount === 0) continue;

        const baseFileName = file.name.replace(/\.[^/.]+$/, "");

        for (let i = 0; i < pageCount; i++) {
          setProgressText(`${filePrefix}Extraindo página ${i + 1} de ${pageCount}...`);
          
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          allResults.push({
            id: `${Date.now()}-${fileIdx}-${i}`,
            name: `${baseFileName}_p${i + 1}.pdf`,
            url,
            type: 'pdf',
            blob
          });
        }
      }

      onResults(allResults);
    } catch (err) {
      console.error(err);
      setError('Erro ao processar PDFs. Verifique se os arquivos não estão protegidos ou corrompidos.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Dividir PDF
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Envie um ou mais PDFs para separar todas as suas páginas em arquivos individuais.
        </p>
        
        <FileDropzone
          onFileSelect={handleFileSelect}
          accept=".pdf"
          label="Arraste seus PDFs aqui"
          description="Apenas arquivos .pdf são aceitos. Você pode selecionar múltiplos arquivos."
          icon={<FileText className="w-10 h-10 text-primary/60" />}
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
