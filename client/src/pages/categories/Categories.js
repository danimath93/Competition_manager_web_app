import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box} from '@mui/material';
import { FaTags } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { loadAllCompetitions } from '../../api/competitions';
import CategoryCard from './CategoryCard';  
import PageHeader from '../../components/PageHeader';

const Categories = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDefinizione = (competitionId) => {
    navigate(`/categories/definition?competizioneId=${competitionId}`);
  };

  const handleSvolgimento = (competitionId) => {
    navigate(`/categories/execution?competizioneId=${competitionId}`);
  };

  const handleRisultati = (competitionId) => {
    navigate(`/categories/results?competizioneId=${competitionId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const fetchCompetitions = async () => {
        try {
          setLoading(true);
          // Filtra solo le competizioni negli stati: Aperta, In preparazione, In corso
          const data = await loadAllCompetitions(['Aperta', 'In preparazione', 'In corso']);
          // Se visualizzazione per organizzatore, filtra solo le competizioni organizzate dal club dell'utente
          let filteredData = data;
          if (user.permissions === 'club') {
            if (user.clubId) {
              filteredData = data.filter(comp => comp.organizzatoreClubId && comp.organizzatoreClubId === user.clubId);
            }
            else {
              filteredData = [];
              throw new Error('Utente club senza clubId associato');
            }
          }
          // Ordina le competizioni per data di inizio, dalla più recente alla più vecchia
          const sortedData = filteredData.sort((a, b) => new Date(b.dataInizio) - new Date(a.dataInizio));
          setCompetitions(sortedData);
        } catch (error) {
          console.error('Errore nel caricamento delle competizioni:', error);
        } finally {
          setLoading(false);
        }
      };

      await fetchCompetitions();
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Caricamento...</Typography>
      </Container>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        icon={FaTags}
        title={t('categories')}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {competitions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Nessuna competizione organizzata da visualizzare.
          </Typography>
        ) : (
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 400 }}>
        {competitions.map((comp) => (
          <CategoryCard
            key={comp.id}
            competition={comp}
            onDefinition={handleDefinizione}
            onExecution={handleSvolgimento}
            onCheckResults={handleRisultati}
            userClubId={user?.clubId}
            userPermissions={user?.permissions}
          />
        ))}
        </div>
        )}
      </Box>
    </div>
  );
};

export default Categories;
