import React from 'react';

const SyllabusSidebar = ({
  searchTerm,
  onSearchChange,
  progressStats,
  pdfGenerationCount,
  previewCount,
  lastSaved,
  hasUnsavedChanges,
  onDebugStorage
}) => {
  
  // Función para formatear la fecha de último guardado
  const formatLastSaved = (date) => {
    if (!date) return 'Nunca';
    
    // Si es string, convertir a Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    
    return dateObj.toLocaleDateString();
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
    <div className="col-lg-3 mb-4">
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

      {/* Progreso */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3 text-primary">
            <i className="fas fa-chart-pie me-2"></i>
            Progreso del Sílabo
          </h6>

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

          {/* Progreso de secciones */}
          {progressStats?.totalSections > 0 && (
            <div className="mt-3 pt-3 border-top">
              <div className="row text-center">
                <div className="col-6">
                  <div className="fw-bold text-success">
                    {progressStats.completedSections}
                  </div>
                  <small className="text-muted">Secciones completas</small>
                </div>
                <div className="col-6">
                  <div className="fw-bold text-secondary">
                    {progressStats.totalSections}
                  </div>
                  <small className="text-muted">Total secciones</small>
                </div>
              </div>
            </div>
          )}

          {/* Indicador de estado */}
          <div className="mt-3">
            {progressStats?.percentage >= 80 && (
              <div className="alert alert-success border-0 py-2 mb-0" style={{ borderRadius: '8px' }}>
                <small>
                  <i className="fas fa-check-circle me-1"></i>
                  ¡Casi listo para generar PDF!
                </small>
              </div>
            )}
            {progressStats?.percentage >= 40 && progressStats?.percentage < 80 && (
              <div className="alert alert-warning border-0 py-2 mb-0" style={{ borderRadius: '8px' }}>
                <small>
                  <i className="fas fa-clock me-1"></i>
                  Buen progreso, continúa...
                </small>
              </div>
            )}
            {progressStats?.percentage < 40 && progressStats?.percentage > 0 && (
              <div className="alert alert-info border-0 py-2 mb-0" style={{ borderRadius: '8px' }}>
                <small>
                  <i className="fas fa-play me-1"></i>
                  Comenzando a completar...
                </small>
              </div>
            )}
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
          <div className="d-grid gap-2">
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
                  console.log('📊 Progress Stats:', progressStats);
                  console.log('🔍 Search Term:', searchTerm);
                }}
                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
              >
                <i className="fas fa-code me-1"></i>
                Debug Stats
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusSidebar;