const createError = require('http-errors');
const reportRouter = require('./reports');
const errorHandler = require('../middleware/utils/errorHandler');

module.exports = app => {

  app.use(`/report`, reportRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(501));
  });

  //global error handler
  app.use(errorHandler());
}
