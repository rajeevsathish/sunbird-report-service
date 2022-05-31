var debug = require('debug')('util:errorHandler');

const { formatApiResponse, getDefaultParams } = require('../../helpers/responseFormatter');
const CONSTANTS = require('../../resources/constants.json')

module.exports = () => (err, req, res, next) => {
    debug('Error', JSON.stringify(err));
    const statusCode = err.statusCode || 500;
    
    const paramsObject = getDefaultParams({
        err: err.errorObject || null,
        errmsg: err.message || null,
        status: CONSTANTS.STATUS.FAILED
    })

    res.status(statusCode).json(formatApiResponse({
        id: req.id,
        statusCode: CONSTANTS.RESPONSE_CODE.FAILED,
        result: {},
        params: paramsObject,
        responseCode: CONSTANTS.RESPONSE_CODE.FAILED
    }));

}