const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MEMBERSHIP_TYPE_GROUPS = ['competition', 'association'];

const MembershipType = sequelize.define(
  'MembershipType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      comment: 'Nome visualizzato e salvato come testo su club (association) e dettagli iscrizione atleta (competition)',
    },
    group: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [MEMBERSHIP_TYPE_GROUPS],
      },
      comment: 'competition: tesseramento atleta in iscrizione gara | association: affiliazione del club in registrazione',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    comment: 'Id 1 riservato a "Richiedi tesseramento" (vedi helpers/membershipTypes.js MEMBERSHIP_REQUEST_ID)',
    tableName: 'membership_types',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'unique_membership_type_group_name',
        unique: true,
        fields: ['group', 'name'],
      },
    ],
  }
);

MembershipType.GROUPS = MEMBERSHIP_TYPE_GROUPS;

module.exports = MembershipType;
