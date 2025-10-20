const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigGradoCintura = sequelize.define('ConfigGradoCintura', {
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
    },
  },
  gruppo: {
    type: DataTypes.ENUM('Bambini', 'Adulti', 'Cinture Nere'),
    allowNull: false,
    unique: false,
    validate: {
      notEmpty: true
    },
  },
  ordine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false,
    validate: {
      notEmpty: true
    },
  }
}, {
  tableName: 'config_gradi_cinture',
  timestamps: false
});

module.exports = ConfigGradoCintura;
