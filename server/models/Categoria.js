const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
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
  tipologia: {
    type: DataTypes.ENUM('Kata', 'Kumite'),
    allowNull: false
  },
  genere: {
    type: DataTypes.ENUM('Maschile', 'Femminile', 'Misto'),
    allowNull: false,
    defaultValue: 'Misto'
  },
  etaMinima: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 5,
      max: 100
    }
  },
  etaMassima: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 5,
      max: 100,
      isGreaterThanMinAge(value) {
        if (this.etaMinima && value <= this.etaMinima) {
          throw new Error('L\'età massima deve essere maggiore dell\'età minima');
        }
      }
    }
  },
  pesoMinimo: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 20.0,
      max: 200.0
    }
  },
  pesoMassimo: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 20.0,
      max: 200.0,
      isGreaterThanMinWeight(value) {
        if (this.pesoMinimo && value <= this.pesoMinimo) {
          throw new Error('Il peso massimo deve essere maggiore del peso minimo');
        }
      }
    }
  },
  gradoMinimo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Grado/cintura minimo richiesto'
  },
  maxPartecipanti: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 2
    }
  },
  stato: {
    type: DataTypes.ENUM('Aperta', 'Chiusa', 'In corso', 'Conclusa'),
    allowNull: false,
    defaultValue: 'Aperta'
  },
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'competizioni',
      key: 'id'
    }
  },
  configTipoCategoriaId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Nullable per categorie esistenti
    references: {
      model: 'config_tipo_categorie',
      key: 'id'
    },
    field: 'config_tipo_categoria_id'
  }
}, {
  tableName: 'categorie',
  timestamps: true
});

module.exports = Categoria;
