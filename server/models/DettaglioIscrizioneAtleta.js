const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DettaglioIscrizioneAtleta = sequelize.define('DettaglioIscrizioneAtleta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  atletaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'atleti',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    field: 'atleta_id'
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 20.0,
      max: 200.0
    }
  },
  gradoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'config_esperienza',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    field: 'grado_id'
  },
  tesseramento: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'competizioni',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    field: 'competizione_id'
  },
  quota: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'dettagli_iscrizione_atleti',
  timestamps: true
});

module.exports = DettaglioIscrizioneAtleta;
