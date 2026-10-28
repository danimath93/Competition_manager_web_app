import {
  loadCategoryTypeById,
  loadExperienceById,
  loadNomiQuyenByCategoryType
} from '../api/config';

/**
 * Servizio di cache per i dati di configurazione (tipi categoria, esperienze, nomi quyen).
 * I dati vengono salvati in localStorage con una scadenza; le richieste concorrenti
 * per la stessa chiave condividono la stessa promise per evitare chiamate duplicate.
 */

const CACHE_PREFIX = 'configCache:v1:';
const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12 ore

// Richieste in corso, condivise tra componenti
const pendingRequests = new Map();

const readEntry = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;

    const entry = JSON.parse(raw);
    if (!entry || entry.expiresAt < Date.now()) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    return entry.data;
  } catch (error) {
    return undefined;
  }
};

const writeEntry = (key, data, ttlMs) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, expiresAt: Date.now() + ttlMs })
    );
  } catch (error) {
    // localStorage pieno o non disponibile: la cache resta solo in memoria per la richiesta corrente
    console.warn(`Impossibile salvare in cache la chiave ${key}:`, error);
  }
};

// Restituisce il dato in cache oppure lo carica tramite il loader e lo salva
const getCached = (key, loader, ttlMs = DEFAULT_TTL_MS) => {
  const cached = readEntry(key);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = loader()
    .then((data) => {
      writeEntry(key, data, ttlMs);
      return data;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
};

export const getCategoryType = (id) =>
  getCached(`tipoCategoria:${id}`, () => loadCategoryTypeById(id));

export const getExperience = (id) =>
  getCached(`esperienza:${id}`, () => loadExperienceById(id));

// Salva solo i campi utili per ridurre lo spazio occupato in localStorage
export const getNomiQuyenByCategoryType = (tipoCategoriaId) =>
  getCached(`nomiQuyen:${tipoCategoriaId}`, async () => {
    const nomiQuyen = await loadNomiQuyenByCategoryType(tipoCategoriaId);
    return (nomiQuyen || []).map(({ id, nome, descrizione, esperienzeId }) => ({
      id,
      nome,
      descrizione,
      esperienzeId
    }));
  });

// Carica in parallelo più elementi, ignorando quelli in errore. Restituisce una mappa id -> dato
export const getManyById = async (ids, getter) => {
  const uniqueIds = [...new Set(ids.filter((id) => id != null))];
  const results = await Promise.allSettled(uniqueIds.map((id) => getter(id)));

  return uniqueIds.reduce((map, id, index) => {
    const result = results[index];
    if (result.status === 'fulfilled') {
      map[id] = result.value;
    } else {
      console.error(`Errore nel caricamento della configurazione ${id}:`, result.reason);
    }
    return map;
  }, {});
};

// Svuota la cache di configurazione (es. al login o dopo modifiche alla configurazione)
export const clearConfigCache = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Impossibile svuotare la cache di configurazione:', error);
  }
  pendingRequests.clear();
};
