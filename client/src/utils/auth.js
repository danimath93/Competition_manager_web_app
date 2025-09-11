// Utility functions for authentication management

export const suspendSession = () => {
  // Rimuovi token e dati utente dalla sessione e localStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect alla pagina principale/login
  window.location.href = '/';
};

export const clearAuthData = () => {
  // Funzione helper per pulire solo i dati senza redirect
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
