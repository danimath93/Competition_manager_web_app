import React, { useEffect, useMemo, useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Box,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import DrawerModal from './common/DrawerModal';
import ConfirmActionModal from './common/ConfirmActionModal';
import {
  CONFIG_VERSION,
  getBirthDateRange,
  validateAgeGroupConfig,
} from '../utils/ageGroups';
import './common/DrawerModal.css';

export const SEASON_START_OPTIONS = [
  { value: '01-01', label: '1 gennaio (anno solare)' },
  { value: '09-01', label: '1 settembre (stagione sportiva)' },
];

export const AGE_GROUPING_OPTIONS = [
  { value: 'children', label: 'Bambini' },
  { value: 'adults', label: 'Adulti' },
];

export const getGroupingLabel = (grouping) =>
  AGE_GROUPING_OPTIONS.find(o => o.value === grouping)?.label || '-';

// Data odierna in formato 'YYYY-MM-DD'
export const todayYmd = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// 'YYYY-MM-DD' -> 'DD/MM/YYYY'
export const formatYmd = (ymd) => {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
};

// Descrizione testuale della modalità di calcolo
export const describeAgeGroupMode = (config) => {
  if (!config) return '';
  if (config.mode === 'seasonAge') {
    const option = SEASON_START_OPTIONS.find(o => o.value === config.seasonStart);
    return `Età sportiva - stagione dal ${option ? option.label : config.seasonStart}`;
  }
  return 'Età esatta a inizio gara';
};

// Chiave stabile generata dall'etichetta (es. 'Masters A' -> 'masters-a')
const slugify = (text) => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'fascia';

const toFormGroup = (group) => ({
  key: group.key || '',
  label: group.label || '',
  grouping: group.grouping || '',
  minAge: group.minAge === null || group.minAge === undefined ? '' : String(group.minAge),
  maxAge: group.maxAge === null || group.maxAge === undefined ? '' : String(group.maxAge),
});

const parseAge = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

const emptyForm = {
  name: '',
  description: '',
  mode: 'seasonAge',
  seasonStart: '01-01',
  groups: [],
};

/**
 * Drawer per creare, modificare o visualizzare una configurazione fasce d'età
 *
 * @param {Object} props.configuration - Configurazione da modificare/visualizzare, oppure valori iniziali per una nuova
 * @param {boolean} props.isEditMode - true se si modifica una configurazione esistente
 * @param {boolean} props.readOnly - true per le configurazioni di default
 * @param {function} props.onSubmit - Salvataggio: riceve { name, description, config }
 * @param {function} props.onDelete - Eliminazione della configurazione
 * @param {function} props.onDuplicate - Duplica la configurazione nel club (solo sola lettura)
 */
const AgeGroupConfigurationModal = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  onDuplicate,
  configuration,
  isEditMode,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const config = configuration?.config;
    setFormData(config ? {
      name: configuration.name || '',
      description: configuration.description || '',
      mode: config.mode,
      seasonStart: config.seasonStart || '01-01',
      groups: (config.groups || []).map(toFormGroup),
    } : emptyForm);
    setErrors([]);
    setSubmitAttempted(false);
  }, [open, configuration]);

  // Costruisce il JSON della configurazione dal form, generando le chiavi mancanti
  const buildConfig = (data) => {
    const usedKeys = new Set(data.groups.map(g => g.key).filter(Boolean));
    const groups = data.groups.map((group, index) => {
      let key = group.key;
      if (!key) {
        const base = slugify(group.label);
        key = base;
        let suffix = 2;
        while (usedKeys.has(key)) {
          key = `${base}-${suffix++}`;
        }
        usedKeys.add(key);
      }
      return {
        key,
        label: group.label,
        grouping: group.grouping,
        order: index + 1,
        minAge: parseAge(group.minAge),
        maxAge: parseAge(group.maxAge),
      };
    });
    return {
      version: CONFIG_VERSION,
      mode: data.mode,
      ...(data.mode === 'seasonAge' ? { seasonStart: data.seasonStart } : {}),
      groups,
    };
  };

  const validate = (data) => {
    const validationErrors = [];
    if (!data.name.trim()) {
      validationErrors.push('Il nome della configurazione è obbligatorio');
    }
    const { errors: configErrors } = validateAgeGroupConfig(buildConfig(data));
    return [...validationErrors, ...configErrors];
  };

  const updateForm = (changes) => {
    const newData = { ...formData, ...changes };
    setFormData(newData);
    if (submitAttempted) {
      setErrors(validate(newData));
    }
  };

  const handleChange = (e) => {
    updateForm({ [e.target.name]: e.target.value });
  };

  const handleGroupChange = (index, field, value) => {
    const groups = formData.groups.map((group, i) => (i === index ? { ...group, [field]: value } : group));
    updateForm({ groups });
  };

  const handleAddGroup = () => {
    const last = formData.groups[formData.groups.length - 1];
    const nextMin = last && last.maxAge !== '' ? String(Number(last.maxAge) + 1) : '';
    updateForm({ groups: [...formData.groups, { key: '', label: '', grouping: last?.grouping || '', minAge: nextMin, maxAge: '' }] });
  };

  const handleRemoveGroup = (index) => {
    updateForm({ groups: formData.groups.filter((_, i) => i !== index) });
  };

  const handleMoveGroup = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= formData.groups.length) return;
    const groups = [...formData.groups];
    [groups[index], groups[target]] = [groups[target], groups[index]];
    updateForm({ groups });
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description,
        config: buildConfig(formData),
      });
    } catch (error) {
      const data = error.response?.data;
      const details = Array.isArray(data?.details) ? data.details : [];
      setErrors([data?.error || error.message || 'Errore nel salvataggio della configurazione', ...details]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(configuration.id);
    } catch (error) {
      setErrors([error.response?.data?.error || error.message || 'Errore nell\'eliminazione della configurazione']);
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  // Intervalli date di nascita calcolati sempre rispetto al giorno corrente
  const previewConfig = useMemo(() => ({
    mode: formData.mode,
    seasonStart: formData.seasonStart,
  }), [formData.mode, formData.seasonStart]);
  const today = todayYmd();

  const getGroupBirthRange = (group) => {
    const minAge = parseAge(group.minAge);
    const maxAge = parseAge(group.maxAge);
    if (!Number.isInteger(minAge) || (maxAge !== null && (!Number.isInteger(maxAge) || maxAge < minAge))) {
      return 'Atleti nati: completa le età per calcolare le date';
    }
    const range = getBirthDateRange({ minAge, maxAge }, previewConfig, today);
    if (!range) return 'Atleti nati: -';
    return range.from
      ? `Atleti nati dal ${formatYmd(range.from)} al ${formatYmd(range.to)}`
      : `Atleti nati fino al ${formatYmd(range.to)}`;
  };

  const renderGroupInfo = (group) => (
    <Box>
      <div>Modalità di calcolo: {describeAgeGroupMode(previewConfig)}</div>
      <div>{getGroupBirthRange(group)}</div>
    </Box>
  );

  const title = readOnly
    ? 'Configurazione di default'
    : (isEditMode ? 'Modifica Configurazione Fasce Età' : 'Nuova Configurazione Fasce Età');

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        title={title}
        width="900px"
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              {isEditMode && !readOnly && onDelete && (
                <Button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                >
                  Elimina
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={onClose} variant="outlined">
                {readOnly ? 'Chiudi' : 'Annulla'}
              </Button>
              {readOnly ? (
                onDuplicate && (
                  <Button onClick={() => onDuplicate(configuration)} variant="contained" startIcon={<CopyIcon />}>
                    Duplica nel club
                  </Button>
                )
              ) : (
                <Button onClick={handleSubmit} variant="contained" disabled={saving}>
                  {isEditMode ? 'Salva Modifiche' : 'Crea Configurazione'}
                </Button>
              )}
            </Box>
          </Box>
        }
      >
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((err, i) => <div key={i}>{err}</div>)}
          </Alert>
        )}

        {/* Informazioni generali */}
        <div className="drawer-section">
          <h3 className="drawer-section-title">Informazioni generali</h3>
          <div className="drawer-section-content">
            <TextField
              name="name"
              label="Nome configurazione"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              disabled={readOnly}
            />
            <TextField
              name="description"
              label="Descrizione"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              size="small"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Modalità di calcolo */}
        <div className="drawer-section">
          <h3 className="drawer-section-title">Calcolo dell'età</h3>
          <div className="drawer-section-content">
            <FormControl disabled={readOnly}>
              <FormLabel>Modalità</FormLabel>
              <RadioGroup name="mode" value={formData.mode} onChange={handleChange}>
                <FormControlLabel
                  value="seasonAge"
                  control={<Radio size="small" />}
                  label="Età sportiva: età compiuta entro la fine della stagione"
                />
                <FormControlLabel
                  value="age"
                  control={<Radio size="small" />}
                  label="Età esatta alla data di inizio gara"
                />
              </RadioGroup>
            </FormControl>
            {formData.mode === 'seasonAge' && (
              <TextField
                select
                name="seasonStart"
                label="Inizio stagione"
                value={formData.seasonStart}
                onChange={handleChange}
                size="small"
                sx={{ maxWidth: 360 }}
                disabled={readOnly}
              >
                {SEASON_START_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            )}
          </div>
        </div>

        {/* Fasce d'età */}
        <div className="drawer-section">
          <h3 className="drawer-section-title">Fasce d'età</h3>
          <div className="drawer-section-content">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {!readOnly && <TableCell sx={{ width: 72 }} />}
                  <TableCell>Etichetta</TableCell>
                  <TableCell sx={{ width: 150 }}>Raggruppamento</TableCell>
                  <TableCell sx={{ width: 140 }}>Età minima</TableCell>
                  <TableCell sx={{ width: 140 }}>Età massima</TableCell>
                  <TableCell sx={{ width: 48 }} />
                  {!readOnly && <TableCell sx={{ width: 48 }} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.groups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={readOnly ? 5 : 7}>
                      <Typography variant="body2" color="text.secondary">Nessuna fascia definita</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {formData.groups.map((group, index) => (
                  <TableRow key={index}>
                    {!readOnly && (
                      <TableCell padding="none">
                        <IconButton size="small" onClick={() => handleMoveGroup(index, -1)} disabled={index === 0}>
                          <ArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveGroup(index, 1)} disabled={index === formData.groups.length - 1}>
                          <ArrowDownIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                    <TableCell>
                      <TextField
                        value={group.label}
                        onChange={(e) => handleGroupChange(index, 'label', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Es. Pulcini"
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        value={group.grouping}
                        onChange={(e) => handleGroupChange(index, 'grouping', e.target.value)}
                        size="small"
                        fullWidth
                        disabled={readOnly}
                      >
                        {AGE_GROUPING_OPTIONS.map(option => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={group.minAge}
                        onChange={(e) => handleGroupChange(index, 'minAge', e.target.value)}
                        size="small"
                        inputProps={{ min: 0, max: 120 }}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={group.maxAge}
                        onChange={(e) => handleGroupChange(index, 'maxAge', e.target.value)}
                        size="small"
                        placeholder="Nessun limite"
                        inputProps={{ min: 0, max: 120 }}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell padding="none" align="center">
                      <Tooltip title={renderGroupInfo(group)} arrow>
                        <InfoIcon fontSize="small" color="action" sx={{ cursor: 'help', verticalAlign: 'middle' }} />
                      </Tooltip>
                    </TableCell>
                    {!readOnly && (
                      <TableCell padding="none">
                        <IconButton size="small" color="error" onClick={() => handleRemoveGroup(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!readOnly && (
              <Box>
                <Button onClick={handleAddGroup} variant="outlined" startIcon={<AddIcon />} size="small">
                  Aggiungi fascia
                </Button>
              </Box>
            )}
          </div>
        </div>
      </DrawerModal>

      <ConfirmActionModal
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Conferma eliminazione"
        message={`Sei sicuro di voler eliminare la configurazione "${configuration?.name}"? Le competizioni che la utilizzano manterranno la propria copia.`}
        primaryButton={{ text: 'Elimina', onClick: handleDelete, variant: 'danger' }}
        secondaryButton={{ text: 'Annulla', onClick: () => setIsDeleteConfirmOpen(false) }}
      />
    </>
  );
};

export default AgeGroupConfigurationModal;
