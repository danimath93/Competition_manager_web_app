import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './components/Register';
import RequestPasswordReset from './components/RequestPasswordReset';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';
import AuthGate from './components/AuthGate';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import CompetitionRegistration from './pages/CompetitionRegistration';
import Athletes from './pages/Athletes';
import ClubAdmin from './pages/ClubAdmin';
import ClubUser from './pages/ClubUser';
import Judges from './pages/Judges';
import Categories from './pages/Categories';
import './App.css';

// Componente principale dell'app
const AppContent = () => {
  const { user, loading } = useAuth();

  // Mostra uno spinner o nulla mentre verifica l'autenticazione
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  const defaultRoute = (() => {
    console.log("user:", user);
    console.log("loading:", loading);

    
    if (!user) return '/login';

    const role = user.permissions;
    switch (role) {
      case 'superAdmin':
        return '/competitions';
      case 'admin':
        return '/competitions';
      case 'club':
        return '/club';
      case 'user':
        return '/competitions';
      case 'table':
        return '/categories';
      default:
        return '/login';
    }
  })();

  return (
    <Routes>
      {/* Route pubbliche - accessibili sempre */}
      <Route path="/login" element={user ? <Navigate to={defaultRoute} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={defaultRoute} replace /> : <Register />} />
      <Route path="/reset-password" element={<RequestPasswordReset />} />
      <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />

      <Route element={<Layout user={user} />}>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />

        {/* Dashboard - TODO: al momento in sviluppo, solo superAdmin */}
        <Route path="/dashboard" element={
          <AuthGate requiredPermissions={["superAdmin"]}>
            <Dashboard />
          </AuthGate>
        } />

        {/* Competizioni - accesso comune, eventuali funzioni nascoste */}
        <Route path="/competitions" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club", "user"]}>
            <Competitions />
          </AuthGate>
        } />

        {/* Registrazione Competizione - superAdmin, admin, user */}
        <Route path="/competitions/:competitionId/register" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CompetitionRegistration />
          </AuthGate>
        } />

        {/* Atleti - superAdmin, admin, club */}
        <Route path="/athletes" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <Athletes />
          </AuthGate>
        } />

        {/* ClubAdmin - visualizzazione dati e gestione tutti i club */}
        <Route path="/clubs/admin" element={
          <AuthGate requiredPermissions={["admin", "superAdmin"]}>
            <ClubAdmin />
          </AuthGate>
        } />

        {/* ClubUser - visualizzazione dati club specifico */}
        <Route path="/club" element={
          <AuthGate requiredPermissions={["club"]}>
            <ClubUser />
          </AuthGate>
        } />

        {/* Giudici - solo superAdmin, admin */}
        <Route path="/judges" element={
          <AuthGate requiredPermissions={["superAdmin", "admin"]}>
            <Judges />
          </AuthGate>
        } />

        {/* Categorie - superAdmin, admin, table */}
        <Route path="/categories" element={
          <AuthGate requiredPermissions={["superAdmin", "admin"]}>
            <Categories />
          </AuthGate>
        } />

        {/* Impostazioni - TODO: al momento in sviluppo, solo superAdmin */}
        <Route path="/settings" element={
          <AuthGate requiredPermissions={["superAdmin"]}>
            <div>Pagina Impostazioni (da implementare)</div>
          </AuthGate>
        } />

        {/* Redirect per tutte le route non valide */}
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppContent />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
