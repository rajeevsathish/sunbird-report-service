const createError = require('http-errors');
const { validateToken } = require('../../helpers/token_validation');

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


            const { status, result, error } = await validateToken(token);

            if (status === 'failed' && error) {
                return next(createError(401, error.message));
            }

            if (status === 'success' && result) {
                if ('userId' in result) {
                    var [, , userId] = result.userId.split(':');
                    if (userId) {
                        req.headers['x-authenticated-userid'] = userId;
                        req.tokenData = result;
                    }
                }
            }

            next();

        } catch (error) {
            return next(createError(401, 'unauthorized access'));
        }
    }
}

module.exports = { verifyToken }