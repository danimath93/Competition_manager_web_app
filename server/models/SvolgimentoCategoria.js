const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SvolgimentoCategoria = sequelize.define('SvolgimentoCategoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorie',
      key: 'id'
    }
  },
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'competizioni',
      key: 'id'
    }
  },
  letteraEstratta: {
    type: DataTypes.STRING(1),
    allowNull: true
  },
  // Per Quyen: punteggi, classifica, commissione
  punteggi: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  classifica: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  commissione: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  // Per Light Contact: struttura tabellone, risultati incontri
  tabellone: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  risultati: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  stato: {
    type: DataTypes.ENUM('nuovo', 'in_progress', 'completato'),
    allowNull: false,
    defaultValue: 'nuovo'
  }
}, {
  tableName: 'svolgimento_categorie',
  timestamps: true
});

module.exports = SvolgimentoCategoria;