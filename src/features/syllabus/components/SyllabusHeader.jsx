import React from 'react';

const SyllabusHeader = ({ 
  onPreviewPDF, 
  onGeneratePDF, 
  isGeneratingPDF 
}) => {
  return (
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
                    onClick={onPreviewPDF}
                    disabled={isGeneratingPDF}
                    style={{ borderRadius: '12px' }}
                  >
                    👁️ Vista Previa
                  </button>
                  <button
                    className="btn btn-warning btn-lg"
                    onClick={onGeneratePDF}
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
  );
};

export default SyllabusHeader;