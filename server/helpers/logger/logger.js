const winston = require('winston');
const Transport = require('winston-transport');

const SERVICE_NAME = 'competition-manager-back';

// Custom transport per VS Code Debug Console
class DebugConsoleTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Usa console.log/error/warn nativi per compatibilità con VS Code Debug Console
    const message = info[Symbol.for('message')] || info.message;
    
    switch (info.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'debug':
      case 'verbose':
        console.debug(message);
        break;
      default:
        console.log(message);
    }

    callback();
  }
}

// Definizione dei colori ANSI
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const SPLAT = Symbol.for('splat');
const LEVEL = Symbol.for('level');

function normalizeMeta(meta) {
  // Se winston ha ricevuto parametri extra (logger.error(msg, err))
  if (meta[SPLAT] && meta[SPLAT].length > 0) {
    return meta[SPLAT].map(normalizeValue);
  }

  // Caso raro: meta passato come oggetto
  return normalizeValue(meta);
}

function normalizeValue(value) {
  // Axios error
  if (value?.isAxiosError) {
    return {
      type: 'AxiosError',
      message: value.message,
      code: value.code,
      status: value.response?.status,
      url: value.config?.url,
      method: value.config?.method,
      data: value.response?.data
    };
  }

  // Error standard
  if (value instanceof Error) {
    return {
      type: value.name,
      message: value.message,
      stack: value.stack
    };
  }

  return value;
}

function safeSerialize(meta) {
  const cleaned = normalizeMeta(meta);

  const seen = new WeakSet();

  return JSON.stringify(cleaned, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }

    // taglia roba tossica di Node
    if (
      key === 'socket' ||
      key === '_httpMessage' ||
      key === 'req' ||
      key === 'res'
    ) {
      return '[Skipped]';
    }

    return value;
  }, 2);
} 

// Formato personalizzato per i log
const customFormat = winston.format.printf((info) => {
  const { timestamp, level, message, service, ...meta } = info;
  
  let childService = null;
  // Rimuovi level da meta per evitare duplicati
  if (meta[LEVEL])
    delete meta[LEVEL];
  // Controlla se c'è un service nei meta e rimuove per non duplicare
  if (meta[SPLAT] && meta[SPLAT].length > 0) {
    let serviceIndex = -1;
    meta[SPLAT].forEach((item, index) => {
      if (item && typeof item === 'object' && item.service) {
        childService = item.service;
        serviceIndex = index;
      }
    });

    if (serviceIndex !== -1) {
      meta[SPLAT].splice(serviceIndex, 1);
    }
  }

  // Usa il service name fornito, con fallback a SERVICE_NAME
  const serviceName = childService || service || SERVICE_NAME;
  
  // Colore basato sul livello
  let levelColor;
  switch (level) {
    case 'error':
      levelColor = colors.red;
      break;
    case 'warn':
      levelColor = colors.yellow;
      break;
    case 'info':
      levelColor = colors.cyan;
      break;
    case 'debug':
      levelColor = colors.white;
      break;
    case 'verbose':
      levelColor = colors.blue;
      break;
    default:
      levelColor = colors.reset;
  }
  
  // Costruisci il messaggio con colori
  const levelStr = level.toUpperCase().padEnd(5);
  let log = `${colors.gray}${timestamp}${colors.reset} [${serviceName}] ${levelColor}${levelStr}${colors.reset} - ${message}`;
  
  // Aggiungi metadata se presenti (escludendo service)
  const metaStr = safeSerialize(meta);
  if (metaStr && metaStr !== '{}' && metaStr !== '[]') {
    log += `\n${metaStr}`;
  }

  return log;
});

// Creazione del logger principale
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  defaultMeta: { service: SERVICE_NAME },
  transports: [
    // Console con supporto per VS Code Debug Console
    new DebugConsoleTransport()
    
    // Puoi aggiungere in futuro:
    // - File transport per salvare i log su file
    // - Daily rotate file per rotazione automatica
    // - Remote transport per inviare log a servizi esterni
  ],
});

// Funzione helper per creare logger con un service name specifico
logger.createModuleLogger = (serviceName) => {
  const wrap = (level) => (message, ...meta) => {
    // Inietta service SENZA distruggere splat
    logger.log(level, message, ...meta, { service: serviceName });
  };

  return {
    error: wrap('error'),
    warn: wrap('warn'),
    info: wrap('info'),
    debug: wrap('debug'),
    verbose: wrap('verbose'),
  };
};


module.exports = logger;
