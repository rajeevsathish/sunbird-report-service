'use strict';
const { Model, fn, UUIDV4 } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class report_summary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.report, { foreignKey: 'reportid' })
    }
  }
  report_summary.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    reportid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chartid: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdon: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: fn('now')
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    param_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'report_summary',
    tableName: 'report_summary',
    timestamps: false,
  });
  return report_summary;
};