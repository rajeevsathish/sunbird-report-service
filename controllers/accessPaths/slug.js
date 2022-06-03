const _ = require('lodash');

/**
 * @description accesspath rule definition of user's slug value
 * 
 */

module.exports = {
    ruleName: 'slug',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userSlug = _.get(user, 'rootOrg.slug');
        if (!userSlug) return false;
        return _.some(payload, slug => slug === userSlug);
    }
}