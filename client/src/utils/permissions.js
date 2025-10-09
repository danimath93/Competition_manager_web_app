// Utility per gestire i permessi degli utenti

// Definizione dei permessi per ogni ruolo
export const PERMISSIONS = {
  superAdmin: ['dashboard', 'competitions', 'athletes', 'clubs', 'judges', 'categories', 'settings'],
  admin: ['dashboard', 'competitions', 'athletes', 'clubs', 'judges', 'categories', 'settings'],
  user: ['dashboard', 'competitions', 'athletes', 'clubs'],
  table: ['dashboard', 'categories']
};

// Verifica se l'utente ha permesso per una pagina specifica
export const hasPermission = (userRole, page) => {
  if (!userRole || !page) return false;
  
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(page);
};

// Ottiene tutte le pagine accessibili per un ruolo
export const getAccessiblePages = (userRole) => {
  if (!userRole) return [];
  return PERMISSIONS[userRole] || [];
};

// Ottiene il primo percorso valido per l'utente (per redirect)
export const getDefaultRoute = (userRole) => {
  const accessiblePages = getAccessiblePages(userRole);
  return accessiblePages.length > 0 ? `/${accessiblePages[0]}` : '/dashboard';
};
