import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const OAuth2Callback = () => {
  const [status, setStatus] = useState('processing');
  const [debugInfo, setDebugInfo] = useState({});
  const navigate = useNavigate();
  const { validateAndStoreToken } = useAuth();

  useEffect(() => {
    processOAuthResult();
  }, []);

  const processOAuthResult = async () => {
    try {
      const fullDebugInfo = gatherFullDebugInfo();
      setDebugInfo(fullDebugInfo);

      const result = parseOAuthResult();
      
      if (result.isSuccess()) {
        setStatus('success');
        
        const success = await validateAndStoreToken(result.getToken());
        
        if (success) {
          setTimeout(() => navigate(result.getRedirect()), 6000);
        } else {
          throw new Error('Token validation failed');
        }
      } else {
        throw new Error(result.getError() || 'OAuth failed');
      }

    } catch (error) {
      console.error('💥 Error completo:', error);
      setStatus('error');
      setTimeout(() => navigate('/'), 5000);
    }
  };

  const gatherFullDebugInfo = () => {
    const currentUrl = window.location.href;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    const origin = window.location.origin;
    const host = window.location.host;
    const protocol = window.location.protocol;
    
    const debugInfo = {
      url: {
        full: currentUrl,
        origin,
        protocol,
        host,
        pathname,
        search,
        hash
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    
    return debugInfo;
  };

  const parseOAuthResult = () => {
    
    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);
    
    const params = new URLSearchParams(hash || search);
    
    if (params.size === 0) {
      console.log('🔍 ❌ NO se encontraron parámetros');
    } else {
      for (let [key, value] of params) {
        console.log(`🔍 ✓ ${key}: "${value}"`);
      }
    }
    
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');
    const expiresIn = params.get('expires_in');
    const scope = params.get('scope');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      
      switch(error) {
        case 'unauthorized_client':
          console.log('🔍 📋 CAUSA: redirect_uri NO está autorizado en el servidor');
          break;
        case 'access_denied':
          console.log('🔍 📋 CAUSA: Usuario rechazó el acceso');
          break;
        case 'invalid_request':
          console.log('🔍 📋 CAUSA: Request malformado');
          break;
        case 'unsupported_response_type':
          console.log('🔍 📋 CAUSA: response_type no soportado');
          break;
        default:
          console.log('🔍 📋 CAUSA: Error OAuth2 desconocido');
      }
    } 
    
    const result = {
      isSuccess: () => !error && !!accessToken,
      getToken: () => accessToken,
      getTokenType: () => tokenType,
      getExpiresIn: () => expiresIn,
      getScope: () => scope,
      getError: () => error ? `${error}: ${errorDescription}` : null,
      getRedirect: () => '/',
      getErrorDescription: () => errorDescription,
      getState: () => state,
      getRawResult: () => ({ 
        accessToken, 
        tokenType, 
        expiresIn, 
        scope, 
        state, 
        error, 
        errorDescription 
      })
    };

    
    return result;
  };

  switch (status) {
    case 'processing':
      return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h3 className="text-primary mb-3">Procesando autenticación...</h3>
            <p className="text-muted">
              Analizando respuesta OAuth2...
            </p>
            <div className="progress mt-4" style={{ height: '4px' }}>
              <div className="progress-bar progress-bar-striped progress-bar-animated" 
                   style={{ width: '100%' }}></div>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                🔍 DEBUG: {debugInfo.url?.full}
              </small>
            </div>
          </div>
        </div>
      );

    case 'success':
      return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="mb-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#198754',
                  color: 'white',
                  fontSize: '3rem'
                }}
              >
                ✓
              </div>
            </div>
            <h3 className="text-success mb-3">¡Autenticación exitosa!</h3>
            <p className="text-muted mb-4">
              Token OAuth2 recibido y validado
            </p>
            <div className="alert alert-success border-0 shadow-sm">
              <small>
                <strong>✓</strong> OAuth2 procesado correctamente<br/>
                <strong>✓</strong> Token validado con servidor<br/>
                <strong>↗</strong> Redirigiendo...
              </small>
            </div>
          </div>
        </div>
      );

    case 'error':
      return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="mb-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#DC354520',
                  color: '#DC3545',
                  fontSize: '3rem'
                }}
              >
                ❌
              </div>
            </div>
            <h3 className="text-danger mb-3">Error OAuth2</h3>
            <p className="text-muted mb-4">
              Problema en la autenticación
            </p>
            <div className="alert alert-danger border-0 shadow-sm">
              <small>
                <strong>✗</strong> Error en callback OAuth<br/>
                <strong>↗</strong> Regresando al inicio...
              </small>
            </div>
            <button 
              className="btn btn-outline-primary mt-3"
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default OAuth2Callback;