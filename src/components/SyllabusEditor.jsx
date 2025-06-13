// SyllabusEditor.jsx - Editor de Sílabos Optimizado
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Importar utilidades PDF
import {
  generateOptimizedPDF,
  previewPDF
} from '../utils/pdfUtils.js';

const SyllabusEditor = () => {
  const navigate = useNavigate();

  // Estados principales
  const [nodes, setNodes] = useState([]);
  const [syllabusData, setSyllabusData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados para estadísticas
  const [pdfGenerationCount, setPdfGenerationCount] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  const [lastPdfGenerated, setLastPdfGenerated] = useState(null);

  // Estados para UI
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Constantes - Usar las claves correctas del localStorage
  const LOCAL_STORAGE_KEY = 'mptt_template';
  const SYLLABUS_DATA_KEY = 'syllabus_editor_data';

  // Función para mostrar toasts
  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  }, []);

  // Cargar plantilla y datos del sílabo
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Cargar plantilla desde mptt_template
        const savedTemplate = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (savedTemplate) {
          const parsedNodes = JSON.parse(savedTemplate);

          // Validar que sea un array válido
          if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
            setNodes(parsedNodes);
            console.log('✅ Plantilla cargada:', parsedNodes.length, 'nodos');

            // Expandir todas las secciones por defecto
            const expandedState = {};
            parsedNodes.forEach(node => {
              if (node.id !== 1) { // No expandir el Root
                expandedState[node.id] = true;
              }
            });
            setExpandedSections(expandedState);
          } else {
            throw new Error('Plantilla no válida o vacía');
          }
        } else {
          showToast('⚠️ No hay plantilla cargada. Ve al Constructor de Plantillas primero.', 'warning');
          setTimeout(() => navigate('/plantilla'), 2000);
          return;
        }

        // Cargar datos del sílabo
        const savedData = localStorage.getItem(SYLLABUS_DATA_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setSyllabusData(parsedData);
          console.log('✅ Datos del sílabo cargados');
        } else {
          console.log('📝 No hay datos previos del sílabo');
        }

        // Cargar estadísticas
        const savedCount = localStorage.getItem('pdf_generation_count');
        const savedLastGenerated = localStorage.getItem('last_pdf_generated');

        if (savedCount) setPdfGenerationCount(parseInt(savedCount, 10));
        if (savedLastGenerated) setLastPdfGenerated(new Date(savedLastGenerated));

        showToast('✅ Editor cargado correctamente', 'success');
      } catch (error) {
        console.error('Error cargando datos:', error);
        showToast('❌ Error al cargar los datos: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, showToast]);

  // Auto-guardado
  useEffect(() => {
    if (Object.keys(syllabusData).length > 0) {
      const saveData = () => {
        try {
          localStorage.setItem(SYLLABUS_DATA_KEY, JSON.stringify(syllabusData));
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Error guardando datos:', error);
          showToast('⚠️ Error al guardar automáticamente', 'warning');
        }
      };

      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [syllabusData, showToast]);

  // Funciones de utilidad simplificadas
  const getNodeIcon = useCallback((type) => {
    const icons = {
      'INFORMACION_GENERAL': '📋',
      'Información General': '📋',
      'SUMILLA': '📝',
      'Sumilla': '📝',
      'COMPETENCIAS': '🎯',
      'Competencias': '🎯',
      'METODOLOGIA': '🔬',
      'Metodología': '🔬',
      'EVALUACION': '📊',
      'Evaluación': '📊',
      'RECURSOS': '📚',
      'Recursos': '📚',
      'BIBLIOGRAFIA': '📖',
      'Bibliografía': '📖',
      'CRONOGRAMA': '📅',
      'Cronograma': '📅'
    };
    return icons[type] || '📄';
  }, []);

  // Función para obtener color basado en el tipo (simplificada)
  const getNodeColor = useCallback((type) => {
    // Hash simple del tipo para generar color consistente
    let hash = 0;
    const str = type || 'default';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545', '#6f42c1', '#fd7e14', '#20c997'];
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Función de debug para verificar localStorage
  const debugLocalStorage = useCallback(() => {
    console.log('🔍 Debug del Editor de Sílabo:');
    console.log('📋 Plantilla cargada:', nodes.length, 'nodos');
    console.log('📝 Datos del sílabo:', Object.keys(syllabusData).length, 'secciones con datos');

    // Mostrar estructura de nodos
    console.log('🌳 Estructura de nodos:');
    nodes.forEach(node => {
      console.log(`  - ID: ${node.id}, Nombre: "${node.name}", Padre: ${node.parent}, Campos: ${Object.keys(node.attributes || {}).length}`);
    });

    // Verificar localStorage
    const templateExists = localStorage.getItem(LOCAL_STORAGE_KEY);
    const dataExists = localStorage.getItem(SYLLABUS_DATA_KEY);

    console.log('💾 localStorage:');
    console.log(`  - ${LOCAL_STORAGE_KEY}: ${templateExists ? '✅ Existe' : '❌ No existe'}`);
    console.log(`  - ${SYLLABUS_DATA_KEY}: ${dataExists ? '✅ Existe' : '❌ No existe'}`);

    showToast(`📊 ${nodes.length} nodos | ${Object.keys(syllabusData).length} con datos | Template: ${templateExists ? '✅' : '❌'}`, 'info');
  }, [nodes, syllabusData]);

  // Manejar cambios en los campos
  const handleFieldChange = useCallback((nodeId, fieldKey, value) => {
    setSyllabusData(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        [fieldKey]: value
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Generar PDF optimizado
  const handleGeneratePDF = useCallback(async () => {
    if (!isValidSyllabus()) {
      showToast('❌ Complete los campos requeridos antes de generar el PDF', 'error');
      return;
    }

    setIsGeneratingPDF(true);
    showToast('📄 Generando PDF...', 'info');

    try {
      const filename = generateFileName();
      const result = await generateOptimizedPDF(syllabusData, nodes, filename);

      if (result.success) {
        showToast(`✅ PDF generado: ${result.filename}`, 'success');
        updatePDFStats();
      } else {
        showToast(`❌ ${result.message}`, 'error');
        console.error('Error PDF:', result.error);
      }
    } catch (error) {
      showToast('❌ Error inesperado al generar PDF', 'error');
      console.error('Error generando PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [syllabusData, nodes]);

  // Vista previa del PDF
  const handlePreviewPDF = useCallback(() => {
    if (!isValidSyllabus()) {
      showToast('❌ Complete los campos requeridos antes de la vista previa', 'error');
      return;
    }

    try {
      previewPDF(syllabusData, nodes);
      showToast('👁️ Vista previa abierta en nueva ventana', 'info');
      setPreviewCount(prev => prev + 1);
    } catch (error) {
      showToast('❌ Error al abrir vista previa', 'error');
      console.error('Error en vista previa:', error);
    }
  }, [syllabusData, nodes]);

  // Funciones auxiliares
  const generateFileName = useCallback(() => {
    const courseCode = syllabusData[1]?.codigoCurso || 'CURSO';
    const semester = syllabusData[1]?.semestre || new Date().getFullYear();
    const timestamp = new Date().toISOString().slice(0, 10);

    return `Silabo_${courseCode}_${semester}_${timestamp}.pdf`;
  }, [syllabusData]);

  const updatePDFStats = useCallback(() => {
    setPdfGenerationCount(prev => prev + 1);
    setLastPdfGenerated(new Date());

    try {
      localStorage.setItem('pdf_generation_count', String(pdfGenerationCount + 1));
      localStorage.setItem('last_pdf_generated', new Date().toISOString());
    } catch (error) {
      console.warn('No se pudo guardar estadísticas de PDF:', error);
    }
  }, [pdfGenerationCount]);

  const isValidSyllabus = useCallback(() => {
    const requiredSections = nodes.filter(node => node.parent === 1);
    return requiredSections.some(section =>
      syllabusData[section.id] && Object.keys(syllabusData[section.id]).length > 0
    );
  }, [syllabusData, nodes]);

  // Toggle sección expandida
  const toggleSection = useCallback((nodeId) => {
    setExpandedSections(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  }, []);

  // Filtros de búsqueda
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;

    return nodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(node.attributes || {}).some(key =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [nodes, searchTerm]);

  // Renderizar campo de entrada
  const renderField = useCallback((nodeId, fieldKey, defaultValue, fieldType = 'text') => {
    const value = syllabusData[nodeId]?.[fieldKey] || '';
    const fieldId = `field_${nodeId}_${fieldKey}`;

    const commonProps = {
      id: fieldId,
      value: value,
      onChange: (e) => handleFieldChange(nodeId, fieldKey, e.target.value),
      className: "form-control",
      style: { borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #86B7FE' },
      placeholder: defaultValue || `Ingrese ${fieldKey}`
    };

    if (fieldType === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows="4"
          style={{ ...commonProps.style, resize: 'vertical', minHeight: '100px' }}
        />
      );
    }

    if (fieldType === 'select') {
      const options = defaultValue?.split(',') || [];
      return (
        <select {...commonProps}>
          <option value="">Seleccione una opción</option>
          {options.map((option, idx) => (
            <option key={idx} value={option.trim()}>
              {option.trim()}
            </option>
          ))}
        </select>
      );
    }

    return <input type={fieldType} {...commonProps} />;
  }, [syllabusData, handleFieldChange]);

  // Determinar tipo de campo
  const determineFieldType = useCallback((fieldKey, defaultValue) => {
    const key = fieldKey.toLowerCase();

    if (key.includes('email') || key.includes('correo')) return 'email';
    if (key.includes('fecha') || key.includes('date')) return 'date';
    if (key.includes('numero') || key.includes('creditos') || key.includes('horas')) return 'number';
    if (key.includes('descripcion') || key.includes('contenido') || key.includes('objetivo')) return 'textarea';
    if (defaultValue && defaultValue.includes(',')) return 'select';

    return 'text';
  }, []);

  // Formatear label del campo
  const formatFieldLabel = useCallback((key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }, []);



  // Renderizar árbol de secciones con jerarquía visual
  const renderSectionTree = useCallback((parentId = 1, depth = 0) => {
    const childNodes = filteredNodes.filter(node =>
      node.parent === parentId && node.id !== 1 // Excluir el nodo Root
    );

    if (childNodes.length === 0) return null;

    return childNodes.map(node => {
      const nodeColor = getNodeColor(node.type || node.name);
      const nodeIcon = getNodeIcon(node.type || node.name);
      const isExpanded = expandedSections[node.id] !== false; // Por defecto expandido
      const hasChildren = nodes.some(n => n.parent === node.id);
      const hasFields = node.attributes && Object.keys(node.attributes).length > 0;

      return (
        <div key={node.id} className="mb-3">
          {/* Header de la sección */}
          <div className="card"
            style={{
              border: '1px solid #CFD8ED',
            }}
          >
            <div
              className="card-header"
              style={{
                backgroundColor: `#EAF8FF`,
                borderRadius: '16px 16px 0 0',
                borderBottom: isExpanded ? `1px solid #CFD8ED` : 'none',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection(node.id)}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <span style={{ fontSize: '1.3rem', marginRight: '12px' }}>
                    {nodeIcon}
                  </span>
                  <div>
                    <h5 className="mb-1" style={{ color: '#276CA1', fontWeight: '600', fontSize: '15px' }}>
                      {node.name}
                    </h5>
                    {depth > 0 && (
                      <small className="text-muted">
                        Sección de: {nodes.find(n => n.id === node.parent)?.name}
                      </small>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  {hasFields && (
                    <span className="badge" style={{ backgroundColor: '#003264', color: 'white' }}>
                      {Object.keys(node.attributes).length} campos
                    </span>
                  )}

                  {hasChildren && (
                    <span className="badge bg-light text-dark">
                      {nodes.filter(n => n.parent === node.id).length} subsecciones
                    </span>
                  )}

                  <span style={{ fontSize: '1.2rem', color: '#003264' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contenido de la sección */}
            {isExpanded && (
              <div className="card-body" style={{ borderRadius: '0 0 16px 16px', background: '#F7F9FC' }}>
                {/* Campos de la sección */}
                {hasFields && (
                  <div className="row g-3 mb-4">
                    {Object.entries(node.attributes).map(([fieldKey, defaultValue]) => {
                      const fieldType = determineFieldType(fieldKey, defaultValue);

                      return (
                        <div key={fieldKey} className="col-md-6">
                          <label
                            htmlFor={`field_${node.id}_${fieldKey}`}
                            style={{ color: '#8F9BB3', fontSize: '12px', fontWeight:'700' }}
                          >
                            {formatFieldLabel(fieldKey)}
                            {fieldType === 'textarea' && <span className="text-muted"> (Descripción extensa)</span>}
                          </label>
                          {renderField(node.id, fieldKey, defaultValue, fieldType)}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Secciones hijas con identificación visual */}
                {hasChildren && (
                  <div
                    className="children-container"
                    style={{
                      paddingLeft: '15px',
                      borderLeft: `4px solid #1B70B1`,
                      backgroundColor: `${nodeColor}05`,
                      borderRadius: '0 0 0 8px'
                    }}
                  >
                    <div
                      className="children-header mb-3 small"
                      style={{ color: '#003264', fontWeight: '600' }}
                    >
                      ↳ Subsecciones de "{node.name}" ({nodes.filter(n => n.parent === node.id).length})
                    </div>

                    {renderSectionTree(node.id, depth + 1)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  }, [filteredNodes, nodes, expandedSections, syllabusData, getNodeColor, getNodeIcon, toggleSection, renderField, determineFieldType, formatFieldLabel]);




  // Estadísticas del progreso
  const progressStats = useMemo(() => {
    const totalFields = nodes.reduce((total, node) =>
      total + Object.keys(node.attributes || {}).length, 0
    );

    const completedFields = nodes.reduce((total, node) => {
      const nodeData = syllabusData[node.id] || {};
      return total + Object.keys(nodeData).filter(key =>
        nodeData[key] && nodeData[key].toString().trim() !== ''
      ).length;
    }, 0);

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return { totalFields, completedFields, percentage };
  }, [nodes, syllabusData]);

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
      {/* Toast */}
      {toast.show && (
        <div
          className={`alert alert-${toast.type === 'error' ? 'danger' : toast.type} alert-dismissible fade show position-fixed`}
          style={{ top: '20px', right: '20px', zIndex: 9999, minWidth: '300px' }}
        >
          {toast.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setToast({ show: false, message: '', type: 'info' })}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)' }}>
            <div className="card-body p-4 text-white">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h1 className="mb-2 fw-bold">📝 Editor de Sílabo</h1>
                  <p className="mb-0 opacity-90">
                    Complete los campos de su sílabo académico basado en la plantilla cargada
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <div className="d-flex gap-2 justify-content-lg-end">
                    <button
                      className="btn btn-light btn-lg"
                      onClick={handlePreviewPDF}
                      disabled={isGeneratingPDF}
                      style={{ borderRadius: '12px' }}
                    >
                      👁️ Vista Previa
                    </button>
                    <button
                      className="btn btn-warning btn-lg"
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF}
                      style={{ borderRadius: '12px' }}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Generando...
                        </>
                      ) : (
                        <>📄 Generar PDF</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          {/* Buscador */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-body p-3">
              <div className="input-group">
                <span className="input-group-text border-0 bg-light">🔍</span>
                <input
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="Buscar secciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '0 8px 8px 0' }}
                />
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 text-primary">📊 Progreso del Sílabo</h6>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Completado</small>
                  <small className="fw-bold text-primary">{progressStats.percentage}%</small>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{
                      width: `${progressStats.percentage}%`,
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>

              <div className="row text-center g-2">
                <div className="col-6">
                  <div className="fw-bold text-success fs-5">{progressStats.completedFields}</div>
                  <small className="text-muted">Completados</small>
                </div>
                <div className="col-6">
                  <div className="fw-bold text-info fs-5">{progressStats.totalFields}</div>
                  <small className="text-muted">Total Campos</small>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 text-success">📈 Estadísticas</h6>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">PDFs Generados</small>
                  <span className="badge bg-success">{pdfGenerationCount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Vistas Previas</small>
                  <span className="badge bg-info">{previewCount}</span>
                </div>
              </div>

              {lastSaved && (
                <div className="text-center">
                  <small className="text-muted">
                    Último guardado:<br />
                    <span className="fw-bold text-success">
                      {lastSaved.toLocaleTimeString()}
                    </span>
                  </small>
                </div>
              )}

              {hasUnsavedChanges && (
                <div className="alert alert-warning border-0 mt-3 py-2" style={{ borderRadius: '8px' }}>
                  <small>⚠️ Cambios sin guardar</small>
                </div>
              )}

              <button
                className="btn btn-outline-secondary btn-sm w-100 mt-2"
                onClick={debugLocalStorage}
                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
              >
                🔍 Debug Storage
              </button>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="col-lg-9">
          {nodes.length <= 1 ? ( // Solo Root o sin nodos
            <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <div style={{ fontSize: '4rem' }}>📋</div>
                <h4 className="text-muted mb-3">No hay plantilla cargada</h4>
                <p className="text-muted mb-4">
                  Necesitas crear o cargar una plantilla en el Constructor de Plantillas.<br />
                  <small>Actualmente tienes {nodes.length} nodos en localStorage.</small>
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/plantilla')}
                    style={{ borderRadius: '12px' }}
                  >
                    Ir al Constructor de Plantillas
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={debugLocalStorage}
                    style={{ borderRadius: '12px' }}
                  >
                    🔍 Debug
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Información general */}
              {filteredNodes.length <= 1 && searchTerm && ( // Solo Root filtrado
                <div className="alert alert-info border-0" style={{ borderRadius: '12px' }}>
                  <h6>🔍 Sin resultados</h6>
                  No se encontraron secciones que coincidan con "{searchTerm}"
                </div>
              )}

              {/* Renderizar árbol de secciones */}
              {renderSectionTree()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusEditor;