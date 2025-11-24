import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { loadAllCompetitions } from '../../api/competitions';

const Categories = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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

  const handleDefinizione = (competitionId) => {
    navigate(`/categories/definition?competizioneId=${competitionId}`);
  };

  const handleSvolgimento = (competitionId) => {
    navigate(`/categories/execution?competizioneId=${competitionId}`);
  };

  const handleRisultati = (competitionId) => {
    navigate(`/categories/results?competizioneId=${competitionId}`);
  };

  const getStatoColor = (stato) => {
    switch(stato) {
      case 'Aperta':
        return 'success';
      case 'In preparazione':
        return 'warning';
      case 'In corso':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Caricamento...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestione Categorie
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {competitions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Nessuna competizione organizzata da visualizzare.
          </Typography>
        ) : (
          competitions.map((competition) => (
            <Card key={competition.id} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h6">
                    {competition.nome}
                  </Typography>
                  <Chip 
                    label={competition.stato} 
                    color={getStatoColor(competition.stato)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {new Date(competition.dataInizio).toLocaleDateString('it-IT')} - {new Date(competition.dataFine).toLocaleDateString('it-IT')}
                </Typography>
                {competition.organizzatoreClubId && (
                  <Typography variant="body2" color="text.secondary">
                    Organizzatore: {competition?.organizzatore?.denominazione}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ flexDirection: 'column', gap: 1, pr: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleDefinizione(competition.id)}
                  sx={{ minWidth: 120 }}
                >
                  Definizione
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleSvolgimento(competition.id)}
                  sx={{ minWidth: 120 }}
                >
                  Svolgimento
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleRisultati(competition.id)}
                  sx={{ minWidth: 120 }}
                >
                  Risultati
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default Categories;
