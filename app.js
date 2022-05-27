const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var debug = require('debug')('report-service:server');

const mountRoutes = require('./routes')
const app = express();
const { sequelize } = require('./models');

app.use(logger('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//connect to the database and mount routes
(async () => {
    try {
        await sequelize.authenticate();
        // await sequelize.sync();
        debug('Connected to the database');
        mountRoutes(app);
    } catch (error) {
        debug('Unable to connect to database', error);
        process.exit(1);
    }
})()

module.exports = app;
