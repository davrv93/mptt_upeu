import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks personalizados
import { useSyllabusData } from '../hooks/useSyllabusData';
import { useSyllabusValidation } from '../hooks/useSyllabusValidation';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import { useSyllabusUI } from '../hooks/useSyllabusUI';

// Componentes
import ToastNotification from './ToastNotification';
import SyllabusHeader from './SyllabusHeader';
import SyllabusSidebar from './SyllabusSidebar';
import SyllabusContent from './SyllabusContent';

// Utilidades
import { debugLocalStorage } from '../utils/syllabusUtils';

const SyllabusEditor = () => {
  const navigate = useNavigate();
  
  // Hooks personalizados
  const {
    nodes,
    syllabusData,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    loadData,
    handleFieldChange
  } = useSyllabusData();

  const { progressStats, isValidSyllabus } = useSyllabusValidation(nodes, syllabusData);
  
  const {
    isGeneratingPDF,
    pdfGenerationCount,
    previewCount,
    lastPdfGenerated,
    handleGeneratePDF,
    handlePreviewPDF
  } = usePDFGeneration(syllabusData, nodes);

  const {
    toast,
    showToast,
    hideToast,
    expandedSections,
    toggleSection,
    expandAllSections,
    searchTerm,
    setSearchTerm,
    filteredNodes
  } = useSyllabusUI(nodes);

  useEffect(() => {
    const initializeEditor = async () => {
      const result = await loadData();
      
      if (!result.success) {
        if (result.error.includes('No hay plantilla cargada')) {
          showToast('⚠️ No hay plantilla cargada. Ve al Constructor de Plantillas primero.', 'warning');
          setTimeout(() => navigate('/plantilla'), 2000);
        } else {
          showToast(`❌ Error al cargar los datos: ${result.error}`, 'error');
        }
        return;
      }

      expandAllSections();
      showToast('✅ Editor cargado correctamente', 'success');
    };

    initializeEditor();
  }, [loadData, navigate, showToast, expandAllSections]);


  // Funciones auxiliares
  const handleDebugStorage = () => {
    const message = debugLocalStorage(nodes, syllabusData);
    showToast(message, 'info');
  };

  const handlePDFGeneration = async () => {
    if (!isValidSyllabus()) {
      showToast('❌ Complete los campos requeridos antes de generar el PDF', 'error');
      return;
    }

    showToast('📄 Generando PDF...', 'info');
    const result = await handleGeneratePDF();
    
    if (result.success) {
      showToast(`✅ ${result.message}`, 'success');
    } else {
      showToast(`❌ ${result.message}`, 'error');
      if (result.error) console.error('Error PDF:', result.error);
    }
  };

  const handlePDFPreview = () => {
    if (!isValidSyllabus()) {
      showToast('❌ Complete los campos requeridos antes de la vista previa', 'error');
      return;
    }

    const result = handlePreviewPDF();
    
    if (result.success) {
      showToast(`👁️ ${result.message}`, 'info');
    } else {
      showToast(`❌ ${result.message}`, 'error');
      if (result.error) console.error('Error en vista previa:', result.error);
    }
  };


  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h4>Cargando Editor de Sílabo...</h4>
          <p className="text-muted">Preparando la plantilla</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastNotification toast={toast} onClose={hideToast} />

      <SyllabusHeader
        onPreviewPDF={handlePDFPreview}
        onGeneratePDF={handlePDFGeneration}
        isGeneratingPDF={isGeneratingPDF}
      />

      <div className="row">
        <SyllabusSidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          progressStats={progressStats}
          pdfGenerationCount={pdfGenerationCount}
          previewCount={previewCount}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          onDebugStorage={handleDebugStorage}
        />

        <div className="col-lg-9">
          <SyllabusContent
            nodes={nodes}
            filteredNodes={filteredNodes}
            syllabusData={syllabusData}
            expandedSections={expandedSections}
            searchTerm={searchTerm}
            onToggleSection={toggleSection}
            onFieldChange={handleFieldChange}
            onDebugStorage={handleDebugStorage}
          />
        </div>
      </div>
    </div>
  );
};

export default SyllabusEditor;