const { Categoria, IscrizioneAtleta, Atleta, Competizione, SvolgimentoCategoria, Club, UtentiLogin, DettaglioIscrizioneAtleta } = require('../models');
const { ConfigTipoCategoria, ConfigEsperienza, ConfigTipoCompetizione } = require('../models');
const { Op } = require('sequelize');
const logger = require('../helpers/logger/logger');
const { resolveAgeGroup } = require('../helpers/ageGroups');

const COMPLEMENTARY_ACTIVITIES_TYPE_ID = 4; // ID del tipo di competizione per attività complementari


// Genera categorie automaticamente basandosi sugli atleti iscritti
// Suddivisione: tipo categoria, cintura (CN/CB sempre separate), genere, fascia d'età, livello di esperienza.
// La fascia d'età è calcolata con la configurazione salvata in competizione alla data di inizio gara,
// il grado CN è quello registrato al momento dell'iscrizione.
exports.generateCategories = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const { unisciAttivitaComplementari, unisciLivelloEsperienza } = req.body;

    // Verifica che la competizione esista
    const competition = await Competizione.findByPk(competizioneId);
    if (!competition) {
      return res.status(404).json({ error: 'Competizione non trovata' });
    }
    if (!competition.ageGroupConfig) {
      return res.status(400).json({ error: 'Configurazione fasce d\'età non impostata per la competizione' });
    }

    // Recupera gli atleti iscritti alla competizione, con categorie non ancora assegnate
    const registrations = await IscrizioneAtleta.findAll({
      where: {
        competizioneId,
        categoriaId: null
      },
      include: [{
          model: Atleta,
          as: 'atleta',
          attributes: ['id', 'nome', 'cognome', 'sesso', 'dataNascita', 'isBlackBelt'],
          include: [{
            model: Club,
            as: 'club',
            attributes: ['id', 'denominazione', 'abbreviazione']
          }],
        }, {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          attributes: ['id', 'nome', 'tipoCompetizioneId']
        }, {
          model: ConfigEsperienza,
          as: 'esperienza',
          attributes: ['id', 'nome']
        }
      ]
    });

    if (registrations.length === 0) {
      return res.status(400).json({ error: 'Nessun atleta iscritto trovato per questa tipologia' });
    }

    // Grado CN registrato al momento dell'iscrizione (in assenza si usa quello attuale dell'atleta)
    const registrationDetails = await DettaglioIscrizioneAtleta.findAll({
      where: { competizioneId },
      attributes: ['atletaId', 'isBlackBelt']
    });
    const blackBeltByAthlete = new Map(registrationDetails.map(d => [d.atletaId, d.isBlackBelt]));

    // Crea la struttura delle categorie come mappa key-value ordinata per key
    const createdCategories = new Map();

    registrations.forEach(registration => {
      const athlete = registration.atleta;
      const tipoCompetizioneId = registration?.tipoCategoria?.tipoCompetizioneId;
      const categoryName = registration.tipoCategoria.nome || registration.tipoCategoria.toString();
      const categoryDetailName = registration.dettagli?.nome || null;
      const isBlackBelt = blackBeltByAthlete.get(athlete.id) ?? athlete.isBlackBelt;
      const belt = isBlackBelt ? 'CN' : 'CB';
      const ageGroup = resolveAgeGroup(athlete.dataNascita, competition.ageGroupConfig, competition.dataInizio);

      // Solo per le attività complementari (id=4), posso attivare il merge globale
      const mergeComplementaryActivities = unisciAttivitaComplementari && tipoCompetizioneId && tipoCompetizioneId == COMPLEMENTARY_ACTIVITIES_TYPE_ID? true : false;

      // Chiave della categoria: le cinture nere sono sempre separate dalle cinture bianche
      let categoryKey = `${registration.tipoCategoriaId}_${belt}`;
      let displayName = isBlackBelt ? 'CN - ' : '';

      // Aggiungi il genere alla chiave
      let gender = athlete.sesso || 'U';
      if (!mergeComplementaryActivities) {
        categoryKey += `_${gender}`;
        displayName = `${displayName}${gender}`;
      }

      // Aggiungo il nome della categoria
      if (displayName !== '' && !displayName.endsWith(' - '))
        displayName = `${displayName} - ${categoryName}`;
      else
        displayName = `${displayName}${categoryName}`;

      // Aggiungi la fascia d'età alla chiave
      if (!mergeComplementaryActivities) {
        categoryKey += `_age_${ageGroup ? ageGroup.key : 'open'}`;
        displayName = `${displayName} - ${ageGroup ? ageGroup.label : 'Open'}`;
      }

      // Aggiungi lvl esperienza se presente
      let lvlEsperienza = null;
      if (registration.esperienza) {
        lvlEsperienza = registration.esperienza.id;
        if (!mergeComplementaryActivities && !unisciLivelloEsperienza) {
          categoryKey += `_lvl_${registration.esperienza.id}`;
          displayName = `${displayName} - ${registration.esperienza.nome}`;
        }
      }

      // Inizializza la categoria se non esiste
      if (!createdCategories.has(categoryKey)) {
        createdCategories.set(categoryKey, {
          nome: displayName,
          atleti: [],
          genere: gender,
          belt,
          livelliEsperienzaId: lvlEsperienza ? [lvlEsperienza] : [],
          ageGroupKeys: ageGroup ? [ageGroup.key] : [],
          tipoCategoriaId: registration.tipoCategoriaId,
          tipoCompetizioneId: tipoCompetizioneId,
          key: categoryKey
        });
      } else {
        // Aggiunge i campi array se non già presenti
        const existingCategory = createdCategories.get(categoryKey);
        if (lvlEsperienza && !existingCategory.livelliEsperienzaId.includes(lvlEsperienza)) {
          existingCategory.livelliEsperienzaId.push(lvlEsperienza);
        }
        if (ageGroup && !existingCategory.ageGroupKeys.includes(ageGroup.key)) {
          existingCategory.ageGroupKeys.push(ageGroup.key);
        }
      }

      createdCategories.get(categoryKey).atleti.push({
        id: athlete.id,
        nome: athlete.nome,
        cognome: athlete.cognome,
        dataNascita: athlete.dataNascita,
        peso: registration.peso,
        esperienza: registration.esperienza ? registration.esperienza.nome : null,
        dettagli: categoryDetailName,
        cintura: belt,
        fasciaEta: ageGroup ? ageGroup.label : null,
        iscrizioneId: registration.id,
        club: athlete.club ? {
          id: athlete.club.id,
          denominazione: athlete.club.denominazione,
          abbreviazione: athlete.club.abbreviazione
        } : null
      });
    });

    // Converti in array, ordinato per nome categoria
    const risultato = Array.from(createdCategories.entries())
      .sort((a, b) => a[1].nome.localeCompare(b[1].nome))
      .map(entry => entry[1]);

    res.json({
      message: 'Categorie generate con successo',
      categorie: risultato,
      totaleAtleti: registrations.length,
      totaleCategorie: risultato.length
    });

  } catch (error) {
    logger.error(`Errore nella generazione delle categorie per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante la generazione delle categorie',
      details: error.message
    });
  }
};

// Salva le categorie sul database
exports.saveCategories = async (req, res) => {
  const transaction = await Categoria.sequelize.transaction();

  try {
    const { competizioneId } = req.params;
    const { categorie } = req.body;

    // Verifica che la competizione esista
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Competizione non trovata' });
    }

    const categorieSalvate = [];

    for (const categoria of categorie) {
      // Crea la categoria
      const nuovaCategoria = await Categoria.create({
        nome: categoria.nome,
        competizioneId: parseInt(competizioneId),
        tipoCategoriaId: categoria.tipoCategoriaId,
        // tipoAtletaId: categoria.tipoAtletaId || null,
        // livelloEsperienzaId: categoria.livelloEsperienzaId || null,
        genere: categoria.genere || 'U',
        // etaMinima: categoria.etaMinima || 0,
        // etaMassima: categoria.etaMassima || 99,
        ageGroupKeys: categoria.ageGroupKeys || [],
        pesoMassimo: categoria.pesoMassimo || null,
        numeroTurni: categoria.numeroTurni || 1,
        maxPartecipanti: categoria.atleti.length,
        stato: 'Aperta',
        descrizione: categoria.descrizione || null
      }, { transaction });

      // Aggiorna le iscrizioni degli atleti con il categoriaId
      if (categoria.atleti && categoria.atleti.length > 0) {
        const atletiIds = categoria.atleti.map(a => a.iscrizioneId);

        await IscrizioneAtleta.update(
          { categoriaId: nuovaCategoria.id },
          {
            where: {
              id: { [Op.in]: atletiIds },
              competizioneId: competizioneId
            },
            transaction
          }
        );
      }

      categorieSalvate.push(nuovaCategoria);
    }

    await transaction.commit();

    logger.info(`Categorie salvate per competizione ${competizioneId} - Totale: ${categorieSalvate.length}`);
    res.status(201).json({
      message: 'Categorie salvate con successo',
      categorie: categorieSalvate
    });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Errore nel salvataggio delle categorie per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante il salvataggio delle categorie',
      details: error.message
    });
  }
};

// Ottieni le categorie di una competizione
exports.getCategoriesByCompetizione = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const { includiIscrizioni } = req.query;

    const categorie = await Categoria.findAll({
      where: { competizioneId },
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          attributes: ['id', 'nome'],
          include: [{
            model: ConfigTipoCompetizione,
            as: 'tipoCompetizione',
            attributes: ['id', 'nome']
          }]
        }
      ]
    });

    // Ordina per 'ordine' se presente, altrimenti per nome in modo "intelligente" considerando i numeri
    categorie.sort((a, b) => {
      if (a.ordine !== null && b.ordine !== null) {
        return a.ordine - b.ordine;
      } else if (a.ordine !== null) {
        return -1;
      } else if (b.ordine !== null) {
        return 1;
      } else {
        return a.nome.localeCompare(b.nome, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      }
    });

    if (includiIscrizioni) {
      for (const categoria of categorie) {
        const iscrizioni = await IscrizioneAtleta.findAll({
          where: { categoriaId: categoria.id },
          attributes: ['id', 'atletaId', 'tipoCategoriaId', 'categoriaId', 'peso', 'dettagli'],
          include: [{
            model: Atleta,
            as: 'atleta',
            attributes: ['id', 'nome', 'cognome', 'sesso', 'dataNascita', 'isBlackBelt'],
            include: [{
              model: Club,
              as: 'club',
              attributes: ['id', 'denominazione', 'abbreviazione']
            }],
          }, {
            model: ConfigTipoCategoria,
            as: 'tipoCategoria',
            attributes: ['id', 'nome', 'tipoCompetizioneId']
          }, {
            model: ConfigEsperienza,
            as: 'esperienza',
            attributes: ['id', 'nome']
          }
        ]
        });
        categoria.dataValues.iscrizioni = iscrizioni;
      }
    }

    res.json(categorie);
  } catch (error) {
    logger.error(`Errore nel recupero delle categorie per competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante il recupero delle categorie',
      details: error.message
    });
  }
};

// Recupera le categorie assegnate ad un utente tavolo per una competizione
exports.getCategoriesByTableUser = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const username = req.user.username;

    const user = await UtentiLogin.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const userId = user.id;
    const categorie = await Categoria.findAll({
      where: {
        competizioneId,
        tableUserId: userId
      },
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          attributes: ['id', 'nome'],
          include: [{
            model: ConfigTipoCompetizione,
            as: 'tipoCompetizione',
            attributes: ['id', 'nome']
          }]
        }
      ]
    });

    // Ordina per 'ordine' se presente, altrimenti per nome in modo "intelligente" considerando i numeri
    categorie.sort((a, b) => {
      if (a.ordine !== null && b.ordine !== null) {
        return a.ordine - b.ordine;
      } else if (a.ordine !== null) {
        return -1;
      } else if (b.ordine !== null) {
        return 1;
      } else {
        return a.nome.localeCompare(b.nome, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      }
    });

    res.json(categorie);
  } catch (error) {
    logger.error(`Errore nel recupero delle categorie per utente tavolo - competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante il recupero delle categorie',
      details: error.message
    });
  }
};

// Aggiorna una categoria
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      logger.warn(`Tentativo aggiornamento categoria inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Categoria non trovata' });
    }

    await categoria.update(updateData);

    logger.info(`Categoria aggiornata - ID: ${id}`);
    res.json({
      message: 'Categoria aggiornata con successo',
      categoria
    });

  } catch (error) {
    logger.error(`Errore nell'aggiornamento della categoria ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante l\'aggiornamento della categoria',
      details: error.message
    });
  }
};

// Elimina una categoria
exports.deleteCategoria = async (req, res) => {
  const transaction = await Categoria.sequelize.transaction();

  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      await transaction.rollback();
      logger.warn(`Tentativo eliminazione categoria inesistente - ID: ${id}`);
      return res.status(404).json({ error: 'Categoria non trovata' });
    }

    // Rimuovi il categoriaId dalle iscrizioni
    await IscrizioneAtleta.update(
      { categoriaId: null },
      {
        where: { categoriaId: id },
        transaction
      }
    );

    // Elimina la categoria
    await categoria.destroy({ transaction });

    await transaction.commit();

    logger.info(`Categoria eliminata - ID: ${id}`);
    res.json({ message: 'Categoria eliminata con successo' });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Errore nell'eliminazione della categoria ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante l\'eliminazione della categoria',
      details: error.message
    });
  }
};

// Elimina tutte le categorie di una competizione
exports.deleteCategoriesByCompetizione = async (req, res) => {
  const transaction = await Categoria.sequelize.transaction();
  try {
    const { id } = req.params;
    const categorie = await Categoria.findAll({ where: { competizioneId: id } });
    if (categorie.length === 0) {
      await transaction.rollback();
      logger.warn(`Tentativo eliminazione categorie per competizione inesistente o senza categorie - Competizione ID: ${id}`);
      return res.status(404).json({ error: 'Nessuna categoria trovata per questa competizione' });
    }
    // Rimuovi il categoriaId dalle iscrizioni
    await IscrizioneAtleta.update(
      { categoriaId: null },
      {
        where: { categoriaId: { [Op.in]: categorie.map(c => c.id) } },
        transaction
      }
    );
    // Elimina le categorie
    await Categoria.destroy({ where: { competizioneId: id }, transaction });
    await transaction.commit();
    logger.info(`Categorie eliminate per competizione - Competizione ID: ${id}, Totale Categorie: ${categorie.length}`);
    res.json({ message: 'Tutte le categorie della competizione sono state eliminate con successo' });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Errore nell'eliminazione delle categorie per competizione ${req.params.id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante l\'eliminazione delle categorie della competizione',
      details: error.message
    });
  }
};

// Sposta atleti tra categorie
exports.moveAtleti = async (req, res) => {
  const transaction = await IscrizioneAtleta.sequelize.transaction();

  try {
    const { atletiIds, targetCategoriaId } = req.body;

    // Verifica che la categoria target esista
    const categoria = await Categoria.findByPk(targetCategoriaId);
    if (!categoria) {
      await transaction.rollback();
      logger.warn(`Tentativo spostamento atleti verso categoria inesistente - ID: ${targetCategoriaId}`);
      return res.status(404).json({ error: 'Categoria target non trovata' });
    }

    // Sposta gli atleti
    await IscrizioneAtleta.update(
      { categoriaId: targetCategoriaId },
      {
        where: {
          id: { [Op.in]: atletiIds }
        },
        transaction
      }
    );

    await transaction.commit();

    logger.info(`Atleti spostati nella categoria ${targetCategoriaId} - Totale: ${atletiIds.length}`);
    res.json({ message: 'Atleti spostati con successo' });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Errore nello spostamento degli atleti: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante lo spostamento degli atleti',
      details: error.message
    });
  }
};

// Unisci due categorie
exports.mergeCategorie = async (req, res) => {
  const transaction = await Categoria.sequelize.transaction();

  try {
    const { categoria1Id, categoria2Id, nuovoNome } = req.body;

    // Verifica che entrambe le categorie esistano
    const categoria1 = await Categoria.findByPk(categoria1Id);
    const categoria2 = await Categoria.findByPk(categoria2Id);

    if (!categoria1 || !categoria2) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Una o entrambe le categorie non trovate' });
    }

    // Verifica che appartengano alla stessa competizione
    if (categoria1.competizioneId !== categoria2.competizioneId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Le categorie devono appartenere alla stessa competizione' });
    }

    // Aggiorna il nome della categoria1
    if (nuovoNome) {
      categoria1.nome = nuovoNome;
    }

    // Sposta tutti gli atleti dalla categoria2 alla categoria1
    await IscrizioneAtleta.update(
      { categoriaId: categoria1Id },
      {
        where: { categoriaId: categoria2Id },
        transaction
      }
    );

    // Aggiorna maxPartecipanti
    const countAtleti = await IscrizioneAtleta.count({
      where: { categoriaId: categoria1Id },
      transaction
    });

    categoria1.maxPartecipanti = countAtleti;
    await categoria1.save({ transaction });

    // Elimina la categoria2
    await categoria2.destroy({ transaction });

    await transaction.commit();

    logger.info(`Categorie unite - Categoria1: ${categoria1Id}, Categoria2: ${categoria2Id}, Atleti totali: ${countAtleti}`);
    res.json({
      message: 'Categorie unite con successo',
      categoria: categoria1
    });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Errore nell'unione delle categorie: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante l\'unione delle categorie',
      details: error.message
    });
  }
};

// Dividi una categoria in due
exports.splitCategoria = async (req, res) => {
  const transaction = await Categoria.sequelize.transaction();

  try {
    const { categoriaId, atleti1, atleti2, nomeCategoria1, nomeCategoria2 } = req.body;

    // Verifica che la categoria esista
    const categoriaOriginale = await Categoria.findByPk(categoriaId);
    if (!categoriaOriginale) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Categoria non trovata' });
    }

    // Aggiorna il nome della categoria originale
    categoriaOriginale.nome = nomeCategoria1;
    categoriaOriginale.maxPartecipanti = atleti1.length;
    await categoriaOriginale.save({ transaction });

    // Gli atleti in atleti1 rimangono nella categoria originale
    // Non serve fare nulla per loro

    // Crea la nuova categoria con gli stessi parametri
    const nuovaCategoria = await Categoria.create({
      nome: nomeCategoria2,
      competizioneId: categoriaOriginale.competizioneId,
      tipoCategoriaId: categoriaOriginale.tipoCategoriaId,
      genere: categoriaOriginale.genere,
      gruppiEtaId: categoriaOriginale.gruppiEtaId,
      ageGroupKeys: categoriaOriginale.ageGroupKeys,
      pesoMassimo: categoriaOriginale.pesoMassimo,
      numeroTurni: categoriaOriginale.numeroTurni,
      maxPartecipanti: atleti2.length,
      stato: categoriaOriginale.stato,
      descrizione: categoriaOriginale.descrizione
    }, { transaction });

    // Sposta gli atleti2 alla nuova categoria
    if (atleti2 && atleti2.length > 0) {
      await IscrizioneAtleta.update(
        { categoriaId: nuovaCategoria.id },
        {
          where: {
            id: { [Op.in]: atleti2 }
          },
          transaction
        }
      );
    }

    await transaction.commit();

    logger.info(`Categoria divisa - Originale: ${categoriaId}, Nuova: ${nuovaCategoria.id}, Atleti: ${atleti1.length}/${atleti2.length}`);
    res.json({
      message: 'Categoria divisa con successo',
      categoria1: categoriaOriginale,
      categoria2: nuovaCategoria
    });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Errore nella divisione della categoria: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante la divisione della categoria',
      details: error.message
    });
  }
};

// Ottieni le categorie di una competizione filtrate per club
exports.getCategoriesByClub = async (req, res) => {
  try {
    const { competizioneId, clubId } = req.params;

    // Prima trova le categorie che hanno almeno un atleta del club specificato
    const categorieConAtletiClub = await Categoria.findAll({
      where: { competizioneId },
      include: [
        {
          model: IscrizioneAtleta,
          as: 'iscrizioni',
          required: true,
          include: [{
            model: Atleta,
            as: 'atleta',
            where: { clubId },
            attributes: ['id']
          }],
          attributes: ['id']
        }
      ],
      attributes: ['id']
    });

    const categorieIds = categorieConAtletiClub.map(cat => cat.id);

    if (categorieIds.length === 0) {
      return res.json([]);
    }

    // Ora recupera le categorie complete con TUTTI gli atleti
    const categorie = await Categoria.findAll({
      where: {
        id: { [Op.in]: categorieIds }
      },
      include: [
        {
          model: ConfigTipoCategoria,
          as: 'tipoCategoria',
          attributes: ['id', 'nome'],
          include: [{
            model: ConfigTipoCompetizione,
            as: 'tipoCompetizione',
            attributes: ['id', 'nome']
          }]
        },
        {
          model: IscrizioneAtleta,
          as: 'iscrizioni',
          required: false,
          include: [{
            model: Atleta,
            as: 'atleta',
            attributes: ['id', 'nome', 'cognome', 'dataNascita', 'sesso', 'clubId'],
          }],
          attributes: ['id', 'atletaId', 'tipoCategoriaId', 'categoriaId', 'peso']
        }
      ]
    });

    // Ordina le categorie alfabeticamente in modo intelligente
    categorie.sort((a, b) => {
      return a.nome.localeCompare(b.nome, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    // Trasforma i dati per una struttura più pulita
    const categorieFormatted = categorie.map(categoria => ({
      id: categoria.id,
      nome: categoria.nome,
      competizioneId: categoria.competizioneId,
      tipoCategoriaId: categoria.tipoCategoriaId,
      genere: categoria.genere,
      ageGroupKeys: categoria.ageGroupKeys,
      pesoMassimo: categoria.pesoMassimo,
      numeroTurni: categoria.numeroTurni,
      maxPartecipanti: categoria.maxPartecipanti,
      descrizione: categoria.descrizione,
      tipoCategoria: categoria.tipoCategoria,
      atleti: categoria.iscrizioni.map(iscrizione => ({
        id: iscrizione.atleta.id,
        nome: iscrizione.atleta.nome,
        cognome: iscrizione.atleta.cognome,
        dataNascita: iscrizione.atleta.dataNascita,
        sesso: iscrizione.atleta.sesso,
        peso: iscrizione.peso,
        isMyClub: iscrizione.atleta.clubId === parseInt(clubId),
        iscrizioneId: iscrizione.id
      }))
    }));

    logger.info(`Recuperate ${categorieFormatted.length} categorie per club ${clubId} nella competizione ${competizioneId}`);
    res.json(categorieFormatted);

  } catch (error) {
    logger.error(`Errore nel recupero delle categorie per club ${req.params.clubId} in competizione ${req.params.competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore durante il recupero delle categorie del club',
      details: error.message
    });
  }
};

// Salva la lettera estratta per una competizione
exports.saveExtractedLetter = async (req, res) => {
  const { competizioneId } = req.params;
  const { lettera } = req.body;
  try {
    let record = await SvolgimentoCategoria.findOne({ where: { competizioneId } });
    if (!record) {
      record = await SvolgimentoCategoria.create({ competizioneId, letteraEstratta: lettera });
    } else {
      record.letteraEstratta = lettera;
      await record.save();
    }
    res.json({ lettera: record.letteraEstratta });
  } catch (error) {
    logger.error(`Errore nel salvataggio della lettera estratta per competizione ${competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel salvataggio della lettera estratta',
      details: error.message
    });
  }
};

// Recupera la lettera estratta per una competizione
exports.getExtractedLetter = async (req, res) => {
  const { competizioneId } = req.params;
  try {
    const record = await SvolgimentoCategoria.findOne({ where: { competizioneId } });
    res.json({ lettera: record ? record.letteraEstratta : null });
  } catch (error) {
    logger.error(`Errore nel recupero della lettera estratta per competizione ${competizioneId}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel recupero della lettera estratta',
      details: error.message
    });
  }
};

// Salva lo svolgimento di una categoria
exports.saveCategoryExecution = async (req, res) => {
  const { id } = req.params; // categoriaId
  const { punteggi, classifica, commissione, tabellone, risultati } = req.body;
  try {
    let record = await SvolgimentoCategoria.findOne({ where: { categoriaId: id } });
    if (!record) {
      record = await SvolgimentoCategoria.create({
        categoriaId: id,
        punteggi,
        classifica,
        commissione,
        tabellone,
        risultati
      });
    } else {
      if (punteggi !== undefined) record.punteggi = punteggi;
      if (classifica !== undefined) record.classifica = classifica;
      if (commissione !== undefined) record.commissione = commissione;
      if (tabellone !== undefined) record.tabellone = tabellone;
      if (risultati !== undefined) record.risultati = risultati;
      await record.save();
    }
    res.json(record);
  } catch (error) {
    logger.error(`Errore nel salvataggio dello svolgimento categoria ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel salvataggio dello svolgimento categoria',
      details: error.message
    });
  }
};

// Recupera lo svolgimento di una categoria
exports.getCategoryExecution = async (req, res) => {
  const { id } = req.params; // categoriaId
  try {
    const record = await SvolgimentoCategoria.findOne({ where: { categoriaId: id } });
    res.json(record || {});
  } catch (error) {
    logger.error(`Errore nel recupero dello svolgimento categoria ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      error: 'Errore nel recupero dello svolgimento categoria',
      details: error.message
    });
  }
};

