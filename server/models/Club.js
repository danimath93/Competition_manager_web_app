const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  denominazione: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  codiceFiscale: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  partitaIva: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  indirizzo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  legaleRappresentante: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  direttoreTecnico: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  recapitoTelefonico: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  logo: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  logoType: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'clubs',
  timestamps: true
});

module.exports = Club;
