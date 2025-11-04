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
  tipiCompetizione: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    defaultValue: [],
    field: 'tipi_competizione'
  },
  categorieAtleti: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: false,
    defaultValue: [],
    validate: {
      notEmpty: {
        msg: 'Deve essere selezionata almeno una categoria valida'
      },
    },
    field: 'categorie_atleti',
    comment: 'Struttura per gestire le categorie/esperienze ammesse alla competizione, per ogni tipologia di atleta'
  },
  livello: {
    type: DataTypes.ENUM('Locale', 'Regionale', 'Nazionale', 'Internazionale'),
    allowNull: false,
    defaultValue: 'Locale'
  },
  stato: {
    type: DataTypes.ENUM('Pianificata', 'Aperta', 'In preparazione', 'In corso', 'Conclusa', 'Annullata'),
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
  },
  maxCategorieAtleta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    },
    field: 'max_categorie_atleta'
  },
  clubIscritti: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
    field: 'club_iscritti'
  },
  circolareGara: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'circolare_gara'
  },
  circolareGaraNome: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'circolare_gara_nome'
  },
  circolareGaraTipo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'circolare_gara_tipo'
  },
  fileExtra1: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'file_extra_1'
  },
  fileExtra1Nome: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_extra_1_nome'
  },
  fileExtra1Tipo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_extra_1_tipo'
  },
  fileExtra2: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'file_extra_2'
  },
  fileExtra2Nome: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_extra_2_nome'
  },
  fileExtra2Tipo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_extra_2_tipo'
  }
}, {
  tableName: 'competizioni',
  timestamps: true
});

module.exports = Competizione;
