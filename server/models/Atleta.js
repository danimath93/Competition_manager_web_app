const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Atleta = sequelize.define('Atleta', {
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
  cognome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  dataNascita: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'data_nascita'
  },
  sesso: {
    type: DataTypes.ENUM('M', 'F'),
    allowNull: false
  },
  codiceFiscale: {
    type: DataTypes.STRING(16),
    allowNull: true,
    unique: true,
    validate: {
      len: [16, 16]
    },
    field: 'codice_fiscale'
  },
  tesseramento: {
    type: DataTypes.ENUM('FIWUK', 'ASI'),
    allowNull: true,
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 20.0,
      max: 200.0
    }
  },
  tipoAtletaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'config_tipo_atleta',
      key: 'id'
    },
    comment: 'livello generale dell\'atleta'
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    },
    field: 'club_id'
  }
}, {
  tableName: 'atleti',
  timestamps: true
});

module.exports = Atleta;
