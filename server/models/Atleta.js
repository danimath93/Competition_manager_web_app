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
  codiceFiscale: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
    validate: {
      len: [16, 16]
    },
    field: 'codice_fiscale'
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 30.0,
      max: 200.0
    }
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Categoria di peso (es: -60kg, -70kg, etc.)'
  },
  grado: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Grado/cintura dell\'atleta'
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
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
