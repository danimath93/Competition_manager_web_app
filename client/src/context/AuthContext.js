import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAuthData } from '../utils/auth';
import { loginUser, checkAuthLevel  } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const response = await loginUser(username, password);
      setUser(response.user);

      // Salvo su localStorage solo le info essenziali
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({username: response.user.username, email: response.user.email, clubName: response.user.clubName, clubBadge: response.user.clubBadge}) );

      return { success: true, user: response.user, token: response.token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error, type: error.type, message: error.message};
    }
  };

  const logout = () => {
    setUser(null);

    clearAuthData();
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    try {
      if (!token) {
        throw new Error('No token found');
      }

      const response = await checkAuthLevel(token);
      if (!response.ok) {
        throw new Error('Unauthorized');
      }

      setUser(response.user);
    } catch (error) {
      setUser(null);
      console.error('Authentication check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

