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
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
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
            onClick={onDebugStorage}
            style={{ borderRadius: '8px', fontSize: '0.8rem' }}
          >
            🔍 Debug Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyllabusSidebar;