import { createContext, useContext, useState, useEffect } from 'react';
import { environment } from '../config/environment';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('oauth_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } 
      } catch (error) {
        console.error('Error restaurando sesión:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);



  const authenticate = () => {
    const redirectUri = encodeURIComponent(environment.authStrategy.redirectUri);
    const scope = 'read introspection';

    const paramRequest = `?response_type=token&client_id=${environment.authStrategy.clientId}&scope=${scope}&redirect_uri=${redirectUri}`;

    const next = 'next=/oauth/authorize/';
    const encodeParamRequest = encodeURIComponent(paramRequest);

    const authUrl = `${environment.authStrategy.baseEndpoint}/accounts/logout?${next}${encodeParamRequest}`;


    window.location.href = authUrl;
  };


  const validateAndStoreToken = async (token) => {

    try {
      const response = await fetch(`${environment.authStrategy.baseEndpoint}/oauth/introspect/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: `token=${token}&token_type_hint=access_token`
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Validation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.active) {
        localStorage.setItem('oauth_token', token);
        localStorage.setItem('user_data', JSON.stringify({
          username: data.username,
          client_id: data.client_id,
          scope: data.scope,
          exp: data.exp,
          validated_at: new Date().toISOString()
        }));

        setIsAuthenticated(true);
        setUser({
          username: data.username,
          scope: data.scope,
          token: token
        });

        return true;
      } else {
        throw new Error('Token is not active');
      }

    } catch (error) {
      console.error('Error validateToken', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    loading,
    token,
    user,
    environment,
    authenticate,
    validateAndStoreToken,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};