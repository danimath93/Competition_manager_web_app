const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigEsperienza = sequelize.define(
  'ConfigEsperienza',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    belt: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'all',
      validate: {
        isIn: [['all', 'whiteBelt', 'blackBelt']],
      },
      comment: 'Cintura a cui si applica il livello: all | whiteBelt (solo CB) | blackBelt (solo CN). Filtro in fase di iscrizione',
    },
    sportGroup: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: 'sport_group',
      validate: {
        isIn: [['Viet Vo Dao', 'Viet Vo Dao Junior', 'Viet Tai Chi', 'Mixed Style', 'Viet Vo Dao CN']],
      },
      comment: 'Gruppo sportivo del livello, usato per raggrupparli in configurazione (null = nessun gruppo)',
    },
    descrizione: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    tipiCompetizione: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'tipi_competizione',
    },
  },
  {
    tableName: 'config_esperienza',
    timestamps: false,
  }
);

module.exports = ConfigEsperienza;
