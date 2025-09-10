const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UtentiLogin = sequelize.define('UtentiLogin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
}, {
  tableName: 'utenti_login',
  timestamps: true
});

module.exports = UtentiLogin;