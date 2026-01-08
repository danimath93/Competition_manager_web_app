const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nomeFile: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'nome_file'
  },
  file: {
    type: DataTypes.BLOB,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'mime_type'
  },
  dimensione: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipoDocumento: {
    type: DataTypes.ENUM(
      'logo_club',
      'circolare_gara',
      'file_extra1_competizione',
      'file_extra2_competizione',
      'locandina_competizione',
      'conferma_presidente',
      'altro'
    ),
    allowNull: false,
    field: 'tipo_documento'
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dataCaricamento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'data_caricamento'
  }
}, {
  tableName: 'documenti',
  timestamps: true,
  indexes: [
    {
      fields: ['tipo_documento']
    }
  ]
});

module.exports = Documento;
