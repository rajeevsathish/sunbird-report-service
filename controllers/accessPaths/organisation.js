const _ = require('lodash');

/**
 * @description accesspath rule definition of user's organization
 * 
 */

module.exports = {
    ruleName: 'organisation',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userOrgs = _.get(user, 'organisations');
        if (!userOrgs) return false;
        if (!Array.isArray(userOrgs)) return false;
        return _.some(payload, orgId => {
            if (_.find(userOrgs, userOrg => _.get(userOrg, 'organisationId') === orgId)) {
                return true;
            }

            return false;
        });
    }
}