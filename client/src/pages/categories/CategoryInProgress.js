// CategoryInProgress.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper  
} from '@mui/material';
import MuiButton from '@mui/material/Button';
import { FaTags } from 'react-icons/fa';
import { ArrowBack, Print } from '@mui/icons-material';
import { getSvolgimentoCategoria, patchSvolgimentoCategoria } from '../../api/svolgimentoCategorie';
import { loadAllJudges } from '../../api/judges';
import { getCategoriesByCompetizione } from '../../api/categories';
import CategoryNotebookPrint from './print/CategoryNotebookPrint';
import PageHeader from '../../components/PageHeader';
import { CompetitionTipology } from '../../constants/enums/CompetitionEnums';
import { CategoryStates } from '../../constants/enums/CategoryEnums';

// Importazione componenti modulari
import QuyenDefinition from './category-execution/quyen/QuyenDefinition';
import QuyenExecution from './category-execution/quyen/QuyenExecution';
import FightingDefinition from './category-execution/fighting/FightingDefinition';
import FightingExecution from './category-execution/fighting/FightingExecution';

const CategoryInProgress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const svolgimentoId = searchParams.get('svolgimentoId');
  const categoriaNome = searchParams.get('categoriaNome');
  const competizioneId = searchParams.get("competizioneId");
  const tipoCompetizioneId = searchParams.get("tipoCompetizioneId");

  // Stati principali
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stato, setStato] = useState(CategoryStates.IN_DEFINIZIONE);
  
  // Dati categoria
  const [atleti, setAtleti] = useState([]);
  const [letter, setLetter] = useState('');
  const [punteggi, setPunteggi] = useState({});
  const [commissione, setCommissione] = useState(Array(10).fill(''));
  const [classifica, setClassifica] = useState([]);
  const [tabellone, setTabellone] = useState(null);
  
  // Altri stati
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [judges, setJudges] = useState([]);

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
      setAtleti(svolg.atleti || []);
      
      // Genera tabellone di default per combattimenti se non presente
      if (tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO) {
        if (!svolg.tabellone || !svolg.tabellone.rounds || svolg.tabellone.rounds.length === 0) {
          const defaultBracket = generateTabelloneFromAtleti(svolg.atleti || []);
          setTabellone(defaultBracket);
        }
      }
    } catch (e) {
      setError('Errore nel caricamento dati');
      console.error(e);
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

  // Genera tabellone per combattimenti
  const generateTabelloneFromAtleti = (atletiList) => {
    const matchesRound0 = [];
    let idx = 0;
    
    while (idx < atletiList.length) {
      const p1 = atletiList[idx]?.id || null;
      const p2 = atletiList[idx + 1]?.id || null;
      matchesRound0.push({
        id: `r0m${matchesRound0.length}`,
        players: [p1, p2],
        scores: {},
        winner: null,
        from: []
      });
      idx += 2;
    }

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

  // Handler per cambio lettera (Quyen/Armi)
  const handleLetterChange = async (newLetter) => {
    setLetter(newLetter);
    await patchSvolgimentoCategoria(svolgimentoId, { 
      letteraEstratta: newLetter, 
      stato: CategoryStates.IN_DEFINIZIONE 
    });
  };

  // Handler per cambio tabellone (Combattimenti)
  const handleTabelloneChange = (newTabellone) => {
    setTabellone(newTabellone);
  };

  // Handler per conferma definizione
  const handleConfirmDefinition = async () => {
    if ((tipoCompetizioneId == CompetitionTipology.MANI_NUDE || tipoCompetizioneId == CompetitionTipology.ARMI) && !letter) {
      alert('Devi prima estrarre o impostare una lettera');
      return;
    }
    if (tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO && (!tabellone || !tabellone.rounds || tabellone.rounds.length === 0)) {
      alert('Devi prima generare il tabellone');
      return;
    }
    
    const updates = { stato: CategoryStates.IN_ATTESA_DI_AVVIO };
    if (tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO) {
      updates.tabellone = tabellone;
    }
    
    await patchSvolgimentoCategoria(svolgimentoId, updates);
    setStato(CategoryStates.IN_ATTESA_DI_AVVIO);
  };

  // Handler per avvio categoria
  const handleStartCategory = async () => {
    await patchSvolgimentoCategoria(svolgimentoId, { stato: CategoryStates.IN_CORSO });
    setStato(CategoryStates.IN_CORSO);
  };

  // Handler per cambio punteggio (Quyen/Armi)
  const handlePunteggioChange = async (atletaId, votoIdx, value) => {
    const punteggiAtleti = { ...punteggi };
    const prevAtleta = punteggiAtleti[atletaId] || [null, null, null, null, null];
    const newAtleta = [...prevAtleta];
    newAtleta[votoIdx] = value;
    const updated = { ...punteggiAtleti, [atletaId]: newAtleta };
    
    setPunteggi(updated);
    
    try {
      // Calcola classifica
      const listaQuyen = atleti.map(a => ({
        media: parseFloat(getMedia(updated[a.id])),
        atleta: { id: a.id, nome: a.nome, cognome: a.cognome, club: a.club || null }
      })).filter(x => !isNaN(x.media));

      const nuovaClassifica = computeQuyenPodium(listaQuyen);
      setClassifica(nuovaClassifica);

      await patchSvolgimentoCategoria(svolgimentoId, { 
        punteggi: updated, 
        classifica: nuovaClassifica,
        stato: CategoryStates.IN_CORSO 
      });
    } catch (e) {
      console.error('Errore salvataggio punteggi:', e);
    }
  };

  const getMedia = (arr) => {
    const nums = (arr || []).map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (nums.length === 0) return '';
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  };

  const computeQuyenPodium = (listaQuyen) => {
    if (!Array.isArray(listaQuyen)) return [];
    const ordinati = [...listaQuyen].sort((a, b) => b.media - a.media);
    const classifica = [];
    if (ordinati[0]) classifica.push({ pos: 1, atletaId: ordinati[0].atleta.id });
    if (ordinati[1]) classifica.push({ pos: 2, atletaId: ordinati[1].atleta.id });
    if (ordinati[2]) classifica.push({ pos: 3, atletaId: ordinati[2].atleta.id });
    return classifica;
  };

  // Handler per cambio commissione (Quyen/Armi)
  const handleCommissioneChange = async (idx, value) => {
    const arr = [...commissione];
    arr[idx] = value;
    setCommissione(arr);
    await patchSvolgimentoCategoria(svolgimentoId, { commissione: arr, stato: CategoryStates.IN_CORSO });
  };

  // Handler per aggiornamento svolgimento (Combattimenti)
  const handleUpdateSvolgimento = async (updates) => {
    if (updates.tabellone) setTabellone(updates.tabellone);
    if (updates.classifica) setClassifica(updates.classifica);
    if (updates.stato) setStato(updates.stato);
    
    await patchSvolgimentoCategoria(svolgimentoId, updates);
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

  // Determina se è una competizione Quyen/Armi o Combattimento
  const isQuyenCompetition = 
    tipoCompetizioneId == CompetitionTipology.MANI_NUDE || 
    tipoCompetizioneId == CompetitionTipology.ARMI;
  const isFightingCompetition = tipoCompetizioneId == CompetitionTipology.COMBATTIMENTO;

  // Determina quale componente mostrare in base a tipo e stato
  const showDefinitionPhase = 
    stato === CategoryStates.IN_DEFINIZIONE || 
    stato === CategoryStates.IN_ATTESA_DI_AVVIO;
  const showExecutionPhase = 
    stato === CategoryStates.IN_CORSO || 
    stato === CategoryStates.CONCLUSA;

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTags}
        title={`${decodeURIComponent(categoriaNome)}`}
        subtitle="Svolgimento categoria"
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna a tutte le categorie
      </MuiButton>
    
      {/* Lista categorie */}
      <Paper sx={{ width: '100%', height: '100%', p:3 }}>
        <Typography variant="h4" gutterBottom>
          Svolgimento Categoria
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {categoriaNome && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            <b>{decodeURIComponent(categoriaNome)}</b>
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
              stato === CategoryStates.IN_CORSO ? 'primary' : 'success'
            }
          />
        </Box>

        {/* State transition buttons */}
        {stato === CategoryStates.IN_ATTESA_DI_AVVIO && (
          <Box sx={{ mb: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleStartCategory}
              size="large"
            >
              Avvia Categoria
            </Button>
          </Box>
        )}

        {/* Componenti condizionali in base a tipo competizione e stato */}
        {isQuyenCompetition && showDefinitionPhase && (
          <QuyenDefinition
            atleti={atleti}
            letter={letter}
            stato={stato}
            onLetterChange={handleLetterChange}
            onConfirmDefinition={handleConfirmDefinition}
            onUpdateSvolgimento={handleUpdateSvolgimento}
          />
        )}

        {isQuyenCompetition && showExecutionPhase && (
          <QuyenExecution
            atleti={atleti}
            letter={letter}
            punteggi={punteggi}
            commissione={commissione}
            classifica={classifica}
            stato={stato}
            onPunteggioChange={handlePunteggioChange}
            onCommissioneChange={handleCommissioneChange}
          />
        )}

        {isFightingCompetition && showDefinitionPhase && (
          <FightingDefinition
            atleti={atleti}
            tabellone={tabellone}
            stato={stato}
            onTabelloneChange={handleTabelloneChange}
            onConfirmDefinition={handleConfirmDefinition}
          />
        )}

        {isFightingCompetition && showExecutionPhase && (
          <FightingExecution
            atleti={atleti}
            tabellone={tabellone}
            classifica={classifica}
            stato={stato}
            onTabelloneChange={handleTabelloneChange}
            onUpdateSvolgimento={handleUpdateSvolgimento}
          />
        )}

        {!isQuyenCompetition && !isFightingCompetition && (
          <Alert severity="info">
            La gestione dello svolgimento per questa tipologia di competizione non è ancora attiva.
          </Alert>
        )}

        {/* Competition Notebook Print Modal */}
        <CategoryNotebookPrint
          open={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          category={currentCategory}
          tabellone={tabellone}
          judges={judges}
        />
      </Paper>
    </div>
  );
};

export default CategoryInProgress;