const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfigNomiQuyen = sequelize.define('ConfigNomiQuyen', {
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
  tipoCategoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'config_tipo_categorie',
      key: 'id'
    },
    field: 'tipo_categoria_id'
  },
  esperienzeId: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
    field: 'esperienze_id'
  },
  attivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'config_nomi_quyen',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ConfigNomiQuyen;
