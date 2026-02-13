import React, { useState, useEffect } from 'react';
import { Box, TextField, Autocomplete } from '@mui/material';
import { FaCog } from 'react-icons/fa';
import Alert from '@mui/material/Alert';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/common/Button';
import AuthComponent from '../../components/AuthComponent';
import { loadAllClubs } from '../../api/clubs';
import { updateUserData } from '../../api/auth';
import '../styles/CommonPageStyles.css';

const Settings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubNames, setClubNames] = useState([]);
  const [clubName, setClubName] = useState('');
  const [selectedClubId, setSelectedClubId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.permissions === 'superAdmin') {
          const clubsData = await loadAllClubs();
          setClubs(clubsData);
          const clubNamesData = clubsData.map((club) => club.denominazione);
          setClubNames(clubNamesData);

          // Imposta il club corrente dell'utente
          if (user.clubId) {
            const currentClub = clubsData.find((club) => club.id === user.clubId);
            if (currentClub) {
              setClubName(currentClub.denominazione);
              setSelectedClubId(currentClub.id);
            }
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento dei club:', error);
        setError('Errore nel caricamento dei club');
      }
    };

    fetchData();
  }, [user]);

  const handleClubSelectChange = (value) => {
    setClubName(value);
    const selectedClub = clubs.find((club) => club.denominazione === value);
    setSelectedClubId(selectedClub?.id || null);
  };

  const handleUpdateClub = async () => {
    try {
      setError(null);
      setSuccess(null);

      await updateUserData({ clubId: selectedClubId });
      setSuccess('Impostazioni aggiornate con successo. Rieffettua il login per vedere le modifiche.');
    } catch (error) {
      console.error('Errore nell\'aggiornamento del club:', error);
      setError(error.response?.data?.message || 'Errore nell\'aggiornamento del club');
    }
  };
  
  return (
    <div className="page-container">
      <PageHeader
        icon={FaCog}
        title={t('settings')}
        subtitle="Benvenuto nella pagina delle impostazioni del Gestore Gare. Qui puoi configurare le tue preferenze e impostazioni."
      />

      {/* Messaggi di errore e successo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message || error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <div className="page-content">

        <div className="page-section">
          <h2 className="page-section-title">Generali</h2>
          <div className="page-card">
            <p>Nessuna impostazione disponibile al momento.</p>
          </div>
        </div>

        <div className="page-divider"></div>

        <AuthComponent requiredRoles={['superAdmin']}>
          <div className="page-section">
            <h2 className="page-section-title">Impostazioni Super Admin</h2>
            <div className="page-card">
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <p style={{ marginBottom: '8px', fontWeight: 500 }}>
                    Utente: {user?.username || 'N/A'}
                  </p>
                </Box>

                <Autocomplete
                  id="club-select-settings"
                  value={clubName}
                  groupBy={(club) => club.charAt(0).toUpperCase()}
                  getOptionLabel={(club) => club}
                  onChange={(event, value) => handleClubSelectChange(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Club"
                      size="small"
                      required
                    />
                  )}
                  options={clubNames ? [...clubNames].sort((a, b) => a.localeCompare(b)) : []}
                />

                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    onClick={handleUpdateClub} 
                    variant="contained"
                    disabled={!selectedClubId}
                  >
                    Conferma Modifica
                  </Button>
                </Box>
              </Box>
            </div>
          </div>
        </AuthComponent>
      </div>
    </div>
  );
};

export default Settings;
