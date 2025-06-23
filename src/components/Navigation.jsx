import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTemplateState } from '../hooks/useTemplateState';

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { isAuthenticated, loading, user, logout } = useAuth();

  const { templateExists } = useTemplateState();

  const isActive = (path) => location.pathname === path;

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navItems = [
    { path: '/', icon: '🏠', label: 'Inicio', color: '#003264' },
    { path: '/plantilla', icon: '🏗️', label: 'Crear Plantilla', color: '#1A8D5A' },
    { path: '/editor', icon: '✍️', label: 'Llenar Sílabo', color: '#276CA1', disabled: !templateExists },
  ];

  if (!isAuthenticated || loading) {
    return null;
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
              <button
                className="btn nav-link border-0 bg-transparent"
                id="navbarDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ textDecoration: 'none' }}
              >
                <div className="d-flex align-items-center text-white">
                  <div className="me-2">
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #1A8D5A, #276CA1)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {getUserInitials(user?.user_name || user?.username)}
                    </div>
                  </div>

                  <div className="d-none d-lg-block text-start">
                    <div className="fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                      {user?.user_name || user?.username || 'Usuario'}
                    </div>
                    <small className="opacity-75" style={{ fontSize: '0.75rem' }}>
                      {user?.departament_name || user?.entity_name || 'Departamento'}
                    </small>
                  </div>
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" style={{
                minWidth: '280px',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: '12px'
              }}>
                <li className="px-3 py-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: '60px',
                          height: '60px',
                          background: 'linear-gradient(135deg, #1A8D5A, #276CA1)',
                          fontSize: '1.3rem'
                        }}
                      >
                        {getUserInitials(user?.user_name || user?.username)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="fw-semibold text-dark">
                        {user?.user_name || user?.username || 'Usuario'}
                      </div>
                      {user?.username && user?.user_name && (
                        <small className="text-muted d-block">
                          @{user.username}
                        </small>
                      )}
                      <small className="text-muted d-block">
                        {user?.departament_name || user?.entity_name || 'Sin departamento'}
                      </small>
                      {user?.codigo && (
                        <small className="text-primary d-block">
                          Código: {user.codigo}
                        </small>
                      )}
                    </div>
                  </div>
                </li>

                <li>
                  <Link className="dropdown-item py-2" to="/perfil">
                    <i className="fas fa-user fa-fw me-2 text-primary"></i>
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item py-2" type="button">
                    <i className="fas fa-cog fa-fw me-2 text-secondary"></i>
                    Configuración
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger py-2"
                    onClick={handleLogout}
                    type="button"
                  >
                    <i className="fas fa-sign-out-alt fa-fw me-2"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;