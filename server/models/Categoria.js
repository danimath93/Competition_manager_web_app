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
  competizioneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'competizioni',
      key: 'id'
    }
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
  genere: {
    type: DataTypes.ENUM('M', 'F', 'U'),
    allowNull: false,
    defaultValue: 'U'
  },
  gruppoEtaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'config_gruppi_eta',
      key: 'id'
    },
    field: 'gruppo_eta_id'
  },
  pesoMassimo: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 20.0,
      max: 200.0
    }
  },
  numeroTurni: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  gradoCinturaId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'config_gradi_cinture',
      key: 'id'
    },
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
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  tableName: 'categorie',
  timestamps: true
});

module.exports = Categoria;
