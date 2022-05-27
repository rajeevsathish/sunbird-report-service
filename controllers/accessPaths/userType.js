const _ = require('lodash');

module.exports = {
    ruleName: 'userType',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userType = _.get(user, 'profileUserType.type');
        if (!userType) return false;
        return _.some(payload, type => _.toLower(type) === _.toLower(userType));
    }
}