/**
 * Gestione configurazioni fasce d'età.
 *
 * Struttura JSON della configurazione (version 1):
 * {
 *   version: 1,
 *   mode: 'age' | 'seasonAge',
 *   seasonStart: 'MM-DD',          // obbligatorio solo con mode = 'seasonAge' (es. '01-01', '09-01')
 *   groups: [
 *     { key: 'pulcini', label: 'Pulcini', order: 1, minAge: 4, maxAge: 6 }   // maxAge null = senza limite
 *   ]
 * }
 *
 * Modalità:
 * - age:       età esatta alla data di riferimento (inizio gara)
 * - seasonAge: età sportiva, cioè l'età compiuta entro la fine della stagione che contiene la data di riferimento.
 *              La stagione inizia il giorno seasonStart e termina il giorno prima dell'anno successivo.
 *              Con seasonStart '01-01' equivale a (anno riferimento - anno di nascita).
 *
 * NB: questo file è duplicato lato client in client/src/utils/ageGroups.js, mantenere allineati.
 */

const CONFIG_VERSION = 1;
const AGE_GROUP_MODES = ['age', 'seasonAge'];
const TIMEZONE = 'Europe/Rome';

const CONFIG_KEYS = ['version', 'mode', 'seasonStart', 'groups'];
const GROUP_KEYS = ['key', 'label', 'order', 'minAge', 'maxAge'];
const KEY_REGEX = /^[a-z0-9_-]+$/;
const SEASON_START_REGEX = /^(\d{2})-(\d{2})$/;
const MIN_AGE = 0;
const MAX_AGE = 120;

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

// ---------------------------------------------------------------------------
// Utility date (lavorano su { y, m, d } per evitare problemi di fuso orario)
// ---------------------------------------------------------------------------

/**
 * Converte una data (stringa 'YYYY-MM-DD', stringa ISO o Date) in { y, m, d } nel fuso Europe/Rome
 */
const toYmd = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return { y, m, d };
  }
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;
  const [y, m, d] = ymdFormatter.format(date).split('-').map(Number);
  return { y, m, d };
};

const ymdToString = ({ y, m, d }) =>
  `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const daysInMonth = (y, m) => [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

const compareYmd = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);

// Sottrae anni mantenendo mese/giorno (29/02 -> 28/02 negli anni non bisestili)
const subtractYears = ({ y, m, d }, years) => {
  const newY = y - years;
  return { y: newY, m, d: Math.min(d, daysInMonth(newY, m)) };
};

const addOneDay = ({ y, m, d }) => {
  if (d < daysInMonth(y, m)) return { y, m, d: d + 1 };
  if (m < 12) return { y, m: m + 1, d: 1 };
  return { y: y + 1, m: 1, d: 1 };
};

const subtractOneDay = ({ y, m, d }) => {
  if (d > 1) return { y, m, d: d - 1 };
  if (m > 1) return { y, m: m - 1, d: daysInMonth(y, m - 1) };
  return { y: y - 1, m: 12, d: 31 };
};

const parseSeasonStart = (seasonStart) => {
  const match = SEASON_START_REGEX.exec(seasonStart || '');
  if (!match) return null;
  const m = Number(match[1]);
  const d = Number(match[2]);
  // 29/02 non ammesso: la stagione non esisterebbe ogni anno
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(2001, m)) return null;
  return { m, d };
};

// ---------------------------------------------------------------------------
// Calcolo età e stagione
// ---------------------------------------------------------------------------

/**
 * Età esatta (anni compiuti) alla data di riferimento
 */
const computeAge = (birthDate, referenceDate) => {
  const birth = toYmd(birthDate);
  const ref = toYmd(referenceDate);
  if (!birth || !ref) return null;
  let age = ref.y - birth.y;
  if (ref.m < birth.m || (ref.m === birth.m && ref.d < birth.d)) {
    age--;
  }
  return age;
};

/**
 * Restituisce inizio e fine della stagione che contiene la data di riferimento
 * @returns {{ start: string, end: string }} date in formato 'YYYY-MM-DD'
 */
const getSeasonBounds = (seasonStart, referenceDate) => {
  const start = parseSeasonStart(seasonStart);
  const ref = toYmd(referenceDate);
  if (!start || !ref) return null;
  const startYear = compareYmd(ref, { y: ref.y, m: start.m, d: start.d }) >= 0 ? ref.y : ref.y - 1;
  const seasonStartYmd = { y: startYear, m: start.m, d: start.d };
  const seasonEndYmd = subtractOneDay({ y: startYear + 1, m: start.m, d: start.d });
  return { start: ymdToString(seasonStartYmd), end: ymdToString(seasonEndYmd) };
};

/**
 * Data su cui calcolare l'età esatta in base alla modalità della configurazione
 */
const getAgeCalculationDate = (config, referenceDate) => {
  if (config.mode === 'seasonAge') {
    const bounds = getSeasonBounds(config.seasonStart, referenceDate);
    return bounds ? bounds.end : null;
  }
  const ref = toYmd(referenceDate);
  return ref ? ymdToString(ref) : null;
};

/**
 * Età dell'atleta secondo la modalità della configurazione
 */
const computeConfigAge = (birthDate, config, referenceDate) => {
  const calculationDate = getAgeCalculationDate(config, referenceDate);
  if (!calculationDate) return null;
  return computeAge(birthDate, calculationDate);
};

/**
 * Trova la fascia d'età dell'atleta
 * @param {string|Date} birthDate - data di nascita
 * @param {Object} config - configurazione fasce (JSON validato)
 * @param {string|Date} referenceDate - data di riferimento (inizio gara, oppure data scelta per la ricerca)
 * @returns {Object|null} gruppo trovato oppure null
 */
const resolveAgeGroup = (birthDate, config, referenceDate) => {
  if (!config || !Array.isArray(config.groups)) return null;
  const age = computeConfigAge(birthDate, config, referenceDate);
  if (age === null) return null;
  return config.groups.find(group =>
    age >= group.minAge && (group.maxAge === null || group.maxAge === undefined || age <= group.maxAge)
  ) || null;
};

/**
 * Intervallo delle date di nascita incluse nel gruppo per la data di riferimento
 * @returns {{ from: string|null, to: string }} date 'YYYY-MM-DD', from = null se il gruppo non ha età massima
 */
const getBirthDateRange = (group, config, referenceDate) => {
  const calculationDate = toYmd(getAgeCalculationDate(config, referenceDate));
  if (!calculationDate || !group) return null;
  // Età >= minAge  <=>  nascita <= calculationDate - minAge anni
  const to = subtractYears(calculationDate, group.minAge);
  // Età <= maxAge  <=>  nascita > calculationDate - (maxAge + 1) anni
  const hasMax = group.maxAge !== null && group.maxAge !== undefined;
  const from = hasMax ? addOneDay(subtractYears(calculationDate, group.maxAge + 1)) : null;
  return { from: from ? ymdToString(from) : null, to: ymdToString(to) };
};

// ---------------------------------------------------------------------------
// Validazione
// ---------------------------------------------------------------------------

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Valida e normalizza una configurazione fasce d'età
 * @returns {{ valid: boolean, errors: string[], config: Object|null }} config normalizzata (gruppi ordinati per order)
 */
const validateAgeGroupConfig = (config) => {
  const errors = [];

  if (!isPlainObject(config)) {
    return { valid: false, errors: ['La configurazione deve essere un oggetto'], config: null };
  }

  const unknownKeys = Object.keys(config).filter(k => !CONFIG_KEYS.includes(k));
  if (unknownKeys.length > 0) {
    errors.push(`Proprietà non ammesse nella configurazione: ${unknownKeys.join(', ')}`);
  }

  if (config.version !== CONFIG_VERSION) {
    errors.push(`Versione configurazione non supportata (attesa ${CONFIG_VERSION})`);
  }

  if (!AGE_GROUP_MODES.includes(config.mode)) {
    errors.push(`Modalità non valida: valori ammessi ${AGE_GROUP_MODES.join(', ')}`);
  }

  if (config.mode === 'seasonAge') {
    if (!parseSeasonStart(config.seasonStart)) {
      errors.push('Inizio stagione non valido: formato atteso MM-DD (es. 01-01, 09-01)');
    }
  } else if (config.seasonStart !== undefined && config.seasonStart !== null) {
    errors.push('Inizio stagione ammesso solo con modalità seasonAge');
  }

  if (!Array.isArray(config.groups) || config.groups.length === 0) {
    errors.push('La configurazione deve contenere almeno una fascia');
    return { valid: false, errors, config: null };
  }

  const keys = new Set();
  const labels = new Set();
  config.groups.forEach((group, index) => {
    const position = `Fascia ${index + 1}`;
    if (!isPlainObject(group)) {
      errors.push(`${position}: deve essere un oggetto`);
      return;
    }

    const unknownGroupKeys = Object.keys(group).filter(k => !GROUP_KEYS.includes(k));
    if (unknownGroupKeys.length > 0) {
      errors.push(`${position}: proprietà non ammesse ${unknownGroupKeys.join(', ')}`);
    }

    if (typeof group.key !== 'string' || !KEY_REGEX.test(group.key)) {
      errors.push(`${position}: chiave non valida (solo lettere minuscole, numeri, '-' e '_')`);
    } else if (keys.has(group.key)) {
      errors.push(`${position}: chiave '${group.key}' duplicata`);
    } else {
      keys.add(group.key);
    }

    if (typeof group.label !== 'string' || group.label.trim() === '') {
      errors.push(`${position}: etichetta obbligatoria`);
    } else if (labels.has(group.label.trim().toLowerCase())) {
      errors.push(`${position}: etichetta '${group.label}' duplicata`);
    } else {
      labels.add(group.label.trim().toLowerCase());
    }

    if (!Number.isInteger(group.order)) {
      errors.push(`${position}: ordine deve essere un numero intero`);
    }

    if (!Number.isInteger(group.minAge) || group.minAge < MIN_AGE || group.minAge > MAX_AGE) {
      errors.push(`${position}: età minima deve essere un intero tra ${MIN_AGE} e ${MAX_AGE}`);
    }

    const hasMax = group.maxAge !== null && group.maxAge !== undefined;
    if (hasMax) {
      if (!Number.isInteger(group.maxAge) || group.maxAge < MIN_AGE || group.maxAge > MAX_AGE) {
        errors.push(`${position}: età massima deve essere un intero tra ${MIN_AGE} e ${MAX_AGE}`);
      } else if (Number.isInteger(group.minAge) && group.maxAge < group.minAge) {
        errors.push(`${position}: età massima deve essere maggiore o uguale all'età minima`);
      }
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors, config: null };
  }

  // Verifica sovrapposizioni: ordinando per età minima ogni fascia deve finire prima dell'inizio della successiva
  const byAge = [...config.groups].sort((a, b) => a.minAge - b.minAge);
  for (let i = 0; i < byAge.length - 1; i++) {
    const current = byAge[i];
    const next = byAge[i + 1];
    if (current.maxAge === null || current.maxAge === undefined || current.maxAge >= next.minAge) {
      errors.push(`Le fasce '${current.label}' e '${next.label}' si sovrappongono`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, config: null };
  }

  const normalized = {
    version: CONFIG_VERSION,
    mode: config.mode,
    ...(config.mode === 'seasonAge' ? { seasonStart: config.seasonStart } : {}),
    groups: [...config.groups]
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        key: group.key,
        label: group.label.trim(),
        order: group.order,
        minAge: group.minAge,
        maxAge: group.maxAge === undefined ? null : group.maxAge
      }))
  };

  return { valid: true, errors: [], config: normalized };
};

module.exports = {
  CONFIG_VERSION,
  AGE_GROUP_MODES,
  toYmd,
  computeAge,
  getSeasonBounds,
  getAgeCalculationDate,
  computeConfigAge,
  resolveAgeGroup,
  getBirthDateRange,
  validateAgeGroupConfig
};
