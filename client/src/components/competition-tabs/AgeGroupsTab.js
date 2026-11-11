import React, { useEffect, useState } from 'react';
import {
  Alert,
  Chip,
  ListItemIcon,
  ListSubheader,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { loadAgeGroupConfigurations } from '../../api/ageGroupConfigurations';
import { getBirthDateRange } from '../../utils/ageGroups';
import { describeAgeGroupMode, formatYmd, getGroupingLabel, todayYmd } from '../AgeGroupConfigurationModal';
import '../styles/Layout.css';
import '../styles/Register.css';

const ADMIN_ROLES = ['admin', 'superAdmin'];
const OPEN_MANAGEMENT_PAGE = '__open_age_groups_page__';

/**
 * Step di selezione della configurazione fasce d'età della competizione
 *
 * @param {number|null} props.value - ID configurazione selezionata
 * @param {function} props.onChange - Riceve il nuovo ID configurazione
 * @param {function} props.onConfigChange - Riceve il JSON della configurazione selezionata (aggiornato ad ogni ricaricamento)
 * @param {Object} props.savedConfiguration - Configurazione di origine salvata in competizione ({ id, name, deletedAt })
 * @param {Object} props.savedConfig - Copia della configurazione salvata in competizione
 * @param {number|null} props.organizerClubId - Club organizzatore della competizione
 * @param {boolean} props.locked - true se le categorie sono già state generate
 * @param {string} props.competitionStartDate - Data inizio gara 'YYYY-MM-DD', usata per l'anteprima
 */
const AgeGroupsTab = ({
  value,
  onChange,
  onConfigChange,
  savedConfiguration,
  savedConfig,
  organizerClubId,
  locked = false,
  competitionStartDate,
}) => {
  const { user } = useAuth();
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clubId = organizerClubId || user?.clubId || null;

  // Ricarica le configurazioni ad ogni apertura del selettore (possono essere state modificate in un'altra pagina)
  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      const data = await loadAgeGroupConfigurations(ADMIN_ROLES.includes(user?.permissions) ? clubId : null);
      setConfigurations(data.filter(c => c.clubId === null || !clubId || c.clubId === clubId));
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento delle configurazioni fasce età');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const handleSelectChange = (e) => {
    if (e.target.value === OPEN_MANAGEMENT_PAGE) {
      window.open('/age-groups', '_blank', 'noopener');
      return;
    }
    onChange(e.target.value === '' ? null : Number(e.target.value));
  };

  const clubConfigurations = configurations.filter(c => c.clubId !== null);
  const defaultConfigurations = configurations.filter(c => c.clubId === null);
  const selectedConfiguration = configurations.find(c => c.id === value) || null;
  // Configurazione salvata non più disponibile (eliminata): resta selezionabile per non perdere il valore
  const isSavedMissing = !!value && !selectedConfiguration && savedConfiguration?.id === value;

  // Con categorie generate fa fede la copia salvata in competizione
  let previewConfig = null;
  if (locked || !selectedConfiguration) {
    previewConfig = value && value === savedConfiguration?.id ? savedConfig : null;
  } else {
    previewConfig = selectedConfiguration.config;
  }
  const referenceDate = competitionStartDate || todayYmd();

  // Notifica il configuratore della configurazione effettiva (usata per la tabella categorie)
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(previewConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(previewConfig)]);

  const renderOption = (configuration) => (
    <MenuItem key={configuration.id} value={configuration.id}>
      {configuration.name}
    </MenuItem>
  );

  return (
    <div className="register-form" style={{ maxWidth: '1024px' }}>
      <h6 className="text-primary text-center register-section-title">Seleziona la configurazione delle fasce d'età</h6>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}
      {locked && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Le categorie della competizione sono già state generate: la configurazione delle fasce d'età non è più modificabile.
        </Alert>
      )}

      <TextField
        select
        fullWidth
        label="Configurazione fasce d'età"
        value={value ?? ''}
        onChange={handleSelectChange}
        disabled={locked}
        required
        SelectProps={{ onOpen: fetchConfigurations }}
        helperText={loading ? 'Caricamento configurazioni...' : ' '}
      >
        {isSavedMissing && (
          <MenuItem value={value}>{savedConfiguration.name} (eliminata)</MenuItem>
        )}
        {clubConfigurations.length > 0 && <ListSubheader>Configurazioni del club</ListSubheader>}
        {clubConfigurations.map(renderOption)}
        {defaultConfigurations.length > 0 && <ListSubheader>Configurazioni di default</ListSubheader>}
        {defaultConfigurations.map(renderOption)}
        <MenuItem value={OPEN_MANAGEMENT_PAGE} sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }}>
          <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
          Gestisci configurazioni fasce d'età (nuova pagina)
        </MenuItem>
      </TextField>

      {previewConfig && (
        <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
          <Chip size="small" color="primary" variant="outlined" label={describeAgeGroupMode(previewConfig)} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Date di nascita calcolate rispetto {competitionStartDate ? `alla data di inizio gara (${formatYmd(competitionStartDate)})` : 'alla data odierna'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fascia</TableCell>
                <TableCell>Raggruppamento</TableCell>
                <TableCell>Età</TableCell>
                <TableCell>Atleti nati</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {previewConfig.groups.map(group => {
                const range = getBirthDateRange(group, previewConfig, referenceDate);
                return (
                  <TableRow key={group.key}>
                    <TableCell>{group.label}</TableCell>
                    <TableCell>{getGroupingLabel(group.grouping)}</TableCell>
                    <TableCell>{group.maxAge === null ? `${group.minAge}+` : `${group.minAge} - ${group.maxAge}`}</TableCell>
                    <TableCell>
                      {range && (range.from
                        ? `dal ${formatYmd(range.from)} al ${formatYmd(range.to)}`
                        : `fino al ${formatYmd(range.to)}`)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  );
};

export default AgeGroupsTab;
