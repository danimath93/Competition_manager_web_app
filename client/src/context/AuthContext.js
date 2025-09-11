import React, { createContext, useContext, useState, useEffect } from 'react';
import { suspendSession, clearAuthData } from '../utils/auth';
import { loginUser } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se c'è un token salvato
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Call login function
      const response = await loginUser(username, password);

      if (response.user && response.token && response.token.length > 0) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthData();
  };

  const handleSuspendSession = () => {
    setUser(null);
    setIsAuthenticated(false);
    suspendSession(); // Utilizza la funzione utility che include anche il redirect
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    suspendSession: handleSuspendSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
