import React from 'react';

const TemplateHeader = ({ stats, lastSaved, validationResults }) => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card shadow-sm border-0" style={{ borderRadius: '20px' }}>
          <div
            className="card-header border-0 py-4"
            style={{
              background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)',
              color: 'white',
              borderRadius: '20px 20px 0 0'
            }}
          >
            <div className="row align-items-center">
              <div className="col-md-6">
                <h2 className="mb-0 d-flex align-items-center">
                  <span className="me-3">🏗️</span>
                  Constructor de Plantillas
                </h2>
                <small className="opacity-75">
                  Diseña la estructura de tu sílabo de forma profesional
                </small>
                {lastSaved && (
                  <div className="mt-2">
                    <small className="opacity-75">
                      <span className="me-1">💾</span>
                      Guardado: {lastSaved.toLocaleTimeString()}
                    </small>
                  </div>
                )}
              </div>
              <div className="col-md-6 text-md-end">
                <div className="d-flex align-items-center justify-content-md-end gap-3">
                  <div className="text-center">
                    <div className="h4 mb-0">{stats.totalNodes}</div>
                    <small>Nodos</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 mb-0">{stats.totalSections}</div>
                    <small>Secciones</small>
                  </div>
                  <div className="text-center">
                    <div className={`h4 mb-0 ${validationResults.errors.length > 0 ? 'text-danger' : 'text-success'}`}>
                      {validationResults.errors.length > 0 ? '❌' : '✅'}
                    </div>
                    <small>Estado</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateHeader;