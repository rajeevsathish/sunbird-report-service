'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
var debug = require('debug')('report-service:server');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'production';
const config = require(__dirname + '/../config/config.json')[env];
const { aliasDefinitions } = require('../helpers/sequalizeOperatorAliasDefinitions');
const { envVariables: { DB } } = require('../helpers/envHelpers');
const db = {};

let sequelize;
debug(config);
if (config.use_env_variable) {
  sequelize = new Sequelize(DB.NAME, DB.USER, DB.PASSWORD, { ...config, host: DB.HOST, operatorsAliases: aliasDefinitions });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, { ...config, operatorsAliases: aliasDefinitions });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
