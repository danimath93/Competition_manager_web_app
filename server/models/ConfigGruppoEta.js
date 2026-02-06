const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigGruppoEta = sequelize.define('ConfigGruppoEta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    },
  },
  etaMinima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 4,
      max: 100
    },
    field: 'eta_minima',
    comment: 'Età minima per il gruppo'
  },
  etaMassima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 4,
      max: 100,
      isGreaterThanMin(value) {
        if (value < this.etaMinima) {
          throw new Error('L\'età massima deve essere maggiore o uguale all\'età minima');
        }
      }
    },
    field: 'eta_massima',
    comment: 'Età massima per il gruppo'
  },
  inizioValidita: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'inizio_validita',
    comment: 'Data di inizio validità del gruppo età'
  },
  fineValidita: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fine_validita',
    comment: 'Data di fine validità del gruppo età'
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  ordine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Ordine di visualizzazione'
  }
}, {
  tableName: 'config_gruppi_eta',
  timestamps: true,
  indexes: [
    {
      name: 'unique_nome_gruppo_eta',
      unique: true,
      fields: ['nome']
    }
  ]
});

module.exports = ConfigGruppoEta;
