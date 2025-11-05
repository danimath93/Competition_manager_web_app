const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigEsperienza = sequelize.define('ConfigEsperienza', {
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
    },
  },
  idConfigTipoAtleta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_config_tipo_atleta',
    references: {
      model: 'config_tipo_atleta',
      key: 'id'
    }
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  tipiCompetizione: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'tipi_competizione'
  }
}, {
  tableName: 'config_esperienza',
  timestamps: false
});

module.exports = ConfigEsperienza;
