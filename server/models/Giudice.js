const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Giudice = sequelize.define('Giudice', {
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
  cognome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  dataNascita: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    fieldq: 'data_nascita'
  },
  codiceFiscale: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
    validate: {
      len: [16, 16]
    },
    field: 'codice_fiscale'
  },
  livelloEsperienza: {
    type: DataTypes.ENUM('Aspirante', 'Regionale', 'Nazionale', 'Internazionale'),
    allowNull: false,
    defaultValue: 'Aspirante',
    field: 'livello_esperienza'
  },
  specializzazione: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Specializzazione del giudice (es: Kata, Kumite, etc.)'
  },
  certificazioni: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lista delle certificazioni del giudice'
  },
  telefono: {
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
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    }
  }
}, {
  tableName: 'giudici',
  timestamps: true
});

module.exports = Giudice;
