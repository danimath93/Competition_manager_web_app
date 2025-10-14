import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Login from './components/Login';
import PermissionRoute from './components/PermissionRoute';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import CompetitionRegistration from './pages/CompetitionRegistration';
import Athletes from './pages/Athletes';
import Clubs from './pages/Clubs';
import Judges from './pages/Judges';
import InfoClubLogged from './pages/InfoClubLogged';
import { getDefaultRoute } from './utils/permissions';
import './App.css';

// Componente principale dell'app
const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  // Ottiene la route di default basata sui permessi dell'utente
  const userRole = user?.permissions || user?.role;
  const defaultRoute = getDefaultRoute(userRole);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} />} />
        
        {/* Dashboard - Accessibile a tutti gli utenti autenticati */}
        <Route path="/dashboard" element={
          <PermissionRoute requiredPermission="dashboard">
            <Dashboard />
          </PermissionRoute>
        } />
        
        {/* Competizioni - superAdmin, admin, user */}
        <Route path="/competitions" element={
          <PermissionRoute requiredPermission="competitions">
            <Competitions />
          </PermissionRoute>
        } />
        
        {/* Registrazione Competizione - superAdmin, admin, user */}
        <Route path="/competitions/:competitionId/register" element={
          <PermissionRoute requiredPermission="competitions">
            <CompetitionRegistration />
          </PermissionRoute>
        } />
        
        {/* Atleti - superAdmin, admin, user */}
        <Route path="/athletes" element={
          <PermissionRoute requiredPermission="athletes">
            <Athletes />
          </PermissionRoute>
        } />
        
        {/* Club - superAdmin, admin, user */}
        <Route path="/clubs" element={ user && (user.permissions === 'admin' || user.permissions === 'superAdmin') ? (
          <PermissionRoute requiredPermission="clubs">
            <Clubs />
          </PermissionRoute> ) : (
            <InfoClubLogged />
          )
        } />
        
        {/* Giudici - solo superAdmin, admin */}
        <Route path="/judges" element={
          <PermissionRoute requiredPermission="judges">
            <Judges />
          </PermissionRoute>
        } />
        
        {/* Categorie - superAdmin, admin, table */}
        <Route path="/categories" element={
          <PermissionRoute requiredPermission="categories">
            <div>Pagina Categorie (da implementare)</div>
          </PermissionRoute>
        } />
        
        {/* Impostazioni - solo superAdmin, admin */}
        <Route path="/settings" element={
          <PermissionRoute requiredPermission="settings">
            <div>Pagina Impostazioni (da implementare)</div>
          </PermissionRoute>
        } />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
