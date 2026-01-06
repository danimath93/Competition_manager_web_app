const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CertificatoMedico = sequelize.define('CertificatoMedico', {
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
    allowNull: false,
    comment: 'File binario del certificato medico'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'application/pdf',
    field: 'mime_type'
  },
  dimensione: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Dimensione del file in bytes'
  },
  dataCaricamento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'data_caricamento'
  }
}, {
  tableName: 'certificati_medici',
  timestamps: true
});

module.exports = CertificatoMedico;
