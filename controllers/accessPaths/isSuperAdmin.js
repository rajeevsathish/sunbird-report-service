const _ = require('lodash');
const { envVariables } = require('../../helpers/envHelpers');

/**
 * @description accesspath rule definition whether user is superadmin or not
 * 
 */


module.exports = {
    ruleName: 'isSuperAdmin',
    isMatch(user, payload) {
        //payload is boolean
        const userRoles = _.get(user, 'roles');
        if (!userRoles) return false;
        if (!Array.isArray(userRoles)) return false;
        const userRolesSet = _.map(userRoles, 'role');

        // check if the user is superadmin or not
        let isSuperAdmin = false;
        if (_.find(userRolesSet, role => _.toLower(role) === 'report_admin')) {
            const userSlug = _.get(user, 'slug');
            if (userSlug === envVariables.SUNBIRD_SUPER_ADMIN_SLUG) {
                isSuperAdmin = true
            }
        }

        return isSuperAdmin === payload;
    }
}