import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
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
import Competitions from './pages/competitions/Competitions';
import ClubCategories from './pages/competitions/ClubCategories';
import CompetitionRegistration from './pages/competitions/CompetitionRegistration';
import CompetitionSummary from './pages/competitions/CompetitionSummary';
import Athletes from './pages/athletes/Athletes';
import ClubAdmin from './pages/clubs/ClubAdmin';
import ClubUser from './pages/clubs/ClubUser';
import Judges from './pages/judges/Judges';
import Categories from './pages/categories/Categories';
import CategoryDefinition from './pages/categories/CategoryDefinition';
import CategoryExecution from './pages/categories/CategoryExecution';
import CategoryResults from './pages/categories/CategoryResults';
import CategoryInProgress from './pages/categories/CategoryInProgress';
import CompetitionConfigurator from './pages/CompetitionConfigurator';
import './App.css';
import muiCustomTheme from './styles/muiTheme';


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
    const isAuthenticated = user && typeof user === "object" && user.permissions && !loading;
    if (!isAuthenticated) return '/login';

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
      {/* <Route path="/trattamento-dati-personali" element={<TrattamentoDatiPersonali />} /> */}

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

        {/* Configuratore Competizione - superAdmin, admin */}
        <Route path="/competitions/new" element={
          <AuthGate requiredPermissions={["superAdmin", "admin"]}>
            <CompetitionConfigurator />
          </AuthGate>
        } />

        <Route path="/competitions/edit/:id" element={
          <AuthGate requiredPermissions={["superAdmin", "admin"]}>
            <CompetitionConfigurator />
          </AuthGate>
        } />

        {/* Registrazione Competizione - superAdmin, admin, club */}
        <Route path="/competitions/:competitionId/register" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CompetitionRegistration />
          </AuthGate>
        } />

        {/* Riepilogo Competizione - superAdmin, admin, club */}
        <Route path="/competitions/:competitionId/summary" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CompetitionSummary />
          </AuthGate>
        } />

        {/* Categorie Competizione - superAdmin, admin, club */}
        <Route path="/competitions/:competitionId/categories" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <ClubCategories />
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
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <Categories />
          </AuthGate>
        } />

        {/* Definizione Categorie - superAdmin, admin, club organizzatore */}
        <Route path="/categories/definition" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CategoryDefinition />
          </AuthGate>
        } />

        {/* Svolgimento Categorie - superAdmin, admin, club organizzatore */}
        <Route path="/categories/execution" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CategoryExecution />
          </AuthGate>
        } />

        <Route path="/category-execution/:id/category-in-progress" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CategoryInProgress />
          </AuthGate>
        } />

        {/* Risultati Categorie - superAdmin, admin, club organizzatore */}
        <Route path="/categories/results" element={
          <AuthGate requiredPermissions={["superAdmin", "admin", "club"]}>
            <CategoryResults />
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
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <ThemeProvider theme={muiCustomTheme}>
              <div className="App">
                <AppContent />
              </div>
            </ThemeProvider>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
