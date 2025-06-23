import React from 'react';

const TemplateControls = ({ 
  searchTerm, 
  setSearchTerm, 
  setShowTemplateModal, 
  exportTemplate, 
  handleImportTemplate, 
  validationResults 
}) => {
  return (
    <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <span>🔍</span>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Buscar nodos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '0 12px 12px 0' }}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowTemplateModal(true)}
                style={{ borderRadius: '12px' }}
              >
                <span className="me-1">📋</span>
                Plantillas
              </button>
              <button
                className="btn btn-outline-success"
                onClick={exportTemplate}
                style={{ borderRadius: '12px' }}
              >
                <span className="me-1">📥</span>
                Exportar
              </button>
              <label className="btn btn-outline-info mb-0" style={{ borderRadius: '12px' }}>
                <span className="me-1">📤</span>
                Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  className="d-none"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Validación y estado */}
        {(validationResults.errors.length > 0 || validationResults.warnings.length > 0) && (
          <div className="mt-3">
            {validationResults.errors.length > 0 && (
              <div className="alert alert-danger border-0 mb-2" style={{ borderRadius: '12px' }}>
                <strong>❌ Errores encontrados:</strong>
                <ul className="mb-0 mt-2">
                  {validationResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationResults.warnings.length > 0 && (
              <div className="alert alert-warning border-0 mb-0" style={{ borderRadius: '12px' }}>
                <strong>⚠️ Advertencias:</strong>
                <ul className="mb-0 mt-2">
                  {validationResults.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateControls;