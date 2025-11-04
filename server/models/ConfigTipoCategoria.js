const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigTipoCategoria = sequelize.define('ConfigTipoCategoria', {
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
  tipoCompetizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'config_tipo_competizioni',
      key: 'id'
    },
    field: 'tipo_competizione_id'
  },
  idConfigTipiAtleti: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
    field: 'id_config_tipi_atleti'
  },
  obbligoPeso: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'obbligo_peso'
  },
  attivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'config_tipo_categorie',
  timestamps: true
});

module.exports = ConfigTipoCategoria;