const { IscrizioneAtleta, IscrizioneClub, Atleta, Categoria, Club, Competizione, ConfigTipoCategoria, ConfigTipoCompetizione, ConfigTipoAtleta, ConfigEsperienza } = require('../models');
const { calculateAthleteCost, calculateClubTotalCost } = require('../helpers/costCalculator');
const logger = require('../helpers/logger/logger');

/**
 * Ricalcola e aggiorna i costi per tutti gli atleti di un club in una competizione
 * @param {Number} clubId - ID del club
 * @param {Number} competizioneId - ID della competizione
 */
const recalculateAthletesCosts = async (clubId, competizioneId) => {
  try {
    // Carica la competizione per ottenere costiIscrizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione || !competizione.costiIscrizione) {
      logger.debug('Nessuna configurazione costi per questa competizione');
      return;
    }

    // Carica tutte le iscrizioni del club per questa competizione
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          where: { clubId },
          include: [
            {
              model: ConfigTipoAtleta,
              as: 'tipoAtleta'
            }
          ]
        }
      ]
    });

    if (iscrizioni.length === 0) {
      return;
    }

    // Raggruppa le iscrizioni per atleta
    const athletesMap = new Map();
    let categories = [];
    iscrizioni.forEach(iscrizione => {
      const atletaId = iscrizione.atletaId;
      if (!athletesMap.has(atletaId)) {
        athletesMap.set(atletaId, {
          atletaId,
          tipoAtletaId: iscrizione.atleta?.tipoAtletaId,
          tesseramento: iscrizione.atleta?.tesseramento,
          iscrizioni: []
        });
      }
      athletesMap.get(atletaId).iscrizioni.push(iscrizione);
      categories.push(iscrizione.tipoCategoriaId);
    });

    // Calcola e aggiorna il costo per ogni atleta
    for (const [athleteId, athleteData] of athletesMap) {
      const cost = calculateAthleteCost(
        competizione.costiIscrizione,
        athleteData,
        categories
      );

      // Aggiorna tutte le iscrizioni dell'atleta con il costo calcolato
      await Promise.all(
        athleteData.iscrizioni.map(iscrizione =>
          iscrizione.update({ costoIscrizione: cost })
        )
      );
    }
  } catch (error) {
    logger.error(`Errore nel ricalcolo dei costi per club ${clubId}, competizione ${competizioneId}: ${error.message}`, { stack: error.stack });
  }
};

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
              as: 'club',
              attributes: { exclude: ['logo'] }
            },
            {
              model: ConfigTipoAtleta,
              as: 'tipoAtleta'
            }
          ]
        },
        {
          model: Categoria,
          as: 'categoria',
          where: { competizioneId }
        },
        {
          model: ConfigEsperienza,
          as: 'esperienza',
          required: false
        }
      ],
      order: [
        [{ model: Atleta, as: 'atleta' }, 'cognome', 'ASC'],
        [{ model: Atleta, as: 'atleta' }, 'nome', 'ASC']
      ]
    });

    res.status(200).json(iscrizioni);
  } catch (error) {
    logger.error(`Errore nel recupero delle iscrizioni per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
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
          where: { clubId },
          include: [
            {
              model: ConfigTipoAtleta,
              as: 'tipoAtleta'
            }
          ]
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
        },
        {
          model: ConfigEsperienza,
          as: 'esperienza',
          required: false
        }
      ]
    });

    res.status(200).json(iscrizioni);
  } catch (error) {
    logger.error(`Errore nel recupero delle iscrizioni del club ${req.params.clubId} per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel recupero delle iscrizioni del club',
      details: error.message
    });
  }
};

// Crea una nuova iscrizione
const createIscrizione = async (req, res) => {
  try {
    const { atletaId, tipoCategoriaId, competizioneId, idConfigEsperienza, peso } = req.body;

    // Verifica se l'iscrizione esiste già per questo atleta, categoria e competizione
    const existingIscrizione = await IscrizioneAtleta.findOne({
      where: { atletaId, tipoCategoriaId, competizioneId }
    });

    if (existingIscrizione) {
      logger.warn(`Tentativo iscrizione duplicata - Atleta: ${atletaId}, Categoria: ${tipoCategoriaId}, Competizione: ${competizioneId}`);
      return res.status(409).json({
        error: 'L\'atleta è già iscritto a questa categoria per questa competizione'
      });
    }

    // Crea la nuova iscrizione
    const iscrizioneData = {
      atletaId,
      tipoCategoriaId,
      competizioneId,
      stato: req.body.stato || 'In attesa',
      note: req.body.note || null
    };

    // Aggiungi campi opzionali se presenti
    if (idConfigEsperienza) {
      iscrizioneData.idConfigEsperienza = idConfigEsperienza;
    }
    
    if (peso) {
      iscrizioneData.peso = parseFloat(peso);
    }

    const newIscrizione = await IscrizioneAtleta.create(iscrizioneData);

    // Ricalcola i costi per tutti gli atleti del club
    const atleta = await Atleta.findByPk(atletaId);
    if (atleta && atleta.clubId) {
      await recalculateAthletesCosts(atleta.clubId, competizioneId);
    }

    // Recupera l'iscrizione con tutti i dettagli
    const iscrizioneCompleta = await IscrizioneAtleta.findByPk(newIscrizione.id, {
      include: [
        {
          model: Atleta,
          as: 'atleta',
          include: [
            {
              model: Club,
              as: 'club',
              attributes: { exclude: ['logo'] }
            },
            {
              model: ConfigTipoAtleta,
              as: 'tipoAtleta'
            }
          ]
        },
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria'
        }
      ]
    });

    logger.info(`Iscrizione creata - ID: ${newIscrizione.id}, Atleta: ${atletaId}, Competizione: ${competizioneId}`);
    res.status(201).json(iscrizioneCompleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      logger.warn(`Validazione fallita nella creazione iscrizione: ${error.errors.map(e => e.message).join(', ')}`);
      return res.status(400).json({
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }
    logger.error(`Errore nella creazione dell'iscrizione - Atleta: ${req.body.atletaId}: ${error.message}`, { stack: error.stack });
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
    
    // Recupera l'iscrizione prima di eliminarla per ricalcolare i costi
    const iscrizione = await IscrizioneAtleta.findByPk(id, {
      include: [
        {
          model: Atleta,
          as: 'atleta'
        }
      ]
    });

    if (!iscrizione) {
      logger.warn(`Tentativo eliminazione iscrizione inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Iscrizione non trovata' });
    }

    const atletaId = iscrizione.atletaId;
    const clubId = iscrizione.atleta?.clubId;
    const competizioneId = iscrizione.competizioneId;

    const deletedRowsCount = await IscrizioneAtleta.destroy({
      where: { id }
    });

    // Ricalcola i costi per tutti gli atleti del club
    if (clubId && competizioneId) {
      await recalculateAthletesCosts(clubId, competizioneId);
    }

    logger.info(`Iscrizione eliminata - ID: ${id}, Atleta: ${atletaId}, Competizione: ${competizioneId}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Errore nell'eliminazione dell'iscrizione ${req.params.id}: ${error.message}`, { stack: error.stack });
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

    // Recupera l'atleta per ottenere il clubId
    const atleta = await Atleta.findByPk(atletaId);
    const clubId = atleta?.clubId;

    const deletedRowsCount = await IscrizioneAtleta.destroy({
      where: {
        atletaId,
        competizioneId
      }
    });

    // Ricalcola i costi per tutti gli atleti del club
    if (clubId && competizioneId) {
      await recalculateAthletesCosts(clubId, competizioneId);
    }

    res.status(200).json({
      message: `Eliminate ${deletedRowsCount} iscrizioni per l'atleta`
    });
  } catch (error) {
    logger.error(`Errore nell'eliminazione delle iscrizioni dell'atleta ${req.params.atletaId} per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nell\'eliminazione delle iscrizioni dell\'atleta',
      details: error.message
    });
  }
};

// ============ ISCRIZIONI CLUB ============

// Crea o recupera l'iscrizione di un club a una competizione
const createOrGetIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.body;

    // Verifica se esiste già un'iscrizione
    let iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId },
      include: [
        {
          model: Club,
          as: 'club',
          attributes: { exclude: ['logo'] }
        },
        {
          model: Competizione,
          as: 'competizione'
        }
      ]
    });

    // Se non esiste, creala
    if (!iscrizioneClub) {
      iscrizioneClub = await IscrizioneClub.create({
        clubId,
        competizioneId,
        stato: 'In attesa'
      });

      // Recupera l'iscrizione con tutti i dettagli
      iscrizioneClub = await IscrizioneClub.findByPk(iscrizioneClub.id, {
        include: [
          {
            model: Club,
            as: 'club',
            attributes: { exclude: ['logo'] }
          },
          {
            model: Competizione,
            as: 'competizione'
          }
        ]
      });
    }

    res.status(200).json(iscrizioneClub);
  } catch (error) {
    logger.error(`Errore nella gestione dell'iscrizione del club ${req.body.clubId} per competizione ${req.body.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nella gestione dell\'iscrizione del club',
      details: error.message
    });
  }
};

// Ottieni l'iscrizione di un club a una competizione
const getIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.params;

    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId },
      include: [
        {
          model: Club,
          as: 'club',
          attributes: { exclude: ['logo'] }
        },
        {
          model: Competizione,
          as: 'competizione'
        }
      ]
    });

    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }

    res.status(200).json(iscrizioneClub);
  } catch (error) {
    logger.error(`Errore nel recupero dell'iscrizione del club ${req.params.clubId} per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel recupero dell\'iscrizione del club',
      details: error.message
    });
  }
};

// Upload dei documenti per l'iscrizione del club
const uploadDocumentiIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.body;
    const files = req.files;

    // Verifica che l'iscrizione esista
    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId }
    });

    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }

    // Verifica tutti i file presenti
    if (!files || !files.certificatiMedici || !files.autorizzazioni || !files.confermaPresidente) {
      return res.status(400).json({
        error: 'Entrambi i documenti (certificati medici e autorizzazioni) sono obbligatori'
      });
    }

    const certificatiMedici = files.certificatiMedici[0];
    const autorizzazioni = files.autorizzazioni[0];
    const confermaPresidente = files.confermaPresidente[0];

    // Verifica che siano PDF
    if (certificatiMedici.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'I certificati medici devono essere in formato PDF'
      });
    }

    if (autorizzazioni.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Le autorizzazioni devono essere in formato PDF'
      });
    }

    if (confermaPresidente.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Le conferme autorizzazioni presidenti devono essere in formato PDF'
      });
    }

    // Salva i file nel database
    iscrizioneClub.certificatiMedici = certificatiMedici.buffer;
    iscrizioneClub.certificatiMediciNome = certificatiMedici.originalname;
    iscrizioneClub.certificatiMediciTipo = certificatiMedici.mimetype;
    iscrizioneClub.autorizzazioni = autorizzazioni.buffer;
    iscrizioneClub.autorizzazioniNome = autorizzazioni.originalname;
    iscrizioneClub.autorizzazioniTipo = autorizzazioni.mimetype;
    iscrizioneClub.confermaPresidente = confermaPresidente.buffer;
    iscrizioneClub.confermaPresidenteNome = confermaPresidente.originalname;
    iscrizioneClub.confermaPresidenteTipo = confermaPresidente.mimetype;

    await iscrizioneClub.save();

    res.status(200).json({
      message: 'Documenti caricati con successo',
      iscrizioneClub: {
        id: iscrizioneClub.id,
        certificatiMediciNome: iscrizioneClub.certificatiMediciNome,
        autorizzazioniNome: iscrizioneClub.autorizzazioniNome,
        confermaPresidenteNome: iscrizioneClub.confermaPresidenteNome
      }
    });
  } catch (error) {
    logger.error(`Errore nel caricamento dei documenti per iscrizione club: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel caricamento dei documenti',
      details: error.message
    });
  }
};

// Conferma l'iscrizione del club (dopo l'upload dei documenti)
const confermaIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.body;

    // Verifica che l'iscrizione esista
    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId }
    });

    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }

    // Verifica che i documenti siano stati caricati
    if (!iscrizioneClub.certificatiMedici || !iscrizioneClub.autorizzazioni) {
      return res.status(400).json({
        error: 'È necessario caricare entrambi i documenti prima di confermare l\'iscrizione'
      });
    }

    // Aggiorna lo stato dell'iscrizione
    iscrizioneClub.stato = 'Confermata';
    iscrizioneClub.dataConferma = new Date();
    await iscrizioneClub.save();

    // Aggiorna lo stato di tutte le iscrizioni atleti del club per questa competizione
    await IscrizioneAtleta.update(
      { stato: 'Confermata' },
      {
        where: {
          competizioneId,
          atletaId: {
            [require('sequelize').Op.in]: require('sequelize').literal(
              `(SELECT id FROM atleti WHERE club_id = ${clubId})`
            )
          }
        }
      }
    );

    res.status(200).json({
      message: 'Iscrizione confermata con successo',
      iscrizioneClub
    });
  } catch (error) {
    logger.error(`Errore nella conferma dell'iscrizione club ${req.body.clubId} per competizione ${req.body.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nella conferma dell\'iscrizione',
      details: error.message
    });
  }
};

// Download di un documento dell'iscrizione club
const downloadDocumentoIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId, tipoDocumento } = req.params;

    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId }
    });

    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }

    let fileBuffer, fileName, fileType;

    if (tipoDocumento === 'certificatiMedici') {
      fileBuffer = iscrizioneClub.certificatiMedici;
      fileName = iscrizioneClub.certificatiMediciNome;
      fileType = iscrizioneClub.certificatiMediciTipo;
    } else if (tipoDocumento === 'autorizzazioni') {
      fileBuffer = iscrizioneClub.autorizzazioni;
      fileName = iscrizioneClub.autorizzazioniNome;
      fileType = iscrizioneClub.autorizzazioniTipo;
    } else {
      return res.status(400).json({ error: 'Tipo di documento non valido' });
    }

    if (!fileBuffer) {
      return res.status(404).json({ error: 'Documento non trovato' });
    }

    res.setHeader('Content-Type', fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileBuffer);
  } catch (error) {
    logger.error(`Errore nel download del documento ${req.params.tipoDocumento} per club ${req.params.clubId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel download del documento',
      details: error.message
    });
  }
};

// Modifica l'iscrizione del club, dopo la creazione iniziale
const modificaIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.body;
    // Verifica che l'iscrizione esista
    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId }
    });

    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }

    // Aggiorna lo stato dell'iscrizione
    iscrizioneClub.stato = "In attesa";
    await iscrizioneClub.save();

    res.status(200).json({
      message: 'Iscrizione modificata con successo',
      iscrizioneClub
    });
  } catch (error) {
    logger.error(`Errore nella modifica dell'iscrizione club ${req.body.clubId} per competizione ${req.body.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nella modifica dell\'iscrizione',
      details: error.message
    });
  }
};

// Ottieni il totale dei costi per un club in una competizione
const getClubRegistrationCosts = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.params;

    // Carica la competizione per ottenere costiIscrizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // Carica tutte le iscrizioni del club per questa competizione
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          where: { clubId },
          include: [
            {
              model: ConfigTipoAtleta,
              as: 'tipoAtleta'
            }
          ]
        },
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria'
        }
      ]
    });

    if (iscrizioni.length === 0) {
      return res.status(200).json({
        totalCost: 0,
        athletesCosts: [],
        costiIscrizione: competizione.costiIscrizione
      });
    }

    // Calcola i costi
    const costsData = calculateClubTotalCost(iscrizioni, competizione.costiIscrizione);

    res.status(200).json({
      ...costsData,
      costiIscrizione: competizione.costiIscrizione
    });
  } catch (error) {
    logger.error(`Errore nel calcolo dei costi per club ${req.params.clubId} in competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel calcolo dei costi',
      details: error.message
    });
  }
};

module.exports = {
  getIscrizioniByCompetizione,
  getIscrizioniByCompetitionAndClub,
  createIscrizione,
  deleteIscrizione,
  deleteIscrizioniAtleta,
  createOrGetIscrizioneClub,
  getIscrizioneClub,
  uploadDocumentiIscrizioneClub,
  confermaIscrizioneClub,
  downloadDocumentoIscrizioneClub,
  modificaIscrizioneClub,
  getClubRegistrationCosts
};