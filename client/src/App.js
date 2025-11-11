import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './components/Register';
import RequestPasswordReset from './components/RequestPasswordReset';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';
import PermissionRoute from './components/PermissionRoute';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import CompetitionRegistration from './pages/CompetitionRegistration';
import Athletes from './pages/Athletes';
import ClubAdmin from './pages/ClubAdmin';
import ClubUser from './pages/ClubUser';
import Judges from './pages/Judges';
import InfoClubLogged from './pages/InfoClubLogged';
import Categories from './pages/Categories';
import { getDefaultRoute } from './utils/permissions';
import './App.css';

// Componente principale dell'app
const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<RequestPasswordReset />} />
        <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Ottiene la route di default basata sui permessi dell'utente
  const userRole = user?.permissions || user?.role;
  const defaultRoute = getDefaultRoute(userRole);

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        
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
            <ClubAdmin />
          </PermissionRoute> ) : (
            <ClubUser />
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
            <Categories />
          </PermissionRoute>
        } />
        
        {/* Impostazioni - solo superAdmin, admin */}
        <Route path="/settings" element={
          <PermissionRoute requiredPermission="settings">
            <div>Pagina Impostazioni (da implementare)</div>
          </PermissionRoute>
        } />
        
        {/* Redirect per tutte le route non valide */}
        <Route path="*" element={<Navigate to="/login" replace />} />
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
