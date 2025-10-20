const { Categoria, IscrizioneAtleta, Atleta, Competizione, ConfigGruppoEta, ConfigTipoCategoria, ConfigGradoCintura } = require('../models');
const { Op } = require('sequelize');

// Genera categorie automaticamente basandosi sugli atleti iscritti
exports.generateCategories = async (req, res) => {
  try {
    const { competizioneId } = req.params;
    const { genere, gruppoEtaId, grado, tipoCategoriaId } = req.body;

    // Verifica che la competizione esista
    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione) {
      return res.status(404).json({ message: 'Competizione non trovata' });
    }

    // Recupera gli atleti iscritti alla competizione
    const iscrizioni = await IscrizioneAtleta.findAll({
      where: { 
        competizioneId,
        tipoCategoriaId,
        categoriaId: null // Solo atleti non ancora assegnati a categorie
      },
      include: [{
        model: Atleta,
        as: 'atleta',
        attributes: ['id', 'nome', 'cognome', 'dataNascita', 'peso'],
        include: [{
          model: ConfigGradoCintura,
          as: 'gradoCintura'
        }]
      }]
    });

    if (iscrizioni.length === 0) {
      return res.status(400).json({ message: 'Nessun atleta iscritto trovato per questa tipologia' });
    }

    // Recupera informazioni sul gruppo età
    const gruppoEta = await ConfigGruppoEta.findByPk(gruppoEtaId);
    if (!gruppoEta) {
      return res.status(404).json({ message: 'Gruppo età non trovato' });
    }

    // Organizza gli atleti in base ai criteri
    const categorieGenerate = {};
    const oggi = new Date();

    iscrizioni.forEach(iscrizione => {
      const atleta = iscrizione.atleta;
      
      // Calcola età
      const dataNascita = new Date(atleta.dataNascita);
      const eta = oggi.getFullYear() - dataNascita.getFullYear();
      
      // Verifica se l'atleta rientra nel gruppo età
      if (eta < gruppoEta.etaMinima || eta > gruppoEta.etaMassima) {
        return; // Salta questo atleta
      }

      // Determina la chiave della categoria
      let chiaveCategoria = gruppoEta.nome;
      
      // Aggiungi genere se richiesto
      if (genere !== 'U') {
        const genereAtleta = atleta.genere || 'U';
        if (genereAtleta !== genere && genere !== 'U') {
          return; // Salta se il genere non corrisponde
        }
        chiaveCategoria += `_${genere}`;
      }
      
      // Aggiungi grado se specificato
      if (grado && grado !== 'misto') {
        if (atleta.grado !== grado) {
          return; // Salta se il grado non corrisponde
        }
        chiaveCategoria += `_${grado}`;
      }

      // Inizializza la categoria se non esiste
      if (!categorieGenerate[chiaveCategoria]) {
        categorieGenerate[chiaveCategoria] = {
          nome: chiaveCategoria,
          atleti: [],
          genere: genere,
          gruppoEtaId: gruppoEtaId,
          grado: grado === 'misto' ? null : grado
        };
      }

      categorieGenerate[chiaveCategoria].atleti.push({
        id: atleta.id,
        nome: atleta.nome,
        cognome: atleta.cognome,
        dataNascita: atleta.dataNascita,
        peso: atleta.peso,
        grado: atleta.grado,
        iscrizioneId: iscrizione.id
      });
    });

    // Converti in array
    const risultato = Object.values(categorieGenerate);

    res.json({
      message: 'Categorie generate con successo',
      categorie: risultato,
      totaleAtleti: iscrizioni.length,
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
              model: ConfigGradoCintura,
              as: 'gradoCintura'
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
