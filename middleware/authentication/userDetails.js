const _ = require('lodash');
const createErrors = require('http-errors');
const { userRead } = require("../../helpers/userHelper");

const fetchUserDetails = () => {
    return async (req, res, next) => {
        var token = req.get('x-authenticated-user-token');
        var userId = req.get('x-authenticated-userid');

        if (token && userId) {
            try {
                const response = await userRead({ userId, headers: { 'x-authenticated-user-token': token, 'x-auth-token': token } });
                const userDetails = _.get(response, 'data.result.response');
                req.userDetails = userDetails;
            } catch (error) {
                return next(createErrors(500, _.get(error, 'message')));
            }
        }

        next();
    }
}

module.exports = {
    fetchUserDetails
}