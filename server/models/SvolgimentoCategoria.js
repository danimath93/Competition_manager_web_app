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
    field: 'categoria_id',
    references: {
      model: 'categorie',
      key: 'id'
    }
  },
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'competizione_id',
    references: {
      model: 'competizioni',
      key: 'id'
    }
  },
  commissioneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'commissione_id'
  },
  letteraEstratta: {
    type: DataTypes.STRING(1),
    allowNull: true,
    field: 'lettera_estratta'
  },
  // Per Quyen: punteggi, classifica
  punteggi: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  classifica: {
    type: DataTypes.JSONB,
    allowNull: true,
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
    type: DataTypes.ENUM('In definizione', 'In corso', 'Conclusa'),
    allowNull: false,
    defaultValue: 'In definizione'
  }
}, {
  tableName: 'svolgimento_categorie',
  timestamps: true
});

module.exports = SvolgimentoCategoria;