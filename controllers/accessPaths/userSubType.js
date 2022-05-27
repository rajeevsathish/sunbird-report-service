const _ = require('lodash');

/**
 * @description accesspath rule definition of user's subType
 * 
 */

module.exports = {
    ruleName: 'userSubType',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userSubType = _.get(user, 'profileUserType.subType');
        if (!userSubType) return false;
        return _.some(payload, type => _.toLower(type) === _.toLower(userSubType));
    }
}