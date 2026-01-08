const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IscrizioneClub = sequelize.define('IscrizioneClub', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    },
    field: 'club_id'
  },
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'competizioni',
      key: 'id'
    },
    field: 'competizione_id'
  },
  stato: {
    type: DataTypes.ENUM('In attesa', 'Confermata', 'Annullata'),
    allowNull: false,
    defaultValue: 'In attesa'
  },
  dataIscrizione: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'data_iscrizione'
  },
  dataConferma: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_conferma'
  },
  confermaPresidenteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documenti',
      key: 'id'
    },
    field: 'conferma_presidente_id',
    comment: 'Riferimento al documento conferma del presidente'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'iscrizioni_club',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['club_id', 'competizione_id']
    }
  ]
});

module.exports = IscrizioneClub;
