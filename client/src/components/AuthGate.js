// src/components/AuthGate.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AuthGate = ({ requiredPermissions, children }) => {
  const { user, loading } = useAuth();
  
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
  
  if (!user) return <Navigate to="/login" />;

  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!requiredPermissions.includes(user.permissions)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;  
};

export default AuthGate;