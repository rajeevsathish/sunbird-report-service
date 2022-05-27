const _ = require('lodash');

module.exports = {
    ruleName: 'role',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userRoles = _.get(user, 'roles');
        if (!userRoles) return false;
        if (!Array.isArray(userRoles)) return false;
        const userRolesSet = _.map(userRoles, 'role');
        return _.some(payload, role => {
            role = _.toLower(role);
            if (_.find(userRolesSet, userRole => _.toLower(userRole) === role)) {
                return true;
            }

            return false;
        });
    }
}