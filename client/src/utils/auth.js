// Utility functions for authentication management

export const clearAuthData = () => {
  // Funzione helper per pulire solo i dati senza redirect
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
