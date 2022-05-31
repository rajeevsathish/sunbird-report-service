const Joi = require("joi");
const { get } = require('lodash');
const createError = require('http-errors')
var debug = require('debug')('validator');

const validationSchemaDefinitions = {
    ...require('./report'),
    ...require('./summary')
}

module.exports = (schemaKey, validateAgainst) => {
    return (req, res, next) => {
        const schema = validationSchemaDefinitions[schemaKey];
        const { error } = schema.validate(get(req, validateAgainst));

        //if validation fails pass the object object to the error handler.
        if (error) {
            debug('Validation failed', JSON.stringify(error));
            return next(createError(400, error.message));
        }

        //else move to the next middleware
        next();
    }
}