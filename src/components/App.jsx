import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import TemplateBuilder from './TemplateBuilder';
import SyllabusEditor from './SyllabusEditor';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import OAuth2Callback from './OAuth2Callback';
import UserProfile from './UserProfile';

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [templateExists, setTemplateExists] = useState(false);

  const { isAuthenticated, loading, token, user, environment, authenticate, logout } = useAuth();

  useEffect(() => {
    const template = localStorage.getItem('mptt_template');
    setTemplateExists(template && JSON.parse(template).length > 1);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Función mejorada para logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // Limpiar sesión local
      logout();
      
      // Redireccionar al sistema de autenticación
      const redirectUri = encodeURIComponent(environment.authStrategy.redirectUri);
      const logoutUrl = `${environment.authStrategy.baseEndpoint}/accounts/logout/?next=/accounts/login/?redirect_uri=${redirectUri}`;
      
      // Redirigir después de un breve delay para asegurar que el logout se procese
      setTimeout(() => {
        window.location.href = logoutUrl;
      }, 100);
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: forzar recarga de la página
      window.location.reload();
    }
  };

  const navItems = [
    { path: '/', icon: '🏠', label: 'Inicio', color: '#003264' },
    { path: '/plantilla', icon: '🏗️', label: 'Crear Plantilla', color: '#1A8D5A' },
    { path: '/editor', icon: '✍️', label: 'Llenar Sílabo', color: '#276CA1', disabled: !templateExists },
  ];

  // Si no está autenticado, mostrar botón de login
  if (!isAuthenticated && !loading) {
    return (
      <nav className="navbar navbar-expand-lg shadow-lg sticky-top" style={{
        background: '#003264',
        backdropFilter: 'blur(10px)',
        zIndex: 2
      }}>
        <div className="container">
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
          
          <button 
            className="btn btn-outline-light"
            onClick={authenticate}
          >
            <i className="fas fa-sign-in-alt me-2"></i>
            Iniciar Sesión
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg shadow-lg sticky-top" style={{
      background: '#003264',
      backdropFilter: 'blur(10px)',
      zIndex: 2
    }}>
      <div className="container">
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

        <div className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'}`}>
          <ul className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <li className="nav-item mx-1" key={item.path}>
                <Link
                  to={item.disabled ? '#' : item.path}
                  className={`nav-link px-4 py-2 rounded-pill position-relative d-flex align-items-center gap-2 transition-all ${isActive(item.path)
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

          {/* User Profile Menu */}
          <ul className="navbar-nav ms-3 mb-2 mb-lg-0 profile-menu">
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle p-1" 
                href="#" 
                id="navbarDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={{ textDecoration: 'none' }}
              >
                <div className="d-flex align-items-center text-white">
                  {/* Avatar */}
                  <div className="me-2">
                    {user?.foto ? (
                      <img
                        src={user.foto}
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }}
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback avatar con iniciales */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #1A8D5A, #276CA1)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        fontSize: '0.9rem',
                        display: user?.foto ? 'none' : 'flex'
                      }}
                    >
                      {getUserInitials(user?.user_name)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="d-none d-lg-block text-start">
                    <div className="fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                      {user?.user_name || user?.username || 'Usuario'}
                    </div>
                    <small className="opacity-75" style={{ fontSize: '0.75rem' }}>
                      {user?.departament_name || user?.entity_name || 'Departamento'}
                    </small>
                  </div>
                </div>
              </a>

              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" style={{
                minWidth: '250px',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                {/* User info header */}
                <li className="px-3 py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {user?.foto ? (
                        <img
                          src={user.foto}
                          alt="Profile"
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #1A8D5A, #276CA1)',
                            fontSize: '1.2rem'
                          }}
                        >
                          {getUserInitials(user?.user_name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">
                        {user?.user_name || 'Usuario'}
                      </div>
                      <small className="text-muted">
                        {user?.username || ''}
                      </small>
                      <br />
                      <small className="text-muted">
                        {user?.departament_name || ''}
                      </small>
                    </div>
                  </div>
                </li>

                {/* Menu items */}
                <li>
                  <Link className="dropdown-item" to="/perfil">
                    <i className="fas fa-user fa-fw me-2"></i> 
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-cog fa-fw me-2"></i> 
                    Configuración
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a 
                    className="dropdown-item text-danger" 
                    href="#" 
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt fa-fw me-2"></i>
                    Cerrar Sesión
                  </a>
                </li>
              </ul>
            </li>
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
    <AuthProvider>
      <Router>
        <div className="min-vh-100 position-relative" style={{
          background: 'linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
          <Navigation />

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

          <main className="position-relative" style={{ zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/plantilla" element={<TemplateBuilder />} />
              <Route path="/editor" element={<SyllabusEditor />} />
              <Route path="/auth/callback" element={<OAuth2Callback />} />
              <Route path="/perfil" element={<UserProfile />} />
            </Routes>
          </main>

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
      `}</style>
      </Router>
    </AuthProvider>
  );
};

export default App;