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
  certificatiMedici: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'certificati_medici'
  },
  certificatiMediciNome: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'certificati_medici_nome'
  },
  certificatiMediciTipo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'certificati_medici_tipo'
  },
  autorizzazioni: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'autorizzazioni'
  },
  autorizzazioniNome: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'autorizzazioni_nome'
  },
  autorizzazioniTipo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'autorizzazioni_tipo'
  },
  confermaPresidente: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'conferma_presidente'
  },
  confermaPresidenteNome: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'conferma_presidente_nome'
  },
  confermaPresidenteTipo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'conferma_presidente_tipo'
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
