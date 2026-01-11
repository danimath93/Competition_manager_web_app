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
  gestioneLivelloAtleti: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: true,
    field: 'gestione_livello_atleti',
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
  costiIscrizione: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'costi_iscrizione',
    comment: 'Struttura JSON: { specials: { insurance: 5 }, categories: [{ idConfigTipoAtleta: 1, type: "fixed|minimum|additional", config: {...} }] }'
  },
  iban: {
    type: DataTypes.STRING,
    allowNull: true
  },
  intestatario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  causale: {
    type: DataTypes.STRING,
    allowNull: true
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
  circolareGaraId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documenti',
      key: 'id'
    },
    field: 'circolare_gara_id',
    comment: 'Riferimento al documento circolare di gara'
  },
  locandinaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documenti',
      key: 'id'
    },
    field: 'locandina_id',
    comment: 'Riferimento al documento locandina della competizione'
  },
  fileExtra1Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documenti',
      key: 'id'
    },
    field: 'file_extra_1_id',
    comment: 'Riferimento a documento extra 1'
  },
  fileExtra2Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documenti',
      key: 'id'
    },
    field: 'file_extra_2_id',
    comment: 'Riferimento a documento extra 2'
  }
}, {
  tableName: 'competizioni',
  timestamps: true
});

module.exports = Competizione;
