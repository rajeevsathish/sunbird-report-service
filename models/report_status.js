'use strict';
const { Model } = require('sequelize');
const CONSTANTS = require('../resources/constants.json');

module.exports = (sequelize, DataTypes) => {
  class report_status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.report, { foreignKey: 'reportid', foreignKeyConstraint: true, onDelete: 'CASCADE' })
    }
  }
  report_status.init({
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(CONSTANTS.REPORT_STATUS),
      defaultValue: CONSTANTS.REPORT_STATUS.DRAFT
    },
    reportid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    hashed_val: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'report_status',
    tableName: 'report_status',
    timestamps: false
  });
  return report_status;
};