const _ = require('lodash');
const createErrors = require('http-errors');
var debug = require('debug')('middleware:authentication:userDetailsMiddlware');

const { userRead } = require("../../helpers/userHelper");

const fetchUserDetails = () => {
    return async (req, res, next) => {
        var token = req.get('x-authenticated-user-token');
        var userId = req.get('x-authenticated-userid');

        if (token && userId) {
            try {
                const response = await userRead({ userId, headers: { 'x-authenticated-user-token': token, 'x-auth-token': token } });
                const userDetails = _.get(response, 'data.result.response');
                debug('User Read Api Success', JSON.stringify(userDetails));
                req.userDetails = userDetails;
            } catch (error) {
                const statusCode = _.get(error, 'response.status');
                debug('User Read Api failed', JSON.stringify(error));
                return next(createErrors(statusCode || 500, _.get(error, 'message')));
            }
        }

        next();
    }
}

module.exports = {
    fetchUserDetails
}