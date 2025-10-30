const { min } = require('date-fns');
const { Categoria, IscrizioneAtleta, Atleta, Competizione, ConfigGruppoEta, ConfigTipoCategoria, ConfigTipoAtleta } = require('../models');
const { Op } = require('sequelize');

// Genera categorie automaticamente basandosi sugli atleti iscritti
exports.generateCategories = async (req, res) => {
  try {
    const { competizioneId } = req.params;

    // Verifica che la competizione esista
    const competition = await Competizione.findByPk(competizioneId);
    if (!competition) {
      return res.status(404).json({ message: 'Competizione non trovata' });
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
        attributes: ['id', 'nome', 'cognome', 'dataNascita', 'peso'],
        include: [{
          model: ConfigTipoAtleta,
          as: 'tipoAtleta'
        }]
      }]
    });

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'Nessun atleta iscritto trovato per questa tipologia' });
    }

    // Crea le categorie con eventuali preferenze di generazione
    const createdCategories = {};
    const today = new Date();
    const tipoAtletaMap = {};
    const tipiAtleta = await ConfigTipoAtleta.findAll();
    const gruppiEta = await ConfigGruppoEta.findAll();
    
    // Mappa i tipi atleta per ID
    tipiAtleta.forEach(tipo => {
      tipoAtletaMap[tipo.id] = tipo;
    });

    registrations.forEach(registration => {
      const athlete = registration.atleta;
      const birthDate = new Date(athlete.dataNascita);
      const age = today.getFullYear() - birthDate.getFullYear();
      const tipoAtleta = athlete.tipoAtleta;

      // Determina la chiave della categoria
      let categoryKey = registration.tipoCategoriaId.toString();

      // Aggiungi il gruppo di età alla chiave
      let groupAge = null;
      let athleteGroupAge = null;
      gruppiEta.forEach(gruppo => {
        if (age >= gruppo.etaMinima && age <= gruppo.etaMassima) {
          groupAge = gruppo.id;
          athleteGroupAge = gruppo;
        }
      });
      categoryKey += `_age_${groupAge || 'open'}`;

      // Aggiungi il genere alla chiave
      let gender = athlete.sesso || 'U';
      categoryKey += `_${gender}`;

      // Aggiungi il tipo atleta alla chiave
      let tipoAtletaNome = 'misto';
      if (tipoAtleta) {
        tipoAtletaNome = tipoAtleta.nome;
        categoryKey += `_tipo_${tipoAtleta.id}`;
      } else {
        categoryKey += `_tipo_misto`;
      }
      
      // Inizializza la categoria se non esiste
      if (!createdCategories[categoryKey]) {
        createdCategories[categoryKey] = {
          nome: `Cat ${registration.tipoCategoriaId} - ${athleteGroupAge ? athleteGroupAge.nome : 'Open'} - ${gender} - ${tipoAtletaNome}`,
          atleti: [],
          genere: gender,
          tipoAtletaId: tipoAtleta ? tipoAtleta.id : null,
          tipoAtletaNome: tipoAtletaNome,
          minAge: athleteGroupAge ? athleteGroupAge.etaMinima : null,
          maxAge: athleteGroupAge ? athleteGroupAge.etaMassima : null,
          tipoCategoriaId: registration.tipoCategoriaId
        };
      }

      createdCategories[categoryKey].atleti.push({
        id: athlete.id,
        nome: athlete.nome,
        cognome: athlete.cognome,
        dataNascita: athlete.dataNascita,
        peso: athlete.peso,
        tipoAtleta: tipoAtleta ? tipoAtleta.nome : null,
        iscrizioneId: registration.id
      });
    });

    // Converti in array
    const risultato = Object.values(createdCategories);

    res.json({
      message: 'Categorie generate con successo',
      categorie: risultato,
      totaleAtleti: registrations.length,
      totaleCategorie: risultato.length
    });

  } catch (error) {
    console.error('Errore nella generazione delle categorie:', error);
    res.status(500).json({ 
      message: 'Errore durante la generazione delle categorie',
      error: error.message 
    });
  }
};

// Salva le categorie sul database
exports.saveCategories = async (req, res) => {
  const transaction = await Categoria.sequelize.transaction();
  
  try {
    const { competizioneId } = req.params;
    const { categorie, tipoCategoriaId } = req.body;

    // Verifica che la competizione esista
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Competizione non trovata' });
    }

    const categorieSalvate = [];

    for (const categoria of categorie) {
      // Crea la categoria
      const nuovaCategoria = await Categoria.create({
        nome: categoria.nome,
        competizioneId: parseInt(competizioneId),
        tipoCategoriaId: tipoCategoriaId,
        genere: categoria.genere || 'U',
        gruppoEtaId: categoria.gruppoEtaId,
        grado: categoria.grado,
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

    res.status(201).json({
      message: 'Categorie salvate con successo',
      categorie: categorieSalvate
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Errore nel salvataggio delle categorie:', error);
    res.status(500).json({ 
      message: 'Errore durante il salvataggio delle categorie',
      error: error.message 
    });
  }
};

// Ottieni le categorie di una competizione
exports.getCategoriesByCompetizione = async (req, res) => {
  try {
    const { competizioneId } = req.params;

    const categorie = await Categoria.findAll({
      where: { competizioneId },
      include: [
        {
          model: ConfigGruppoEta,
          as: 'gruppoEta',
          attributes: ['id', 'nome', 'etaMinima', 'etaMassima']
        },
        {
          model: ConfigTipoCategoria,
          as: 'configTipoCategoria',
          attributes: ['id', 'nome']
        },
        {
          model: IscrizioneAtleta,
          as: 'iscrizioni',
          include: [{
            model: Atleta,
            as: 'atleta',
            attributes: ['id', 'nome', 'cognome', 'dataNascita', 'peso'],
            include: [{
              model: ConfigTipoAtleta,
              as: 'tipoAtleta'
            }]
          }]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(categorie);

  } catch (error) {
    console.error('Errore nel recupero delle categorie:', error);
    res.status(500).json({ 
      message: 'Errore durante il recupero delle categorie',
      error: error.message 
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
      return res.status(404).json({ message: 'Categoria non trovata' });
    }

    await categoria.update(updateData);

    res.json({
      message: 'Categoria aggiornata con successo',
      categoria
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento della categoria:', error);
    res.status(500).json({ 
      message: 'Errore durante l\'aggiornamento della categoria',
      error: error.message 
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
      return res.status(404).json({ message: 'Categoria non trovata' });
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

    res.json({ message: 'Categoria eliminata con successo' });

  } catch (error) {
    await transaction.rollback();
    console.error('Errore nell\'eliminazione della categoria:', error);
    res.status(500).json({ 
      message: 'Errore durante l\'eliminazione della categoria',
      error: error.message 
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
      return res.status(404).json({ message: 'Categoria target non trovata' });
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

    res.json({ message: 'Atleti spostati con successo' });

  } catch (error) {
    await transaction.rollback();
    console.error('Errore nello spostamento degli atleti:', error);
    res.status(500).json({ 
      message: 'Errore durante lo spostamento degli atleti',
      error: error.message 
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
      return res.status(404).json({ message: 'Una o entrambe le categorie non trovate' });
    }

    // Verifica che appartengano alla stessa competizione
    if (categoria1.competizioneId !== categoria2.competizioneId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Le categorie devono appartenere alla stessa competizione' });
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

    res.json({ 
      message: 'Categorie unite con successo',
      categoria: categoria1
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Errore nell\'unione delle categorie:', error);
    res.status(500).json({ 
      message: 'Errore durante l\'unione delle categorie',
      error: error.message 
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
      return res.status(404).json({ message: 'Categoria non trovata' });
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
      gruppoEtaId: categoriaOriginale.gruppoEtaId,
      grado: categoriaOriginale.grado,
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

    res.json({ 
      message: 'Categoria divisa con successo',
      categoria1: categoriaOriginale,
      categoria2: nuovaCategoria
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Errore nella divisione della categoria:', error);
    res.status(500).json({ 
      message: 'Errore durante la divisione della categoria',
      error: error.message 
    });
  }
};
