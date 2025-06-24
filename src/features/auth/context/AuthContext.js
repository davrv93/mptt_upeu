import { createContext, useContext, useState, useEffect } from 'react';
import { environment } from '../../../shared/config/environment';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  TOKEN: 'oauth_token',
  USER: 'user_data'
};

const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
  
  getJSON: (key) => {
    try {
      const item = storage.get(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing JSON from ${key}:`, error);
      return null;
    }
  },
  
  setJSON: (key, value) => {
    try {
      return storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error stringifying JSON for ${key}:`, error);
      return false;
    }
  }
};

const authAPI = {
  validateToken: async (tokenValue) => {
    const apiUrl = `${environment.apiUrls.auth}/api/oauth/valid-tokens-oauth`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tokenValue 
      },
      body: JSON.stringify({ 
        token: tokenValue 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token validation failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  getUserInfo: async (tokenValue) => {
    const apiUrl = `${environment.apiUrls.auth}/api/user/info`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tokenValue 
      },
      body: JSON.stringify({
        id_padre: environment.module_id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`User info request failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return responseData.data?.user || null;
  },

  introspectToken: async (token) => {
    const response = await fetch(`${environment.authStrategy.baseEndpoint}/oauth/introspect/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: `token=${token}&token_type_hint=access_token`
    });

    if (!response.ok) {
      throw new Error(`Token introspection failed: ${response.status}`);
    }

    return response.json();
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = storage.get(STORAGE_KEYS.TOKEN);
      const storedUser = storage.getJSON(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        const tokenInfo = storedUser.token_info;
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenInfo && tokenInfo.exp && tokenInfo.exp > currentTime) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const buildAuthUrl = () => {
    const { baseEndpoint, clientId, redirectUri } = environment.authStrategy;
    const scope = 'read introspection';
    
    const params = new URLSearchParams({
      response_type: 'token',
      client_id: clientId,
      scope,
      redirect_uri: redirectUri
    });

    const next = 'next=/oauth/authorize/';
    const encodedParams = encodeURIComponent(`?${params.toString()}`);
    
    return `${baseEndpoint}/accounts/logout?${next}${encodedParams}`;
  };

  const authenticate = () => {
    window.location.href = buildAuthUrl();
  };

  const createUserData = (tokenData, userInfo = null, validationResult = null) => {
    const baseData = {
      username: tokenData.username,
      client_id: tokenData.client_id,
      scope: tokenData.scope,
      exp: tokenData.exp,
      validated_at: new Date().toISOString()
    };

    return {
      ...(userInfo || {}),
      token_info: baseData,
      ...(validationResult && { validation_info: validationResult })
    };
  };

  const saveAuthData = (tokenValue, userData) => {
    const tokenSaved = storage.set(STORAGE_KEYS.TOKEN, tokenValue);
    const userSaved = storage.setJSON(STORAGE_KEYS.USER, userData);
    
    if (tokenSaved && userSaved) {
      setToken(tokenValue);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const validateAndStoreToken = async (tokenValue) => {
    try {
      const [tokenData, validationResult] = await Promise.allSettled([
        authAPI.introspectToken(tokenValue),
        authAPI.validateToken(tokenValue)
      ]);

      if (tokenData.status === 'rejected') {
        throw tokenData.reason;
      }

      const introspectData = tokenData.value;
      const validationData = validationResult.status === 'fulfilled' ? validationResult.value : null;

      let userInfo = null;
      try {
        userInfo = await authAPI.getUserInfo(tokenValue);
      } catch (error) {
        console.warn('Could not fetch user info, continuing with token data:', error.message);
      }

      const userData = createUserData(introspectData, userInfo, validationData);
      
      return saveAuthData(tokenValue, userData);

    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  const clearAuth = () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    isAuthenticated,
    loading,
    token,
    user,
    environment,
    authenticate,
    validateAndStoreToken,
    logout,
    validateTokenOAuth: authAPI.validateToken,
    getUserData: authAPI.getUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};