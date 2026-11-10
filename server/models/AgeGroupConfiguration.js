const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { validateAgeGroupConfig } = require('../helpers/ageGroups');

const AgeGroupConfiguration = sequelize.define('AgeGroupConfiguration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    },
    field: 'club_id',
    comment: 'Club proprietario. NULL = configurazione di default (sola lettura)'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidConfig(value) {
        const { valid, errors } = validateAgeGroupConfig(value);
        if (!valid) {
          throw new Error(errors.join('; '));
        }
      }
    },
    comment: 'Struttura JSON: { version: 1, mode: "age|seasonAge", seasonStart?: "MM-DD", groups: [{ key, label, order, minAge, maxAge }] } - vedi helpers/ageGroups.js'
  },
  isDefault: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('clubId') === null;
    }
  }
}, {
  tableName: 'age_group_configurations',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      name: 'unique_age_group_configuration_club_name',
      unique: true,
      fields: ['club_id', 'name'],
      where: { deleted_at: null }
    }
  ]
});

module.exports = AgeGroupConfiguration;
