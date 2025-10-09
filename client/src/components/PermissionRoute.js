import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, getDefaultRoute } from '../utils/permissions';

// Componente per proteggere le route in base ai permessi
const PermissionRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#dc3545'
      }}>
        Caricamento...
      </div>
    );
  }
  
  // Se non è autenticato, reindirizza al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Se l'utente non ha i permessi per questa pagina, reindirizza alla home
  const userRole = user?.permissions;
  if (!hasPermission(userRole, requiredPermission)) {
    const defaultRoute = getDefaultRoute(userRole);
    return <Navigate to={defaultRoute} replace />;
  }
  
  return children;
};

export default PermissionRoute;
