// CategoryInProgress.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { ArrowBack, Print, ArrowUpward, ArrowDownward, Shuffle } from '@mui/icons-material';
import { getSvolgimentoCategoria, patchSvolgimentoCategoria } from '../../api/svolgimentoCategorie';
import { useLocation } from "react-router-dom";
import { loadAllJudges } from '../../api/judges';
import { getCategoriesByCompetizione } from '../../api/categories';
import CategoryNotebookPrint from './print/CategoryNotebookPrint';
import { CompetitionTipology } from '../../constants/enums/CompetitionEnums';
import { CategoryStates } from '../../constants/enums/CategoryEnums';

const COMMISSIONE_LABELS = [
  'Capo Commissione',
  'Giudice 1',
  'Giudice 2',
  'Giudice 3',
  'Giudice 4',
  'Giudice 5',
  'Giudice di Riserva',
  '1° Addetto al Tavolo',
  '2° Addetto al Tavolo',
  '3° Addetto al Tavolo'
];

const CategoryInProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const svolgimentoId = searchParams.get('svolgimentoId');
  const categoriaNome = searchParams.get('categoriaNome');
  const competizioneId = searchParams.get("competizioneId");
  const tipoCompetizioneId = searchParams.get("tipoCompetizioneId");

  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [atleti, setAtleti] = useState([]);
  const [punteggi, setPunteggi] = useState({});
  const [commissione, setCommissione] = useState(Array(10).fill(''));
  const [classifica, setClassifica] = useState([]);
  const [tabellone, setTabellone] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [judges, setJudges] = useState([]);
  const [stato, setStato] = useState(CategoryStates.IN_DEFINIZIONE);
  const [manualLetter, setManualLetter] = useState('');
  const [orderedFightingAthletes, setOrderedFightingAthletes] = useState([]);

  useEffect(() => {
    if (!svolgimentoId) {
      setError('ID svolgimento mancante');
      setLoading(false);
      return;
    }
    loadSvolgimento();
    loadJudgesAndCategory();
  }, [svolgimentoId]);

  const loadSvolgimento = async () => {
    try {
      setLoading(true);
      const svolg = await getSvolgimentoCategoria(svolgimentoId);
      setLetter(svolg.letteraEstratta || '');
      setStato(svolg.stato || CategoryStates.IN_DEFINIZIONE);
      setPunteggi(svolg.punteggi || {});
      setCommissione(svolg.commissione || Array(10).fill(''));
      setClassifica(svolg.classifica || []);
      setTabellone(svolg.tabellone || null);

      const loadedAthletes = svolg.atleti || [];
      
      if (svolg.letteraEstratta) {
        const orderedAthletes = orderAthletesByKeyLetter(loadedAthletes, svolg.letteraEstratta);
        setAtleti(orderedAthletes);
      } else {
        setAtleti(loadedAthletes);
      }

      // Per combattimenti: inizializza l'ordine degli atleti e genera tabellone default se non presente
      if (tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO) {
        setOrderedFightingAthletes(loadedAthletes);
        
        // Genera tabellone di default se non esiste
        if (!svolg.tabellone || !svolg.tabellone.rounds || svolg.tabellone.rounds.length === 0) {
          const defaultBracket = generateTabelloneFromAtleti(loadedAthletes);
          setTabellone(defaultBracket);
        }
      }
    } catch (e) {
      setError('Errore nel caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const loadJudgesAndCategory = async () => {
    try {
      const [judgesData, categoriesData] = await Promise.all([
        loadAllJudges(),
        getCategoriesByCompetizione(competizioneId)
      ]);
      setJudges(judgesData || []);
      
      // Trova la categoria corrente dai dati caricati
      const categoryMatch = categoriesData.find(cat => cat.nome === decodeURIComponent(categoriaNome));
      if (categoryMatch) {
        setCurrentCategory(categoryMatch);
      }
    } catch (error) {
      console.error('Errore nel caricamento di judges e categoria:', error);
    }
  };

  const handleGoBack = () => {
    navigate(`/categories/execution?competizioneId=${competizioneId}`);
  };

  const handlePunteggioChange = (atletaId, votoIdx, value) => {
    const punteggiAtleti = punteggi;
    const prevAtleta = punteggiAtleti[atletaId] || [null, null, null, null, null];
    const newAtleta = [...prevAtleta];
    newAtleta[votoIdx] = value;
    const updated = { ...punteggiAtleti, [atletaId]: newAtleta };
    try {
      patchSvolgimentoCategoria(svolgimentoId, { punteggi: updated, stato: CategoryStates.IN_CORSO });
    } catch (e) {
      console.error('Errore salvataggio punteggi:', e);
    }
    setPunteggi(updated);
  };

  const handleCommissioneChange = (idx, value) => {
    setCommissione((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      patchSvolgimentoCategoria(svolgimentoId, { commissione: arr, stato: CategoryStates.IN_CORSO });
      return arr;
    });
  };

  const getMedia = (arr) => {
    const nums = (arr || []).map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (nums.length === 0) return '';
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  };

  const orderAthletesByKeyLetter = (atleti, keyLetter) => {
    if (!keyLetter) return atleti;

    // Ordina gli atleti alfabeticamente per cognome
    const orderedAthletes = [...(atleti || [])].sort((a, b) => {
      const nameA = (a.cognome || '').toUpperCase();
      const nameB = (b.cognome || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });

    // Ruota l'array in modo che i primi atleti siano quelli con la lettera estratta
    let orderedByLetter = [];
    let orderIdx = orderedAthletes.findIndex(a => (a.cognome || '').toUpperCase().startsWith(keyLetter.toUpperCase()));
    if (orderIdx !== -1) {
      orderedByLetter = [
        ...orderedAthletes.slice(orderIdx),
        ...orderedAthletes.slice(0, orderIdx)
      ];
    } else {
      // Se la lettera non corrisponde a nessun atleta, prende il primo cognome successivo con la lettera più vicina
      orderIdx = orderedAthletes.findIndex(a => (a.cognome || '').toUpperCase() > keyLetter.toUpperCase());
      orderedByLetter = orderIdx !== -1
        ? [
          ...orderedAthletes.slice(orderIdx),
          ...orderedAthletes.slice(0, orderIdx)
        ] : orderedAthletes;
    }
    return orderedByLetter;
  };

  // Handler per generare lettera casuale
  const handleGenerateRandomLetter = async () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    setLetter(randomLetter);
    const orderedAthletes = orderAthletesByKeyLetter(atleti, randomLetter);
    setAtleti(orderedAthletes);
    await patchSvolgimentoCategoria(svolgimentoId, { 
      letteraEstratta: randomLetter, 
      stato: CategoryStates.IN_DEFINIZIONE 
    });
  };

  // Handler per impostare lettera manuale
  const handleSetManualLetter = async () => {
    if (!manualLetter || manualLetter.length !== 1) {
      alert('Inserisci una lettera valida');
      return;
    }
    const upperLetter = manualLetter.toUpperCase();
    setLetter(upperLetter);
    const orderedAthletes = orderAthletesByKeyLetter(atleti, upperLetter);
    setAtleti(orderedAthletes);
    await patchSvolgimentoCategoria(svolgimentoId, { 
      letteraEstratta: upperLetter, 
      stato: CategoryStates.IN_DEFINIZIONE 
    });
    setManualLetter('');
  };

  // Handler per confermare la definizione e passare allo stato IN_ATTESA_DI_AVVIO
  const handleConfirmDefinition = async () => {
    if ((tipoCompetizioneId == CompetitionTipology.MANI_NUDE || tipoCompetizioneId == CompetitionTipology.ARMI) && !letter) {
      alert('Devi prima estrarre o impostare una lettera');
      return;
    }
    if (tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO && (!tabellone || !tabellone.rounds || tabellone.rounds.length === 0)) {
      alert('Devi prima generare il tabellone');
      return;
    }
    
    await patchSvolgimentoCategoria(svolgimentoId, { stato: CategoryStates.IN_ATTESA_DI_AVVIO });
    setStato(CategoryStates.IN_ATTESA_DI_AVVIO);
  };

  // Handler per avviare la categoria
  const handleStartCategory = async () => {
    await patchSvolgimentoCategoria(svolgimentoId, { stato: CategoryStates.IN_CORSO });
    setStato(CategoryStates.IN_CORSO);
  };

  useEffect(() => {
    if (tipoCompetizioneId != CompetitionTipology.MANI_NUDE && 
        tipoCompetizioneId != CompetitionTipology.ARMI)
        return;

    // costruiamo un array con { media, atleta: { id, nome, cognome, club } }
    const listaQuyen = orderAthletesByKeyLetter(atleti, letter).map(a => ({
      media: parseFloat(getMedia(punteggi[a.id])),
      atleta: {
        id: a?.id,
        nome: a?.nome,
        cognome: a?.cognome,
        club: a?.club || null
      }
    })).filter(x => !isNaN(x.media));

    // chiamiamo lo helper che costruisce il podio (computeQuyenPodium si aspetta questo formato)
    const nuovaClassifica = computeQuyenPodium(listaQuyen);

    // salviamo (formato: [{pos, atletaId}, ...]) nello stato e sul server
    setClassifica(nuovaClassifica);
    patchSvolgimentoCategoria(svolgimentoId, { classifica: nuovaClassifica });

    // eslint-disable-next-line
  }, [punteggi, atleti, letter, tipoCompetizioneId]);

  function computeQuyenPodium(listaQuyen) {
    if (!Array.isArray(listaQuyen)) return [];

    // Ordina per media decrescente
    const ordinati = [...listaQuyen].sort((a, b) => b.media - a.media);

    const classifica = [];

    if (ordinati[0]) classifica.push({ pos: 1, atletaId: ordinati[0].atleta.id });
    if (ordinati[1]) classifica.push({ pos: 2, atletaId: ordinati[1].atleta.id });
    if (ordinati[2]) classifica.push({ pos: 3, atletaId: ordinati[2].atleta.id });

    return classifica;
  }

  /* --- costruzione semplice del tabellone: rounds array con matches --- */
  const generateTabelloneFromAtleti = (atletiList) => {

    // round 0: matches pairing sequenzialmente
    const matchesRound0 = [];
    let idx = 0;
    while (idx < atletiList.length) {
      const p1 = atletiList[idx].id || null;
      const p2 = atletiList[idx + 1] ? atletiList[idx + 1].id : null;
      matchesRound0.push({
        id: `r0m${matchesRound0.length}`,
        players: [p1, p2],
        scores: {},
        winner: null,
        from: []
      });
      idx += 2;
    }

    // rounds successivi
    const rounds = [{ matches: matchesRound0 }];
    let prevMatches = matchesRound0;
    let roundIdx = 1;
    while (prevMatches.length > 1) {
      const curMatches = [];
      for (let i = 0; i < prevMatches.length; i += 2) {
        const left = prevMatches[i];
        const right = prevMatches[i + 1] || null;
        curMatches.push({
          id: `r${roundIdx}m${curMatches.length}`,
          players: [null, null],
          scores: {},
          winner: null,
          from: [left.id, right ? right.id : null]
        });
      }
      rounds.push({ matches: curMatches });
      prevMatches = curMatches;
      roundIdx += 1;
    }
    return { rounds };
  };

  const handleGenerateFightingTable = () => {
    const novo = generateTabelloneFromAtleti(orderedFightingAthletes);
    setTabellone(novo);
  };

  // Handler per spostare atleta su/giù nella lista di accoppiamenti
  const handleMoveFightingAthlete = (index, direction) => {
    const newList = [...orderedFightingAthletes];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setOrderedFightingAthletes(newList);
    
    // Rigenera automaticamente il tabellone con il nuovo ordine
    const updatedBracket = generateTabelloneFromAtleti(newList);
    setTabellone(updatedBracket);
  };

  // Handler per salvare il tabellone definitivo
  const handleSaveBracket = async () => {
    try {
      await patchSvolgimentoCategoria(svolgimentoId, { 
        tabellone, 
        stato: CategoryStates.IN_DEFINIZIONE 
      });
      alert('Tabellone salvato con successo');
    } catch (e) {
      console.error('Errore nel salvataggio del tabellone:', e);
      alert('Errore nel salvataggio del tabellone');
    }
  };

  /* --- aggiornamento giocatore in match (solo round 0 per editing) --- */
  const updateMatchPlayer = (rIdx, matchId, slotIdx, atletaId) => {
    setTabellone((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const round = copy.rounds[rIdx];
      const m = round.matches.find(x => x.id === matchId);
      if (!m) return prev;

      // reset winner + scores
      m.winner = null;
      m.scores = {};

      if (!atletaId) {
        m.players[slotIdx] = null;
      } else {
        m.players[slotIdx] = atletaId;
      }

      // Propagazione ai round successivi: reset players che dipendono da questo match
      for (let r = rIdx + 1; r < copy.rounds.length; r++) {
        for (const next of copy.rounds[r].matches) {
          const pos = next.from.indexOf(m.id);
          if (pos !== -1) {
            next.players[pos] = null;
            next.winner = null;
            next.scores = {};
          }
        }
      }

      patchSvolgimentoCategoria(svolgimentoId, {
        tabellone: copy,
        stato: CategoryStates.IN_CORSO
      });

      return copy;
    });
  };

  /* --- handleScoreChange (numero di round, calcolo automatico winner) --- */
  const handleScoreChange = (rIdx, matchId, atletaId, val) => {
    const score = parseInt(val);

    setTabellone((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const round = copy.rounds[rIdx];
      const match = round.matches.find(m => m.id === matchId);
      if (!match) return prev;

      match.scores = match.scores || {};
      match.scores[atletaId] = isNaN(score) ? null : score;

      const p1 = match?.players[0];
      const p2 = match?.players[1];

      if (p1 && p2) {
        const s1 = match.scores[p1];
        const s2 = match.scores[p2];

        if (s1 != null && s2 != null) {
          if (s1 > s2) {
            match.winner = match.players[0];
          } else if (s2 > s1) {
            match.winner = match.players[1];
          } else {
            match.winner = null;
          }
        }
      }

      // propaga il vincitore al turno successivo
      if (match.winner) {
        const nextRound = copy.rounds[rIdx + 1];
        if (nextRound) {
          nextRound.matches.forEach(nm => {
            const pos = nm.from.indexOf(match.id);
            if (pos !== -1) {
              nm.players[pos] = match.winner;
            }
          });
        }
      }

      // --- CALCOLO PODIO AUTOMATICO SE È LA FINALE ---
      const finalRound = copy.rounds[copy.rounds.length - 1];
      const finalMatch = finalRound.matches[0];

      if (finalMatch && finalMatch.winner) {
        // Resolve real ids per winner/loser e semis
        const finalWinnerReal = finalMatch.winner;
        const finalLoserPlayer = finalMatch.players.find(p => p && p !== finalMatch.winner);
        const finalLoserReal = finalLoserPlayer ? finalLoserPlayer : null;

        // semiclassificati: losers delle semifinali
        const semiRound = copy.rounds.length > 1 ? copy.rounds[copy.rounds.length - 2] : null;
        let semisReal = [];
        if (semiRound) {
          for (const sm of semiRound.matches) {
            if (sm.winner) {
              const loserSnapshot = sm.players.find(p => p && p !== sm.winner);
              if (loserSnapshot) {
                const rid = loserSnapshot;
                if (rid) semisReal.push(rid);
              }
            }
          }
        }

        // fallback quando pochi partecipanti: prendo real ids rimanenti che non sono primi/secondi
        const used = new Set([finalWinnerReal, finalLoserReal].filter(Boolean));
        semisReal = semisReal.filter(rid => rid && !used.has(rid));
        if (semisReal.length < 2) {
          const allReal = atleti.map(a => a.id).filter(Boolean);
          for (const rid of allReal) {
            if (semisReal.length >= 2) break;
            if (!used.has(rid) && !semisReal.includes(rid)) semisReal.push(rid);
          }
        }

        // dedup e limit
        const uniqueSemis = [];
        for (const rid of semisReal) {
          if (!uniqueSemis.includes(rid)) uniqueSemis.push(rid);
          if (uniqueSemis.length >= 2) break;
        }

        // costruzione classifica usando sempre realId
        let classificaToSave = [];
        if (tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO) {
          classificaToSave = [
            finalWinnerReal ? { pos: 1, atletaId: finalWinnerReal } : null,
            finalLoserReal ? { pos: 2, atletaId: finalLoserReal } : null,
            uniqueSemis[0] ? { pos: 3, atletaId: uniqueSemis[0] } : null,
            uniqueSemis[1] ? { pos: 3, atletaId: uniqueSemis[1] } : null,
          ].filter(Boolean);
        } else {
          // quyen / other: solo 1 terzo
          classificaToSave = [
            finalWinnerReal ? { pos: 1, atletaId: finalWinnerReal } : null,
            finalLoserReal ? { pos: 2, atletaId: finalLoserReal } : null,
            uniqueSemis[0] ? { pos: 3, atletaId: uniqueSemis[0] } : null,
          ].filter(Boolean);
        }

        console.log("Classifica finale salvata:", classificaToSave);

        patchSvolgimentoCategoria(svolgimentoId, {
          classifica: classificaToSave,
          stato: CategoryStates.CONCLUSA
        });

        setClassifica(classificaToSave);
      }

      // Caso BYE: un solo giocatore -> auto-winner e propagate
      if (match.players[0] && !match.players[1]) {
        match.winner = match.players[0];

        const nextRound = copy.rounds[rIdx + 1];
        if (nextRound) {
          nextRound.matches.forEach(nm => {
            const pos = nm.from.indexOf(match.id);
            if (pos !== -1) {
              nm.players[pos] = match.winner;
            }
          });
        }
      }

      patchSvolgimentoCategoria(svolgimentoId, { tabellone: copy, stato: CategoryStates.IN_CORSO });
      return copy;
    });
  };

  const getAthleteById = (id) => {
    return atleti.find(a => a.id === id) || null;
  }

  const getClassifiedAthlete = (position) => {
    const entry = classifica.find(c => c.pos === position);
    if (!entry) return null;
    return renderAthleteData(entry.atletaId);
  }

  const renderAthleteData = (id, field) => {
    const atleta = getAthleteById(id);
    if (!atleta) return '-';
    if (field && atleta[field]) {
      if (field === 'club' && atleta[field]?.denominazione) {
        return atleta[field].denominazione;
      }
      else {
        return atleta[field];
      }
    }
    return `${atleta.nome} ${atleta.cognome}`;
  }

  const getRoundName = (roundIndex, totalRounds, matchesCount) => {
    if (roundIndex === totalRounds - 1) return "Finale";
    if (roundIndex === totalRounds - 2) return "Semifinale";
    if (matchesCount >= 8) return "Ottavi di finale";
    if (matchesCount < 8) return "Quarti di finale";
    return `Turno ${roundIndex + 1}`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mt: 2 }}>
          Indietro
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={handleGoBack}>
            Indietro
          </Button>
          <Button 
            variant="contained" 
            color="info" 
            startIcon={<Print />}
            onClick={() => setShowPrintModal(true)}
          >
            Stampa Quaderno di Gara
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          Svolgimento Categoria
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {categoriaNome && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            <b>{categoriaNome}</b>
          </Typography>
        )}
        
        {/* Status indicator */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1"><b>Stato:</b></Typography>
          <Chip 
            label={stato} 
            color={
              stato === CategoryStates.IN_DEFINIZIONE ? 'warning' :
              stato === CategoryStates.IN_ATTESA_DI_AVVIO ? 'info' :
              stato === CategoryStates.IN_CORSO ? 'primary' : 'default'
            }
          />
        </Box>

        {/* State transition buttons */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          {stato === CategoryStates.IN_DEFINIZIONE && (
            <Button 
              variant="contained" 
              color="success"
              onClick={handleConfirmDefinition}
            >
              Conferma Definizione
            </Button>
          )}
          {stato === CategoryStates.IN_ATTESA_DI_AVVIO && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleStartCategory}
            >
              Avvia Categoria
            </Button>
          )}
        </Box>
      </Box>

      {/* IN_DEFINIZIONE: MANI_NUDE / ARMI */}
      {stato === CategoryStates.IN_DEFINIZIONE && 
       (tipoCompetizioneId == CompetitionTipology.MANI_NUDE || tipoCompetizioneId == CompetitionTipology.ARMI) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Definizione Ordine di Esecuzione
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <Typography variant="body1">
              <b>Lettera estratta:</b> {letter || 'Non ancora estratta'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              startIcon={<Shuffle />}
              onClick={handleGenerateRandomLetter}
            >
              Estrai Lettera Casuale
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Lettera Manuale"
                value={manualLetter}
                onChange={(e) => setManualLetter(e.target.value.toUpperCase())}
                size="small"
                sx={{ width: 100 }}
                inputProps={{ maxLength: 1 }}
              />
              <Button 
                variant="outlined"
                onClick={handleSetManualLetter}
              >
                Imposta
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            <b>Ordine di Esecuzione Atleti:</b>
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Cognome</b></TableCell>
                  <TableCell><b>Nome</b></TableCell>
                  <TableCell><b>Club</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderAthletesByKeyLetter(atleti, letter).map((atleta, idx) => (
                  <TableRow key={atleta.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{atleta.cognome}</TableCell>
                    <TableCell>{atleta.nome}</TableCell>
                    <TableCell>{atleta.club?.denominazione || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* IN_DEFINIZIONE: COMBATTIMENTO */}
      {stato === CategoryStates.IN_DEFINIZIONE && tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ordine Accoppiamenti
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Modifica l'ordine degli atleti per definire gli accoppiamenti del tabellone. 
                Il tabellone si aggiorna automaticamente.
              </Typography>

              <List dense>
                {orderedFightingAthletes.map((atleta, idx) => (
                  <ListItem 
                    key={atleta.id}
                    sx={{ 
                      bgcolor: idx % 2 === 0 ? 'action.hover' : 'background.paper',
                      borderRadius: 1,
                      mb: 0.5
                    }}
                    secondaryAction={
                      <Box>
                        <IconButton 
                          size="small"
                          onClick={() => handleMoveFightingAthlete(idx, 'up')}
                          disabled={idx === 0}
                        >
                          <ArrowUpward />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleMoveFightingAthlete(idx, 'down')}
                          disabled={idx === orderedFightingAthletes.length - 1}
                        >
                          <ArrowDownward />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${idx + 1}. ${atleta.cognome} ${atleta.nome}`}
                      secondary={
                        <>
                          {atleta.club?.denominazione || '-'}
                          {atleta.peso && ` • Peso: ${atleta.peso} kg`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={handleSaveBracket}
                  fullWidth
                >
                  Salva Tabellone
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Anteprima Tabellone
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Bracket visualization */}
              {tabellone && tabellone.rounds && tabellone.rounds.length > 0 ? (
                <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
                  <Box sx={{ display: 'flex', gap: 2, minWidth: 'fit-content', pb: 2 }}>
                    {tabellone.rounds.map((round, roundIndex) => {
                      const matchHeight = 60 * Math.pow(2, roundIndex);
                      
                      return (
                        <Box key={roundIndex} sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                          {/* Round label */}
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              textAlign: 'center',
                              mb: 1,
                              bgcolor: 'primary.main',
                              color: 'white',
                              py: 0.5,
                              borderRadius: 1
                            }}
                          >
                            {getRoundName(roundIndex, tabellone.rounds.length, round.matches.length)}
                          </Typography>

                          {/* Matches */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-around' }}>
                            {round.matches.map((match, matchIndex) => {
                              const player1 = getAthleteById(match.players[0]);
                              const player2 = getAthleteById(match.players[1]);

                              return (
                                <Box
                                  key={match.id}
                                  sx={{
                                    height: `${matchHeight}px`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    mb: roundIndex === 0 ? 1 : 0
                                  }}
                                >
                                  <Box
                                    sx={{
                                      border: '2px solid',
                                      borderColor: 'grey.400',
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      bgcolor: 'white',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      boxShadow: 1
                                    }}
                                  >
                                    {/* Player 1 */}
                                    <Box
                                      sx={{
                                        height: '50%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        p: 1,
                                        borderBottom: '1px solid',
                                        borderColor: 'grey.300',
                                        bgcolor: player1 ? 'white' : 'grey.50'
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: '0.7rem',
                                          fontWeight: player1 ? 'bold' : 'normal',
                                          lineHeight: 1.2,
                                          color: player1 ? 'text.primary' : 'text.disabled'
                                        }}
                                      >
                                        {player1 ? `${player1.cognome} ${player1.nome}` : 'TBD'}
                                      </Typography>
                                      {player1?.club?.denominazione && (
                                        <Typography
                                          sx={{
                                            fontSize: '0.6rem',
                                            color: 'text.secondary',
                                            fontStyle: 'italic',
                                            lineHeight: 1.1,
                                            mt: 0.3
                                          }}
                                        >
                                          {player1.club.denominazione}
                                        </Typography>
                                      )}
                                    </Box>

                                    {/* Player 2 */}
                                    <Box
                                      sx={{
                                        height: '50%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        p: 1,
                                        bgcolor: player2 ? 'white' : 'grey.50'
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: '0.7rem',
                                          fontWeight: player2 ? 'bold' : 'normal',
                                          lineHeight: 1.2,
                                          color: player2 ? 'text.primary' : 'text.disabled'
                                        }}
                                      >
                                        {player2 ? `${player2.cognome} ${player2.nome}` : 'TBD'}
                                      </Typography>
                                      {player2?.club?.denominazione && (
                                        <Typography
                                          sx={{
                                            fontSize: '0.6rem',
                                            color: 'text.secondary',
                                            fontStyle: 'italic',
                                            lineHeight: 1.1,
                                            mt: 0.3
                                          }}
                                        >
                                          {player2.club.denominazione}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Connection line to next round */}
                                  {roundIndex < tabellone.rounds.length - 1 && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        right: -16,
                                        top: '50%',
                                        width: 16,
                                        height: 2,
                                        bgcolor: 'grey.400',
                                        transform: 'translateY(-50%)'
                                      }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  Nessun tabellone disponibile. Carica gli atleti per generare il tabellone automaticamente.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* IN_ATTESA_DI_AVVIO / IN_CORSO: MANI_NUDE / ARMI */}
      {(stato === CategoryStates.IN_ATTESA_DI_AVVIO || stato === CategoryStates.IN_CORSO) &&
       (tipoCompetizioneId == CompetitionTipology.MANI_NUDE || tipoCompetizioneId == CompetitionTipology.ARMI) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tabella Punteggi (Lettera: <b>{letter || '-'}</b>)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome Atleta</TableCell>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <TableCell key={n}>Voto {n}</TableCell>
                      ))}
                      <TableCell>Totale</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderAthletesByKeyLetter(atleti, letter).map((atleta) => (
                      <TableRow key={atleta.id}>
                        <TableCell>{atleta.nome} {atleta.cognome}</TableCell>
                        {[0, 1, 2, 3, 4].map((vIdx) => (
                          <TableCell key={vIdx}>
                            <TextField
                              type="number"
                              inputProps={{ min: 0, max: 9.9, step: 0.1 }}
                              value={punteggi[atleta.id]?.[vIdx] || ''}
                              onChange={(e) => handlePunteggioChange(atleta.id, vIdx, e.target.value)}
                              size="small"
                              sx={{ width: 70 }}
                              disabled={stato !== CategoryStates.IN_CORSO}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          {getMedia(punteggi[atleta.id])}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                CLASSIFICA
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Classifica</TableCell>
                      <TableCell>Nome e Cognome</TableCell>
                      <TableCell>Club</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[0, 1, 2].map((idx) => {
                      const entry = classifica[idx];
                      const atletaId = entry ? entry.atletaId : null;
                      const atletaObj = atletaId ? atleti.find(a => a.id === atletaId || a.atletaId === atletaId) : null;
                      return (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            {atletaObj ? `${atletaObj?.nome} ${atletaObj?.cognome}` : ''}
                          </TableCell>
                          <TableCell>
                            {atletaObj?.club?.denominazione || ''}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                COMMISSIONE
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Qualifica</TableCell>
                      <TableCell>Nome e Cognome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {COMMISSIONE_LABELS.map((label, idx) => (
                      <TableRow key={label}>
                        <TableCell>{label}</TableCell>
                        <TableCell>
                          <TextField
                            value={commissione[idx] || ''}
                            onChange={(e) => handleCommissioneChange(idx, e.target.value)}
                            size="small"
                            sx={{ width: 180 }}
                            disabled={stato !== CategoryStates.IN_CORSO}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* IN_ATTESA_DI_AVVIO / IN_CORSO: COMBATTIMENTO */}
      {(stato === CategoryStates.IN_ATTESA_DI_AVVIO || stato === CategoryStates.IN_CORSO) &&
       tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tabellone Incontri
          </Typography>

          {stato === CategoryStates.IN_CORSO && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setEditing((e) => !e)}
              >
                {editing ? 'Fine modifica' : 'Modifica'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  patchSvolgimentoCategoria(svolgimentoId, { tabellone, stato: CategoryStates.IN_CORSO });
                }}
              >
                Salva tabellone
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', overflowX: 'auto' }}>
            {tabellone && tabellone.rounds && tabellone.rounds.map((round, rIdx) => (
              <Paper key={`round-${rIdx}`} sx={{ p: 2, minWidth: 220 }}>
                <Typography variant="subtitle1">
                  {getRoundName(rIdx, tabellone.rounds.length, round.matches.length)}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {round.matches.map((m) => (
                  <Box key={m.id} sx={{ mb: 1, p: 1, border: '1px dashed rgba(0,0,0,0.08)', borderRadius: 1 }}>
                    <Typography variant="body2">Match {m.id}</Typography>

                    {editing ? (
                      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                        <TextField
                          select
                          SelectProps={{ native: true }}
                          size="small"
                          value={m?.players[0] || ""}
                          onChange={(e) =>
                            updateMatchPlayer(rIdx, m.id, 0, e.target.value ? parseInt(e.target.value) : null)
                          }
                        >
                          <option value="">-- vuoto --</option>
                          {atleti.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nome} {a.cognome}
                            </option>
                          ))}
                        </TextField>

                        <TextField
                          select
                          SelectProps={{ native: true }}
                          size="small"
                          value={m.players[1] || ""}
                          onChange={(e) =>
                            updateMatchPlayer(rIdx, m.id, 1, e.target.value ? parseInt(e.target.value) : null)
                          }
                        >
                          <option value="">-- vuoto --</option>
                          {atleti.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nome} {a.cognome}
                            </option>
                          ))}
                        </TextField>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              border: "3px solid red",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              minWidth: 160,
                              textAlign: "center",
                              fontWeight: 600
                            }}
                          >
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                              <span style={{ fontWeight: 600 }}>
                                {renderAthleteData(m.players[0])}
                              </span>
                              <span style={{ fontSize: "11px", marginTop: 2 }}>
                                {renderAthleteData(m.players[0], "club")}
                              </span>
                            </Box>
                          </Box>

                          {m.players[0] ? (
                            <TextField
                              type="number"
                              size="small"
                              sx={{ width: 70 }}
                              value={m.scores?.[m.players[0]] ?? ""}
                              onChange={(e) =>
                                handleScoreChange(rIdx, m.id, m.players[0], e.target.value)
                              }
                              disabled={stato !== CategoryStates.IN_CORSO}
                            />
                          ) : (rIdx === 0 ? <Typography sx={{ fontStyle: "italic" }}>BYE</Typography> : <></>)}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              border: "3px solid blue",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              minWidth: 160,
                              textAlign: "center",
                              fontWeight: 600
                            }}
                          >
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                              <span style={{ fontWeight: 600 }}>
                                {renderAthleteData(m.players[1])}
                              </span>
                              <span style={{ fontSize: "11px", marginTop: 2 }}>
                                {renderAthleteData(m.players[1], "club")}
                              </span>
                            </Box>
                          </Box>

                          {m.players[1] ? (
                            <TextField
                              type="number"
                              size="small"
                              sx={{ width: 70 }}
                              value={m.scores?.[m.players[1]] ?? ""}
                              onChange={(e) =>
                                handleScoreChange(rIdx, m.id, m.players[1], e.target.value)
                              }
                              disabled={stato !== CategoryStates.IN_CORSO}
                            />
                          ) : (rIdx === 0 ? <Typography sx={{ fontStyle: "italic" }}>BYE</Typography> : <></>)}
                        </Box>

                      </Box>
                    )}

                    {m.winner && (
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        Vincitore: {renderAthleteData(m.winner)}
                      </Typography>
                    )}

                  </Box>
                ))}
              </Paper>
            ))}

            {/* classifica a destra */}
            <Paper sx={{ p: 2, minWidth: 260 }}>
              <Typography variant="h6">PODIO</Typography>
              <Divider sx={{ mb: 1 }} />
              <Box>
                <Typography><b>1°</b> {getClassifiedAthlete(1)}</Typography>
                <Typography><b>2°</b> {getClassifiedAthlete(2)}</Typography>
                <Typography><b>3°</b> {getClassifiedAthlete(3)}</Typography>
              </Box>
            </Paper>
          </Box>
        </Paper>
      )}

      {(tipoCompetizioneId != CompetitionTipology.MANI_NUDE && 
        tipoCompetizioneId != CompetitionTipology.ARMI && 
        tipoCompetizioneId !=  CompetitionTipology.COMBATTIMENTO) && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            La gestione dello svolgimento per questa tipologia di competizione non è ancora attiva.
          </Alert>
        </Paper>
      )}

      {/* Competition Notebook Print Modal */}
      <CategoryNotebookPrint
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        category={currentCategory}
        tabellone={tabellone}
        judges={judges}
      />
    </Container>
  );
};

export default CategoryInProgress;