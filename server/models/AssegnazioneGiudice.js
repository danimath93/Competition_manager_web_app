const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssegnazioneGiudice = sequelize.define('AssegnazioneGiudice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  giudiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'giudici',
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
  ruolo: {
    type: DataTypes.ENUM('Principale', 'Assistente', 'Arbitro'),
    allowNull: false,
    defaultValue: 'Assistente'
  },
  dataAssegnamento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  stato: {
    type: DataTypes.ENUM('Assegnato', 'Confermato', 'Rifiutato'),
    allowNull: false,
    defaultValue: 'Assegnato'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'assegnazione_giudici',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['giudiceId', 'categoriaId', 'ruolo']
    }
  ]
});

module.exports = AssegnazioneGiudice;
