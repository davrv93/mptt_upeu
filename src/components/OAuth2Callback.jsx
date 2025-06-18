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
    console.log('🔄 ==========================================');
    console.log('🔄 INICIANDO DEBUG COMPLETO DE OAUTH CALLBACK');
    console.log('🔄 ==========================================');
    
    try {
      // 🎯 RECOPILAR TODA LA INFORMACIÓN
      const fullDebugInfo = gatherFullDebugInfo();
      setDebugInfo(fullDebugInfo);
      
      // 🎯 PROCESAR RESULTADO
      const result = parseOAuthResult();
      
      if (result.isSuccess()) {
        console.log('✅ ==========================================');
        console.log('✅ OAUTH RESULT EXITOSO');
        console.log('✅ ==========================================');
        console.log('✅ Token recibido:', result.getToken());
        setStatus('success');
        
        // Validar token
        const success = await validateAndStoreToken(result.getToken());
        
        if (success) {
          console.log('✅ Token validado exitosamente');
          setTimeout(() => navigate(result.getRedirect()), 2000);
        } else {
          throw new Error('Token validation failed');
        }
      } else {
        console.log('❌ ==========================================');
        console.log('❌ OAUTH RESULT CON ERROR');
        console.log('❌ ==========================================');
        console.log('❌ Error detectado:', result.getError());
        throw new Error(result.getError() || 'OAuth failed');
      }

    } catch (error) {
      console.error('💥 ==========================================');
      console.error('💥 ERROR PROCESANDO OAUTH');
      console.error('💥 ==========================================');
      console.error('💥 Error completo:', error);
      console.error('💥 Stack trace:', error.stack);
      setStatus('error');
      setTimeout(() => navigate('/'), 5000);
    }
  };

  // 🔍 RECOPILAR TODA LA INFORMACIÓN DE DEBUG
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
    
    console.log('🔍 ==========================================');
    console.log('🔍 INFORMACIÓN COMPLETA DE LA URL');
    console.log('🔍 ==========================================');
    console.log('🔍 URL completa:', currentUrl);
    console.log('🔍 Origin:', origin);
    console.log('🔍 Protocol:', protocol);
    console.log('🔍 Host:', host);
    console.log('🔍 Pathname:', pathname);
    console.log('🔍 Search (query params):', search);
    console.log('🔍 Hash (fragment):', hash);
    console.log('🔍 Referrer (de dónde vienes):', document.referrer);
    console.log('🔍 Timestamp:', debugInfo.timestamp);
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('🔍 ==========================================');
    
    return debugInfo;
  };

  // 🎯 PARSEADOR MEJORADO CON DEBUG COMPLETO
  const parseOAuthResult = () => {
    console.log('🔍 ==========================================');
    console.log('🔍 PARSEANDO RESULTADO OAUTH2');
    console.log('🔍 ==========================================');
    
    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);
    
    console.log('🔍 Raw hash (después de #):', hash || 'VACÍO');
    console.log('🔍 Raw search (después de ?):', search || 'VACÍO');
    console.log('🔍 Usando para parsear:', hash || search || 'NADA');
    
    // Crear URLSearchParams
    const params = new URLSearchParams(hash || search);
    
    console.log('🔍 ==========================================');
    console.log('🔍 ANÁLISIS DE PARÁMETROS');
    console.log('🔍 ==========================================');
    console.log('🔍 Cantidad de parámetros:', params.size);
    console.log('🔍 Keys detectadas:', Array.from(params.keys()));
    console.log('🔍 Values detectados:', Array.from(params.values()));
    
    // Mostrar cada parámetro individualmente
    console.log('🔍 ==========================================');
    console.log('🔍 PARÁMETROS INDIVIDUALES');
    console.log('🔍 ==========================================');
    
    if (params.size === 0) {
      console.log('🔍 ❌ NO se encontraron parámetros');
    } else {
      for (let [key, value] of params) {
        console.log(`🔍 ✓ ${key}: "${value}"`);
      }
    }
    
    // Extraer campos OAuth2 estándar
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');
    const expiresIn = params.get('expires_in');
    const scope = params.get('scope');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log('🔍 ==========================================');
    console.log('🔍 CAMPOS OAUTH2 EXTRAÍDOS');
    console.log('🔍 ==========================================');
    console.log('🔍 access_token:', accessToken || 'NULL');
    console.log('🔍 token_type:', tokenType || 'NULL');
    console.log('🔍 expires_in:', expiresIn || 'NULL');
    console.log('🔍 scope:', scope || 'NULL');
    console.log('🔍 state:', state || 'NULL');
    console.log('🔍 error:', error || 'NULL');
    console.log('🔍 error_description:', errorDescription || 'NULL');
    
    // Analizar el tipo de respuesta
    console.log('🔍 ==========================================');
    console.log('🔍 ANÁLISIS DEL TIPO DE RESPUESTA');
    console.log('🔍 ==========================================');
    
    if (error) {
      console.log('🔍 🚨 TIPO: ERROR OAUTH2');
      console.log(`🔍 🚨 Error code: ${error}`);
      console.log(`🔍 🚨 Error description: ${errorDescription || 'No description'}`);
      
      // Analizar tipos de error conocidos
      switch(error) {
        case 'unauthorized_client':
          console.log('🔍 📋 CAUSA: redirect_uri NO está autorizado en el servidor');
          console.log('🔍 📋 SOLUCIÓN: Agregar tu URL a las permitidas o usar ngrok');
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
    } else if (accessToken) {
      console.log('🔍 ✅ TIPO: SUCCESS - TOKEN RECIBIDO');
      console.log(`🔍 ✅ Token: ${accessToken.substring(0, 20)}...`);
    } else {
      console.log('🔍 ❓ TIPO: DESCONOCIDO - Ni error ni token');
    }
    
    // Crear objeto de resultado
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
    
    console.log('🔍 ==========================================');
    console.log('🔍 RESULTADO FINAL');
    console.log('🔍 ==========================================');
    console.log('🔍 isSuccess():', result.isSuccess());
    console.log('🔍 getRawResult():', result.getRawResult());
    console.log('🔍 ==========================================');
    
    return result;
  };

  // UI components (igual que antes pero con info de debug)
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
              Analizando respuesta OAuth2... (revisa la consola)
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
              Problema en la autenticación (revisa la consola)
            </p>
            <div className="alert alert-danger border-0 shadow-sm">
              <small>
                <strong>✗</strong> Error en callback OAuth<br/>
                <strong>🔍</strong> Revisa la consola del navegador<br/>
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