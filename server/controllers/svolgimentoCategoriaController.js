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

// genera tabellone server-side (semplice seeding)
exports.generateTabellone = async (req, res) => {
  try {
    const { id } = req.params; // svolgimentoId
    const svolg = await SvolgimentoCategoria.findByPk(id);
    if (!svolg) return res.status(404).json({ error: 'Svolgimento non trovato' });

    // prendi atleti snapshot
    const SvolgimentoCategoriaAtleta = require('../models').SvolgimentoCategoriaAtleta;
    const atletiSnap = await SvolgimentoCategoriaAtleta.findAll({ where: { svolgimentoCategoriaId: id }, order: [['id', 'ASC']] });
    const participants = atletiSnap.map(a => ({ id: a.atletaId, nome: a.nome, cognome: a.cognome }));

    // genera tabellone (stessa logica frontend)
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(Math.max(1, participants.length))));
    const matchesRound0 = [];
    let idx = 0;
    while (idx < participants.length) {
      const p1 = participants[idx] || null;
      const p2 = participants[idx + 1] || null;
      matchesRound0.push({
        id: `r0m${matchesRound0.length}`,
        players: [p1, p2],
        winner: null,
        from: []
      });
      idx += 2;
    }
    const rounds = [{ matches: matchesRound0 }];
    let prev = matchesRound0;
    let roundIdx = 1;
    while (prev.length > 1) {
      const cur = [];
      for (let i = 0; i < prev.length; i += 2) {
        const left = prev[i];
        const right = prev[i + 1] || null;
        cur.push({
          id: `r${roundIdx}m${cur.length}`,
          players: [null, null],
          winner: null,
          from: [left.id, right ? right.id : null]
        });
      }
      rounds.push({ matches: cur });
      prev = cur;
      roundIdx++;
    }

    const tabellone = { rounds };
    svolg.tabellone = tabellone;
    svolg.stato = 'in_progress';
    await svolg.save();
    return res.json(tabellone);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Errore generazione tabellone', details: err.message });
  }
};

// salva intero tabellone
exports.saveTabellone = async (req, res) => {
  try {
    const { id } = req.params;
    const { tabellone } = req.body;
    const svolg = await SvolgimentoCategoria.findByPk(id);
    if (!svolg) return res.status(404).json({ error: 'Svolgimento non trovato' });
    svolg.tabellone = tabellone;
    svolg.stato = 'in_progress';
    await svolg.save();
    return res.json(svolg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Errore salvataggio tabellone', details: err.message });
  }
};

// setta il vincitore di un match (matchId è stringa come 'r0m1')
exports.setMatchWinner = async (req, res) => {
  try {
    const { id, matchId } = req.params;
    const { winnerAtletaId } = req.body;
    const svolg = await SvolgimentoCategoria.findByPk(id);
    if (!svolg) return res.status(404).json({ error: 'Svolgimento non trovato' });
    const tab = svolg.tabellone || { rounds: [] };

    // trova match e imposta winner
    let found = false;
    for (let r = 0; r < tab.rounds.length; r++) {
      for (let mi = 0; mi < tab.rounds[r].matches.length; mi++) {
        const m = tab.rounds[r].matches[mi];
        if (m.id === matchId) {
          // trova l'oggetto atleta tra i players
          const winnerObj = (m.players || []).find(p => p && p.id === winnerAtletaId);
          if (!winnerObj) return res.status(400).json({ error: 'Atleta non presente nel match' });
          m.winner = winnerObj;
          found = true;

          // advance winner to next round
          if (r + 1 < tab.rounds.length) {
            const nextRound = tab.rounds[r + 1];
            for (const nm of nextRound.matches) {
              const idxFrom = nm.from ? nm.from.indexOf(m.id) : -1;
              if (idxFrom >= 0) {
                nm.players[idxFrom] = winnerObj;
              }
            }
          }
        }
      }
    }
    if (!found) return res.status(404).json({ error: 'Match non trovato' });
    
    // --- NUOVA VERSIONE SALVATAGGIO CLASSIFICA ---
    const finalRound = tab.rounds[tab.rounds.length - 1];
    const finalMatch = finalRound.matches[0];
    const finalWinner = finalMatch.winner;

    if (finalWinner) {
        
      const finalLoser = finalMatch.players.find(p => p && p.id !== finalWinner.id);

      // ---- Preleva semifinali ----
      const semiRound = tab.rounds[tab.rounds.length - 2];
      let semisLosers = [];

      if (semiRound) {
        for (const sm of semiRound.matches) {
          if (sm.winner) {
            const loser = sm.players.find(p => p && p.id !== sm.winner.id);
            if (loser) semisLosers.push(loser);
          } else {
            const loser = sm.players.find(p => p);
            if (loser) semisLosers.push(loser);
          }
        }
      }

      // ---- Determina tipo categoria ----
      const categoria = await Categoria.findByPk(svolg.categoriaId);
      const nomeCat = categoria.nome || "";
      const isQuyen = nomeCat.toLowerCase().startsWith("quyen");

      // ---- Costruisci nuova classifica finale ----
      let newClassifica = [];

      // 1° posto
      newClassifica.push({ pos: 1, atletaId: finalWinner.nome });

      // 2° posto
      if (finalLoser) {
        newClassifica.push({ pos: 2, atletaId: finalLoser.atletaId });
      }

      // 3° posto (quyen = 1 solo bronzo)
      if (isQuyen) {
        if (semisLosers.length > 0) {
          newClassifica.push({
            pos: 3,
            atletaId: semisLosers[0].atletaId
          });
        }
      } else {
        // light/fighting = 2 bronzi ex aequo
        for (const l of semisLosers) {
          newClassifica.push({ pos: 3, atletaId: l.atletaId });
        }
      }

      svolg.classifica = newClassifica;
      svolg.stato = "completato";

    } else {
      svolg.stato = "in_progress";
    }


    svolg.tabellone = tab;
    console.log(">> CLASSIFICA SALVATA:", JSON.stringify(computedClassifica, null, 2));
    svolg.classifica = computedClassifica;
    await svolg.save();


    return res.json({ tabellone: tab, classifica: computedClassifica, stato: svolg.stato });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Errore impostazione vincitore', details: err.message });
  }
};
