const { IscrizioneAtleta, Atleta, Categoria, Club, Competizione, ConfigTipoCategoria, ConfigTipoCompetizione } = require('../models');

// Ottieni tutte le iscrizioni di una competizione specifica
const getIscrizioniByCompetizione = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    
    const iscrizioni = await IscrizioneAtleta.findAll({
      include: [
        {
          model: Atleta,
          as: 'atleta',
          include: [
            {
              model: Club,
              as: 'club'
            }
          ]
        },
        {
          model: Categoria,
          as: 'categoria',
          where: { competizioneId }
        }
      ],
      order: [
        [{ model: Atleta, as: 'atleta' }, 'cognome', 'ASC'],
        [{ model: Atleta, as: 'atleta' }, 'nome', 'ASC']
      ]
    });

    res.status(200).json(iscrizioni);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero delle iscrizioni',
      details: error.message 
    });
  }
};

// Ottieni le iscrizioni di un club specifico per una competizione
const getIscrizioniByCompetitionAndClub = async (req, res) => {
  try {
    const { competizioneId, clubId } = req.params;

    // Prendiamo tutti gli atleti iscritti alla competizione scelta che appartengono al club scelto
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          where: { clubId }
        },
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          include: [
            {
              model: ConfigTipoCompetizione,
              as: 'tipoCompetizione'
            }
          ]
        }
      ]
    });

    res.status(200).json(iscrizioni);
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nel recupero delle iscrizioni del club',
      details: error.message 
    });
  }
};

// Crea una nuova iscrizione
const createIscrizione = async (req, res) => {
  try {
    const { atletaId, tipoCategoriaId, competizioneId } = req.body;
    
    // Verifica se l'iscrizione esiste già
    const existingIscrizione = await IscrizioneAtleta.findOne({
      where: { atletaId, tipoCategoriaId, competizioneId }
    });

    if (existingIscrizione) {
      return res.status(400).json({ 
        error: 'L\'atleta è già iscritto a questa categoria' 
      });
    }

    const newIscrizione = await IscrizioneAtleta.create(req.body);
    
    // Recupera l'iscrizione con tutti i dettagli
    const iscrizioneCompleta = await IscrizioneAtleta.findByPk(newIscrizione.id, {
      include: [
        {
          model: Atleta,
          as: 'atleta',
          include: [
            {
              model: Club,
              as: 'club'
            }
          ]
        },
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria'
        }
      ]
    });

    res.status(201).json(iscrizioneCompleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ 
      error: 'Errore nella creazione dell\'iscrizione',
      details: error.message 
    });
  }
};

// Elimina un'iscrizione
const deleteIscrizione = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await IscrizioneAtleta.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'Iscrizione non trovata' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione dell\'iscrizione',
      details: error.message 
    });
  }
};

// Elimina tutte le iscrizioni di un atleta
const deleteIscrizioniAtleta = async (req, res) => {
  try {
    const { atletaId, competizioneId } = req.params;
    
    const deletedRowsCount = await IscrizioneAtleta.destroy({
      where: { 
        atletaId,
        competizioneId
      }
    });
    
    res.status(200).json({ 
      message: `Eliminate ${deletedRowsCount} iscrizioni per l'atleta` 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Errore nell\'eliminazione delle iscrizioni dell\'atleta',
      details: error.message 
    });
  }
};

module.exports = {
  getIscrizioniByCompetizione,
  getIscrizioniByCompetitionAndClub,
  createIscrizione,
  deleteIscrizione,
  deleteIscrizioniAtleta
};