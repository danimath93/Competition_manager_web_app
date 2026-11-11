import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { loadCompetitionTypes, loadExperiences } from '../../api/config';
import { describeAgeGroupMode, formatYmd } from '../AgeGroupConfigurationModal';
import { GROUPING_LABELS, getCategoryBeltLabel } from '../../utils/competitionCategoryConfig';
import '../styles/Layout.css';
import '../styles/Register.css';

const COST_TYPE_LABELS = { fixed: 'Fisso', minimum: 'Scaglioni', additional: 'Addizionale' };

const formatCost = (config) => {
  if (config.type === 'fixed') return `${Number(config.config.amount || 0).toFixed(2)} €`;
  if (config.type === 'minimum') {
    return (config.config.minCategories || [])
      .map((min, i) => `${min}+ cat. → ${Number(config.config.costs?.[i] || 0).toFixed(2)} €`)
      .join(' | ');
  }
  if (config.type === 'additional') {
    return `Prima: ${Number(config.config.first || 0).toFixed(2)} € + Extra: ${Number(config.config.extra || 0).toFixed(2)} €`;
  }
  return '';
};

const Section = ({ title, children }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{title}</Typography>
    {children}
  </Paper>
);

const Field = ({ label, value }) => (
  <Typography variant="body2" sx={{ mb: 0.5 }}>
    <span style={{ color: '#666' }}>{label}:</span> {value || '-'}
  </Typography>
);

/**
 * Step di riepilogo della competizione prima del salvataggio
 */
const ReviewTab = ({ formData, ageGroupConfig }) => {
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    Promise.all([loadCompetitionTypes(), loadExperiences()])
      .then(([types, experiencesData]) => {
        setCompetitionTypes(types);
        setExperiences(experiencesData);
      })
      .catch(error => console.error('Errore nel caricamento dei dati di riepilogo:', error));
  }, []);

  const categoryTypes = useMemo(() => competitionTypes.flatMap(t => t.tipiCategoria || []), [competitionTypes]);
  const categoryConfig = formData.categoryConfig;
  const groups = ageGroupConfig?.groups || [];
  const costs = formData.costiIscrizione || {};

  // Descrizione compatta delle fasce: un raggruppamento completo viene indicato per nome
  const describeAgeGroups = (keys) => {
    const parts = [];
    ['children', 'adults'].forEach(grouping => {
      const groupingKeys = groups.filter(g => g.grouping === grouping).map(g => g.key);
      const selected = groupingKeys.filter(k => keys.includes(k));
      if (selected.length === 0) return;
      if (selected.length === groupingKeys.length) {
        parts.push(`${GROUPING_LABELS[grouping]} (tutte)`);
      } else {
        parts.push(...groups.filter(g => selected.includes(g.key)).map(g => g.label));
      }
    });
    return parts.join(', ');
  };

  const getCategoryName = (id) => categoryTypes.find(ct => ct.id === id)?.nome || `Categoria #${id}`;
  const getCompetitionTypeName = (id) => competitionTypes.find(t => t.id === id)?.nome || `Tipo #${id}`;
  const getExperienceName = (id) => experiences.find(e => e.id === id)?.nome || `#${id}`;

  return (
    <div className="register-form" style={{ maxWidth: '1024px' }}>
      <h6 className="text-primary text-center register-section-title">Riepilogo competizione</h6>

      <Section title="Informazioni generali">
        <Field label="Nome" value={formData.nome} />
        <Field label="Date" value={`${formatYmd(formData.dataInizio)} - ${formatYmd(formData.dataFine)}`} />
        <Field label="Luogo" value={[formData.luogo, formData.indirizzo].filter(Boolean).join(', ')} />
        <Field label="Livello" value={formData.livello} />
        <Field label="Scadenza iscrizioni" value={formatYmd(formData.dataScadenzaIscrizioni)} />
        <Field label="Massimo categorie per atleta" value={formData.maxCategorieAtleta} />
      </Section>

      <Section title="Fasce d'età">
        {ageGroupConfig ? (
          <>
            <Chip size="small" color="primary" variant="outlined" label={describeAgeGroupMode(ageGroupConfig)} sx={{ mb: 1 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {groups.map(g => (
                <Chip
                  key={g.key}
                  size="small"
                  label={`${g.label} ${g.maxAge === null ? `${g.minAge}+` : `${g.minAge}-${g.maxAge}`} · ${GROUPING_LABELS[g.grouping]}`}
                />
              ))}
            </div>
          </>
        ) : (
          <Alert severity="warning">Nessuna configurazione fasce d'età selezionata</Alert>
        )}
      </Section>

      <Section title="Categorie">
        {(categoryConfig?.categories || []).length === 0 ? (
          <Alert severity="warning">Nessuna categoria configurata</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Categoria</TableCell>
                <TableCell>Cintura</TableCell>
                <TableCell>Fasce d'età</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryConfig.categories.map(category => (
                <TableRow key={category.categoryTypeId}>
                  <TableCell>{getCategoryName(category.categoryTypeId)}</TableCell>
                  <TableCell>{getCategoryBeltLabel(category.belt)}</TableCell>
                  <TableCell>{describeAgeGroups(category.ageGroupKeys)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Section title="Livelli di esperienza">
        {(categoryConfig?.experienceLevels || []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nessun livello di esperienza richiesto</Typography>
        ) : (
          categoryConfig.experienceLevels.map(level => (
            <Field
              key={`${level.competitionTypeId}_${level.grouping}`}
              label={`${getCompetitionTypeName(level.competitionTypeId)} - ${GROUPING_LABELS[level.grouping]}`}
              value={level.experienceIds.map(getExperienceName).join(', ')}
            />
          ))
        )}
      </Section>

      <Section title="Costi e pagamento">
        <Field label="IBAN" value={formData.iban} />
        <Field label="Intestatario" value={formData.intestatario} />
        <Field label="Causale" value={formData.causale} />
        <Field
          label="Richiesta tesseramento"
          value={costs.tesseramento?.enabled ? `${Number(costs.tesseramento.amount || 0).toFixed(2)} €` : 'Non prevista'}
        />
        {(costs.categories || []).map((config, index) => (
          <Field
            key={index}
            label={GROUPING_LABELS[config.grouping] || config.grouping}
            value={`${COST_TYPE_LABELS[config.type] || config.type} - ${formatCost(config)}`}
          />
        ))}
        {(costs.specialCategories || []).map(sc => (
          <Field
            key={sc.idConfigTipoCategoria}
            label={`Categoria speciale ${getCategoryName(sc.idConfigTipoCategoria)}`}
            value={`Singola ${Number(sc.singleCost).toFixed(2)} €${sc.withOthersCost !== null && sc.withOthersCost !== undefined ? ` | Con altre ${Number(sc.withOthersCost).toFixed(2)} €` : ''}`}
          />
        ))}
      </Section>
    </div>
  );
};

export default ReviewTab;
