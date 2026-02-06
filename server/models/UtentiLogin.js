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
  salt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('E', 'D', 'S'), // E=Enabled, D=Disabled, S=Suspended
    allowNull: false,
    defaultValue: 'E'
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    },
    field: 'club_id'
  },
  permissions: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  },
  confirmationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'confirmation_token'
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reset_password_token'
  }
}, {
  tableName: 'utenti_login',
  timestamps: true,
  indexes: [
    {
      name: 'unique_utenti_username',
      unique: true,
      fields: ['username']
    },
    {
      name: 'unique_utenti_email',
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = UtentiLogin;