const _ = require('lodash');

/**
 * @description accesspath rule definition of user's Type value
 * 
 */

module.exports = {
    ruleName: 'userType',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userType = _.get(user, 'profileUserType.type');
        if (!userType) return false;
        return _.some(payload, type => _.toLower(type) === _.toLower(userType));
    }
}