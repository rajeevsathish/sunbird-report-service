const { learnerUpstream } = require("./upstream_axios");
const _ = require('lodash');

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
    const userRoles = _.uniq(_.flatMap(_.map(user.organisations, org => org.roles)));
    return _.includes(userRoles, 'REPORT_ADMIN')
};


/**
 * @description checks if the user is super admin or not
 * @param {*} user
 * @return {*} 
 */
const isUserSuperAdmin = (user) => {
    const isAdmin = isUserAdmin(user);
    if (!isAdmin) return false;
    return _.get(user, 'rootOrg.slug') === envHelper.sunbird_super_admin_slug;
}

module.exports = { userRead, isUserAdmin, isUserSuperAdmin };