const _ = require('lodash');

const { learnerUpstream } = require("./upstream_axios");
const { envVariables } = require('./envHelpers')

/**
 * @description fetch user details by it's id
 * @param {*} { userId, headers = {} }
 * @return {*} 
 */
const userRead = ({ userId, headers = {} }) => {
    const config = {
        method: 'get',
        url: `/user/v5/read/${userId}?withTokens=true`,
        headers
    };

    return learnerUpstream(config);
}
/**
 *
 * @description checks if the user has REPORT_ADMIN role or not
 * @param {*} user
 * @return {*} 
 */
const isUserAdmin = (user) => {
    const userRoles = _.get(user, 'roles') || [];
    const userRolesSet = _.map(userRoles, 'role');
    return _.includes(userRolesSet, 'REPORT_ADMIN','PROGRAM_MANAGER','PROGRAM_DESIGNER')
};


/**
 * @description checks if the user is super admin or not
 * @param {*} user
 * @return {*} 
 */
const isUserSuperAdmin = (user) => {
    const isAdmin = isUserAdmin(user);
    if (!isAdmin) return false;
    return _.get(user, 'rootOrg.slug') === envVariables.SUNBIRD_SUPER_ADMIN_SLUG;
}

module.exports = { userRead, isUserAdmin, isUserSuperAdmin };