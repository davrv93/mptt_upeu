import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import TemplateBuilder from './TemplateBuilder';
import SyllabusEditor from './SyllabusEditor';

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [templateExists, setTemplateExists] = useState(false);
  
  useEffect(() => {
    const template = localStorage.getItem('mptt_template');
    setTemplateExists(template && JSON.parse(template).length > 1);
  }, [location]);
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: '🏠', label: 'Inicio', color: '#003264' },
    { path: '/plantilla', icon: '🏗️', label: 'Crear Plantilla', color: '#1A8D5A' },
    { path: '/editor', icon: '✍️', label: 'Llenar Sílabo', color: '#276CA1', disabled: !templateExists }
  ];
  
  return (
    <nav className="navbar navbar-expand-lg shadow-lg sticky-top" style={{ 
      background:'#003264',
      backdropFilter: 'blur(10px)',
      zIndex: 2
    }}>
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand text-white d-flex align-items-center fw-bold">
          <div className="d-flex align-items-center">
            <div 
              className="me-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '45px',
                height: '45px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📚</span>
            </div>
            <div>
              <div className="fw-bold" style={{ fontSize: '1.2rem' }}>Editor de Sílabo</div>
            </div>
          </div>
        </Link>
        
        {/* Template Status Indicator */}
        <div className="d-none d-md-block me-3">
          <div className={`badge ${templateExists ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2`}>
            <small>
              {templateExists ? '✅ Plantilla Lista' : '⚠️ Sin Plantilla'}
            </small>
          </div>
        </div>
        
        {/* Mobile Toggle */}
        <button 
          className="navbar-toggler border-0 p-0" 
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        >
          <div className="navbar-toggler-icon-custom">
            <span style={{ 
              display: 'block',
              width: '20px',
              height: '2px',
              background: 'white',
              margin: '3px 0',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              transform: isCollapsed ? 'none' : 'rotate(45deg) translate(5px, 5px)'
            }}></span>
            <span style={{ 
              display: 'block',
              width: '20px',
              height: '2px',
              background: 'white',
              margin: '3px 0',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              opacity: isCollapsed ? 1 : 0
            }}></span>
            <span style={{ 
              display: 'block',
              width: '20px',
              height: '2px',
              background: 'white',
              margin: '3px 0',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              transform: isCollapsed ? 'none' : 'rotate(-45deg) translate(7px, -6px)'
            }}></span>
          </div>
        </button>
        
        {/* Navigation Menu */}
        <div className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'}`}>
          <ul className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <li className="nav-item mx-1" key={item.path}>
                <Link 
                  to={item.disabled ? '#' : item.path}
                  className={`nav-link px-4 py-2 rounded-pill position-relative d-flex align-items-center gap-2 transition-all ${
                    isActive(item.path) 
                      ? 'bg-white text-dark fw-bold shadow-sm' 
                      : item.disabled 
                        ? 'text-white-50 pe-none' 
                        : 'text-white hover-nav-item'
                  }`}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: item.disabled ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                      return;
                    }
                    setIsCollapsed(true);
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span className="fw-semibold">{item.label}</span>
                  {item.disabled && (
                    <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                      Bloqueado
                    </span>
                  )}
                  {isActive(item.path) && (
                    <span 
                      className="position-absolute top-0 start-0 w-100 h-100 rounded-pill"
                      style={{
                        background: `linear-gradient(45deg, ${item.color}20, ${item.color}10)`,
                        zIndex: -1
                      }}
                    ></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" >
        <div className="text-center"
        style={{
          color: '#276CA1'
        }}
        >
          <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h4 className="fw-bold">Cargando Editor de Sílabo...</h4>
          <p className="opacity-75">Preparando el sistema académico</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-vh-100 position-relative" style={{ 
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}>
        <Navigation />
        
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
        
        {/* Main Content */}
       <main className="position-relative" style={{ zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plantilla" element={<TemplateBuilder />} />
            <Route path="/editor" element={<SyllabusEditor />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="mt-5 py-4 text-center text-muted border-top bg-white">
          <div className="container">
            <small>
              © 2025 Editor de Sílabo - Sistema Académico Profesional
              <span className="mx-2">•</span>
              <span className="text-success">v2.0</span>
            </small>
          </div>
        </footer>
      </div>

      <style jsx>{`
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
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
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
      `}</style>
    </Router>
  );
};

export default App;