const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigTipoAtleta = sequelize.define('ConfigTipoAtleta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  etaMinima: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'eta_minima'
  },
  etaMassima: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'eta_massima'
  },
  descrizione: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notEmpty: true
    }
  },
}, {
  tableName: 'config_tipo_atleta',
  timestamps: false,
  indexes: [
    {
      name: 'unique_nome_tipo_atleta',
      unique: true,
      fields: ['nome']
    }
  ]
});

module.exports = ConfigTipoAtleta;