import React from 'react';

const StatsPanel = ({ 
  stats, 
  restoreBackup, 
  showPreview, 
  setShowPreview, 
  checkLocalStorage 
}) => {
  return (
    <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <h6 className="card-title mb-3 fw-bold">📊 Estadísticas</h6>
        <div className="row text-center g-3">
          <div className="col-4">
            <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
              <div className="text-primary fw-bold fs-5">{stats.totalNodes}</div>
              <small className="text-muted">Nodos</small>
            </div>
          </div>
          <div className="col-4">
            <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
              <div className="text-success fw-bold fs-5">{stats.maxDepth}</div>
              <small className="text-muted">Niveles</small>
            </div>
          </div>
          <div className="col-4">
            <div className="border rounded p-3" style={{ borderRadius: '12px' }}>
              <div className="text-warning fw-bold fs-5">{stats.totalSections}</div>
              <small className="text-muted">Secciones</small>
            </div>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm flex-fill"
            onClick={restoreBackup}
            style={{ borderRadius: '8px' }}
          >
            🔄 Backup
          </button>
          <button
            className="btn btn-outline-info btn-sm flex-fill"
            onClick={() => setShowPreview(!showPreview)}
            style={{ borderRadius: '8px' }}
          >
            👁️ Preview
          </button>
          <button
            className="btn btn-outline-info btn-sm flex-fill"
            onClick={checkLocalStorage}
            style={{ borderRadius: '8px' }}
          >
            🔍 Check Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;