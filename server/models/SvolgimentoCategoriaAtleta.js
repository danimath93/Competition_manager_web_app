const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SvolgimentoCategoriaAtleta = sequelize.define('SvolgimentoCategoriaAtleta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  svolgimentoCategoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'svolgimento_categorie',
      key: 'id'
    }
  },
  atletaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cognome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  club: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grado: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ordine: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  seed: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  extra: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'svolgimento_categorie_atleti',
  timestamps: true
});

module.exports = SvolgimentoCategoriaAtleta;
