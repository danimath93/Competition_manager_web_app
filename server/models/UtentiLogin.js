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
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  salt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('E', 'D', 'S'), // E=Enabled, D=Disabled, S=Suspended
    allowNull: false,
    defaultValue: 'E'
  },
  permissions: {
    // uso un array di testi per gestire i permessi
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  tableName: 'utenti_login',
  timestamps: true
});

module.exports = UtentiLogin;