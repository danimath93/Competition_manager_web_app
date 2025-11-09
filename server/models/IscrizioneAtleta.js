const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IscrizioneAtleta = sequelize.define('IscrizioneAtleta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  atletaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'atleti',
      key: 'id'
    },
    field: 'atleta_id'
  },
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'competizioni',
      key: 'id'
    },
    field: 'competizione_id'
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
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorie',
      key: 'id'
    },
    field: 'categoria_id'
  },
  idConfigEsperienza: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'config_esperienza',
      key: 'id'
    },
    field: 'id_config_esperienza'
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 20.0,
      max: 200.0
    }
  },
  dataIscrizione: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  stato: {
    type: DataTypes.ENUM('Confermata', 'In attesa', 'Annullata'),
    allowNull: false,
    defaultValue: 'In attesa'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'iscrizioni_atleti',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['atleta_id', 'tipo_categoria_id', 'competizione_id']
    }
  ]
});

module.exports = IscrizioneAtleta;
