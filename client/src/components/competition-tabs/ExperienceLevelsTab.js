import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { loadCompetitionTypes, loadExperiences } from '../../api/config';
import {
  EXPERIENCE_BELT_LABELS,
  GROUPING_LABELS,
  getUsedGroupingsByCompetitionType,
} from '../../utils/competitionCategoryConfig';
import '../styles/Layout.css';
import '../styles/Register.css';

const GROUPINGS = ['children', 'adults'];

/**
 * Step di selezione dei livelli di esperienza, per tipo competizione e raggruppamento (bambini/adulti).
 * All'iscrizione i livelli vengono filtrati in base alla cintura dell'atleta.
 *
 * @param {Object} props.value - categoryConfig corrente
 * @param {function} props.onChange - riceve il nuovo categoryConfig
 * @param {Object} props.ageGroupConfig - configurazione fasce età della competizione
 */
const ExperienceLevelsTab = ({ value, onChange, ageGroupConfig }) => {
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([loadCompetitionTypes(), loadExperiences()])
      .then(([types, experiencesData]) => {
        setCompetitionTypes(types);
        setExperiences(experiencesData);
      })
      .catch(() => setError('Errore nel caricamento dei livelli di esperienza'))
      .finally(() => setLoading(false));
  }, []);

  const categoryTypes = useMemo(() => competitionTypes.flatMap(t => t.tipiCategoria || []), [competitionTypes]);
  const usedGroupings = getUsedGroupingsByCompetitionType(value, ageGroupConfig, categoryTypes);
  const experienceLevels = value?.experienceLevels || [];

  const getSelectedIds = (competitionTypeId, grouping) =>
    experienceLevels.find(l => l.competitionTypeId === competitionTypeId && l.grouping === grouping)?.experienceIds || [];

  const setSelectedIds = (competitionTypeId, grouping, experienceIds) => {
    const others = experienceLevels.filter(l => !(l.competitionTypeId === competitionTypeId && l.grouping === grouping));
    onChange({
      ...value,
      experienceLevels: experienceIds.length > 0 ? [...others, { competitionTypeId, grouping, experienceIds }] : others,
    });
  };

  const handleToggle = (competitionTypeId, grouping, experienceId) => {
    const selected = getSelectedIds(competitionTypeId, grouping);
    setSelectedIds(
      competitionTypeId,
      grouping,
      selected.includes(experienceId) ? selected.filter(id => id !== experienceId) : [...selected, experienceId]
    );
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><CircularProgress /></div>;
  }

  const usedTypes = competitionTypes.filter(type => usedGroupings[type.id]?.size > 0);

  return (
    <div className="register-form" style={{ maxWidth: '1024px' }}>
      <h6 className="text-primary text-center register-section-title">Livelli di esperienza</h6>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Seleziona i livelli richiesti in fase di iscrizione. Gli atleti vedranno solo i livelli compatibili con la propria cintura.
        Se non selezioni livelli, per quel tipo di competizione non verrà richiesto.
      </Typography>

      {usedTypes.length === 0 && (
        <Alert severity="info">Configura prima le categorie della competizione.</Alert>
      )}

      {usedTypes.map(type => {
        const available = experiences.filter(e => (e.tipiCompetizione || []).includes(type.id));
        return (
          <Paper key={type.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{type.nome}</Typography>
            {available.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nessun livello di esperienza previsto per questo tipo di competizione.</Typography>
            ) : (
              GROUPINGS.filter(grouping => usedGroupings[type.id].has(grouping)).map(grouping => {
                const selected = getSelectedIds(type.id, grouping);
                return (
                  <div key={grouping} style={{ marginBottom: '0.75rem' }}>
                    <Typography variant="body2" fontWeight={600}>{GROUPING_LABELS[grouping]}</Typography>
                    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '1rem' }}>
                      {available.map(experience => (
                        <FormControlLabel
                          key={experience.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={selected.includes(experience.id)}
                              onChange={() => handleToggle(type.id, grouping, experience.id)}
                            />
                          }
                          label={
                            <span>
                              {experience.nome}
                              {experience.belt && experience.belt !== 'all' && (
                                <Chip size="small" variant="outlined" label={EXPERIENCE_BELT_LABELS[experience.belt]} sx={{ ml: 0.5, height: 20 }} />
                              )}
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </Paper>
        );
      })}
    </div>
  );
};

export default ExperienceLevelsTab;
