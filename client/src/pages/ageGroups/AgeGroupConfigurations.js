import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import { Add, ContentCopy, Edit, Visibility } from '@mui/icons-material';
import { FaLayerGroup } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { Button } from '../../components/common';
import AgeGroupConfigurationModal, {
  describeAgeGroupMode,
  formatYmd,
  todayYmd,
} from '../../components/AgeGroupConfigurationModal';
import { loadAllClubs } from '../../api/clubs';
import {
  loadAgeGroupConfigurations,
  createAgeGroupConfiguration,
  updateAgeGroupConfiguration,
  deleteAgeGroupConfiguration,
} from '../../api/ageGroupConfigurations';
import { getBirthDateRange } from '../../utils/ageGroups';
import '../styles/CommonPageStyles.css';

const ADMIN_ROLES = ['admin', 'superAdmin'];

// Card riepilogativa di una configurazione
const ConfigurationCard = ({ configuration, actions }) => {
  const { config } = configuration;
  const today = todayYmd();

  return (
    <div className="page-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Box>
        <Typography variant="h6" fontWeight={600}>{configuration.name}</Typography>
        {configuration.description && (
          <Typography variant="body2" color="text.secondary">{configuration.description}</Typography>
        )}
      </Box>
      <Box>
        <Chip size="small" color="primary" variant="outlined" label={describeAgeGroupMode(config)} />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {config.groups.map(group => {
          const range = getBirthDateRange(group, config, today);
          const ages = group.maxAge === null ? `${group.minAge}+` : `${group.minAge}-${group.maxAge}`;
          const birthInfo = range
            ? (range.from ? `Nati dal ${formatYmd(range.from)} al ${formatYmd(range.to)}` : `Nati fino al ${formatYmd(range.to)}`)
            : '';
          return (
            <Chip
              key={group.key}
              size="small"
              label={`${group.label} ${ages}`}
              title={birthInfo}
            />
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto' }}>
        {actions}
      </Box>
    </div>
  );
};

const AgeGroupConfigurations = () => {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.permissions);

  const [configurations, setConfigurations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(user?.clubId || null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);

  const fetchConfigurations = useCallback(async () => {
    try {
      const data = await loadAgeGroupConfigurations(isAdmin ? selectedClubId : null);
      setConfigurations(data);
    } catch (err) {
      setError('Errore nel caricamento delle configurazioni fasce età');
    }
  }, [isAdmin, selectedClubId]);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAllClubs()
      .then(data => setClubs([...data].sort((a, b) => a.denominazione.localeCompare(b.denominazione))))
      .catch(() => setError('Errore nel caricamento dei club'));
  }, [isAdmin]);

  const defaultConfigurations = useMemo(() => configurations.filter(c => c.clubId === null), [configurations]);
  const clubConfigurations = useMemo(
    () => (selectedClubId ? configurations.filter(c => c.clubId === selectedClubId) : []),
    [configurations, selectedClubId]
  );
  const selectedClub = clubs.find(c => c.id === selectedClubId) || null;

  const handleOpenModal = (configuration = null, { editMode = false, readOnly = false } = {}) => {
    setSelectedConfiguration(configuration);
    setIsEditMode(editMode);
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConfiguration(null);
  };

  // Duplica: apre una nuova configurazione precompilata, salvata solo alla conferma
  const handleDuplicate = (configuration) => {
    handleOpenModal({
      name: `${configuration.name} (copia)`,
      description: configuration.description,
      config: configuration.config,
    });
  };

  const handleSave = async (data) => {
    if (isEditMode) {
      await updateAgeGroupConfiguration(selectedConfiguration.id, data);
      setSuccess('Configurazione aggiornata con successo');
    } else {
      await createAgeGroupConfiguration({ ...data, ...(isAdmin ? { clubId: selectedClubId } : {}) });
      setSuccess('Configurazione creata con successo');
    }
    handleCloseModal();
    await fetchConfigurations();
  };

  const handleDelete = async (id) => {
    await deleteAgeGroupConfiguration(id);
    setSuccess('Configurazione eliminata con successo');
    handleCloseModal();
    await fetchConfigurations();
  };

  const canManageClub = !!selectedClubId;

  return (
    <div className="page-container">
      <PageHeader
        icon={FaLayerGroup}
        title="Configurazioni Fasce d'Età"
        subtitle="Definisci le fasce d'età del club, partendo da quelle di default. Verranno scelte in fase di creazione della competizione."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <div className="page-content">
        {isAdmin && (
          <div className="page-card">
            <Autocomplete
              value={selectedClub}
              options={clubs}
              getOptionLabel={(club) => club.denominazione}
              groupBy={(club) => club.denominazione.charAt(0).toUpperCase()}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, value) => setSelectedClubId(value?.id || null)}
              renderInput={(params) => <TextField {...params} label="Club" size="small" />}
              sx={{ maxWidth: 500 }}
            />
          </div>
        )}

        <div className="page-section">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
            <h2 className="page-section-title" style={{ margin: 0 }}>Configurazioni del club</h2>
            <Button icon={Add} onClick={() => handleOpenModal()} disabled={!canManageClub}>
              Nuova Configurazione
            </Button>
          </Box>
          {!canManageClub ? (
            <div className="page-card">
              <Typography color="text.secondary">
                {isAdmin ? 'Seleziona un club per gestirne le configurazioni.' : 'Nessun club associato all\'utente.'}
              </Typography>
            </div>
          ) : clubConfigurations.length === 0 ? (
            <div className="page-card">
              <Typography color="text.secondary">
                Nessuna configurazione salvata. Creane una nuova oppure duplica una configurazione di default.
              </Typography>
            </div>
          ) : (
            <div className="page-grid-3">
              {clubConfigurations.map(configuration => (
                <ConfigurationCard
                  key={configuration.id}
                  configuration={configuration}
                  actions={
                    <>
                      <Button size="s" variant="outline" icon={ContentCopy} onClick={() => handleDuplicate(configuration)}>
                        Duplica
                      </Button>
                      <Button size="s" icon={Edit} onClick={() => handleOpenModal(configuration, { editMode: true })}>
                        Modifica
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="page-divider"></div>

        <div className="page-section">
          <h2 className="page-section-title">Configurazioni di default</h2>
          {defaultConfigurations.length === 0 ? (
            <div className="page-card">
              <Typography color="text.secondary">Nessuna configurazione di default disponibile.</Typography>
            </div>
          ) : (
            <div className="page-grid-3">
              {defaultConfigurations.map(configuration => (
                <ConfigurationCard
                  key={configuration.id}
                  configuration={configuration}
                  actions={
                    <>
                      <Button size="s" variant="outline" icon={Visibility} onClick={() => handleOpenModal(configuration, { readOnly: true })}>
                        Visualizza
                      </Button>
                      <Button size="s" icon={ContentCopy} onClick={() => handleDuplicate(configuration)} disabled={!canManageClub}>
                        Duplica nel club
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AgeGroupConfigurationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        onDelete={handleDelete}
        onDuplicate={canManageClub ? handleDuplicate : null}
        configuration={selectedConfiguration}
        isEditMode={isEditMode}
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default AgeGroupConfigurations;
