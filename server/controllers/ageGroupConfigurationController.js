const { Op } = require('sequelize');
const { AgeGroupConfiguration, UtentiLogin } = require('../models');
const { validateAgeGroupConfig } = require('../helpers/ageGroups');
const logger = require('../helpers/logger/logger');

const ADMIN_PERMISSIONS = ['admin', 'superAdmin'];

// Recupera l'utente loggato (il token contiene solo username e permessi)
const getCurrentUser = async (req) => {
  const user = await UtentiLogin.findOne({
    where: { username: req.user.username },
    attributes: ['id', 'username', 'permissions', 'clubId']
  });
  return user;
};

const isAdmin = (user) => ADMIN_PERMISSIONS.includes(user?.permissions);

// Club su cui opera la richiesta: l'admin può indicarlo esplicitamente, gli altri usano il proprio
const resolveTargetClubId = (user, requestedClubId) => {
  if (isAdmin(user) && requestedClubId !== undefined && requestedClubId !== null && requestedClubId !== '') {
    return parseInt(requestedClubId);
  }
  return user.clubId || null;
};

// Verifica che l'utente possa modificare la configurazione (le default sono in sola lettura)
const canEdit = (user, configuration) => {
  if (configuration.clubId === null) return false;
  return isAdmin(user) || configuration.clubId === user.clubId;
};

const canRead = (user, configuration) => {
  return configuration.clubId === null || isAdmin(user) || configuration.clubId === user.clubId;
};

const handleError = (res, error, message) => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Esiste già una configurazione con questo nome' });
  }
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Dati non validi', details: error.errors.map(e => e.message) });
  }
  res.status(500).json({ error: message, details: error.message });
};

// GET /api/age-group-configurations?clubId= - Configurazioni del club più quelle di default
const getAllConfigurations = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Admin senza filtro: tutte le configurazioni. Altrimenti default + club
    let where = {};
    if (!isAdmin(user) || req.query.clubId) {
      const clubId = resolveTargetClubId(user, req.query.clubId);
      where = clubId ? { [Op.or]: [{ clubId: null }, { clubId }] } : { clubId: null };
    }

    const configurations = await AgeGroupConfiguration.findAll({
      where,
      order: [['clubId', 'ASC NULLS FIRST'], ['name', 'ASC']]
    });
    res.json(configurations);
  } catch (error) {
    logger.error(`Errore nel recupero delle configurazioni fasce età: ${error.message}`, { stack: error.stack });
    handleError(res, error, 'Errore nel recupero delle configurazioni fasce età');
  }
};

// GET /api/age-group-configurations/:id
const getConfigurationById = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // paranoid: false per poter mostrare anche l'origine eliminata di una competizione
    const configuration = await AgeGroupConfiguration.findByPk(req.params.id, { paranoid: false });
    if (!configuration || !canRead(user, configuration)) {
      return res.status(404).json({ error: 'Configurazione non trovata' });
    }
    res.json(configuration);
  } catch (error) {
    logger.error(`Errore nel recupero della configurazione fasce età ${req.params.id}: ${error.message}`, { stack: error.stack });
    handleError(res, error, 'Errore nel recupero della configurazione fasce età');
  }
};

// POST /api/age-group-configurations - Crea una configurazione per il club
const createConfiguration = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const clubId = resolveTargetClubId(user, req.body.clubId);
    if (!clubId) {
      return res.status(403).json({ error: 'Nessun club associato: impossibile creare la configurazione' });
    }

    const { name, description, config } = req.body;
    const validation = validateAgeGroupConfig(config);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Configurazione non valida', details: validation.errors });
    }

    const configuration = await AgeGroupConfiguration.create({
      clubId,
      name: name?.trim(),
      description: description || null,
      config: validation.config
    });
    res.status(201).json(configuration);
  } catch (error) {
    logger.error(`Errore nella creazione della configurazione fasce età: ${error.message}`, { stack: error.stack });
    handleError(res, error, 'Errore nella creazione della configurazione fasce età');
  }
};

// POST /api/age-group-configurations/:id/copy - Copia una configurazione (es. default) nel club
const copyConfiguration = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const source = await AgeGroupConfiguration.findByPk(req.params.id);
    if (!source || !canRead(user, source)) {
      return res.status(404).json({ error: 'Configurazione non trovata' });
    }

    const clubId = resolveTargetClubId(user, req.body.clubId);
    if (!clubId) {
      return res.status(403).json({ error: 'Nessun club associato: impossibile copiare la configurazione' });
    }

    const configuration = await AgeGroupConfiguration.create({
      clubId,
      name: (req.body.name || `${source.name} (copia)`).trim(),
      description: req.body.description !== undefined ? req.body.description : source.description,
      config: source.config
    });
    res.status(201).json(configuration);
  } catch (error) {
    logger.error(`Errore nella copia della configurazione fasce età ${req.params.id}: ${error.message}`, { stack: error.stack });
    handleError(res, error, 'Errore nella copia della configurazione fasce età');
  }
};

// PUT /api/age-group-configurations/:id
const updateConfiguration = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const configuration = await AgeGroupConfiguration.findByPk(req.params.id);
    if (!configuration || !canRead(user, configuration)) {
      return res.status(404).json({ error: 'Configurazione non trovata' });
    }
    if (!canEdit(user, configuration)) {
      return res.status(403).json({ error: 'Le configurazioni di default non sono modificabili' });
    }

    const { name, description, config } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name?.trim();
    if (description !== undefined) updates.description = description || null;
    if (config !== undefined) {
      const validation = validateAgeGroupConfig(config);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Configurazione non valida', details: validation.errors });
      }
      updates.config = validation.config;
    }

    await configuration.update(updates);
    res.json(configuration);
  } catch (error) {
    logger.error(`Errore nell'aggiornamento della configurazione fasce età ${req.params.id}: ${error.message}`, { stack: error.stack });
    handleError(res, error, 'Errore nell\'aggiornamento della configurazione fasce età');
  }
};

// DELETE /api/age-group-configurations/:id - Soft delete (le competizioni mantengono la propria copia)
const deleteConfiguration = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const configuration = await AgeGroupConfiguration.findByPk(req.params.id);
    if (!configuration || !canRead(user, configuration)) {
      return res.status(404).json({ error: 'Configurazione non trovata' });
    }
    if (!canEdit(user, configuration)) {
      return res.status(403).json({ error: 'Le configurazioni di default non sono eliminabili' });
    }

    await configuration.destroy();
    res.json({ message: 'Configurazione eliminata con successo' });
  } catch (error) {
    logger.error(`Errore nell'eliminazione della configurazione fasce età ${req.params.id}: ${error.message}`, { stack: error.stack });
    handleError(res, error, 'Errore nell\'eliminazione della configurazione fasce età');
  }
};

module.exports = {
  getAllConfigurations,
  getConfigurationById,
  createConfiguration,
  copyConfiguration,
  updateConfiguration,
  deleteConfiguration
};
