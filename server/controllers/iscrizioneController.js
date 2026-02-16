const { IscrizioneAtleta, IscrizioneClub, Atleta, Categoria, Club, Competizione, ConfigTipoCategoria, ConfigTipoCompetizione, ConfigTipoAtleta, ConfigEsperienza, Documento, DettaglioIscrizioneAtleta } = require('../models');
const { calculateAthleteCost } = require('../helpers/costCalculator');
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

    // Aggiungiamo i dettagli delle iscrizioni, nuova tabella per gestire costi e tesseramenti
    iscrizioniEspanse = iscrizioni.map(iscrizione => iscrizione.dataValues);
    const dettagliIscrizioni = await DettaglioIscrizioneAtleta.findAll({
      where: {
        atletaId: iscrizioniEspanse.map(i => i.atletaId),
        competizioneId
      }
    });

    iscrizioniEspanse = iscrizioniEspanse.map(iscrizione => {
      const dettaglio = dettagliIscrizioni.find(d => d.atletaId === iscrizione.atletaId);
      return {
        ...iscrizione,
        quota: dettaglio ? parseFloat(dettaglio.quota) || 0 : 0,
        verificato: dettaglio ? dettaglio.verificato : false,
        tesseramento: dettaglio ? dettaglio.tesseramento : null
      };
    });

    res.status(200).json(iscrizioniEspanse);
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

    // Aggiungiamo i dettagli delle iscrizioni, nuova tabella per gestire costi e tesseramenti
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
      peso: req.body.peso ? parseFloat(req.body.peso) : null
    };

    const newIscrizione = await IscrizioneAtleta.create(iscrizioneData);

    // Calcola e aggiorna la quota dell'iscrizione dell'atleta
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

    // Calcola e aggiorna la quota dell'iscrizione dell'atleta
    const dettagliIscrizione = await DettaglioIscrizioneAtleta.findOne({
      where: { atletaId, competizioneId }
    });

    if (dettagliIscrizione) {
      const athleteCost = await calculateSingleAthleteCosts(atletaId, competizioneId);
      await dettagliIscrizione.update({
        tesseramento: tesseramento.nome,
        quota: athleteCost
      });
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
    const { athleteId, competitionId } = req.body;
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { atletaId: athleteId, competizioneId: competitionId }
    });

    const editData = req.body.editData;
    if (!editData) {
      return res.status(400).json({ error: 'Nessun dato di modifica fornito' });
    }

    const { categories, categoriesDetails, experiences, weight } = editData;

    if (!categories || categories.length === 0) {
      return res.status(400).json({ error: 'Deve essere selezionata almeno una categoria' });
    }
    
    const configTipoCategorie = await ConfigTipoCategoria.findAll({
      where: { id: categories }
    });

    // Modifica le categorie
    for (const idCategory of categories) {
      const iscrizione = iscrizioni.find(i => i.tipoCategoriaId === idCategory);
      const configCategoria = configTipoCategorie.find(c => c.id === idCategory);
      const dettagliCategoria = categoriesDetails && categoriesDetails[idCategory] ? categoriesDetails[idCategory] : null;
      let idExperience = null;
      let valuePeso = null;

      if (configCategoria.obbligoPeso) {
        if (weight) {
          valuePeso = parseFloat(weight);
        } else {
          return res.status(400).json({ error: `Il peso è obbligatorio per la categoria ${configCategoria.nome}` });
        }
      }

      // Controlla se esiste un'esperienza associata al tipo di competizione della categoria
      // Experiences e' un oggetto con chiavi i tipi competizione e valori l'oggetto exp
      if (experiences && experiences[configCategoria.tipoCompetizioneId]) {
        idExperience = experiences[configCategoria.tipoCompetizioneId].id;
      }

      if (!iscrizione) {
        // Devo creare una nuova iscrizione per questa categoria
        await IscrizioneAtleta.create({
          atletaId: athleteId,
          tipoCategoriaId: idCategory,
          competizioneId: competitionId,
          dettagli: dettagliCategoria,
          peso: valuePeso,
          idConfigEsperienza: idExperience
        });
      }
      else {
        await iscrizione.update({
          dettagli: dettagliCategoria,
          peso: valuePeso,
          idConfigEsperienza: idExperience
        });
      }
    }

    // Rimuovi le categorie non più selezionate
    for (const iscrizione of iscrizioni) {
      if (!categories.includes(iscrizione.tipoCategoriaId)) {
        await iscrizione.destroy();
      }
    }

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
        },
        {
          model: Documento,
          as: 'bonificoDocumento',
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
        },
        {
          model: Documento,
          as: 'bonificoDocumento',
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
      include: [
        {
          model: Club,
          as: 'club',
          attributes: { exclude: ['logo'] }
        },        
        {
          model: require('../models').Documento,
          as: 'confermaPresidenteDocumento',
          attributes: ['id', 'nomeFile']
        },
        {
          model: require('../models').Documento,
          as: 'bonificoDocumento',
          attributes: ['id', 'nomeFile']
        }
      ],
      order: [
        [{ model: Club, as: 'club' }, 'denominazione', 'ASC']
      ]
    });

    // Aggiungi il campo tesseramento direttamente nella risposta principale per comodità frontend
    const clubRegistrationsWithAffiliation = clubRegistrations.map(reg => {
      const regJson = reg.toJSON();
      regJson.affiliazione = regJson.club?.tesseramento || '';
      regJson.confermaPresidenteDocId = regJson.confermaPresidenteDocumento?.id || null;
      regJson.confermaPresidenteDocName = regJson.confermaPresidenteDocumento?.nomeFile || null;
      regJson.bonificoDocId = regJson.bonificoDocumento?.id || null;
      regJson.bonificoDocName = regJson.bonificoDocumento?.nomeFile || null;
      return regJson;
    });

    res.status(200).json(clubRegistrationsWithAffiliation);
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

    if (!files || !files.bonifico) {
      return res.status(400).json({
        error: 'Il documento del bonifico è obbligatorio'
      });
    }

    const confermaPresidente = files.confermaPresidente[0];
    // Verifica che sia PDF
    if (confermaPresidente.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'La conferma del presidente deve essere in formato PDF'
      });
    }

    const bonifico = files.bonifico[0];
    // Verifica che sia PDF
    if (bonifico.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Il bonifico deve essere in formato PDF'
      });
    }

    // Se esistono gia' altri doc, elimino il riferimento dall'iscrizione e li cancello
    const oldDocId = iscrizioneClub.confermaPresidenteId;
    if (iscrizioneClub.confermaPresidenteId) {
      iscrizioneClub.confermaPresidenteId = null;
      await iscrizioneClub.save();
      const vecchioDocumento = await Documento.findByPk(oldDocId);
      if (vecchioDocumento) {
        await vecchioDocumento.destroy();
      }
    }

    const oldBonificoId = iscrizioneClub.bonificoId;
    if (iscrizioneClub.bonificoId) {
      iscrizioneClub.bonificoId = null;
      await iscrizioneClub.save();
      const vecchioDocumentoBonifico = await Documento.findByPk(oldBonificoId);
      if (vecchioDocumentoBonifico) {
        await vecchioDocumentoBonifico.destroy();
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

    const documentoBonifico = await Documento.create({
      nomeFile: bonifico.originalname,
      file: bonifico.buffer,
      mimeType: bonifico.mimetype,
      dimensione: bonifico.size,
      tipoDocumento: 'bonifico'
    });

    // Aggiorna il riferimento nell'iscrizione
    iscrizioneClub.confermaPresidenteId = documento.id;
    iscrizioneClub.bonificoId = documentoBonifico.id;
    await iscrizioneClub.save();

    res.status(200).json({
      message: 'Documento caricato con successo',
      iscrizioneClub: {
        id: iscrizioneClub.id,
        confermaPresidenteId: documento.id,
        confermaPresidenteNome: documento.nomeFile,
        bonificoId: documentoBonifico.id,
        bonificoNome: documentoBonifico.nomeFile
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
    let docId = null;

    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId }
    });

    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }

    if (tipoDocumento === 'confermaPresidente') {
      docId = iscrizioneClub.confermaPresidenteId;
    } else if (tipoDocumento === 'bonifico') {
      docId = iscrizioneClub.bonificoId;
    } else {
      return res.status(400).json({ error: 'Tipo di documento non valido' });
    }

    if (!docId) {
      return res.status(404).json({ error: `Documento #${tipoDocumento} non presente nell'iscrizione` });
    }
    const doc = await Documento.findByPk(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Documento richiesto associato non trovato' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.nomeFile}"`);
    res.send(doc.file);
  } catch (error) {
    logger.error(`Errore nel download del documento ${req.params.tipoDocumento} per club ${req.params.clubId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
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

    // Carica tutti gli atleti del club iscritti a questa competizione
    const atleti = await Atleta.findAll({
      where: { clubId },
      attributes: ['id']
    });
    const atletaIds = atleti.map(a => a.id);

    if (atletaIds.length === 0) {
      return res.status(200).json({
        totalCost: 0,
        athletesCosts: [],
        costiIscrizione: competizione.costiIscrizione
      });
    }

    // Recupera tutte le quote dal modello DettaglioIscrizioneAtleta
    const dettagliQuote = await DettaglioIscrizioneAtleta.findAll({
      where: {
        atletaId: atletaIds,
        competizioneId
      }
    });

    const totalCost = dettagliQuote.reduce((sum, dq) => sum + (parseFloat(dq.quota) || 0), 0);
    const athletesCosts = dettagliQuote.map(dq => ({
      atletaId: dq.atletaId,
      cost: parseFloat(dq.quota) || 0
    }));

    res.status(200).json({
      totalCost,
      athletesCosts,
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

// Crea un documento di riepilogo dell'iscrizione del club ad una competizione
const downloadClubCompetitionSummary = async (req, res) => {
  let doc;
  let streamStarted = false;
  
  try {
    const { clubId, competizioneId } = req.params;

    if (!clubId || !competizioneId) {
      return res.status(400).json({ error: 'clubId e competizioneId sono obbligatori' });
    }

    // Carica la competizione
    const competizione = await Competizione.findByPk(competizioneId, {
      include: [
        {
          model: Club,
          as: 'organizzatore',
          attributes: { exclude: ['logoId'] }
        }
      ]
    });

    if (!competizione) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    // Carica il club
    const club = await Club.findByPk(clubId);
    if (!club) {
      return res.status(404).json({ error: 'Club non trovato' });
    }

    // Conto iscrizioni totali, iscrizioni atleti e costo totale
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          where: { clubId }
        }
      ]
    });

    const iscrizioniPerAtleta = {};
    iscrizioni.forEach(iscrizione => {
      if (!iscrizioniPerAtleta[iscrizione.atletaId]) {
        iscrizioniPerAtleta[iscrizione.atletaId] = {
          atleta: iscrizione.atleta,
          iscrizioni: []
        };
      }
      iscrizioniPerAtleta[iscrizione.atletaId].iscrizioni.push(iscrizione);
    });

    const dettagliIscrizioni = await DettaglioIscrizioneAtleta.findAll({
      where: { competizioneId },
      include: [
        {
          model: Atleta,
          as: 'atleta',
          where: { clubId }
        }
      ]
    });
    
    const totalAthletes = dettagliIscrizioni.length;
    const totalCategories = iscrizioni.length;
    const totalCost = dettagliIscrizioni.reduce((sum, di) => sum + (parseFloat(di.quota) || 0), 0);

    // Estrai categorie uniche
    const categorySet = new Set();
    const categoryDetailsMap = {};
    
    if (competizione.categorieAtleti) {
      for (const categorieTipoAtleta of competizione.categorieAtleti) {
        if (categorieTipoAtleta.categorie && Array.isArray(categorieTipoAtleta.categorie)) {
          for (const cat of categorieTipoAtleta.categorie) {
            if (!categorySet.has(cat.configTipoCategoria)) {
              categorySet.add(cat.configTipoCategoria);
              const catDetails = await ConfigTipoCategoria.findByPk(cat.configTipoCategoria);
              if (catDetails) {
                categoryDetailsMap[cat.configTipoCategoria] = catDetails;
              }
            }
          }
        }
      }
    }

    // Crea mappa esperienze per id
    const experienceMap = {};
    const esperienze = await ConfigEsperienza.findAll();
    esperienze.forEach(exp => {
      experienceMap[exp.id] = exp;
    });

    // Ordino le categorie per proprieta' 'ordine'
    const categories = Array.from(categorySet);
    categories.sort((a, b) => {
      const catA = categoryDetailsMap[a];
      const catB = categoryDetailsMap[b];
      return (catA.ordine || 0) - (catB.ordine || 0);
    });

    // Prepara dati per la tabella PRIMA di iniziare lo stream
    const tableData = [];
    
    Object.values(iscrizioniPerAtleta).forEach(({ atleta, iscrizioni }) => {
      const row = [`${atleta.cognome} ${atleta.nome}`];

      categories.forEach(catId => {
        const registration = iscrizioni.find(
          reg => reg.tipoCategoriaId === catId
        );

        if (registration) {
          let cellValue = 'V';
          
          // Verifica se ci sono dettagli, considero solo il nome in riepilogo
          if (registration.dettagli && registration.dettagli.nome) {
            if (registration.dettagli.nome) {
              cellValue = registration.dettagli.nome;
            }
          }
          
          // Se c'è il peso, mostralo
          if (registration.peso) {
            cellValue = `${registration.peso} kg`;
          }
          
          // Aggiungi esperienza se disponibile
          if (registration.idConfigEsperienza) {
            cellValue += ` (${experienceMap[registration.idConfigEsperienza]?.nome || 'Exp sconosciuta'})`;
          }
          
          row.push(cellValue);
        } else {
          row.push('-');
        }
      });

      tableData.push(row);
    });

    // SOLO ADESSO crea il PDF e avvia lo stream
    const PDFDocument = require('pdfkit');
    doc = new PDFDocument({ 
      margin: 30,
      size: 'A4',
      layout: 'landscape'
    });

    // Imposta headers per il download
    const fileName = `Riepilogo_Iscrizione_${competizione.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);
    streamStarted = true;

    // Dimensioni pagina
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const marginX = 30;

    // Data generazione documento in alto a destra
    doc.fontSize(7).font('Helvetica-Oblique').fillColor('gray');
    const generationText = `Documento generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`;
    doc.text(generationText, pageWidth - 250, 10, { align: 'right', width: 220 });

    // Reset posizione e stile per il contenuto principale
    doc.fillColor('black');
    doc.x = marginX;
    doc.y = 40;

    // Titolo
    doc.fontSize(18).font('Helvetica-Bold').text('Riepilogo Iscrizione Competizione', { align: 'center' });
    doc.moveDown(0.3);
    
    // Nome competizione
    doc.fontSize(12).font('Helvetica').text(`${competizione.nome}${competizione.luogo ? ` - ${competizione.luogo}` : ''}`, { align: 'center' });
    doc.moveDown(0.3);
    
    // Data competizione
    if (competizione.dataInizio) {
      doc.text(`Data: ${new Date(competizione.dataInizio).toLocaleDateString('it-IT')}`, { align: 'center' });
    }
    doc.moveDown(0.5);

    // Tabella Riepilogo Generale
    doc.fontSize(14).font('Helvetica-Bold').text('Riepilogo Generale');
    doc.moveDown(0.5);

    const summaryTableData = [
      [club.denominazione, totalAthletes.toString(), totalCategories.toString(), `€${totalCost.toFixed(2)}`]
    ];

    const summaryHeaders = ['Club', 'Atleti Iscritti', 'Categorie Totali', 'Costo Totale'];
    const summaryTableWidth = pageWidth - (marginX * 2);
    const summaryColWidth = summaryTableWidth / 4;
    const summaryStartX = marginX;
    let summaryStartY = doc.y;
    const summaryRowHeight = 18;

    // Header tabella riepilogo
    doc.fontSize(8).font('Helvetica-Bold');
    doc.fillColor('#b91c1c');
    summaryHeaders.forEach((header, i) => {
      const x = summaryStartX + (i * summaryColWidth);
      doc.rect(x, summaryStartY, summaryColWidth, summaryRowHeight).stroke();
      doc.fillColor('white').rect(x, summaryStartY, summaryColWidth, summaryRowHeight).fill();
      doc.fillColor('#b91c1c');
      doc.text(header, x + 2, summaryStartY + 5, { width: summaryColWidth - 4, align: 'center' });
    });
    summaryStartY += summaryRowHeight;

    // Riga dati tabella riepilogo
    doc.fontSize(9).font('Helvetica').fillColor('black');
    summaryTableData[0].forEach((cell, colIndex) => {
      const x = summaryStartX + (colIndex * summaryColWidth);
      doc.rect(x, summaryStartY, summaryColWidth, summaryRowHeight).stroke();
      
      if (colIndex === 0) {
        doc.font('Helvetica-Bold');
      } else {
        doc.font('Helvetica');
      }
      
      doc.text(cell, x + 2, summaryStartY + 5, { 
        width: summaryColWidth - 4, 
        align: colIndex === 0 ? 'left' : 'center'
      });
    });
    summaryStartY += summaryRowHeight;

    // Reset posizione per la sezione successiva
    doc.x = marginX;
    doc.y = summaryStartY + 10;
    doc.moveDown(0.5);

    // Sezione: Dettaglio Iscrizioni Atleti
    doc.fontSize(14).font('Helvetica-Bold').text('Dettaglio Iscrizioni Atleti');
    doc.moveDown(0.5);

    // Tabella Iscrizioni Atleti
    const headers = [
      'Atleta',
      ...categories.map(catId => categoryDetailsMap[catId]?.nome || `Cat. ${catId}`)
    ];

    // Calcola larghezze colonne
    const tableWidth = pageWidth - (marginX * 2);
    const athleteColWidth = 100;
    const remainingWidth = tableWidth - athleteColWidth;
    const categoryColWidth = remainingWidth / categories.length;

    const startX = marginX;
    let startY = doc.y;
    const rowHeight = 18;

    // Header
    doc.fontSize(8).font('Helvetica-Bold');
    doc.fillColor('#b91c1c');
    headers.forEach((header, i) => {
      const colWidth = i === 0 ? athleteColWidth : categoryColWidth;
      const x = i === 0 ? startX : startX + athleteColWidth + (i - 1) * categoryColWidth;
      doc.rect(x, startY, colWidth, rowHeight*2).stroke();
      doc.fillColor('white').rect(x, startY, colWidth, rowHeight*2).fill();
      doc.fillColor('#b91c1c');
      doc.text(header, x + 2, startY + 4, { width: colWidth - 4, align: 'center', ellipsis: true });
    });
    startY += rowHeight*2;

    // Righe
    doc.fontSize(7).font('Helvetica').fillColor('black');
    tableData.forEach((row, rowIndex) => {
      // Verifica se c'è spazio sulla pagina
      if (startY + rowHeight > pageHeight - 40) {
        doc.addPage({ layout: 'landscape' });
        startY = marginX;
        
        // Ridisegna header sulla nuova pagina
        doc.fontSize(8).font('Helvetica-Bold');
        doc.fillColor('#b91c1c');
        headers.forEach((header, i) => {
          const colWidth = i === 0 ? athleteColWidth : categoryColWidth;
          const x = i === 0 ? startX : startX + athleteColWidth + (i - 1) * categoryColWidth;
          doc.rect(x, startY, colWidth, rowHeight).stroke();
          doc.fillColor('white').rect(x, startY, colWidth, rowHeight).fill();
          doc.fillColor('#b91c1c');
          doc.text(header, x + 2, startY + 4, { width: colWidth - 4, align: 'center', ellipsis: true });
        });
        startY += rowHeight;
        doc.fontSize(7).font('Helvetica').fillColor('black');
      }

      row.forEach((cell, colIndex) => {
        const colWidth = colIndex === 0 ? athleteColWidth : categoryColWidth;
        const x = colIndex === 0 ? startX : startX + athleteColWidth + (colIndex - 1) * categoryColWidth;
        doc.rect(x, startY, colWidth, rowHeight).stroke();
        
        if (colIndex === 0) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }
        
        doc.text(cell || '-', x + 2, startY + 4, { 
          width: colWidth - 4, 
          align: colIndex === 0 ? 'left' : 'center',
          ellipsis: true
        });
      });
      startY += rowHeight;
    });

    doc.end();

  } catch (error) {
    logger.error(`Errore nel download del riepilogo iscrizione club ${req.params.clubId} per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    
    // Se lo stream è già stato avviato, non possiamo più inviare JSON
    if (streamStarted && doc) {
      doc.end();
    } else {
      res.status(500).json({
        error: 'Errore nel download del riepilogo iscrizione',
        details: error.message
      });
    }
  }
}

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

// Aggiunge o rimuove il toggle di verifica iscrizione club
const toggleVerificaIscrizioneClub = async (req, res) => {
  try {
    const { clubId, competizioneId } = req.body;
    if (!clubId || !competizioneId) {
      return res.status(400).json({ error: 'clubId e competizioneId sono obbligatori' });
    }
    const iscrizioneClub = await IscrizioneClub.findOne({
      where: { clubId, competizioneId }
    });
    if (!iscrizioneClub) {
      return res.status(404).json({ error: 'Iscrizione del club non trovata' });
    }
    iscrizioneClub.verificato = !iscrizioneClub.verificato;
    await iscrizioneClub.save();
    res.status(200).json({
      message: 'Toggle verifica iscrizione club aggiornato',
      verificaIscrizione: iscrizioneClub.verificato
    });
  } catch (error) {
    logger.error(`Errore nel toggle verifica iscrizione club ${req.body.clubId} per competizione ${req.body.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel toggle verifica iscrizione club',
      details: error.message
    });
  }
};

// Aggiunge o rimuove il toggle di verifica iscrizione atleta
const toggleVerificaIscrizioneAtleta = async (req, res) => {
  try {
    const { atletaId, competizioneId } = req.body;
    if (!atletaId || !competizioneId) {
      return res.status(400).json({ error: 'atletaId e competizioneId sono obbligatori' });
    }
    const dettagliIscrizione = await DettaglioIscrizioneAtleta.findOne({
      where: { atletaId, competizioneId }
    });
    if (!dettagliIscrizione) {
      return res.status(404).json({ error: 'Iscrizione dell\'atleta non trovata' });
    }
    dettagliIscrizione.verificato = !dettagliIscrizione.verificato;
    await dettagliIscrizione.save();
    res.status(200).json({
      message: 'Toggle verifica iscrizione atleta aggiornato',
      verificaIscrizione: dettagliIscrizione.verificato
    });
  }
  catch (error) {
    logger.error(`Errore nel toggle verifica iscrizione atleta ${req.body.atletaId} per competizione ${req.body.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel toggle verifica iscrizione atleta',
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
  editIscrizioniAtleta,
  createOrGetIscrizioneClub,
  getIscrizioneClub,
  getClubRegistrationsByCompetition,
  uploadDocumentiIscrizioneClub,
  confermaIscrizioneClub,
  downloadDocumentoIscrizioneClub,
  modificaIscrizioneClub,
  getClubRegistrationCosts,
  downloadClubCompetitionSummary,
  toggleVerificaIscrizioneClub,
  toggleVerificaIscrizioneAtleta
};