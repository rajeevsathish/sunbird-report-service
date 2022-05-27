const CONSTANTS = require('../resources/constants.json');

//Factory function to generate the params object inside the api response.
const getDefaultParams = ({ err = null, errmsg = null, status = CONSTANTS.STATUS.SUCCESS }) => {
    const { v4 } = require('uuid');
    const uuid = v4();
    return {
        err,
        errmsg,
        msgid: uuid,
        resmsgid: uuid,
        status
    }
}

// Api Response Formatter factory function.
const formatApiResponse = ({ id = 'report.api', params = getDefaultParams({}), responseCode = CONSTANTS.RESPONSE_CODE.SUCCESS, result = {} }) => ({
    id, params, responseCode, result,
});

module.exports = { formatApiResponse, getDefaultParams };