'use strict';
const { Model, fn, UUIDV4 } = require('sequelize');
const { envVariables } = require('../helpers/envHelpers');
const CONSTANTS = require('../resources/constants.json');

module.exports = (sequelize, DataTypes) => {

  class report extends Model {

    static associate(models) {
      //associations with other tables
      this.hasMany(models.report_status, { foreignKey: 'reportid', as: 'children' });
      this.hasMany(models.report_summary, { foreignKey: 'reportid' });
    }

  }

  report.init({
    reportid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    authorizedroles: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(CONSTANTS.REPORT_STATUS),
      defaultValue: CONSTANTS.REPORT_STATUS.DRAFT
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(CONSTANTS.REPORT_TYPE),
      defaultValue: CONSTANTS.REPORT_TYPE.PRIVATE
    },
    reportaccessurl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    createdon: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: fn('now')
    },
    updatedon: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: fn('now')
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reportconfig: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    templateurl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reportgenerateddate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: fn('now')
    },
    reportduration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        startdate: fn('now'),
        enddate: fn('now')
      }
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    updatefrequency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    report_type: {
      type: DataTypes.STRING,
      defaultValue: 'report'
    },
    accesspath: {
      type: DataTypes.JSONB
    },
    visibilityflags: {
      type: DataTypes.JSONB
    }
  },
    {
      sequelize,
      modelName: 'report',
      tableName: 'report',
      timestamps: false,
      hooks: {
        beforeValidate(report, options) {
          report.reportaccessurl = `${envVariables.ENV}/dashBoard/reports/${report.reportid}`;
        },
        beforeUpdate(report, options) {
          report.updatedon = Date.now();
        }
      }
    });
  return report;
};