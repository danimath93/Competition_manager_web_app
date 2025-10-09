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
    allowNull: false,
    field: 'data_inizio',
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
    },
    field: 'data_fine'
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
    type: DataTypes.ENUM('Quyen mani nude', 'Quyen con armi', 'Quyen misti', 'Quyen a squadre', 'Combattimenti', 'Mista'),
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
    },
    field: 'max_partecipanti'
  },
  quotaIscrizione: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      min: 0
    },
    field: 'quota_iscrizione'
  },
  dataScadenzaIscrizioni: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_scadenza_iscrizioni'
  },
  organizzatoreClubId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    },
    field: 'organizzatore_club_id'
  }
}, {
  tableName: 'competizioni',
  timestamps: true
});

module.exports = Competizione;
