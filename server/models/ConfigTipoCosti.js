const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigTipoCosti = sequelize.define('ConfigTipoCosti', {
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
  tableName: 'config_tipo_costi',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'unique_nome_tipo_costi',
      unique: true,
      fields: ['nome']
    }
  ]
});

module.exports = ConfigTipoCosti;
