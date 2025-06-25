import React, { useState, useEffect } from 'react';

const SyllabusSidebar = ({
  searchTerm,
  onSearchChange,
  progressStats,
  pdfGenerationCount,
  previewCount,
  lastSaved,
  hasUnsavedChanges,
  onExpandAll,
  onCollapseAll,
  onDebugStorage
}) => {
  // Estado para forzar re-render del timestamp
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el tiempo cada minuto para que los timestamps relativos se actualicen
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);
  
  // Función para formatear la fecha de último guardado
  const formatLastSaved = (date) => {
    if (!date) return 'Nunca';
    
    // Si es string, convertir a Date (maneja ISO strings)
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    // Usar currentTime para forzar actualizaciones
    const now = currentTime;
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    // Hace un momento (menos de 30 segundos)
    if (diffInSeconds < 30) return 'Hace un momento';
    
    // Hace X segundos (30 segundos a 1 minuto)
    if (diffInSeconds < 60) return `Hace ${diffInSeconds} seg`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    
    // Hace X minutos (1 minuto a 1 hora)
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    // Hace X horas (1 hora a 1 día)
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Hace X días (1 día a 7 días)
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    
    // Para fechas más antiguas, mostrar fecha completa
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color del progreso
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'danger';
  };

  const progressColor = getProgressColor(progressStats?.percentage || 0);

  return (
    <div className="mb-4">
      {/* Buscador */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <div className="card-body p-3">
          <h6 className="fw-bold mb-3 text-primary">
            <i className="fas fa-search me-2"></i>
            Búsqueda
          </h6>
          <div className="input-group">
            <span className="input-group-text border-0 bg-light">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 bg-light"
              placeholder="Buscar secciones..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary border-0"
                type="button"
                onClick={() => onSearchChange('')}
                title="Limpiar búsqueda"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          {searchTerm && (
            <small className="text-muted mt-2 d-block">
              <i className="fas fa-info-circle me-1"></i>
              Buscando: "{searchTerm}"
            </small>
          )}
        </div>
      </div>

      {/* Controles de Expansión */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <div className="card-body p-3">
          <h6 className="fw-bold mb-3 text-primary">
            <i className="fas fa-expand-arrows-alt me-2"></i>
            Controles de Sección
          </h6>
          <hr />
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={() => {
                onExpandAll && onExpandAll();
              }}
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-plus-circle me-2"></i>
              Expandir Todo ⬇️
            </button>
            <button
              className="btn btn-secondary btn-sm w-100"
              onClick={() => {
                onCollapseAll && onCollapseAll();
              }}
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-minus-circle me-2"></i>
              Colapsar Todo ➡️
            </button>
          </div>
        </div>
      </div>

      {/* Progreso */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3 text-primary">
            <i className="fas fa-chart-pie me-2"></i>
            Progreso del Sílabo
          </h6>
          <hr />
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Completado</small>
              <small className={`fw-bold text-${progressColor}`}>
                {progressStats?.percentage || 0}%
              </small>
            </div>
            <div className="progress" style={{ height: '10px', borderRadius: '10px' }}>
              <div
                className={`progress-bar bg-${progressColor}`}
                style={{
                  width: `${progressStats?.percentage || 0}%`,
                  borderRadius: '10px',
                  transition: 'width 0.5s ease'
                }}
                role="progressbar"
                aria-valuenow={progressStats?.percentage || 0}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div className="row text-center g-2">
            <div className="col-6">
              <div className={`fw-bold text-${progressColor} fs-5`}>
                {progressStats?.completedFields || 0}
              </div>
              <small className="text-muted">Completados</small>
            </div>
            <div className="col-6">
              <div className="fw-bold text-info fs-5">
                {progressStats?.totalFields || 0}
              </div>
              <small className="text-muted">Total Campos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3 text-success">
            <i className="fas fa-chart-line me-2"></i>
            Estadísticas
          </h6>
          <hr />

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">
                <i className="fas fa-file-pdf me-1"></i>
                PDFs Generados
              </small>
              <span className="badge bg-success rounded-pill">
                {pdfGenerationCount || 0}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">
                <i className="fas fa-eye me-1"></i>
                Vistas Previas
              </small>
              <span className="badge bg-info rounded-pill">
                {previewCount || 0}
              </span>
            </div>
          </div>

          {/* Estado de guardado */}
          <div className="text-center mb-3">
            <div className="mb-2">
              <i className={`fas fa-save me-1 ${hasUnsavedChanges ? 'text-warning' : 'text-success'}`}></i>
              <small className="text-muted">Último guardado:</small>
            </div>
            <div className={`fw-bold ${hasUnsavedChanges ? 'text-warning' : 'text-success'}`}>
              {formatLastSaved(lastSaved)}
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="alert alert-warning border-0 py-2 mb-3" style={{ borderRadius: '8px' }}>
              <small>
                <i className="fas fa-exclamation-triangle me-1"></i>
                Guardando cambios...
              </small>
            </div>
          )}

          {/* Botones de acción */}
          {/* <div className="d-grid gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onDebugStorage}
              style={{ borderRadius: '8px', fontSize: '0.8rem' }}
            >
              <i className="fas fa-bug me-1"></i>
              Debug Storage
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => {
                }}
                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
              >
                <i className="fas fa-code me-1"></i>
                Debug Stats
              </button>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SyllabusSidebar;