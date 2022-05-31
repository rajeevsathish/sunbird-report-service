const createError = require('http-errors');
const _ = require('lodash');
var debug = require('debug')('middleware:authentication:tokenValidator');

const { validateJwtToken } = require('../../helpers/token_validation');

/**
 * @description [verifyToken - Used to validate the token and add userid into headers
 */
function verifyToken({ tokenRequired = true }) {
    return async (req, res, next) => {
        try {
            var token = req.get('x-authenticated-user-token');
            delete req.headers['x-authenticated-userid'];

            if (!token) {
                if (tokenRequired) {
                    throw new Error();
                } else {
                    return next();
                }
            }


            const { status, result, error } = await validateJwtToken(token);

            if (status === 'failed' && error) {
                debug('Token verification failed', JSON.stringify(error));
                return next(createError(401, error.message));
            }

            if (status === 'success' && result) {
                const sub = _.get(result, 'payload.sub');
                debug('Token verification success', JSON.stringify(result));
                if (sub) {
                    var [, , userId] = sub.split(':');
                    if (userId) {
                        req.headers['x-authenticated-userid'] = userId;
                        req.tokenData = result;
                    }
                }
            }

            next();

        } catch (error) {
            debug('Token verification failed', JSON.stringify(error));
            return next(createError(401, 'unauthorized access'));
        }
    }
}

module.exports = { verifyToken }