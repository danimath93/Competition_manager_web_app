const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigTipoCategoria = sequelize.define(
  'ConfigTipoCategoria',
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
    descrizione: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipoCompetizioneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'config_tipo_competizioni',
        key: 'id',
      },
      field: 'tipo_competizione_id',
    },
    defaultGroupings: {
      type: DataTypes.ARRAY(DataTypes.STRING(20)),
      allowNull: false,
      defaultValue: ['children', 'adults'],
      field: 'default_groupings',
      validate: {
        isValidGroupings(value) {
          if (!Array.isArray(value) || value.some((g) => !['children', 'adults'].includes(g))) {
            throw new Error('defaultGroupings ammette solo "children" e "adults"');
          }
        },
      },
      comment: 'Raggruppamenti (children/adults) proposti di default nella matrice categorie x fasce età',
    },
    obbligoPeso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'obbligo_peso',
    },
    ordine: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    attivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'config_tipo_categorie',
    timestamps: true,
  }
);

module.exports = ConfigTipoCategoria;
