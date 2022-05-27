const _ = require('lodash');

module.exports = {
    ruleName: 'rootOrg',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userRootOrg = _.get(user, 'rootOrgId');
        if (!userRootOrg) return false;
        return _.some(payload, value => _.toLower(value) === _.toLower(userRootOrg));
    }
}