const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  denominazione: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  codiceFiscale: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  partitaIva: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  indirizzo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  legaleRappresentante: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  direttoreTecnico: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  recapitoTelefonico: {
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
  logoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documenti',
      key: 'id'
    },
    field: 'logo_id',
    comment: 'Riferimento al documento logo del club'
  },
  abbreviazione: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tesseramento: {
    type: DataTypes.STRING,
    allowNull: true
  }
},
  {
    tableName: 'clubs',
    timestamps: true,
    indexes: [
      {
        name: 'unique_club_denominazione',
        unique: true,
        fields: ['denominazione']
      }
    ]
  }
);

module.exports = Club;
