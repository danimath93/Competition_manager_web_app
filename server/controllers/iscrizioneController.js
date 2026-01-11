const { IscrizioneAtleta, IscrizioneClub, Atleta, Categoria, Club, Competizione, ConfigTipoCategoria, ConfigTipoCompetizione, ConfigTipoAtleta, ConfigEsperienza, Documento, DettaglioIscrizioneAtleta } = require('../models');
const { calculateAthleteCost, calculateClubTotalCost } = require('../helpers/costCalculator');
const logger = require('../helpers/logger/logger');

// Ottieni tutte le iscrizioni di una competizione specifica
const getIscrizioniByCompetizione = async (req, res) => {
  try {
    const { competizioneId } = req.params;

    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { competizioneId },
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
          as: 'tipoCategoria',
          attributes: { include: ['id', 'nome', 'descrizione', 'tipoCompetizioneId'] },
          include: [
            {
              model: ConfigTipoCompetizione,
              as: 'tipoCompetizione',
              attributes: { include: ['id', 'nome', 'descrizione'] }
            }
          ]
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
    let iscrizioniEspanse = [];
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

    iscrizioniEspanse = iscrizioni.map(iscrizione => iscrizione.dataValues);

    const dettagliIscrizioni = await DettaglioIscrizioneAtleta.findAll({
      where: {
        atletaId: iscrizioniEspanse.map(i => i.atletaId),
        competizioneId
      }
    });

    iscrizioniEspanse = iscrizioniEspanse.map(iscrizione => {
      const dettagli = dettagliIscrizioni.find(d => d.atletaId === iscrizione.atletaId);
      return {
        ...iscrizione,
        dettagliIscrizione: dettagli || null
      };
    });

    res.status(200).json(iscrizioniEspanse);
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
    const { atletaId, tesseramento, tipoCategoriaId, competizioneId, dettagliCategoria } = req.body;

    if (!atletaId || !tesseramento || !tipoCategoriaId || !competizioneId) {
      logger.warn('Dati mancanti nella richiesta di creazione iscrizione');
      return res.status(400).json({
        error: 'atletaId, tesseramento, tipoCategoriaId e competizioneId sono obbligatori'
      });
    }

    // Usa findOrCreate per evitare race condition quando si creano più iscrizioni simultaneamente
    const [dettagliIscrizione, created] = await DettaglioIscrizioneAtleta.findOrCreate({
      where: {
        atletaId,
        competizioneId
      },
      defaults: {
        tesseramento: tesseramento.nome,
        quota: 0
      }
    });

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
      dettagli: dettagliCategoria,
      idConfigEsperienza: req.body.idConfigEsperienza || null,
      peso: req.body.peso? parseFloat(req.body.peso) : null
    };

    const newIscrizione = await IscrizioneAtleta.create(iscrizioneData);

    // Ricalcola i costi per tutti gli atleti del club
    const athleteCost = await calculateSingleAthleteCosts(atletaId, competizioneId);
    await dettagliIscrizione.update({
      tesseramento: tesseramento.nome,
      quota: athleteCost
    });

    logger.info(`Iscrizione creata - ID: ${newIscrizione.id}, Atleta: ${atletaId}, Competizione: ${competizioneId}`);
    res.status(201).json(newIscrizione);
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

    await DettaglioIscrizioneAtleta.destroy({
      where: {
        atletaId,
        competizioneId
      }
    });
    
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

// Modifica le iscrizioni di un atleta
const editIscrizioniAtleta = async (req, res) => { 
  try {
    const { athleteId, competitionId, editData } = req.body;
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { atletaId: athleteId, competizioneId: competitionId }
    });
    // for (const iscrizione of iscrizioni) {
    //   if (editData.stato) {
    //     iscrizione.stato = editData.stato;
    //   }
    //   if (editData.peso !== undefined) {
    //     iscrizione.peso = editData.peso ? parseFloat(editData.peso) : null;
    //   }
    //   await iscrizione.save();
    // }
    // Ricalcola i costi per l'atleta
    const athleteCost = await calculateSingleAthleteCosts(athleteId, competitionId);
    const dettagliIscrizione = await DettaglioIscrizioneAtleta.findOne({
      where: { atletaId: athleteId, competizioneId: competitionId }
    });
    if (dettagliIscrizione) {
      await dettagliIscrizione.update({
        quota: athleteCost
      });
    }
    res.status(200).json({ message: 'Iscrizioni modificate con successo' });
  } catch (error) {
    logger.error(`Errore nella modifica delle iscrizioni dell'atleta ${req.body.athleteId} per competizione ${req.body.competitionId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nella modifica delle iscrizioni dell\'atleta',
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
        },
        {
          model: Documento,
          as: 'confermaPresidenteDocumento',
          attributes: { exclude: ['file'] }
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
        }, 
        {
          model: Documento,
          as: 'confermaPresidenteDocumento',
          attributes: { exclude: ['file'] }
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

// Ottieni tutte le iscrizioni dei club per una competizione
const getClubRegistrationsByCompetition = async (req, res) => {
  try {
    const { competizioneId } = req.params;

    const clubRegistrations = await IscrizioneClub.findAll({
      where: { competizioneId },
      attributes: { exclude: ['confermaPresidenteId'] },
      include: [
        {
          model: Club,
          as: 'club',
          attributes: { exclude: ['logo'] }
        }
      ],
      order: [
        [{ model: Club, as: 'club' }, 'denominazione', 'ASC']
      ]
    });

    res.status(200).json(clubRegistrations);
  } catch (error) {
    logger.error(`Errore nel recupero delle iscrizioni dei club per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel recupero delle iscrizioni dei club',
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

    // Verifica che il file confermaPresidente sia presente
    if (!files || !files.confermaPresidente) {
      return res.status(400).json({
        error: 'Il documento di conferma del presidente è obbligatorio'
      });
    }

    const confermaPresidente = files.confermaPresidente[0];

    // Verifica che sia PDF
    if (confermaPresidente.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'La conferma del presidente deve essere in formato PDF'
      });
    }

    // Se esiste già un documento, elimino il riferimento dall'iscrizione e lo cancello
    const oldDocId = iscrizioneClub.confermaPresidenteId;
    if (iscrizioneClub.confermaPresidenteId) {
      iscrizioneClub.confermaPresidenteId = null;
      await iscrizioneClub.save();
      const vecchioDocumento = await Documento.findByPk(oldDocId);
      if (vecchioDocumento) {
        await vecchioDocumento.destroy();
      }
    }

    // Crea il nuovo documento
    const documento = await Documento.create({
      nomeFile: confermaPresidente.originalname,
      file: confermaPresidente.buffer,
      mimeType: confermaPresidente.mimetype,
      dimensione: confermaPresidente.size,
      tipoDocumento: 'conferma_presidente'
    });

    // Aggiorna il riferimento nell'iscrizione
    iscrizioneClub.confermaPresidenteId = documento.id;
    await iscrizioneClub.save();

    res.status(200).json({
      message: 'Documento caricato con successo',
      iscrizioneClub: {
        id: iscrizioneClub.id,
        confermaPresidenteId: documento.id,
        confermaPresidenteNome: documento.nomeFile
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

    // Verifica che il documento confermaPresidente sia stato caricato
    if (!iscrizioneClub.confermaPresidenteId) {
      return res.status(400).json({
        error: 'È necessario caricare il documento di conferma del presidente prima di confermare l\'iscrizione'
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
    } else if (tipoDocumento === 'confermaPresidente') {
      fileBuffer = iscrizioneClub.confermaPresidente;
      fileName = iscrizioneClub.confermaPresidenteNome;
      fileType = iscrizioneClub.confermaPresidenteTipo;
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
    const categoriesMap = new Map();
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

      if (!categoriesMap.has(atletaId)) {
        categoriesMap.set(atletaId, []);
      }
      categoriesMap.get(atletaId).push(iscrizione.tipoCategoriaId);
    });

    // Calcola e aggiorna il costo per ogni atleta
    for (const [athleteId, athleteData] of athletesMap) {
      const cost = calculateAthleteCost(
        competizione.costiIscrizione,
        athleteData,
        categoriesMap.get(athleteId)
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

const calculateSingleAthleteCosts = async (atletaId, competizioneId) => {
  try {
    // Carica la competizione per ottenere costiIscrizione
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione || !competizione.costiIscrizione) {
      logger.debug('Nessuna configurazione costi per questa competizione');
      return;
    }

    // Carica i dettagli iscrizione dell'atleta
    const dettagliIscrizione = await DettaglioIscrizioneAtleta.findOne({
      where: {
        atletaId,
        competizioneId
      }
    });

    if (!dettagliIscrizione) {
      throw new Error('Dettagli iscrizione atleta non trovati');
    }

    // Carica tutte le iscrizioni dell'atleta per questa competizione
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { competizioneId, atletaId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
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

    const athleteData = {
      atletaId,
      tipoAtletaId: iscrizioni[0].atleta?.tipoAtletaId,
      tesseramento: dettagliIscrizione.tesseramento,
      iscrizioni
    };

    const categories = iscrizioni.map(iscrizione => iscrizione.tipoCategoriaId);
    const cost = calculateAthleteCost(
      competizione.costiIscrizione,
      athleteData,
      categories
    );

    return cost;
  } catch (error) {
    logger.error(`Errore nel calcolo dei costi per atleta ${atletaId}, competizione ${competizioneId}: ${error.message}`, { stack: error.stack });
  }
};

module.exports = {
  getIscrizioniByCompetizione,
  getIscrizioniByCompetitionAndClub,
  createIscrizione,
  deleteIscrizione,
  deleteIscrizioniAtleta,
  editIscrizioniAtleta,
  createOrGetIscrizioneClub,
  getIscrizioneClub,
  getClubRegistrationsByCompetition,
  uploadDocumentiIscrizioneClub,
  confermaIscrizioneClub,
  downloadDocumentoIscrizioneClub,
  modificaIscrizioneClub,
  getClubRegistrationCosts
};