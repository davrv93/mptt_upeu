import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth';
import { Navigation } from '../features/navigation';
import AppRoutes from './AppRoutes';

const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial de la aplicación
    const timer = setTimeout(() => setIsInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pantalla de carga inicial de la aplicación
  if (isInitialLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}>
        <div className="text-center" style={{ color: '#276CA1' }}>
          <div className="mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #003264 0%, #1A8D5A 100%)',
                color: 'white',
                fontSize: '2.5rem',
                animation: 'pulse 2s infinite'
              }}
            >
              📚
            </div>
          </div>
          <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h4 className="fw-bold">Iniciando Editor de Sílabo...</h4>
          <p className="opacity-75">Preparando el sistema académico</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 position-relative" style={{
          background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
          {/* Background Pattern */}
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

          {/* Navigation - Solo se muestra si está autenticado */}
          <Navigation />

          {/* Main Content */}
          <main className="position-relative" style={{ zIndex: 1 }}>
            <AppRoutes />
          </main>

          {/* Footer - Solo se muestra si hay contenido autenticado */}
          <AuthenticatedFooter />

          {/* Global Styles */}
          <GlobalStyles />
        </div>
      </Router>
    </AuthProvider>
  );
};

// Footer que solo se muestra cuando el usuario está autenticado
const AuthenticatedFooter = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <footer className="mt-5 py-4 text-center text-muted border-top bg-white">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-md-start">
            <small>
              © 2025 Editor de Sílabo - Sistema Académico Profesional
            </small>
          </div>
          <div className="col-md-6 text-md-end">
            <small>
              <span className="text-success fw-semibold">v2.0</span>
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Componente para estilos globales
const GlobalStyles = () => (
  <style jsx>{`
    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(26, 141, 90, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(26, 141, 90, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(26, 141, 90, 0);
      }
    }

    .hover-nav-item:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .transition-all {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .navbar-collapse.show {
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .card {
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .dropdown-menu {
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Scroll personalizado */
    html {
      scroll-behavior: smooth;
    }
    
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #003264, #1A8D5A);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #1A8D5A, #276CA1);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .navbar-brand div:first-child {
        font-size: 1rem;
      }
      
      .navbar-brand small {
        display: none;
      }
      
      .nav-link {
        margin: 0.25rem 0;
        text-align: center;
      }
    }
    
    /* Button hover effects */
    .btn:hover {
      transform: translateY(-2px);
      transition: all 0.2s ease;
    }
    
    /* Loading states */
    .spinner-border {
      animation: spinner-border 0.75s linear infinite;
    }
    
    @keyframes spinner-border {
      to {
        transform: rotate(360deg);
      }
    }
  `}</style>
);

export default App;