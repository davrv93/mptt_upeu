import React from 'react';
import { useAuth } from '../auth/AuthContext';

const AuthTest = () => {
  const { isAuthenticated, loading, token, user, environment, authenticate, logout } = useAuth();

  // ✅ VALIDAR que environment existe antes de usarlo
  if (!environment) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center">
          <div className="text-danger mb-3">⚠️</div>
          <p className="text-danger">Error: Environment no está configurado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p className="text-muted">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-lg" style={{ borderRadius: '15px' }}>
      <div className="card-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
        <h4 className="mb-0">
          <i className="fas fa-shield-alt me-2"></i>
          OAuth2 Test - UPEU
        </h4>
      </div>
      <div className="card-body p-4">
        <div className="row">
          <div className="col-md-6">
            <h5 className="mb-3">
              {isAuthenticated ? (
                <span className="text-success">
                  <i className="fas fa-check-circle me-2"></i>
                  ✅ Autenticado
                </span>
              ) : (
                <span className="text-danger">
                  <i className="fas fa-times-circle me-2"></i>
                  ❌ No autenticado
                </span>
              )}
            </h5>
            
            <div className="mb-3">
              <strong>Token:</strong>
              <p className="text-muted small mb-0">
                {token ? `${token.substring(0, 30)}...` : 'No disponible'}
              </p>
            </div>
            
            <div className="mb-3">
              <strong>Usuario:</strong>
              <p className="text-muted small mb-0">
                {user ? (
                  <>
                    {user.name || user.nombres || user.username || 'Usuario UPEU'}<br/>
                    <small className="text-info">{user.email || 'Sin email'}</small>
                  </>
                ) : (
                  'No disponible'
                )}
              </p>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="mb-3">
              <strong>Módulo:</strong>
              <p className="text-muted small mb-0">
                {environment?.module_id || 'No configurado'}
              </p>
            </div>
            
            <div className="mb-3">
              <strong>Cliente:</strong>
              <p className="text-muted small mb-0">
                {environment?.authStrategy?.clientId 
                  ? `${environment.authStrategy.clientId.substring(0, 20)}...`
                  : 'No configurado'
                }
              </p>
            </div>
            
            <div className="mb-3">
              <strong>Endpoint:</strong>
              <p className="text-muted small mb-0">
                {environment?.authStrategy?.baseEndpoint || 'No configurado'}
              </p>
            </div>
          </div>
        </div>
        
        <hr />
        
        <div className="d-flex gap-3 justify-content-center">
          {!isAuthenticated ? (
            <button 
              className="btn btn-primary btn-lg px-4"
              onClick={authenticate}
              style={{ borderRadius: '25px' }}
            >
              <i className="fas fa-rocket me-2"></i>
              🚀 Iniciar OAuth2
            </button>
          ) : (
            <div className="d-flex gap-3">
              <button 
                className="btn btn-success btn-lg px-4"
                disabled
                style={{ borderRadius: '25px' }}
              >
                <i className="fas fa-check me-2"></i>
                ✅ Autenticado
              </button>
              <button 
                className="btn btn-outline-danger px-4"
                onClick={logout}
                style={{ borderRadius: '25px' }}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
        
        {isAuthenticated && user && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="text-success mb-2">
              <i className="fas fa-user-check me-2"></i>
              Datos del Usuario
            </h6>
            <pre className="small text-dark mb-0" style={{ fontSize: '12px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTest;