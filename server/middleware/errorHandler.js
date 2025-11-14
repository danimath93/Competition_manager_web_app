const logger = require('../helpers/logger/logger');

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Errore interno del server';

  // Log dell'errore
  if (err.statusCode >= 500) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);
  } else {
    logger.warn(`${err.statusCode} - ${err.message} - ${req.originalUrl}`);
  }

  // Risposta al client
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { errorHandler, AppError };