import { useState, useCallback } from 'react';
import { generateOptimizedPDF, previewPDF } from '../../../shared/utils/pdfUtils.js';

export const usePDFGeneration = (syllabusData, nodes) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfGenerationCount, setPdfGenerationCount] = useState(() => {
    const saved = localStorage.getItem('pdf_generation_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [previewCount, setPreviewCount] = useState(0);
  const [lastPdfGenerated, setLastPdfGenerated] = useState(() => {
    const saved = localStorage.getItem('last_pdf_generated');
    return saved ? new Date(saved) : null;
  });

  const generateFileName = useCallback(() => {
    const courseCode = syllabusData[1]?.codigoCurso || 'CURSO';
    const semester = syllabusData[1]?.semestre || new Date().getFullYear();
    const timestamp = new Date().toISOString().slice(0, 10);

    return `Silabo_${courseCode}_${semester}_${timestamp}.pdf`;
  }, [syllabusData]);

  const updatePDFStats = useCallback(() => {
    const newCount = pdfGenerationCount + 1;
    const newDate = new Date();
    
    setPdfGenerationCount(newCount);
    setLastPdfGenerated(newDate);

    try {
      localStorage.setItem('pdf_generation_count', String(newCount));
      localStorage.setItem('last_pdf_generated', newDate.toISOString());
    } catch (error) {
      console.warn('No se pudo guardar estadísticas de PDF:', error);
    }
  }, [pdfGenerationCount]);

  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);

    try {
      const filename = generateFileName();
      const result = await generateOptimizedPDF(syllabusData, nodes, filename);

      if (result.success) {
        updatePDFStats();
        return { success: true, message: `PDF generado: ${result.filename}` };
      } else {
        return { success: false, message: result.message, error: result.error };
      }
    } catch (error) {
      return { success: false, message: 'Error inesperado al generar PDF', error };
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [syllabusData, nodes, generateFileName, updatePDFStats]);

  const handlePreviewPDF = useCallback(() => {
    try {
      previewPDF(syllabusData, nodes);
      setPreviewCount(prev => prev + 1);
      return { success: true, message: 'Vista previa abierta en nueva ventana' };
    } catch (error) {
      return { success: false, message: 'Error al abrir vista previa', error };
    }
  }, [syllabusData, nodes]);

  return {
    isGeneratingPDF,
    pdfGenerationCount,
    previewCount,
    lastPdfGenerated,
    handleGeneratePDF,
    handlePreviewPDF
  };
};