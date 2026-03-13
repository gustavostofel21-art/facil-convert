'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileImage, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { ResultItem } from './Sidebar';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onResults: (results: ResultItem[]) => void;
  setIsProcessing: (processing: boolean) => void;
  setProgressText: (text: string) => void;
}

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageToPdfConverter({ onResults, setIsProcessing, setProgressText }: Props) {
  const [images, setImages] = useState<ImageFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return newImages;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      return newImages;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgressText('Gerando arquivo PDF...');

    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        const img = images[i];
        
        // Ensure image is loaded properly to calculate dimensions
        const loadedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.src = img.previewUrl;
          image.onload = () => resolve(image);
          image.onerror = reject;
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = loadedImg.width;
        const imgHeight = loadedImg.height;
        let finalWidth = pdfWidth;
        let finalHeight = (imgHeight * pdfWidth) / imgWidth;
        
        if (finalHeight > pdfHeight) {
          finalHeight = pdfHeight;
          finalWidth = (imgWidth * pdfHeight) / imgHeight;
        }

        // Center on page
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(loadedImg, 'JPEG', x, y, finalWidth, finalHeight);
      }

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      onResults([{
        id: `img2pdf-${Date.now()}`,
        name: `Documento_Images.pdf`,
        url,
        type: 'pdf',
        blob: pdfBlob
      }]);

      setImages([]);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar o PDF. Veja o console para detalhes.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/10'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
        <p className="text-sm font-medium">Arraste imagens para cá</p>
        <p className="text-xs text-muted-foreground mt-2">ou clique para selecionar (PNG, JPG, WEBP)</p>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-border pb-2">Ordem do PDF</h3>
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
            <AnimatePresence>
              {images.map((img, index) => (
                <motion.div 
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm"
                >
                  <span className="font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                  <div className="w-12 h-12 relative rounded overflow-hidden bg-muted border border-border shrink-0">
                    <img src={img.previewUrl} alt="preview" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{img.file.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => moveUp(index)} disabled={index === 0}
                      className="p-1.5 hover:bg-muted text-muted-foreground disabled:opacity-30 rounded-lg transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveDown(index)} disabled={index === images.length - 1}
                      className="p-1.5 hover:bg-muted text-muted-foreground disabled:opacity-30 rounded-lg transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeImage(index)}
                      className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={convertToPdf}
            className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold rounded-2xl transition-all shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
          >
            <FileImage className="w-5 h-5" />
            <span className="tracking-wide text-lg">Gerar PDF ({images.length} {images.length === 1 ? 'página' : 'páginas'})</span>
          </button>
        </div>
      )}
    </div>
  );
}
