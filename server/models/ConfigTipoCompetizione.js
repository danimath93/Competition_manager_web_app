const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigTipoCompetizione = sequelize.define('ConfigTipoCompetizione', {
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
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'config_tipo_competizioni',
  timestamps: true,
  indexes: [
    {
      name: 'unique_nome_tipo_competizione',
      unique: true,
      fields: ['nome']
    }
  ]
});

module.exports = ConfigTipoCompetizione;