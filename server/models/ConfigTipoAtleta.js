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
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  etaMinima: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  etaMassima: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  timestamps: false
});

module.exports = ConfigTipoAtleta;