const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigEsperienza = sequelize.define('ConfigEsperienza', {
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
    },
  },
  idConfigTipoAtleta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'DEPRECATO: sostituito da belt. Mantenuto per lo storico, da rimuovere dopo la conversione dei dati',
    field: 'id_config_tipo_atleta',
    references: {
      model: 'config_tipo_atleta',
      key: 'id'
    }
  },
  idConfigGruppoEsperienza: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_config_gruppo_esperienza',
  },
  belt: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'all',
    validate: {
      isIn: [['all', 'whiteBelt', 'blackBelt']]
    },
    comment: 'Cintura a cui si applica il livello: all | whiteBelt (solo CB) | blackBelt (solo CN). Filtro in fase di iscrizione'
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  tipiCompetizione: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'tipi_competizione'
  }
}, {
  tableName: 'config_esperienza',
  timestamps: false
});

module.exports = ConfigEsperienza;
