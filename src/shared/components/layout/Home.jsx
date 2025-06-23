import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTemplateState } from '../../../features/template';
import silabo_ejemplo from '../../../assets/data/silabo_ejemplo.json'; 


const Home = () => {
  const navigate = useNavigate();
  const [syllabusData, setSyllabusData] = useState({});
  const [completionStats, setCompletionStats] = useState({ total: 0, filled: 0, percentage: 0 });
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Usar el hook personalizado
  const { templateExists: hasTemplate, templateStats, triggerTemplateUpdate } = useTemplateState();

  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true);
      
      const syllabusValues = localStorage.getItem('syllabus_data');
      const hasVisited = localStorage.getItem('has_visited');
      
      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem('has_visited', 'true');
      }

      // Cargar datos del sílabo si existen
      if (syllabusValues) {
        try {
          const syllabusData = JSON.parse(syllabusValues);
          setSyllabusData(syllabusData);
        } catch (error) {
          console.error('Error parsing syllabus data:', error);
        }
      }
      
      setTimeout(() => setIsLoading(false), 600);
    };

    initializeData();
  }, []);

  // Calcular progreso cuando cambie la plantilla o los datos del sílabo
  useEffect(() => {
    if (hasTemplate && Object.keys(syllabusData).length > 0) {
      const template = JSON.parse(localStorage.getItem('mptt_template'));
      calculateCompletion(template, syllabusData);
    } else if (hasTemplate) {
      // Si hay plantilla pero no datos, recalcular cuando se carguen los datos
      const syllabusValues = localStorage.getItem('syllabus_data');
      if (syllabusValues) {
        try {
          const syllabusData = JSON.parse(syllabusValues);
          setSyllabusData(syllabusData);
          const template = JSON.parse(localStorage.getItem('mptt_template'));
          calculateCompletion(template, syllabusData);
        } catch (error) {
          console.error('Error loading syllabus data:', error);
        }
      }
    }
  }, [hasTemplate, templateStats, syllabusData]);

  const calculateCompletion = (template, syllabusData) => {
    let totalFields = 0;
    let filledFields = 0;

    template.forEach(node => {
      if (node.attributes && Object.keys(node.attributes).length > 0) {
        Object.keys(node.attributes).forEach(key => {
          totalFields++;
          if (syllabusData[node.id]?.[key] && syllabusData[node.id][key].toString().trim() !== '') {
            filledFields++;
          }
        });
      }
    });

    setCompletionStats({
      total: totalFields,
      filled: filledFields,
      percentage: totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
    });
  };

  const loadExampleTemplate = async () => {
    setIsLoading(true);
    try {
      const exampleTemplate = silabo_ejemplo;

      localStorage.setItem('mptt_template', JSON.stringify(exampleTemplate));
      localStorage.setItem('template_last_modified', new Date().toISOString());
      
      triggerTemplateUpdate();
      
      showToast('✅ Plantilla de ejemplo cargada correctamente', 'success');
    } catch (error) {
      showToast('❌ Error al cargar el archivo de ejemplo', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    const confirmMessage = hasTemplate ? 
      '¿Estás seguro de que quieres eliminar TODA la información? Esto incluye la plantilla y todos los datos del sílabo. Esta acción no se puede deshacer.' :
      '¿Estás seguro de que quieres limpiar todos los datos guardados?';
      
    if (confirm(confirmMessage)) {
      localStorage.removeItem('mptt_template');
      localStorage.removeItem('syllabus_data');
      localStorage.removeItem('template_last_modified');
      
      // Limpiar estados locales
      setSyllabusData({});
      setCompletionStats({ total: 0, filled: 0, percentage: 0 });
      
      // Disparar actualización global
      triggerTemplateUpdate();
      
      showToast('🗑️ Todos los datos eliminados correctamente', 'warning');
    }
  };

  const exportTemplate = () => {
    try {
      const template = localStorage.getItem('mptt_template');
      if (!template) {
        showToast('❌ No hay plantilla para exportar', 'error');
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(template);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `plantilla_silabo_${new Date().getTime()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast('📥 Plantilla exportada correctamente', 'info');
    } catch (error) {
      showToast('❌ Error al exportar la plantilla', 'error');
    }
  };

  const importTemplate = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target.result);
        localStorage.setItem('mptt_template', JSON.stringify(template));
        localStorage.setItem('template_last_modified', new Date().toISOString());
        
        // Disparar actualización global
        triggerTemplateUpdate();
        
        showToast('📂 Plantilla importada correctamente', 'success');
      } catch (error) {
        showToast('❌ Error: El archivo no es una plantilla válida', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const showToast = (message, type = 'success') => {
    const toastColors = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    };

    const toast = document.createElement('div');
    toast.className = `alert ${toastColors[type]} position-fixed border-0 shadow-lg`;
    toast.style.cssText = `
      top: 90px; 
      right: 20px; 
      z-index: 9999; 
      min-width: 320px;
      border-radius: 12px;
      animation: slideInRight 0.3s ease-out;
    `;
    toast.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="me-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</div>
        <div>${message}</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => document.body.removeChild(toast), 300);
      }
    }, 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <h4 className="text-muted">Cargando dashboard...</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Welcome Section */}
      {isFirstVisit && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert border-0 shadow-sm" style={{ 
              background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)',
              color: 'white',
              borderRadius: '16px'
            }}>
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ fontSize: '2.5rem' }}>👋</div>
                <div>
                  <h4 className="alert-heading mb-2">¡Bienvenido al Editor de Sílabo!</h4>
                  <p className="mb-2">Herramienta para crear sílabos académicos de forma rápida.</p>
                  <small className="opacity-75">Comienza creando una plantilla o carga nuestro ejemplo prediseñado.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-10 text-center">
          <div className="mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)',
                color: 'white',
                fontSize: '2.5rem'
              }}
            >
              📚
            </div>
          </div>
          <h1 className="display-5 fw-bold text-primary mb-3">Dashboard del Editor</h1>
          <p className="lead text-muted mb-4">
            Gestiona tus plantillas y crea sílabos académicos profesionales
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: hasTemplate ? '#1A8D5A20' : '#E97E0020',
                    color: hasTemplate ? '#1A8D5A' : '#E97E00',
                    fontSize: '1.8rem'
                  }}
                >
                  {hasTemplate ? '✅' : '📝'}
                </div>
              </div>
              <h5 className="fw-bold">{hasTemplate ? 'Plantilla Lista' : 'Sin Plantilla'}</h5>
              {hasTemplate ? (
                <div>
                  <p className="text-muted small mb-2">
                    {templateStats.sections} secciones • {templateStats.nodes} nodos
                  </p>
                  <small className="text-muted">
                    Modificado: {formatDate(templateStats.lastModified)}
                  </small>
                </div>
              ) : (
                <p className="text-muted small">Necesitas crear una plantilla primero</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: completionStats.percentage > 0 ? '#276CA120' : '#DEE2E620',
                    color: completionStats.percentage > 0 ? '#276CA1' : '#6C757D',
                    fontSize: '1.8rem'
                  }}
                >
                  {completionStats.percentage > 0 ? '📊' : '📋'}
                </div>
              </div>
              <h5 className="fw-bold">Progreso del Sílabo</h5>
              {completionStats.percentage > 0 ? (
                <div>
                  <div className="progress mb-2" style={{ height: '8px', borderRadius: '4px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${completionStats.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-muted small mb-0">
                    {completionStats.filled}/{completionStats.total} campos completados ({completionStats.percentage}%)
                  </p>
                </div>
              ) : (
                <p className="text-muted small">Aún no has empezado a llenar datos</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: '#08C1B820',
                    color: '#08C1B8',
                    fontSize: '1.8rem'
                  }}
                >
                  📄
                </div>
              </div>
              <h5 className="fw-bold">Estado del PDF</h5>
              <p className="text-muted small">
                {hasTemplate && completionStats.percentage > 0 
                  ? `Listo para generar (${completionStats.percentage}% completado)`
                  : 'Necesitas datos para generar PDF'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <div className="row g-4">
            {/* Create Template */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #1A8D5A20, #1A8D5A10)',
                        color: '#1A8D5A',
                        fontSize: '2.5rem'
                      }}
                    >
                      🏗️
                    </div>
                  </div>
                  <h4 className="card-title text-primary mb-3">Gestionar Plantilla</h4>
                  <p className="card-text text-muted mb-4">
                    {hasTemplate 
                      ? 'Edita la estructura existente o crea una nueva desde cero'
                      : 'Diseña la estructura de tu sílabo definiendo secciones y campos'
                    }
                  </p>
                  <Link 
                    to="/plantilla" 
                    className="btn btn-lg w-100 mb-3"
                    style={{ 
                      backgroundColor: '#1A8D5A', 
                      borderColor: '#1A8D5A', 
                      color: 'white',
                      borderRadius: '12px'
                    }}
                  >
                    <span className="me-2">🏗️</span>
                    {hasTemplate ? 'Editar Plantilla' : 'Crear Plantilla'}
                  </Link>
                  {hasTemplate && (
                    <div className="d-flex gap-2">
                      <button 
                        onClick={exportTemplate}
                        className="btn btn-outline-success btn-sm flex-fill"
                      >
                        📥 Exportar
                      </button>
                      <label className="btn btn-outline-success btn-sm flex-fill mb-0">
                        📤 Importar
                        <input 
                          type="file" 
                          accept=".json"
                          onChange={importTemplate}
                          className="d-none"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fill Syllabus */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: hasTemplate ? 'linear-gradient(135deg, #276CA120, #276CA110)' : '#DEE2E620',
                        color: hasTemplate ? '#276CA1' : '#6C757D',
                        fontSize: '2.5rem'
                      }}
                    >
                      ✍️
                    </div>
                  </div>
                  <h4 className="card-title text-primary mb-3">Llenar Sílabo</h4>
                  <p className="card-text text-muted mb-4">
                    {hasTemplate 
                      ? 'Completa los datos de tu sílabo y genera un documento PDF profesional'
                      : 'Primero necesitas crear una plantilla para poder llenar datos'
                    }
                  </p>
                  <Link 
                    to={hasTemplate ? "/editor" : "#"}
                    className={`btn btn-lg w-100 ${!hasTemplate ? 'disabled' : ''}`}
                    style={{ 
                      backgroundColor: hasTemplate ? '#276CA1' : '#6C757D', 
                      borderColor: hasTemplate ? '#276CA1' : '#6C757D', 
                      color: 'white',
                      borderRadius: '12px'
                    }}
                  >
                    <span className="me-2">✍️</span>
                    {completionStats.percentage > 0 ? 'Continuar Editando' : 'Empezar a Llenar'}
                  </Link>
                  {!hasTemplate && (
                    <small className="text-muted d-block mt-2">
                      Crea una plantilla primero
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-transparent border-0 py-4">
              <h5 className="mb-0 text-center fw-bold">
                <span className="me-2">⚡</span>
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <button 
                    className="btn btn-outline-primary w-100 py-3 border-2" 
                    onClick={loadExampleTemplate}
                    style={{ borderRadius: '12px' }}
                    disabled={isLoading}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="me-3" style={{ fontSize: '1.8rem' }}>📂</span>
                      <div className="text-start">
                        <div className="fw-semibold">Cargar Ejemplo</div>
                        <small className="text-muted">Plantilla prediseñada completa</small>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="col-md-6">
                  <button 
                    className="btn btn-outline-danger w-100 py-3 border-2" 
                    onClick={clearAllData}
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="me-3" style={{ fontSize: '1.8rem' }}>🗑️</span>
                      <div className="text-start">
                        <div className="fw-semibold">Limpiar Todo</div>
                        <small className="text-muted">Eliminar plantilla y datos</small>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="row justify-content-center mt-5">
        <div className="col-lg-8 text-center">
          <div className="card border-0" style={{ 
            backgroundColor: '#EAF8FF',
            borderRadius: '20px'
          }}>
            <div className="card-body p-4">
              <h6 className="text-primary mb-3 fw-bold">💡 ¿Cómo funciona?</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="d-flex flex-column align-items-center">
                    <div className="fw-bold text-primary mb-2">1. 🏗️ Crear</div>
                    <small className="text-muted text-center">Diseña la estructura de tu sílabo con secciones personalizadas</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex flex-column align-items-center">
                    <div className="fw-bold text-primary mb-2">2. ✍️ Llenar</div>
                    <small className="text-muted text-center">Completa la información académica de forma organizada</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex flex-column align-items-center">
                    <div className="fw-bold text-primary mb-2">3. 📄 Exportar</div>
                    <small className="text-muted text-center">Genera un PDF profesional listo para usar</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .btn:hover {
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Home;