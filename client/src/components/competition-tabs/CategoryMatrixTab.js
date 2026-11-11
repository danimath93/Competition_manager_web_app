import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Checkbox,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { loadCompetitionTypes } from '../../api/config';
import {
  CATEGORY_BELT_OPTIONS,
  GROUPING_LABELS,
  getDefaultGroupings,
  getGroupKeysByGroupings,
} from '../../utils/competitionCategoryConfig';
import '../styles/Layout.css';
import '../styles/Register.css';

const GROUPINGS = ['children', 'adults'];

/**
 * Step di definizione delle categorie: tabella categorie x fasce d'età, con filtro cintura per categoria
 *
 * @param {Object} props.value - categoryConfig corrente
 * @param {function} props.onChange - riceve il nuovo categoryConfig
 * @param {Object} props.ageGroupConfig - configurazione fasce età della competizione
 */
const CategoryMatrixTab = ({ value, onChange, ageGroupConfig }) => {
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = useMemo(() => value?.categories || [], [value]);
  const groups = ageGroupConfig?.groups || [];
  const groupsByGrouping = GROUPINGS
    .map(grouping => ({ grouping, groups: groups.filter(g => g.grouping === grouping) }))
    .filter(section => section.groups.length > 0);

  useEffect(() => {
    loadCompetitionTypes()
      .then(types => setCompetitionTypes(types))
      .catch(() => setError('Errore nel caricamento dei tipi di competizione'))
      .finally(() => setLoading(false));
  }, []);

  // Tipi competizione selezionati: inizialmente quelli delle categorie già configurate
  useEffect(() => {
    if (competitionTypes.length === 0) return;
    const usedTypeIds = competitionTypes
      .filter(type => (type.tipiCategoria || []).some(ct => categories.some(c => c.categoryTypeId === ct.id)))
      .map(type => type.id);
    setSelectedTypeIds(prev => [...new Set([...prev, ...usedTypeIds])]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionTypes]);

  const updateCategories = (newCategories) => {
    onChange({ ...value, categories: newCategories });
  };

  const getCategory = (categoryTypeId) => categories.find(c => c.categoryTypeId === categoryTypeId);

  const setCategory = (categoryTypeId, changes) => {
    const existing = getCategory(categoryTypeId);
    if (!existing) {
      updateCategories([...categories, { categoryTypeId, ageGroupKeys: [], belt: 'all', ...changes }]);
    } else {
      updateCategories(categories.map(c => (c.categoryTypeId === categoryTypeId ? { ...c, ...changes } : c)));
    }
  };

  const removeCategories = (categoryTypeIds) => {
    updateCategories(categories.filter(c => !categoryTypeIds.includes(c.categoryTypeId)));
  };

  const handleToggleCompetitionType = (type) => {
    if (selectedTypeIds.includes(type.id)) {
      setSelectedTypeIds(selectedTypeIds.filter(id => id !== type.id));
      removeCategories((type.tipiCategoria || []).map(ct => ct.id));
    } else {
      setSelectedTypeIds([...selectedTypeIds, type.id]);
    }
  };

  // Inclusione categoria: propone le fasce dei raggruppamenti previsti per il tipo categoria
  const handleToggleCategory = (categoryType) => {
    if (getCategory(categoryType.id)) {
      removeCategories([categoryType.id]);
    } else {
      setCategory(categoryType.id, { ageGroupKeys: getGroupKeysByGroupings(ageGroupConfig, getDefaultGroupings(categoryType)) });
    }
  };

  const handleToggleCell = (categoryTypeId, groupKey) => {
    const category = getCategory(categoryTypeId);
    const keys = category?.ageGroupKeys || [];
    const newKeys = keys.includes(groupKey) ? keys.filter(k => k !== groupKey) : [...keys, groupKey];
    if (newKeys.length === 0) {
      removeCategories([categoryTypeId]);
    } else {
      setCategory(categoryTypeId, { ageGroupKeys: newKeys });
    }
  };

  // Seleziona/deseleziona un insieme di fasce per tutte le categorie del tipo competizione
  const handleToggleColumnSet = (type, groupKeys) => {
    const categoryTypes = type.tipiCategoria || [];
    const allChecked = categoryTypes.every(ct => groupKeys.every(k => getCategory(ct.id)?.ageGroupKeys.includes(k)));
    let newCategories = [...categories];
    categoryTypes.forEach(ct => {
      const existing = newCategories.find(c => c.categoryTypeId === ct.id);
      const keys = existing?.ageGroupKeys || [];
      const newKeys = allChecked ? keys.filter(k => !groupKeys.includes(k)) : [...new Set([...keys, ...groupKeys])];
      newCategories = newCategories.filter(c => c.categoryTypeId !== ct.id);
      if (newKeys.length > 0) {
        newCategories.push({ categoryTypeId: ct.id, belt: existing?.belt || 'all', ageGroupKeys: newKeys });
      }
    });
    updateCategories(newCategories);
  };

  const getColumnSetState = (type, groupKeys) => {
    const categoryTypes = type.tipiCategoria || [];
    const checks = categoryTypes.flatMap(ct => groupKeys.map(k => !!getCategory(ct.id)?.ageGroupKeys.includes(k)));
    return {
      checked: checks.length > 0 && checks.every(Boolean),
      indeterminate: checks.some(Boolean) && !checks.every(Boolean),
    };
  };

  if (!ageGroupConfig) {
    return (
      <div className="register-form" style={{ maxWidth: '1024px' }}>
        <Alert severity="warning">Seleziona prima la configurazione delle fasce d'età.</Alert>
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><CircularProgress /></div>;
  }

  return (
    <div className="register-form" style={{ maxWidth: '1200px' }}>
      <h6 className="text-primary text-center register-section-title">Categorie e fasce d'età ammesse</h6>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Tipi di competizione</Typography>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {competitionTypes.map(type => (
          <Chip
            key={type.id}
            label={type.nome}
            color={selectedTypeIds.includes(type.id) ? 'primary' : 'default'}
            variant={selectedTypeIds.includes(type.id) ? 'filled' : 'outlined'}
            onClick={() => handleToggleCompetitionType(type)}
          />
        ))}
      </div>

      {selectedTypeIds.length === 0 && (
        <Alert severity="info">Seleziona almeno un tipo di competizione.</Alert>
      )}

      {competitionTypes.filter(type => selectedTypeIds.includes(type.id)).map(type => (
        <Paper key={type.id} variant="outlined" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ px: 2, pt: 1.5 }}>{type.nome}</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} sx={{ minWidth: 220 }}>Categoria</TableCell>
                  <TableCell rowSpan={2} sx={{ minWidth: 130 }}>Cintura</TableCell>
                  {groupsByGrouping.map(section => {
                    const state = getColumnSetState(type, section.groups.map(g => g.key));
                    return (
                      <TableCell key={section.grouping} colSpan={section.groups.length} align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>
                        <Checkbox
                          size="small"
                          checked={state.checked}
                          indeterminate={state.indeterminate}
                          onChange={() => handleToggleColumnSet(type, section.groups.map(g => g.key))}
                        />
                        {GROUPING_LABELS[section.grouping]}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  {groupsByGrouping.flatMap(section => section.groups.map((group, index) => {
                    const state = getColumnSetState(type, [group.key]);
                    return (
                      <TableCell
                        key={group.key}
                        align="center"
                        sx={{ px: 0.5, ...(index === 0 ? { borderLeft: 1, borderColor: 'divider' } : {}) }}
                      >
                        <Tooltip title={`Seleziona ${group.label} per tutte le categorie`}>
                          <Typography
                            variant="caption"
                            sx={{ cursor: 'pointer', fontWeight: state.checked ? 700 : 400, display: 'block' }}
                            onClick={() => handleToggleColumnSet(type, [group.key])}
                          >
                            {group.label}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    );
                  }))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(type.tipiCategoria || []).map(categoryType => {
                  const category = getCategory(categoryType.id);
                  return (
                    <TableRow key={categoryType.id} hover>
                      <TableCell>
                        <Checkbox size="small" checked={!!category} onChange={() => handleToggleCategory(categoryType)} />
                        {categoryType.nome}
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={category?.belt || 'all'}
                          onChange={(e) => setCategory(categoryType.id, { belt: e.target.value })}
                          disabled={!category}
                          fullWidth
                        >
                          {CATEGORY_BELT_OPTIONS.map(option => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      {groupsByGrouping.flatMap(section => section.groups.map((group, index) => (
                        <TableCell
                          key={group.key}
                          align="center"
                          padding="none"
                          sx={index === 0 ? { borderLeft: 1, borderColor: 'divider' } : {}}
                        >
                          <Checkbox
                            size="small"
                            checked={!!category?.ageGroupKeys.includes(group.key)}
                            onChange={() => handleToggleCell(categoryType.id, group.key)}
                          />
                        </TableCell>
                      )))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </div>
  );
};

export default CategoryMatrixTab;
