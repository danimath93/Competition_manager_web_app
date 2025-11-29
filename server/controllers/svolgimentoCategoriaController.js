const { SvolgimentoCategoria, SvolgimentoCategoriaAtleta, Categoria, Atleta, Club, ConfigTipoCategoria, Competizione } = require('../models');
const { Op } = require('sequelize');

// Avvia lo svolgimento di una categoria (idempotente)

exports.startSvolgimentoCategoria = async (req, res) => {
  try {
    const { categoriaId, competizioneId, letteraEstratta } = req.body;
    if (!categoriaId || !competizioneId || !letteraEstratta) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    const competizione = await Competizione.findByPk(competizioneId);

    if (!competizione) {
      return res.status(404).json({ error: "Competizione non trovata" });
    }

    // 2. Determina la lettera DEFINITIVA
    let lettera = competizione.letteraEstratta;

    if (!lettera) {
      // nessuna categoria è ancora partita → posso salvare nuova lettera
      lettera = letteraEstratta;
      await competizione.update({ letteraEstratta: lettera });
    }

    // Cerca se già esiste
    let svolg = await SvolgimentoCategoria.findOne({ where: { categoriaId, competizioneId } });
    if (!svolg) {
      svolg = await SvolgimentoCategoria.create({
        categoriaId,
        competizioneId,
        letteraEstratta,
        stato: 'nuovo'
      });
      // Prendi atleti dalla categoria
      const categoria = await Categoria.findByPk(categoriaId, {
        include: [{
          model: Atleta,
          as: 'atleti',
          through: { attributes: [] },
          include: [{ model: Club, as: 'club', attributes: ['denominazione'] }]
        }]
      });
      if (!categoria) return res.status(404).json({ error: 'Categoria non trovata' });
      // Crea snapshot atleti
      for (const atleta of categoria.atleti) {
        await SvolgimentoCategoriaAtleta.create({
          svolgimentoCategoriaId: svolg.id,
          atletaId: atleta.id,
          nome: atleta.nome,
          cognome: atleta.cognome,
          club: atleta.club ? atleta.club.denominazione : '',
          grado: atleta.grado || '',
          ordine: null,
          seed: null
        });
      }
      // Se tipo categoria = light contact, genera tabellone (semplificato)
      const tipoCat = await ConfigTipoCategoria.findByPk(categoria.tipoCategoriaId);
      if (tipoCat && /light\s*contact/i.test(tipoCat.nome)) {
        // Genera tabellone base (mock)
        svolg.tabellone = { rounds: [] };
        await svolg.save();
      }
    }
    res.json({ svolgimentoId: svolg.id });
  } catch (err) {
    res.status(500).json({ error: 'Errore avvio svolgimento categoria', details: err.message });
  }
};/*
exports.startSvolgimentoCategoria = async (req, res) => {
  try {
    const { categoriaId, competizioneId, letteraEstratta } = req.body;

    const competizione = await Competizione.findByPk(competizioneId);
    if (!competizione)
      return res.status(404).json({ error: "Competizione non trovata" });

    // LETTERA DEFINITIVA PER L'INTERA COMPETIZIONE
    let lettera = competizione.letteraEstratta;

    // se la lettera non esiste, la imposto ora
    if (!lettera) {
      lettera = letteraEstratta;
      await competizione.update({ letteraEstratta: lettera });
    }


    // controllo se esiste già lo svolgimento
    let svolg = await SvolgimentoCategoria.findOne({
      where: { categoriaId, competizioneId }
    });

    if (!svolg) {
      svolg = await SvolgimentoCategoria.create({
        categoriaId,
        competizioneId,
        letteraEstratta: lettera,
        stato: 'nuovo'
      });

      // CREAZIONE SNAPSHOT ATLETI
      // Prendi tutti gli IscrizioneAtleta per questa categoria e competizione
      const iscritti = await require('../models').IscrizioneAtleta.findAll({
        where: { categoriaId, competizioneId },
        include: [{ model: require('../models').Atleta, as: 'atleta', include: [{ model: require('../models').Club, as: 'club', attributes: ['denominazione'] }] }]
      });

      for (const i of iscritti) {
        const atleta = i.atleta;
        await SvolgimentoCategoriaAtleta.create({
          svolgimentoCategoriaId: svolg.id,
          atletaId: atleta.id,
          nome: atleta.nome,
          cognome: atleta.cognome,
          club: atleta.club ? atleta.club.denominazione : '',
          grado: atleta.grado || ''
        });
      }
    }

    return res.json({ svolgimentoId: svolg.id, lettera });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore avvio svolgimento" });
  }
};*/
// GET svolgimento categoria
exports.getSvolgimentoCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const svolg = await SvolgimentoCategoria.findByPk(id);
    if (!svolg) return res.status(404).json({ error: 'Svolgimento non trovato' });
    res.json(svolg);
  } catch (err) {
    res.status(500).json({ error: 'Errore get svolgimento categoria', details: err.message });
  }
};

// GET atleti snapshot
exports.getSvolgimentoCategoriaAtleti = async (req, res) => {
  try {
    const { id } = req.params;
    const atleti = await SvolgimentoCategoriaAtleta.findAll({ where: { svolgimentoCategoriaId: id } });
    res.json(atleti);
  } catch (err) {
    res.status(500).json({ error: 'Errore get atleti svolgimento', details: err.message });
  }
};

// PATCH svolgimento categoria (autosave)
exports.patchSvolgimentoCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { punteggi, commissione, classifica, tabellone, stato } = req.body;
    const svolg = await SvolgimentoCategoria.findByPk(id);
    if (!svolg) return res.status(404).json({ error: 'Svolgimento non trovato' });
    if (punteggi !== undefined) svolg.punteggi = punteggi;
    if (commissione !== undefined) svolg.commissione = commissione;
    if (classifica !== undefined) svolg.classifica = classifica;
    if (tabellone !== undefined) svolg.tabellone = tabellone;
    if (stato !== undefined) svolg.stato = stato;
    await svolg.save();
    res.json(svolg);
  } catch (err) {
    res.status(500).json({ error: 'Errore patch svolgimento categoria', details: err.message });
  }
};



exports.getSvolgimentiByCompetizione = async (req, res) => {
  try {
    const svolg = await SvolgimentoCategoria.findAll({
      where: { competizioneId: req.params.id }
    });
    
    return res.json(svolg);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero svolgimenti" });
  }
};