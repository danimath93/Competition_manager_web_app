const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Competizione = sequelize.define('Competizione', {
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
  dataInizio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dataFine: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (value <= this.dataInizio) {
          throw new Error('La data di fine deve essere successiva alla data di inizio');
        }
      }
    }
  },
  luogo: {
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
  tipologia: {
    type: DataTypes.ENUM('Kata', 'Kumite', 'Mista'),
    allowNull: false,
    defaultValue: 'Mista'
  },
  livello: {
    type: DataTypes.ENUM('Locale', 'Regionale', 'Nazionale', 'Internazionale'),
    allowNull: false,
    defaultValue: 'Locale'
  },
  stato: {
    type: DataTypes.ENUM('Pianificata', 'Aperta', 'In corso', 'Conclusa', 'Annullata'),
    allowNull: false,
    defaultValue: 'Pianificata'
  },
  maxPartecipanti: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  quotaIscrizione: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dataScadenzaIscrizioni: {
    type: DataTypes.DATE,
    allowNull: true
  },
  organizzatoreClubId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    }
  }
}, {
  tableName: 'competizioni',
  timestamps: true
});

module.exports = Competizione;
