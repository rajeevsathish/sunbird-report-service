const _ = require('lodash');

/**
 * @description accesspath rule definition of user's rootOrg id
 * 
 */


module.exports = {
    ruleName: 'rootOrg',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userRootOrg = _.get(user, 'rootOrgId');
        if (!userRootOrg) return false;
        return _.some(payload, value => _.toLower(value) === _.toLower(userRootOrg));
    }
}