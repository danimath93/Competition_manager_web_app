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
  Tooltip
} from '@mui/material';
import MuiButton from '@mui/material/Button';
import { FaTags } from 'react-icons/fa';
import { ArrowBack, Print, Delete } from '@mui/icons-material';
import { getSvolgimentoCategoria, patchSvolgimentoCategoria } from '../../api/svolgimentoCategorie';
import { loadAllJudges } from '../../api/judges';
import { getCategoriesByCompetizione } from '../../api/categories';
import CategoryNotebookPrint from './print/CategoryNotebookPrint';
import PageHeader from '../../components/PageHeader';
import AuthComponent from '../../components/AuthComponent';
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
      if (tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO.toString()) {
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
      const categoriesPromise = getCategoriesByCompetizione(competizioneId, false);
      
      const [judgesData, categoriesData] = await Promise.all([
        loadAllJudges(),
        categoriesPromise
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
    const numAtleti = atletiList.length;
    if (numAtleti < 2) return { rounds: [] };
    
    // Calcola il numero di match necessari nel primo round
    // Formula: 2^(ceil(log2(numAtleti)) - 1)
    // Es: 5 atleti -> ceil(log2(5)) = 3, quindi 2^(3-1) = 4 match (8 posizioni, 3 BYE)
    const numMatchesFirstRound = Math.pow(2, Math.ceil(Math.log2(numAtleti)) - 1);
    
    // Crea i match del primo round
    const matchesRound0 = [];
    let atletaIdx = 0;
    
    for (let i = 0; i < numMatchesFirstRound; i++) {
      const p1 = atletaIdx < numAtleti ? atletiList[atletaIdx]?.id || null : null;
      atletaIdx++;
      const p2 = atletaIdx < numAtleti ? atletiList[atletaIdx]?.id || null : null;
      atletaIdx++;
      
      matchesRound0.push({
        id: `r0m${i}`,
        players: [p1, p2],
        roundResults: [null, null, null],
        winner: null,
        from: []
      });
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
          roundResults: [null, null, null],
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

  // Handler per cambio tabellone (Combattimenti)
  const handleTabelloneChange = (newTabellone) => {
    setTabellone(newTabellone);
  };

  // Handler per conferma definizione
  const handleConfirmDefinition = async (loadedLetter) => {
    if ((tipoCompetizioneId === CompetitionTipology.MANI_NUDE.toString() || tipoCompetizioneId === CompetitionTipology.ARMI.toString()) && !loadedLetter) {
      alert('Devi prima estrarre o impostare una lettera');
      return;
    }
    if (tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO.toString() && (!tabellone || !tabellone.rounds || tabellone.rounds.length === 0)) {
      alert('Devi prima generare il tabellone');
      return;
    }
    
    const updates = { stato: CategoryStates.IN_ATTESA_DI_AVVIO };
    
    // Se è quyen/armi, salva la lettera
    if (loadedLetter) {
      updates.letteraEstratta = loadedLetter;
      setLetter(loadedLetter);
    }
    
    if (tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO.toString()) {
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

  // Handler per reset categoria
  const handleResetCategory = async () => {
    try {
      if (window.confirm('Sei sicuro di voler resettare questa categoria? Tutti i dati inseriti andranno persi.')) {
        await patchSvolgimentoCategoria(svolgimentoId, {
          stato: CategoryStates.IN_DEFINIZIONE,
          letteraEstratta: '',
          punteggi: {},
          commissione: Array(10).fill(''),
          classifica: [],
          tabellone: null
        });
        // Ricarica i dati per rigenerare il tabellone
        await loadSvolgimento();
      }
    } catch (e) {
      console.error('Errore reset categoria:', e);
    }
  };

  // Handler per concludere categoria
  const handleConcludeQuyenCategory = async (classifica) => {
    
    await patchSvolgimentoCategoria(svolgimentoId, { 
      stato: CategoryStates.CONCLUSA,
      classifica: classifica
    });
    setStato(CategoryStates.CONCLUSA);
  };

  // Handler per concludere categoria (Combattimenti)
  const handleConcludeFightingCategory = async (classifica) => {
    setClassifica(classifica);
    
    await patchSvolgimentoCategoria(svolgimentoId, {
      stato: CategoryStates.CONCLUSA,
      classifica: classifica,
      tabellone: tabellone
    });
    setStato(CategoryStates.CONCLUSA);
  };

  // Handler per cambio punteggio (Quyen/Armi)
  const handlePunteggioChange = async (atletaId, votoIdx, value) => {
    try {
      const punteggiAtleti = { ...punteggi };
      const prevAtleta = punteggiAtleti[atletaId] || [null, null, null, null, null];
     const newAtleta = [...prevAtleta];
      newAtleta[votoIdx] = value;
      const updated = { ...punteggiAtleti, [atletaId]: newAtleta };
    
      setPunteggi(updated);
    
      await patchSvolgimentoCategoria(svolgimentoId, { 
        punteggi: updated, 
        stato: CategoryStates.IN_CORSO 
      });
    } catch (e) {
      console.error('Errore salvataggio punteggi:', e);
    }
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
    tipoCompetizioneId === CompetitionTipology.MANI_NUDE.toString() || 
    tipoCompetizioneId === CompetitionTipology.ARMI.toString();
  const isFightingCompetition = tipoCompetizioneId === CompetitionTipology.COMBATTIMENTO.toString();

  // Determina quale componente mostrare in base a tipo e stato
  const showDefinitionPhase = stato === CategoryStates.IN_DEFINIZIONE;
  const showExecutionPhase =
    stato === CategoryStates.IN_ATTESA_DI_AVVIO || 
    stato === CategoryStates.IN_CORSO || 
    stato === CategoryStates.CONCLUSA;

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTags}
        title="Svolgimento categoria"
      />
      <MuiButton
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
      >
        Torna a tutte le categorie
      </MuiButton>
    
      <Divider sx={{ mb: 3, borderWidth: 1.5 }}  />

      {/* Status indicator */}
      <Box sx={{ 
        mb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: { xs: 'flex-start', md: 'space-between' },
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2 
      }}>
        {categoriaNome && (
          <Typography variant="h4">
            <b>{decodeURIComponent(categoriaNome)}</b>
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <AuthComponent requiredRoles={['admin', 'superAdmin']}>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleResetCategory}
            >
              Reset categoria
            </Button>
          </AuthComponent>

          <Tooltip title="Stampa il quaderno della categoria">
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => setShowPrintModal(true)}
            >
              Stampa quaderno
            </Button>
          </Tooltip>
        </Box>
      </Box>


      {/* Status indicator */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6"><b>Stato:</b></Typography>
        <Chip 
          label={stato} 
          color={
            stato === CategoryStates.IN_DEFINIZIONE ? 'warning' :
            stato === CategoryStates.IN_ATTESA_DI_AVVIO ? 'info' :
            stato === CategoryStates.IN_CORSO ? 'primary' : 'success'
          }
        />
      </Box>

      {/* Componenti condizionali in base a tipo competizione e stato */}
      {isQuyenCompetition && showDefinitionPhase && (
        <QuyenDefinition
          atleti={atleti}
          letter={letter}
          onConfirmDefinition={handleConfirmDefinition}
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
          onStartCategory={handleStartCategory}
          onConcludeCategory={handleConcludeQuyenCategory}
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
          commissione={commissione}
          stato={stato}
          onTabelloneChange={handleTabelloneChange}
          onUpdateSvolgimento={handleUpdateSvolgimento}
          onCommissioneChange={handleCommissioneChange}
          onStartCategory={handleStartCategory}
          onConcludeCategory={handleConcludeFightingCategory}
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
    </div>
  );
};

export default CategoryInProgress;