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
  luogoNascita: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'luogo_nascita'
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
  },
  numeroTessera: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'numero_tessera'
  },
  scadenzaCertificato: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'scadenza_certificato'
  },
  certificatoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'certificati_medici',
      key: 'id'
    },
    field: 'certificato_id'
  },
}, {
  tableName: 'atleti',
  timestamps: true
});

module.exports = Atleta;
