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
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['atleta_id', 'competizione_id'],
      name: 'unique_atleta_competizione'
    }
  ]
});

module.exports = DettaglioIscrizioneAtleta;
