import React from 'react';
import { useAuth } from '../auth/AuthContext';

// Loading component para mostrar mientras se valida la sesión
const AuthLoadingScreen = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center">
    <div className="text-center" style={{ color: '#276CA1' }}>
      <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }}></div>
      <h4 className="fw-bold">Validando sesión...</h4>
      <p className="opacity-75">Verificando autenticación</p>
    </div>
  </div>
);

// Login screen para usuarios no autenticados
const LoginScreen = () => {
  const { authenticate } = useAuth();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Background pattern */}
      <div
        className="position-fixed w-100 h-100"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(26, 141, 90, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 50, 100, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(39, 108, 161, 0.05) 0%, transparent 50%)
          `,
          zIndex: -1,
          top: 0,
          left: 0
        }}
      />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5 text-center">
                {/* Logo/Icon */}
                <div className="mb-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto"
                    style={{
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)',
                      color: 'white',
                      fontSize: '3rem'
                    }}
                  >
                    📚
                  </div>
                </div>

                {/* Title */}
                <h2 className="fw-bold text-primary mb-3">Editor de Sílabo</h2>
                <p className="text-muted mb-4">
                  Sistema Académico Profesional para la gestión de sílabos
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="row g-3 text-start">
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <div className="me-3 text-success">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <small className="text-muted">Crear plantillas personalizadas</small>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <div className="me-3 text-success">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <small className="text-muted">Edición colaborativa de contenido</small>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <div className="me-3 text-success">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <small className="text-muted">Exportación a PDF profesional</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <button 
                  onClick={authenticate}
                  className="btn btn-lg w-100 mb-3 fw-semibold"
                  style={{ 
                    backgroundColor: '#003264', 
                    borderColor: '#003264', 
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 0'
                  }}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Acceder con OAuth2
                </button>

                {/* Info */}
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Acceso seguro con autenticación institucional
                </small>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                © 2025 Editor de Sílabo - Sistema Académico Profesional
                <span className="mx-2">•</span>
                <span className="text-success">v2.0</span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se valida la sesión
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;