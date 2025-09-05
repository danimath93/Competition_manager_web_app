const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IscrizioneAtleta = sequelize.define('IscrizioneAtleta', {
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
    }
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorie',
      key: 'id'
    }
  },
  dataIscrizione: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  stato: {
    type: DataTypes.ENUM('Confermata', 'In attesa', 'Annullata'),
    allowNull: false,
    defaultValue: 'Confermata'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'iscrizioni_atleti',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['atletaId', 'categoriaId']
    }
  ]
});

module.exports = IscrizioneAtleta;
