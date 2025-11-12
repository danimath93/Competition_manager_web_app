// Utility per gestire i permessi degli utenti

// Definizione dei permessi per ogni ruolo
export const PERMISSIONS = {
  superAdmin: ['dashboard', 'competitions', 'athletes', 'clubs/admin', 'judges', 'categories', 'settings'],
  admin: ['competitions', 'athletes', 'clubs/admin', 'judges', 'categories'],
  club: ['competitions', 'athletes', 'club'],
  user: ['competitions'],
  table: ['categories']
};

// Verifica se l'utente ha permesso per una pagina specifica
export const hasPermission = (userRole, page) => {
  if (!userRole || !page) return false;
  
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(page);
};
