import React from 'react';
import { TextField } from '@mui/material';
import { CompetitionStatus, CompetitionLevel } from '../../constants/enums/CompetitionEnums';
import { TextInput } from '../common';
import Button from '../common/Button';
import '../styles/Layout.css';
import '../styles/Register.css';

const GeneralInfoTab = ({ formData, onChange, onSubmit }) => {
  const handleChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="register-form" style={{ maxWidth: "1024px" }}>
      <h6 className="text-primary text-center register-section-title">Definizione competizione</h6>
      
      <div className="register-form-grid">
        <TextInput
          id="nome"
          name="nome"
          label="Nome Competizione"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Nome competizione"
          required
          autoComplete="nome"
        />

        <TextInput
          name="luogo"
          label="Luogo"
          value={formData.luogo}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextInput
          name="indirizzo"
          label="Indirizzo"
          value={formData.indirizzo}
          onChange={handleChange}
          fullWidth
        />

        <div className="text-input-container">
          <label className="text-input-label">
            <h6>
              Livello
              <span className="required-asterisk">*</span>
            </h6>
          </label>
          <TextField
            name="livello"
            value={formData.livello}
            onChange={handleChange}
            placeholder="Seleziona livello"
            fullWidth
            required
            select
            SelectProps={{ native: true }}
          >
            {Object.entries(CompetitionLevel).map(([value, label]) => (
              <option key={value} value={label}>
                {label}
              </option>
            ))}
          </TextField>
        </div>

        <TextInput
          name="dataInizio"
          label="Data Inizio"
          type="date"
          value={formData.dataInizio}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextInput
          name="dataFine"
          label="Data Fine"
          type="date"
          value={formData.dataFine}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextInput
          name="dataScadenzaIscrizioni"
          label="Data Scadenza Iscrizioni"
          type="date"
          value={formData.dataScadenzaIscrizioni}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <h6 className="text-primary text-center register-section-title">Informazioni aggiuntive</h6>

        <TextInput
          name="descrizione"
          label="Descrizione"
          value={formData.descrizione}
          onChange={handleChange}
          fullWidth
          multiline
        />

        <h6 className="text-primary text-center register-section-title">Informazioni organizzative</h6>
        <TextInput
          name="stato"
          label="Stato Competizione"
          value={formData.stato}
          onChange={handleChange}
          fullWidth
          required
          select
          SelectProps={{ native: true }}
        >
          {Object.entries(CompetitionStatus).map(([value, label]) => (
            <option key={value} value={label}>
              {label}
            </option>
          ))}
        </TextInput>

        <TextInput
          name="maxCategorieAtleta"
          label="Numero Massimo Categorie per Atleta"
          type="number"
          required
          value={formData.maxCategorieAtleta}
          onChange={handleChange}
          fullWidth
        />

        <TextInput
          name="maxPartecipanti"
          label="Numero Massimo Partecipanti"
          type="number"
          value={formData.maxPartecipanti}
          onChange={handleChange}
          fullWidth
        />

      </div>
      {/* Pulsante Conferma */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <Button type="submit" size="l" variant="primary">
          Salva competizione
        </Button>
      </div>
    </form>
  );
};

export default GeneralInfoTab;
